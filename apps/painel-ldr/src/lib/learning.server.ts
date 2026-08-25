import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { resolveClient } from "@/lib/client-portal.server";

function fail(message: string): never { throw new Error(message); }

async function requireClient(userId: string, email: string | null) {
  const ctx = await resolveClient(userId, email);
  if (ctx.status !== "ok") fail("Acesso negado.");
  return ctx.customer;
}

async function requireProfessional(userId: string) {
  const { data } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", userId).maybeSingle();
  if (!data) fail("Acesso profissional não autorizado.");
  return data.role as string;
}

export async function getClientLearningHub(userId: string, email: string | null) {
  const customer = await requireClient(userId, email);
  const [{ data: enrollments }, { data: comments }, { data: progress }] = await Promise.all([
    supabaseAdmin.from("training_enrollments").select("training_id, active, training_programs(id,slug,title,description,status)").eq("customer_id", customer.id).eq("active", true),
    supabaseAdmin.from("library_comments").select("id,product_key,training_id,parent_id,author_kind,author_label,body,status,created_at").eq("customer_id", customer.id).order("created_at", { ascending: true }),
    supabaseAdmin.from("library_progress").select("product_key,progress_percent,current_location,updated_at").eq("customer_id", customer.id),
  ]);

  const trainingIds = (enrollments ?? []).map((e: any) => e.training_id);
  let modules: any[] = [], materials: any[] = [], sessions: any[] = [], announcements: any[] = [];
  if (trainingIds.length) {
    const result = await Promise.all([
      supabaseAdmin.from("training_modules").select("id,training_id,title,description,position,published").in("training_id", trainingIds).eq("published", true).order("position"),
      supabaseAdmin.from("training_materials").select("id,training_id,module_id,title,description,material_type,url,body,position,published").in("training_id", trainingIds).eq("published", true).order("position"),
      supabaseAdmin.from("training_live_sessions").select("id,training_id,title,description,starts_at,ends_at,meeting_url,published").in("training_id", trainingIds).eq("published", true).order("starts_at"),
      supabaseAdmin.from("training_announcements").select("id,training_id,title,body,created_at,published").in("training_id", trainingIds).eq("published", true).order("created_at", { ascending: false }),
    ]);
    modules = result[0].data ?? []; materials = result[1].data ?? []; sessions = result[2].data ?? []; announcements = result[3].data ?? [];
  }

  return { customer, trainings: enrollments ?? [], modules, materials, sessions, announcements, comments: comments ?? [], progress: progress ?? [] };
}

export async function addClientLibraryComment(userId: string, email: string | null, input: { body: string; productKey?: string | null; trainingId?: string | null; parentId?: string | null }) {
  const customer = await requireClient(userId, email);
  const body = input.body.trim();
  if (!body || body.length > 4000) fail("Comentário inválido.");
  if (!input.productKey && !input.trainingId) fail("Conteúdo não identificado.");
  if (input.trainingId) {
    const { data: enrollment } = await supabaseAdmin.from("training_enrollments").select("id").eq("training_id", input.trainingId).eq("customer_id", customer.id).eq("active", true).maybeSingle();
    if (!enrollment) fail("Você não possui acesso a este treinamento.");
  }
  const { error } = await supabaseAdmin.from("library_comments").insert({ customer_id: customer.id, product_key: input.productKey ?? null, training_id: input.trainingId ?? null, parent_id: input.parentId ?? null, author_user_id: userId, author_kind: "client", author_label: customer.fullName, body, status: "open" });
  if (error) fail("Não foi possível publicar o comentário.");
  return { ok: true as const };
}

export async function saveClientProgress(userId: string, email: string | null, input: { productKey: string; progressPercent: number; currentLocation?: string | null }) {
  const customer = await requireClient(userId, email);
  const pct = Math.max(0, Math.min(100, Math.round(input.progressPercent)));
  const { error } = await supabaseAdmin.from("library_progress").upsert({ customer_id: customer.id, product_key: input.productKey, progress_percent: pct, current_location: input.currentLocation ?? null, updated_at: new Date().toISOString() }, { onConflict: "customer_id,product_key" });
  if (error) fail("Não foi possível salvar seu progresso.");
  return { ok: true as const };
}

export async function getProfessionalLearningHub(userId: string) {
  await requireProfessional(userId);
  const [trainings, modules, materials, sessions, announcements, comments, enrollments] = await Promise.all([
    supabaseAdmin.from("training_programs").select("*").order("created_at", { ascending: false }),
    supabaseAdmin.from("training_modules").select("*").order("position"),
    supabaseAdmin.from("training_materials").select("*").order("position"),
    supabaseAdmin.from("training_live_sessions").select("*").order("starts_at"),
    supabaseAdmin.from("training_announcements").select("*").order("created_at", { ascending: false }),
    supabaseAdmin.from("library_comments").select("id,customer_id,product_key,training_id,parent_id,author_kind,author_label,body,status,created_at,customers(full_name,email)").order("created_at", { ascending: false }),
    supabaseAdmin.from("training_enrollments").select("id,training_id,customer_id,active,enrolled_at,customers(full_name,email)").order("enrolled_at", { ascending: false }),
  ]);
  return { trainings: trainings.data ?? [], modules: modules.data ?? [], materials: materials.data ?? [], sessions: sessions.data ?? [], announcements: announcements.data ?? [], comments: comments.data ?? [], enrollments: enrollments.data ?? [] };
}

export async function professionalReplyComment(userId: string, input: { commentId: string; body: string }) {
  await requireProfessional(userId);
  const body = input.body.trim();
  if (!body || body.length > 4000) fail("Resposta inválida.");
  const { data: parent } = await supabaseAdmin.from("library_comments").select("customer_id,product_key,training_id").eq("id", input.commentId).maybeSingle();
  if (!parent) fail("Comentário não encontrado.");
  const { data: profile } = await supabaseAdmin.from("profiles").select("full_name,email").eq("id", userId).maybeSingle();
  const { error } = await supabaseAdmin.from("library_comments").insert({ customer_id: parent.customer_id, product_key: parent.product_key, training_id: parent.training_id, parent_id: input.commentId, author_user_id: userId, author_kind: "professional", author_label: profile?.full_name ?? profile?.email ?? "Equipe LDR Essence", body, status: "answered" });
  if (error) fail("Não foi possível responder.");
  await supabaseAdmin.from("library_comments").update({ status: "answered", updated_at: new Date().toISOString() }).eq("id", input.commentId);
  return { ok: true as const };
}

export async function professionalCreateTraining(userId: string, input: { title: string; description?: string | null; slug: string }) {
  await requireProfessional(userId);
  const { data, error } = await supabaseAdmin.from("training_programs").insert({ title: input.title.trim(), description: input.description?.trim() || null, slug: input.slug.trim(), created_by: userId }).select("*").single();
  if (error) fail("Não foi possível criar o treinamento.");
  return data;
}

export async function professionalAddTrainingItem(userId: string, input: { kind: "module" | "material" | "live" | "announcement"; trainingId: string; title: string; description?: string | null; moduleId?: string | null; materialType?: "link" | "pdf" | "video" | "text" | "file"; url?: string | null; body?: string | null; startsAt?: string | null; endsAt?: string | null; meetingUrl?: string | null }) {
  await requireProfessional(userId);
  const common = { training_id: input.trainingId, title: input.title.trim(), description: input.description?.trim() || null };
  let error: any = null;
  if (input.kind === "module") ({ error } = await supabaseAdmin.from("training_modules").insert({ ...common, published: true }));
  if (input.kind === "material") ({ error } = await supabaseAdmin.from("training_materials").insert({ ...common, module_id: input.moduleId ?? null, material_type: input.materialType ?? "link", url: input.url ?? null, body: input.body ?? null, published: true }));
  if (input.kind === "live") {
    if (!input.startsAt) fail("Informe a data do encontro.");
    ({ error } = await supabaseAdmin.from("training_live_sessions").insert({ ...common, starts_at: input.startsAt, ends_at: input.endsAt ?? null, meeting_url: input.meetingUrl ?? null, published: true }));
  }
  if (input.kind === "announcement") ({ error } = await supabaseAdmin.from("training_announcements").insert({ training_id: input.trainingId, title: input.title.trim(), body: input.body?.trim() || input.description?.trim() || "", published: true }));
  if (error) fail("Não foi possível publicar o conteúdo.");
  return { ok: true as const };
}

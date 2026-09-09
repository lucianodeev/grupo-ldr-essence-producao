import { getRequest } from "@tanstack/react-start/server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { resolveClient } from "@/lib/client-portal.server";
import { hasOwnerDigitalAccess } from "@/lib/owner-digital-access.server";

const PRODUCT_KEY = "do_mamao_ao_negocio";
const TRAINING_SLUG = "do-mamao-ao-negocio";
const TRAINING_TITLE = "Do Mamão ao Negócio — Treinamento de Empreendedorismo";
const PROJECT_REVIEW_KEY = "do_mamao_project_review";
const PROJECT_REVIEW_TITLE = "Nova Avaliação de Projeto — Do Mamão ao Negócio";
const PRICE_BRL = 59_999;
const PRICE_EUR = 10_056;
const LAUNCH_PRICE_BRL = 29_999;
const LAUNCH_PRICE_EUR = 4_990;
const LAUNCH_LIMIT = 100;
const DEFAULT_MINIMUM_DAYS = 90;
const DEFAULT_LIVE_SESSIONS = 6;
const DEFAULT_PROJECTS_INCLUDED = 1;
const DEFAULT_PROJECT_REVIEW_BRL = 17_990;
const DEFAULT_PROJECT_REVIEW_EUR = 2_990;

type Market = "BR" | "INTL";
type StateRecord = Record<string, unknown>;

function fail(message: string): never { throw new Error(message); }
const db = supabaseAdmin as any;

async function customerFor(userId: string, email: string | null) {
  const ctx = await resolveClient(userId, email);
  if (ctx.status !== "ok") fail("Acesso do cliente não disponível.");
  return ctx.customer;
}

function productMatches(order: any) {
  const metadata = (order?.metadata ?? {}) as Record<string, unknown>;
  const key = typeof metadata.product_key === "string" ? metadata.product_key : "";
  return order?.catalog_key === PRODUCT_KEY || key === PRODUCT_KEY || key === TRAINING_SLUG;
}

function projectReviewMatches(order: any) {
  const metadata = (order?.metadata ?? {}) as Record<string, unknown>;
  const key = typeof metadata.product_key === "string" ? metadata.product_key : "";
  return order?.catalog_key === PROJECT_REVIEW_KEY || key === PROJECT_REVIEW_KEY;
}

async function launchStatus() {
  const { data, error } = await db.from("orders").select("id,catalog_key,metadata,payment_status").eq("payment_status", "pago");
  if (error) return { paidStudents: 0, remaining: LAUNCH_LIMIT, active: true };
  const paidStudents = (data ?? []).filter(productMatches).length;
  return { paidStudents, remaining: Math.max(0, LAUNCH_LIMIT - paidStudents), active: paidStudents < LAUNCH_LIMIT };
}

async function paidOrder(customerId: string) {
  const { data, error } = await db.from("orders").select("id,catalog_key,payment_status,amount_cents,currency,stripe_checkout_session_id,metadata,created_at").eq("customer_id", customerId).eq("payment_status", "pago").order("created_at", { ascending: false });
  if (error) fail("Não foi possível verificar a compra do treinamento.");
  return (data ?? []).find(productMatches) ?? null;
}

async function trainingRow() {
  const { data, error } = await db.from("training_programs").select("id,slug,title,description,status,minimum_days,live_sessions_included,projects_included,lifetime_access,extra_project_review_brl_minor,extra_project_review_eur_minor").eq("slug", TRAINING_SLUG).maybeSingle();
  if (error || !data || data.status !== "published") fail("Treinamento indisponível.");
  return data;
}

async function enrollment(customerId: string, trainingId: string) {
  const { data, error } = await db.from("training_enrollments").select("id,training_id,customer_id,active,enrolled_at,cohort_id,progress_percent,completed_at,certificate_available_at,training_cohorts(cohort_number,capacity,status)").eq("training_id", trainingId).eq("customer_id", customerId).eq("active", true).maybeSingle();
  if (error) fail("Não foi possível verificar sua matrícula.");
  return data ?? null;
}

async function ensureOwnerEnrollment(customerId: string, trainingId: string, email: string | null, userId: string) {
  if (!hasOwnerDigitalAccess(email, userId)) return null;
  const { error } = await db.from("training_enrollments").upsert({ training_id: trainingId, customer_id: customerId, active: true }, { onConflict: "training_id,customer_id" });
  if (error) fail("Não foi possível liberar o acesso administrativo ao treinamento.");
  return enrollment(customerId, trainingId);
}

async function provisionFromPaidOrder(customerId: string, order: any) {
  const metadata = (order.metadata ?? {}) as Record<string, unknown>;
  const { error } = await db.rpc("assign_do_mamao_training_enrollment", {
    _customer_id: customerId,
    _checkout_session_id: order.stripe_checkout_session_id ?? null,
    _payment_intent_id: typeof metadata.stripe_payment_intent_id === "string" ? metadata.stripe_payment_intent_id : null,
    _price_id: typeof metadata.stripe_price_id === "string" ? metadata.stripe_price_id : null,
    _currency: order.currency ?? null,
    _amount_minor: order.amount_cents ?? null,
  });
  if (error) fail("Pagamento confirmado, mas não foi possível concluir sua matrícula automaticamente.");
}

async function syncPaidProjectReviewCredits(customerId: string, trainingId: string) {
  const { data: orders, error } = await db.from("orders").select("id,catalog_key,payment_status,amount_cents,currency,stripe_checkout_session_id,metadata,created_at").eq("customer_id", customerId).eq("payment_status", "pago").order("created_at", { ascending: true });
  if (error) return;
  for (const order of (orders ?? []).filter(projectReviewMatches)) {
    const { data: existing } = await db.from("training_project_review_credits").select("id").eq("order_id", order.id).maybeSingle();
    if (existing) continue;
    await db.from("training_project_review_credits").insert({ training_id: trainingId, customer_id: customerId, source: "paid", status: "available", order_id: order.id, amount_minor: order.amount_cents ?? null, currency: order.currency ?? null, stripe_checkout_session_id: order.stripe_checkout_session_id ?? null });
  }
}

export async function getDoMamaoTrainingOffer(userId: string, email: string | null) {
  const customer = await customerFor(userId, email);
  const training = await trainingRow();
  const launch = await launchStatus();
  let currentEnrollment = await enrollment(customer.id, training.id);
  const order = await paidOrder(customer.id);
  if (!currentEnrollment && order) { await provisionFromPaidOrder(customer.id, order); currentEnrollment = await enrollment(customer.id, training.id); }
  if (!currentEnrollment) currentEnrollment = await ensureOwnerEnrollment(customer.id, training.id, email, userId);
  return {
    productKey: PRODUCT_KEY,
    title: training.title || TRAINING_TITLE,
    description: training.description || "Treinamento empreendedor de 3 meses e 300 horas com jornada guiada, atividades, projeto e encontros ao vivo opcionais.",
    priceBrlCents: launch.active ? LAUNCH_PRICE_BRL : PRICE_BRL,
    priceEurCents: launch.active ? LAUNCH_PRICE_EUR : PRICE_EUR,
    regularPriceBrlCents: PRICE_BRL,
    regularPriceEurCents: PRICE_EUR,
    launchPromotionActive: launch.active,
    launchRemaining: launch.remaining,
    launchLimit: LAUNCH_LIMIT,
    entitled: Boolean(currentEnrollment),
    progressPercent: Number(currentEnrollment?.progress_percent ?? 0),
    cohortNumber: currentEnrollment?.training_cohorts?.cohort_number ?? null,
    minimumDays: Number(training.minimum_days ?? DEFAULT_MINIMUM_DAYS),
    lifetimeAccess: training.lifetime_access !== false,
    liveSessionsIncluded: Number(training.live_sessions_included ?? DEFAULT_LIVE_SESSIONS),
    projectsIncluded: Number(training.projects_included ?? DEFAULT_PROJECTS_INCLUDED),
  };
}

function appOrigin() {
  const request = getRequest();
  const requestUrl = request ? new URL(request.url) : null;
  return process.env.CLIENT_PANEL_URL?.replace(/\/$/, "") || requestUrl?.origin || "https://painel.ldrrhestrategia.com";
}

export async function createDoMamaoTrainingCheckout(userId: string, email: string | null, market: Market) {
  const customer = await customerFor(userId, email);
  const offer = await getDoMamaoTrainingOffer(userId, email);
  if (offer.entitled) fail("Este treinamento já está disponível para sua conta.");
  const amountCents = market === "BR" ? offer.priceBrlCents : offer.priceEurCents;
  const currency = market === "BR" ? "BRL" : "EUR";
  const promo = offer.launchPromotionActive;
  const metadata = { product_key: PRODUCT_KEY, training_slug: TRAINING_SLUG, market, auth_user_id: userId, launch_promotion: promo, launch_limit: LAUNCH_LIMIT, launch_remaining_at_checkout: offer.launchRemaining };
  const { data: order, error: orderError } = await db.from("orders").insert({
    order_number: "", customer_id: customer.id, contact_email: customer.email, contact_phone: customer.phone,
    service_type: "produto_digital", title: TRAINING_TITLE,
    description: promo ? "Oferta de lançamento — treinamento de 3 meses / 300 horas com acesso vitalício" : "Treinamento de 3 meses / 300 horas com acesso vitalício ao conteúdo",
    quantity: 1, amount_cents: amountCents, currency, payment_status: "pendente", status: "novo", priority: "media", catalog_key: PRODUCT_KEY, metadata,
  }).select("id,order_number").single();
  if (orderError || !order) fail("Não foi possível iniciar o pedido do treinamento.");

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) { await db.from("orders").delete().eq("id", order.id); fail("Pagamento temporariamente indisponível."); }
  const params = new URLSearchParams();
  params.set("mode", "payment");
  params.set("line_items[0][price_data][currency]", currency.toLowerCase());
  params.set("line_items[0][price_data][unit_amount]", String(amountCents));
  params.set("line_items[0][price_data][product_data][name]", promo ? `${TRAINING_TITLE} — Oferta de Lançamento` : TRAINING_TITLE);
  params.set("line_items[0][quantity]", "1");
  params.set("success_url", `${appOrigin()}/cliente/biblioteca?payment=success&product=training&session_id={CHECKOUT_SESSION_ID}`);
  params.set("cancel_url", `${appOrigin()}/cliente/biblioteca?payment=cancel&product=training`);
  params.set("client_reference_id", userId);
  params.set("metadata[order_id]", order.id);
  params.set("metadata[product_key]", PRODUCT_KEY);
  params.set("metadata[training_slug]", TRAINING_SLUG);
  params.set("metadata[user_id]", userId);
  params.set("metadata[market]", market);
  params.set("metadata[launch_promotion]", String(promo));
  params.set("payment_intent_data[metadata][order_id]", order.id);
  params.set("payment_intent_data[metadata][product_key]", PRODUCT_KEY);
  params.set("payment_intent_data[metadata][launch_promotion]", String(promo));
  if (customer.email) params.set("customer_email", customer.email);
  let response: Response;
  try { response = await fetch("https://api.stripe.com/v1/checkout/sessions", { method: "POST", headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/x-www-form-urlencoded" }, body: params }); }
  catch { await db.from("orders").delete().eq("id", order.id); fail("Não foi possível abrir o checkout."); }
  const session = (await response.json()) as { id?: string; url?: string; error?: { message?: string } };
  if (!response.ok || !session.id || !session.url) { await db.from("orders").delete().eq("id", order.id); fail("Não foi possível abrir o checkout."); }
  await db.from("orders").update({ stripe_checkout_session_id: session.id, metadata }).eq("id", order.id);
  return { url: session.url };
}

export async function createDoMamaoProjectReviewCheckout(userId: string, email: string | null, market: Market) {
  const customer = await customerFor(userId, email);
  const training = await trainingRow();
  const currentEnrollment = await enrollment(customer.id, training.id);
  if (!currentEnrollment) fail("A avaliação extra está disponível apenas para alunos do treinamento.");
  const amountCents = market === "BR" ? Number(training.extra_project_review_brl_minor ?? DEFAULT_PROJECT_REVIEW_BRL) : Number(training.extra_project_review_eur_minor ?? DEFAULT_PROJECT_REVIEW_EUR);
  const currency = market === "BR" ? "BRL" : "EUR";
  const { data: order, error: orderError } = await db.from("orders").insert({ order_number: "", customer_id: customer.id, contact_email: customer.email, contact_phone: customer.phone, service_type: "produto_digital", title: PROJECT_REVIEW_TITLE, description: "Crédito para uma nova entrega e avaliação individual de projeto", quantity: 1, amount_cents: amountCents, currency, payment_status: "pendente", status: "novo", priority: "media", catalog_key: PROJECT_REVIEW_KEY, metadata: { product_key: PROJECT_REVIEW_KEY, training_slug: TRAINING_SLUG, market, auth_user_id: userId } }).select("id").single();
  if (orderError || !order) fail("Não foi possível iniciar a compra da nova avaliação.");
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) { await db.from("orders").delete().eq("id", order.id); fail("Pagamento temporariamente indisponível."); }
  const params = new URLSearchParams();
  params.set("mode", "payment"); params.set("line_items[0][price_data][currency]", currency.toLowerCase()); params.set("line_items[0][price_data][unit_amount]", String(amountCents)); params.set("line_items[0][price_data][product_data][name]", PROJECT_REVIEW_TITLE); params.set("line_items[0][quantity]", "1");
  params.set("success_url", `${appOrigin()}/cliente/treinamentos/do-mamao-ao-negocio?project_review=success&session_id={CHECKOUT_SESSION_ID}`); params.set("cancel_url", `${appOrigin()}/cliente/treinamentos/do-mamao-ao-negocio?project_review=cancel`); params.set("client_reference_id", userId); params.set("metadata[order_id]", order.id); params.set("metadata[product_key]", PROJECT_REVIEW_KEY); params.set("metadata[training_slug]", TRAINING_SLUG); params.set("metadata[user_id]", userId); params.set("metadata[market]", market); params.set("payment_intent_data[metadata][order_id]", order.id); params.set("payment_intent_data[metadata][product_key]", PROJECT_REVIEW_KEY); if (customer.email) params.set("customer_email", customer.email);
  let response: Response;
  try { response = await fetch("https://api.stripe.com/v1/checkout/sessions", { method: "POST", headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/x-www-form-urlencoded" }, body: params }); } catch { await db.from("orders").delete().eq("id", order.id); fail("Não foi possível abrir o checkout."); }
  const session = (await response.json()) as { id?: string; url?: string };
  if (!response.ok || !session.id || !session.url) { await db.from("orders").delete().eq("id", order.id); fail("Não foi possível abrir o checkout."); }
  await db.from("orders").update({ stripe_checkout_session_id: session.id }).eq("id", order.id);
  return { url: session.url };
}

export async function getDoMamaoTrainingExperience(userId: string, email: string | null) {
  const customer = await customerFor(userId, email);
  const training = await trainingRow();
  let currentEnrollment = await enrollment(customer.id, training.id);
  if (!currentEnrollment) { const order = await paidOrder(customer.id); if (order) { await provisionFromPaidOrder(customer.id, order); currentEnrollment = await enrollment(customer.id, training.id); } }
  if (!currentEnrollment) currentEnrollment = await ensureOwnerEnrollment(customer.id, training.id, email, userId);
  if (!currentEnrollment) fail("Compre o treinamento para liberar este conteúdo.");
  await syncPaidProjectReviewCredits(customer.id, training.id);
  const [{ data: cloud }, { data: credits }, { data: submissions }] = await Promise.all([
    db.from("training_state").select("state,progress_percent,current_panel,started_at,completed_at,certificate_available_at").eq("training_id", training.id).eq("customer_id", customer.id).maybeSingle(),
    db.from("training_project_review_credits").select("id,source,status,amount_minor,currency,created_at,used_at").eq("training_id", training.id).eq("customer_id", customer.id).order("created_at", { ascending: true }),
    db.from("training_project_submissions").select("id,submission_number,title,project_url,status,submitted_at,reviewed_at,feedback").eq("training_id", training.id).eq("customer_id", customer.id).order("submission_number", { ascending: true }),
  ]);
  const minimumDays = Number(training.minimum_days ?? DEFAULT_MINIMUM_DAYS);
  const eligibleAt = new Date(new Date(currentEnrollment.enrolled_at).getTime() + minimumDays * 86400000).toISOString();
  const availableProjectCredits = (credits ?? []).filter((x: any) => x.status === "available").length;
  return {
    html: "",
    trainingId: training.id,
    title: training.title,
    studentName: customer.fullName,
    studentEmail: customer.email,
    progressPercent: Number(cloud?.progress_percent ?? currentEnrollment.progress_percent ?? 0),
    cohortNumber: currentEnrollment.training_cohorts?.cohort_number ?? null,
    enrolledAt: currentEnrollment.enrolled_at,
    completedAt: cloud?.completed_at ?? currentEnrollment.completed_at ?? null,
    certificateAvailableAt: cloud?.certificate_available_at ?? currentEnrollment.certificate_available_at ?? null,
    minimumDays,
    lifetimeAccess: training.lifetime_access !== false,
    liveSessionsIncluded: Number(training.live_sessions_included ?? DEFAULT_LIVE_SESSIONS),
    projectsIncluded: Number(training.projects_included ?? DEFAULT_PROJECTS_INCLUDED),
    officialCompletionEligibleAt: eligibleAt,
    projectSubmissionEligible: Date.now() >= new Date(eligibleAt).getTime(),
    availableProjectCredits,
    projectSubmissions: submissions ?? [],
    extraProjectReviewBrlCents: Number(training.extra_project_review_brl_minor ?? DEFAULT_PROJECT_REVIEW_BRL),
    extraProjectReviewEurCents: Number(training.extra_project_review_eur_minor ?? DEFAULT_PROJECT_REVIEW_EUR),
  };
}

export async function submitDoMamaoProject(userId: string, email: string | null, input: { title: string; projectUrl?: string | null; projectText?: string | null }) {
  const customer = await customerFor(userId, email); const training = await trainingRow(); const currentEnrollment = await enrollment(customer.id, training.id); if (!currentEnrollment) fail("Matrícula não encontrada.");
  const eligibleAt = new Date(new Date(currentEnrollment.enrolled_at).getTime() + Number(training.minimum_days ?? DEFAULT_MINIMUM_DAYS) * 86400000); if (Date.now() < eligibleAt.getTime()) fail("A entrega oficial do projeto é liberada ao concluir os 3 meses da formação.");
  await syncPaidProjectReviewCredits(customer.id, training.id);
  const { data: credit } = await db.from("training_project_review_credits").select("id").eq("training_id", training.id).eq("customer_id", customer.id).eq("status", "available").order("created_at", { ascending: true }).limit(1).maybeSingle(); if (!credit) fail("Você não possui crédito disponível para uma nova avaliação de projeto.");
  const { count } = await db.from("training_project_submissions").select("id", { count: "exact", head: true }).eq("enrollment_id", currentEnrollment.id); const submissionNumber = Number(count ?? 0) + 1; const title = input.title.trim(); const projectUrl = input.projectUrl?.trim() || null; const projectText = input.projectText?.trim() || null;
  if (!title) fail("Informe o nome do projeto."); if (!projectUrl && !projectText) fail("Envie um link ou descreva o projeto para avaliação.");
  const { data: submission, error } = await db.from("training_project_submissions").insert({ training_id: training.id, enrollment_id: currentEnrollment.id, customer_id: customer.id, review_credit_id: credit.id, submission_number: submissionNumber, title, project_url: projectUrl, project_text: projectText, status: "submitted" }).select("id,submission_number,status,submitted_at").single();
  if (error || !submission) fail("Não foi possível enviar o projeto."); await db.from("training_project_review_credits").update({ status: "used", used_at: new Date().toISOString() }).eq("id", credit.id); return { ok: true as const, submission };
}

function completeDailyLessons(state: StateRecord) {
  const activities = (state.dailyActivities && typeof state.dailyActivities === "object" ? state.dailyActivities : {}) as Record<string, any>;
  let complete = 0;
  for (let day = 1; day <= 90; day++) {
    const value = activities[String(day)] ?? activities[`day_${day}`];
    if (!value || typeof value !== "object") continue;
    const objective = value.objectiveAnswers && typeof value.objectiveAnswers === "object" ? value.objectiveAnswers : {};
    const written = value.writtenAnswers && typeof value.writtenAnswers === "object" ? value.writtenAnswers : {};
    const quiz = value.quizAnswers && typeof value.quizAnswers === "object" ? value.quizAnswers : {};
    const objectiveOk = Object.values(objective).filter((x) => typeof x === "string" && x.trim()).length >= 7;
    const writtenOk = Object.values(written).filter((x) => typeof x === "string" && x.trim().length >= 20).length >= 3;
    const quizOk = Object.values(quiz).filter((x) => typeof x === "number").length >= 3;
    if (objectiveOk && writtenOk && quizOk) complete++;
  }
  return complete;
}

function countTrainingProgress(state: StateRecord) {
  const dailyCount = completeDailyLessons(state);
  if (state.dailyActivities && typeof state.dailyActivities === "object") return Math.max(0, Math.min(100, Math.round((dailyCount / 90) * 100)));
  const guided = (state.guidedAnswers && typeof state.guidedAnswers === "object" ? state.guidedAnswers : {}) as Record<string, unknown>;
  const guidedCount = Object.values(guided).filter((value) => typeof value === "string" && value.trim().length > 0).length;
  if (guidedCount > 0) return Math.max(0, Math.min(100, Math.round((Math.min(9, guidedCount) / 9) * 100)));
  const answers = (state.answers && typeof state.answers === "object" ? state.answers : {}) as Record<string, unknown>;
  const quiz = (state.quiz && typeof state.quiz === "object" ? state.quiz : {}) as Record<string, unknown>;
  const reflections = (state.reflections && typeof state.reflections === "object" ? state.reflections : {}) as Record<string, unknown>;
  let written = 0; for (const value of Object.values(reflections)) if (typeof value === "string" && value.trim().length >= 40) written++;
  const done = Math.min(60, Object.keys(answers).length) + Math.min(36, Object.keys(quiz).length) + Math.min(30, written);
  return Math.max(0, Math.min(100, Math.round((done / 126) * 100)));
}

export async function saveDoMamaoTrainingState(userId: string, email: string | null, state: StateRecord) {
  const customer = await customerFor(userId, email); const training = await trainingRow(); let currentEnrollment = await enrollment(customer.id, training.id); if (!currentEnrollment) currentEnrollment = await ensureOwnerEnrollment(customer.id, training.id, email, userId); if (!currentEnrollment) fail("Matrícula não encontrada.");
  const serialized = JSON.stringify(state ?? {}); if (serialized.length > 700_000) fail("Dados do treinamento excederam o limite de sincronização.");
  const progress = countTrainingProgress(state ?? {}); const started = new Date(currentEnrollment.enrolled_at).getTime(); const eligibleDay = started + Number(training.minimum_days ?? DEFAULT_MINIMUM_DAYS) * 86400000;
  let completedAt = currentEnrollment.completed_at as string | null; let certificateAvailableAt = currentEnrollment.certificate_available_at as string | null;
  if (!completedAt && progress >= 100 && Date.now() >= eligibleDay) { completedAt = new Date().toISOString(); certificateAvailableAt = new Date(Date.now() + 15 * 86400000).toISOString(); }
  const currentPanel = typeof state.lastPanel === "string" ? state.lastPanel.slice(0, 80) : "inicio";
  const { error } = await db.from("training_state").upsert({ training_id: training.id, customer_id: customer.id, state, progress_percent: progress, current_panel: currentPanel, completed_at: completedAt, certificate_available_at: certificateAvailableAt, updated_at: new Date().toISOString() }, { onConflict: "training_id,customer_id" }); if (error) fail("Não foi possível sincronizar seu progresso.");
  await db.from("training_enrollments").update({ progress_percent: progress, completed_at: completedAt, certificate_available_at: certificateAvailableAt }).eq("id", currentEnrollment.id);
  await db.from("library_progress").upsert({ customer_id: customer.id, product_key: TRAINING_SLUG, progress_percent: progress, current_location: currentPanel, updated_at: new Date().toISOString() }, { onConflict: "customer_id,product_key" });
  return { ok: true as const, progressPercent: progress, completedAt, certificateAvailableAt, completedDailyLessons: completeDailyLessons(state) };
}

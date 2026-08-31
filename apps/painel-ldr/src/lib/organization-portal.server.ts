import { getRequest } from "@tanstack/react-start/server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const db = supabaseAdmin as unknown as { from: (table: string) => any };

function fail(message: string): never { throw new Error(message); }
function emailNorm(value: string | null | undefined) { return value?.trim().toLowerCase() ?? null; }

async function audit(actorId: string, actorEmail: string | null, action: string, target?: string | null, details?: Record<string, unknown>) {
  await db.from("audit_logs").insert({ actor_id: actorId, actor_email: actorEmail, action, target: target ?? null, details: details ?? {} });
}

export async function getOrganizationContext(userId: string, email: string | null) {
  const { data: org, error } = await db.from("organizations")
    .select("id,name,billing_email,country,phone,tax_id,active,created_at")
    .eq("owner_auth_user_id", userId).maybeSingle();
  if (error) fail("Não foi possível carregar a empresa.");
  return { organization: org ?? null, email: emailNorm(email) };
}

export async function createOrganization(userId: string, email: string | null, input: { name: string; country?: string | null; phone?: string | null; taxId?: string | null }) {
  const mail = emailNorm(email);
  if (!mail) fail("Sua conta precisa ter um e-mail válido.");
  const name = input.name.trim();
  if (name.length < 2) fail("Informe o nome da empresa.");
  const existing = await getOrganizationContext(userId, mail);
  if (existing.organization) return { ok: true as const, organizationId: existing.organization.id };
  const { data, error } = await db.from("organizations").insert({
    name, billing_email: mail, country: input.country?.trim() || null, phone: input.phone?.trim() || null,
    tax_id: input.taxId?.trim() || null, owner_auth_user_id: userId,
  }).select("id").single();
  if (error || !data) fail("Não foi possível criar a área da empresa.");
  await audit(userId, mail, "organization.created", data.id, { name });
  return { ok: true as const, organizationId: data.id };
}

async function requireOrganization(userId: string) {
  const { data } = await db.from("organizations").select("id,name,billing_email,country,phone,tax_id,active").eq("owner_auth_user_id", userId).eq("active", true).maybeSingle();
  if (!data) fail("Área da empresa não configurada.");
  return data;
}

export async function getOrganizationDashboard(userId: string) {
  const org = await requireOrganization(userId);
  const [{ data: members }, { data: services }, { data: purchases }, { data: benefits }] = await Promise.all([
    db.from("organization_members").select("id,full_name,email,phone,department,employee_code,portal_active,auth_user_id,birth_date,vacation_start,vacation_end,next_day_off,created_at").eq("organization_id", org.id).order("full_name"),
    db.from("organization_service_catalog").select("catalog_key,unit_label,min_quantity,max_quantity,active").eq("active", true),
    db.from("organization_purchases").select("id,order_id,catalog_key,quantity,status,created_at").eq("organization_id", org.id).order("created_at", { ascending: false }).limit(30),
    db.from("organization_benefit_allocations").select("id,member_id,catalog_key,credits_granted,credits_used,status,created_at,purchase_id,requested_at,used_at,scheduled_at,scheduled_note,schedule_status").eq("organization_id", org.id),
  ]);
  const keys = (services ?? []).map((s: any) => s.catalog_key);
  const { data: catalog } = keys.length ? await db.from("service_catalog").select("catalog_key,name,category,currency,amount_cents,package_sessions,active,sort_order").in("catalog_key", keys).eq("active", true) : { data: [] };
  const serviceByKey = new Map((catalog ?? []).map((x: any) => [x.catalog_key, x]));
  return {
    organization: org,
    members: members ?? [],
    purchases: purchases ?? [],
    benefits: benefits ?? [],
    services: (services ?? []).map((s: any) => ({ ...s, ...(serviceByKey.get(s.catalog_key) ?? {}) })).filter((s: any) => s.name).sort((a: any, b: any) => { const priority = (x: any) => String(x.catalog_key).startsWith("psicanalise") ? 0 : String(x.catalog_key).startsWith("massagem_laboral") ? 1 : 2; return priority(a) - priority(b) || Number(a.sort_order ?? 9999) - Number(b.sort_order ?? 9999) || String(a.name).localeCompare(String(b.name)); }),
  };
}

export async function addOrganizationMember(userId: string, email: string | null, input: { fullName: string; email: string; department?: string | null; employeeCode?: string | null }) {
  const org = await requireOrganization(userId);
  const fullName = input.fullName.trim();
  const memberEmail = emailNorm(input.email);
  if (fullName.length < 2 || !memberEmail?.includes("@")) fail("Informe nome e e-mail válidos.");
  const { data, error } = await db.from("organization_members").insert({
    organization_id: org.id, full_name: fullName, email: memberEmail,
    department: input.department?.trim() || null, employee_code: input.employeeCode?.trim() || null,
  }).select("id").single();
  if (error?.code === "23505") fail("Este funcionário já está cadastrado nesta empresa.");
  if (error || !data) fail("Não foi possível cadastrar o funcionário.");
  await audit(userId, emailNorm(email), "organization.member_added", data.id, { organization_id: org.id });
  return { ok: true as const, memberId: data.id };
}

export async function updateOrganizationMember(userId: string, email: string | null, memberId: string, input: { phone?: string | null; birthDate?: string | null; vacationStart?: string | null; vacationEnd?: string | null; nextDayOff?: string | null }) {
  const org = await requireOrganization(userId);
  const patch = {
    phone: input.phone?.trim() || null,
    birth_date: input.birthDate || null,
    vacation_start: input.vacationStart || null,
    vacation_end: input.vacationEnd || null,
    next_day_off: input.nextDayOff || null,
  };
  const { data, error } = await db.from("organization_members").update(patch).eq("id", memberId).eq("organization_id", org.id).select("id").maybeSingle();
  if (error || !data) fail("Funcionário não encontrado.");
  await audit(userId, emailNorm(email), "organization.member_profile_updated", memberId);
  return { ok:true as const };
}

export async function setOrganizationMemberActive(userId: string, email: string | null, memberId: string, active: boolean) {
  const org = await requireOrganization(userId);
  const { data, error } = await db.from("organization_members").update({ portal_active: active }).eq("id", memberId).eq("organization_id", org.id).select("id").maybeSingle();
  if (error || !data) fail("Funcionário não encontrado.");
  await audit(userId, emailNorm(email), active ? "organization.member_activated" : "organization.member_deactivated", memberId);
  return { ok: true as const };
}

export async function createOrganizationCheckout(userId: string, email: string | null, input: { catalogKey: string; memberIds: string[] }) {
  const org = await requireOrganization(userId);
  const uniqueIds = [...new Set(input.memberIds)].filter(Boolean);
  if (!uniqueIds.length) fail("Selecione pelo menos um funcionário.");
  const { data: allowed } = await db.from("organization_service_catalog").select("catalog_key,min_quantity,max_quantity,active").eq("catalog_key", input.catalogKey).eq("active", true).maybeSingle();
  if (!allowed) fail("Serviço não disponível para empresas.");
  if (uniqueIds.length < allowed.min_quantity || uniqueIds.length > allowed.max_quantity) fail(`Quantidade permitida: ${allowed.min_quantity} a ${allowed.max_quantity}.`);
  const { data: members } = await db.from("organization_members").select("id").eq("organization_id", org.id).eq("portal_active", true).in("id", uniqueIds);
  if ((members ?? []).length !== uniqueIds.length) fail("Há funcionários inválidos ou inativos na seleção.");
  const { data: service } = await db.from("service_catalog").select("catalog_key,name,currency,amount_cents,package_sessions").eq("catalog_key", input.catalogKey).eq("active", true).maybeSingle();
  if (!service) fail("Serviço indisponível.");
  const total = Number(service.amount_cents) * uniqueIds.length;
  const { data: order, error: orderError } = await db.from("orders").insert({
    order_number: "", organization_id: org.id, customer_id: null, contact_email: org.billing_email,
    service_type: "outros", title: `${service.name} — benefício corporativo`, description: `Contratação empresarial para ${uniqueIds.length} funcionário(s)`,
    quantity: uniqueIds.length, amount_cents: total, currency: service.currency, payment_status: "pendente", status: "novo", priority: "media",
    catalog_key: service.catalog_key, metadata: { organization_id: org.id, purchase_kind: "employee_benefit", quantity: uniqueIds.length },
  }).select("id,order_number").single();
  if (orderError || !order) fail("Não foi possível iniciar o pedido empresarial.");
  const cleanup = async () => { await db.from("orders").delete().eq("id", order.id); };
  const { data: purchase, error: purchaseError } = await db.from("organization_purchases").insert({ organization_id: org.id, order_id: order.id, catalog_key: service.catalog_key, quantity: uniqueIds.length }).select("id").single();
  if (purchaseError || !purchase) { await cleanup(); fail("Não foi possível preparar os benefícios."); }
  const { error: mapError } = await db.from("organization_purchase_members").insert(uniqueIds.map(memberId => ({ purchase_id: purchase.id, member_id: memberId })));
  if (mapError) { await cleanup(); fail("Não foi possível vincular os funcionários."); }
  const secret = process.env["STRIPE_SECRET_KEY"];
  if (!secret) { await cleanup(); fail("Checkout indisponível no momento."); }
  const request = getRequest();
  const origin = process.env["CLIENT_PANEL_URL"]?.replace(/\/$/, "") || (request ? new URL(request.url).origin : "https://painel.ldrrhestrategia.com");
  const params = new URLSearchParams();
  params.set("mode", "payment");
  params.set("line_items[0][price_data][currency]", String(service.currency).toLowerCase());
  params.set("line_items[0][price_data][unit_amount]", String(service.amount_cents));
  params.set("line_items[0][price_data][product_data][name]", service.name);
  params.set("line_items[0][quantity]", String(uniqueIds.length));
  params.set("success_url", `${origin}/empresa?payment=success&session_id={CHECKOUT_SESSION_ID}`);
  params.set("cancel_url", `${origin}/empresa?payment=cancel`);
  params.set("client_reference_id", userId);
  params.set("customer_email", org.billing_email);
  params.set("metadata[order_id]", order.id);
  params.set("metadata[organization_id]", org.id);
  params.set("metadata[purchase_id]", purchase.id);
  params.set("metadata[catalog_key]", service.catalog_key);
  params.set("payment_intent_data[metadata][order_id]", order.id);
  params.set("payment_intent_data[metadata][organization_id]", org.id);
  params.set("payment_intent_data[metadata][purchase_id]", purchase.id);
  let response: Response;
  try { response = await fetch("https://api.stripe.com/v1/checkout/sessions", { method: "POST", headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/x-www-form-urlencoded" }, body: params }); }
  catch { await cleanup(); fail("Não foi possível abrir o checkout."); }
  const session = await response.json() as { id?: string; url?: string; error?: { message?: string } };
  if (!response.ok || !session.id || !session.url) { await cleanup(); fail(session.error?.message || "Não foi possível abrir o checkout."); }
  await db.from("orders").update({ stripe_checkout_session_id: session.id }).eq("id", order.id);
  await audit(userId, emailNorm(email), "organization.checkout_created", order.id, { organization_id: org.id, purchase_id: purchase.id, quantity: uniqueIds.length });
  return { url: session.url, orderId: order.id };
}

export async function getEmployeeContext(userId: string, email: string | null) {
  const mail = emailNorm(email);
  if (!mail) return { status: "unlinked" as const, member: null, organization: null, benefits: [] };
  let { data: member } = await db.from("organization_members").select("id,organization_id,full_name,email,phone,department,employee_code,portal_active,auth_user_id,birth_date,vacation_start,vacation_end,next_day_off").eq("auth_user_id", userId).maybeSingle();
  if (!member) {
    const result = await db.from("organization_members").select("id,organization_id,full_name,email,phone,department,employee_code,portal_active,auth_user_id,birth_date,vacation_start,vacation_end,next_day_off").ilike("email", mail).is("auth_user_id", null).limit(2);
    if ((result.data ?? []).length === 1) {
      const row = result.data[0];
      const bound = await db.from("organization_members").update({ auth_user_id: userId }).eq("id", row.id).is("auth_user_id", null).select("id,organization_id,full_name,email,phone,department,employee_code,portal_active,auth_user_id,birth_date,vacation_start,vacation_end,next_day_off").maybeSingle();
      member = bound.data ?? row;
      await audit(userId, mail, "employee.account_linked", member.id);
    }
  }
  if (!member) return { status: "unlinked" as const, member: null, organization: null, benefits: [] };
  if (!member.portal_active) return { status: "blocked" as const, member, organization: null, benefits: [] };
  const [{ data: organization }, { data: benefits }] = await Promise.all([
    db.from("organizations").select("id,name,country,active").eq("id", member.organization_id).maybeSingle(),
    db.from("organization_benefit_allocations").select("id,catalog_key,credits_granted,credits_used,status,created_at,purchase_id,requested_at,used_at,scheduled_at,scheduled_note,schedule_status").eq("member_id", member.id).neq("status", "revoked").order("created_at", { ascending: false }),
  ]);
  const keys = [...new Set((benefits ?? []).map((b: any) => b.catalog_key))];
  const { data: catalog } = keys.length ? await db.from("service_catalog").select("catalog_key,name,category,package_sessions").in("catalog_key", keys) : { data: [] };
  const byKey = new Map((catalog ?? []).map((c: any) => [c.catalog_key, c]));
  return { status: "ok" as const, member, organization, benefits: (benefits ?? []).map((b: any) => ({ ...b, service: byKey.get(b.catalog_key) ?? null })) };
}

export async function requestEmployeeBenefit(userId: string, email: string | null, benefitId: string) {
  const ctx = await getEmployeeContext(userId, email);
  if (ctx.status !== "ok" || !ctx.member) fail("Acesso de funcionário não disponível.");
  const { data, error } = await db.from("organization_benefit_allocations").update({ status: "requested", requested_at: new Date().toISOString(), schedule_status:"pending" }).eq("id", benefitId).eq("member_id", ctx.member.id).eq("status", "assigned").select("id").maybeSingle();
  if (error || !data) fail("Este benefício não pode ser solicitado agora.");
  await audit(userId, emailNorm(email), "employee.benefit_requested", benefitId);
  return { ok: true as const };
}
import { getRequest } from "@tanstack/react-start/server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  calculateCustomCompanyPlan,
  COMPANY_PLAN_PRICING,
  type CompanyPlanRegion,
  type CompanyServiceKey,
} from "@/lib/company-plan-pricing";

const db = supabaseAdmin as unknown as { from: (table: string) => any };

type PlanCode = "essential" | "pro" | "custom";
type CheckoutInput = {
  planCode: PlanCode;
  region: CompanyPlanRegion;
  employees: number;
  services?: CompanyServiceKey[];
  extraCredits?: 0 | 5 | 10 | 25;
};

type SubscriptionRow = {
  id: string;
  organization_id: string;
  plan_code: PlanCode;
  region: CompanyPlanRegion;
  employee_count: number;
  services: CompanyServiceKey[];
  extra_credits: number;
  currency: string;
  monthly_amount_cents: number;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  stripe_checkout_session_id?: string | null;
  status: string;
  current_period_start?: string | null;
  current_period_end?: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
};

function fail(message: string): never { throw new Error(message); }
function emailNorm(value: string | null | undefined) { return value?.trim().toLowerCase() ?? null; }
function isoFromUnix(value?: number | null) { return value && Number.isFinite(value) ? new Date(value * 1000).toISOString() : null; }
function stripeId(value: string | { id?: string } | null | undefined) { return typeof value === "string" ? value : value?.id ?? null; }

async function requireOrganization(userId: string) {
  const { data, error } = await db.from("organizations")
    .select("id,name,billing_email,country,active")
    .eq("owner_auth_user_id", userId)
    .eq("active", true)
    .maybeSingle();
  if (error || !data) fail("Área da empresa não configurada.");
  return data;
}

async function audit(actorId: string, actorEmail: string | null, action: string, target?: string | null, details?: Record<string, unknown>) {
  await db.from("audit_logs").insert({ actor_id: actorId, actor_email: actorEmail, action, target: target ?? null, details: details ?? {} });
}

async function stripeGet(path: string) {
  const secret = process.env["STRIPE_SECRET_KEY"];
  if (!secret) return null;
  try {
    const response = await fetch(`https://api.stripe.com/v1/${path}`, { headers: { Authorization: `Bearer ${secret}` } });
    if (!response.ok) return null;
    return await response.json() as any;
  } catch { return null; }
}

function normalizedStripeStatus(status?: string) {
  if (status === "trialing") return "active";
  const allowed = new Set(["pending","active","past_due","canceled","unpaid","paused","incomplete"]);
  return status && allowed.has(status) ? status : "incomplete";
}

async function syncSubscriptionFromStripe(row: SubscriptionRow): Promise<SubscriptionRow> {
  let stripeSubscriptionId = row.stripe_subscription_id ?? null;
  let stripeCustomerId = row.stripe_customer_id ?? null;
  if (!stripeSubscriptionId && row.stripe_checkout_session_id) {
    const session = await stripeGet(`checkout/sessions/${encodeURIComponent(row.stripe_checkout_session_id)}`);
    if (session) {
      stripeSubscriptionId = stripeId(session.subscription);
      stripeCustomerId = stripeId(session.customer) ?? stripeCustomerId;
      if (!stripeSubscriptionId && session.status === "expired") {
        const patch = { status: "canceled", updated_at: new Date().toISOString() };
        await db.from("company_subscriptions").update(patch).eq("id", row.id);
        return { ...row, ...patch };
      }
    }
  }
  if (!stripeSubscriptionId) return row;
  const stripeSub = await stripeGet(`subscriptions/${encodeURIComponent(stripeSubscriptionId)}`);
  if (!stripeSub) return row;
  const patch = {
    stripe_subscription_id: stripeSubscriptionId,
    stripe_customer_id: stripeId(stripeSub.customer) ?? stripeCustomerId,
    status: normalizedStripeStatus(stripeSub.status),
    current_period_start: isoFromUnix(stripeSub.current_period_start),
    current_period_end: isoFromUnix(stripeSub.current_period_end),
    cancel_at_period_end: Boolean(stripeSub.cancel_at_period_end),
    updated_at: new Date().toISOString(),
  };
  await db.from("company_subscriptions").update(patch).eq("id", row.id);
  return { ...row, ...patch } as SubscriptionRow;
}

function planQuote(input: CheckoutInput) {
  const employees = Math.max(1, Math.floor(Number(input.employees) || 1));
  const pricing = COMPANY_PLAN_PRICING[input.region];
  if (input.planCode === "essential") {
    if (employees > 10) fail("O plano Essencial é para até 10 funcionários.");
    return { employees, currency: pricing.currency, monthlyCents: pricing.essentials.monthlyCents, services: [] as CompanyServiceKey[], extraCredits: 0 as const };
  }
  if (input.planCode === "pro") {
    if (employees < 11 || employees > 50) fail("O plano Pro é para 11 a 50 funcionários.");
    return { employees, currency: pricing.currency, monthlyCents: pricing.pro.monthlyCents, services: [] as CompanyServiceKey[], extraCredits: 0 as const };
  }
  if (employees < 51) fail("O plano Personalizado está disponível a partir de 51 funcionários.");
  const services = [...new Set(input.services ?? [])];
  const extraCredits = input.extraCredits ?? 0;
  const custom = calculateCustomCompanyPlan({ region: input.region, employees, services, extraCredits });
  return { employees, currency: custom.currency, monthlyCents: custom.monthlyCents, services, extraCredits };
}

function planName(planCode: PlanCode) {
  return planCode === "essential" ? "LDR Empresa Essencial" : planCode === "pro" ? "LDR Empresa Pro" : "LDR Empresa Personalizado";
}

export async function getCompanySubscriptionContext(userId: string) {
  const organization = await requireOrganization(userId);
  const { data: subscription, error } = await db.from("company_subscriptions")
    .select("id,organization_id,plan_code,region,employee_count,services,extra_credits,currency,monthly_amount_cents,stripe_customer_id,stripe_subscription_id,stripe_checkout_session_id,status,current_period_start,current_period_end,cancel_at_period_end,created_at,updated_at")
    .eq("organization_id", organization.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) fail("Não foi possível carregar a assinatura da empresa.");
  const synced = subscription ? await syncSubscriptionFromStripe(subscription as SubscriptionRow) : null;
  return { organization, subscription: synced };
}

export async function createCompanySubscriptionCheckout(userId: string, email: string | null, input: CheckoutInput) {
  const organization = await requireOrganization(userId);
  const quote = planQuote(input);
  const { count: activeEmployees, error: employeeCountError } = await db.from("organization_members")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organization.id)
    .eq("portal_active", true);
  if (employeeCountError) fail("Não foi possível validar os funcionários da empresa.");
  if (Number(activeEmployees ?? 0) > quote.employees) {
    fail(`Sua empresa possui ${activeEmployees} funcionários ativos. Escolha um plano com capacidade para pelo menos ${activeEmployees}.`);
  }
  const { data: existing } = await db.from("company_subscriptions")
    .select("id,status,stripe_subscription_id,stripe_checkout_session_id,organization_id,plan_code,region,employee_count,services,extra_credits,currency,monthly_amount_cents,stripe_customer_id,current_period_start,current_period_end,cancel_at_period_end,created_at,updated_at")
    .eq("organization_id", organization.id)
    .in("status", ["pending","active","past_due","unpaid","paused","incomplete"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const syncedExisting = existing ? await syncSubscriptionFromStripe(existing as SubscriptionRow) : null;
  if (syncedExisting?.stripe_subscription_id && syncedExisting.status !== "canceled") fail("Sua empresa já possui uma assinatura. Use a opção de gerenciar renovação no painel.");
  if (syncedExisting?.id && syncedExisting.status !== "canceled") await db.from("company_subscriptions").delete().eq("id", syncedExisting.id).eq("organization_id", organization.id);

  const { data: row, error: insertError } = await db.from("company_subscriptions").insert({
    organization_id: organization.id,
    plan_code: input.planCode,
    region: input.region,
    employee_count: quote.employees,
    services: quote.services,
    extra_credits: quote.extraCredits,
    currency: quote.currency,
    monthly_amount_cents: quote.monthlyCents,
    status: "pending",
  }).select("id").single();
  if (insertError || !row) fail("Não foi possível preparar a assinatura.");

  const secret = process.env["STRIPE_SECRET_KEY"];
  if (!secret) { await db.from("company_subscriptions").delete().eq("id", row.id); fail("Checkout indisponível no momento."); }
  const request = getRequest();
  const origin = process.env["CLIENT_PANEL_URL"]?.replace(/\/$/, "") || (request ? new URL(request.url).origin : "https://painel.ldrrhestrategia.com");
  const params = new URLSearchParams();
  params.set("mode", "subscription");
  params.set("line_items[0][price_data][currency]", quote.currency.toLowerCase());
  params.set("line_items[0][price_data][unit_amount]", String(quote.monthlyCents));
  params.set("line_items[0][price_data][recurring][interval]", "month");
  params.set("line_items[0][price_data][product_data][name]", `${planName(input.planCode)} — ${quote.employees} funcionários`);
  params.set("line_items[0][quantity]", "1");
  params.set("success_url", `${origin}/assinatura-empresa?subscription=success&session_id={CHECKOUT_SESSION_ID}`);
  params.set("cancel_url", `${origin}/assinatura-empresa?subscription=cancel`);
  params.set("client_reference_id", userId);
  params.set("customer_email", organization.billing_email);
  params.set("billing_address_collection", "auto");
  params.set("metadata[checkout_kind]", "company_subscription");
  params.set("metadata[company_subscription_id]", row.id);
  params.set("metadata[organization_id]", organization.id);
  params.set("subscription_data[metadata][checkout_kind]", "company_subscription");
  params.set("subscription_data[metadata][company_subscription_id]", row.id);
  params.set("subscription_data[metadata][organization_id]", organization.id);
  params.set("subscription_data[description]", `${planName(input.planCode)} — renovação mensal automática`);

  let response: Response;
  try {
    response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    });
  } catch {
    await db.from("company_subscriptions").delete().eq("id", row.id);
    fail("Não foi possível abrir o checkout.");
  }
  const session = await response.json() as { id?: string; url?: string; error?: { message?: string } };
  if (!response.ok || !session.id || !session.url) {
    await db.from("company_subscriptions").delete().eq("id", row.id);
    fail(session.error?.message || "Não foi possível abrir o checkout.");
  }
  await db.from("company_subscriptions").update({ stripe_checkout_session_id: session.id, updated_at: new Date().toISOString() }).eq("id", row.id);
  await audit(userId, emailNorm(email), "organization.subscription_checkout_created", row.id, { organization_id: organization.id, plan_code: input.planCode, monthly_amount_cents: quote.monthlyCents, currency: quote.currency });
  return { url: session.url, subscriptionId: row.id };
}

async function updateStripeCancellation(userId: string, email: string | null, cancelAtPeriodEnd: boolean) {
  const organization = await requireOrganization(userId);
  const { data: row, error } = await db.from("company_subscriptions")
    .select("id,stripe_subscription_id,status")
    .eq("organization_id", organization.id)
    .in("status", ["active","past_due","unpaid","paused","incomplete"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !row?.stripe_subscription_id) fail("Assinatura ativa não encontrada.");
  const secret = process.env["STRIPE_SECRET_KEY"];
  if (!secret) fail("Gestão da assinatura indisponível no momento.");
  const params = new URLSearchParams();
  params.set("cancel_at_period_end", cancelAtPeriodEnd ? "true" : "false");
  const response = await fetch(`https://api.stripe.com/v1/subscriptions/${encodeURIComponent(row.stripe_subscription_id)}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });
  const sub = await response.json() as { status?: string; current_period_start?: number; current_period_end?: number; cancel_at_period_end?: boolean; error?: { message?: string } };
  if (!response.ok) fail(sub.error?.message || "Não foi possível atualizar a assinatura.");
  await db.from("company_subscriptions").update({
    status: normalizedStripeStatus(sub.status),
    current_period_start: isoFromUnix(sub.current_period_start),
    current_period_end: isoFromUnix(sub.current_period_end),
    cancel_at_period_end: Boolean(sub.cancel_at_period_end),
    updated_at: new Date().toISOString(),
  }).eq("id", row.id);
  await audit(userId, emailNorm(email), cancelAtPeriodEnd ? "organization.subscription_cancel_scheduled" : "organization.subscription_renewal_restored", row.id, { organization_id: organization.id });
  return { ok: true as const, cancelAtPeriodEnd: Boolean(sub.cancel_at_period_end) };
}

export async function cancelCompanySubscription(userId: string, email: string | null) {
  return updateStripeCancellation(userId, email, true);
}

export async function resumeCompanySubscription(userId: string, email: string | null) {
  return updateStripeCancellation(userId, email, false);
}

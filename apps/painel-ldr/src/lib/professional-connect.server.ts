import { getRequest } from "@tanstack/react-start/server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const db = supabaseAdmin as unknown as { from: (table: string) => any };

function fail(message: string): never { throw new Error(message); }
function normEmail(value: string | null | undefined) { return value?.trim().toLowerCase() ?? null; }
function origin() {
  const req = getRequest();
  return process.env["CLIENT_PANEL_URL"]?.replace(/\/$/, "") || (req ? new URL(req.url).origin : "https://painel.ldrrhestrategia.com");
}
function stripeSecret() {
  const secret = process.env["STRIPE_SECRET_KEY"];
  if (!secret) fail("Stripe Connect indisponível no momento.");
  return secret;
}

async function stripeForm(path: string, params: URLSearchParams, idempotencyKey?: string) {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${stripeSecret()}`,
    "Content-Type": "application/x-www-form-urlencoded",
  };
  if (idempotencyKey) headers["Idempotency-Key"] = idempotencyKey;
  const response = await fetch(`https://api.stripe.com${path}`, { method: "POST", headers, body: params });
  const payload = await response.json() as any;
  if (!response.ok) fail(payload?.error?.message || "Não foi possível concluir a operação no Stripe.");
  return payload;
}

async function stripeGet(path: string) {
  const response = await fetch(`https://api.stripe.com${path}`, {
    headers: { Authorization: `Bearer ${stripeSecret()}` },
  });
  const payload = await response.json() as any;
  if (!response.ok) fail(payload?.error?.message || "Não foi possível consultar o Stripe.");
  return payload;
}

async function getAccount(userId: string) {
  const { data } = await db.from("professional_accounts")
    .select("id,auth_user_id,country_code,preferred_currency,stripe_connected_account_id,connect_status,payout_method_status")
    .eq("auth_user_id", userId)
    .maybeSingle();
  if (!data) fail("Complete seu cadastro profissional antes de configurar os repasses.");
  return data;
}

async function ensureConnectedAccount(userId: string, email: string | null) {
  const account = await getAccount(userId);
  if (account.stripe_connected_account_id) return account;

  const params = new URLSearchParams();
  const mail = normEmail(email);
  if (mail) params.set("email", mail);
  params.set("controller[fees][payer]", "application");
  params.set("controller[losses][payments]", "application");
  params.set("controller[stripe_dashboard][type]", "express");
  params.set("capabilities[transfers][requested]", "true");
  params.set("business_profile[url]", "https://ldrrhestrategia.com");
  params.set("business_profile[product_description]", "Prestação de serviços profissionais através da Rede de Profissionais LDR.");
  params.set("metadata[platform]", "Rede de Profissionais LDR");
  params.set("metadata[professional_account_id]", account.id);
  params.set("metadata[auth_user_id]", userId);

  const created = await stripeForm("/v1/accounts", params, `ldr-connect-${account.id}`);
  if (!created?.id) fail("O Stripe não retornou a conta conectada.");

  const { error } = await db.from("professional_accounts").update({
    stripe_connected_account_id: created.id,
    connect_status: "onboarding_pending",
    payout_method_status: "pending",
    updated_at: new Date().toISOString(),
  }).eq("id", account.id);
  if (error) fail("A conta Stripe foi criada, mas não foi possível vinculá-la ao painel.");

  await db.from("audit_logs").insert({
    actor_id: userId,
    actor_email: mail,
    action: "professional_network.stripe_connect_created",
    target: account.id,
    details: { stripe_connected_account_id: created.id },
  });

  return { ...account, stripe_connected_account_id: created.id, connect_status: "onboarding_pending", payout_method_status: "pending" };
}

export async function getProfessionalConnectStatus(userId: string) {
  const account = await getAccount(userId);
  if (!account.stripe_connected_account_id) {
    return { connected: false, connectStatus: account.connect_status || "not_started", payoutMethodStatus: account.payout_method_status || "not_started", payoutsEnabled: false, detailsSubmitted: false, requirementsDue: [] as string[] };
  }

  const stripe = await stripeGet(`/v1/accounts/${encodeURIComponent(account.stripe_connected_account_id)}`);
  const due = Array.isArray(stripe?.requirements?.currently_due) ? stripe.requirements.currently_due : [];
  const externalCount = Array.isArray(stripe?.external_accounts?.data) ? stripe.external_accounts.data.length : 0;
  const detailsSubmitted = Boolean(stripe?.details_submitted);
  const payoutsEnabled = Boolean(stripe?.payouts_enabled);
  const connectStatus = payoutsEnabled && detailsSubmitted ? "ready" : due.length ? "requirements_due" : "onboarding_pending";
  const payoutMethodStatus = externalCount > 0 ? (payoutsEnabled ? "ready" : "pending") : "missing";

  await db.from("professional_accounts").update({
    connect_status: connectStatus,
    payout_method_status: payoutMethodStatus,
    updated_at: new Date().toISOString(),
  }).eq("id", account.id);

  return {
    connected: true,
    connectStatus,
    payoutMethodStatus,
    payoutsEnabled,
    detailsSubmitted,
    requirementsDue: due,
    stripeAccountId: account.stripe_connected_account_id,
  };
}

export async function createProfessionalConnectOnboarding(userId: string, email: string | null) {
  const account = await ensureConnectedAccount(userId, email);
  const params = new URLSearchParams();
  params.set("account", account.stripe_connected_account_id);
  params.set("refresh_url", `${origin()}/profissional-repasses?connect=refresh`);
  params.set("return_url", `${origin()}/profissional-repasses?connect=return`);
  params.set("type", "account_onboarding");
  params.set("collection_options[fields]", "eventually_due");
  const link = await stripeForm("/v1/account_links", params);
  if (!link?.url) fail("Não foi possível abrir o cadastro seguro do Stripe.");
  return { url: link.url };
}

export async function createProfessionalConnectDashboardLink(userId: string) {
  const account = await getAccount(userId);
  if (!account.stripe_connected_account_id) fail("Configure sua conta de recebimentos primeiro.");
  const link = await stripeForm(`/v1/accounts/${encodeURIComponent(account.stripe_connected_account_id)}/login_links`, new URLSearchParams());
  if (!link?.url) fail("Não foi possível abrir o painel Stripe Express.");
  return { url: link.url };
}

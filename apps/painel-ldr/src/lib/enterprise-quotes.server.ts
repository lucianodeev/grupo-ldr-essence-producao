import { createHash } from "node:crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { resolveAccess } from "@/lib/access.server";
import { supportIdentity } from "@/lib/support-conversation.server";
import { requireClient } from "@/lib/client-portal.server";
import { CONTRACT_KEYS } from "@/lib/contract-catalog";
import { hostedServiceCheckout } from "@/lib/service-checkout-provider.server";
import { acceptQuoteSchema, quoteDraftSchema, quoteIdSchema } from "@/lib/enterprise-quotes.schemas";

const dbDefault = supabaseAdmin as any;
const fail = (): never => { throw Error("Não foi possível concluir a operação da proposta."); };
const fields = "id,order_number,title,description,amount_cents,currency,customer_id,contact_email,catalog_key,payment_status,status,assignee_id,stripe_checkout_session_id,metadata,created_at";
const isQuote = (order: any) => order?.metadata?.checkout_kind === "enterprise_quote";
const nowSeconds = () => Math.floor(Date.now() / 1000);

async function quoteReady(db: any) {
  const { data, error } = await db.rpc("ldr_enterprise_quote_checkout_ready");
  return !error && data === true;
}

async function master(context: any) {
  const access = await resolveAccess(context.supabase, context.userId);
  if (!access.authorized || access.role !== "superadmin") fail();
}
function safeQuote(order: any) {
  return { id: order.id, number: order.order_number, title: order.title, scope: order.description,
    amountCents: order.amount_cents, currency: order.currency, state: order.metadata.quote_state,
    expiresAt: order.metadata.quote_valid_until, approvedAt: order.metadata.approved_at,
    acceptedAt: order.metadata.accepted_at ?? null, sessions: order.metadata.sessions,
    paymentStatus: order.payment_status, status: order.status };
}

// Uses orders + ecosystem_contacts already in production. No duplicate CRM or schema.
export async function masterQuotes(context: any, contactId: string, db = dbDefault) {
  await master(context); quoteIdSchema.parse({ id: contactId });
  const [orders, services] = await Promise.all([
    db.from("orders").select(fields).contains("metadata", { checkout_kind: "enterprise_quote", contact_id: contactId }).order("created_at", { ascending: false }).limit(100),
    db.from("service_catalog").select("catalog_key,name,billing_model,package_sessions").eq("active", true)
      .eq("billing_cadence", "one_time").in("billing_model", ["single_paid_session", "package_sessions"]),
  ]);
  if (orders.error || services.error) fail();
  const ids = (orders.data ?? []).map((o: any) => o.id);
  const appointments = ids.length ? await db.from("appointments").select("id,order_id,status,starts_at,duration_minutes").in("order_id", ids) : { data: [], error: null };
  if (appointments.error) fail();
  return { ready: await quoteReady(db), orders: orders.data ?? [], services: (services.data ?? []).filter((s: any) => CONTRACT_KEYS.includes(s.catalog_key)), appointments: appointments.data ?? [] };
}

export async function createQuoteDraft(context: any, raw: unknown, db = dbDefault, now = nowSeconds()) {
  await master(context); const input = quoteDraftSchema.parse(raw);
  if (!await quoteReady(db)) fail();
  const { data: contact, error } = await db.from("ecosystem_contacts").select("id,email,protocol,source_project,source_url,message,subject")
    .eq("id", input.contactId).maybeSingle();
  if (error || !contact || contact.subject !== "Serviços para empresas") fail();
  let sessions = 0;
  if (input.catalogKey) {
    if (!CONTRACT_KEYS.includes(input.catalogKey)) fail();
    const { data: item, error: itemError } = await db.from("service_catalog").select("billing_model,billing_cadence,package_sessions")
      .eq("catalog_key", input.catalogKey).eq("active", true).maybeSingle();
    if (itemError || !item || item.billing_cadence !== "one_time") fail();
    sessions = item.billing_model === "single_paid_session" ? 1 : item.billing_model === "package_sessions" ? item.package_sessions : 0;
    if (!Number.isSafeInteger(sessions) || sessions < 1) fail();
  }
  const hash = createHash("sha256").update(`enterprise-quote:${context.userId}:${input.contactId}:${input.requestId}`).digest("hex");
  const id = `${hash.slice(0,8)}-${hash.slice(8,12)}-5${hash.slice(13,16)}-a${hash.slice(17,20)}-${hash.slice(20,32)}`;
  const { error: insertError } = await db.from("orders").insert({ id, order_number: "", customer_id: null,
    contact_email: contact.email.toLowerCase(), title: input.title, description: input.scope,
    service_type: "outros", quantity: 1, amount_cents: input.amountCents, currency: input.currency,
    catalog_key: input.catalogKey, status: "novo", payment_status: "pendente", created_by: context.userId, assignee_id: context.userId,
    metadata: { checkout_kind: "enterprise_quote", quote_state: "draft", contact_id: contact.id, protocol: contact.protocol,
      source_project: contact.source_project, source_url: contact.source_url,
      organization: String(contact.message).split("\n")[0]?.replace(/^Organização:\s*/, "").slice(0,160),
      sessions, quote_valid_until: now + input.validDays * 86400, prepared_by: context.userId, prepared_at: new Date(now * 1000).toISOString() } });
  if (insertError && insertError.code !== "23505") fail();
  return { id };
}

export async function approveQuote(context: any, raw: unknown, db = dbDefault, now = nowSeconds()) {
  await master(context); const { id } = quoteIdSchema.parse(raw);
  if (!await quoteReady(db)) fail();
  const { data: order, error } = await db.from("orders").select(fields).eq("id", id).maybeSingle();
  if (error || !isQuote(order) || order.status === "cancelado" || order.metadata.quote_valid_until <= now + 3600) fail();
  if (order.metadata.quote_state !== "draft") return { id, notified: false };
  const { data, error: updateError } = await db.from("orders").update({ metadata: { ...order.metadata,
    quote_state: "approved", approved_by: context.userId, approved_at: new Date(now * 1000).toISOString() } })
    .eq("id", id).eq("metadata->>quote_state", "draft").select("id").maybeSingle();
  if (updateError || !data) fail();
  // In-app delivery only: the existing support inbox detects this outbound message.
  // The proposal also stays available in /cliente/propostas if a notice fails.
  const notice = await db.from("ecosystem_contact_messages").insert({ contact_id: order.metadata.contact_id,
    direction: "outbound", channel: "admin", sender: "LDR", recipient: order.contact_email, created_by: context.userId,
    body: `Proposta ${order.order_number} disponível na Minha Área > Minhas propostas: https://ldrecossistema.online/cliente/propostas. Entre com o mesmo e-mail deste pedido para consultar o âmbito, valor, validade e condições antes de aceitar e pagar.` });
  return { id, notified: !notice.error };
}

export async function myQuotes(context: any, db = dbDefault) {
  const identity = await supportIdentity(context);
  const { data, error } = await db.from("orders").select(fields).eq("contact_email", identity.email)
    .contains("metadata", { checkout_kind: "enterprise_quote" }).in("metadata->>quote_state", ["approved", "accepted"])
    .order("created_at", { ascending: false }).limit(100);
  if (error) fail();
  return (data ?? []).map(safeQuote);
}

export async function acceptAndPayQuote(context: any, raw: unknown, deps: {
  db?: any; env?: Record<string,string|undefined>; now?: number; request?: typeof fetch;
  customer?: typeof requireClient;
} = {}) {
  const input = acceptQuoteSchema.parse(raw), db = deps.db ?? dbDefault, env = deps.env ?? process.env, now = deps.now ?? nowSeconds();
  if (env["ENTERPRISE_QUOTES_CHECKOUT_ENABLED"] !== "true" || !/^[sr]k_(live|test)_[A-Za-z0-9]+$/.test(env["STRIPE_SECRET_KEY"] ?? "") ||
      !/^whsec_[A-Za-z0-9]+$/.test(env["STRIPE_WEBHOOK_SECRET"] ?? "")) fail();
  const identity = await supportIdentity(context);
  if (!await quoteReady(db)) fail();
  let { data: order, error } = await db.from("orders").select(fields).eq("id", input.id).eq("contact_email", identity.email).maybeSingle();
  if (error || !isQuote(order) || order.status === "cancelado" || order.payment_status !== "pendente" ||
      !["approved", "accepted"].includes(order.metadata.quote_state) ||
      !Number.isSafeInteger(order.amount_cents) || order.amount_cents < 50 || !["EUR","BRL"].includes(order.currency)) fail();
  if (order.metadata.sessions > 0 && env["AGENDA_INTEGRATION_ENABLED"] !== "true") fail();
  if (order.metadata.quote_state === "approved") {
    if (order.metadata.quote_valid_until <= now + 1860) fail();
    const customer = await (deps.customer ?? requireClient)(identity.userId, identity.email);
    const { data: accepted, error: acceptError } = await db.from("orders").update({ customer_id: customer.id,
      metadata: { ...order.metadata, quote_state: "accepted", accepted_by: identity.userId, accepted_at: new Date(now * 1000).toISOString(),
        user_id: identity.userId, customer_id: customer.id, checkout_expires_at: Math.min(now + 3600, order.metadata.quote_valid_until) } })
      .eq("id", order.id).eq("metadata->>quote_state", "approved").eq("payment_status", "pendente").select(fields).maybeSingle();
    if (acceptError) fail();
    if (accepted) order = accepted;
    else {
      const reloaded = await db.from("orders").select(fields).eq("id", input.id).eq("contact_email", identity.email).maybeSingle();
      if (reloaded.error) fail(); order = reloaded.data;
    }
  }
  if (!isQuote(order) || order.metadata.quote_state !== "accepted" || order.metadata.user_id !== identity.userId ||
      order.metadata.customer_id !== order.customer_id || order.status === "cancelado" || order.payment_status !== "pendente" ||
      !Number.isSafeInteger(order.metadata.checkout_expires_at) || order.metadata.checkout_expires_at <= now + 60) fail();
  // Always repeat the same frozen request. Stripe's idempotency key returns the same session.
  if (order.metadata.checkout_expires_at < now + 1800 && !order.stripe_checkout_session_id) fail();
  if (order.stripe_checkout_session_id && order.metadata.checkout_url) {
    const url = new URL(order.metadata.checkout_url);
    if (url.protocol !== "https:" || url.hostname !== "checkout.stripe.com" || url.username || url.password || url.port) fail();
    return { url: url.href, orderId: order.id };
  }
  const session = await hostedServiceCheckout(order, { checkout_kind: "enterprise_quote", order_id: order.id,
    customer_id: order.customer_id, catalog_key: order.catalog_key ?? "" }, order.metadata.checkout_expires_at, { env, ...(deps.request ? { request: deps.request } : {}) });
  const { data: saved, error: saveError } = await db.from("orders").update({ stripe_checkout_session_id: session.id,
    metadata: { ...order.metadata, checkout_url: session.url } }).eq("id", order.id).eq("payment_status", "pendente")
    .eq("metadata->>quote_state", "accepted").neq("status", "cancelado").select("id").maybeSingle();
  if (saveError || !saved) fail();
  return { url: session.url, orderId: order.id };
}

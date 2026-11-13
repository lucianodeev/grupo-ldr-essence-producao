import { createHash } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/integrations/supabase/types";
import { CONTRACT_KEYS } from "@/lib/contract-catalog";

const ORIGIN = "https://ldrecossistema.online";
const MESSAGE = "Não foi possível iniciar a contratação. Tente novamente ou fale com o atendimento.";
const fail = (): never => { throw new Error(MESSAGE); };
type Env = Record<string, string | undefined>;

export function individualServiceCheckoutEnabled(env: Env = process.env): boolean {
  return env["INDIVIDUAL_SERVICE_CHECKOUT_ENABLED"] === "true" &&
    env["AGENDA_INTEGRATION_ENABLED"] === "true" &&
    /^[sr]k_(live|test)_[A-Za-z0-9]+$/.test(env["STRIPE_SECRET_KEY"] ?? "") &&
    /^whsec_[A-Za-z0-9]+$/.test(env["STRIPE_WEBHOOK_SECRET"] ?? "");
}

export function individualCheckoutOrderId(userId: string, requestId: string): string {
  const hash = createHash("sha256").update(`ldr:individual-service:${userId}:${requestId.toLowerCase()}`).digest("hex");
  return `${hash.slice(0,8)}-${hash.slice(8,12)}-5${hash.slice(13,16)}-a${hash.slice(17,20)}-${hash.slice(20,32)}`;
}

function checkoutUrl(value: unknown): string {
  if (typeof value !== "string") return fail();
  try {
    const url = new URL(value);
    if (url.protocol === "https:" && url.hostname === "checkout.stripe.com" &&
        !url.port && !url.username && !url.password) return url.href;
  } catch { /* provider detail must not escape */ }
  return fail();
}

type Customer = { id: string; email: string | null; phone: string | null };
type Input = { catalogKey: string; requestId: string };

/** Price, ownership and session count are resolved on the server; no charge is created here. */
export async function createIndividualServiceCheckout(
  db: SupabaseClient<Database>, userId: string, customer: Customer, input: Input,
  deps: { env?: Env; request?: typeof fetch; now?: () => number } = {},
): Promise<{ url: string; orderId: string }> {
  const env = deps.env ?? process.env;
  if (!individualServiceCheckoutEnabled(env) || !userId || !customer.id ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(input.requestId) ||
      !CONTRACT_KEYS.includes(input.catalogKey)) return fail();
  const now = Math.floor((deps.now?.() ?? Date.now()) / 1000);
  const { data: item, error: catalogError } = await db.from("service_catalog")
    .select("catalog_key,name,category,billing_model,billing_cadence,package_sessions,amount_cents,currency,active")
    .eq("catalog_key", input.catalogKey).eq("active", true).maybeSingle();
  if (catalogError || !item || item.billing_cadence !== "one_time" || !["single_paid_session", "package_sessions"].includes(item.billing_model) ||
      !["EUR", "BRL"].includes(item.currency) || !Number.isSafeInteger(item.amount_cents) || item.amount_cents <= 0 ||
      (item.billing_model === "package_sessions" && (!Number.isSafeInteger(item.package_sessions) || Number(item.package_sessions) < 1))) return fail();

  const id = individualCheckoutOrderId(userId, input.requestId);
  const select = "id,catalog_key,customer_id,title,amount_cents,currency,payment_status,status,stripe_checkout_session_id,contact_email,metadata";
  const read = () => db.from("orders").select(select).eq("id", id).eq("customer_id", customer.id).maybeSingle();
  let { data: order, error: readError } = await read();
  if (readError) return fail();
  if (!order) {
    const { data: recent, error: recentError } = await db.from("orders").select("id")
      .eq("customer_id", customer.id).eq("payment_status", "pendente")
      .contains("metadata", { checkout_kind: "individual_service" })
      .gte("created_at", new Date((now - 3600) * 1000).toISOString()).limit(5);
    if (recentError || (recent?.length ?? 0) >= 5) return fail();
    const metadata = { checkout_kind: "individual_service", user_id: userId,
      customer_id: customer.id, catalog_key: item.catalog_key, checkout_expires_at: now + 3600,
      sessions: item.billing_model === "single_paid_session" ? 1 : item.package_sessions };
    const created = await db.from("orders").insert({ id, order_number: "", customer_id: customer.id,
      contact_email: customer.email, contact_phone: customer.phone, catalog_key: item.catalog_key,
      service_type: item.category === "mentoria" ? "mentoria" : "outros", title: item.name,
      amount_cents: item.amount_cents, currency: item.currency, quantity: 1,
      payment_status: "pendente", status: "novo", metadata }).select(select).single();
    if (created.error?.code === "23505") {
      const existing = await read();
      if (existing.error) return fail();
      order = existing.data;
    } else {
      if (created.error) return fail();
      order = created.data;
    }
  }
  if (!order || order.catalog_key !== item.catalog_key || order.amount_cents !== item.amount_cents ||
      order.currency !== item.currency || order.payment_status !== "pendente" || order.status === "cancelado") return fail();
  if (!order.metadata || typeof order.metadata !== "object" || Array.isArray(order.metadata)) return fail();
  const metadata = order.metadata as Record<string, Json | undefined>;
  const expires = Number(metadata["checkout_expires_at"]);
  if (metadata["checkout_kind"] !== "individual_service" || metadata["user_id"] !== userId ||
      metadata["customer_id"] !== customer.id || !Number.isSafeInteger(expires) || expires <= now + 60) return fail();
  if (order.stripe_checkout_session_id && metadata["checkout_url"]) {
    return { url: checkoutUrl(metadata["checkout_url"]), orderId: order.id };
  }
  if (expires < now + 1800) return fail();

  const params = new URLSearchParams({ mode: "payment", client_reference_id: order.id,
    success_url: `${ORIGIN}/cliente/pedido/${order.id}?payment=processing`,
    cancel_url: `${ORIGIN}/cliente/pedido/${order.id}?payment=cancel`, expires_at: String(expires),
    "line_items[0][price_data][currency]": order.currency.toLowerCase(),
    "line_items[0][price_data][unit_amount]": String(order.amount_cents),
    "line_items[0][price_data][product_data][name]": order.title,
    "line_items[0][quantity]": "1",
  });
  // Do not send personal contact information as Stripe metadata.
  for (const [key, value] of Object.entries({ checkout_kind: "individual_service", order_id: order.id,
    customer_id: customer.id, catalog_key: order.catalog_key! })) {
    params.set(`metadata[${key}]`, value);
    params.set(`payment_intent_data[metadata][${key}]`, value);
  }
  if (order.contact_email) params.set("customer_email", order.contact_email);
  let session: { id?: string; url?: string; livemode?: boolean };
  try {
    const response = await (deps.request ?? fetch)("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST", redirect: "error", signal: AbortSignal.timeout(20000),
      headers: { Authorization: `Bearer ${env["STRIPE_SECRET_KEY"]}`, "content-type": "application/x-www-form-urlencoded",
        "Idempotency-Key": `ldr-individual-service-${order.id}` }, body: params,
    });
    if (!response.ok) return fail();
    session = await response.json();
  } catch { return fail(); }
  if (!session.id || !/^cs_(test|live)_[A-Za-z0-9]+$/.test(session.id) ||
      session.livemode !== /_live_/.test(env["STRIPE_SECRET_KEY"] ?? "")) return fail();
  const url = checkoutUrl(session.url);
  const { error: saveError } = await db.from("orders").update({ stripe_checkout_session_id: session.id,
    metadata: { ...metadata, checkout_url: url } as Json })
    .eq("id", order.id).eq("customer_id", customer.id).eq("payment_status", "pendente");
  if (saveError) return fail();
  // Never mark an order paid or grant credits based on this response/return URL.
  return { url, orderId: order.id };
}

import { getRequest } from "@tanstack/react-start/server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { resolveClient } from "@/lib/client-portal.server";
import { LDR_ONE_EUR, LDR_ONE_LAUNCH_ENABLED } from "@/lib/ldr-one.catalog";

type Audience = "individual" | "business";
type Billing = "monthly" | "annual";
type CheckoutRequest = { userId: string; email: string | null; audience: Audience; billing: Billing; seats?: number };

function origin() {
  const configured = process.env.CLIENT_PANEL_URL?.replace(/\/$/, "");
  const request = getRequest();
  const requestOrigin = request ? new URL(request.url).origin : null;
  return configured || requestOrigin || "https://ldracademy.online";
}

/** Staged implementation. Keep the catalog launch guard off until Stripe, migration and entitlements pass QA. */
export async function createLdrOneCheckout(input: CheckoutRequest): Promise<{ url: string }> {
  if (!LDR_ONE_LAUNCH_ENABLED) throw new Error("A assinatura LDR ONE está em preparação.");
  if (!["individual", "business"].includes(input.audience) || !["monthly", "annual"].includes(input.billing))
    throw new Error("Assinatura inválida.");
  const seats = input.audience === "individual" ? 1 : (input.seats ?? 0);
  if (!Number.isSafeInteger(seats) || !seats || (input.audience === "business" && (seats < 5 || seats > 10000)))
    throw new Error("A assinatura empresarial exige entre 5 e 10.000 colaboradores.");

  const customerResult = await resolveClient(input.userId, input.email);
  if (customerResult.status !== "ok") throw new Error("Cadastro do cliente indisponível.");
  const customer = customerResult.customer;
  const db = supabaseAdmin as any;
  const { data: existing, error: existingError } = await db.from("ldr_pass_subscriptions")
    .select("id").eq("customer_id", customer.id)
    .in("status", ["active", "trialing", "past_due", "unpaid", "paused", "incomplete"])
    .limit(1).maybeSingle();
  if (existingError) throw new Error("Não foi possível validar a assinatura atual.");
  if (existing) throw new Error("Já existe uma assinatura em andamento. Entre em contato com o suporte para migrar.");

  const offer = LDR_ONE_EUR[input.audience][input.billing];
  const priceId = offer.priceId;
  const amount = input.audience === "business"
    ? LDR_ONE_EUR.business[input.billing].amountCentsPerSeat * seats
    : LDR_ONE_EUR.individual[input.billing].amountCents;
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) throw new Error("Pagamento temporariamente indisponível.");

  const { data: row, error: insertError } = await db.from("ldr_pass_subscriptions")
    .insert({
      customer_id: customer.id, plan: input.audience === "individual" ? "pass" : "business",
      market: "EU", currency: "EUR", billing_cycle: input.billing, amount_cents: amount,
      status: "pending", source: "ecossistema", ldr_one_offer: input.audience, ldr_one_seats: seats,
    }).select("id").single();
  if (insertError || !row) throw new Error("Não foi possível preparar a assinatura.");

  try {
    const params = new URLSearchParams();
    params.set("mode", "subscription");
    params.set("line_items[0][price]", priceId);
    params.set("line_items[0][quantity]", String(seats));
    params.set("client_reference_id", input.userId);
    params.set("success_url", `${origin()}/cliente/ldr-pass?subscription=success&session_id={CHECKOUT_SESSION_ID}`);
    params.set("cancel_url", `${origin()}/ldr-pass?subscription=cancel`);
    params.set("billing_address_collection", "auto");
    if (customer.email) params.set("customer_email", customer.email);
    const metadata = {
      checkout_kind: "ldr_pass_subscription", ldr_pass_subscription_id: row.id,
      customer_id: customer.id, plan: input.audience === "individual" ? "pass" : "business",
      market: "EU", billing_cycle: input.billing, source: "ecossistema",
      ldr_one_offer: input.audience, ldr_one_seats: String(seats),
    };
    for (const [key, value] of Object.entries(metadata)) {
      params.set(`metadata[${key}]`, value);
      params.set(`subscription_data[metadata][${key}]`, value);
    }
    const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    });
    const session = await response.json() as { id?: string; url?: string };
    if (!response.ok || !session.id || !session.url) throw new Error("Não foi possível abrir o checkout.");
    const { error: updateError } = await db.from("ldr_pass_subscriptions")
      .update({ stripe_checkout_session_id: session.id, updated_at: new Date().toISOString() }).eq("id", row.id);
    if (updateError) throw new Error("Checkout criado, mas o registro local falhou. Contate o suporte antes de tentar novamente.");
    return { url: session.url };
  } catch (error) {
    // Keep the pending record if Stripe may have created a session; reconciliation prevents accidental duplicates.
    throw error;
  }
}

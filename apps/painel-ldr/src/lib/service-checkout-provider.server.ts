// Shared transport for catalogue and approved-proposal hosted Checkout.
// This function never confirms payment or issues credits.
type Order = { id: string; title: string; amount_cents: number; currency: string; contact_email: string | null };
export async function hostedServiceCheckout(order: Order, metadata: Record<string, string>, expires: number,
  deps: { env: Record<string, string | undefined>; request?: typeof fetch }) {
  const key = deps.env["STRIPE_SECRET_KEY"] ?? "";
  if (!/^(?:[sr]k_(?:live|test)|rkcs_test)_[A-Za-z0-9]+$/.test(key)) throw Error("Pagamento temporariamente indisponível.");
  const origin = "https://ldrecossistema.online";
  const params = new URLSearchParams({ mode: "payment", client_reference_id: order.id,
    success_url: `${origin}/cliente/pedido/${order.id}?payment=processing`,
    cancel_url: `${origin}/cliente/pedido/${order.id}?payment=cancel`, expires_at: String(expires),
    "line_items[0][price_data][currency]": order.currency.toLowerCase(),
    "line_items[0][price_data][unit_amount]": String(order.amount_cents),
    "line_items[0][price_data][product_data][name]": order.title, "line_items[0][quantity]": "1" });
  for (const [name, value] of Object.entries(metadata)) {
    params.set(`metadata[${name}]`, value);
    params.set(`payment_intent_data[metadata][${name}]`, value);
  }
  if (order.contact_email) params.set("customer_email", order.contact_email);
  try {
    const response = await (deps.request ?? fetch)("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST", redirect: "error", signal: AbortSignal.timeout(20000),
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/x-www-form-urlencoded",
        "Idempotency-Key": `ldr-enterprise-quote-${order.id}` }, body: params });
    const session = await response.json() as { id?: string; url?: string; livemode?: boolean };
    if (!response.ok || !/^cs_(test|live)_[A-Za-z0-9]+$/.test(session.id ?? "") || session.livemode !== /_live_/.test(key)) throw Error();
    const url = new URL(session.url ?? "");
    if (url.protocol !== "https:" || url.hostname !== "checkout.stripe.com" || url.port || url.username || url.password) throw Error();
    return { id: session.id!, url: url.href };
  } catch { throw Error("Não foi possível abrir o pagamento. Tente novamente na mesma proposta."); }
}

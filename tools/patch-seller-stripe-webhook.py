from pathlib import Path
p=Path('apps/painel-ldr/src/routes/api/stripe/webhook.ts')
s=p.read_text(encoding='utf-8')

if 'async function handleSellerStripeEvent' in s:
    print('seller webhook already patched')
    raise SystemExit(0)

s=s.replace('''  amount_refunded?: number;\n  currency?: string;''','''  amount_refunded?: number;\n  amount_paid?: number;\n  total?: number;\n  billing_reason?: string;\n  currency?: string;''',1)

old='''  return supabaseAdmin as unknown as { from: (table: string) => any };'''
new='''  return supabaseAdmin as unknown as {\n    from: (table: string) => any;\n    rpc: (name: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: { message?: string } | null }>;\n  };'''
if old not in s: raise SystemExit('database return anchor not found')
s=s.replace(old,new,1)

anchor='''export const Route = createFileRoute("/api/stripe/webhook")({'''
helper=r'''async function sellerSaleByPaymentIntent(paymentIntentId: string | null) {
  if (!paymentIntentId) return null;
  const db = await database();
  const { data, error } = await db.from("ldr_simple_sales")
    .select("id,amount_cents,currency,payment_status,stripe_subscription_id")
    .eq("stripe_payment_intent_id", paymentIntentId)
    .in("sale_source", ["stripe_checkout", "stripe_subscription_renewal"])
    .maybeSingle();
  if (error) throw error;
  return data ?? null;
}

async function sellerSaleBySubscription(subscriptionId: string | null) {
  if (!subscriptionId) return null;
  const db = await database();
  const { data, error } = await db.from("ldr_simple_sales")
    .select("id,amount_cents,currency,payment_status,stripe_subscription_id")
    .eq("stripe_subscription_id", subscriptionId)
    .eq("sale_source", "stripe_checkout")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ?? null;
}

function sellerEventSummary(object: StripeObject) {
  return {
    id: object.id ?? null,
    payment_status: object.payment_status ?? null,
    status: object.status ?? null,
    amount_total: object.amount_total ?? null,
    amount: object.amount ?? null,
    amount_refunded: object.amount_refunded ?? null,
    amount_paid: object.amount_paid ?? null,
    total: object.total ?? null,
    billing_reason: object.billing_reason ?? null,
    currency: object.currency ?? null,
  };
}

async function applySellerSaleEvent(args: Record<string, unknown>) {
  const db = await database();
  const { data, error } = await db.rpc("ldr_seller_stripe_apply_service", args);
  if (error) throw new Error(error.message || "Falha ao atualizar venda do vendedor.");
  return data;
}

async function applySellerRenewalEvent(args: Record<string, unknown>) {
  const db = await database();
  const { data, error } = await db.rpc("ldr_seller_stripe_renewal_service", args);
  if (error) throw new Error(error.message || "Falha ao atualizar renovação do vendedor.");
  return data;
}

async function handleSellerStripeEvent(event: StripeEvent, object: StripeObject) {
  const metadata = object.metadata ?? {};
  let saleId = metadata["source"] === "seller_portal" ? metadata["ldr_sale_id"] : undefined;
  const paymentIntentId = stripeId(object.payment_intent);
  const subscriptionId = stripeId(object.subscription) ?? stripeId(object.parent?.subscription_details?.subscription);

  if (!saleId && (event.type === "payment_intent.payment_failed" || event.type === "charge.refunded")) {
    const sale = await sellerSaleByPaymentIntent(paymentIntentId);
    saleId = sale?.id;
  }

  if (event.type === "invoice.payment_succeeded") {
    if (object.billing_reason === "subscription_create") return false;
    const original = await sellerSaleBySubscription(subscriptionId);
    if (!original?.id) return false;
    const amount = Number(object.amount_paid ?? object.total ?? 0);
    if (!Number.isFinite(amount) || amount <= 0) return false;
    await applySellerRenewalEvent({
      p_event_id: event.id,
      p_event_type: event.type,
      p_original_sale_id: original.id,
      p_amount_cents: amount,
      p_currency: String(object.currency || original.currency || "").toUpperCase(),
      p_payment_intent_id: paymentIntentId,
      p_subscription_id: subscriptionId,
      p_summary: sellerEventSummary(object),
    });
    return true;
  }

  if (!saleId) return false;
  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    if (object.payment_status !== "paid") return false;
    await applySellerSaleEvent({
      p_event_id: event.id,
      p_event_type: event.type,
      p_sale_id: saleId,
      p_payment_status: "paid",
      p_amount_cents: object.amount_total ?? null,
      p_currency: object.currency ? String(object.currency).toUpperCase() : null,
      p_checkout_session_id: object.id ?? null,
      p_payment_intent_id: paymentIntentId,
      p_subscription_id: subscriptionId,
      p_refund_amount_cents: 0,
      p_summary: sellerEventSummary(object),
    });
    return true;
  }
  if (event.type === "checkout.session.expired") {
    await applySellerSaleEvent({
      p_event_id: event.id,
      p_event_type: event.type,
      p_sale_id: saleId,
      p_payment_status: "expired",
      p_amount_cents: null,
      p_currency: null,
      p_checkout_session_id: object.id ?? null,
      p_payment_intent_id: paymentIntentId,
      p_subscription_id: subscriptionId,
      p_refund_amount_cents: 0,
      p_summary: sellerEventSummary(object),
    });
    return true;
  }
  if (event.type === "payment_intent.payment_failed") {
    await applySellerSaleEvent({
      p_event_id: event.id,
      p_event_type: event.type,
      p_sale_id: saleId,
      p_payment_status: "failed",
      p_amount_cents: null,
      p_currency: null,
      p_checkout_session_id: null,
      p_payment_intent_id: object.id ?? paymentIntentId,
      p_subscription_id: subscriptionId,
      p_refund_amount_cents: 0,
      p_summary: sellerEventSummary(object),
    });
    return true;
  }
  if (event.type === "charge.refunded") {
    await applySellerSaleEvent({
      p_event_id: event.id,
      p_event_type: event.type,
      p_sale_id: saleId,
      p_payment_status: "refunded",
      p_amount_cents: object.amount ?? null,
      p_currency: object.currency ? String(object.currency).toUpperCase() : null,
      p_checkout_session_id: null,
      p_payment_intent_id: paymentIntentId,
      p_subscription_id: subscriptionId,
      p_refund_amount_cents: object.amount_refunded ?? object.amount ?? 0,
      p_summary: sellerEventSummary(object),
    });
    return true;
  }
  return false;
}

'''
if anchor not in s: raise SystemExit('route anchor not found')
s=s.replace(anchor,helper+anchor,1)

insert_after='''          const orderId = metadata["order_id"];\n'''
addition='''\n          // Rede Comercial LDR: pagamento gerado pelo painel do vendedor.\n          // Preço/comissão são congelados no banco; a confirmação financeira vem apenas deste webhook assinado.\n          await handleSellerStripeEvent(event, object);\n'''
if insert_after not in s: raise SystemExit('metadata/order anchor not found')
s=s.replace(insert_after,insert_after+addition,1)

p.write_text(s,encoding='utf-8')
print('seller Stripe webhook patch applied')

from pathlib import Path
p=Path('apps/painel-ldr/src/routes/api/stripe/webhook.ts')
s=p.read_text(encoding='utf-8')
s=s.replace('.in("sale_source", ["stripe_checkout", "stripe_subscription_renewal"])','.in("sale_source", ["stripe_checkout", "stripe_subscription_renewal", "stripe_portal_referral"])')
if 'async function handleSellerReferralEvent' not in s:
    anchor='async function handleSellerStripeEvent(event: StripeEvent, object: StripeObject) {'
    helper=r'''async function handleSellerReferralEvent(event: StripeEvent, object: StripeObject) {
  const metadata = object.metadata ?? {};
  const referralId = metadata["source"] === "seller_portal_referral" ? metadata["ldr_seller_referral_id"] : undefined;
  if (!referralId) return false;
  const db = await database();
  if (event.type === "checkout.session.completed") {
    if (object.payment_status !== "paid" && object.payment_status !== "no_payment_required") return false;
    const { data, error } = await db.rpc("ldr_seller_referral_paid_service", {
      p_ref: referralId,
      p_event_id: event.id,
      p_event_type: event.type,
      p_checkout_session_id: object.id ?? null,
      p_amount_cents: object.amount_total ?? null,
      p_currency: object.currency ? String(object.currency).toUpperCase() : null,
      p_payment_intent_id: stripeId(object.payment_intent),
      p_subscription_id: stripeId(object.subscription),
    });
    if (error) throw new Error(error.message || "Falha ao atribuir comissão do plano ao vendedor.");
    return Boolean(data);
  }
  if (event.type === "checkout.session.expired") {
    const { error } = await db.rpc("ldr_seller_referral_status_service", { p_ref: referralId, p_status: "expired" });
    if (error) throw new Error(error.message || "Falha ao expirar indicação do vendedor.");
    return true;
  }
  return false;
}

'''
    if anchor not in s: raise SystemExit('seller handler anchor missing')
    s=s.replace(anchor,helper+anchor,1)
call='''          await handleSellerStripeEvent(event, object);'''
if call in s and 'await handleSellerReferralEvent(event, object);' not in s:
    s=s.replace(call,call+'\n          await handleSellerReferralEvent(event, object);',1)
elif 'await handleSellerReferralEvent(event, object);' not in s:
    raise SystemExit('seller event call anchor missing')
p.write_text(s,encoding='utf-8')
print('seller plan referral webhook patched')

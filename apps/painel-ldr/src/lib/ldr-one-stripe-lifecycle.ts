/** Pure LDR PASS / LDR ONE Stripe lifecycle mapping; no Stripe calls or database writes. */
export function ldrPassStatusFromStripeEvent(
  eventType: string,
  object: { status?: string; payment_status?: string },
): string {
  let status = String(object.status ?? "pending");
  if (eventType === "checkout.session.completed")
    status = object.payment_status === "paid" || object.payment_status === "no_payment_required" ? "active" : "pending";
  if (eventType === "checkout.session.async_payment_succeeded") status = "active";
  if (eventType === "checkout.session.async_payment_failed") status = "incomplete";
  if (eventType === "invoice.payment_succeeded") status = "active";
  if (eventType === "invoice.payment_failed") status = "past_due";
  if (eventType === "checkout.session.expired" || eventType === "customer.subscription.deleted") status = "canceled";
  const allowed = new Set(["pending", "active", "trialing", "past_due", "canceled", "unpaid", "paused", "incomplete"]);
  return allowed.has(status) ? status : "incomplete";
}

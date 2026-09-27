// Pure event reducer: no database writes and no access grants.
// A signed Stripe webhook must be verified before passing an event here.
export type OneStatus = "pending" | "active" | "trialing" | "past_due" | "canceled" | "unpaid" | "paused" | "incomplete";
export type OneSubscription = {
  recordId: string; customerId: string; stripeSubscriptionId: string | null;
  status: OneStatus; seats: number; lastEventId: string | null;
};
export type OneWebhookEvent = {
  id: string; type: string; livemode: boolean;
  metadata: Record<string, string | undefined>;
  object: { id?: string; subscription?: string | null; payment_status?: string; status?: string; metadata?: Record<string,string | undefined> };
};
export function reduceOneSandboxEvent(previous: OneSubscription, event: OneWebhookEvent) {
  if (event.livemode !== false) throw Error("Live Stripe event rejected");
  if (!event.id) throw Error("Event ID required");
  const metadata = { ...event.metadata, ...event.object.metadata };
  if (metadata.checkout_kind !== "ldr_one_subscription" || metadata.sandbox !== "true") return { handled: false, next: previous };
  if (metadata.ldr_one_subscription_id !== previous.recordId || metadata.customer_id !== previous.customerId) throw Error("Subscription ownership mismatch");
  if (previous.lastEventId === event.id) return { handled: true, duplicate: true, next: previous };
  const subId = event.type.startsWith("customer.subscription.") ? event.object.id : event.object.subscription;
  if (previous.stripeSubscriptionId && subId && subId !== previous.stripeSubscriptionId) throw Error("Stripe subscription mismatch");
  let status: OneStatus | null = null;
  switch (event.type) {
    case "checkout.session.completed":
      status = event.object.payment_status === "paid" ? "active" : "pending";
      break;
    case "checkout.session.expired": status = "canceled"; break;
    case "invoice.payment_succeeded": status = "active"; break;
    case "invoice.payment_failed": status = "past_due"; break;
    case "customer.subscription.created":
    case "customer.subscription.updated":
      if (["active","trialing","past_due","canceled","unpaid","paused","incomplete"].includes(event.object.status ?? "")) status = event.object.status as OneStatus;
      break;
    case "customer.subscription.deleted": status = "canceled"; break;
  }
  if (status === null) return { handled: false, next: previous };
  return { handled: true, duplicate: false, next: { ...previous, status, stripeSubscriptionId: subId ?? previous.stripeSubscriptionId, lastEventId: event.id } };
}
export function hasOneDigitalEntitlement(row: OneSubscription | null) {
  return row?.status === "active" || row?.status === "trialing";
}

/** Guarded server-only adapter. NOT connected to the live shared Stripe webhook.
 * Caller must verify the Stripe signature and resolve a trusted subscription ID
 * from Stripe, never from browser-controlled metadata.
 */
type Db = { rpc: (name: string, args: Record<string, unknown>) => Promise<{data: unknown; error: {message?: string}|null}> };
type Event = {
  id: string; created: number; status: string; stripeSubscriptionId: string;
  stripeCustomerId?: string|null; stripeCheckoutSessionId?: string|null;
  periodStart?: number|null; periodEnd?: number|null; cancelAtPeriodEnd?: boolean|null;
};
const allowed = new Set(["pending","active","trialing","past_due","canceled","unpaid","paused","incomplete"]);
const iso = (n?: number|null) => n == null ? null : new Date(n*1000).toISOString();
export async function applyVerifiedLdrOneSubscriptionEvent(db: Db, rowId: string, event: Event) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rowId)
    || !/^evt_[A-Za-z0-9]+$/.test(event.id)
    || !Number.isSafeInteger(event.created) || event.created <= 0
    || !/^sub_[A-Za-z0-9]+$/.test(event.stripeSubscriptionId)
    || !allowed.has(event.status)
    || [event.periodStart,event.periodEnd].some(n=>n != null && (!Number.isSafeInteger(n)||n<=0))
    || (event.periodStart != null && event.periodEnd != null && event.periodEnd <= event.periodStart))
    throw new Error("Invalid verified LDR ONE event");
  const {data,error}=await db.rpc("ldr_one_apply_ordered_subscription",{
    p_subscription_id:rowId,p_event_id:event.id,p_event_created:event.created,
    p_status:event.status,p_stripe_subscription_id:event.stripeSubscriptionId,
    p_stripe_customer_id:event.stripeCustomerId??null,
    p_stripe_checkout_session_id:event.stripeCheckoutSessionId??null,
    p_period_start:iso(event.periodStart),p_period_end:iso(event.periodEnd),
    p_cancel_at_period_end:event.cancelAtPeriodEnd??null,
  });
  if(error) throw new Error(error.message??"LDR ONE atomic update failed");
  if(!["applied","duplicate","stale","reconcile"].includes(String(data)))
    throw new Error("Unexpected LDR ONE atomic update result");
  if(data==="reconcile") throw new Error("LDR ONE event requires Stripe reconciliation");
  return data as "applied"|"duplicate"|"stale";
}

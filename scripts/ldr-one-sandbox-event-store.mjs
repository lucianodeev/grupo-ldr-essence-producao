// Transactional sandbox event persistence. Caller MUST verify Stripe signature and livemode=false.
// The caller supplies an already authenticated/verified event and trusted subscription ID.
// No Stripe live key, no browser DB access, and no writes to production tables.
const allowed = new Map([["customer.subscription.deleted", "canceled"]]);
const statuses = new Set(["active","trialing","past_due","canceled","unpaid","paused","incomplete"]);
export async function applyVerifiedSandboxEvent(client, event, recordId, customerId) {
  if (event?.livemode !== false || !/^evt_[A-Za-z0-9]+$/.test(event?.id ?? "")) throw Error("Verified test event required");
  if (!Number.isSafeInteger(event.created) || event.created < 1) throw Error("Valid Stripe event timestamp required");
  // Enforce lifecycle-only at the persistence layer as well as the webhook bridge.
  // Checkout and invoice metadata alone are not authoritative for access grants.
  if (!["customer.subscription.created","customer.subscription.updated","customer.subscription.deleted"].includes(event.type)) return {handled:false};
  const meta = event.data?.object?.metadata ?? {};
  if (meta.sandbox !== "true" || meta.checkout_kind !== "ldr_one_subscription" ||
      meta.ldr_one_subscription_id !== recordId || meta.customer_id !== customerId) throw Error("Event ownership mismatch");
  const obj = event.data.object;
  if (!/^sub_[A-Za-z0-9]+$/.test(obj.id??"")) throw Error("Verified Stripe subscription ID required");
  const stripeSub = obj.id;
  let next = allowed.get(event.type);
  if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated") next = statuses.has(obj.status) ? obj.status : undefined;
  if (!next) return {handled:false};
  await client.query("BEGIN");
  try {
    const row = await client.query("SELECT id, customer_id, stripe_subscription_id, last_stripe_event_created FROM public.ldr_one_sandbox_subscriptions WHERE id=$1 FOR UPDATE",[recordId]);
    const current = row.rows[0];
    if (!current || current.customer_id !== customerId) throw Error("Subscription ownership mismatch");
    if (current.stripe_subscription_id && stripeSub && current.stripe_subscription_id !== stripeSub) throw Error("Stripe subscription mismatch");
    const inserted = await client.query(
      "INSERT INTO public.ldr_one_sandbox_stripe_events(stripe_event_id,stripe_event_created,subscription_id,event_type) VALUES($1,$2,$3,$4) ON CONFLICT DO NOTHING RETURNING stripe_event_id",
      [event.id,event.created,recordId,event.type]);
    if (!inserted.rowCount) { await client.query("COMMIT"); return {handled:true,duplicate:true}; }
    if (event.created < Number(current.last_stripe_event_created)) {
      await client.query("COMMIT");
      return {handled:true,stale:true};
    }
    await client.query(
      "UPDATE public.ldr_one_sandbox_subscriptions SET status=$1,stripe_subscription_id=COALESCE(stripe_subscription_id,$2),last_stripe_event_created=$3,updated_at=now() WHERE id=$4",
      [next,stripeSub || null,event.created,recordId]);
    await client.query("COMMIT");
    return {handled:true,status:next};
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  }
}

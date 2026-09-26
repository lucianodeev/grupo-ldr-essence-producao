import type { BusinessSeatSubscription } from "@/lib/ldr-one-business-seat-policy";

/** Preflight only; the locked database RPC must recheck this before assigning. */
export function eligibleForLdrOneSeatAllocation(subscription: BusinessSeatSubscription, now: number): boolean {
  const expiry = subscription.current_period_end ? Date.parse(subscription.current_period_end) : NaN;
  return subscription.ldr_one_offer === "business" &&
    Number.isSafeInteger(subscription.ldr_one_seats) &&
    (subscription.ldr_one_seats ?? 0) >= 5 &&
    Boolean(subscription.stripe_subscription_id) &&
    ["active", "trialing"].includes(subscription.status) &&
    Number.isFinite(expiry) && expiry > now;
}

/** Pure, fail-closed policy. This does NOT assign seats or grant access without a persisted allocation. */
export type BusinessSeatSubscription = {
  status: string;
  stripe_subscription_id: string | null;
  current_period_end: string | null;
  ldr_one_offer: string | null;
  ldr_one_seats: number | null;
};
export type BusinessSeatAllocation = {
  subscription_id: string;
  auth_user_id: string;
  revoked_at: string | null;
};
export function canAccessLdrOneBusinessSeat(
  subscription: BusinessSeatSubscription,
  allocation: BusinessSeatAllocation | null,
  subscriptionId: string,
  authUserId: string,
  now: number,
): boolean {
  if (!allocation || allocation.subscription_id !== subscriptionId ||
      allocation.auth_user_id !== authUserId || allocation.revoked_at !== null) return false;
  if (subscription.ldr_one_offer !== "business" ||
      !Number.isSafeInteger(subscription.ldr_one_seats) ||
      (subscription.ldr_one_seats ?? 0) < 5 ||
      !subscription.stripe_subscription_id ||
      !["active", "trialing"].includes(subscription.status) ||
      !subscription.current_period_end) return false;
  const end = Date.parse(subscription.current_period_end);
  return Number.isFinite(end) && end > now;
}

/** Advisory pure validation; concurrency-safe allocation still requires a DB transaction. */
export function canAllocateBusinessSeat(
  purchasedSeats: number,
  activeAssignedUserIds: readonly string[],
  candidateAuthUserId: string,
): boolean {
  if (!Number.isSafeInteger(purchasedSeats) || purchasedSeats < 5 || !candidateAuthUserId.trim()) return false;
  const unique = new Set(activeAssignedUserIds);
  if (unique.size !== activeAssignedUserIds.length) return false;
  return unique.has(candidateAuthUserId) || unique.size < purchasedSeats;
}

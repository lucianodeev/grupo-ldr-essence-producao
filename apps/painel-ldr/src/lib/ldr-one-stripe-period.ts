/** Stripe invoices may carry the subscription billing period on their line items,
 * rather than the invoice root. Never use the invoice's own service period blindly.
 */
export function ldrOneBillingPeriodFromStripeObject(object: {
  current_period_start?: number;
  current_period_end?: number;
  lines?: { data?: Array<{ period?: { start?: number; end?: number }; subscription?: string | { id?: string } | null; parent?: { subscription_item_details?: { subscription?: string | { id?: string } | null } } }> };
}, subscriptionId: string | null): { start: number | null; end: number | null } {
  const valid = (n: unknown): n is number => typeof n === "number" && Number.isSafeInteger(n) && n > 0;
  if (valid(object.current_period_end)) {
    const start = valid(object.current_period_start) ? object.current_period_start : null;
    if (start !== null && object.current_period_end <= start) return { start: null, end: null };
    return { start, end: object.current_period_end };
  }
  if (!subscriptionId) return { start: null, end: null };
  const id = (value: string | { id?: string } | null | undefined) =>
    typeof value === "string" ? value : value?.id ?? null;
  const matches = (object.lines?.data ?? []).filter(line =>
    id(line.subscription) === subscriptionId ||
    id(line.parent?.subscription_item_details?.subscription) === subscriptionId,
  );
  if (matches.length !== 1 || !valid(matches[0].period?.end)) return { start: null, end: null };
  if (valid(matches[0].period?.start) && matches[0].period!.end! <= matches[0].period!.start!)
    return { start: null, end: null };
  return {
    start: valid(matches[0].period?.start) ? matches[0].period!.start! : null,
    end: matches[0].period!.end!,
  };
}

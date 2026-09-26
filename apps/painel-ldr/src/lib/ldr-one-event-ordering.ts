/** Offline proposal for per-subscription event ordering; not wired to the shared webhook.
 * A real deployment also needs atomic database claim/update and Stripe reconciliation.
 */
export type LdrOneEventCursor = { created: number; eventId: string };
export type LdrOneOrderingDecision = "apply" | "duplicate" | "stale" | "reconcile";

export function ldrOneEventOrderingDecision(
  current: LdrOneEventCursor | null,
  incoming: LdrOneEventCursor,
): LdrOneOrderingDecision {
  const valid = (cursor: LdrOneEventCursor) =>
    Number.isSafeInteger(cursor.created) && cursor.created > 0 &&
    typeof cursor.eventId === "string" && cursor.eventId.startsWith("evt_") && cursor.eventId.length > 4;
  if (!valid(incoming) || (current !== null && !valid(current))) return "reconcile";
  if (current === null) return "apply";
  if (incoming.eventId === current.eventId) return "duplicate";
  if (incoming.created < current.created) return "stale";
  // Stripe events can share the same second. Do not order them lexicographically.
  if (incoming.created === current.created) return "reconcile";
  return "apply";
}

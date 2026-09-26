/** LDR ONE-only adapter for the staged durable webhook inbox.
 * DO NOT call from the shared Stripe route until isolated Postgres and Stripe
 * sandbox tests pass and the staged migration is approved and installed.
 */
type Database = {
  rpc: (name: string, args: Record<string, unknown>) => Promise<{
    data: unknown;
    error: { message?: string } | null;
  }>;
};
type ClaimResult = { decision: "claim"; token: string } |
  { decision: "acknowledge" | "retry_later" | "reject"; token: null };

export async function claimLdrOneWebhookEvent(
  db: Database, eventId: string, eventType: string,
): Promise<ClaimResult> {
  if (!/^evt_[A-Za-z0-9]+$/.test(eventId) || !eventType.trim())
    throw new Error("Invalid LDR ONE webhook event identity");
  const { data, error } = await db.rpc("ldr_one_claim_webhook_event", {
    p_event_id: eventId, p_event_type: eventType, p_max_attempts: 10,
  });
  if (error) throw new Error(error.message ?? "LDR ONE event claim failed");
  if (!Array.isArray(data) || data.length !== 1)
    throw new Error("Invalid LDR ONE claim RPC response");
  const row = data[0] as { decision?: unknown; token?: unknown };
  if (row.decision === "claim" && typeof row.token === "string" &&
      /^[0-9a-f-]{36}$/i.test(row.token))
    return { decision: "claim", token: row.token };
  if (row.token == null && (row.decision === "acknowledge" ||
      row.decision === "retry_later" || row.decision === "reject"))
    return { decision: row.decision, token: null };
  throw new Error("Invalid LDR ONE claim RPC decision");
}

export async function finishLdrOneWebhookEvent(
  db: Database, eventId: string, token: string, success: boolean,
  errorMessage?: string,
): Promise<void> {
  const { data, error } = await db.rpc("ldr_one_finish_webhook_event", {
    p_event_id: eventId, p_token: token, p_success: success,
    p_error: success ? null : (errorMessage ?? "handler failed").slice(0, 500),
  });
  if (error) throw new Error(error.message ?? "LDR ONE completion RPC failed");
  if (data !== true) throw new Error("LDR ONE webhook claim lost or expired");
}

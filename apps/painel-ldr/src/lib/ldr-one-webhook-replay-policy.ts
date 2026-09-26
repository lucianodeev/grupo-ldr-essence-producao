/** Offline policy for a durable Stripe event inbox. Not connected to the shared webhook.
 * The database must atomically claim an event and enforce a processing lease.
 */
export type WebhookEventRecord = {
  state: "received" | "processing" | "completed" | "failed";
  leaseExpiresAt: number | null;
  attempts: number;
};
export type WebhookReplayDecision = "claim" | "acknowledge" | "retry_later" | "reject";

export function decideWebhookReplay(
  record: WebhookEventRecord | null,
  now: number,
  maxAttempts = 10,
): WebhookReplayDecision {
  if (!Number.isSafeInteger(now) || now <= 0 ||
      !Number.isSafeInteger(maxAttempts) || maxAttempts < 1) return "reject";
  if (record === null) return "claim";
  if (!Number.isSafeInteger(record.attempts) || record.attempts < 0) return "reject";
  if (record.state === "completed") return "acknowledge";
  if (record.attempts >= maxAttempts) return "reject";
  if (record.state === "received" || record.state === "failed") return "claim";
  if (record.state !== "processing") return "reject";
  if (record.leaseExpiresAt === null ||
      !Number.isSafeInteger(record.leaseExpiresAt) || record.leaseExpiresAt <= 0)
    return "reject";
  return record.leaseExpiresAt <= now ? "claim" : "retry_later";
}

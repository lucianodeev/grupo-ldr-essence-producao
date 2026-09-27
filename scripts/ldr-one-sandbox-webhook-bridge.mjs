// Bridge for signed Stripe test events to isolated PostgreSQL.
// Import only AFTER verifying Stripe signature on the raw request body.
import { applyVerifiedSandboxEvent } from "./ldr-one-sandbox-event-store.mjs";
export function resolveSandboxEventIdentity(event) {
  if (event?.livemode !== false) throw Error("Live events forbidden");
  const obj = event?.data?.object;
  if (!obj || typeof obj !== "object") throw Error("Stripe event object required");
  const metadata = obj.metadata ?? {};
  if (metadata.sandbox !== "true" || metadata.checkout_kind !== "ldr_one_subscription") return null;
  const recordId = metadata.ldr_one_subscription_id;
  const customerId = metadata.customer_id;
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuid.test(recordId ?? "") || !uuid.test(customerId ?? "")) throw Error("Invalid sandbox ownership IDs");
  return { recordId, customerId };
}
export async function processSignedSandboxEvent(client, event) {
  const identity = resolveSandboxEventIdentity(event);
  if (!identity) return { handled: false };
  return applyVerifiedSandboxEvent(client, event, identity.recordId, identity.customerId);
}

import assert from "node:assert/strict";
import test from "node:test";
import { claimLdrOneWebhookEvent, finishLdrOneWebhookEvent } from "./ldr-one-webhook-inbox.server.ts";

test("claim returns unique token only when database grants claim", async () => {
  const db = { rpc: async () => ({ data: [{ decision: "claim", token: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee" }], error: null }) };
  assert.deepEqual(await claimLdrOneWebhookEvent(db, "evt_abc123", "invoice.payment_succeeded"),
    { decision: "claim", token: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee" });
});
test("in-flight event cannot be acknowledged as completed", async () => {
  const db = { rpc: async () => ({ data: [{ decision: "retry_later", token: null }], error: null }) };
  assert.deepEqual(await claimLdrOneWebhookEvent(db, "evt_abc123", "invoice.payment_succeeded"),
    { decision: "retry_later", token: null });
});
test("malformed and failed database claims fail closed", async () => {
  const bad = { rpc: async () => ({ data: [{ decision: "claim", token: null }], error: null }) };
  await assert.rejects(claimLdrOneWebhookEvent(bad, "evt_abc123", "invoice.payment_succeeded"));
  await assert.rejects(claimLdrOneWebhookEvent(bad, "bad", "invoice.payment_succeeded"));
  const broken = { rpc: async () => ({ data: null, error: { message: "database offline" } }) };
  await assert.rejects(claimLdrOneWebhookEvent(broken, "evt_abc123", "invoice.payment_succeeded"), /database offline/);
});
test("completion must be confirmed by database, never inferred", async () => {
  const ok = { rpc: async () => ({ data: true, error: null }) };
  await finishLdrOneWebhookEvent(ok, "evt_abc123", "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee", true);
  const lost = { rpc: async () => ({ data: false, error: null }) };
  await assert.rejects(finishLdrOneWebhookEvent(lost, "evt_abc123", "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee", true), /lost or expired/);
});

import assert from "node:assert/strict";
import test from "node:test";
import { decideWebhookReplay as decide } from "./ldr-one-webhook-replay-policy.ts";

test("new, received and failed events can be claimed", () => {
  assert.equal(decide(null, 100), "claim");
  assert.equal(decide({ state: "received", leaseExpiresAt: null, attempts: 0 }, 100), "claim");
  assert.equal(decide({ state: "failed", leaseExpiresAt: null, attempts: 2 }, 100), "claim");
});
test("only completed events are acknowledged as duplicates", () => {
  assert.equal(decide({ state: "completed", leaseExpiresAt: null, attempts: 1 }, 100), "acknowledge");
  assert.equal(decide({ state: "processing", leaseExpiresAt: 200, attempts: 1 }, 100), "retry_later");
});
test("expired processing lease permits recovery", () => {
  assert.equal(decide({ state: "processing", leaseExpiresAt: 100, attempts: 1 }, 100), "claim");
  assert.equal(decide({ state: "processing", leaseExpiresAt: 101, attempts: 1 }, 100), "retry_later");
});
test("invalid state or exhausted retries fails closed", () => {
  assert.equal(decide({ state: "failed", leaseExpiresAt: null, attempts: 10 }, 100), "reject");
  assert.equal(decide({ state: "processing", leaseExpiresAt: null, attempts: 1 }, 100), "reject");
  assert.equal(decide({ state: "received", leaseExpiresAt: null, attempts: -1 }, 100), "reject");
  assert.equal(decide(null, 0), "reject");
});

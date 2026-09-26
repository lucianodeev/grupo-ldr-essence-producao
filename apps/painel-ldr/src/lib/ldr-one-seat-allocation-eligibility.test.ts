import assert from "node:assert/strict";
import test from "node:test";
import { eligibleForLdrOneSeatAllocation } from "./ldr-one-seat-allocation-eligibility.ts";

const now = Date.parse("2026-09-26T12:00:00Z");
const sub = { status: "active", stripe_subscription_id: "sub_test", current_period_end: "2026-10-26T12:00:00Z", ldr_one_offer: "business", ldr_one_seats: 5 };
test("only current paid business subscriptions can allocate seats", () => {
  assert.equal(eligibleForLdrOneSeatAllocation(sub, now), true);
  assert.equal(eligibleForLdrOneSeatAllocation({ ...sub, status: "trialing" }, now), true);
  assert.equal(eligibleForLdrOneSeatAllocation({ ...sub, ldr_one_offer: "individual" }, now), false);
  assert.equal(eligibleForLdrOneSeatAllocation({ ...sub, ldr_one_seats: 4 }, now), false);
  assert.equal(eligibleForLdrOneSeatAllocation({ ...sub, status: "canceled" }, now), false);
  assert.equal(eligibleForLdrOneSeatAllocation({ ...sub, stripe_subscription_id: null }, now), false);
  assert.equal(eligibleForLdrOneSeatAllocation({ ...sub, current_period_end: "invalid" }, now), false);
  assert.equal(eligibleForLdrOneSeatAllocation({ ...sub, current_period_end: "2026-09-26T12:00:00Z" }, now), false);
});

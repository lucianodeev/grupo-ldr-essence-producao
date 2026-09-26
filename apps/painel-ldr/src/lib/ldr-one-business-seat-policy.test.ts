import assert from "node:assert/strict";
import test from "node:test";
import { canAccessLdrOneBusinessSeat, canAllocateBusinessSeat } from "./ldr-one-business-seat-policy.ts";

const now = Date.parse("2026-09-26T12:00:00Z");
const sub = { status: "active", stripe_subscription_id: "sub_test", current_period_end: "2026-10-26T12:00:00Z", ldr_one_offer: "business", ldr_one_seats: 5 };
const seat = { subscription_id: "local-sub", auth_user_id: "employee-1", revoked_at: null };
const allowed = (s = sub, a: typeof seat | null = seat, id = "local-sub", user = "employee-1") =>
  canAccessLdrOneBusinessSeat(s, a, id, user, now);

test("LDR ONE business requires an explicit matching, unrevoked employee seat", () => {
  assert.equal(allowed(), true);
  assert.equal(allowed(sub, null), false);
  assert.equal(allowed(sub, { ...seat, revoked_at: "2026-09-26T10:00:00Z" }), false);
  assert.equal(allowed(sub, seat, "other-sub"), false);
  assert.equal(allowed(sub, seat, "local-sub", "other-user"), false);
});
test("LDR ONE business denies inactive, expired and invalid subscriptions", () => {
  for (const status of ["pending", "past_due", "canceled", "paused", "unpaid", "incomplete"])
    assert.equal(allowed({ ...sub, status }), false, status);
  assert.equal(allowed({ ...sub, current_period_end: null }), false);
  assert.equal(allowed({ ...sub, current_period_end: "2026-09-26T12:00:00Z" }), false);
  assert.equal(allowed({ ...sub, stripe_subscription_id: null }), false);
  assert.equal(allowed({ ...sub, ldr_one_offer: "individual" }), false);
  assert.equal(allowed({ ...sub, ldr_one_seats: 4 }), false);
  assert.equal(allowed({ ...sub, status: "trialing" }), true);
});

test("business seat allocation respects capacity and repeat assignments", () => {
  const users = ["a", "b", "c", "d", "e"];
  assert.equal(canAllocateBusinessSeat(5, users, "f"), false);
  assert.equal(canAllocateBusinessSeat(5, users, "e"), true);
  assert.equal(canAllocateBusinessSeat(6, users, "f"), true);
  assert.equal(canAllocateBusinessSeat(4, [], "a"), false);
  assert.equal(canAllocateBusinessSeat(5, ["a", "a"], "b"), false);
  assert.equal(canAllocateBusinessSeat(5, [], ""), false);
});

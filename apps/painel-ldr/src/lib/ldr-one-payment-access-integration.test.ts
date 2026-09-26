import assert from "node:assert/strict";
import test from "node:test";
import { ldrPassStatusFromStripeEvent } from "./ldr-one-stripe-lifecycle.ts";
import { canAccessLdrOneBusinessSeat } from "./ldr-one-business-seat-policy.ts";

const now = Date.parse("2026-09-26T12:00:00Z");
const subscription = {
  status: "pending",
  stripe_subscription_id: "sub_test",
  current_period_end: "2026-10-26T12:00:00Z",
  ldr_one_offer: "business",
  ldr_one_seats: 5,
};
const allocation = { subscription_id: "local-sub", auth_user_id: "employee-1", revoked_at: null };
function allowed(eventType: string, eventObject: { status?: string; payment_status?: string }) {
  return canAccessLdrOneBusinessSeat(
    { ...subscription, status: ldrPassStatusFromStripeEvent(eventType, eventObject) },
    allocation, "local-sub", "employee-1", now,
  );
}

test("business reader denies pending and failed Stripe payment events", () => {
  assert.equal(allowed("checkout.session.completed", { payment_status: "unpaid" }), false);
  assert.equal(allowed("checkout.session.async_payment_failed", {}), false);
  assert.equal(allowed("invoice.payment_failed", {}), false);
  assert.equal(allowed("customer.subscription.updated", { status: "unpaid" }), false);
  assert.equal(allowed("customer.subscription.updated", { status: "paused" }), false);
});

test("business reader requires paid/current subscription and valid allocated seat", () => {
  assert.equal(allowed("checkout.session.completed", { payment_status: "paid" }), true);
  assert.equal(allowed("invoice.payment_succeeded", {}), true);
  assert.equal(allowed("customer.subscription.deleted", {}), false);
  assert.equal(allowed("checkout.session.expired", {}), false);
  assert.equal(canAccessLdrOneBusinessSeat(
    { ...subscription, status: "active", current_period_end: null },
    allocation, "local-sub", "employee-1", now,
  ), false, "payment event alone cannot bypass missing billing period");
});

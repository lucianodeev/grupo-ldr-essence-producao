import assert from "node:assert/strict";
import test from "node:test";
import { ldrOneBillingPeriodFromStripeObject as period } from "./ldr-one-stripe-period.ts";

test("subscription events use explicit current period", () => {
  assert.deepEqual(period({ current_period_start: 100, current_period_end: 200 }, "sub_a"), { start: 100, end: 200 });
});

test("invoice renewals accept only the matching subscription line", () => {
  const invoice = { lines: { data: [
    { subscription: "sub_other", period: { start: 100, end: 999 } },
    { parent: { subscription_item_details: { subscription: "sub_a" } }, period: { start: 200, end: 300 } },
  ] } };
  assert.deepEqual(period(invoice, "sub_a"), { start: 200, end: 300 });
  assert.deepEqual(period(invoice, "sub_unknown"), { start: null, end: null });
  assert.deepEqual(period(invoice, null), { start: null, end: null });
});

test("ambiguous, missing and malformed invoice periods fail closed", () => {
  const line = { subscription: "sub_a", period: { start: 200, end: 300 } };
  assert.deepEqual(period({ lines: { data: [line, line] } }, "sub_a"), { start: null, end: null });
  assert.deepEqual(period({ lines: { data: [{ subscription: "sub_a", period: { end: -1 } }] } }, "sub_a"), { start: null, end: null });
  assert.deepEqual(period({ lines: { data: [{ period: { end: 300 } }] } }, "sub_a"), { start: null, end: null });
});

test("rejects reversed and zero-length periods before persisting", () => {
  assert.deepEqual(period({ current_period_start: 300, current_period_end: 200 }, "sub_a"), { start: null, end: null });
  assert.deepEqual(period({ current_period_start: 300, current_period_end: 300 }, "sub_a"), { start: null, end: null });
  assert.deepEqual(period({ lines: { data: [{ subscription: "sub_a", period: { start: 300, end: 200 } }] } }, "sub_a"), { start: null, end: null });
});

test("invoice cannot override matching subscription line with unrelated root period", () => {
  const invoice = { current_period_start: 100, current_period_end: 999, lines: { data: [
    { subscription: "sub_a", period: { start: 200, end: 300 } },
  ] } };
  assert.deepEqual(period(invoice, "sub_a", "invoice.payment_succeeded"), { start: 200, end: 300 });
  assert.deepEqual(period({ current_period_start: 100, current_period_end: 999 }, "sub_a", "invoice.payment_succeeded"), { start: null, end: null });
});

import assert from "node:assert/strict";
import test from "node:test";
import { ldrPassStatusFromStripeEvent as status } from "./ldr-one-stripe-lifecycle.ts";

test("checkout grants active status only after confirmed payment", () => {
  assert.equal(status("checkout.session.completed", { payment_status: "paid" }), "active");
  assert.equal(status("checkout.session.completed", { payment_status: "no_payment_required" }), "active");
  assert.equal(status("checkout.session.completed", { payment_status: "unpaid" }), "pending");
  assert.equal(status("checkout.session.completed", {}), "pending");
});

test("async payment, renewal failure, cancellation and expiry map safely", () => {
  assert.equal(status("checkout.session.async_payment_succeeded", {}), "active");
  assert.equal(status("checkout.session.async_payment_failed", {}), "incomplete");
  assert.equal(status("invoice.payment_succeeded", {}), "active");
  assert.equal(status("invoice.payment_failed", {}), "past_due");
  assert.equal(status("checkout.session.expired", {}), "canceled");
  assert.equal(status("customer.subscription.deleted", {}), "canceled");
  assert.equal(status("customer.subscription.updated", { status: "trialing" }), "trialing");
  assert.equal(status("customer.subscription.updated", { status: "paused" }), "paused");
  assert.equal(status("customer.subscription.updated", { status: "unknown" }), "incomplete");
});

const test=require("node:test"),assert=require("node:assert/strict");
test("LDR ONE routes invoice.paid only to its own subscription handler", async () => {
  const route = require("./helpers/stripe-routing.cjs");
  const result = await route("invoice.paid", "ldr_pass_subscription", null);
  assert.equal(result.checkoutKind, "ldr_pass_subscription");
  assert.deepEqual(Array.from(result.calls), ["LdrPass"]);
  const renewal = await route("invoice.payment_succeeded", "ldr_pass_subscription", null);
  assert.deepEqual(Array.from(renewal.calls), ["LdrPass"]);
});

test("invoice.paid resolves missing checkout metadata before choosing a handler", async () => {
  const route = require("./helpers/stripe-routing.cjs");
  const result = await route("invoice.paid", undefined, "ldr_pass_subscription");
  assert.deepEqual(Array.from(result.calls), ["resolve", "LdrPass"]);
  const unknown = await route("invoice.paid", undefined, null);
  assert.deepEqual(Array.from(unknown.calls), ["resolve"]);
});

test("company invoice.paid support remains isolated and other products keep their existing event contracts", async () => {
  const route = require("./helpers/stripe-routing.cjs");
  assert.deepEqual(Array.from((await route("invoice.paid", "company_subscription", null)).calls), ["Company"]);
  for (const kind of ["library_subscription", "editorial_subscription", "professional_subscription", "unknown"])
    assert.deepEqual(Array.from((await route("invoice.paid", kind, null)).calls), []);
  assert.deepEqual(Array.from((await route("invoice.payment_failed", "library_subscription", null)).calls), ["Library"]);
  assert.deepEqual(Array.from((await route("customer.subscription.updated", "professional_subscription", null)).calls), ["Professional"]);
});

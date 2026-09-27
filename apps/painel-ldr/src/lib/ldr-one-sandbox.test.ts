import test from "node:test";
import assert from "node:assert/strict";
import { validateOneSelection, sandboxOneConfig } from "./ldr-one-sandbox.ts";
test("four plans have expected amounts and periods", () => {
  for (const [plan, cycle, seats, cents, interval] of [
    ["individual", "monthly", 1, 3990, "month"], ["individual", "annual", 1, 39900, "year"],
    ["business", "monthly", 5, 1990, "month"], ["business", "annual", 5, 19900, "year"]
  ] as const) {
    const result = validateOneSelection({plan, cycle, seats});
    assert.equal(result.cents, cents); assert.equal(result.interval, interval);
    assert.equal(result.totalCents, cents * seats);
  }
});
test("invalid seats and plans are rejected", () => {
  for (const seats of [0, 2, 4, 5.5, 10001]) assert.throws(() => validateOneSelection({plan:"business",cycle:"monthly",seats}));
  assert.throws(() => validateOneSelection({plan:"individual",cycle:"monthly",seats:5}));
});
test("sandbox disabled by default and live keys refused", () => {
  const selection = {plan:"individual",cycle:"monthly",seats:1} as const;
  const env = {LDR_ONE_STRIPE_TEST_SECRET_KEY:"sk_test_abc",LDR_ONE_TEST_PRICE_INDIVIDUAL_MONTHLY:"price_abc"};
  assert.throws(() => sandboxOneConfig(selection,env));
  assert.throws(() => sandboxOneConfig(selection,{...env,LDR_ONE_SANDBOX_CHECKOUT_ENABLED:"true",LDR_ONE_STRIPE_TEST_SECRET_KEY:"sk_live_abc"}));
  assert.deepEqual(sandboxOneConfig(selection,{...env,LDR_ONE_SANDBOX_CHECKOUT_ENABLED:"true"}),{priceId:"price_abc",quantity:1,expectedCents:3990,expectedInterval:"month",currency:"eur"});
});

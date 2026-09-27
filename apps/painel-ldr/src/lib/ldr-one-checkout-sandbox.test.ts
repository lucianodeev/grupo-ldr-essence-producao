import test from "node:test";
import assert from "node:assert/strict";
import { buildOneSandboxCheckout } from "./ldr-one-checkout-sandbox.ts";
const env = {
  LDR_ONE_SANDBOX_CHECKOUT_ENABLED: "true",
  LDR_ONE_STRIPE_TEST_SECRET_KEY: "sk_test_local",
  LDR_ONE_TEST_PRICE_INDIVIDUAL_MONTHLY: "price_local1",
  LDR_ONE_TEST_PRICE_BUSINESS_ANNUAL: "price_local2",
};
const context = {userId:"user-local",customerId:"customer-local",subscriptionRecordId:"record-local",origin:"https://sandbox.example.test"};
test("individual sandbox checkout carries account ownership and test price",()=>{
  const {params}=buildOneSandboxCheckout({plan:"individual",cycle:"monthly",seats:1},context,env);
  assert.equal(params.get("line_items[0][price]"),"price_local1");
  assert.equal(params.get("line_items[0][quantity]"),"1");
  assert.equal(params.get("metadata[checkout_kind]"),"ldr_one_subscription");
  assert.equal(params.get("subscription_data[metadata][customer_id]"),"customer-local");
  assert.equal(params.get("metadata[sandbox]"),"true");
});
test("business requires five seats and bills per seat",()=>{
  assert.throws(()=>buildOneSandboxCheckout({plan:"business",cycle:"annual",seats:4},context,env));
  const {params,price}=buildOneSandboxCheckout({plan:"business",cycle:"annual",seats:5},context,env);
  assert.equal(params.get("line_items[0][quantity]"),"5");
  assert.equal(price.expectedCents,19900);
});
test("missing identity, unsafe origins and disabled flag fail closed",()=>{
  const selection={plan:"individual",cycle:"monthly",seats:1} as const;
  assert.throws(()=>buildOneSandboxCheckout(selection,{...context,customerId:""},env));
  assert.throws(()=>buildOneSandboxCheckout(selection,{...context,origin:"http://example.test"},env));
  assert.throws(()=>buildOneSandboxCheckout(selection,context,{...env,LDR_ONE_SANDBOX_CHECKOUT_ENABLED:"false"}));
});

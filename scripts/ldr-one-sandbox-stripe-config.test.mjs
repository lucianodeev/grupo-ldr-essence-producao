import test from "node:test";import assert from "node:assert/strict";
import {resolveSandboxStripeConfig,verifySandboxPrice} from "./ldr-one-sandbox-stripe-config.mjs";
const selection={plan:"business",cycle:"annual"};
const env={LDR_ONE_STRIPE_TEST_SECRET_KEY:"sk_test_dummy123",LDR_ONE_TEST_PRICE_BUSINESS_ANNUAL:"price_dummy123"};
test("only test-mode secret and correct plan-specific price variable accepted",()=>{
 assert.equal(resolveSandboxStripeConfig(env,selection).priceId,"price_dummy123");
 assert.throws(()=>resolveSandboxStripeConfig({...env,LDR_ONE_STRIPE_TEST_SECRET_KEY:"sk_live_dummy123"},selection),/TEST secret/);
 assert.throws(()=>resolveSandboxStripeConfig({...env,LDR_ONE_TEST_PRICE_BUSINESS_ANNUAL:undefined},selection),/TEST price/);
});
test("actual Stripe price must match test mode, EUR, amount and billing period",async()=>{
 const fetcher=async()=>({ok:true,json:async()=>({livemode:false,active:true,currency:"eur",unit_amount:19900,recurring:{interval:"year",interval_count:1}})});
 assert.equal(await verifySandboxPrice({secret:env.LDR_ONE_STRIPE_TEST_SECRET_KEY,priceId:"price_dummy123",selection,fetcher}),true);
 await assert.rejects(()=>verifySandboxPrice({secret:env.LDR_ONE_STRIPE_TEST_SECRET_KEY,priceId:"price_dummy123",selection,fetcher:async()=>({ok:true,json:async()=>({livemode:true,active:true,currency:"eur",unit_amount:19900,recurring:{interval:"year",interval_count:1}})})}),/mismatch/);
});

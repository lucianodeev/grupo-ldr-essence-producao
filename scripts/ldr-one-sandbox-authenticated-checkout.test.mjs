import test from "node:test";import assert from "node:assert/strict";
import {handleAuthenticatedSandboxCheckout} from "./ldr-one-sandbox-authenticated-checkout.mjs";
import {getSandboxCustomerSubscriptions} from "./ldr-one-sandbox-customer-subscriptions.mjs";
const origin="https://ldr-one-stripe-sandbox.onrender.com";
const env={RENDER_SERVICE_ID:"srv-das6drvavr4c7397dflg",LDR_ONE_SANDBOX_CHECKOUT_ENABLED:"true",LDR_ONE_STRIPE_TEST_SECRET_KEY:"sk_test_dummy123",LDR_ONE_TEST_PRICE_INDIVIDUAL_MONTHLY:"price_dummy123"};
const identity={verified:true,userId:"e49bc51e-2af6-4c3d-a91e-a713e1ed69cb",customerId:"1e2f550b-a4c1-4788-8d34-f0b159c0dc41"};
const request=body=>new Request(origin+"/internal/checkout",{method:"POST",headers:{origin,"content-type":"application/json"},body:JSON.stringify(body)});
test("checkout disabled by default and unverified identity rejected before Stripe",async()=>{
 let called=false;
 const args={request:request({plan:"individual",cycle:"monthly",seats:1}),authenticate:async()=>null,db:{},stripe:async()=>{called=true;},env:{}};
 assert.equal((await handleAuthenticatedSandboxCheckout(args)).status,503);
 assert.equal((await handleAuthenticatedSandboxCheckout({...args,env})).status,401);
 assert.equal(called,false);
});
test("identity spoofing and invalid price rejected before DB write",async()=>{
 let touched=false;
 const args={request:request({plan:"individual",cycle:"monthly",seats:1,userId:identity.userId}),authenticate:async()=>identity,db:{query:async()=>{touched=true;}},stripe:async()=>{},env};
 assert.equal((await handleAuthenticatedSandboxCheckout(args)).status,400);
 assert.equal(touched,false);
 const fetcher=async()=>({ok:true,json:async()=>({livemode:true})});
 assert.equal((await handleAuthenticatedSandboxCheckout({...args,request:request({plan:"individual",cycle:"monthly",seats:1}),fetcher})).status,503);
 assert.equal(touched,false);
});
test("customer subscription status is parameterized, scoped and omits Stripe identifiers",async()=>{
 let args;
 const db={query:async(sql,values)=>{args={sql,values};return {rows:[{id:"abc",plan:"individual",billing_cycle:"monthly",seats:1,status:"pending",stripe_subscription_id:"sub_private"}]};}};
 await assert.rejects(()=>getSandboxCustomerSubscriptions({db,identity:{...identity,verified:false}}),/Authenticated/);
 const rows=await getSandboxCustomerSubscriptions({db,identity});
 assert.deepEqual(args.values,[identity.userId,identity.customerId]);
 assert.match(args.sql,/user_id=\$1 AND customer_id=\$2/);
 assert.equal(rows[0].stripe_subscription_id,undefined);
});

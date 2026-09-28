import test from "node:test";
import assert from "node:assert/strict";
import {prepareSandboxCheckout} from "./ldr-one-sandbox-checkout-service.mjs";
const auth={userId:"e49bc51e-2af6-4c3d-a91e-a713e1ed69cb",customerId:"1e2f550b-a4c1-4788-8d34-f0b159c0dc41",email:"test@example.invalid"};
const base={authenticated:auth,selection:{plan:"business",cycle:"monthly",seats:5},priceId:"price_test123",origin:"https://sandbox.example.test"};
test("pending DB row precedes Stripe session and stores returned test session",async()=>{
 const calls=[];const db={query:async(sql,args)=>{calls.push({sql,args});return {rowCount:1};}};
 const stripe=async (params,options)=>{assert.match(options.idempotencyKey,/^ldr-one-sandbox-[0-9a-f-]+$/);assert.equal(calls.length,1);assert.equal(params.get("metadata[customer_id]"),auth.customerId);assert.equal(params.get("line_items[0][quantity]"),"5");return {livemode:false,id:"cs_test_123",mode:"subscription",status:"open",url:"https://checkout.stripe.com/test"};};
 const result=await prepareSandboxCheckout({...base,db,stripe});
 assert.equal(result.sessionId,"cs_test_123");assert.equal(calls.length,2);assert.match(calls[1].sql,/UPDATE/);
});
test("unauthenticated, invalid seats and live-mode session fail closed",async()=>{
 const db={query:async()=>({rowCount:1})};
 await assert.rejects(()=>prepareSandboxCheckout({...base,authenticated:null,db,stripe:async()=>{throw Error("called");}}),/Verified/);
 await assert.rejects(()=>prepareSandboxCheckout({...base,selection:{plan:"business",cycle:"monthly",seats:1},db,stripe:async()=>{throw Error("called");}}),/Invalid plan/);
 const sql=[];const tracking={query:async(q)=>{sql.push(q);return {rowCount:1};}};
 await assert.rejects(()=>prepareSandboxCheckout({...base,db:tracking,stripe:async()=>({livemode:true,id:"cs_live_123",mode:"subscription",status:"open",url:"https://example.test"})}),/Unexpected/);
 assert.equal(sql.length,1); // Potential Stripe session retained for reconciliation.
});
test("existing Stripe customer suppresses email",async()=>{
 const db={query:async()=>({rowCount:1})};
 await prepareSandboxCheckout({...base,authenticated:{...auth,stripeCustomerId:"cus_test123"},db,stripe:async params=>{
 assert.equal(params.get("customer"),"cus_test123");assert.equal(params.has("customer_email"),false);
 return {livemode:false,id:"cs_test_456",mode:"subscription",status:"open",url:"https://checkout.stripe.com/test"};
 }});
});

test("ambiguous Stripe timeout preserves pending row and stable idempotency key",async()=>{const calls=[];let key;const db={query:async sql=>{calls.push(sql);return {rowCount:1};}};await assert.rejects(()=>prepareSandboxCheckout({...base,db,stripe:async(_params,options)=>{key=options.idempotencyKey;throw Error("network timeout");}}),/network timeout/);assert.match(key,/^ldr-one-sandbox-/);assert.equal(calls.length,1);});
test("rejects arbitrary checkout redirects before returning them",async()=>{const db={query:async()=>({rowCount:1})};await assert.rejects(()=>prepareSandboxCheckout({...base,db,stripe:async()=>({livemode:false,id:"cs_test_abc",mode:"subscription",status:"open",url:"https://not-stripe.example/test"})}),/checkout URL/);});

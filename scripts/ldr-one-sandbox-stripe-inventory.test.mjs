import test from "node:test";
import assert from "node:assert/strict";
import {inventorySandboxStripe} from "./ldr-one-sandbox-stripe-inventory.mjs";
const env={RENDER_SERVICE_ID:"srv-das6drvavr4c7397dflg",LDR_ONE_SANDBOX_STRIPE_INVENTORY:"yes",LDR_ONE_STRIPE_TEST_SECRET_KEY:"sk_test_dummy"};
test("inventory fails closed without explicit isolated sandbox flag",async()=>{
 let touched=false;
 await assert.rejects(inventorySandboxStripe({env:{...env,LDR_ONE_SANDBOX_STRIPE_INVENTORY:"no"},fetcher:async()=>{touched=true;}}));
 assert.equal(touched,false);
});
test("inventory reads only GET resources and flags orphaned test subscriptions",async()=>{
 const calls=[],logs=[];
 const fetcher=async(url,options)=>{
  calls.push({url,options});
  const data=url.includes("/customers?")?{data:[{id:"cus_test",livemode:false,metadata:{ldr_one_sandbox_probe:"true"}}],has_more:false}:{data:[{id:"sub_test",status:"incomplete"}],has_more:false};
  return {ok:true,json:async()=>data};
 };
 const result=await inventorySandboxStripe({env,fetcher,log:x=>logs.push(x)});
 assert.equal(result.probeCustomers,1);
 assert.equal(result.subscriptionsRequiringReview,1);
 assert.equal(calls.length,2);
 assert.ok(calls.every(c=>!c.options.method||c.options.method==="GET"));
 assert.ok(logs.some(x=>x.includes("sub_test")));
});

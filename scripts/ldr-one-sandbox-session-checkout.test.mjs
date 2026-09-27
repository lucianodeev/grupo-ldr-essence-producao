import test from "node:test";
import assert from "node:assert/strict";
import {handleSessionBoundSandboxCheckout} from "./ldr-one-sandbox-session-checkout.mjs";
const origin="https://ldr-one-stripe-sandbox.onrender.com";
const env={RENDER_SERVICE_ID:"srv-das6drvavr4c7397dflg",LDR_ONE_SANDBOX_LOCAL_AUTH_ENABLED:"true",LDR_ONE_SANDBOX_SESSION_ENABLED:"true",LDR_ONE_SANDBOX_CHECKOUT_ENABLED:"true"};
function request(headers={}){return new Request(origin+"/internal/checkout",{method:"POST",headers:{origin,"content-type":"application/json","x-ldr-one-csrf":"1",...headers},body:JSON.stringify({plan:"individual",cycle:"monthly"})});}
test("session-bound checkout fails closed without session and never contacts Stripe",async()=>{
 let calls=0;const stripe=async()=>{calls++;throw Error("Should not reach Stripe");};
 const db={query:async()=>({rows:[]})};
 assert.equal((await handleSessionBoundSandboxCheckout({request:request(),db,env,stripe})).status,401);
 assert.equal((await handleSessionBoundSandboxCheckout({request:request({cookie:"ldr_one_sandbox_session=invalid"}),db,env,stripe})).status,401);
 assert.equal((await handleSessionBoundSandboxCheckout({request:request({"x-ldr-one-csrf":"0"}),db,env,stripe})).status,403);
 assert.equal((await handleSessionBoundSandboxCheckout({request:request(),db,env:{...env,LDR_ONE_SANDBOX_CHECKOUT_ENABLED:"false"},stripe})).status,503);
 assert.equal(calls,0);
});

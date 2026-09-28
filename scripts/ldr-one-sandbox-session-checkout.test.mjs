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

test("verified private session creates only Stripe TEST checkout for its server-resolved customer",async()=>{
 const {hashSandboxPassword}=await import("./ldr-one-sandbox-local-auth.mjs");
 const {loginInvitedSandboxUser}=await import("./ldr-one-sandbox-login-service.mjs");
 const user="e49bc51e-2af6-4c3d-a91e-a713e1ed69cb",customer="1e2f550b-a4c1-4788-8d34-f0b159c0dc41";
 const fullEnv={...env,LDR_ONE_STRIPE_TEST_SECRET_KEY:"sk_test_dummy123",LDR_ONE_TEST_PRICE_INDIVIDUAL_MONTHLY:"price_dummy123"};
 const password="isolated-session-checkout-password-123",password_hash=await hashSandboxPassword(password);
 let session,checkout,callCount=0;
 const db={query:async(sql,args)=>{
  if(sql.includes("FROM public.ldr_one_sandbox_invited_users"))return {rows:[{user_id:user,customer_id:customer,password_hash}]};
  if(sql.includes("FROM public.ldr_one_sandbox_customer_members"))return {rows:[{customer_id:customer}]};
  if(sql.startsWith("INSERT INTO public.ldr_one_sandbox_sessions")){session={tokenHash:args[0],user_id:args[1],customer_id:args[2],expires_at:args[3]};return {rows:[]};}
  if(sql.startsWith("SELECT user_id,customer_id,expires_at"))return {rows:session&&session.tokenHash===args[0]?[session]:[]};
  if(sql.startsWith("INSERT INTO public.ldr_one_sandbox_subscriptions")){checkout={id:args[0],customerId:args[1],userId:args[2],plan:args[3],seats:args[5]};return {rows:[],rowCount:1};}
  if(sql.startsWith("UPDATE public.ldr_one_sandbox_subscriptions"))return {rows:[{id:args[1]}],rowCount:1};
  throw Error("Unexpected query");
 }};
 const login=await loginInvitedSandboxUser({email:"test@example.com",password,db,env:fullEnv});
 const stripe=async(params)=>{callCount++;assert.equal(params.get("metadata[customer_id]"),customer);assert.equal(params.get("client_reference_id"),user);return {livemode:false,id:"cs_test_dummy123",mode:"subscription",status:"open",url:"https://checkout.stripe.com/c/pay/cs_test_dummy123"};};
 const fetcher=async()=>({ok:true,json:async()=>({livemode:false,active:true,currency:"eur",unit_amount:3990,recurring:{interval:"month",interval_count:1}})});
 const req=new Request(origin+"/internal/checkout",{method:"POST",headers:{origin,"content-type":"application/json","x-ldr-one-csrf":"1",cookie:"ldr_one_sandbox_session="+login.token},body:JSON.stringify({plan:"individual",cycle:"monthly",seats:1})});
 const result=await handleSessionBoundSandboxCheckout({request:req,db,env:fullEnv,stripe,fetcher});
 assert.equal(result.status,200);assert.equal(result.body.url,"https://checkout.stripe.com/c/pay/cs_test_dummy123");assert.equal(checkout.customerId,customer);assert.equal(checkout.userId,user);assert.equal(checkout.seats,1);assert.equal(callCount,1);
});

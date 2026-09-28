// One-shot isolated integration: pending DB row -> real Stripe TEST Checkout -> expire -> cleanup.
// Never serves a checkout URL, charges a card, or grants an entitlement.
import {randomUUID} from "node:crypto";
import {prepareSandboxCheckout} from "./ldr-one-sandbox-checkout-service.mjs";
import {resolveSandboxStripeConfig,verifySandboxPrice} from "./ldr-one-sandbox-stripe-config.mjs";
const service="srv-das6drvavr4c7397dflg";
if(process.env.LDR_ONE_SANDBOX_CHECKOUT_INTEGRATION!=="yes"||process.env.RENDER_SERVICE_ID!==service)throw Error("Sandbox-only integration guard");
const selection={plan:"individual",cycle:"monthly",seats:1};
const {secret:key,priceId}=resolveSandboxStripeConfig(process.env,selection);
const dbUrl=new URL(process.env.DATABASE_URL??"");
if(!["postgres:","postgresql:"].includes(dbUrl.protocol)||decodeURIComponent(dbUrl.pathname.slice(1))!=="ldr_one_sandbox_db")throw Error("Wrong database");
const {default:pg}=await import(process.env.LDR_ONE_PG_MODULE_URL||"pg");
const pool=new pg.Pool({connectionString:process.env.DATABASE_URL,max:1,connectionTimeoutMillis:5000});
const customerId=randomUUID(),userId=randomUUID();
let recordId=null,sessionId=null;
async function stripe(path,params,options={}){
 const response=await fetch("https://api.stripe.com/v1/"+path,{method:params?"POST":"GET",headers:{Authorization:"Bearer "+key,...(params?{"Content-Type":"application/x-www-form-urlencoded"}:{}),...(options.idempotencyKey?{"Idempotency-Key":options.idempotencyKey}:{})},body:params,signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw Error("Stripe TEST API failed HTTP "+response.status);
 return response.json();
}
try{
 await verifySandboxPrice({secret:key,priceId,selection});
 const db=await pool.connect();
 try{
  const result=await prepareSandboxCheckout({db,authenticated:{customerId,userId},selection,priceId,origin:"https://ldr-one-stripe-sandbox.onrender.com",stripe:async (params,options)=>{
   const created=await stripe("checkout/sessions",params,options);
   sessionId=created.id;
   return created;
  }});
  recordId=result.recordId;
  if(result.sessionId!==sessionId)throw Error("Stripe session mismatch");
  const row=await db.query("SELECT status,stripe_checkout_session_id FROM public.ldr_one_sandbox_subscriptions WHERE id=$1",[recordId]);
  if(row.rows[0]?.status!=="pending"||row.rows[0]?.stripe_checkout_session_id!==sessionId)throw Error("Pending record verification failed");
  const expired=await stripe("checkout/sessions/"+encodeURIComponent(sessionId)+"/expire",new URLSearchParams());
  if(expired.status!=="expired")throw Error("Stripe test session expiration failed");
  sessionId=null;
  console.log("LDR ONE SANDBOX REAL TEST CHECKOUT DB INTEGRATION VERIFIED");
 }finally{db.release();}
}catch{
 console.error("LDR ONE SANDBOX REAL TEST CHECKOUT DB INTEGRATION FAILED");
 process.exitCode=1;
}finally{
 if(sessionId){
  try{const expired=await stripe("checkout/sessions/"+encodeURIComponent(sessionId)+"/expire",new URLSearchParams());if(expired.status==="expired")sessionId=null;}
  catch{console.error("TEST SESSION MAY REQUIRE MANUAL EXPIRATION");process.exitCode=1;}
 }
 try{
  await pool.query("DELETE FROM public.ldr_one_sandbox_stripe_events WHERE subscription_id IN (SELECT id FROM public.ldr_one_sandbox_subscriptions WHERE customer_id=$1 AND user_id=$2)",[customerId,userId]);
  await pool.query("DELETE FROM public.ldr_one_sandbox_subscriptions WHERE customer_id=$1 AND user_id=$2",[customerId,userId]);
  console.log("LDR ONE SANDBOX REAL TEST CHECKOUT CLEANUP VERIFIED");
 }catch{console.error("Sandbox cleanup failed");process.exitCode=1;}
 await pool.end();
}

// One-shot: real Stripe TEST incomplete subscription -> signed Stripe webhook -> private DB.
// No payment method; incomplete status MUST NOT grant access. Cancel and remove disposable resources.
import {randomUUID} from "node:crypto";
import {checkSandboxEntitlement} from "./ldr-one-sandbox-entitlement-gate.mjs";
export async function probeRealStripeWebhook({db,env}){
 if(env.RENDER_SERVICE_ID!=="srv-das6drvavr4c7397dflg"||env.LDR_ONE_SANDBOX_REAL_WEBHOOK_LIFECYCLE!=="yes"||env.LDR_ONE_SANDBOX_PERSIST_EVENTS!=="yes")throw Error("Isolated test only");
 const url=new URL(env.DATABASE_URL??"");if(decodeURIComponent(url.pathname.slice(1))!=="ldr_one_sandbox_db")throw Error("Wrong database");
 const key=env.LDR_ONE_STRIPE_TEST_SECRET_KEY,price=env.LDR_ONE_TEST_PRICE_INDIVIDUAL_MONTHLY;
 if(!/^sk_test_[A-Za-z0-9]+$/.test(key??"")||!/^price_[A-Za-z0-9]+$/.test(price??""))throw Error("TEST configuration required");
 const id=randomUUID(),customerId=randomUUID(),userId=randomUUID(),identity={verified:true,userId,customerId};
 let stripeCustomer=null,sub=null,inserted=false,stage="initial";
 const api=async(path,params,method="POST")=>{
  const response=await fetch("https://api.stripe.com/v1/"+path,{method,headers:{authorization:"Bearer "+key,...(params?{"content-type":"application/x-www-form-urlencoded"}:{})},body:params?new URLSearchParams(params):undefined,signal:AbortSignal.timeout(15000)});
  if(!response.ok)throw Error("Stripe TEST "+path+" HTTP "+response.status);
  const value=await response.json();if(method!=="DELETE"&&value.livemode!==false)throw Error("Live Stripe response forbidden");return value;
 };
 const waitFor=async(predicate)=>{for(let i=0;i<18;i++){const result=await db.query("SELECT status,stripe_subscription_id FROM public.ldr_one_sandbox_subscriptions WHERE id=$1",[id]);if(predicate(result.rows[0]))return result.rows[0];await new Promise(resolve=>setTimeout(resolve,1500));}throw Error("Real Stripe webhook delivery not observed");};
 try{
  await db.query("INSERT INTO public.ldr_one_sandbox_subscriptions(id,customer_id,user_id,plan,billing_cycle,seats,status) VALUES($1,$2,$3,'individual','monthly',1,'pending')",[id,customerId,userId]);inserted=true;
  stage="create_test_customer";stripeCustomer=await api("customers",{"metadata[ldr_one_sandbox_probe]":"true"});
  stage="create_incomplete_test_subscription";sub=await api("subscriptions",{customer:stripeCustomer.id,"items[0][price]":price,payment_behavior:"default_incomplete","metadata[sandbox]":"true","metadata[checkout_kind]":"ldr_one_subscription","metadata[ldr_one_subscription_id]":id,"metadata[customer_id]":customerId});
  if(sub.status!=="incomplete")throw Error("Probe must remain unpaid and incomplete");
  stage="wait_for_real_signed_creation";await waitFor(row=>row?.status==="incomplete"&&row.stripe_subscription_id===sub.id);
  if((await checkSandboxEntitlement({db,identity})).allowed)throw Error("Unpaid TEST subscription granted access");
  stage="cancel_test_subscription";const canceled=await api("subscriptions/"+encodeURIComponent(sub.id),null,"DELETE");if(canceled.status!=="canceled")throw Error("TEST cancellation failed");sub=null;
  stage="wait_for_real_signed_cancellation";await waitFor(row=>row?.status==="canceled");
  if((await checkSandboxEntitlement({db,identity})).allowed)throw Error("Canceled subscription granted access");
  console.log("LDR ONE REAL STRIPE SIGNED WEBHOOK VERIFIED: incomplete -> canceled; no unpaid access");
 }catch(error){console.error("LDR ONE REAL STRIPE WEBHOOK PROBE FAILED AT "+stage+": "+String(error?.message??"unknown").replace(/sk_test_[A-Za-z0-9]+/g,"[REDACTED]"));throw error;
 }finally{
  if(sub){try{await api("subscriptions/"+encodeURIComponent(sub.id),null,"DELETE");console.log("TEST SUBSCRIPTION CLEANUP CONFIRMED");}catch(error){console.error("TEST SUBSCRIPTION CLEANUP UNCONFIRMED HTTP "+String(error?.message??"unknown").replace(/sk_test_[A-Za-z0-9]+/g,"[REDACTED]"));}}
  if(stripeCustomer){try{await api("customers/"+encodeURIComponent(stripeCustomer.id),null,"DELETE");console.log("TEST CUSTOMER CLEANUP CONFIRMED");}catch(error){console.error("TEST CUSTOMER CLEANUP UNCONFIRMED HTTP "+String(error?.message??"unknown").replace(/sk_test_[A-Za-z0-9]+/g,"[REDACTED]"));}}
  if(inserted){await db.query("DELETE FROM public.ldr_one_sandbox_stripe_events WHERE subscription_id=$1",[id]);await db.query("DELETE FROM public.ldr_one_sandbox_subscriptions WHERE id=$1",[id]);console.log("LDR ONE REAL STRIPE WEBHOOK PROBE DB CLEANUP VERIFIED");}
 }
}

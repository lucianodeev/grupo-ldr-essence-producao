// Isolated checkout orchestration. Caller MUST authenticate user and resolve
// trusted internal customer ID server-side; never accept either from a browser.
import {randomUUID} from "node:crypto";
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export async function prepareSandboxCheckout({db,stripe,authenticated,selection,priceId,origin}){
 if(!authenticated||!uuid.test(authenticated.userId??"")||!uuid.test(authenticated.customerId??""))throw Error("Verified account required");
 if(!["individual","business"].includes(selection?.plan)||!["monthly","annual"].includes(selection?.cycle)||!Number.isSafeInteger(selection.seats)||
    (selection.plan==="individual"&&selection.seats!==1)||(selection.plan==="business"&&(selection.seats<5||selection.seats>10000)))throw Error("Invalid plan");
 if(!/^price_[A-Za-z0-9]+$/.test(priceId??""))throw Error("Validated Stripe test price required");
 const site=new URL(origin);
 if(site.protocol!=="https:"||site.username||site.password||site.pathname!=="/"||site.search||site.hash)throw Error("HTTPS origin required");
 const id=randomUUID();
 await db.query("INSERT INTO public.ldr_one_sandbox_subscriptions(id,customer_id,user_id,plan,billing_cycle,seats,status) VALUES($1,$2,$3,$4,$5,$6,'pending')",
 [id,authenticated.customerId,authenticated.userId,selection.plan,selection.cycle,selection.seats]);
 let session;
 try{
  const params=new URLSearchParams({
   mode:"subscription","line_items[0][price]":priceId,"line_items[0][quantity]":String(selection.seats),
   success_url:site.origin+"/cliente/ldr-one?subscription=success&session_id={CHECKOUT_SESSION_ID}",
   cancel_url:site.origin+"/ldr-pass?subscription=cancel",client_reference_id:authenticated.userId,
  });
  const meta={sandbox:"true",checkout_kind:"ldr_one_subscription",ldr_one_subscription_id:id,customer_id:authenticated.customerId,
   plan:selection.plan,billing_cycle:selection.cycle,seats:String(selection.seats)};
  for(const [k,v] of Object.entries(meta)){params.set("metadata["+k+"]",v);params.set("subscription_data[metadata]["+k+"]",v);}
  if(authenticated.stripeCustomerId){
   if(!/^cus_[A-Za-z0-9]+$/.test(authenticated.stripeCustomerId))throw Error("Invalid Stripe customer");
   params.set("customer",authenticated.stripeCustomerId);
  }else if(authenticated.email){params.set("customer_email",authenticated.email);}
  session=await stripe(params);
  if(session?.livemode!==false||!/^cs_test_[A-Za-z0-9]+$/.test(session.id??"")||session.mode!=="subscription"||!session.url||session.status!=="open")throw Error("Unexpected Stripe test session");
  const saved=await db.query("UPDATE public.ldr_one_sandbox_subscriptions SET stripe_checkout_session_id=$1,updated_at=now() WHERE id=$2 AND status='pending' RETURNING id",[session.id,id]);
  if(saved.rowCount!==1)throw Error("Pending record not updated");
  return {url:session.url,recordId:id,sessionId:session.id};
 }catch(error){
  // Do not delete a row for a potentially created Stripe session. Reconcile
  // uncertain failures manually; no entitlement is granted for pending rows.
  if(!session?.id)await db.query("DELETE FROM public.ldr_one_sandbox_subscriptions WHERE id=$1 AND status='pending' AND stripe_checkout_session_id IS NULL",[id]);
  throw error;
 }
}

// Explicit one-shot real Stripe TEST event delivery probe, isolated Render only.
// Creates a disposable TEST customer and incomplete TEST subscription, cancels and deletes them.
// It does not grant access, charge a payment method, or touch production.
if(process.env.LDR_ONE_SANDBOX_REAL_DELIVERY_PROBE==="yes"){
 if(process.env.RENDER_SERVICE_ID!=="srv-das6drvavr4c7397dflg"||
  ["LDR_ONE_SANDBOX_CUSTOMER_MIGRATION","LDR_ONE_ALLOW_SANDBOX_MIGRATION","LDR_ONE_SANDBOX_DB_SMOKE","LDR_ONE_SANDBOX_EVENT_INTEGRATION","LDR_ONE_SANDBOX_CHECKOUT_INTEGRATION","LDR_ONE_SANDBOX_SIGNED_HTTP_SELFTEST"].some(k=>process.env[k]==="yes"))throw Error("Real delivery probe guard");
 const key=process.env.LDR_ONE_STRIPE_TEST_SECRET_KEY;
 if(!key?.startsWith("sk_test_"))throw Error("Stripe TEST key missing");
 const price=process.env.LDR_ONE_TEST_PRICE_INDIVIDUAL_MONTHLY||"price_1UKEZAKlx2LyNGeB4UMgHaXA";
 let customer=null,subscription=null;
 const api=async(path,params)=>{
  const response=await fetch("https://api.stripe.com/v1/"+path,{
   method:"POST",headers:{authorization:"Bearer "+key,"content-type":"application/x-www-form-urlencoded"},
   body:new URLSearchParams(params),signal:AbortSignal.timeout(12000)});
  if(!response.ok)throw Error("Stripe TEST probe API failed: "+path+" HTTP "+response.status);
  const data=await response.json();if(data.livemode!==false)throw Error("Stripe live response forbidden");return data;
 };
 try{
  customer=await api("customers",{"metadata[ldr_one_probe]":"true"});
  console.log("LDR ONE STRIPE REAL TEST CUSTOMER CREATED");
  subscription=await api("subscriptions",{
   customer:customer.id,"items[0][price]":price,payment_behavior:"default_incomplete",
   "metadata[ldr_one_probe]":"true","metadata[sandbox]":"true",
   "metadata[checkout_kind]":"delivery_probe_no_access",
   "expand[0]":"latest_invoice"
  });
  console.log("LDR ONE STRIPE REAL TEST SUBSCRIPTION EVENT REQUESTED");
 }catch{console.error("LDR ONE STRIPE REAL TEST PROBE FAILED");}
 finally{
  if(subscription?.id){try{
   const response=await fetch("https://api.stripe.com/v1/subscriptions/"+encodeURIComponent(subscription.id),{
    method:"DELETE",headers:{authorization:"Bearer "+key},signal:AbortSignal.timeout(12000)});
   if(!response.ok)throw Error("Cancellation failed");
   const canceled=await response.json();if(canceled.livemode!==false)throw Error("Wrong mode");
   console.log("LDR ONE STRIPE REAL TEST SUBSCRIPTION CANCELED");
  }catch{console.error("LDR ONE STRIPE REAL TEST SUBSCRIPTION CLEANUP FAILED");}}
  if(customer?.id){try{
   const response=await fetch("https://api.stripe.com/v1/customers/"+encodeURIComponent(customer.id),{
    method:"DELETE",headers:{authorization:"Bearer "+key},signal:AbortSignal.timeout(12000)});
   if(!response.ok)throw Error("Customer deletion failed");
   console.log("LDR ONE STRIPE REAL TEST CUSTOMER DELETED");
  }catch{console.error("LDR ONE STRIPE REAL TEST CUSTOMER CLEANUP FAILED");}}
 }
}

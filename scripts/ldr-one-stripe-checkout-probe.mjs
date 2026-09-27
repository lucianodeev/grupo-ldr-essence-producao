// Test-only Stripe Checkout session probe: creates and immediately expires sessions.
// Never returns a customer-facing checkout URL or creates charges.
const secret=process.env.LDR_ONE_STRIPE_TEST_SECRET_KEY??"";
if(!/^sk_test_[A-Za-z0-9]+$/.test(secret))throw Error("Test-only Stripe key required");
const plans=[
 ["individual","monthly",1,3990,"month","LDR_ONE_TEST_PRICE_INDIVIDUAL_MONTHLY"],
 ["individual","annual",1,39900,"year","LDR_ONE_TEST_PRICE_INDIVIDUAL_ANNUAL"],
 ["business","monthly",5,1990,"month","LDR_ONE_TEST_PRICE_BUSINESS_MONTHLY"],
 ["business","annual",5,19900,"year","LDR_ONE_TEST_PRICE_BUSINESS_ANNUAL"]
];
const api=async(path,options={})=>{
 const r=await fetch("https://api.stripe.com/v1/"+path,{...options,headers:{Authorization:"Bearer "+secret,...options.headers},signal:AbortSignal.timeout(15000)});
 if(!r.ok)throw Error("Stripe test request failed HTTP "+r.status);
 return r.json();
};
let failed=false;
for(const [plan,cycle,seats,cents,interval,envName] of plans){
 let sessionId=null;
 try{
  const priceId=process.env[envName]??"";
  if(!/^price_[A-Za-z0-9]+$/.test(priceId))throw Error("Missing test price for "+plan+" "+cycle);
  const price=await api("prices/"+encodeURIComponent(priceId));
  if(price.livemode!==false||price.active!==true||price.currency!=="eur"||price.unit_amount!==cents||price.recurring?.interval!==interval)throw Error("Price mismatch");
  const params=new URLSearchParams({
   mode:"subscription",
   "line_items[0][price]":priceId,
   "line_items[0][quantity]":String(seats),
   success_url:"https://ldr-one-stripe-sandbox.onrender.com/health?checkout=success",
   cancel_url:"https://ldr-one-stripe-sandbox.onrender.com/health?checkout=cancel",
   "metadata[sandbox]":"true",
   "metadata[checkout_kind]":"ldr_one_subscription",
   "metadata[probe]":"true",
   "subscription_data[metadata][sandbox]":"true",
   "subscription_data[metadata][probe]":"true"
  });
  const session=await api("checkout/sessions",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:params});
  if(session.livemode!==false||session.mode!=="subscription"||session.status!=="open"||!/^cs_test_/.test(session.id))throw Error("Unexpected checkout session");
  sessionId=session.id;
  const expired=await api("checkout/sessions/"+encodeURIComponent(sessionId)+"/expire",{method:"POST"});
  if(expired.status!=="expired")throw Error("Test checkout not expired");
  sessionId=null;
  console.log("LDR ONE TEST CHECKOUT VERIFIED AND EXPIRED: "+plan+" "+cycle+" seats="+seats);
 }catch{
  failed=true;
  console.error("LDR ONE TEST CHECKOUT FAILED: "+plan+" "+cycle);
 }finally{
  if(sessionId){
   try{await api("checkout/sessions/"+encodeURIComponent(sessionId)+"/expire",{method:"POST"});console.log("Unfinished test session expired");}
   catch{console.error("Manual Stripe TEST session expiration required");failed=true;}
  }
 }
}
if(failed)process.exitCode=1;

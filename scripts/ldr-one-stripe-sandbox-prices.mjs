// Read-only Stripe sandbox verification. Never create a charge or log secrets.
const secret=process.env.STRIPE_TEST_SECRET_KEY ?? "";
if(!/^sk_test_[A-Za-z0-9]+$/.test(secret))throw new Error("A Stripe test secret is required");
const expected=[
 ["TEST_PRICE_INDIVIDUAL_MONTHLY",3990],
 ["TEST_PRICE_INDIVIDUAL_ANNUAL",39900],
 ["TEST_PRICE_BUSINESS_MONTHLY",1990],
 ["TEST_PRICE_BUSINESS_ANNUAL",19900],
];
const ids=new Set();
for(const [env,amount] of expected){
 const id=process.env[env] ?? "";
 if(!/^price_[A-Za-z0-9]+$/.test(id))throw new Error("Invalid test price identifier: "+env);
 if(ids.has(id))throw new Error("Test prices must be distinct");
 ids.add(id);
 const response=await fetch("https://api.stripe.com/v1/prices/"+encodeURIComponent(id),{
   headers:{Authorization:"Bearer "+secret},signal:AbortSignal.timeout(15000)
 });
 if(!response.ok)throw new Error("Stripe test price verification failed for "+env+" (HTTP "+response.status+")");
 const price=await response.json();
 if(price.livemode!==false||price.active!==true||price.currency!=="eur"||
    price.unit_amount!==amount||price.type!=="recurring"||
    price.recurring?.interval!==(env.endsWith("ANNUAL")?"year":"month")||
    price.recurring?.interval_count!==1)
   throw new Error("Stripe sandbox price configuration mismatch for "+env);
 console.log(env+": confirmed in Stripe test mode (EUR "+(amount/100).toFixed(2)+")");
}
console.log("Four read-only Stripe sandbox price checks passed; no payment or webhook was tested.");

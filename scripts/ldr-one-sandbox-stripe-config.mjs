// Fail-closed Stripe TEST configuration. Never return or log secret values.
const names={
 "individual:monthly":"LDR_ONE_TEST_PRICE_INDIVIDUAL_MONTHLY",
 "individual:annual":"LDR_ONE_TEST_PRICE_INDIVIDUAL_ANNUAL",
 "business:monthly":"LDR_ONE_TEST_PRICE_BUSINESS_MONTHLY",
 "business:annual":"LDR_ONE_TEST_PRICE_BUSINESS_ANNUAL",
};
const amounts={"individual:monthly":3990,"individual:annual":39900,"business:monthly":1990,"business:annual":19900};
export function resolveSandboxStripeConfig(env,selection){
 const key=selection?.plan+":"+selection?.cycle,variable=names[key];
 if(!variable)throw Error("Unknown LDR ONE selection");
 const secret=env.LDR_ONE_STRIPE_TEST_SECRET_KEY??"",priceId=env[variable]??"";
 if(!/^sk_test_[A-Za-z0-9]+$/.test(secret))throw Error("Stripe TEST secret unavailable");
 if(!/^price_[A-Za-z0-9]+$/.test(priceId))throw Error("Stripe TEST price unavailable");
 return {secret,priceId,amountCents:amounts[key],variable};
}
export async function verifySandboxPrice({secret,priceId,selection,fetcher=fetch}){
 if(!/^sk_test_[A-Za-z0-9]+$/.test(secret)||!/^price_[A-Za-z0-9]+$/.test(priceId))throw Error("TEST credentials required");
 const key=selection?.plan+":"+selection?.cycle;
 if(!(key in amounts))throw Error("Unknown selection");
 const response=await fetcher("https://api.stripe.com/v1/prices/"+encodeURIComponent(priceId),{
  headers:{Authorization:"Bearer "+secret},signal:AbortSignal.timeout(10000)});
 if(!response.ok)throw Error("Stripe TEST price lookup failed");
 const price=await response.json();
 const interval=selection.cycle==="annual"?"year":"month";
 if(price.livemode!==false||price.active!==true||price.currency!=="eur"||
    price.unit_amount!==amounts[key]||price.recurring?.interval!==interval||
    price.recurring?.interval_count!==1)throw Error("Stripe TEST price mismatch");
 return true;
}

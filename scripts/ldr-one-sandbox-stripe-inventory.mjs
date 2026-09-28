// Read-only inventory of disposable LDR ONE Stripe TEST resources. Never creates, cancels or deletes.
// Run only inside isolated Render sandbox with the already-configured TEST key.
const expectedService="srv-das6drvavr4c7397dflg";
export async function inventorySandboxStripe({env=process.env,fetcher=fetch,log=console.log}={}){
 if(env.RENDER_SERVICE_ID!==expectedService||env.LDR_ONE_SANDBOX_STRIPE_INVENTORY!=="yes")throw Error("Inventory disabled outside isolated sandbox");
 const key=env.LDR_ONE_STRIPE_TEST_SECRET_KEY;
 if(typeof key!=="string"||!/^sk_test_[A-Za-z0-9]+$/.test(key))throw Error("Stripe TEST key required");
 const read=async(path)=>{
  const response=await fetcher("https://api.stripe.com/v1/"+path,{headers:{Authorization:"Bearer "+key},signal:AbortSignal.timeout(12000)});
  if(!response.ok)throw Error("Stripe TEST inventory HTTP "+response.status);
  return response.json();
 };
 let cursor,scanned=0,matches=0,unresolved=0,more=true;
 while(more&&scanned<1000){
  const params=new URLSearchParams({limit:"100"});if(cursor)params.set("starting_after",cursor);
  const page=await read("customers?"+params);
  if(!Array.isArray(page.data))throw Error("Unexpected customer response");
  for(const customer of page.data){
   if(customer.livemode!==false)throw Error("Unexpected live customer");
   scanned++;
   if(customer.metadata?.ldr_one_sandbox_probe!=="true")continue;
   matches++;
   const subscriptions=await read("subscriptions?"+new URLSearchParams({customer:customer.id,status:"all",limit:"100"}));
   if(!Array.isArray(subscriptions.data)||subscriptions.has_more)throw Error("Subscription inventory incomplete");
   const active=subscriptions.data.filter(s=>s.status!=="canceled"&&s.status!=="incomplete_expired");
   unresolved+=active.length;
   // IDs are non-secret TEST resource identifiers, not credentials or payment information.
   log(JSON.stringify({probeCustomer:customer.id,subscriptionIds:subscriptions.data.map(s=>s.id),statuses:subscriptions.data.map(s=>s.status),requiresReview:active.length>0}));
  }
  more=page.has_more===true;
  cursor=page.data.at(-1)?.id;
  if(more&&!cursor)throw Error("Inventory pagination invalid");
 }
 if(more)throw Error("Inventory exceeded safe pagination limit");
 log("LDR ONE STRIPE TEST READ-ONLY INVENTORY "+JSON.stringify({customersScanned:scanned,probeCustomers:matches,subscriptionsRequiringReview:unresolved}));
 return {customersScanned:scanned,probeCustomers:matches,subscriptionsRequiringReview:unresolved};
}
if(process.argv[1]&&import.meta.url===new URL("file://"+process.argv[1]).href){
 inventorySandboxStripe().catch(error=>{console.error("LDR ONE STRIPE TEST INVENTORY FAILED: "+String(error.message).replace(/sk_test_[A-Za-z0-9]+/g,"[REDACTED]"));process.exitCode=1;});
}

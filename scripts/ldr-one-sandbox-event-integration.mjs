// Transactional integration check against isolated Render DB. Always rolls back test data.
// Run only in the designated sandbox service; no Stripe API calls or charges.
import {applyVerifiedSandboxEvent} from "./ldr-one-sandbox-event-store.mjs";
import {checkSandboxEntitlement} from "./ldr-one-sandbox-entitlement-gate.mjs";
if(process.env.LDR_ONE_SANDBOX_EVENT_INTEGRATION !== "yes" || process.env.RENDER_SERVICE_ID !== "srv-das6drvavr4c7397dflg") throw Error("Sandbox-only integration guard");
const url=process.env.DATABASE_URL;
if(!url || decodeURIComponent(new URL(url).pathname.slice(1))!=="ldr_one_sandbox_db") throw Error("Sandbox DB required");
const {default:pg}=await import(process.env.LDR_ONE_PG_MODULE_URL || "pg");
const {randomUUID}=await import("node:crypto");
const client=new pg.Client({connectionString:url,connectionTimeoutMillis:5000,statement_timeout:10000});
const id=randomUUID(),customer=randomUUID(),user=randomUUID();
const event={id:"evt_"+randomUUID().replaceAll("-",""),created:Math.floor(Date.now()/1000),livemode:false,type:"customer.subscription.updated",data:{object:{id:"sub_"+randomUUID().replaceAll("-",""),status:"active",metadata:{sandbox:"true",checkout_kind:"ldr_one_subscription",ldr_one_subscription_id:id,customer_id:customer}}}};
try {
 await client.connect();
 await client.query("BEGIN");
 await client.query("INSERT INTO public.ldr_one_sandbox_subscriptions(id,customer_id,user_id,plan,billing_cycle,seats) VALUES($1,$2,$3,'individual','monthly',1)",[id,customer,user]);
 // Preserve outer rollback: map event-store transaction boundaries to savepoints.
 const scoped={query:(sql,args)=>{
   if(sql==="BEGIN")return client.query("SAVEPOINT ldr_event");
   if(sql==="COMMIT")return client.query("RELEASE SAVEPOINT ldr_event");
   if(sql==="ROLLBACK")return client.query("ROLLBACK TO SAVEPOINT ldr_event");
   return client.query(sql,args);
 }};
 const result=await applyVerifiedSandboxEvent(scoped,event,id,customer);
 if(result.status!=="active")throw Error("Sandbox lifecycle integration failed");
 const check=await client.query("SELECT status FROM public.ldr_one_sandbox_subscriptions WHERE id=$1",[id]);
 if(check.rows[0]?.status!=="active")throw Error("DB state mismatch");
 const identity={verified:true,userId:user,customerId:customer};
 const granted=await checkSandboxEntitlement({db:client,identity});
 if(!granted.allowed||granted.subscriptionId!==id)throw Error("Active event did not grant owner entitlement");
 const other=await checkSandboxEntitlement({db:client,identity:{...identity,userId:randomUUID()}});
 if(other.allowed)throw Error("Unrelated user received access");
 const duplicate=await applyVerifiedSandboxEvent(scoped,event,id,customer);
 if(!duplicate.duplicate)throw Error("Replay guard failed");
 const canceled={...event,id:"evt_"+randomUUID().replaceAll("-",""),created:event.created+1,type:"customer.subscription.deleted"};
 const canceledResult=await applyVerifiedSandboxEvent(scoped,canceled,id,customer);
 if(canceledResult.status!=="canceled")throw Error("Cancellation event failed");
 const revoked=await checkSandboxEntitlement({db:client,identity});
 if(revoked.allowed)throw Error("Cancellation failed to revoke entitlement");
 const stale={...event,id:"evt_"+randomUUID().replaceAll("-",""),created:event.created-1};
 const staleResult=await applyVerifiedSandboxEvent(scoped,stale,id,customer);
 if(!staleResult.stale)throw Error("Older event accepted");
 const afterStale=await checkSandboxEntitlement({db:client,identity});
 if(afterStale.allowed)throw Error("Stale event restored access");
 console.log("LDR ONE SANDBOX EVENT INTEGRATION VERIFIED; ENTITLEMENT LIFECYCLE VERIFIED (grant, isolation, cancel, stale-event protection; rolled back)");
} finally {
 try {await client.query("ROLLBACK");} finally {await client.end();}
}

import test from "node:test";
import assert from "node:assert/strict";
import {applyVerifiedSandboxEvent} from "./ldr-one-sandbox-event-store.mjs";
const id="11111111-1111-4111-8111-111111111111",customer="22222222-2222-4222-8222-222222222222";
const event=(over={})=>({id:"evt_test123",created:100,livemode:false,type:"customer.subscription.updated",data:{object:{id:"sub_test",status:"active",metadata:{sandbox:"true",checkout_kind:"ldr_one_subscription",ldr_one_subscription_id:id,customer_id:customer}}},...over});
function db({duplicate=false,stale=false}={}){
 const calls=[];
 const client={query:async(sql,args=[])=>{
  calls.push({sql,args});
  if(sql.startsWith("SELECT"))return {rows:[{id,customer_id:customer,stripe_subscription_id:null,last_stripe_event_created:stale?200:0}]};
  if(sql.startsWith("INSERT"))return {rowCount:duplicate?0:1};
  return {rowCount:1};
 }};
 return {client,calls};
}
test("rejects live and foreign ownership before SQL",async()=>{
 const {client,calls}=db();
 await assert.rejects(applyVerifiedSandboxEvent(client,event({livemode:true}),id,customer),/test event/);
 await assert.rejects(applyVerifiedSandboxEvent(client,event(),id,"other"),/ownership/);
 assert.equal(calls.length,0);
});
test("atomically records and activates valid signed-upstream event",async()=>{
 const {client,calls}=db();
 assert.deepEqual(await applyVerifiedSandboxEvent(client,event(),id,customer),{handled:true,status:"active"});
 assert.deepEqual(calls.map(c=>c.sql.split(" ")[0]),["BEGIN","SELECT","INSERT","UPDATE","COMMIT"]);
});
test("duplicate is idempotent and stale event never overwrites",async()=>{
 for(const state of [{duplicate:true},{stale:true}]){
  const {client,calls}=db(state);
  const result=await applyVerifiedSandboxEvent(client,event(),id,customer);
  assert.equal(Boolean(result.duplicate||result.stale),true);
  assert.equal(calls.some(c=>c.sql.startsWith("UPDATE")),false);
 }
});
test("DB failures roll back",async()=>{
 const client={query:async(sql)=>{if(sql.startsWith("SELECT"))throw Error("db down");return {};}};
 await assert.rejects(applyVerifiedSandboxEvent(client,event(),id,customer),/db down/);
});

test("direct invoice or checkout event never changes access",async()=>{const {client,calls}=db();for(const type of ["checkout.session.completed","invoice.payment_succeeded"]){assert.deepEqual(await applyVerifiedSandboxEvent(client,event({type}),id,customer),{handled:false});}assert.equal(calls.length,0);});

for (const status of ["unpaid","incomplete","incomplete_expired","canceled"]) {
 test(`updated persists ${status} and entitlement denies access`,async()=>{
  const {client,calls}=db(); const e=event(); e.data.object.status=status;
  assert.deepEqual(await applyVerifiedSandboxEvent(client,e,id,customer),{handled:true,status});
  assert.equal(calls.find(c=>c.sql.startsWith("UPDATE")).args[0],status);
  const {checkSandboxEntitlement}=await import("./ldr-one-sandbox-entitlement-gate.mjs");
  const result=await checkSandboxEntitlement({db:{query:async()=>({rows:[{id,plan:"individual",status,seat_authorized:true}]})},identity:{verified:true,userId:id,customerId:customer}});
  assert.equal(result.allowed,false);
 });
}
test("terminal state cannot be reopened by a delayed same-second creation",async()=>{
 const {client,calls}=db(); const query=client.query;
 client.query=async(sql,args)=>sql.startsWith("SELECT")?{rows:[{id,customer_id:customer,status:"incomplete_expired",stripe_subscription_id:"sub_test",last_stripe_event_created:100}]}:query(sql,args);
 const result=await applyVerifiedSandboxEvent(client,event(),id,customer);
 assert.equal(result.stale,true);
 assert.equal(calls.some(c=>c.sql.startsWith("UPDATE")),false);
});

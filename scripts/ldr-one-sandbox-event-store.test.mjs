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

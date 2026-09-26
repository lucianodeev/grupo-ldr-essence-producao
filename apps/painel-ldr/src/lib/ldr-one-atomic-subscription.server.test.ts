import assert from "node:assert/strict";
import test from "node:test";
import {applyVerifiedLdrOneSubscriptionEvent} from "./ldr-one-atomic-subscription.server.ts";
const rowId="20000000-0000-4000-8000-000000000001";
const event={id:"evt_Test123",created:100,status:"active",stripeSubscriptionId:"sub_Test123",periodStart:1000,periodEnd:2000};
test("verified event maps all fields into atomic RPC",async()=>{
 let called=0;
 const result=await applyVerifiedLdrOneSubscriptionEvent({rpc:async(name,args)=>{
   called++;
   assert.equal(name,"ldr_one_apply_ordered_subscription");
   assert.equal(args.p_subscription_id,rowId);
   assert.equal(args.p_event_id,event.id);
   assert.equal(args.p_stripe_subscription_id,event.stripeSubscriptionId);
   assert.equal(args.p_period_start,new Date(1000000).toISOString());
   assert.equal(args.p_period_end,new Date(2000000).toISOString());
   return {data:"applied",error:null};
 }},rowId,event);
 assert.equal(called,1);assert.equal(result,"applied");
});
test("invalid and ambiguous events never grant access",async()=>{
 let called=0;const db={rpc:async()=>{called++;return {data:"applied",error:null}}};
 for(const invalid of [
  {...event,id:"not-an-event"},
  {...event,created:0},
  {...event,status:"admin"},
  {...event,stripeSubscriptionId:"sub_other",periodStart:2000,periodEnd:1000},
 ]) await assert.rejects(()=>applyVerifiedLdrOneSubscriptionEvent(db,rowId,invalid));
 assert.equal(called,0);
 await assert.rejects(()=>applyVerifiedLdrOneSubscriptionEvent({rpc:async()=>({data:"reconcile",error:null})},rowId,event),/reconciliation/);
 await assert.rejects(()=>applyVerifiedLdrOneSubscriptionEvent({rpc:async()=>({data:"unexpected",error:null})},rowId,event),/Unexpected/);
 await assert.rejects(()=>applyVerifiedLdrOneSubscriptionEvent({rpc:async()=>({data:null,error:{message:"db unavailable"}})},rowId,event),/db unavailable/);
});
test("duplicate and stale are non-applying results",async()=>{
 for(const decision of ["duplicate","stale"] as const)
 assert.equal(await applyVerifiedLdrOneSubscriptionEvent({rpc:async()=>({data:decision,error:null})},rowId,event),decision);
});

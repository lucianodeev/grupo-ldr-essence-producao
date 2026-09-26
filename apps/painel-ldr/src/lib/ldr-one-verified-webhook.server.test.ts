import assert from "node:assert/strict";
import test from "node:test";
import {processVerifiedLdrOneEvent} from "./ldr-one-verified-webhook.server.ts";
const rowId="20000000-0000-4000-8000-000000000001";
const event={id:"evt_Test123",created:100,type:"invoice.payment_succeeded",status:"active",stripeSubscriptionId:"sub_Test123"};
const token="10000000-0000-4000-8000-000000000001";
test("claim, atomic update and completion occur in order",async()=>{
 const calls:string[]=[];
 const db={rpc:async(name:string)=>{calls.push(name);return {data:name==="ldr_one_claim_webhook_event"?[{decision:"claim",token}]:name==="ldr_one_apply_ordered_subscription"?"applied":true,error:null};}};
 assert.equal(await processVerifiedLdrOneEvent(db,rowId,event),"applied");
 assert.deepEqual(calls,["ldr_one_claim_webhook_event","ldr_one_apply_ordered_subscription","ldr_one_finish_webhook_event"]);
});
test("in-progress delivery never acknowledges an unfinished event",async()=>{
 let calls=0;const db={rpc:async()=>{calls++;return {data:[{decision:"retry_later",token:null}],error:null};}};
 await assert.rejects(()=>processVerifiedLdrOneEvent(db,rowId,event),/must retry/);
 assert.equal(calls,1);
});
test("atomic failure marks claim unsuccessful and propagates error",async()=>{
 const calls:string[]=[];const db={rpc:async(name:string,args:Record<string,unknown>)=>{
 calls.push(name);
 if(name==="ldr_one_claim_webhook_event")return {data:[{decision:"claim",token}],error:null};
 if(name==="ldr_one_apply_ordered_subscription")return {data:null,error:{message:"database unavailable"}};
 assert.equal(args.p_success,false);return {data:true,error:null};
 }};
 await assert.rejects(()=>processVerifiedLdrOneEvent(db,rowId,event),/database unavailable/);
 assert.deepEqual(calls,["ldr_one_claim_webhook_event","ldr_one_apply_ordered_subscription","ldr_one_finish_webhook_event"]);
});
test("same-second ambiguity requires reconciliation and failed completion",async()=>{
 let finished=false;
 const db={rpc:async(name:string,args:Record<string,unknown>)=>{
 if(name==="ldr_one_claim_webhook_event")return {data:[{decision:"claim",token}],error:null};
 if(name==="ldr_one_apply_ordered_subscription")return {data:"reconcile",error:null};
 finished=true;assert.equal(args.p_success,false);return {data:true,error:null};
 }};
 await assert.rejects(()=>processVerifiedLdrOneEvent(db,rowId,event),/reconciliation/);
 assert.equal(finished,true);
});

test("already completed event is acknowledged without a second update",async()=>{
 const calls:string[]=[];
 const db={rpc:async(name:string)=>{calls.push(name);return {data:[{decision:"acknowledge",token:null}],error:null};}};
 assert.equal(await processVerifiedLdrOneEvent(db,rowId,event),"duplicate");
 assert.deepEqual(calls,["ldr_one_claim_webhook_event"]);
});
test("exhausted retry policy requires manual reconciliation",async()=>{
 let calls=0;
 const db={rpc:async()=>{calls++;return {data:[{decision:"reject",token:null}],error:null};}};
 await assert.rejects(()=>processVerifiedLdrOneEvent(db,rowId,event),/manual reconciliation/);
 assert.equal(calls,1);
});
test("completion failure is not reported as success",async()=>{
 const db={rpc:async(name:string)=>{
 if(name==="ldr_one_claim_webhook_event")return {data:[{decision:"claim",token}],error:null};
 if(name==="ldr_one_apply_ordered_subscription")return {data:"applied",error:null};
 return {data:false,error:null};
 }};
 await assert.rejects(()=>processVerifiedLdrOneEvent(db,rowId,event),/claim lost or expired/);
});

test("failed acknowledgement does not falsely mark committed update as failed",async()=>{
 const calls:Array<{name:string;success?:unknown}>=[];
 const db={rpc:async(name:string,args:Record<string,unknown>)=>{
 calls.push({name,success:args.p_success});
 if(name==="ldr_one_claim_webhook_event")return {data:[{decision:"claim",token}],error:null};
 if(name==="ldr_one_apply_ordered_subscription")return {data:"applied",error:null};
 return {data:false,error:null};
 }};
 await assert.rejects(()=>processVerifiedLdrOneEvent(db,rowId,event),/claim lost or expired/);
 assert.deepEqual(calls.map(c=>c.name),["ldr_one_claim_webhook_event","ldr_one_apply_ordered_subscription","ldr_one_finish_webhook_event"]);
 assert.equal(calls[2].success,true);
});

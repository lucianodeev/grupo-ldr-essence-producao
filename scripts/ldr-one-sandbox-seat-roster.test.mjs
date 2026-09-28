import test from "node:test";import assert from "node:assert/strict";
import {listSandboxBusinessSeats} from "./ldr-one-sandbox-seat-roster.mjs";
const identity={verified:true,businessAdmin:true,userId:"e49bc51e-2af6-4c3d-a91e-a713e1ed69cb",customerId:"1e2f550b-a4c1-4788-8d34-f0b159c0dc41"};
const subscriptionId="c3c2b36b-b22b-4e5a-bc10-7491744e3fa0";
test("unverified administrators cannot inspect seat roster",async()=>{
 let touched=false;
 await assert.rejects(()=>listSandboxBusinessSeats({db:{query:async()=>{touched=true;}},identity:{...identity,businessAdmin:false},subscriptionId}));
 assert.equal(touched,false);
});
test("seat roster is customer scoped and omits payment identifiers",async()=>{
 let args;const db={query:async(sql,params)=>{args=params;assert.match(sql,/s.customer_id=\$2/);return {rows:[{user_id:null,assigned_at:null,seats:5,stripe_subscription_id:"secret"}]};}};
 assert.deepEqual(await listSandboxBusinessSeats({db,identity,subscriptionId}),{capacity:5,used:0,members:[]});
 assert.deepEqual(args,[subscriptionId,identity.customerId,identity.userId]);
});
test("missing company subscription does not expose another company's roster",async()=>{
 await assert.rejects(()=>listSandboxBusinessSeats({db:{query:async()=>({rows:[]})},identity,subscriptionId}),/not found/);
});

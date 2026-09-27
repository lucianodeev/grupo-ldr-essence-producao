import test from "node:test";
import assert from "node:assert/strict";
import {revokeSandboxBusinessSeat} from "./ldr-one-sandbox-revoke-seat.mjs";
import {checkSandboxEntitlement} from "./ldr-one-sandbox-entitlement-gate.mjs";
const identity={verified:true,businessAdmin:true,userId:"e49bc51e-2af6-4c3d-a91e-a713e1ed69cb",customerId:"1e2f550b-a4c1-4788-8d34-f0b159c0dc41"};
const subscriptionId="c3c2b36b-b22b-4e5a-bc10-7491744e3fa0",memberUserId="0ab5d190-5a6a-48f5-b01a-bbfc9a0a418c";
test("unverified administrator cannot revoke a seat",async()=>{
 let touched=false;
 await assert.rejects(()=>revokeSandboxBusinessSeat({db:{query:async()=>{touched=true;}},identity:{...identity,businessAdmin:false},subscriptionId,memberUserId}),/administrator/);
 assert.equal(touched,false);
});
test("ownership lock is required and foreign subscriptions are never modified",async()=>{
 const queries=[];const db={query:async(sql)=>{queries.push(sql);if(sql.startsWith("SELECT"))return {rowCount:0};return {rowCount:1};}};
 await assert.rejects(()=>revokeSandboxBusinessSeat({db,identity,subscriptionId,memberUserId}),/ownership/);
 assert.equal(queries.at(-1),"ROLLBACK");
 assert.equal(queries.some(sql=>sql.startsWith("DELETE")),false);
});
test("seat revocation is idempotent and scoped to one subscription",async()=>{
 const queries=[];const db={query:async(sql,args)=>{queries.push({sql,args});if(sql.startsWith("SELECT"))return {rowCount:1};if(sql.startsWith("DELETE"))return {rowCount:0};return {rowCount:1};}};
 assert.deepEqual(await revokeSandboxBusinessSeat({db,identity,subscriptionId,memberUserId}),{revoked:false});
 assert.deepEqual(queries.find(x=>x.sql.startsWith("DELETE")).args,[subscriptionId,memberUserId]);
 assert.equal(queries.at(-1).sql,"COMMIT");
});
test("seat access denied unless database confirms membership",async()=>{
 const db={query:async()=>({rows:[{id:subscriptionId,plan:"business",seat_authorized:false}]})};
 assert.equal((await checkSandboxEntitlement({db,identity})).allowed,false);
});

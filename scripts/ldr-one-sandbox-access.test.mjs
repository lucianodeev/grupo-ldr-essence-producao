import test from 'node:test';
import assert from 'node:assert/strict';
import {checkSandboxEntitlement} from './ldr-one-sandbox-entitlement-gate.mjs';
import {assignSandboxBusinessSeat} from './ldr-one-sandbox-business-seats.mjs';
const identity={verified:true,businessAdmin:true,userId:'e49bc51e-2af6-4c3d-a91e-a713e1ed69cb',customerId:'1e2f550b-a4c1-4788-8d34-f0b159c0dc41'};
const subscriptionId='c3c2b36b-b22b-4e5a-bc10-7491744e3fa0',memberUserId='0ab5d190-5a6a-48f5-b01a-bbfc9a0a418c';
test('no entitlement without active owned subscription',async()=>{
 const db={query:async()=>({rows:[]})};
 assert.equal((await checkSandboxEntitlement({db,identity})).allowed,false);
 await assert.rejects(()=>checkSandboxEntitlement({db,identity:{...identity,verified:false}}));
});
test('business seats reject unauthorized administrator and full capacity',async()=>{
 const queries=[];
 const db={query:async(sql)=>{queries.push(sql);if(sql.startsWith('SELECT id,seats'))return {rows:[{seats:5,status:'active'}]};if(sql.startsWith('SELECT 1'))return {rowCount:0};if(sql.startsWith('SELECT count'))return {rows:[{used:5}]};return {rowCount:1};}};
 await assert.rejects(()=>assignSandboxBusinessSeat({db,identity:{...identity,businessAdmin:false},subscriptionId,memberUserId,verifyMember:async()=>true}));
 assert.equal(queries.length,0);
 await assert.rejects(()=>assignSandboxBusinessSeat({db,identity,subscriptionId,memberUserId,verifyMember:async()=>true}),/No business seats/);
 assert.equal(queries.at(-1),'ROLLBACK');
});

test("unverified company member is rejected before database writes",async()=>{let touched=false;const db={query:async()=>{touched=true;}};await assert.rejects(()=>assignSandboxBusinessSeat({db,identity,subscriptionId,memberUserId,verifyMember:async()=>false}),/not verified/);assert.equal(touched,false);});

import './ldr-one-sandbox-api.test.mjs';

test("entitlement fails closed for unexpected DB rows and nonboolean verification",async()=>{const db={query:async()=>({rows:[{seat_authorized:true,plan:"individual",status:"pending",id:subscriptionId}]})};assert.equal((await checkSandboxEntitlement({db,identity})).allowed,false);await assert.rejects(()=>checkSandboxEntitlement({db,identity:{...identity,verified:"true"}}),/Authenticated identity/);await assert.rejects(()=>checkSandboxEntitlement({identity}),/Private sandbox database/);});

import "./ldr-one-sandbox-supabase-auth.test.mjs";

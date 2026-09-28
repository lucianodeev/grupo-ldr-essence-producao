import test from "node:test";
import assert from "node:assert/strict";
import {issueSandboxSession,persistSandboxSession,resolveSandboxSession,revokeSandboxSession,sandboxSessionCookie} from "./ldr-one-sandbox-sessions.mjs";
const env={RENDER_SERVICE_ID:"srv-das6drvavr4c7397dflg",LDR_ONE_SANDBOX_SESSION_ENABLED:"true"};
const identity={verified:true,userId:"e49bc51e-2af6-4c3d-a91e-a713e1ed69cb",customerId:"1e2f550b-a4c1-4788-8d34-f0b159c0dc41"};
test("opaque sandbox sessions require verified identity, are short-lived and disabled by default",()=>{
 assert.throws(()=>issueSandboxSession({identity,env:{...env,LDR_ONE_SANDBOX_SESSION_ENABLED:"false"}}));
 assert.throws(()=>issueSandboxSession({identity:{...identity,verified:false},env}));
 assert.throws(()=>issueSandboxSession({identity,env,ttlMs:3600000}));
 const a=issueSandboxSession({identity,env,now:100000}),b=issueSandboxSession({identity,env,now:100000});
 assert.notEqual(a.token,b.token);assert.notEqual(a.token,a.tokenHash);assert.equal(a.token.length,64);
 assert.equal(a.expiresAt.valueOf(),1900000);assert.equal(sandboxSessionCookie.httpOnly,true);assert.equal(sandboxSessionCookie.secure,true);
});
test("private session lookup checks expiry, revocation and current verified customer membership",async()=>{
 const session=issueSandboxSession({identity,env,now:100000});let row=null,revoked=false;
 const db={query:async(sql,args)=>{
  if(sql.startsWith("INSERT")){row={user_id:args[1],customer_id:args[2],expires_at:args[3],hash:args[0]};return {rows:[]};}
  if(sql.startsWith("UPDATE")){revoked=true;return {rows:[]};}
  if(sql.startsWith("SELECT"))return {rows:row&&!revoked&&args[0]===row.hash&&row.expires_at>args[1]?[row]:[]};
  throw Error("Unexpected query");
 }};
 await persistSandboxSession({db,session,env});
 const resolveCustomer=async()=>({verified:true,customerId:identity.customerId});
 assert.deepEqual(await resolveSandboxSession({db,token:session.token,env,now:100001,resolveCustomer}),identity);
 assert.equal(await resolveSandboxSession({db,token:session.token,env,now:1900001,resolveCustomer}),null);
 assert.equal(await resolveSandboxSession({db,token:session.token,env,now:100001,resolveCustomer:async()=>({verified:true,customerId:identity.userId})}),null);
 assert.equal(await resolveSandboxSession({db,token:"invalid",env,now:100001,resolveCustomer}),null);
 assert.equal(await revokeSandboxSession({db,token:session.token,env}),true);
 assert.equal(await resolveSandboxSession({db,token:session.token,env,now:100001,resolveCustomer}),null);
});

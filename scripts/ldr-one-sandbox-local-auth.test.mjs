import test from "node:test";
import assert from "node:assert/strict";
import {hashSandboxPassword,verifySandboxPassword,authenticateInvitedSandboxUser} from "./ldr-one-sandbox-local-auth.mjs";
const env={RENDER_SERVICE_ID:"srv-das6drvavr4c7397dflg",LDR_ONE_SANDBOX_LOCAL_AUTH_ENABLED:"true"};
const userId="e49bc51e-2af6-4c3d-a91e-a713e1ed69cb",customerId="1e2f550b-a4c1-4788-8d34-f0b159c0dc41";
test("sandbox credentials use salted scrypt and reject wrong passwords",async()=>{
 const hash=await hashSandboxPassword("an-invited-only-password-123");
 assert.match(hash,/^scrypt-v1:[a-f0-9]{64}:[a-f0-9]{128}$/);
 assert.equal(await verifySandboxPassword("an-invited-only-password-123",hash),true);
 assert.equal(await verifySandboxPassword("wrong password",hash),false);
 await assert.rejects(()=>hashSandboxPassword("too-short"));
});
test("sandbox auth requires enabled service, one verified invite and correct password",async()=>{
 const password="an-invited-only-password-123",password_hash=await hashSandboxPassword(password);
 const row={user_id:userId,customer_id:customerId,password_hash};
 const db={query:async(sql,args)=>{assert.match(sql,/verified=true AND disabled=false/);assert.deepEqual(args,["invited@example.com"]);return {rows:[row]};}};
 assert.deepEqual(await authenticateInvitedSandboxUser({email:"INVITED@example.com",password,db,env}),{verified:true,userId,customerId});
 assert.equal(await authenticateInvitedSandboxUser({email:"INVITED@example.com",password:"wrong",db,env}),null);
 assert.equal(await authenticateInvitedSandboxUser({email:"INVITED@example.com",password,db,env:{...env,LDR_ONE_SANDBOX_LOCAL_AUTH_ENABLED:"false"}}),null);
 assert.equal(await authenticateInvitedSandboxUser({email:"INVITED@example.com",password,db:{query:async()=>({rows:[]})},env}),null);
 assert.equal(await authenticateInvitedSandboxUser({email:"INVITED@example.com",password,db:{query:async()=>({rows:[row,row]})},env}),null);
});

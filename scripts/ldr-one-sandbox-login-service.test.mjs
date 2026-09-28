import test from "node:test";
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {hashSandboxPassword} from "./ldr-one-sandbox-local-auth.mjs";
import {loginInvitedSandboxUser,verifyInvitedSandboxSession,logoutInvitedSandboxSession} from "./ldr-one-sandbox-login-service.mjs";
const env={RENDER_SERVICE_ID:"srv-das6drvavr4c7397dflg",LDR_ONE_SANDBOX_LOCAL_AUTH_ENABLED:"true",LDR_ONE_SANDBOX_SESSION_ENABLED:"true"};
const user="e49bc51e-2af6-4c3d-a91e-a713e1ed69cb",customer="1e2f550b-a4c1-4788-8d34-f0b159c0dc41";
test("private invited login persists opaque session, verifies membership, revokes and rejects mismatches",async()=>{
 const password="a-secure-invite-password-123",hash=await hashSandboxPassword(password);let session=null,revoked=false,member=true;
 const db={query:async(sql,args)=>{
  if(sql.includes("FROM public.ldr_one_sandbox_invited_users"))return {rows:[{user_id:user,customer_id:customer,password_hash:hash}]};
  if(sql.includes("FROM public.ldr_one_sandbox_customer_members"))return {rows:member?[{customer_id:customer}]:[]};
  if(sql.startsWith("INSERT INTO public.ldr_one_sandbox_sessions")){session={hash:args[0],user_id:args[1],customer_id:args[2],expires_at:args[3]};return {rows:[]};}
  if(sql.startsWith("SELECT user_id,customer_id,expires_at"))return {rows:session&&!revoked&&session.hash===args[0]&&session.expires_at>args[1]?[session]:[]};
  if(sql.startsWith("UPDATE public.ldr_one_sandbox_sessions")){revoked=true;return {rows:[]};}
  throw Error("Unexpected SQL");
 }};
 const login=await loginInvitedSandboxUser({email:"TEST@example.com",password,db,env,now:100000});
 assert.match(login.token,/^[a-f0-9]{64}$/);
 assert.equal(session.hash,createHash("sha256").update(login.token).digest("hex"));
 assert.deepEqual(await verifyInvitedSandboxSession({token:login.token,db,env,now:100001}),{verified:true,userId:user,customerId:customer});
 member=false;assert.equal(await verifyInvitedSandboxSession({token:login.token,db,env,now:100001}),null);
 member=true;assert.equal(await verifyInvitedSandboxSession({token:login.token,db,env,now:1900001}),null);
 assert.equal(await logoutInvitedSandboxSession({token:login.token,db,env}),true);
 assert.equal(await verifyInvitedSandboxSession({token:login.token,db,env,now:100001}),null);
 assert.equal(await loginInvitedSandboxUser({email:"TEST@example.com",password,db,env:{...env,LDR_ONE_SANDBOX_SESSION_ENABLED:"false"}}),null);
 member=false;assert.equal(await loginInvitedSandboxUser({email:"TEST@example.com",password,db,env}),null);
 assert.equal(await loginInvitedSandboxUser({email:"TEST@example.com",password:"wrong",db,env}),null);
});

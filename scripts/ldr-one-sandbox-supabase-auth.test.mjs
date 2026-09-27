import test from "node:test";import assert from "node:assert/strict";import {generateKeyPairSync,sign} from "node:crypto";import {authenticateSandboxSupabase} from "./ldr-one-sandbox-supabase-auth.mjs";
const issuer="https://sandbox-auth.example.invalid/auth/v1",jwksUrl="https://sandbox-auth.example.invalid/auth/v1/.well-known/jwks.json",userId="e49bc51e-2af6-4c3d-a91e-a713e1ed69cb",customerId="1e2f550b-a4c1-4788-8d34-f0b159c0dc41";
const env={RENDER_SERVICE_ID:"srv-das6drvavr4c7397dflg",LDR_ONE_SANDBOX_AUTH_ENABLED:"true",LDR_ONE_SANDBOX_AUTH_ISSUER:issuer,LDR_ONE_SANDBOX_AUTH_AUDIENCE:"authenticated",LDR_ONE_SANDBOX_AUTH_JWKS_URL:jwksUrl};
const {privateKey,publicKey}=generateKeyPairSync("rsa",{modulusLength:2048});const jwk={...publicKey.export({format:"jwk"}),kid:"sandbox-test",alg:"RS256",use:"sig"};
const fetcher=async()=>new Response(JSON.stringify({keys:[jwk]}),{status:200});
const resolveCustomer=async()=>({verified:true,customerId});
const token=(changes={},key=privateKey)=>{const now=Math.floor(Date.now()/1000),header=Buffer.from(JSON.stringify({alg:"RS256",kid:"sandbox-test",typ:"JWT"})).toString("base64url"),payload=Buffer.from(JSON.stringify({iss:issuer,aud:"authenticated",sub:userId,iat:now,exp:now+300,...changes})).toString("base64url");return header+"."+payload+"."+sign("RSA-SHA256",Buffer.from(header+"."+payload),key).toString("base64url");};
const request=value=>new Request("https://ldr-one-stripe-sandbox.onrender.com/status",{headers:{authorization:"Bearer "+value}});
test("trusted sandbox JWT maps to independently verified customer",async()=>{const result=await authenticateSandboxSupabase({request:request(token()),env,fetcher,resolveCustomer});assert.equal(result.verified,true);assert.equal(result.userId,userId);assert.equal(result.customerId,customerId);});
test("sandbox JWT rejects expiry, wrong audience, bad signature, unverified customer and disabled mode",async()=>{const other=generateKeyPairSync("rsa",{modulusLength:2048}).privateKey;for(const value of [token({exp:1}),token({aud:"other"}),token({},other)])assert.equal(await authenticateSandboxSupabase({request:request(value),env,fetcher,resolveCustomer}),null);assert.equal(await authenticateSandboxSupabase({request:request(token()),env,fetcher,resolveCustomer:async()=>({verified:false,customerId})}),null);await assert.rejects(()=>authenticateSandboxSupabase({request:request(token()),env:{...env,LDR_ONE_SANDBOX_AUTH_ENABLED:"false"},fetcher,resolveCustomer}));});

import {handleVerifiedSandboxStatus} from "./ldr-one-sandbox-verified-status.mjs";
test("verified JWT reaches scoped subscription status, no entitlement without active row",async()=>{
 const db={query:async()=>({rows:[]})},statusEnv={...env,LDR_ONE_SANDBOX_STATUS_API_ENABLED:"true"};
 const req=new Request("https://ldr-one-stripe-sandbox.onrender.com/status",{headers:{origin:"https://ldr-one-stripe-sandbox.onrender.com",authorization:"Bearer "+token()}});
 const result=await handleVerifiedSandboxStatus({request:req,env:statusEnv,db,resolveCustomer,fetcher});
 assert.equal(result.status,200);assert.equal(result.body.entitlement.allowed,false);assert.deepEqual(result.body.subscriptions,[]);
});
test("verified status fails closed when sandbox directory is unavailable",async()=>{
 let touched=false;const db={query:async()=>{touched=true;return {rows:[]};}},statusEnv={...env,LDR_ONE_SANDBOX_STATUS_API_ENABLED:"true"};
 const req=new Request("https://ldr-one-stripe-sandbox.onrender.com/status",{headers:{origin:"https://ldr-one-stripe-sandbox.onrender.com",authorization:"Bearer "+token()}});
 assert.equal((await handleVerifiedSandboxStatus({request:req,env:statusEnv,db,resolveCustomer:async()=>null,fetcher})).status,401);
 assert.equal(touched,false);
 assert.equal((await handleVerifiedSandboxStatus({request:req,env:statusEnv,db,fetcher})).status,503);
});

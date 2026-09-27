import test from "node:test";import assert from "node:assert/strict";
import {handleSandboxBusinessSeats} from "./ldr-one-sandbox-business-api.mjs";
import {handleSandboxSubscriptionStatus} from "./ldr-one-sandbox-status-api.mjs";
const origin="https://ldr-one-stripe-sandbox.onrender.com";
const identity={verified:true,businessAdmin:true,userId:"e49bc51e-2af6-4c3d-a91e-a713e1ed69cb",customerId:"1e2f550b-a4c1-4788-8d34-f0b159c0dc41"};
const id="c3c2b36b-b22b-4e5a-bc10-7491744e3fa0";
const env={RENDER_SERVICE_ID:"srv-das6drvavr4c7397dflg",LDR_ONE_SANDBOX_BUSINESS_API_ENABLED:"true",LDR_ONE_SANDBOX_STATUS_API_ENABLED:"true"};
test("both endpoints are disabled by default",async()=>{
 const request=new Request(origin);
 assert.equal((await handleSandboxBusinessSeats({request,env:{}})).status,503);
 assert.equal((await handleSandboxSubscriptionStatus({request,env:{}})).status,503);
});
test("unauthenticated business request never touches database",async()=>{
 let touched=false;
 const request=new Request(origin+"/business?subscriptionId="+id);
 const response=await handleSandboxBusinessSeats({request,env,authenticate:async()=>null,verifyAdmin:async()=>false,db:{query:async()=>{touched=true;}}});
 assert.equal(response.status,403);assert.equal(touched,false);
});
test("business seat roster is company scoped",async()=>{
 const request=new Request(origin+"/business?subscriptionId="+id);
 const db={query:async(sql,values)=>{assert.deepEqual(values,[id,identity.customerId,identity.userId]);return {rows:[{user_id:null,seats:5}]};}};
 const response=await handleSandboxBusinessSeats({request,env,authenticate:async()=>identity,verifyAdmin:async()=>true,db});
 assert.equal(response.status,200);assert.deepEqual(response.body,{capacity:5,used:0,members:[]});
});
test("cross-origin business mutation blocked before authentication",async()=>{
 let called=false;
 const request=new Request(origin+"/business?subscriptionId="+id,{method:"POST",headers:{origin:"https://other.invalid","content-type":"application/json"},body:"{}"});
 const response=await handleSandboxBusinessSeats({request,env,authenticate:async()=>{called=true;}});
 assert.equal(response.status,403);assert.equal(called,false);
});
test("subscription status requires authenticated identity",async()=>{
 const request=new Request(origin+"/status",{headers:{origin}});
 assert.equal((await handleSandboxSubscriptionStatus({request,env,authenticate:async()=>null,db:{query:async()=>({rows:[]})}})).status,401);
 const db={query:async(sql)=>sql.includes("ORDER BY created_at")?{rows:[]}:{rows:[]}};
 const result=await handleSandboxSubscriptionStatus({request,env,authenticate:async()=>identity,verifyAdmin:async()=>true,db});
 assert.equal(result.status,200);assert.equal(result.body.entitlement.allowed,false);
});

test("unrecognized paths and unexpected parameters are denied",async()=>{let called=false;const authenticate=async()=>{called=true;return identity;};for(const request of [new Request(origin+"/other?subscriptionId="+id),new Request(origin+"/business?subscriptionId="+id+"&unexpected=1")]){assert.equal((await handleSandboxBusinessSeats({request,env,authenticate})).status,403);}assert.equal((await handleSandboxSubscriptionStatus({request:new Request(origin+"/other",{headers:{origin}}),env,authenticate})).status,403);assert.equal(called,false);});

test("client-provided admin claim cannot bypass trusted directory",async()=>{let touched=false;const request=new Request(origin+"/business?subscriptionId="+id);const result=await handleSandboxBusinessSeats({request,env,authenticate:async()=>identity,verifyAdmin:async()=>false,db:{query:async()=>{touched=true;}}});assert.equal(result.status,403);assert.equal(touched,false);});

test("admin directory outage fails closed without database access",async()=>{let touched=false;const request=new Request(origin+"/business?subscriptionId="+id);const response=await handleSandboxBusinessSeats({request,env,authenticate:async()=>identity,verifyAdmin:async()=>{throw Error("directory unavailable");},db:{query:async()=>{touched=true;}}});assert.equal(response.status,403);assert.equal(touched,false);});

test("status denies absent or failing authentication before DB access",async()=>{let touched=false;const request=new Request(origin+"/status",{headers:{origin}});const db={query:async()=>{touched=true;}};assert.equal((await handleSandboxSubscriptionStatus({request,env,db})).status,503);assert.equal((await handleSandboxSubscriptionStatus({request,env,db,authenticate:async()=>{throw Error("auth offline");}})).status,401);assert.equal(touched,false);});

test("invalid admin identity never reaches trusted directory or DB",async()=>{let called=false;const request=new Request(origin+"/business?subscriptionId="+id);const response=await handleSandboxBusinessSeats({request,env,authenticate:async()=>({...identity,userId:"not-a-uuid"}),verifyAdmin:async()=>{called=true;return true;},db:{query:async()=>{called=true;}}});assert.equal(response.status,403);assert.equal(called,false);});

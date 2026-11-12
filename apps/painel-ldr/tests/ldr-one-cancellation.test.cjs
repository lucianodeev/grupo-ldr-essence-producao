const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const ts=require("typescript");

const source=fs.readFileSync(path.join(__dirname,"../src/lib/ldr-pass.server.ts"),"utf8");
const output=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
function setup({row, stripeResponse, dbError=null, stripeOk=true, secret="sk_live_mock"}={}){
 const fetchCalls=[], updates=[];
 const chain={
  select(){return this},eq(){return this},in(){return this},order(){return this},limit(){return this},
  maybeSingle:async()=>({data:row??null,error:null}),
  update(patch){updates.push(patch);return this},
  then(resolve,reject){return Promise.resolve({error:dbError}).then(resolve,reject)}
 };
 const db={from(name){assert.equal(name,"ldr_pass_subscriptions");return chain}};
 const exports={};
 const context={
  module:{exports},exports,
  require(id){
   if(id==="@tanstack/react-start/server")return {getRequest:()=>null};
   if(id==="@/integrations/supabase/client.server")return {supabaseAdmin:db};
   if(id==="@/lib/client-portal.server")return {resolveClient:async()=>({status:"ok",customer:{id:"customer-1",email:"test@example.test"}})};
   throw Error("Unexpected dependency: "+id);
  },
  process:{env:{STRIPE_SECRET_KEY:secret}},
  fetch:async(url,options)=>{
   fetchCalls.push({url,options});
   return {ok:stripeOk,json:async()=>stripeResponse};
  },
  AbortSignal,URL,URLSearchParams,Date,Number,Error,Record:undefined,
 };
 vm.runInNewContext(output,context,{filename:"ldr-pass.server.js"});
 return {cancel:context.module.exports.cancelLdrPassRenewal,fetchCalls,updates};
}
const sub={id:"sub_testfixture123",status:"active",stripe_subscription_id:"sub_testfixture123",cancel_at_period_end:false};
test("period-end cancellation confirms Stripe LIVE and persists only after confirmation",async()=>{
 const app=setup({row:sub,stripeResponse:{id:sub.id,livemode:true,cancel_at_period_end:true,current_period_end:1800000000}});
 const result=await app.cancel("auth-user","test@example.test");
 assert.equal(result.ok,true);assert.equal(result.cancelAtPeriodEnd,true);
 assert.equal(app.fetchCalls.length,1);
 assert.equal(app.fetchCalls[0].options.method,"POST");
 assert.equal(new URLSearchParams(app.fetchCalls[0].options.body).get("cancel_at_period_end"),"true");
 assert.equal(app.updates.length,1);assert.equal(app.updates[0].cancel_at_period_end,true);
});
test("missing active subscription never touches Stripe",async()=>{
 const app=setup({row:null});
 await assert.rejects(()=>app.cancel("auth-user",null),/Assinatura renovável/);
 assert.equal(app.fetchCalls.length,0);
});
test("already scheduled renewal cancellation is idempotent",async()=>{
 const app=setup({row:{...sub,cancel_at_period_end:true}});
 const result=await app.cancel("auth-user",null);
 assert.equal(result.alreadyScheduled,true);assert.equal(app.fetchCalls.length,0);
});
test("wrong Stripe subscription ID never updates local record",async()=>{
 const app=setup({row:sub,stripeResponse:{id:"sub_unrelated",livemode:true,cancel_at_period_end:true}});
 await assert.rejects(()=>app.cancel("auth-user",null),/não confirmou/);
 assert.equal(app.updates.length,0);
});
test("Stripe TEST response is refused even if cancellation flag true",async()=>{
 const app=setup({row:sub,stripeResponse:{id:sub.id,livemode:false,cancel_at_period_end:true}});
 await assert.rejects(()=>app.cancel("auth-user",null),/não confirmou/);
 assert.equal(app.updates.length,0);
});
test("missing LIVE secret prevents any request",async()=>{
 const app=setup({row:sub,secret:""});
 await assert.rejects(()=>app.cancel("auth-user",null),/indisponível/);
 assert.equal(app.fetchCalls.length,0);
});

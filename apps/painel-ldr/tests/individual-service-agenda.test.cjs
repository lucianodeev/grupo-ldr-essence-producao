const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const ts=require("typescript");
const root=path.resolve(__dirname,"../src/lib");
function compiled(file,imports){const module={exports:{}};const code=ts.transpileModule(fs.readFileSync(path.join(root,file),"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 vm.runInNewContext(code,{module,exports:module.exports,require(name){if(name in imports)return imports[name];throw Error("Unexpected import: "+name)},process:{env:{}},URL,URLSearchParams,Map,Set,Date,Number,String,Promise,console},{filename:file});return module.exports;}
const catalogue=compiled("contract-catalog.ts",{});
function fixture(){
 const state={errorTable:null,writes:0,updateCalls:0,emailPattern:null,rows:{
  customers:[{id:"customer-A",auth_user_id:"user-A",full_name:"Owner",email:"owner@example.invalid",phone:null,country:"BE",portal_active:true}],
  orders:[{id:"order-A",customer_id:"customer-A",catalog_key:"mentoria_4",order_number:"TEST-1",title:"Mentoria",payment_status:"pago",status:"em_andamento"}],
  service_catalog:[{catalog_key:"mentoria_4",name:"Mentoria — 4 sessões",billing_model:"package_sessions",package_sessions:4,amount_cents:24300,currency:"EUR",active:true}],
  session_credits:[{order_id:"order-A",customer_id:"customer-A",catalog_key:"mentoria_4",granted:1}],
  appointments:[{id:"hidden",customer_id:"customer-A",order_id:"order-A",catalog_key:"mentoria_4",title:"HIDDEN INTERNAL TITLE",status:"confirmada",client_visible:false,consumes_credit:true,credit_reserved:true,meeting_url:"https://meet.google.com/hidden-secret",client_notes:"HIDDEN NOTE"}],
  appointment_calendar_sync:[],
 }};
 const db={from(table){const filters=[];const q={select(){return q},eq(k,v){filters.push(r=>r[k]===v);return q},is(k,v){filters.push(r=>r[k]===v);return q},ilike(k,v){state.emailPattern=v;filters.push(r=>String(r[k]).toLowerCase()===v.replace(/\\([\\%_])/g,'$1').toLowerCase());return q},in(k,v){filters.push(r=>v.includes(r[k]));return q},order(){return q},
  async result(single){if(table===state.errorTable)return {data:null,error:{message:"synthetic-private-diagnostic"}};const rows=(state.rows[table]??[]).filter(r=>filters.every(f=>f(r)));return {data:single?rows[0]??null:rows,error:null}},
  maybeSingle(){return q.result(true)},then(resolve,reject){return q.result(false).then(resolve,reject)},
  insert(){state.writes++;throw Error("Unexpected write")},update(){state.updateCalls++;state.writes++;throw Error("Unexpected write")},delete(){state.writes++;throw Error("Unexpected delete")},
 };return q;}};
 const api=compiled("client-portal.server.ts",{"@tanstack/react-start/server":{getRequest(){return null}},"@/integrations/supabase/client.server":{supabaseAdmin:db},"@/lib/contract-catalog":catalogue,"@/lib/individual-service-checkout.server":{individualServiceCheckoutEnabled(){return false}}});
 return {state,api};
}
test("hidden appointments reserve credit without revealing their details to the owner",async()=>{
 const f=fixture();const data=await f.api.getClientAgenda("user-A","owner@example.invalid");
 assert.equal(data.appointments.length,0);assert.equal(data.balances[0].used,1);assert.equal(data.balances[0].remaining,0);
 assert.equal(data.schedulable[0].canRequest,false);assert.equal(data.schedulable[0].limit,1);
 assert.ok(!JSON.stringify(data).includes("HIDDEN"));assert.ok(!JSON.stringify(data).includes("hidden-secret"));assert.equal(f.state.writes,0);
});
test("nominal package size never creates scheduling credit before the issuer has granted it",async()=>{
 const f=fixture();f.state.rows.session_credits=[];f.state.rows.appointments=[];
 const data=await f.api.getClientAgenda("user-A","owner@example.invalid");
 assert.equal(data.schedulable[0].limit,0);assert.equal(data.schedulable[0].canRequest,false);assert.equal(data.schedulable[0].blockedReason,"sem_credito");
});
test("a paid single session also requires a real credit row",async()=>{
 const f=fixture();f.state.rows.session_credits=[];f.state.rows.appointments=[];
 f.state.rows.orders[0].catalog_key="mentoria_sessao";
 Object.assign(f.state.rows.service_catalog[0],{catalog_key:"mentoria_sessao",billing_model:"single_paid_session",package_sessions:1});
 const data=await f.api.getClientAgenda("user-A","owner@example.invalid");assert.equal(data.schedulable[0].canRequest,false);
});
test("database failures are rejected instead of returning a false empty agenda or catalogue",async()=>{
 for(const table of ["appointments","orders","session_credits","service_catalog"]){const f=fixture();f.state.errorTable=table;await assert.rejects(f.api.getClientAgenda("user-A","owner@example.invalid"),e=>!e.message.includes("synthetic-private"));assert.equal(f.state.writes,0);}
 const f=fixture();f.state.errorTable="service_catalog";await assert.rejects(f.api.getClientContractCatalog("user-A","owner@example.invalid"));
});
test("catalogue keeps database prices and never labels projects as one-session services",async()=>{
 const f=fixture();f.state.rows.service_catalog.push({catalog_key:"landing_page",name:"Site",billing_model:"project",package_sessions:null,amount_cents:10000,currency:"EUR",active:true});
 const data=await f.api.getClientContractCatalog("user-A","owner@example.invalid");
 assert.equal(data.items.find(i=>i.catalogKey==="landing_page").sessions,0);
 assert.equal(data.items.find(i=>i.catalogKey==="mentoria_4").amountCents,24300);assert.equal(data.checkoutEnabled,false);assert.equal(f.state.writes,0);
});
test("unlinked or blocked users cannot obtain another customer's agenda",async()=>{
 const f=fixture();await assert.rejects(f.api.getClientAgenda("outsider",null));
 f.state.rows.customers[0].portal_active=false;await assert.rejects(f.api.getClientAgenda("user-A","owner@example.invalid"));assert.equal(f.state.writes,0);
});
test("account linking treats underscore and percent in an email as literal characters",async()=>{
 const f=fixture();Object.assign(f.state.rows.customers[0],{auth_user_id:null,email:"victimXname@example.invalid"});
 await assert.rejects(f.api.resolveClient("outsider","victim_name%@example.invalid"));
 assert.equal(f.state.emailPattern,"victim\\_name\\%@example.invalid");assert.equal(f.state.updateCalls,0);
 assert.equal(f.state.rows.customers[0].auth_user_id,null);
});

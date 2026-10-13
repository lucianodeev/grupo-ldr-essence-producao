const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const ts=require("typescript");

const source=fs.readFileSync(path.resolve(__dirname,"../src/lib/professional-availability.server.ts"),"utf8");
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;

function harness(){
 const rows={
  professional_accounts:[{id:"account-A",auth_user_id:"user-A"},{id:"account-B",auth_user_id:"user-B"}],
  professional_profiles:[{id:"profile-A",professional_account_id:"account-A",display_name:"A"},{id:"profile-B",professional_account_id:"account-B",display_name:"B"}],
  professional_services:[],
  professional_availability:[
   {id:"slot-A",professional_profile_id:"profile-A",professional_service_id:null,weekday:1,start_time:"09:00",end_time:"12:00",timezone:"Europe/Brussels",modality:"online",active:true},
   {id:"slot-B",professional_profile_id:"profile-B",professional_service_id:null,weekday:1,start_time:"09:00",end_time:"12:00",timezone:"Europe/Brussels",modality:"online",active:true}
  ]
 };
 let writes=0;
 const from=(table)=>{
  const filters=[], exclusions=[];
  let action="select",changes;
  const builder={
   select(){return builder},
   eq(key,value){filters.push(row=>row[key]===value);return builder},
   neq(key,value){exclusions.push(row=>row[key]!==value);return builder},
   update(values){action="update";changes=values;return builder},
   maybeSingle:async()=>{const matched=rows[table].filter(r=>filters.every(f=>f(r))&&exclusions.every(f=>f(r)));if(action==="update"){matched.forEach(r=>Object.assign(r,changes));writes+=matched.length;}return {data:matched[0]??null,error:null}},
   then(resolve,reject){return Promise.resolve({data:rows[table].filter(r=>filters.every(f=>f(r))&&exclusions.every(f=>f(r))),error:null}).then(resolve,reject)}
  };
  return builder;
 };
 const module={exports:{}};
 vm.runInNewContext(compiled,{module,exports:module.exports,require(name){if(name==="@/integrations/supabase/client.server")return {supabaseAdmin:{from}};throw Error("Unexpected import: "+name)},Intl,Date,Number,String,Error,Set,Promise}, {filename:"availability.js"});
 return {update:module.exports.updateProfessionalAvailability,disable:module.exports.disableProfessionalAvailability,rows,writes:()=>writes};
}
const input=(id)=>({availabilityId:id,startTime:"10:00",endTime:"13:00",timezone:"Europe/Brussels",intervalMinutes:60,bufferMinutes:0,modality:"online"});

test("owner can update own availability without affecting another professional",async()=>{
 const h=harness();
 await h.update("user-A",input("slot-A"));
 assert.equal(h.rows.professional_availability[0].start_time,"10:00");
 assert.equal(h.rows.professional_availability[1].start_time,"09:00");
 assert.equal(h.writes(),1);
});
test("cross-professional update is rejected and neither record changes",async()=>{
 const h=harness();
 await assert.rejects(h.update("user-A",input("slot-B")),/Disponibilidade não encontrada/);
 assert.equal(h.writes(),0);
 assert.equal(h.rows.professional_availability[0].start_time,"09:00");
 assert.equal(h.rows.professional_availability[1].start_time,"09:00");
});
test("invalid time is rejected without mutation",async()=>{
 const h=harness();
 await assert.rejects(h.update("user-A",{...input("slot-A"),startTime:"15:00",endTime:"12:00"}),/horários válidos/);
 assert.equal(h.writes(),0);
});

test("owner can disable own availability without deleting historical row",async()=>{
 const h=harness();
 await h.disable("user-A","slot-A");
 assert.equal(h.rows.professional_availability.length,2);
 assert.equal(h.rows.professional_availability[0].active,false);
 assert.equal(h.rows.professional_availability[1].active,true);
 assert.equal(h.writes(),1);
});
test("cannot disable another professional availability",async()=>{
 const h=harness();
 await assert.rejects(h.disable("user-A","slot-B"),/Disponibilidade não encontrada/);
 assert.equal(h.rows.professional_availability[1].active,true);
 assert.equal(h.writes(),0);
});
test("disabled availability cannot be updated",async()=>{
 const h=harness();
 await h.disable("user-A","slot-A");
 await assert.rejects(h.update("user-A",input("slot-A")) ,/Disponibilidade não encontrada/);
 assert.equal(h.writes(),1);
});

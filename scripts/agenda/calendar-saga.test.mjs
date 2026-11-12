import {test} from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {createRequire} from 'node:module';
const ts=createRequire(process.env.AGENDA_PG_PACKAGE||import.meta.url)('typescript');
let source=fs.readFileSync(new URL('../../apps/painel-ldr/src/lib/calendar-sync.server.ts',import.meta.url),'utf8');
source=source.replace(/import \{ supabaseAdmin \} from "@\/integrations\/supabase\/client.server";/,'const {supabaseAdmin}=globalThis.__agendaSaga;').replace(/import \{([\s\S]*?)\} from "@\/lib\/google-calendar.server";/,'const {$1}=globalThis.__agendaSaga.calendar;');
const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
let sequence=0;
async function fixture(options={}){
 const state={created:0,patched:0,cancelled:0,remote:options.remote??null,sync:options.sync??null,failPersist:options.failPersist??false,releases:[],claims:0};
 const row={id:'appointment',order_id:'order',customer_id:'customer',catalog_key:'mentoria',starts_at:'2026-12-01T12:00:00Z',duration_minutes:50};
 const db={from(table){const q={op:'read',patch:null,select(){return this},eq(){return this},update(p){this.op='update';this.patch=p;return this},upsert(p){this.op='upsert';this.patch=p;return this},async maybeSingle(){
  if(table==='appointments')return {data:row,error:null};
  if(table==='orders')return {data:{id:'order',customer_id:'customer',payment_status:options.unpaid?'pendente':'pago',catalog_key:'mentoria'},error:null};
  if(table==='customers')return {data:{email:'test@example.invalid'},error:null};
  if(table==='service_catalog')return {data:{name:'Synthetic'},error:null};
  if(this.op==='update'){
   if(state.failPersist){state.failPersist=false;return {data:null,error:{message:'injected'}}}
   state.sync={...state.sync,...this.patch};return {data:{appointment_id:'appointment'},error:null};
  }
  return {data:state.sync,error:null};
 },then(resolve,reject){return this.maybeSingle().then(resolve,reject)}};return q},async rpc(name,args){
  if(name==='claim_calendar_sync'){state.claims++;return {data:[{claimed:!options.busy,lease_token:'token',google_event_id:state.sync?.google_event_id??null,event_generation:0}],error:null}}
  state.releases.push(args._status);if(options.loseRelease)return {data:false,error:null};
  state.sync={...state.sync,google_event_id:args._event_id??state.sync?.google_event_id, sync_status:args._status};return {data:true,error:null};
 }};
 class CalendarError extends Error {constructor(code){super(code);this.code=code}}
 globalThis.__agendaSaga={supabaseAdmin:db,calendar:{CALENDAR_ID:'test-calendar',CalendarError,isCalendarConfigured:()=>true,hasConflict:async()=>false,
  createEvent:async()=>{state.created++;state.remote={eventId:'event',meetUrl:'https://meet.google.com/test'};return state.remote},
  patchEvent:async()=>{state.patched++;return state.remote},findEventByAppointment:async()=>state.remote,
  cancelEvent:async()=>{state.cancelled++;state.remote=null}}};
 const module=await import('data:text/javascript;base64,'+Buffer.from(js+'\n//fixture'+sequence++).toString('base64'));
 return {module,state};
}
test('lost DB write after Google create recovers remote event without a second create',async()=>{const {module,state}=await fixture({failPersist:true});assert.equal((await module.syncAppointmentEvent('appointment')).status,'erro');assert.equal(state.created,1);assert.equal((await module.syncAppointmentEvent('appointment')).status,'sincronizado');assert.equal(state.created,1);assert.equal(state.patched,1);});
test('lease denial never calls Google create',async()=>{const {module,state}=await fixture({busy:true});assert.equal((await module.syncAppointmentEvent('appointment')).errorCode,'ocupado');assert.equal(state.created,0)});
test('unpaid appointment never creates an external invitation',async()=>{const {module,state}=await fixture({unpaid:true});assert.equal((await module.syncAppointmentEvent('appointment')).errorCode,'nao_elegivel');assert.equal(state.created,0)});
test('lost lease release is not reported as synchronized',async()=>{const {module}=await fixture({loseRelease:true});assert.equal((await module.syncAppointmentEvent('appointment')).status,'erro')});
test('cancellation recovers orphan event by appointment marker',async()=>{const {module,state}=await fixture({sync:{sync_status:'erro'},remote:{eventId:'orphan',meetUrl:null}});assert.equal((await module.cancelAppointmentEvent('appointment')).status,'cancelado');assert.equal(state.cancelled,1)});
test('manual fallback cancels the previous external event first',async()=>{const {module,state}=await fixture({sync:{google_event_id:'existing',sync_status:'sincronizado'},remote:{eventId:'existing'}});assert.equal((await module.markManualLink('appointment')).status,'manual');assert.equal(state.cancelled,1);assert.deepEqual(state.releases,['cancelado','manual'])});

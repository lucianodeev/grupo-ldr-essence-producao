import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {createHmac,randomUUID} from 'node:crypto';
const ts=createRequire(process.env.AGENDA_PG_PACKAGE||import.meta.url)('typescript');
const original=fs.readFileSync(new URL('../../apps/painel-ldr/src/routes/api/stripe/webhook.ts',import.meta.url),'utf8');
const secret='synthetic-webhook-signing-secret-only';
const source=original.replace('import { createFileRoute } from "@tanstack/react-router";','const createFileRoute=()=>config=>config;')
 .replace('const { supabaseAdmin } = await import("@/integrations/supabase/client.server");','const supabaseAdmin=globalThis.__agendaWebhookDB;');
assert.notEqual(source,original);
assert(!source.includes('await import("@/integrations/supabase/client.server")'));
const code=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText;
async function fixture(){
 const state={events:new Set(),updates:[],calls:0};
 globalThis.__agendaWebhookDB={from(table){
  state.calls++;const q={op:'read',row:null,filters:{},select(){return this},insert(row){this.op='insert';this.row=row;return this},update(row){this.op='update';this.row=row;return this},delete(){this.op='delete';return this},eq(k,v){this.filters[k]=v;return this},order(){return this},limit(){return this},
   async maybeSingle(){
    if(table==='stripe_webhook_events'&&this.op==='insert'){
     if(state.events.has(this.row.event_id))return {data:null,error:{code:'23505'}};
     state.events.add(this.row.event_id);return {data:{event_id:this.row.event_id},error:null};
    }
    if(table==='orders'&&this.op==='update'){state.updates.push({id:this.filters.id,...this.row});return {data:null,error:null};}
    return {data:null,error:null};
   },then(resolve,reject){return this.maybeSingle().then(resolve,reject)}};return q;
 },async rpc(){throw Error('Unexpected unrelated RPC in agenda payment test');}};
 process.env.STRIPE_WEBHOOK_SECRET=secret;
 const module=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64')+'#'+randomUUID());
 const post=module.Route.server.handlers.POST;
 const event=(type='checkout.session.completed',paid='paid')=>({id:'evt_'+randomUUID(),type,data:{object:{id:'cs_synthetic',payment_status:paid,amount_total:100,currency:'eur',metadata:{order_id:'synthetic-order'}}}});
 const send=(e,options={})=>{
  const raw=typeof e==='string'?e:JSON.stringify(e),t=options.timestamp??Math.floor(Date.now()/1000);
  const sig=options.signature??`t=${t},v1=${createHmac('sha256',secret).update(`${t}.${raw}`).digest('hex')}`;
  return post({request:new Request('https://example.invalid/api/stripe/webhook',{method:'POST',headers:{'stripe-signature':sig,'content-type':'application/json'},body:raw})});
 };
 return {state,event,send};
}

test('actual webhook rejects missing, invalid and stale signatures before touching the database',async()=>{
 const {state,event,send}=await fixture();
 for(const options of [{signature:''},{signature:'t=1,v1=invalid'},{timestamp:Math.floor(Date.now()/1000)-601}])assert.equal((await send(event(),options)).status,400);
 assert.equal(state.calls,0);
});
test('actual webhook rejects oversized bodies before database writes',async()=>{
 const {state,send}=await fixture();assert.equal((await send('x'.repeat(256*1024+1))).status,413);assert.equal(state.calls,0);
});
test('signed paid checkout updates its order once and duplicate event does not fulfill again',async()=>{
 const {state,event,send}=await fixture();const e=event();assert.equal((await send(e)).status,200);assert.equal((await send(e)).status,200);
 assert.equal(state.updates.length,1);assert.equal(state.updates[0].id,'synthetic-order');assert.equal(state.updates[0].payment_status,'pago');
});
test('unpaid checkout does not confirm payment',async()=>{
 const {state,event,send}=await fixture();assert.equal((await send(event('checkout.session.completed','unpaid'))).status,200);assert.equal(state.updates.length,0);
});
test('asynchronous successful checkout confirms payment only when paid',async()=>{
 const {state,event,send}=await fixture();assert.equal((await send(event('checkout.session.async_payment_succeeded'))).status,200);assert.equal(state.updates.length,1);assert.equal(state.updates[0].payment_status,'pago');
});
test('failed asynchronous checkout records failed payment',async()=>{
 const {state,event,send}=await fixture();assert.equal((await send(event('checkout.session.async_payment_failed','unpaid'))).status,200);assert.equal(state.updates.length,1);assert.equal(state.updates[0].payment_status,'falhou');
});
test('signed refund marks its order refunded and remains idempotent',async()=>{
 const {state,event,send}=await fixture();const e=event('charge.refunded');assert.equal((await send(e)).status,200);assert.equal((await send(e)).status,200);assert.equal(state.updates.length,1);assert.equal(state.updates[0].payment_status,'reembolsado');
});

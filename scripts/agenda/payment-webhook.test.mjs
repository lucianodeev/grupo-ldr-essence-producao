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
async function fixture(order=null){
 const state={events:new Set(),updates:[],calls:0,order};
 globalThis.__agendaWebhookDB={from(table){
  state.calls++;const q={op:'read',row:null,filters:{},select(){return this},insert(row){this.op='insert';this.row=row;return this},update(row){this.op='update';this.row=row;return this},delete(){this.op='delete';return this},eq(k,v){this.filters[k]=v;return this},in(k,v){this.filters[k]={in:v};return this},order(){return this},limit(){return this},
   async maybeSingle(){
    if(table==='stripe_webhook_events'&&this.op==='insert'){
     if(state.events.has(this.row.event_id))return {data:null,error:{code:'23505'}};
     state.events.add(this.row.event_id);return {data:{event_id:this.row.event_id},error:null};
    }
    if(table==='stripe_webhook_events'&&this.op==='delete'){state.events.delete(this.filters.event_id);return {data:null,error:null};}
    if(table==='orders'&&this.op==='update'){if(state.beforeUpdate){state.beforeUpdate();state.beforeUpdate=null;}if(state.order&&Object.entries(this.filters).some(([k,v])=>v&&typeof v==='object'&&v.in&&!v.in.includes(state.order[k])))return {data:null,error:null};state.updates.push({id:this.filters.id,...this.row});if(state.order)Object.assign(state.order,this.row);return {data:null,error:null};}
    if(table==='orders'&&this.op==='read'&&state.order?.id===this.filters.id)return {data:state.order,error:null};
    return {data:null,error:null};
   },then(resolve,reject){return this.maybeSingle().then(resolve,reject)}};return q;
 },async rpc(){throw Error('Unexpected unrelated RPC in agenda payment test');}};
 for(const k of ['STRIPE_WEBHOOK_VALIDATION_ENABLED','STRIPE_WEBHOOK_VALIDATION_EXPIRES_AT','STRIPE_WEBHOOK_VALIDATION_NONCE','STRIPE_WEBHOOK_TEST_SECRET'])delete process.env[k];
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

function enableDeliveryValidation(){
 process.env.STRIPE_WEBHOOK_VALIDATION_ENABLED='true';
 process.env.STRIPE_WEBHOOK_VALIDATION_EXPIRES_AT=new Date(Date.now()+1800000).toISOString();
 process.env.STRIPE_WEBHOOK_VALIDATION_NONCE='a'.repeat(48);
 process.env.STRIPE_WEBHOOK_TEST_SECRET='whsec_synthetic_delivery_only';
}
function testSignature(e){const t=Math.floor(Date.now()/1000);return {signature:`t=${t},v1=${createHmac('sha256','whsec_synthetic_delivery_only').update(`${t}.${JSON.stringify(e)}`).digest('hex')}`};}
test('sandbox delivery receipt is scoped, prefixed, idempotent and never updates orders',async()=>{
 const {state,event,send}=await fixture();enableDeliveryValidation();const e=event('customer.created');e.livemode=false;e.data.object.metadata={ldr_agenda_validation:'a'.repeat(48)};e.id='evt_fixtureDelivery';
 const first=await send(e,testSignature(e));assert.equal(first.status,200);assert.equal((await first.json()).validationOnly,true);
 const again=await send(e,testSignature(e));assert.equal((await again.json()).duplicate,true);
 assert.deepEqual([...state.events],['ldr_validation:evt_fixtureDelivery']);assert.equal(state.updates.length,0);
});
test('sandbox key cannot confirm payments, accept live events or bypass nonce',async()=>{
 for(const change of ['payment','live','nonce']){
  const {state,event,send}=await fixture();enableDeliveryValidation();const e=event('customer.created');e.id='evt_fixtureBlocked';e.livemode=false;e.data.object.metadata={ldr_agenda_validation:'a'.repeat(48)};
  if(change==='payment')e.type='checkout.session.completed';if(change==='live')e.livemode=true;if(change==='nonce')e.data.object.metadata.ldr_agenda_validation='wrong';
  assert.equal((await send(e,testSignature(e))).status,400);assert.equal(state.calls,0);
 }
});
test('disabled or expired sandbox validation fails before database access',async()=>{
 for(const change of ['disabled','expired']){
  const {state,event,send}=await fixture();enableDeliveryValidation();const e=event('customer.created');e.id='evt_fixtureExpired';e.livemode=false;e.data.object.metadata={ldr_agenda_validation:'a'.repeat(48)};
  if(change==='disabled')process.env.STRIPE_WEBHOOK_VALIDATION_ENABLED='false';else process.env.STRIPE_WEBHOOK_VALIDATION_EXPIRES_AT=new Date(Date.now()-1).toISOString();
  assert.equal((await send(e,testSignature(e))).status,400);assert.equal(state.calls,0);
 }
});

const individualOrder=()=>({id:'synthetic-order',customer_id:'customer-A',catalog_key:'mentoria_4',amount_cents:100,currency:'EUR',payment_status:'pendente',status:'novo',stripe_checkout_session_id:'cs_synthetic',metadata:{checkout_kind:'individual_service',checkout_expires_at:1800003600}});
function individualEvent(f,type='checkout.session.completed'){
 const e=f.event(type);e.data.object.metadata={checkout_kind:'individual_service',order_id:'synthetic-order',customer_id:'customer-A',catalog_key:'mentoria_4'};
 e.data.object.payment_intent='pi_synthetic';return e;
}
test('individual payment validates ownership, price, currency and session before confirming',async()=>{
 const f=await fixture(individualOrder()),e=individualEvent(f);
 assert.equal((await f.send(e)).status,200);assert.equal(f.state.order.payment_status,'pago');assert.equal(f.state.order.status,'em_andamento');
 assert.equal(f.state.order.metadata.checkout_expires_at,1800003600);
 assert.equal((await f.send(e)).status,200);assert.equal(f.state.updates.length,1);
});
test('individual mismatched amount, currency, customer, product or session cannot release credits',async()=>{
 for(const mismatch of ['amount','currency','customer','catalog','session']){
  const f=await fixture(individualOrder()),e=individualEvent(f),o=e.data.object;
  if(mismatch==='amount')o.amount_total=1;if(mismatch==='currency')o.currency='brl';if(mismatch==='customer')o.metadata.customer_id='customer-B';if(mismatch==='catalog')o.metadata.catalog_key='mentoria_8';if(mismatch==='session')o.id='cs_other';
  assert.equal((await f.send(e)).status,503);assert.equal(f.state.updates.length,0);assert.equal(f.state.order.payment_status,'pendente');
 }
});
test('unpaid individual checkout remains pending and cannot be used as payment proof',async()=>{
 const f=await fixture(individualOrder()),e=individualEvent(f);e.data.object.payment_status='unpaid';
 assert.equal((await f.send(e)).status,200);assert.equal(f.state.updates.length,0);
});
test('late failed or expired events cannot undo a confirmed individual service payment',async()=>{
 const f=await fixture(individualOrder());await f.send(individualEvent(f));
 for(const type of ['checkout.session.async_payment_succeeded','checkout.session.expired','checkout.session.async_payment_failed','payment_intent.payment_failed'])assert.equal((await f.send(individualEvent(f,type))).status,200);
 assert.equal(f.state.updates.length,1);assert.equal(f.state.order.payment_status,'pago');
});
test('payment confirmed while a failed event is in flight is protected by the database update predicate',async()=>{
 const f=await fixture(individualOrder());f.state.beforeUpdate=()=>{f.state.order.payment_status='pago';};
 assert.equal((await f.send(individualEvent(f,'checkout.session.expired'))).status,200);
 assert.equal(f.state.updates.length,0);assert.equal(f.state.order.payment_status,'pago');
});
test('full individual refund is final; partial refund is recorded without pretending it is full',async()=>{
 const f=await fixture(individualOrder());await f.send(individualEvent(f));
 const partial=individualEvent(f,'charge.refunded');Object.assign(partial.data.object,{amount:100,amount_refunded:50});
 assert.equal((await f.send(partial)).status,200);assert.equal(f.state.order.payment_status,'pago');assert.equal(f.state.order.metadata.refund_amount_cents,50);
 const full=individualEvent(f,'charge.refunded');Object.assign(full.data.object,{amount:100,amount_refunded:100});
 assert.equal((await f.send(full)).status,200);assert.equal(f.state.order.payment_status,'reembolsado');
 await f.send(individualEvent(f));assert.equal(f.state.order.payment_status,'reembolsado');
});
test('full refund arriving before checkout completion prevents later credit release',async()=>{
 const f=await fixture(individualOrder()),refund=individualEvent(f,'charge.refunded');
 Object.assign(refund.data.object,{amount:100,amount_refunded:100});
 assert.equal((await f.send(refund)).status,200);assert.equal(f.state.order.payment_status,'reembolsado');
 assert.equal((await f.send(individualEvent(f))).status,200);assert.equal(f.state.updates.length,1);
 assert.equal(f.state.order.payment_status,'reembolsado');
});
test('refund confirmed while checkout completion is in flight wins the conditional payment update',async()=>{
 const f=await fixture(individualOrder());f.state.beforeUpdate=()=>{f.state.order.payment_status='reembolsado';};
 assert.equal((await f.send(individualEvent(f))).status,200);assert.equal(f.state.updates.length,0);
 assert.equal(f.state.order.payment_status,'reembolsado');
});

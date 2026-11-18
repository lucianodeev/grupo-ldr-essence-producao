import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {createHmac,randomUUID} from 'node:crypto';
const ts=createRequire(process.env.AGENDA_PG_PACKAGE||import.meta.url)('typescript');
const original=fs.readFileSync(new URL('../../apps/painel-ldr/src/routes/api/stripe/webhook.ts',import.meta.url),'utf8');
const secret='synthetic-webhook-signing-secret-only';
const sandboxModule = new URL('../../apps/painel-ldr/src/lib/ldr-store-sandbox.ts', import.meta.url).href;
const source=original.replace('import { createFileRoute } from "@tanstack/react-router";','const createFileRoute=()=>config=>config;')
 .replace('const { supabaseAdmin } = await import("@/integrations/supabase/client.server");','const supabaseAdmin=globalThis.__agendaWebhookDB;')
 .replace('"@/lib/ldr-store-sandbox"', JSON.stringify(sandboxModule));
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
    if(table==='orders'&&this.op==='update'){if(state.failNextUpdate){state.failNextUpdate=false;return {data:null,error:{message:'synthetic'}};}if(state.beforeUpdate){state.beforeUpdate();state.beforeUpdate=null;}if(state.order&&Object.entries(this.filters).some(([k,v])=>v&&typeof v==='object'&&v.in&&!v.in.includes(state.order[k])))return {data:null,error:null};state.updates.push({id:this.filters.id,...this.row});if(state.order)Object.assign(state.order,this.row);return {data:null,error:null};}
    if(table==='orders'&&this.op==='read'&&state.order?.id===this.filters.id)return {data:state.order,error:null};
    return {data:null,error:null};
   },then(resolve,reject){return this.maybeSingle().then(resolve,reject)}};return q;
 },async rpc(){throw Error('Unexpected unrelated RPC in agenda payment test');}};
 for(const k of ['STRIPE_WEBHOOK_VALIDATION_ENABLED','STRIPE_WEBHOOK_VALIDATION_EXPIRES_AT','STRIPE_WEBHOOK_VALIDATION_NONCE','STRIPE_WEBHOOK_TEST_SECRET'])delete process.env[k];
 process.env.STRIPE_WEBHOOK_SECRET=secret;process.env.STRIPE_SECRET_KEY="sk_test_syntheticOnly";
 const module=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64')+'#'+randomUUID());
 const post=module.Route.server.handlers.POST;
 const event=(type='checkout.session.completed',paid='paid')=>({id:'evt_'+randomUUID(),type,data:{object:{id:'cs_synthetic',payment_status:paid,amount_total:100,currency:'eur',metadata:{order_id:'synthetic-order'}}}});
 const send=(e,options={})=>{
  const raw=typeof e==='string'?e:JSON.stringify(e),t=options.timestamp??Math.floor(Date.now()/1000);
  const sig=options.signature??`t=${t},v1=${createHmac('sha256',secret).update(`${t}.${raw}`).digest('hex')}`;
  return post({request:new Request(options.url ?? 'https://example.invalid/api/stripe/webhook',{method:'POST',headers:{'stripe-signature':sig,'content-type':'application/json'},body:raw})});
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
test('single mentorship releases its paid state only from a matching signed 75 EUR checkout',async()=>{
 const f=await fixture({...individualOrder(),catalog_key:'mentoria_sessao',amount_cents:7500});
 const e=individualEvent(f);e.data.object.metadata.catalog_key='mentoria_sessao';e.data.object.amount_total=7500;
 e.data.object.payment_status='unpaid';
 assert.equal((await f.send(e)).status,200);assert.equal(f.state.updates.length,0);
 e.id='evt_'+randomUUID();e.type='checkout.session.async_payment_succeeded';e.data.object.payment_status='paid';
 assert.equal((await f.send(e)).status,200);assert.equal(f.state.order.payment_status,'pago');
 assert.equal(f.state.order.catalog_key,'mentoria_sessao');assert.equal(f.state.order.amount_cents,7500);
 assert.equal((await f.send(e)).status,200);assert.equal(f.state.updates.length,1);
});
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

const quoteOrder=()=>({...individualOrder(),catalog_key:null,metadata:{checkout_kind:'enterprise_quote',quote_state:'accepted',sessions:0,checkout_expires_at:1800003600}});
function quoteEvent(f,type='checkout.session.completed',paid='paid') {
 const e=f.event(type,paid);e.livemode=false;e.data.object.metadata={checkout_kind:'enterprise_quote',order_id:'synthetic-order',customer_id:'customer-A',catalog_key:''};return e;
}
test('approved quote payment validates signed exact amount, owner, currency and session and stays idempotent',async()=>{
 const f=await fixture(quoteOrder()),e=quoteEvent(f);assert.equal((await f.send(e)).status,200);assert.equal((await f.send(e)).status,200);assert.equal(f.state.updates.length,1);assert.equal(f.state.order.payment_status,'pago');assert.equal(f.state.order.metadata.quote_state,'accepted');
});
test('quote cannot fulfill from unpaid, unaccepted, mismatched or wrong-mode events',async()=>{
 const unpaid=await fixture(quoteOrder());assert.equal((await unpaid.send(quoteEvent(unpaid,'checkout.session.completed','unpaid'))).status,200);assert.equal(unpaid.state.updates.length,0);
 for(const patch of [{amount_total:1},{currency:'brl'},{id:'cs_other'},{metadata:{checkout_kind:'enterprise_quote',order_id:'synthetic-order',customer_id:'other',catalog_key:''}}]){const f=await fixture(quoteOrder()),e=quoteEvent(f);Object.assign(e.data.object,patch);assert.equal((await f.send(e)).status,503);assert.equal(f.state.order.payment_status,'pendente');}
 for(const patch of [{metadata:{...quoteOrder().metadata,quote_state:'approved'}},{stripe_checkout_session_id:null}]){const f=await fixture({...quoteOrder(),...patch});assert.equal((await f.send(quoteEvent(f))).status,503);assert.equal(f.state.updates.length,0);}
 const f=await fixture(quoteOrder()),e=quoteEvent(f);e.livemode=true;assert.equal((await f.send(e)).status,503);
});
test('lost quote update is not acknowledged and the same signed event can retry',async()=>{
 const f=await fixture(quoteOrder()),e=quoteEvent(f);f.state.failNextUpdate=true;assert.equal((await f.send(e)).status,503);assert.equal(f.state.events.has(e.id),false);assert.equal((await f.send(e)).status,200);assert.equal(f.state.order.payment_status,'pago');
});
test('delayed quote success is confirmed; late expiry and failure cannot undo payment',async()=>{
 const f=await fixture(quoteOrder());assert.equal((await f.send(quoteEvent(f,'checkout.session.async_payment_succeeded'))).status,200);for(const type of ['checkout.session.expired','checkout.session.async_payment_failed','payment_intent.payment_failed'])assert.equal((await f.send(quoteEvent(f,type,'unpaid'))).status,200);assert.equal(f.state.order.payment_status,'pago');assert.equal(f.state.updates.length,1);
});
test('quote failure and expiration do not grant paid state',async()=>{
 for(const type of ['checkout.session.expired','checkout.session.async_payment_failed']){const f=await fixture(quoteOrder());assert.equal((await f.send(quoteEvent(f,type,'unpaid'))).status,200);assert.equal(f.state.order.payment_status,'falhou');}
});
test('refunded quote stays refunded if completion arrives later; partial refunds are not mislabeled as full',async()=>{
 for(const refunded of [50,100]){const f=await fixture(quoteOrder()),e=quoteEvent(f,'charge.refunded');Object.assign(e.data.object,{amount:100,amount_refunded:refunded,currency:'eur'});assert.equal((await f.send(e)).status,200);assert.equal(f.state.order.payment_status,refunded===100?'reembolsado':'pendente');if(refunded===100){assert.equal((await f.send(quoteEvent(f))).status,200);assert.equal(f.state.order.payment_status,'reembolsado');}}
});
test('financial confirmation preserves an already cancelled quote so it cannot reopen scheduling',async()=>{
 const f=await fixture({...quoteOrder(),status:'cancelado'});assert.equal((await f.send(quoteEvent(f))).status,200);assert.equal(f.state.order.payment_status,'pago');assert.equal(f.state.order.status,'cancelado');
});
test('fixed project checkout uses the same guarded exact-price provider event path',async()=>{
 const order={...quoteOrder(),metadata:{checkout_kind:'catalog_service',sessions:0}};const f=await fixture(order),e=quoteEvent(f);e.data.object.metadata.checkout_kind='catalog_service';assert.equal((await f.send(e)).status,200);assert.equal(f.state.order.payment_status,'pago');
});

const storeCheckoutUrl = 'http://127.0.0.1:3000/api/stripe/webhook';

function prepareStoreDelivery(t) {
 const settings = {
  LDR_STORE_SANDBOX_ENABLED: 'true',
  SUPABASE_SERVICE_ROLE_KEY: 'local-fixture',
  SUPABASE_URL: 'http://127.0.0.1:54321',
  VITE_SUPABASE_URL: 'http://127.0.0.1:54321',
  CLIENT_PANEL_URL: 'http://127.0.0.1:3000',
 };
 const prior = new Map(Object.keys(settings).map(key => [key, process.env[key]]));
 Object.assign(process.env, settings);
 t.after(() => {
  for (const [key, value] of prior) {
   if (value === undefined) delete process.env[key];
   else process.env[key] = value;
  }
 });
}

function storeOrder() {
 return { ...individualOrder(), catalog_key: 'ebook_estudos_caso_psicanalise', amount_cents: 1490,
  stripe_checkout_session_id: 'cs_test_fixture', metadata: { checkout_kind: 'ldr_store_sandbox' } };
}

function storeEvent(f, type) {
 const event = f.event(type);
 event.livemode = false;
 Object.assign(event.data.object, { id: 'cs_test_fixture', amount_total: 1490, payment_intent: 'pi_fixture',
  metadata: { checkout_kind: 'ldr_store_sandbox', order_id: 'synthetic-order', customer_id: 'customer-A',
   catalog_key: 'ebook_estudos_caso_psicanalise', product_key: 'ebook_estudos_caso_psicanalise' } });
 return event;
}

test('store checkout only delivers the paid edition once through the signed test session', async (t) => {
 prepareStoreDelivery(t);
 const f = await fixture(storeOrder());
 const badAmount = storeEvent(f);
 badAmount.data.object.amount_total = 1489;
 assert.equal((await f.send(badAmount, { url: storeCheckoutUrl })).status, 503);
 const badSession = storeEvent(f);
 badSession.data.object.id = 'cs_test_other';
 assert.equal((await f.send(badSession, { url: storeCheckoutUrl })).status, 503);
 assert.equal(f.state.updates.length, 0);

 const paid = storeEvent(f);
 assert.equal((await f.send(paid, { url: storeCheckoutUrl })).status, 200);
 assert.equal((await (await f.send(paid, { url: storeCheckoutUrl })).json()).duplicate, true);
 assert.equal(f.state.updates.length, 1);
 assert.equal(f.state.order.payment_status, 'pago');
 assert.equal(f.state.order.status, 'concluido');

 const refund = storeEvent(f, 'charge.refunded');
 Object.assign(refund.data.object, { id: 'ch_fixture', amount: 1490, amount_refunded: 1490 });
 assert.equal((await f.send(refund, { url: storeCheckoutUrl })).status, 200);
 assert.equal(f.state.order.payment_status, 'reembolsado');
 assert.equal((await f.send(paid, { url: storeCheckoutUrl })).status, 200);
 assert.equal(f.state.updates.length, 2);
});

test('store event cannot touch orders on a public URL or using a live event', async (t) => {
 prepareStoreDelivery(t);
 const f = await fixture(storeOrder());
 const event = storeEvent(f);
 assert.equal((await f.send(event)).status, 400);
 event.livemode = true;
 assert.equal((await f.send(event, { url: storeCheckoutUrl })).status, 400);
 assert.equal(f.state.calls, 0);
});

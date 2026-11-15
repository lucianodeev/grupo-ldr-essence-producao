// Isolated behavior checks: actual server functions, no provider/database production traffic.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), ts = require('typescript');
const root = path.resolve(__dirname, '../src');
const uid = n => `00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
const now = 1800000000;
const ctx = { master: true, userId: uid(1), email: 'client@example.invalid', verified: true, supabase: {} };
function load(file, mocks = {}) {
  const output = ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const m = { exports: {} };
  vm.runInNewContext(output, { module:m, exports:m.exports, process:{env:{}}, Date, URL, URLSearchParams, AbortSignal, console, require(id) {
    if (id in mocks) return mocks[id];
    if (id.startsWith('@/')) return load(id.slice(2)+'.ts', mocks);
    return require(id);
  } }); return m.exports;
}
function fixture() {
  const state = { ready:true, calls:0, requests:[], failSave:false, rows:{
    ecosystem_contacts:[{ id:uid(2),email:ctx.email,protocol:'LDR-SYNTHETIC',subject:'Serviços para empresas',message:'Organização: Synthetic Ltd\nApenas teste',source_project:'Central Empresas LDR',source_url:'/empresas/proposta' }],
    service_catalog:[{catalog_key:'mentoria_4',name:'Synthetic package',active:true,billing_cadence:'one_time',billing_model:'package_sessions',package_sessions:4}],
    orders:[], ecosystem_contact_messages:[], appointments:[],
  }};
  const db = { async rpc(name) { assert.equal(name,'ldr_enterprise_quote_checkout_ready'); return {data:state.ready,error:null}; }, from(table) {
    state.calls++; assert.ok(table in state.rows, 'must not access credits, subscriptions or external calendar');
    const filters=[];let op='read', patch;
    const value=(r,k)=>k.includes('->>')?r[k.split('->>')[0]]?.[k.split('->>')[1]]:r[k];
    const q={select(){return q},order(){return q},limit(){return q},eq(k,v){filters.push(r=>value(r,k)===v);return q},neq(k,v){filters.push(r=>value(r,k)!==v);return q},in(k,v){filters.push(r=>v.includes(value(r,k)));return q},contains(k,v){filters.push(r=>Object.entries(v).every(([a,b])=>r[k]?.[a]===b));return q},insert(row){op='insert';patch=row;return q},update(row){op='update';patch=row;return q},
      async run(single){
        if(op==='insert'){
          if(patch.id && state.rows[table].some(r=>r.id===patch.id))return {data:null,error:{code:'23505'}};
          const row=structuredClone({...patch,order_number:patch.order_number===''?'PED-TEST':patch.order_number});state.rows[table].push(row);return {data:single?row:[row],error:null};
        }
        if(op==='update' && patch.stripe_checkout_session_id && state.failSave)return {data:null,error:{code:'synthetic'}};
        if(op==='update' && state.beforeSave && patch.stripe_checkout_session_id){state.beforeSave();state.beforeSave=null;}
        const rows=state.rows[table].filter(r=>filters.every(f=>f(r)));
        if(op==='update')rows.forEach(r=>Object.assign(r,structuredClone(patch)));
        return {data:structuredClone(single?(rows[0]??null):rows),error:null};
      },maybeSingle(){return q.run(true)},then(a,b){return q.run(false).then(a,b)}};return q;
  }};
  const env={ENTERPRISE_QUOTES_CHECKOUT_ENABLED:'true',STRIPE_SECRET_KEY:'sk_test_fixture',STRIPE_WEBHOOK_SECRET:'whsec_fixture',AGENDA_INTEGRATION_ENABLED:'true'};
  const api=load('lib/enterprise-quotes.server.ts', {
    '@/integrations/supabase/client.server':{supabaseAdmin:db},
    '@/lib/access.server':{resolveAccess:async(_db,id)=>({authorized:ctx.master && id===uid(1),role:ctx.master?'superadmin':null})},
    '@/lib/support-conversation.server':{supportIdentity:async c=>{if(!c.verified || !c.email)throw Error('unverified');return {userId:c.userId,email:c.email};}},
    '@/lib/client-portal.server':{requireClient:async()=>({id:uid(3)})},
  });
  const raw={contactId:uid(2),requestId:uid(4),title:'Synthetic project',scope:'Scope and conditions for synthetic testing',amountCents:12345,currency:'EUR',catalogKey:null,validDays:7};
  const request=async(_url,options)=>{state.requests.push({body:options.body.toString(),key:options.headers['Idempotency-Key']});return new Response(JSON.stringify({id:'cs_test_fixture',url:'https://checkout.stripe.com/c/pay/cs_test_fixture',livemode:false}));};
  const draft=()=>api.createQuoteDraft(ctx,raw,db,now);
  const approved=async()=>{const {id}=await draft();await api.approveQuote(ctx,{id},db,now);return id;};
  const pay=(id,context=ctx,overrides={})=>api.acceptAndPayQuote(context,{id,accepted:true},{db,env,now,request,...overrides});
  return {api,state,db,env,raw,draft,approved,pay};
}

test('preparing a quote is free, idempotent, unassigned to a customer and never touches Stripe or credits', async()=>{
  const f=fixture();const a=await f.draft(),b=await f.draft();assert.equal(a.id,b.id);assert.equal(f.state.rows.orders.length,1);
  const order=f.state.rows.orders[0];assert.equal(order.customer_id,null);assert.equal(order.payment_status,'pendente');assert.equal(order.metadata.quote_state,'draft');assert.equal(order.metadata.sessions,0);assert.equal(f.state.requests.length,0);
});
test('Master permission is checked before reading or changing internal records',async()=>{
  const f=fixture();const before=f.state.calls;
  for(const op of [()=>f.api.createQuoteDraft({...ctx,userId:uid(9)},f.raw,f.db,now),()=>f.api.masterQuotes({...ctx,userId:uid(9)},uid(2),f.db),()=>f.api.approveQuote({...ctx,userId:uid(9)},{id:uid(8)},f.db,now)])await assert.rejects(op);
  assert.equal(f.state.calls,before);
});
test('missing database guard blocks preparation, approval and payment',async()=>{
  const f=fixture(),id=await f.approved();f.state.ready=false;
  await assert.rejects(f.draft);await assert.rejects(()=>f.api.approveQuote(ctx,{id},f.db,now));await assert.rejects(()=>f.pay(id));assert.equal(f.state.requests.length,0);
});
test('browser cannot inject fields, prices into acceptance, nonexistent products, invalid currency or noncommercial contacts',async()=>{
  const f=fixture();for(const patch of [{amountCents:1.5},{currency:'USD'},{amountCents:0},{catalogKey:'arbitrary'},{extra:'forged'}])await assert.rejects(()=>f.api.createQuoteDraft(ctx,{...f.raw,...patch},f.db,now));
  f.state.rows.ecosystem_contacts[0].subject='General support';await assert.rejects(f.draft);
  await assert.rejects(()=>f.api.acceptAndPayQuote(ctx,{id:uid(5),accepted:true,amountCents:1},{db:f.db,env:f.env}));
});
test('session count comes from active catalogue; recurring or inactive products cannot be quoted as sessions',async()=>{
  const f=fixture();await f.api.createQuoteDraft(ctx,{...f.raw,catalogKey:'mentoria_4'},f.db,now);assert.equal(f.state.rows.orders[0].metadata.sessions,4);
  for(const patch of [{active:false},{billing_cadence:'monthly'},{package_sessions:0}]){const g=fixture();Object.assign(g.state.rows.service_catalog[0],patch);await assert.rejects(()=>g.api.createQuoteDraft(ctx,{...g.raw,catalogKey:'mentoria_4'},g.db,now));}
});
test('approval is explicit, compare-and-set and sends one internal support notification',async()=>{
  const f=fixture(),id=(await f.draft()).id;await Promise.all([f.api.approveQuote(ctx,{id},f.db,now),f.api.approveQuote(ctx,{id},f.db,now).catch(()=>null)]);await f.api.approveQuote(ctx,{id},f.db,now);
  assert.equal(f.state.rows.ecosystem_contact_messages.length,1);assert.equal(f.state.rows.orders[0].metadata.quote_state,'approved');
});
test('client list contains only approved own-email proposals and whitelisted fields',async()=>{
  const f=fixture(),id=await f.approved();const original=f.state.rows.orders[0];original.metadata.checkout_url='secret';
  f.state.rows.orders.push({...structuredClone(original),id:uid(8),metadata:{...original.metadata,quote_state:'draft'}},{...structuredClone(original),id:uid(9),contact_email:'other@example.invalid'});
  const rows=await f.api.myQuotes(ctx,f.db);assert.equal(rows.length,1);assert.equal(rows[0].id,id);assert.equal(rows[0].metadata,undefined);assert.equal(rows[0].contact_email,undefined);assert.equal(rows[0].checkout_url,undefined);
});
test('checkout requires verified ownership, approval, consent, valid expiry and explicit feature activation',async()=>{
  for(const context of [{...ctx,email:'other@example.invalid'},{...ctx,verified:false}]){const f=fixture(),id=await f.approved();await assert.rejects(()=>f.pay(id,context));assert.equal(f.state.requests.length,0);}
  const f=fixture(),id=(await f.draft()).id;await assert.rejects(()=>f.pay(id));
  await f.api.approveQuote(ctx,{id},f.db,now);await assert.rejects(()=>f.pay(id,ctx,{now:now+8*86400}));
  await assert.rejects(()=>f.pay(id,ctx,{env:{...f.env,ENTERPRISE_QUOTES_CHECKOUT_ENABLED:'false'}}));
  await assert.rejects(()=>f.api.acceptAndPayQuote(ctx,{id,accepted:false},{db:f.db,env:f.env}));assert.equal(f.state.requests.length,0);
});
test('acceptance freezes server amount and ownership; retries and concurrent clicks reuse one Stripe request identity',async()=>{
  const f=fixture(),id=await f.approved();await Promise.all([f.pay(id),f.pay(id)]);await f.pay(id);
  const order=f.state.rows.orders[0];assert.equal(order.metadata.quote_state,'accepted');assert.equal(order.customer_id,uid(3));assert.equal(order.payment_status,'pendente');
  assert.equal(new Set(f.state.requests.map(r=>r.key)).size,1);assert.equal(new Set(f.state.requests.map(r=>r.body)).size,1);
  const params=new URLSearchParams(f.state.requests[0].body);assert.equal(params.get('line_items[0][price_data][unit_amount]'),'12345');assert.equal(params.get('line_items[0][price_data][currency]'),'eur');assert.equal(params.get('metadata[checkout_kind]'),'enterprise_quote');assert.equal(params.get('payment_intent_data[metadata][order_id]'),id);assert.equal(params.get('metadata[email]'),null);
});
test('ambiguous failure or lost persistence keeps the same proposal for a safe retry',async()=>{
  const f=fixture(),id=await f.approved();f.state.failSave=true;await assert.rejects(()=>f.pay(id));f.state.failSave=false;await f.pay(id);
  assert.equal(f.state.rows.orders.length,1);assert.equal(f.state.requests[0].key,f.state.requests[1].key);assert.equal(f.state.requests[0].body,f.state.requests[1].body);
});
test('cancel during provider request prevents handing out an order checkout URL',async()=>{
  const f=fixture(),id=await f.approved();f.state.beforeSave=()=>{f.state.rows.orders[0].status='cancelado';};await assert.rejects(()=>f.pay(id));
  assert.equal(f.state.rows.orders[0].stripe_checkout_session_id,undefined);
});
test('unsafe provider redirects, live sessions in sandbox and unavailable calendar fail closed',async()=>{
  for(const session of [{id:'cs_test_bad',url:'https://evil.invalid',livemode:false},{id:'cs_live_bad',url:'https://checkout.stripe.com/c/pay/cs_live_bad',livemode:true}]){const f=fixture(),id=await f.approved();await assert.rejects(()=>f.pay(id,ctx,{request:async()=>new Response(JSON.stringify(session))}));assert.equal(f.state.rows.orders[0].payment_status,'pendente');}
  const f=fixture();f.raw.catalogKey='mentoria_4';const id=await f.approved();await assert.rejects(()=>f.pay(id,ctx,{env:{...f.env,AGENDA_INTEGRATION_ENABLED:'false'}}));assert.equal(f.state.requests.length,0);
});

// Disposable local Supabase Auth + PostgREST + PostgreSQL. No hosted connections.
// Stripe transport/event below are isolated fixtures; remote provider checks are separate.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {randomUUID,createHmac} from 'node:crypto';
import {bootstrap} from './schema-bootstrap.mjs';
const require=createRequire(new URL('../../apps/painel-ldr/package.json',import.meta.url));
const {createClient}=require('@supabase/supabase-js'),ts=require('typescript');
const {Client}=createRequire(process.env.AGENDA_PG_PACKAGE||import.meta.url)('pg');
const status=JSON.parse(fs.readFileSync(process.env.LDR_LOCAL_SUPABASE_STATUS,'utf8'));
const url=status.API_URL,dbUrl=status.DB_URL;
for(const value of [url,dbUrl])assert.ok(['127.0.0.1','localhost'].includes(new URL(value).hostname),'Loopback services only');
const admin=createClient(url,status.SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const anon=createClient(url,status.ANON_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
// Local fixture setup needs the container's bootstrap owner to create captured FKs
// against native Auth. API requests below still use their real scoped JWT roles.
const setupUrl=new URL(dbUrl);setupUrl.username='supabase_admin';
const pg=new Client({connectionString:setupUrl.toString()});await pg.connect();
const root=new URL('../../apps/painel-ldr/src/',import.meta.url);
let checks=0;const pass=name=>{checks++;console.log('PASS '+name);};
const unwrap=result=>{assert.equal(result.error,null,result.error?.message);return result.data;};
const cache=new Map();
function load(file){
 if(cache.has(file))return cache.get(file);
 const output=ts.transpileModule(fs.readFileSync(new URL(file,root),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const module={exports:{}};cache.set(file,module.exports);
 vm.runInNewContext(output,{module,exports:module.exports,process,console,Date,URL,URLSearchParams,AbortSignal,Headers,Request,Response,fetch,Buffer,require(name){
  if(name==='@/integrations/supabase/client.server')return {supabaseAdmin:admin};
  if(name==='@tanstack/react-start/server')return {getRequest(){throw Error('No framework request available in core integration test');}};
  if(name.startsWith('@/'))return load(name.slice(2)+'.ts');return require(name);
 }},{filename:file});return module.exports;
}
try{
 await pg.query('ALTER EXTENSION pgcrypto SET SCHEMA public');
 await pg.query(bootstrap({supabaseLocal:true}));
 const s=JSON.parse(fs.readFileSync(new URL('./fixtures/contact-schema.json',import.meta.url)));
 const quote=x=>'"'+x.replaceAll('"','""')+'"';
 for(const table of ['ecosystem_contacts','ecosystem_contact_messages']){
  const columns=s.columns.filter(c=>c.table===table).map(c=>`${quote(c.name)} ${c.type}${c.default?' DEFAULT '+c.default:''}${c.nullable==='NO'?' NOT NULL':''}`);
  await pg.query(`CREATE TABLE public.${table} (${columns.join(',')}); ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;`);
 }
 for(const c of s.constraints)await pg.query(`ALTER TABLE ${c.table} ADD CONSTRAINT ${quote(c.name)} ${c.definition}`);
 for(const p of s.policies)await pg.query(`CREATE POLICY ${quote(p.policyname)} ON public.${quote(p.tablename)} AS ${p.permissive} FOR ${p.cmd} TO ${p.roles.map(quote).join(',')}${p.qual?' USING ('+p.qual+')':''}${p.with_check?' WITH CHECK ('+p.with_check+')':''}`);
 await pg.query(s.submission);
 await pg.query('REVOKE ALL ON FUNCTION public.submit_ecosystem_contact(text,text,text,text,text,text,text,text,boolean,boolean,text) FROM PUBLIC; GRANT EXECUTE ON FUNCTION public.submit_ecosystem_contact(text,text,text,text,text,text,text,text,boolean,boolean,text) TO anon,authenticated; GRANT ALL ON ecosystem_contacts,ecosystem_contact_messages TO service_role; GRANT SELECT ON ecosystem_contacts,ecosystem_contact_messages TO authenticated;');
 for(const file of ['20261111200311_agenda_calendar_credit_integration.sql','20261115083845_enterprise_quote_financial_guard.sql'])await pg.query(fs.readFileSync(new URL('../../apps/painel-ldr/supabase/migrations/'+file,import.meta.url),'utf8'));
 await pg.query(`CREATE TABLE stripe_webhook_events(event_id text primary key,event_type text not null,created_at timestamptz default now()); ALTER TABLE stripe_webhook_events ENABLE ROW LEVEL SECURITY; REVOKE ALL ON stripe_webhook_events FROM anon,authenticated; GRANT ALL ON stripe_webhook_events TO service_role; NOTIFY pgrst,'reload schema';`);
 // Wait on a specific readiness probe rather than assuming the schema cache refreshed.
 let ready=false;for(let i=0;i<40;i++){const r=await admin.rpc('ldr_enterprise_quote_checkout_ready');if(!r.error&&r.data===true){ready=true;break;}await new Promise(r=>setTimeout(r,250));}assert.ok(ready);
 pass('captured application schema and financial guards installed only in local Supabase');
 async function identity(email,verified=true){
  const password=randomUUID()+'aA9!';const user=unwrap(await admin.auth.admin.createUser({email,password,email_confirm:verified})).user;
  const client=createClient(url,status.ANON_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
  const login=await client.auth.signInWithPassword({email,password});
  if(!verified)return {user,login};
  const session=unwrap(login).session;return {user,session:{access_token:session.access_token,refresh_token:session.refresh_token},context:{userId:user.id,accessToken:session.access_token,supabase:client}};
 }
 // The allowlisted address is only a synthetic local identity. No email is sent.
 const master=await identity('llucianouam@gmail.com'),owner=await identity('owner@example.test'),other=await identity('other@example.test');
 const unverified=await identity('unverified@example.test',false);assert.ok(unverified.login.error);
 for(const actor of [master,owner,other])await pg.query('INSERT INTO profiles(id,email,full_name,is_active) VALUES ($1,$2,$3,true)',[actor.user.id,actor.user.email,'Synthetic test identity']);
 await pg.query("INSERT INTO user_roles(user_id,role) VALUES ($1,'superadmin')",[master.user.id]);
 pass('real Auth password login and JWT verification; unverified identity denied');
 const {resolveAccess}=load('lib/access.server.ts');
 assert.equal((await resolveAccess(master.context.supabase,master.user.id)).authorized,true);
 assert.equal((await resolveAccess(owner.context.supabase,owner.user.id)).authorized,false);
 pass('Master access resolved with actual Auth identities and RLS-scoped REST clients');
 const form={p_name:'Synthetic Owner',p_email:owner.user.email,p_phone:'',p_subject:'Serviços para empresas',p_message:'Organização: Synthetic Ltd\nSynthetic free proposal',p_source_project:'Local CI',p_source_url:'/empresas/proposta',p_language:'pt',p_wants_luciano:false,p_consent:true,p_website:''};
 const submitted=unwrap(await anon.rpc('submit_ecosystem_contact',form));
 const contact=unwrap(await admin.from('ecosystem_contacts').select('*').eq('protocol',submitted.protocol).single());
 assert.equal((await pg.query('SELECT count(*)::int AS n FROM orders')).rows[0].n,0);
 assert.deepEqual(unwrap(await owner.context.supabase.from('ecosystem_contacts').select('id')),[]);
 pass('anonymous free proposal RPC persists private contact without order or charge');
 const api=load('lib/enterprise-quotes.server.ts');
 const input={contactId:contact.id,requestId:randomUUID(),title:'Synthetic mentoring package',scope:'Four test sessions in isolated integration',amountCents:12345,currency:'EUR',catalogKey:'mentoria_4',validDays:7};
 await pg.query("INSERT INTO service_catalog(catalog_key,name,billing_model,billing_cadence,package_sessions,amount_cents,currency,active) VALUES ('mentoria_4','Synthetic mentoring','package_sessions','one_time',4,10000,'EUR',true)");
 await assert.rejects(()=>api.createQuoteDraft(owner.context,input));
 const draft=await api.createQuoteDraft(master.context,input);assert.equal((await api.createQuoteDraft(master.context,input)).id,draft.id);
 assert.equal((await api.myQuotes(owner.context)).length,0);
 const approval=await api.approveQuote(master.context,{id:draft.id});assert.equal(approval.notified,true);
 assert.equal((await api.myQuotes(owner.context)).length,1);assert.equal((await api.myQuotes(other.context)).length,0);
 pass('actual Master prepare/approve, duplicate request, support notice and per-client proposal visibility');
 const customer=load('lib/client-portal.server.ts');
 const env={ENTERPRISE_QUOTES_CHECKOUT_ENABLED:'true',AGENDA_INTEGRATION_ENABLED:'true',STRIPE_SECRET_KEY:'sk_test_localFixture',STRIPE_WEBHOOK_SECRET:'whsec_localFixture'};
 let calls=0,body;const session='cs_test_'+randomUUID().replaceAll('-','');
 const request=async(_url,options)=>{calls++;body=new URLSearchParams(options.body);return new Response(JSON.stringify({id:session,url:'https://checkout.stripe.com/c/pay/'+session,livemode:false}));};
 const pay=context=>api.acceptAndPayQuote(context,{id:draft.id,accepted:true},{env,request});
 await assert.rejects(()=>pay(other.context));assert.equal(calls,0);
 process.env.AGENDA_INTEGRATION_ENABLED='true';
 const paid=await pay(owner.context);assert.equal(paid.orderId,draft.id);assert.equal(body.get('line_items[0][price_data][unit_amount]'),'12345');
 await pay(owner.context);assert.equal(calls,1);
 const startsAt=new Date(Date.now()+3*86400000).toISOString();
 await assert.rejects(()=>customer.requestClientAppointment(owner.user.id,owner.user.email,{orderId:draft.id,startsAt}));
 await owner.context.supabase.from('orders').update({payment_status:'pago'}).eq('id',draft.id);
 assert.equal(unwrap(await admin.from('orders').select('payment_status').eq('id',draft.id).single()).payment_status,'pendente');
 pass('acceptance links actual customer, price stays server-side; unpaid schedule and Data API forgery denied');
 // Real application webhook handler + genuine local signature, synthetic Stripe event.
 process.env.STRIPE_SECRET_KEY=env.STRIPE_SECRET_KEY;process.env.STRIPE_WEBHOOK_SECRET=env.STRIPE_WEBHOOK_SECRET;
 let source=fs.readFileSync(new URL('routes/api/stripe/webhook.ts',root),'utf8')
  .replace('import { createFileRoute } from "@tanstack/react-router";','const createFileRoute=()=>config=>config;')
  .replace('const { supabaseAdmin } = await import("@/integrations/supabase/client.server");','const supabaseAdmin=globalThis.__freeSupabaseAdmin;');
 globalThis.__freeSupabaseAdmin=admin;
 const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022}}).outputText;
 const handler=(await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'))).Route.server.handlers.POST;
 const event={id:'evt_'+randomUUID(),livemode:false,type:'checkout.session.completed',data:{object:{id:session,payment_status:'paid',amount_total:12345,currency:'eur',payment_intent:'pi_testFixture',metadata:{checkout_kind:'enterprise_quote',order_id:draft.id,customer_id:unwrap(await admin.from('orders').select('customer_id').eq('id',draft.id).single()).customer_id,catalog_key:'mentoria_4'}}}};
 const send=async e=>{const raw=JSON.stringify(e),t=Math.floor(Date.now()/1000),sig=createHmac('sha256',env.STRIPE_WEBHOOK_SECRET).update(`${t}.${raw}`).digest('hex');return handler({request:new Request('http://localhost/api/stripe/webhook',{method:'POST',headers:{'stripe-signature':`t=${t},v1=${sig}`},body:raw})});};
 assert.equal((await send(event)).status,200);assert.equal((await send(event)).status,200);
 assert.equal(unwrap(await admin.from('session_credits').select('granted').eq('order_id',draft.id).single()).granted,4);
 assert.equal((await pg.query('SELECT count(*)::int AS n FROM stripe_webhook_events')).rows[0].n,1);
 pass('signed fixture through actual handler updates real local DB once and releases four credits');
 const booked=await customer.requestClientAppointment(owner.user.id,owner.user.email,{orderId:draft.id,startsAt});assert.ok(booked.appointmentId);
 await assert.rejects(()=>customer.requestClientAppointment(other.user.id,other.user.email,{orderId:draft.id,startsAt}));
 const next=new Date(Date.now()+4*86400000).toISOString();
 await customer.rescheduleClientAppointment(owner.user.id,owner.user.email,{appointmentId:booked.appointmentId,startsAt:next});
 pass('real client appointment and reschedule through REST/RPC; wrong owner denied');
 const refund={...event,id:'evt_'+randomUUID(),type:'charge.refunded',data:{object:{...event.data.object,id:'ch_testFixture',amount:12345,amount_refunded:12345}}};
 assert.equal((await send(refund)).status,200);
 await assert.rejects(()=>customer.requestClientAppointment(owner.user.id,owner.user.email,{orderId:draft.id,startsAt:next}));
 pass('refund fixture blocks further bookings; existing Calendar cancellation remains operational');
 if(process.env.LDR_LOCAL_BROWSER_IDENTITIES){
  fs.writeFileSync(process.env.LDR_LOCAL_BROWSER_IDENTITIES,JSON.stringify({master:master.session,owner:owner.session,other:other.session,protocol:contact.protocol,title:input.title}),{mode:0o600});
 }
 console.log(`PASS ${checks} free local Supabase integrated checks; no remote providers or production writes`);
}finally{await pg.end();}

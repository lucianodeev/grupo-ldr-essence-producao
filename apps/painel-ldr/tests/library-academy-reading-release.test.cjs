const test = require('node:test'), assert = require('node:assert/strict'), crypto = require('node:crypto'), fs = require('node:fs'), path = require('node:path');
const loader = require('./helpers/load-ts.cjs');
const load = loader();
const { getProtectedAcademyReadingEdition } = load('lib/academy-reading-content.server.ts');
const { isApprovedReadingEdition, academyReadingTimeLabel, CUSTOMER_SERVICE_READING_SLUG: slug } = load('lib/academy-reading-editions.ts');
const { CUSTOMER_SERVICE_READING_EDITION: edition } = load('content/academy-reading/customer-service-release.server.ts');
const { exportDraft } = require('../../../tools/export-customer-service-review.cjs');

test('reading-only release claims no validated hours or certificate, with explicit reading estimate', () => {
 assert.equal(isApprovedReadingEdition(edition), true);
 assert.equal(edition.releaseMode, 'reading-only'); assert.equal(edition.certificate, false); assert.equal(edition.validatedHours, null);
 assert.equal(edition.estimatedReadingMinutes.min, 40); assert.equal(edition.estimatedReadingMinutes.max, 50);
 for(const locale of ['pt','en','fr','es']) {const label=academyReadingTimeLabel(slug, locale); assert.ok(label.includes('40–50'));assert.ok(!label.includes('120'));}
 for(const change of [e=>e.certificate=true,e=>e.validatedHours=120,e=>e.review.workload=false,e=>e.estimatedReadingMinutes.min=-1]) {const copy=JSON.parse(JSON.stringify(edition)); change(copy);assert.equal(isApprovedReadingEdition(copy),false);}
});
test('released bodies retain source provenance and verified release hashes; editorial flags are removed only from the reading edition', () => {
 const draft=exportDraft();assert.equal(edition.modules.length,6);
 for(const [i,m] of edition.modules.entries()) {
  assert.equal(m.sourceSha256,draft.modules[i].sha256);
  assert.equal(m.sha256,crypto.createHash('sha256').update(m.body).digest('hex'));
  assert.ok(!m.body.includes('Revisões pendentes:'));assert.ok(!m.body.includes('Não há autorização de publicação'));
  assert.ok(m.body.includes('fictíci')||m.body.includes('inventad')||m.body.includes('sintétic'));
 }
 assert.equal(draft.status,'draft');assert.equal(draft.published,false);
});
test('anonymous and unknown-slug requests cannot read a body or run the entitlement lookup',async()=>{
 let calls=0;const authorize=async()=>{calls++;return {allowed:true}};
 await assert.rejects(getProtectedAcademyReadingEdition('',slug,authorize),/Sessão inválida/);
 await assert.rejects(getProtectedAcademyReadingEdition('user','other',authorize),/Edição não encontrada/);
 assert.equal(calls,0);
});
test('denied or expired subscription receives no teaching body; lookup uses fixed existing product key',async()=>{
 for(const user of ['inactive','expired','unrelated-purchase']){
  const result=await getProtectedAcademyReadingEdition(user,slug,async key=>{assert.equal(key,'curso_assinatura_atendimento_ao_cliente_com_humanizacao_e_resultado');return {allowed:false}});
  assert.equal(result.allowed,false);assert.equal(result.edition,null);
 }
});
test('authorized course request receives six verified units; authorization failure propagates without fallback content',async()=>{
 const result=await getProtectedAcademyReadingEdition('allowed-user',slug,async()=>({allowed:true}));
 assert.equal(result.allowed,true);assert.equal(result.edition.modules.length,6);
 await assert.rejects(getProtectedAcademyReadingEdition('user',slug,async()=>{throw new Error('lookup failed')}),/lookup failed/);
});
test('server function is authenticated and client route never imports teaching bodies',()=>{
 const root=path.resolve(__dirname,'..');
 const fn=fs.readFileSync(path.join(root,'src/lib/library-subscription.functions.ts'),'utf8');
 assert.ok(/clientAcademyReadingEdition = createServerFn[\s\S]*?\.middleware\(\[requireSupabaseAuth\]\)/.test(fn));
 const route=fs.readFileSync(path.join(root,'src/routes/_clientarea.cliente.cursos.assinatura.$slug.tsx'),'utf8');
 assert.ok(route.includes('useServerFn(clientAcademyReadingEdition)'));assert.ok(!route.includes('customer-service-release.server'));
 const course=load('lib/academy-subscription-courses.catalog.ts').getAcademySubscriptionCourse(slug);
 assert.equal(course.certificate,false);assert.equal(course.modules.length,15);assert.ok(!course.description.pt.includes('120'));
});

test('real server-function handler preserves subscription decisions and sends private no-store responses', async()=>{
 const previous=process.env.SUPABASE_SERVICE_ROLE_KEY;process.env.SUPABASE_SERVICE_ROLE_KEY='synthetic-test-only';
 const headers=[];let active=false,expires=null;
 const auth={syntheticAuth:true};
 const stubs={
  '@tanstack/react-start':{createServerFn:()=>{const state={middleware:[],validate:x=>x};const chain={middleware:m=>{state.middleware=m;return chain},inputValidator:v=>{state.validate=v;return chain},handler:fn=>({middleware:state.middleware,run:(context,data)=>fn({context,data:state.validate(data)})})};return chain}},
  '@tanstack/react-start/server':{getRequest:()=>null,setResponseHeader:(k,v)=>headers.push([k,v])},
  '@/integrations/supabase/auth-middleware':{requireSupabaseAuth:auth},
  '@/lib/library-subscription.server':{getLibrarySubscriptionContext:async()=>({active,subscription:{id:'synthetic-sub',current_period_end:expires}})},
 };
 try{
  const fn=loader(stubs)('lib/library-subscription.functions.ts').clientAcademyReadingEdition;
  assert.equal(fn.middleware[0],auth);
  const context={userId:'synthetic-user',claims:{email:'reader@example.invalid'},accessToken:'synthetic-token'};
  for(const scenario of [{active:false,expires:null},{active:false,expires:'2020-01-01T00:00:00Z'}]){
   active=scenario.active;expires=scenario.expires;const denied=await fn.run(context,{slug});assert.equal(denied.allowed,false);assert.equal(denied.edition,null);
  }
  active=true;expires='2099-01-01T00:00:00Z';const allowed=await fn.run(context,{slug});assert.equal(allowed.allowed,true);assert.equal(allowed.edition.modules.length,6);
  assert.ok(headers.every(([k,v])=>k==='Cache-Control'&&v==='private, no-store'));
  await assert.rejects(fn.run({...context,userId:''},{slug}),/Sessão inválida/);
  assert.throws(()=>fn.run(context,{slug:44}),/Curso inválido/);
 }finally{if(previous===undefined)delete process.env.SUPABASE_SERVICE_ROLE_KEY;else process.env.SUPABASE_SERVICE_ROLE_KEY=previous;}
});

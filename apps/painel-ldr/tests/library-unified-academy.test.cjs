const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const React=require('react'),{renderToStaticMarkup}=require('react-dom/server'),loader=require('./helpers/load-ts.cjs');
const root=path.resolve(__dirname,'../../..'),load=loader();
const {academyUnifiedCatalog,academySubscriptionLabel}=load('lib/academy-unified-catalog.ts');
const {PROFESSIONAL_FORMATIONS}=load('lib/academy-professional-formations.catalog.ts');
const {ACADEMY_SUBSCRIPTION_COURSES}=load('lib/academy-subscription-courses.catalog.ts');
function fakeDb(rows={},errors=[]){const events=[];return {events,from(table){const filters=[];let single=false;const chain={select(){events.push({table,operation:'select'});return chain},eq(k,v){filters.push([k,v]);return chain},in(k,v){filters.push([k,v,true]);return chain},is(k,v){filters.push([k,v]);return chain},ilike(k,v){filters.push([k,v]);return chain},order(){return chain},limit(){return chain},maybeSingle(){single=true;return Promise.resolve(result())},single(){single=true;return Promise.resolve(result())},then(resolve,reject){return Promise.resolve(result()).then(resolve,reject)},insert(){throw Error('unexpected insert')},update(){throw Error('unexpected update')},delete(){throw Error('unexpected delete')}};
 function result(){if(errors.includes(table))return {data:null,error:{message:'synthetic lookup error'}};let data=typeof rows[table]==='function'?rows[table](filters):rows[table]??null;
 if(['library_subscriptions','ldr_pass_subscriptions'].includes(table)&&data){for(const[k,v,many]of filters)if(k==='status'&&(many?!v.includes(data[k]):data[k]!==v))data=null;}
 return {data:single?data:data===null?[]:Array.isArray(data)?data:[data],error:null};}return chain;}};}
const future='2099-01-01T00:00:00Z',past='2020-01-01T00:00:00Z';
test('one registry contains the same unique 50 courses, 40 formations and legacy training for both views',()=>{
 for(const locale of ['pt','en','fr','es']){const items=academyUnifiedCatalog(locale);assert.equal(items.length,91);assert.equal(new Set(items.map(i=>i.key)).size,91);assert.equal(items.filter(i=>i.kind==='course').length,50);
 for(const f of PROFESSIONAL_FORMATIONS){const item=items.find(i=>i.key===f.productKey);assert.ok(item);assert.equal(item.title,f.i18n[locale].name);assert.equal(item.publicPath,f.publicPath);assert.equal(item.learnerPath,f.learnerPath);}
 for(const c of ACADEMY_SUBSCRIPTION_COURSES){const item=items.find(i=>i.key===c.productKey);assert.equal(item.title,c.name[locale]);assert.equal(item.learnerPath,'/cliente/cursos/assinatura/'+c.slug);}
 for(const item of items){assert.equal(item.includedInSubscription,true);assert.ok(item.publicPath.startsWith('/'));assert.ok(item.learnerPath.startsWith('/cliente/'));assert.ok(!item.learnerPath.endsWith('/biblioteca'));}
 }
 assert.equal(fs.readFileSync(path.join(root,'apps/painel-ldr/src/lib/academy-subscriber-cards.catalog.ts'),'utf8'),require('../../../tools/generate-academy-subscriber-metadata.cjs').generated());
});
test('public Academy and private dashboard render all 91 identical paid product identities through the same card',()=>{
 const localized=loader({'@/lib/i18n':{useI18n:()=>({locale:'pt'})},'@/components/academy-giveaway-banner':{AcademyGiveawayBanner:()=>null}});
 const {AcademyUniversityHome}=localized('components/academy-university-home.tsx');const {LibraryLearningDashboard}=localized('components/library-learning-dashboard.tsx');
 const rows=academyUnifiedCatalog('pt'),items=rows.map(item=>({key:item.key,title:item.title,description:item.description,href:item.learnerPath,kind:item.kind,access:'granted',editorial:item.editorial,academyCard:{icon:item.icon,accent:item.accent,detail:item.detail,accessLabel:academySubscriptionLabel('pt')}}));
 const publicHtml=renderToStaticMarkup(React.createElement(AcademyUniversityHome)),privateHtml=renderToStaticMarkup(React.createElement(LibraryLearningDashboard,{locale:'pt',items,progress:[]}));
 const keys=html=>[...html.matchAll(/<a[^>]*data-academy-key="([^"]+)"[^>]*>/g)].filter(m=>m[0].includes('data-academy-subscription="true"')).map(m=>m[1]).sort();assert.deepEqual(keys(publicHtml),keys(privateHtml));assert.equal(keys(publicHtml).length,91);
 assert.ok(publicHtml.includes('id="explorar"'));for(const item of rows){assert.ok(publicHtml.includes('href="'+item.publicPath+'"'));assert.ok(privateHtml.includes('href="'+item.learnerPath+'"'));}
 const source=fs.readFileSync(path.join(root,'apps/painel-ldr/src/routes/_clientarea.cliente.biblioteca.tsx'),'utf8');assert.ok(source.includes('academyUnifiedCatalog(locale).map'));assert.ok(!source.includes('PROFESSIONAL_FORMATIONS.map'));
});
test('Academy compatibility accepts valid legacy subscriptions without broadening the default LDR ONE service entitlement',async()=>{
 for(const [legacy,expected]of [[{id:'library',status:'active',current_period_end:future},true],[{id:'library',status:'trialing',current_period_end:future},true],[{id:'library',status:'canceled',current_period_end:future},false],[{id:'library',status:'active',current_period_end:past},false],[{id:'library',status:'active',current_period_end:'bad-date'},false],[null,false]]){
 const db=fakeDb({library_subscriptions:legacy});const {hasActiveLdrOne}=loader({'@/integrations/supabase/client.server':{supabaseAdmin:db}})('lib/ldr-one-entitlement.server.ts');
 assert.equal(await hasActiveLdrOne('customer','academy'),expected);const before=db.events.length;assert.equal(await hasActiveLdrOne('customer'),false);assert.ok(db.events.slice(before).every(e=>e.table!=='library_subscriptions'));assert.ok(db.events.every(e=>e.operation==='select'));
 }
 for(const status of ['active','trialing']){const db=fakeDb({ldr_pass_subscriptions:{id:'one',status,current_period_end:future}});assert.equal(await loader({'@/integrations/supabase/client.server':{supabaseAdmin:db}})('lib/ldr-one-entitlement.server.ts').hasActiveLdrOne('customer','academy'),true);}
 const expired=fakeDb({ldr_pass_subscriptions:{id:'one',status:'active',current_period_end:past}});assert.equal(await loader({'@/integrations/supabase/client.server':{supabaseAdmin:expired}})('lib/ldr-one-entitlement.server.ts').hasActiveLdrOne('customer','academy'),false);
});
test('the authenticated reading handler recognises LDR ONE for all 50 courses and cannot grant human-service keys',async()=>{
 const previous=process.env.SUPABASE_SERVICE_ROLE_KEY;process.env.SUPABASE_SERVICE_ROLE_KEY='synthetic-test-only';let one=true,legacy=false,expires=future,lookups=0;
 const factory=()=>{let validate=x=>x;const chain={middleware(){return chain},inputValidator(v){validate=v;return chain},handler(fn){return {run:(context,data)=>fn({context,data:validate(data)})}}};return chain};
 const functions=loader({'@tanstack/react-start':{createServerFn:factory},'@tanstack/react-start/server':{getRequest:()=>null,setResponseHeader:()=>{}},'@/integrations/supabase/auth-middleware':{requireSupabaseAuth:{}},'@/lib/library-subscription.server':{getLibrarySubscriptionContext:async()=>{lookups++;return {customer:{id:'customer'},active:legacy,subscription:{id:'legacy',current_period_end:expires}}}},'@/lib/academy-catalog-access.server':{getAcademyCatalogAccess:async id=>{assert.equal(id,'customer');return {active:one,ownedKeys:[]}}},'@/lib/owner-digital-access.server':{hasOwnerDigitalAccess:()=>false}})('lib/library-subscription.functions.ts');
 const context={userId:'user',claims:{email:'test@example.invalid'},accessToken:'synthetic'};
 try{for(const c of ACADEMY_SUBSCRIPTION_COURSES){const result=await functions.clientAcademyReadingEdition.run(context,{slug:c.slug});assert.equal(result.allowed,true);assert.equal(result.edition.productKey,c.productKey);}
 one=false;assert.equal((await functions.clientAcademyReadingEdition.run(context,{slug:ACADEMY_SUBSCRIPTION_COURSES[0].slug})).allowed,false);
 legacy=true;expires=past;assert.equal((await functions.clientAcademyReadingEdition.run(context,{slug:ACADEMY_SUBSCRIPTION_COURSES[0].slug})).allowed,false);
 expires=future;assert.equal((await functions.clientAcademyReadingEdition.run(context,{slug:ACADEMY_SUBSCRIPTION_COURSES[0].slug})).allowed,true);
 assert.equal((await functions.clientLibraryCourseEntitlement.run(context,{resourceKey:'human_room_assisted_synthesis'})).allowed,true);
 expires=past;assert.equal((await functions.clientLibraryCourseEntitlement.run(context,{resourceKey:'human_room_assisted_synthesis'})).allowed,false);
 legacy=false;one=true;expires=future;assert.equal((await functions.clientLibraryCourseEntitlement.run(context,{resourceKey:'human_room_assisted_synthesis'})).allowed,false);
 const before=lookups;assert.equal((await functions.clientLibraryCourseEntitlement.run(context,{resourceKey:'consulta_psicanalitica'})).allowed,false);assert.equal(lookups,before);
 }finally{if(previous===undefined)delete process.env.SUPABASE_SERVICE_ROLE_KEY;else process.env.SUPABASE_SERVICE_ROLE_KEY=previous;}
});
function offerDb(order){return fakeDb({orders:order?[order]:[],training_programs:filters=>({id:'program',slug:filters.find(f=>f[0]==='slug')?.[1],status:'published'}),training_enrollments:{id:'enrollment',enrolled_at:past,cohort_id:'cohort',progress_percent:55,training_cohorts:{cohort_number:1,capacity:50}},library_progress:{progress_percent:55},training_project_submissions:[]});}
test('all 30 professional formations accept the subscription and preserve permanent purchases after cancellation',async()=>{
 for(const mode of ['member','expired']){const db=offerDb(mode==='paid'?{id:'order',catalog_key:'unused',metadata:{},created_at:past}:null);let key='';db.from=((original)=>function(table){if(table==='orders')return original.call(db,table);return original.call(db,table)})(db.from);
 const stubs={'@/integrations/supabase/client.server':{supabaseAdmin:db},'@/lib/client-portal.server':{resolveClient:async()=>({status:'ok',customer:{id:'customer',email:'test@example.invalid'}})},'@/lib/owner-digital-access.server':{hasOwnerDigitalAccess:()=>false},'@/lib/ldr-one-entitlement.server':{hasActiveLdrOne:async(id,scope)=>{assert.equal(scope,'academy');return mode==='member'}},'@tanstack/react-start/server':{getRequest:()=>null}};
 const {getProfessionalFormationOffer}=loader(stubs)('lib/professional-formations.server.ts');
 for(const f of PROFESSIONAL_FORMATIONS){const offer=await getProfessionalFormationOffer('user','test@example.invalid',f.slug);assert.equal(offer.productKey,f.productKey);assert.equal(offer.entitled,mode==='member');assert.equal(offer.progressPercent,55);}
 }
 const f=PROFESSIONAL_FORMATIONS[0];for(const source of [undefined,'library_subscription']){const db=offerDb({id:'order',catalog_key:f.productKey,metadata:source?{source}:{},created_at:past});const fn=loader({'@/integrations/supabase/client.server':{supabaseAdmin:db},'@/lib/client-portal.server':{resolveClient:async()=>({status:'ok',customer:{id:'customer'}})},'@/lib/owner-digital-access.server':{hasOwnerDigitalAccess:()=>false},'@/lib/ldr-one-entitlement.server':{hasActiveLdrOne:async()=>false},'@tanstack/react-start/server':{getRequest:()=>null}})('lib/professional-formations.server.ts');assert.equal((await fn.getProfessionalFormationOffer('user',null,f.slug)).entitled,source===undefined);}
});
test('Psychoanalysis and Brief Therapy now grant subscription reading access but preserve lifetime ownership only for genuine purchases',async()=>{
 for(const [file,method,key]of [['psychoanalysis-commerce.server.ts','getPsychoanalysisOffer','formacao_psicanalise'],['brief-therapy-commerce.server.ts','getBriefTherapyOffer','formacao_terapia_breve_psicanalitica']]){
  for(const mode of ['member','expired','subscription-order','paid']){
   const order=mode==='paid'||mode==='subscription-order'?{id:'order',catalog_key:key,metadata:mode==='subscription-order'?{source:'library_subscription'}:{},created_at:past}:null;
   const db=offerDb(order);const functions=loader({'@/integrations/supabase/client.server':{supabaseAdmin:db},'@/lib/client-portal.server':{resolveClient:async()=>({status:'ok',customer:{id:'customer',email:'test@example.invalid'}})},'@/lib/owner-digital-access.server':{hasOwnerDigitalAccess:()=>false},'@/lib/ldr-one-entitlement.server':{hasActiveLdrOne:async(id,scope)=>{assert.equal(scope,'academy');return mode==='member'}},'@tanstack/react-start/server':{getRequest:()=>null}})('lib/'+file);
   const result=await functions[method]('user','test@example.invalid');assert.equal(result.entitled,mode==='member'||mode==='paid',file+'/'+mode);assert.equal(result.lifetimeAccess,mode==='paid');assert.equal(result.progressPercent,55);if(!result.entitled)assert.equal(result.maxUnlockedLesson,0);
  }
 }
});
test('read-only catalog status preserves actual ownership but never treats subscription-derived orders as lifetime purchases',async()=>{
 const key=ACADEMY_SUBSCRIPTION_COURSES[0].productKey;
 for(const active of [true,false]){
 const db=fakeDb({orders:[{catalog_key:key,metadata:{}},{catalog_key:PROFESSIONAL_FORMATIONS[0].productKey,metadata:{source:'library_subscription'}},{catalog_key:'consulta_psicanalitica',metadata:{}}]});
 const fn=loader({'@/integrations/supabase/client.server':{supabaseAdmin:db},'@/lib/ldr-one-entitlement.server':{hasActiveLdrOne:async(id,scope)=>{assert.equal(id,'customer');assert.equal(scope,'academy');return active}}})('lib/academy-catalog-access.server.ts');
 const result=await fn.getAcademyCatalogAccess('customer');assert.equal(result.active,active);assert.deepEqual(Array.from(result.ownedKeys),[key]);assert.ok(db.events.every(e=>e.operation==='select'));
 }
 const broken=fakeDb({},['orders']);const fn=loader({'@/integrations/supabase/client.server':{supabaseAdmin:broken},'@/lib/ldr-one-entitlement.server':{hasActiveLdrOne:async()=>false}})('lib/academy-catalog-access.server.ts');await assert.rejects(fn.getAcademyCatalogAccess('customer'),/verificar os conteúdos/);
});

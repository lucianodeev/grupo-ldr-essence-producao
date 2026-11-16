const test = require('node:test'), assert = require('node:assert/strict'), crypto = require('node:crypto'), fs = require('node:fs'), path = require('node:path');
const React = require('react'), { renderToStaticMarkup } = require('react-dom/server');
const loader = require('./helpers/load-ts.cjs'), load = loader();
const root=path.resolve(__dirname,'../../..');
const { CUSTOMER_SERVICE_READING_EDITION: reading } = load('content/academy-reading/customer-service-release.server.ts');
const { CUSTOMER_SERVICE_PRACTICE_GUIDE: guide } = load('content/academy-reading/customer-service-practice.server.ts');
const { isReleasedAcademyPracticeGuide, isApprovedReadingEdition } = load('lib/academy-reading-editions.ts');
const { getProtectedAcademyReadingEdition } = load('lib/academy-reading-content.server.ts');
const { AcademyReadingEditionView } = load('components/academy-reading-edition.tsx');
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const render = edition => renderToStaticMarkup(React.createElement(AcademyReadingEditionView,{edition}));
test('owner-authorized estimated guide has exact source provenance and no invented certification or external review',()=>{
 const source=JSON.parse(fs.readFileSync(path.join(root,'editorial/programmes/customer-service-60h.pt.json'),'utf8'));
 assert.equal(guide.sourceProgrammeSha256,sha(JSON.stringify(source)));
 assert.equal(isReleasedAcademyPracticeGuide(guide,reading),true);
 assert.equal(guide.estimatedMinutes,3600); assert.equal(guide.validatedHours,null);assert.equal(guide.certificate,false);
 assert.equal(source.status,'draft');assert.equal(source.published,false);assert.equal(source.validatedHours,null);
 assert.ok(Object.values(source.review).every(value=>value===false));assert.deepEqual(source.pilot.observations,[]);
 assert.match(guide.reviewDisclosure,/sem pilotagem/);assert.match(guide.publication.instruction,/publica online/);
 assert.equal(guide.modules.length,6);assert.equal(guide.modules.reduce((sum,m)=>sum+m.estimatedMinutes,0),3600);
 for(const [i,module] of guide.modules.entries()){
  assert.equal(module.id,reading.modules[i].id);assert.equal(module.sha256,sha(module.body));assert.equal(module.estimatedMinutes,600);
  for(const activity of source.modules[i].activities){
   for(const step of activity.steps)assert.ok(module.body.includes(step.instruction));
   for(const field of activity.submissionFields)assert.ok(module.body.includes(field));
   for(const key of activity.facilitatorKey)assert.ok(!module.body.includes(key),'new facilitator key leaked: '+activity.id);
  }
  assert.ok(!module.body.includes('Não há autorização de publicação'));
  assert.ok(!module.body.includes('[object Object]'));
 }
 for(const question of source.finalQuestions){assert.ok(guide.modules[5].body.includes(question.question));assert.ok(!guide.modules[5].body.includes(question.key));}
});
test('guide never authorizes reading and invalid or mismatched guides are hidden',()=>{
 assert.equal(isReleasedAcademyPracticeGuide(undefined,reading),false);
 for(const change of [g=>g.certificate=true,g=>g.validatedHours=60,g=>g.estimatedMinutes=0,g=>g.modules[0].estimatedMinutes++,g=>g.modules[0].id='wrong',g=>g.productKey='other',g=>g.publication.authorizedAt='invalid',g=>g.publication.instruction='',g=>g.sourceProgrammeSha256='bad']){
  const copy=structuredClone(guide);change(copy);assert.equal(isReleasedAcademyPracticeGuide(copy,reading),false);
  assert.ok(!render({...reading,practiceGuide:copy}).includes('aria-label="Percurso prático de 60 horas estimadas"'));
 }
 assert.equal(render({...reading,status:'draft',practiceGuide:guide}),'');
 const html=render({...reading,practiceGuide:guide});assert.ok(html.includes('Percurso prático — 60 horas estimadas'));assert.ok(html.includes('U1-P'));
 assert.ok(html.includes('não é duração validada'));assert.ok(!render(reading).includes('U1-P'));
 assert.equal(isApprovedReadingEdition(reading),true);assert.equal(reading.practiceGuide,undefined);
});
test('only existing product access returns the guide and reading source is never mutated',async()=>{
 let calls=0;
 for(const user of ['inactive','expired','unrelated']){
  const denied=await getProtectedAcademyReadingEdition(user,reading.slug,async()=>{calls++;return {allowed:false}});
  assert.equal(denied.edition,null);
 }
 assert.equal(calls,3);
 const allowed=await getProtectedAcademyReadingEdition('active',reading.slug,async key=>{assert.equal(key,reading.productKey);return {allowed:true}});
 assert.equal(allowed.edition.practiceGuide.programmeId,guide.programmeId);
 assert.deepEqual(allowed.edition.modules,reading.modules);assert.equal(reading.practiceGuide,undefined);
 const broken=structuredClone(guide);broken.modules[0].body+=' CORRUPTED';
 const bad=loader({'@/content/academy-reading/customer-service-practice.server':{CUSTOMER_SERVICE_PRACTICE_GUIDE:broken}})('lib/academy-reading-content.server.ts');
 await assert.rejects(bad.getProtectedAcademyReadingEdition('active',reading.slug,async()=>({allowed:true})),/validar o percurso/);
 const component=fs.readFileSync(path.join(root,'apps/painel-ldr/src/components/academy-reading-edition.tsx'),'utf8');
 assert.ok(!['localStorage','clientSaveProgress','fetch(','supabase','stripe'].some(token=>component.toLowerCase().includes(token.toLowerCase())));
});

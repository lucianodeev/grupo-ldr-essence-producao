const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const root=path.resolve(__dirname,'../../..'),load=require('./helpers/load-ts.cjs')();
const {makeReleases,generated,DISCLOSURE}=require('../../../tools/prepare-academy-course-reading-releases.cjs');
const {RELEASED_COURSE_READING_EDITIONS:releases}=load('content/academy-reading/courses-reading-release.server.ts');
const {getAcademyCourseReadingMetadata}=load('lib/academy-course-reading-catalog.ts');
const {getProtectedAcademyReadingEdition}=load('lib/academy-reading-content.server.ts');
const {isApprovedReadingEdition,academyReadingTimeLabel}=load('lib/academy-reading-editions.ts');
const {AcademyReadingEditionView}=load('components/academy-reading-edition.tsx');
const {prepareAllCandidates}=require('../../../tools/prepare-course-academy-candidates.cjs');
const sha=value=>crypto.createHash('sha256').update(value).digest('hex');
test('49 releases preserve 193 source units and exact individual reading estimates, without approving source drafts or historical hours',()=>{
 const built=makeReleases();assert.equal(releases.length,49);assert.equal(releases.reduce((n,e)=>n+e.modules.length,0),193);
 assert.equal(new Set(releases.map(e=>e.productKey)).size,49);assert.equal(new Set(releases.map(e=>e.editionId)).size,49);
 for(const [i,e]of releases.entries()){
  const evidence=built.evidence[i],raw=fs.readFileSync(path.join(root,'editorial/courses',evidence.file),'utf8'),draft=JSON.parse(raw);
  assert.equal(evidence.sourceSha256,sha(raw));assert.equal(draft.status,'draft');assert.equal(draft.published,false);assert.equal(draft.validatedHours,null);assert.ok(Object.values(draft.review).every(v=>v===false));
  assert.equal(isApprovedReadingEdition(e),true);assert.equal(e.validatedHours,null);assert.equal(e.certificate,false);assert.equal(e.releaseMode,'reading-only');assert.equal(e.releaseDisclosure,DISCLOSURE);
  const words=e.modules.reduce((n,m)=>n+m.body.trim().split(/\s+/u).length,0);
  assert.equal(e.estimatedReadingMinutes.min,Math.ceil(words/250));assert.equal(e.estimatedReadingMinutes.max,Math.ceil(words/200));
  assert.equal(getAcademyCourseReadingMetadata(e.slug).moduleCount,draft.modules.length);assert.equal(getAcademyCourseReadingMetadata(e.slug).productKey,e.productKey);
  for(const [j,m]of e.modules.entries()){
   assert.equal(m.sourceSha256,sha(JSON.stringify(draft.modules[j])));assert.equal(m.sha256,sha(m.body));
   for(const section of draft.modules[j].sections)for(const para of section.paragraphs)assert.ok(m.body.includes(para),'teaching text changed');
   assert.ok(m.body.includes(draft.modules[j].case));assert.ok(m.body.includes(draft.modules[j].exercise));assert.ok(m.body.includes(draft.modules[j].assessment.answer));
   assert.ok(!m.body.includes('Rascunho para revisão. Não publicado.'));
  }
  for(const lang of ['pt','en','fr','es'])assert.ok(academyReadingTimeLabel(e.slug,lang).includes(String(e.estimatedReadingMinutes.min)+'–'+String(e.estimatedReadingMinutes.max)));
  const html=renderToStaticMarkup(React.createElement(AcademyReadingEditionView,{edition:e}));assert.ok(html.includes('<article'));assert.ok(html.includes('revisão interna assistida por IA'));
 }
 for(const candidate of prepareAllCandidates())assert.equal(isApprovedReadingEdition(candidate),false);
 for(const [file,content]of Object.entries(generated()))assert.equal(fs.readFileSync(path.join(root,file),'utf8'),content,'stale generated file '+file);
});
test('all 49 product lookups deny inactive access, bind existing keys, and return only the requested verified edition to an active user',async()=>{
 for(const e of releases){
  let key;const denied=await getProtectedAcademyReadingEdition('inactive',e.slug,async k=>{key=k;return {allowed:false}});
  assert.equal(key,e.productKey);assert.equal(denied.edition,null);
  const allowed=await getProtectedAcademyReadingEdition('active',e.slug,async k=>{assert.equal(k,e.productKey);return {allowed:true}});
  assert.equal(allowed.allowed,true);assert.equal(allowed.edition.editionId,e.editionId);assert.equal(allowed.edition.modules.length,e.modules.length);
 }
 let calls=0;await assert.rejects(getProtectedAcademyReadingEdition('','other',async()=>{calls++;return {allowed:true}}),/Sessão inválida/);
 await assert.rejects(getProtectedAcademyReadingEdition('active','other',async()=>{calls++;return {allowed:true}}),/Edição não encontrada/);assert.equal(calls,0);
 await assert.rejects(getProtectedAcademyReadingEdition('active',releases[0].slug,async()=>{throw Error('entitlement unavailable')}),/entitlement unavailable/);
});
test('corrupt published bodies fail closed without falling back to an unverified or historical body',async()=>{
 const bad=JSON.parse(JSON.stringify(releases));bad[0].modules[0].body+=' corrupted';
 const handler=require('./helpers/load-ts.cjs')({'@/content/academy-reading/courses-reading-release.server':{RELEASED_COURSE_READING_EDITIONS:bad}})('lib/academy-reading-content.server.ts');
 await assert.rejects(handler.getProtectedAcademyReadingEdition('active',bad[0].slug,async()=>({allowed:true})),/validar a edição/);
});

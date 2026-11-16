const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {validateCourseDraft}=require('../../../tools/validate-course-drafts.cjs');
const {reviewEditorialCorpus,readCandidates}=require('../../../tools/review-editorial-corpus.cjs');
const root=path.resolve(__dirname,'../../..');
test('every candidate retains a verifiable historical catalog base and current commercial identity',()=>{
 const catalog=fs.readFileSync(path.join(root,'apps/painel-ldr/src/lib/academy-subscription-courses.catalog.ts'),'utf8');
 const baseline=fs.readFileSync(path.join(root,'editorial/catalog-baselines/academy-subscription-20261115.ts.txt'),'utf8');
 const checksum=crypto.createHash('sha256').update(baseline).digest('hex');
 for(const candidate of readCandidates(root).filter(d=>d.modules)){
  assert.ok(catalog.includes(candidate.slug+'|'+candidate.productKey+'|'),candidate.productKey);
  assert.equal(candidate.baseCatalogSha256,checksum);
  const row=text=>text.split('\n').find(line=>line.startsWith(candidate.slug+'|'));
  assert.equal(row(catalog),row(baseline),'commercial identity and historical rows must remain unchanged');
  const result=validateCourseDraft(candidate);
  assert.deepEqual(result.errors,[],candidate.productKey);
  assert.equal(result.complete,true);
  assert.equal(result.activationEligible,false);
  assert.equal(candidate.published,false);
  assert.equal(candidate.validatedHours,null);
 }
});
test('authored candidates contain no exact or near repeated teaching paragraphs across products',()=>{
 const result=reviewEditorialCorpus(readCandidates(root));
 assert.ok(result.documents>=3);
 assert.ok(result.units>=43);
 assert.deepEqual(result.exact,[]);
 assert.deepEqual(result.near,[]);
});
test('cross-product checker catches copied paragraphs even when product names and titles differ',()=>{
 const documents=readCandidates(root);
 const first=documents.find(d=>d.modules),second=documents.find(d=>d.chapters);
 second.chapters[0].sections[0].paragraphs[0]=first.modules[0].sections[0].paragraphs[0];
 const result=reviewEditorialCorpus(documents);
 assert.ok(result.exact.some(pair=>pair.a.includes(first.productKey)&&pair.b.includes(second.productKey)));
});
test('professional writing exercises require different genres and ship all task data',()=>{
 const d=JSON.parse(fs.readFileSync(path.join(root,'editorial/courses/professional-writing.pt.json'),'utf8'));
 assert.equal(d.modules.length,8);
 assert.equal(new Set(d.modules.map(m=>m.exercise)).size,8);
 assert.equal(new Set(d.modules.map(m=>m.case)).size,8);
 assert.ok(d.modules[6].case.includes('dezoito'));
 assert.ok(d.modules[6].case.includes('catorze'));
 assert.ok(d.modules[7].exercise.includes('oito perguntas'));
});

// A reading-only edition may change presentation without rewriting the other 49 products.
test('only the approved customer-service reading presentation differs from the archived catalog',()=>{
 const loader=require('./helpers/load-ts.cjs')();
 const current=loader('lib/academy-subscription-courses.catalog.ts').ACADEMY_SUBSCRIPTION_COURSES;
 const historical=loader(path.join(root,'editorial/catalog-baselines/academy-subscription-20261115.ts.txt')).ACADEMY_SUBSCRIPTION_COURSES;
 const plain=value=>JSON.parse(JSON.stringify(value));
 assert.equal(current.length,historical.length);
 for(const before of historical){
  const after=current.find(item=>item.slug===before.slug);assert.ok(after);
  if(before.slug!=='atendimento-ao-cliente-com-humanizacao-e-resultado'){assert.deepEqual(plain(after),plain(before));continue;}
  assert.equal(after.productKey,before.productKey);assert.equal(after.hours,before.hours);assert.equal(after.certificate,false);
  assert.deepEqual(plain(after.modules.slice(0,14)),plain(before.modules.slice(0,14)));
  assert.equal(after.modules[14].title,before.modules[14].title);assert.equal(after.modules[14].activity,before.modules[14].activity);
  assert.ok(!after.description.pt.includes('120'));assert.ok(after.description.pt.includes('40–50'));
 }
});

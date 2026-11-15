const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {validateCourseDraft}=require('../../../tools/validate-course-drafts.cjs');
const {reviewEditorialCorpus,readCandidates}=require('../../../tools/review-editorial-corpus.cjs');
const root=path.resolve(__dirname,'../../..');
test('every course candidate matches a real catalog identity while leaving its historical catalog untouched',()=>{
 const catalog=fs.readFileSync(path.join(root,'apps/painel-ldr/src/lib/academy-subscription-courses.catalog.ts'),'utf8');
 const checksum=crypto.createHash('sha256').update(catalog).digest('hex');
 for(const candidate of readCandidates(root).filter(d=>d.modules)){
  assert.ok(catalog.includes(candidate.slug+'|'+candidate.productKey+'|'),candidate.productKey);
  assert.equal(candidate.baseCatalogSha256,checksum);
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

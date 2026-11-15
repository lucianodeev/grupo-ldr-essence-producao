const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {validateDraft}=require('../../../tools/validate-editorial-drafts.cjs');
const file=path.resolve(__dirname,'../../../editorial/drafts/ebook_comportamento_humano_v2.json');
const draft=()=>JSON.parse(fs.readFileSync(file,'utf8'));
test('candidate edition has developed, sourced chapters without claiming publication',()=>{const r=validateDraft(draft());assert.deepEqual(r.errors,[]);assert.equal(r.authoredChapters,3);assert.equal(r.expectedChapters,20);assert.equal(r.complete,false);assert.equal(r.activationEligible,false);});
test('a partial edition cannot become eligible by changing only its status and reviews',()=>{const d=draft();d.status='approved';d.review={scientific:true,editorial:true,rights:true,reader:true};assert.equal(validateDraft(d).activationEligible,false);});
test('unknown references, duplicate chapters and an invalid base are rejected',()=>{const d=draft();d.baseCanonicalSha256='';d.chapters[1].id=d.chapters[0].id;d.chapters[0].sourceIds.push('invented-source');const r=validateDraft(d);assert.ok(r.errors.some(x=>x.includes('checksum')));assert.ok(r.errors.some(x=>x.includes('Duplicate')));assert.ok(r.errors.some(x=>x.includes('Unknown')));});
test('normal review never mutates the protected original or candidate file',()=>{const before=fs.readFileSync(file,'utf8');validateDraft(draft());assert.equal(fs.readFileSync(file,'utf8'),before);});

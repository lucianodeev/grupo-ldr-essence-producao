const test=require('node:test'),assert=require('node:assert/strict');
const {repeatedGroups,buildPlan,applyPreview}=require('../../../tools/book-boilerplate-preview.cjs');
const repeated='Esta frase editorial serve apenas para enquadrar o método e não acrescenta acontecimentos ao relato.';
const source=()=>({product_key:'synthetic_book',locale:'pt',version:2,decoded:{kind:'ebook',pages:[{titulo:'Primeiro',texto:'O encontro foi marcado para terça-feira. '+repeated},{titulo:'Segundo',texto:'A personagem trouxe três cadernos. '+repeated},{titulo:'Terceiro',texto:'O grupo escolheu outra sala. '+repeated}]}});
function plan(row){return buildPlan(row,repeatedGroups(row.decoded,3).map(group=>group.sha256),{minOccurrences:3});}
test('book preview removes selected framing copies while preserving every source fact and unit',()=>{
 const row=source(),before=JSON.stringify(row),p=plan(row),preview=applyPreview(row,p);
 assert.equal(p.removals.length,2);assert.equal(preview.pages.length,3);
 assert.equal(preview.pages[0].texto,row.decoded.pages[0].texto);
 assert.ok(preview.pages[1].texto.includes('três cadernos'));assert.ok(preview.pages[2].texto.includes('outra sala'));
 assert.ok(!preview.pages[1].texto.includes(repeated));assert.equal(JSON.stringify(row),before);
 assert.deepEqual(preview.pages.map(page=>page.titulo),row.decoded.pages.map(page=>page.titulo));
});
test('revision manifests contain hashes and locations without publishing source prose',()=>{
 const p=plan(source()),text=JSON.stringify(p);
 assert.equal(p.published,false);assert.equal(p.status,'review-required');
 assert.ok(!text.includes(repeated));assert.ok(!text.includes('três cadernos'));
});
test('changed editions or passages abort rather than applying a patch to another original',()=>{
 const row=source(),p=plan(row);row.version=3;assert.throws(()=>applyPreview(row,p),/identity/);
 const changed=source();changed.decoded.pages[1].texto+=' Informação nova.';assert.throws(()=>applyPreview(changed,p),/checksum/);
 const tampered=plan(source());tampered.removals[0].textSha256='0'.repeat(64);assert.throws(()=>applyPreview(source(),tampered),/passage/);
});
test('unselected phrases are preserved and duplicate removals are refused',()=>{
 const row=source(),p=plan(row);p.removals=p.removals.slice(0,1);
 const preview=applyPreview(row,p);assert.equal(preview.pages[2].texto,row.decoded.pages[2].texto);
 p.removals.push({...p.removals[0]});assert.throws(()=>applyPreview(row,p),/passage/);
});
test('the first occurrence cannot be removed by editing manifest locations',()=>{
 const row=source(),p=plan(row);
 p.removals[0].unit=1;
 assert.throws(()=>applyPreview(row,p),/after its first occurrence/);
});

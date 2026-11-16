const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path');
const root = path.resolve(__dirname, '../../..');
const course = name => JSON.parse(fs.readFileSync(path.join(root, 'editorial/courses', name + '.pt.json'), 'utf8'));
const report = JSON.parse(fs.readFileSync(path.join(root, 'editorial/reviews/domain-review-20261116.json'), 'utf8'));
const implies = (a,b) => !a || b;
test('domain review keeps its actual scope and publication gates explicit', () => {
  assert.equal(report.publicationApproval, false); assert.equal(report.specialistReview, false);
  assert.equal(report.participantPilot, false); assert.equal(report.validatedHours, null);
  assert.equal(report.changes.length, 14);
  for (const item of report.changes) {
    const draft = course(item.file.replace('.pt.json',''));
    assert.equal(draft.published, false); assert.equal(draft.status, 'draft');
    assert.ok(Object.values(draft.review).every(value => value === false));
    assert.deepEqual(draft.sources, item.sources);
  }
});
test('four truth assignments distinguish implication, equivalence and invalid converse', () => {
  const rows = [[true,true],[true,false],[false,true],[false,false]];
  assert.deepEqual(rows.map(([a,b]) => implies(a,b)), report.mathematics.truthTableConditional);
  assert.deepEqual(rows.map(([a,b]) => a === b), report.mathematics.truthTableBiconditional);
  assert.ok(rows.every(([s,t]) => !(implies(s,t) && s) || t));
  assert.ok(rows.every(([s,t]) => !(implies(s,t) && !t) || !s));
  assert.ok(rows.some(([s,t]) => implies(s,t) && t && !s));
  assert.ok(rows.some(([s,t]) => implies(s,t) && !s && t));
  let differences = 0;
  for (const a of [true,false]) for (const b of [true,false]) for (const c of [true,false])
    if (((b || c) && a) !== (b || (c && a))) { assert.equal(a,false); assert.equal(b,true); differences++; }
  assert.equal(differences,2);
  const cards = ['blue','blue','blue','green'];
  assert.equal(!cards.every(c => c === 'blue'), cards.some(c => c !== 'blue'));
});
test('set regions and all five notebook totals satisfy the original premises', () => {
  assert.deepEqual([18-6,6,14-6,30-(18+14-6)], report.mathematics.group30Regions);
  const draft = course('logical-reasoning'), unit = draft.modules[5], p = unit.workPacket;
  const verify = (L,D,books) => {
    assert.equal(new Set(L).size,7); assert.equal(new Set(D).size,6);
    assert.equal(L.filter(id => D.includes(id)).length,3);
    assert.equal(new Set(books).size,books.length);
    assert.ok([...L,...D,...books].every(id => p.dominio.includes(id)));
    assert.ok(L.every(id => books.includes(id)));
    assert.ok(books.includes(p.Alex)); assert.ok(!books.includes(p.Bia));
    assert.ok(!L.includes(p.Bia));
  };
  p.modelosCadernos.forEach(books => verify(p.L,p.D,books));
  assert.deepEqual(p.modelosCadernos.map(b => b.length),[7,8,9,10,11]);
  const counter = p.contraexemploAlex; verify(counter.L,counter.D,counter.cadernos);
  assert.ok(!counter.L.includes(p.Alex));
  assert.deepEqual([p.L.filter(id => !p.D.includes(id)).length,3,p.D.filter(id => !p.L.includes(id)).length,12-new Set([...p.L,...p.D]).size],report.mathematics.club12Regions);
  assert.match(unit.assessment.answer,/máximo é onze/);
});

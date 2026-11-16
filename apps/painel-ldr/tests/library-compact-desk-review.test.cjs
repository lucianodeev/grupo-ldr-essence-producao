const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const root = path.resolve(__dirname, '../../..');
const record = JSON.parse(fs.readFileSync(path.join(root, 'editorial/reviews/compact-courses-20261116.json'), 'utf8'));
test('internal review remains attached to exact draft units and cannot masquerade as publication approval', () => {
  assert.equal(record.courses.length, 28);
  assert.equal(record.publicationApproval, false);
  assert.equal(record.specialistReview, false);
  assert.equal(record.participantPilot, false);
  assert.equal(record.assistiveTechnologyTest, false);
  assert.equal(record.validatedHours, null);
  assert.match(record.reviewer, /assistida por IA/);
  let units = 0;
  for (const item of record.courses) {
    const draft = JSON.parse(fs.readFileSync(path.join(root, 'editorial/courses', item.file), 'utf8'));
    assert.equal(draft.slug, item.slug); assert.equal(draft.productKey, item.productKey);
    assert.equal(draft.status, 'draft'); assert.equal(draft.published, false);
    assert.ok(Object.values(draft.review).every(value => value === false));
    for (const evidence of item.units) {
      const unit = draft.modules.find(module => module.id === evidence.id); assert.ok(unit);
      assert.equal(crypto.createHash('sha256').update(JSON.stringify(unit)).digest('hex'), evidence.sha256, item.file + ': stale review evidence');
      assert.ok(unit.workPacket.resolucaoComentada.length > 100);
      assert.ok(unit.workPacket.limitesDaConclusao.length > 30);
      units++;
    }
  }
  assert.equal(units, 56);
});
test('worked numerical claims reproduce their stated arithmetic and rounding', () => {
  let checked = 0;
  for (const item of record.courses) {
    const draft = JSON.parse(fs.readFileSync(path.join(root, 'editorial/courses', item.file), 'utf8'));
    for (const evidence of item.units) {
      const unit = draft.modules.find(module => module.id === evidence.id);
      for (const check of evidence.numericalChecks) {
        const [a, b] = check.inputs;
        const value = check.operation === 'sum' ? check.inputs.reduce((total, n) => total + n, 0)
          : check.operation === 'subtract' ? a - b
          : check.operation === 'divide' ? a / b
          : check.operation === 'percent' ? a / b * 100 : NaN;
        assert.equal(Number(value.toFixed(check.decimals)), check.expected, item.file + '/' + evidence.id);
        assert.ok(unit.workPacket.resolucaoComentada.includes(check.claim), 'calculation must remain anchored to its worked solution');
        checked++;
      }
    }
  }
  assert.equal(checked, 40);
});

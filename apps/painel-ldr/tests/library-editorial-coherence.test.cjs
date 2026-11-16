const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { validateCourseDraft } = require('../../../tools/validate-course-drafts.cjs');

const read = name => JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../editorial/courses', name), 'utf8'));
const teachingText = module => [
  ...(module.sections || []).flatMap(section => section.paragraphs || []),
  module.case, module.exercise, module.assessment?.question, module.assessment?.answer,
  ...(module.assessment?.rubric || [])
].join(' ').toLowerCase();

test('business course reconciles break-even with authorized delivery bottleneck', () => {
  const draft = read('business-foundations.pt.json');
  const module = draft.modules.find(item => item.id === '4');
  const text = teachingText(module);
  const price = 120, variable = 30, fixed = 360, authorizedDeliveries = 3;
  const contribution = price - variable;
  const breakEven = Math.ceil(fixed / contribution);
  assert.equal(contribution, 90);
  assert.equal(breakEven, 4);
  assert.equal(fixed - authorizedDeliveries * contribution, 90);
  assert.ok(authorizedDeliveries < breakEven);
  assert.match(text, /270/);
  assert.match(text, /360/);
  assert.match(text, /défice de\s?90|faltando\s?90/);
  assert.match(text, /capacidade autorizada/);
  assert.match(text, /quatro/);
  assert.equal(draft.published, false);
  assert.equal(draft.validatedHours, null);
  assert.deepEqual(validateCourseDraft(draft).errors, []);
});

test('digital kit distinguishes missing permission from missing physical check', () => {
  const draft = read('digital-product-creation.pt.json');
  const module = draft.modules.find(item => item.id === '3');
  const text = teachingText(module);
  assert.match(text, /e01/);
  assert.match(text, /e02/);
  assert.match(text, /e03/);
  assert.match(text, /pendente de autorização/);
  assert.match(text, /conferência em falta/);
  assert.match(text, /prova.*(vazio|obtida)/);
  assert.equal(draft.published, false);
  assert.equal(draft.validatedHours, null);
  assert.deepEqual(validateCourseDraft(draft).errors, []);
});

test('neither edited course can be activated without specialist reviews', () => {
  for (const filename of ['business-foundations.pt.json', 'digital-product-creation.pt.json']) {
    const draft = read(filename);
    const result = validateCourseDraft(draft);
    assert.equal(result.complete, true);
    assert.equal(result.activationEligible, false);
    assert.ok(['scientific', 'editorial', 'rights', 'reader', 'workload'].every(key => draft.review[key] === false));
  }
});

test('higher variable cost raises break-even to five and cannot bypass capacity', () => {
  const draft = read('business-foundations.pt.json');
  const module = draft.modules.find(item => item.id === '3');
  const text = teachingText(module);
  const price = 120, variableCost = 45, fixedCost = 360, authorizedCapacity = 3;
  const contribution = price - variableCost;
  const breakEven = Math.ceil(fixedCost / contribution);
  assert.equal(contribution, 75);
  assert.equal(breakEven, 5);
  assert.equal(fixedCost - authorizedCapacity * contribution, 135);
  assert.match(text, /setenta e cinco/);
  assert.match(text, /cinco/);
  assert.ok(authorizedCapacity < breakEven);
  assert.equal(draft.published, false);
});

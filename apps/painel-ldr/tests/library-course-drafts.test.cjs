const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { validateCourseDraft } = require('../../../tools/validate-course-drafts.cjs');
const file = path.resolve(__dirname, '../../../editorial/courses/interview-preparation.pt.json');
const read = () => JSON.parse(fs.readFileSync(file, 'utf8'));

test('interview course has fifteen developed modules without claiming approved hours or publication', () => {
  const result = validateCourseDraft(read());
  assert.deepEqual(result.errors, []);
  assert.equal(result.authoredModules, 15);
  assert.equal(result.expectedModules, 15);
  assert.equal(result.complete, true);
  assert.equal(result.validatedHours, null);
  assert.equal(result.activationEligible, false);
});
test('reviews and advertised hours cannot approve an incomplete course', () => {
  const draft = read();
  draft.modules.pop();
  draft.status = 'approved';
  draft.validatedHours = draft.advertisedHours;
  draft.review = { scientific: true, editorial: true, rights: true, reader: true, workload: true };
  assert.equal(validateCourseDraft(draft).activationEligible, false);
});
test('course checker rejects duplicate exercises, identities and unknown references', () => {
  const draft = read();
  draft.modules[1].exercise = draft.modules[0].exercise;
  draft.modules[1].id = draft.modules[0].id;
  draft.modules[0].sourceIds.push('invented');
  const errors = validateCourseDraft(draft).errors;
  assert.ok(errors.some(error => error.startsWith('Repeated')));
  assert.ok(errors.some(error => error.startsWith('Invalid module')));
  assert.ok(errors.some(error => error.startsWith('Unknown')));
});
test('module counts never substitute for workload and specialist review', () => {
  const draft = read();
  // A shortened curriculum is structurally complete but cannot justify the advertised 80 hours.
  draft.curriculum = draft.curriculum.slice(0, 4);
  draft.modules = draft.modules.slice(0, 4);
  draft.expectedModuleCount = 4;
  draft.status = 'approved';
  assert.equal(validateCourseDraft(draft).complete, true);
  assert.equal(validateCourseDraft(draft).activationEligible, false);
  draft.validatedHours = NaN;
  assert.ok(validateCourseDraft(draft).errors.includes('Invalid validated workload'));
});
test('complete text still requires validated workload and actual specialist reviews', () => {
  const draft = read();
  draft.status = 'approved';
  draft.review = { scientific:true, editorial:true, rights:true, reader:true, workload:true };
  assert.equal(validateCourseDraft(draft).activationEligible, false);
  draft.validatedHours = draft.advertisedHours;
  draft.review.reader = false;
  assert.equal(validateCourseDraft(draft).activationEligible, false);
});
test('paragraph triage detects a lightly edited duplicated passage rather than trusting unique titles', () => {
  const draft = read();
  const original = draft.modules[0].sections[0].paragraphs[0];
  draft.modules[1].sections[0].paragraphs[0] = original.replace('Uma vaga', 'O anúncio desta vaga');
  const result = validateCourseDraft(draft);
  assert.ok(result.repetitionReview.near.length > 0);
  assert.ok(result.errors.includes('Teaching text repetition requires review'));
});
test('all authored paragraphs, activities, cases and assessments are distinct', () => {
  const draft = read(), result = validateCourseDraft(draft);
  assert.deepEqual(result.repetitionReview.exact, []);
  assert.deepEqual(result.repetitionReview.near, []);
  assert.ok(result.repetitionReview.paragraphsChecked >= 100);
  for (const select of [module => module.case, module => module.exercise, module => module.assessment.question, module => module.assessment.answer])
    assert.equal(new Set(draft.modules.map(select)).size, 15);
});
test('integrated simulation ships runnable prompts, synthetic data and explicit limits', () => {
  const packet = read().modules[13].simulationPacket;
  assert.equal(packet.status, 'synthetic-training-only');
  assert.equal(packet.prompts.length, 5);
  assert.equal(packet.candidateExamples.length, 2);
  assert.equal(packet.observerCriteria.length, 5);
  assert.equal(packet.recordingRequired, false);
  assert.equal(packet.certificateEligible, false);
});
test('course draft review preserves the source file and leaves it unpublished', () => {
  const before = fs.readFileSync(file, 'utf8');
  validateCourseDraft(read());
  assert.equal(fs.readFileSync(file, 'utf8'), before);
  assert.equal(read().published, false);
});

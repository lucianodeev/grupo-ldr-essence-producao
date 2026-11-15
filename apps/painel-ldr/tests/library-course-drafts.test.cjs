const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { validateCourseDraft } = require('../../../tools/validate-course-drafts.cjs');
const file = path.resolve(__dirname, '../../../editorial/courses/interview-preparation.pt.json');
const read = () => JSON.parse(fs.readFileSync(file, 'utf8'));

test('interview course has four distinct developed modules and eleven pending modules', () => {
  const result = validateCourseDraft(read());
  assert.deepEqual(result.errors, []);
  assert.equal(result.authoredModules, 4);
  assert.equal(result.expectedModules, 15);
  assert.equal(result.complete, false);
  assert.equal(result.validatedHours, null);
  assert.equal(result.activationEligible, false);
});
test('reviews and advertised hours cannot approve an incomplete course', () => {
  const draft = read();
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
  draft.expectedModuleCount = 4;
  draft.status = 'approved';
  assert.equal(validateCourseDraft(draft).complete, true);
  assert.equal(validateCourseDraft(draft).activationEligible, false);
  draft.validatedHours = NaN;
  assert.ok(validateCourseDraft(draft).errors.includes('Invalid validated workload'));
});
test('course draft review preserves the source file and leaves it unpublished', () => {
  const before = fs.readFileSync(file, 'utf8');
  validateCourseDraft(read());
  assert.equal(fs.readFileSync(file, 'utf8'), before);
  assert.equal(read().published, false);
});

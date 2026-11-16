// Offline editorial checks only. No reader imports, database access or publication.
const fs = require('node:fs');
const path = require('node:path');
const { reviewCourseRepetitions } = require('./course-repetition-review.cjs');

function validateCourseDraft(draft) {
  const errors = [];
  if (!draft || typeof draft !== 'object') return { errors: ['Invalid draft'], activationEligible: false };
  const plan = Array.isArray(draft.curriculum) ? draft.curriculum : [];
  const modules = Array.isArray(draft.modules) ? draft.modules : [];
  const sources = Array.isArray(draft.sources) ? draft.sources : [];
  const sourceIds = new Set(sources.map(source => source.id));
  if (!draft.productKey || !draft.slug || draft.published !== false) errors.push('Unpublished product identity required');
  if (!/^[a-f0-9]{64}$/.test(draft.baseCatalogSha256 || '')) errors.push('Missing base catalog checksum');
  if (!Number.isInteger(draft.expectedModuleCount) || draft.expectedModuleCount <= 0 || plan.length !== draft.expectedModuleCount) errors.push('Invalid curriculum count');
  if (plan.some((item, index) => item.id !== String(index + 1) || !item.title)) errors.push('Invalid curriculum order');
  if (sourceIds.size !== sources.length || sources.some(source => !source.id || !source.title || !/^https:\/\//.test(source.url || '') || !source.scope || !source.consulted)) errors.push('Invalid bibliography');
  const seen = new Set(), bodies = new Set(), exercises = new Set();
  for (const module of modules) {
    const planned = plan.find(item => item.id === module.id);
    if (seen.has(module.id) || !planned || planned.title !== module.title) errors.push('Invalid module identity ' + module.id);
    seen.add(module.id);
    const body = (module.sections || []).flatMap(section => section.paragraphs || []).join(' ').trim();
    if (body.split(/\s+/).length < 400) errors.push('Module requires development ' + module.id);
    if (bodies.has(body) || exercises.has(module.exercise)) errors.push('Repeated teaching material ' + module.id);
    bodies.add(body); exercises.add(module.exercise);
    if (!module.objectives?.length || !module.case || !module.exercise || !module.assessment?.question || !module.assessment?.answer || !module.assessment?.rubric?.length) errors.push('Incomplete pedagogy ' + module.id);
    if (!module.sourceIds?.length || module.sourceIds.some(id => !sourceIds.has(id))) errors.push('Unknown or missing reference ' + module.id);
    if (!Number.isFinite(module.estimatedPracticeMinutes) || module.estimatedPracticeMinutes <= 0) errors.push('Invalid practice estimate ' + module.id);
  }
  if (!Number.isFinite(draft.advertisedHours) || draft.advertisedHours <= 0) errors.push('Invalid advertised hours');
  if (draft.validatedHours !== null && (!Number.isFinite(draft.validatedHours) || draft.validatedHours <= 0)) errors.push('Invalid validated workload');
  const complete = plan.length > 0 && modules.length === plan.length && plan.every(item => seen.has(item.id));
  const repetitionReview = reviewCourseRepetitions(draft);
  if (repetitionReview.exact.length || repetitionReview.near.length) errors.push('Teaching text repetition requires review');
  const reviewed = ['scientific', 'editorial', 'rights', 'reader', 'workload'].every(key => draft.review?.[key] === true);
  // This is an offline review indicator, never an activation operation. Word count alone is not quality approval.
  const activationEligible = errors.length === 0 && complete && reviewed && draft.status === 'approved' && draft.validatedHours === draft.advertisedHours;
  return { errors, authoredModules: modules.length, expectedModules: draft.expectedModuleCount, complete, validatedHours: draft.validatedHours, activationEligible, repetitionReview };
}
module.exports = { validateCourseDraft };
if (require.main === module) {
  const directory = path.resolve(__dirname, '../editorial/courses');
  for (const filename of fs.readdirSync(directory).filter(name => name.endsWith('.json'))) {
    const result = validateCourseDraft(JSON.parse(fs.readFileSync(path.join(directory, filename), 'utf8')));
    console.log(filename, JSON.stringify(result));
    if (result.errors.length) process.exitCode = 1;
  }
}

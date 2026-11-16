// Compare only authored candidates, never paid originals exported from production.
const fs = require('node:fs');
const path = require('node:path');
const { reviewCourseRepetitions } = require('./course-repetition-review.cjs');
function reviewEditorialCorpus(documents) {
  const modules = documents.flatMap(document => (document.modules || document.chapters || []).map(unit => ({...unit,id:document.productKey + ':' + unit.id})));
  const result = reviewCourseRepetitions({ modules });
  return { documents:documents.length, units:modules.length, ...result };
}
function readCandidates(root = path.resolve(__dirname, '..')) {
  return ['editorial/courses','editorial/drafts'].flatMap(directory => fs.readdirSync(path.join(root,directory)).filter(name=>name.endsWith('.json')).sort().map(name=>JSON.parse(fs.readFileSync(path.join(root,directory,name),'utf8'))));
}
module.exports = { reviewEditorialCorpus, readCandidates };
if (require.main === module) {
  const result = reviewEditorialCorpus(readCandidates());
  console.log(JSON.stringify(result));
  if (result.exact.length || result.near.length) process.exitCode = 1;
}

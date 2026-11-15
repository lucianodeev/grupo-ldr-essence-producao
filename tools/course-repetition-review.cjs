// Triage only: absence of textual similarity never certifies originality or teaching quality.
const tokens = text => String(text || '').normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase().match(/[\p{L}\p{N}]+/gu) || [];
const canonical = text => tokens(text).join(' ');
const shingles = text => {
  const words = tokens(text), result = new Set();
  for (let index = 0; index <= words.length - 6; index++) result.add(words.slice(index, index + 6).join(' '));
  return result;
};
function reviewCourseRepetitions(draft) {
  const paragraphs = [], exact = [], near = [], exercises = new Map();
  for (const module of draft.modules || []) {
    const exercise = canonical(module.exercise);
    if (exercise && exercises.has(exercise)) exact.push({kind:'exercise',a:exercises.get(exercise),b:module.id});
    exercises.set(exercise, module.id);
    for (const [sectionIndex, section] of (module.sections || []).entries())
      for (const [paragraphIndex, text] of (section.paragraphs || []).entries())
        if (tokens(text).length >= 25) paragraphs.push({location:`${module.id}.${sectionIndex + 1}.${paragraphIndex + 1}`, canonical:canonical(text), shingles:shingles(text)});
  }
  for (let a = 0; a < paragraphs.length; a++) for (let b = a + 1; b < paragraphs.length; b++) {
    const first = paragraphs[a], second = paragraphs[b];
    if (first.canonical === second.canonical) exact.push({kind:'paragraph',a:first.location,b:second.location});
    else {
      let common = 0;
      for (const value of first.shingles) if (second.shingles.has(value)) common++;
      const score = common / (first.shingles.size + second.shingles.size - common);
      if (score >= 0.4) near.push({a:first.location,b:second.location,jaccard:Number(score.toFixed(4))});
    }
  }
  return {method:'paragraphs >=25 words; six-word shingles; Jaccard >=0.40; editorial review still required',paragraphsChecked:paragraphs.length,pairsChecked:paragraphs.length * (paragraphs.length - 1) / 2,exact,near};
}
module.exports = { reviewCourseRepetitions };

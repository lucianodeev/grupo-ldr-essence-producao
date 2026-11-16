// Offline review export. Never imported by the application or used to activate products.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { validateCourseDraft } = require('./validate-course-drafts.cjs');
const ROOT = path.resolve(__dirname, '..');
const hash = value => crypto.createHash('sha256').update(value).digest('hex');

// Preserve every string and number in supplementary work/simulation packets.
// Separate paragraphs work with the Academy reader's deliberately small Markdown subset.
function packetParagraphs(value, trail = []) {
  if (value === null || value === undefined) return [];
  if (typeof value !== 'object') return [trail.join(' / ') + ': ' + String(value)];
  return Object.entries(value).flatMap(([key, item]) => packetParagraphs(item, [...trail, key]));
}

function prepareCourseCandidate(filename, root = ROOT) {
  if (!/^[a-z-]+\.pt\.json$/.test(filename)) throw new Error('Invalid candidate filename');
  const raw = fs.readFileSync(path.join(root, 'editorial/courses', filename), 'utf8');
  const draft = JSON.parse(raw);
  const result = validateCourseDraft(draft);
  if (result.errors.length || !result.complete || draft.status !== 'draft') {
    throw new Error('Invalid or non-draft candidate: ' + filename + ' ' + result.errors.join('; '));
  }
  const modules = draft.modules.map(module => {
    const references = module.sourceIds.map(id => draft.sources.find(source => source.id === id));
    const parts = [
      '# ' + module.title,
      'Rascunho para revisão. Não publicado. Sem carga horária validada e sem certificado.',
      '## Objetivos', ...module.objectives,
      ...module.sections.flatMap(section => ['## ' + section.title, ...section.paragraphs]),
      '## Caso de aplicação', module.case,
      '## Atividade', module.exercise,
      ...['simulationPacket', 'workPacket'].flatMap(key => module[key]
        ? ['## Dados complementares da atividade', ...packetParagraphs(module[key])] : []),
      '## Verificação', module.assessment.question,
      '## Resposta comentada', module.assessment.answer,
      '## Critérios de revisão', ...module.assessment.rubric,
      '## Referências e limites de utilização',
      ...references.flatMap(source => [source.title, source.url,
        ...(source.doi ? ['DOI: ' + source.doi] : []),
        'Consulta registada no rascunho: ' + source.consulted, source.scope]),
    ];
    const body = parts.join('\n\n');
    return { id: module.id, title: module.title, format: 'markdown', body,
      sha256: hash(body), sourceSha256: hash(JSON.stringify(module)) };
  });
  return {
    schema: 'ldr-academy-reading-edition-v1', slug: draft.slug, productKey: draft.productKey,
    editionId: 'review-' + hash(raw + '\n' + modules.map(module => module.sha256).join('\n')),
    locale: 'pt', status: 'draft', published: false,
    validatedHours: null, releaseMode: 'reading-only', certificate: false,
    review: { pedagogy: false, editorial: false, rights: false, accessibility: false, workload: false, reader: false },
    approval: null, modules,
  };
}

function prepareAllCandidates(root = ROOT) {
  return fs.readdirSync(path.join(root, 'editorial/courses')).filter(file => file.endsWith('.json'))
    .sort().map(file => prepareCourseCandidate(file, root));
}
if (require.main === module) {
  const candidates = prepareAllCandidates();
  console.log(JSON.stringify(process.argv.includes('--stdout') ? candidates : {
    courses: candidates.length, units: candidates.reduce((sum, edition) => sum + edition.modules.length, 0),
    published: 0, activationEligible: 0,
    pending: ['pedagogical review', 'editorial review', 'rights review', 'accessibility review', 'reader approval'],
  }, null, 2));
}
module.exports = { prepareCourseCandidate, prepareAllCandidates };

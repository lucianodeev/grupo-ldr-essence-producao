// Offline estimated-workload programme. Never registers, publishes or issues certificates.
'use strict';
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const ROOT = path.resolve(__dirname, '..');
const FILE = 'editorial/programmes/customer-service-60h.pt.json';
const sha = text => crypto.createHash('sha256').update(text).digest('hex');
function validateProgramme(p, root = ROOT) {
  const errors = [], totals = { study: 0, practice: 0, case: 0, project: 0, assessment: 0 }, ids = new Set(), unitIds = new Set();
  const fail = (condition, message) => { if (!condition) errors.push(message); };
  fail(p?.schema === 'ldr-estimated-learning-programme-v1', 'Wrong schema');
  fail(p?.status === 'draft' && p.published === false && p.activationEligible === false, 'Only unpublished drafts accepted');
  fail(p?.validatedHours === null && p.certificate === false && p.approval === null, 'No approval, hours or certificate may be asserted');
  fail(Object.values(p?.review || {}).length === 6 && Object.values(p?.review || {}).every(v => v === false), 'Review gates must remain pending');
  fail(p?.pilot?.status === 'not-applied' && p.pilot.participants?.length === 0 && p.pilot.observations?.length === 0 && p.pilot.validatedHours === null, 'No pilot evidence exists for this edition');
  fail(p?.authorship?.humanCreativeContributionRecorded === false && p.authorship.humanContentAcceptanceRecorded === false, 'No completed human authorship review recorded');
  fail(p?.modules?.length === 6, 'Six units required');
  for (const m of p?.modules || []) {
    fail(/^[1-6]$/.test(m.id) && !unitIds.has(m.id), 'Distinct unit IDs 1–6 required'); unitIds.add(m.id);
    fail(m.baseReading?.path?.includes('/unit-0' + m.id + '-'), 'Unit and base reading must match');
    fail(Boolean(m.title?.trim()) && m.outcomes?.length >= 2 && m.casePacket && Object.keys(m.casePacket).length >= 3, 'Unit needs objectives and case data');
    fail(/^docs\/audit-20261115\/course-development\/customer-service\/unit-0[1-6]-[a-z-]+\.md$/.test(m.baseReading?.path || ''), 'Invalid base reading path');
    if (/^docs\/audit-20261115\/course-development\/customer-service\/unit-0[1-6]-[a-z-]+\.md$/.test(m.baseReading?.path || '')) {
      const file = path.join(root, m.baseReading.path);
      fail(fs.existsSync(file) && sha(fs.readFileSync(file, 'utf8')) === m.baseReading.sha256, 'Base reading changed: ' + m.id);
    }
    fail(m.activities?.length === 5 && new Set(m.activities?.map(a => a.category)).size === 5, 'Each unit needs five distinct categories');
    for (const a of m.activities || []) {
      fail(!ids.has(a.id), 'Duplicate activity ID: ' + a.id); ids.add(a.id);
      fail(Object.hasOwn(totals, a.category), 'Unknown workload category');
      const minutes = (a.steps || []).reduce((sum, s) => sum + (Number.isInteger(s.minutes) && s.minutes > 0 ? s.minutes : NaN), 0);
      fail(Number.isFinite(minutes) && minutes === a.estimatedMinutes, 'Invalid step duration: ' + a.id);
      fail(a.steps?.length >= 2 && a.steps.every(s => s.instruction?.length > 50), 'Actionable steps required');
      fail(a.submissionFields?.length >= 2 && a.acceptanceCriteria?.length >= 2 && a.facilitatorKey?.length >= 1, 'Evidence and key required');
      if (Object.hasOwn(totals, a.category)) totals[a.category] += minutes;
    }
  }
  for (const [category, minutes] of Object.entries(totals)) fail(minutes === p?.distributionMinutes?.[category], 'Distribution mismatch: ' + category);
  fail(Object.values(totals).reduce((a,b) => a+b,0) === 3600 && p?.estimatedHours === 60, 'Estimated workload must sum to 60 hours');
  fail(p?.project?.rubric?.reduce((sum, row) => sum + row.maxPoints,0) === 100, 'Rubric must sum to 100');
  fail(p?.finalQuestions?.length === 8 && p.finalQuestions.every(q => q.question?.trim() && q.key?.trim()), 'Eight final questions and keys required');
  return { errors, totals, modules: p?.modules?.length || 0, activities: ids.size, estimatedHours: 60, validatedHours: null, activationEligible: false };
}
function paragraphs(value, prefix = '') {
  if (value === null) return [prefix + ': não fornecido'];
  if (typeof value !== 'object') return [prefix + ': ' + String(value)];
  return Object.entries(value).flatMap(([k,v]) => paragraphs(v, prefix ? prefix + ' / ' + k : k));
}
function prepareProgramme(root = ROOT, { answers = false } = {}) {
  const raw = fs.readFileSync(path.join(root, FILE), 'utf8'), p = JSON.parse(raw), check = validateProgramme(p, root);
  if (check.errors.length) throw new Error(check.errors.join('; '));
  const modules = p.modules.map(m => {
    const reading = fs.readFileSync(path.join(root, m.baseReading.path), 'utf8');
    const parts = ['# ' + m.title, 'Rascunho não publicado. Percurso de 60 horas estimadas, não validadas. Sem certificado.',
      p.authorship.credit, p.authorship.note, ...paragraphs(p.workloadPolicy), '## Objetivos', ...m.outcomes,
      '## Leitura de base preservada', reading, '## Dados fictícios do laboratório', ...paragraphs(m.casePacket)];
    for (const a of m.activities) {
      parts.push('## ' + a.id + ' — ' + a.title, 'Duração estimada: ' + a.estimatedMinutes + ' minutos. Não é tempo mínimo obrigatório.',
        ...a.steps.map((s,i) => (i+1) + '. ' + s.instruction + ' — previsão: ' + s.minutes + ' min.'),
        '### Entregáveis', ...a.submissionFields, '### Critérios', ...a.acceptanceCriteria);
      if (answers) parts.push('### Gabarito do facilitador — não é resultado de participante', ...a.facilitatorKey);
    }
    if (m.id === '6') {
      parts.push('## Projeto final', ...paragraphs(p.project), '## Verificação final', ...p.finalQuestions.map(q => q.question));
      if (answers) parts.push('## Chave da verificação final', ...p.finalQuestions.map(q => q.key));
    }
    parts.push('## Limites', ...p.releaseLimits);
    const body = parts.join('\n\n');
    return { id: m.id, title: m.title, format: 'markdown', body, sha256: sha(body), sourceSha256: sha(JSON.stringify(m)) };
  });
  return { schema: 'ldr-academy-reading-edition-v1', slug: p.slug, productKey: p.productKey,
    editionId: 'customer-service-60h-' + sha(raw + modules.map(m => m.sha256).join('\n') + String(answers)),
    locale: 'pt', status: 'draft', published: false, validatedHours: null, certificate: false,
    review: { ...p.review }, approval: null, modules };
}
function reviewMarkdown(root = ROOT) {
  const p = JSON.parse(fs.readFileSync(path.join(root, FILE), 'utf8')), check = validateProgramme(p,root);
  if (check.errors.length) throw new Error(check.errors.join('; '));
  return ['# ' + p.title, 'Rascunho editorial. 60 horas estimadas de aprendizagem; nenhuma hora validada, parecer profissional, pilotagem ou certificado.',
    p.authorship.credit, p.authorship.note, '## Distribuição prevista',
    '| Atividade | Horas |', '| --- | ---: |', ...Object.entries(check.totals).map(([k,v]) => '| ' + ({study:'Estudo ativo',practice:'Exercícios práticos',case:'Estudos de caso',project:'Projeto final',assessment:'Avaliação e revisão'}[k]) + ' | ' + v/60 + ' |'),
    '## Política de duração', ...paragraphs(p.workloadPolicy),
    ...p.modules.flatMap(m => ['## Unidade ' + m.id + ' — ' + m.title, ...m.outcomes,
      '### Dados do laboratório', ...paragraphs(m.casePacket), ...m.activities.flatMap(a => [
        '### ' + a.id + ' — ' + a.title + ' (' + a.estimatedMinutes + ' min estimados)',
        ...a.steps.map(s => '- ' + s.instruction + ' (' + s.minutes + ' min)'),
        '**Entregáveis:** ' + a.submissionFields.join('; '), '**Critérios:** ' + a.acceptanceCriteria.join('; '),
        '**Chave de revisão — facilitador:**', ...a.facilitatorKey])]),
    '## Projeto e avaliação', ...paragraphs(p.project), ...p.finalQuestions.flatMap(q => [q.question,q.key]),
    '## Pilotagem ainda não aplicada', ...paragraphs(p.pilot), '## Limites', ...p.releaseLimits,
    'O JSON é a fonte do programa. Este documento é gerado por tools/prepare-customer-service-60h.cjs --review-markdown.',
  ].join('\n\n') + '\n';
}
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.includes('--review-markdown')) process.stdout.write(reviewMarkdown());
  else { const edition = prepareProgramme(ROOT,{ answers: args.includes('--answers') });
    console.log(JSON.stringify(args.includes('--stdout') ? edition : { schema: edition.schema, modules: edition.modules.length, estimatedHours: 60, validatedHours: null, published: false, certificate: false },null,2)); }
}
module.exports = { validateProgramme, prepareProgramme, reviewMarkdown, FILE };

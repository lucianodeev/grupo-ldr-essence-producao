// Offline adapter only: never writes a catalog, registry, database or browser asset.
'use strict';
const crypto = require('node:crypto');
const { exportDraft } = require('./export-customer-service-review.cjs');
function prepareAcademyCandidate(root) {
  const draft = exportDraft(root);
  return {
    schema: 'ldr-academy-reading-edition-v1',
    slug: draft.slug,
    productKey: 'curso_assinatura_atendimento_ao_cliente_com_humanizacao_e_resultado',
    editionId: 'customer-service-' + crypto.createHash('sha256').update(draft.modules.map(module => module.sha256).join('\n')).digest('hex'),
    locale: 'pt', status: 'draft', published: false, validatedHours: null,
    review: { pedagogy: false, editorial: false, rights: false, accessibility: false, workload: false, reader: false },
    approval: null,
    modules: draft.modules.map(({ id, title, format, body, sha256 }) => ({ id, title, format, body, sha256 })),
  };
}
if (require.main === module) {
  const candidate = prepareAcademyCandidate();
  console.log(process.argv.includes('--stdout') ? JSON.stringify(candidate, null, 2) : JSON.stringify({ schema: candidate.schema, editionId: candidate.editionId, modules: candidate.modules.length, published: false }));
}
module.exports = { prepareAcademyCandidate };

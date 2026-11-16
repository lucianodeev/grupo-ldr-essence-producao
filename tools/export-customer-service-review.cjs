// Safe, lossless export of authored markdown units for offline review.
// No database, catalog mutation, reader import, or publishing.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { validateCustomerServiceUnits, files } = require('./validate-customer-service-units.cjs');

function exportDraft(root = path.resolve(__dirname, '..')) {
  const directory = path.join(root, 'docs/audit-20261115/course-development/customer-service');
  const validation = validateCustomerServiceUnits(directory);
  if (validation.errors.length) throw new Error('Editorial validation failed: ' + validation.errors.join('; '));
  const modules = files.map((filename, index) => {
    const markdown = fs.readFileSync(path.join(directory, filename), 'utf8');
    const heading = markdown.match(/^## Unidade \d+ — (.+)$/m);
    if (!heading) throw new Error('Missing title: ' + filename);
    return {
      id: String(index + 1),
      title: heading[1],
      format: 'markdown',
      sourceFile: 'docs/audit-20261115/course-development/customer-service/' + filename,
      sha256: crypto.createHash('sha256').update(markdown).digest('hex'),
      body: markdown,
      reviewStatus: 'pending',
    };
  });
  return {
    schema: 'ldr-editorial-review-export-v1',
    slug: 'atendimento-ao-cliente-com-humanizacao-e-resultado',
    title: 'Atendimento ao Cliente com Humanização e Resultado',
    locale: 'pt',
    status: 'draft',
    published: false,
    activationEligible: false,
    validatedHours: null,
    expectedModuleCount: 6,
    review: { scientific: false, editorial: false, rights: false, reader: false, workload: false },
    disclaimer: 'Arquivo de intercâmbio editorial, não é um curso ativável nem um importador do leitor Academy.',
    modules,
  };
}

if (require.main === module) {
  const data = exportDraft();
  const json = JSON.stringify(data, null, 2) + '\n';
  if (process.argv.includes('--stdout')) process.stdout.write(json);
  else console.log(JSON.stringify({ valid: true, schema: data.schema, modules: data.modules.length, bytes: Buffer.byteLength(json), activationEligible: false }));
}
module.exports = { exportDraft };

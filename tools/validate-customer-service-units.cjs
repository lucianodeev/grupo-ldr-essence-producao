// Structural QA for the six unpublished customer-service teaching units.
// Run: node tools/validate-customer-service-units.cjs
// Does not access the database, import to Academy, modify progress or publish.
'use strict';
const fs = require('node:fs');
const path = require('node:path');

const names = [
  'unit-01-diagnostico-do-pedido.md',
  'unit-02-priorizacao-e-encaminhamento.md',
  'unit-03-negativas-reembolsos-alternativas.md',
  'unit-04-reclamacoes-causas-prevencao.md',
  'unit-05-recuperacao-confianca-acompanhamento.md',
  'unit-06-simulacao-integral-avaliacao.md',
 ];
function validateCustomerServiceUnits(root = path.resolve(__dirname, '../docs/audit-20261115/course-development/customer-service')) {
const errors = [];
const results = [];
const normalized = text => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const countWords = text => text.trim().split(/\s+/).filter(Boolean).length;
const fingerprints = new Map();
for (const [index, name] of names.entries()) {
  const file = path.join(root, name);
  if (!fs.existsSync(file)) { errors.push(name + ': missing'); continue; }
  const text = fs.readFileSync(file, 'utf8');
  const plain = normalized(text);
  const words = countWords(text);
  const questions = (text.match(/\*\*(?:Pergunta\s+)?\d+\./g) || []).length;
  const headings = (text.match(/^###\s+.+$/gm) || []).length;
  const expectedTitle = new RegExp('^## Unidade ' + (index + 1) + ' — ', 'm');
  if (!expectedTitle.test(text)) errors.push(name + ': incorrect unit heading');
  if (words < 1100) errors.push(name + ': insufficient development (<1100 words)');
  if (questions < 3) errors.push(name + ': fewer than three numbered assessment questions');
  if (headings < 5) errors.push(name + ': missing teaching sections');
  if (!/revisoes pendentes/.test(plain)) errors.push(name + ': pending review disclaimer missing');
  if (!/(fictici|inventad|sintetic)/.test(plain)) errors.push(name + ': fictional-case disclosure missing');
  if (!/(nao publicad|fora do catalogo|nao integrad|separad[oa] do catalogo)/.test(plain)) errors.push(name + ': unpublished status missing');
  if (!/(carga horaria|duracao|horas.*valid)/.test(plain)) errors.push(name + ': workload caveat missing');
  const paragraphs = text.split(/\n\s*\n/).map(p => normalized(p.trim().replace(/\s+/g, ' '))).filter(p => countWords(p) >= 45);
  for (const paragraph of paragraphs) {
    if (fingerprints.has(paragraph)) errors.push(name + ': exact long paragraph repeated from ' + fingerprints.get(paragraph));
    else fingerprints.set(paragraph, name);
  }
  results.push({ name, words, assessmentQuestions: questions, sections: headings, longParagraphs: paragraphs.length });
}
if (results.length !== names.length) errors.push('Expected six units, found ' + results.length);
return { units: results.length, results, errors };
}
if (require.main === module) {
  const result = validateCustomerServiceUnits();
  console.log(JSON.stringify(result, null, 2));
  if (result.errors.length) process.exitCode = 1;
}
module.exports = { validateCustomerServiceUnits, files: names };

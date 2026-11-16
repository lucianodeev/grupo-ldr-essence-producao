const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const React = require('react'), { renderToStaticMarkup } = require('react-dom/server');
const { prepareCourseCandidate, prepareAllCandidates } = require('../../../tools/prepare-course-academy-candidates.cjs');
const load = require('./helpers/load-ts.cjs')();
const { isApprovedReadingEdition } = load('lib/academy-reading-editions.ts');
const { AcademyMarkdown, AcademyReadingEditionView } = load('components/academy-reading-edition.tsx');
const root = path.resolve(__dirname, '../../..');
function strings(value) {
  return typeof value === 'string' ? [value] : value && typeof value === 'object' ? Object.values(value).flatMap(strings) : [];
}
const checksum = value => crypto.createHash('sha256').update(value).digest('hex');

test('all 49 authored courses convert losslessly, including supplementary task data, and stay blocked', () => {
  const candidates = prepareAllCandidates();
  assert.equal(candidates.length, 49);
  assert.equal(candidates.reduce((n, e) => n + e.modules.length, 0), 193);
  for (const edition of candidates) {
    assert.equal(edition.published, false);
    assert.equal(edition.validatedHours, null);
    assert.equal(isApprovedReadingEdition(edition), false);
    const blocked = renderToStaticMarkup(React.createElement(AcademyReadingEditionView, { edition }));
    assert.ok(!blocked.includes('<article'));
  }
  for (const file of fs.readdirSync(path.join(root, 'editorial/courses'))) {
    const source = path.join(root, 'editorial/courses', file), before = fs.readFileSync(source, 'utf8');
    const draft = JSON.parse(before), edition = prepareCourseCandidate(file);
    for (const [index, module] of draft.modules.entries()) {
      const converted = edition.modules[index];
      assert.equal(converted.sourceSha256, checksum(JSON.stringify(module)));
      assert.equal(converted.sha256, checksum(converted.body));
      const expected = [module.objectives, module.sections, module.case, module.exercise, module.assessment,
        module.simulationPacket, module.workPacket];
      for (const text of strings(expected)) assert.ok(converted.body.includes(text), file + ': ' + text.slice(0, 70));
      for (const id of module.sourceIds) {
        const reference = draft.sources.find(source => source.id === id);
        for (const text of [reference.title, reference.url, reference.scope, reference.consulted, reference.doi].filter(Boolean)) {
          assert.ok(converted.body.includes(text), file + ': missing reference metadata ' + id);
        }
      }
      const html = renderToStaticMarkup(React.createElement(AcademyMarkdown, { body: converted.body }));
      assert.ok(html.includes('<h3')); assert.ok(html.includes('Resposta comentada'));
    }
    assert.equal(fs.readFileSync(source, 'utf8'), before, 'export must not edit source drafts');
    assert.equal(edition.editionId, 'review-' + checksum(before + '\n' + edition.modules.map(module => module.sha256).join('\n')),
      'edition identity must bind both source document and actual exported bodies');
  }
});
test('export rejects paths outside the drafts directory and unreviewed candidates never enter the public registry', () => {
  assert.throws(() => prepareCourseCandidate('../private.json'), /Invalid candidate filename/);
  const publicMetadata = fs.readFileSync(path.join(root, 'apps/painel-ldr/src/lib/academy-reading-editions.ts'), 'utf8');
  assert.ok(!publicMetadata.includes('prepare-course-academy-candidates'));
});

test('all 50 subscription products have either a complete draft edition or the existing approved reading edition', () => {
  const catalog = load('lib/academy-subscription-courses.catalog.ts').ACADEMY_SUBSCRIPTION_COURSES;
  const { CUSTOMER_SERVICE_READING_EDITION: released } = load('content/academy-reading/customer-service-release.server.ts');
  const candidates = prepareAllCandidates();
  assert.equal(catalog.length, 50);
  assert.equal(new Set(candidates.map(item => item.productKey)).size, 49);
  for (const product of catalog) {
    const matches = [...candidates, released].filter(item => item.productKey === product.productKey);
    assert.equal(matches.length, 1, product.slug + ': missing or duplicate edition');
    assert.equal(matches[0].slug, product.slug);
  }
  assert.equal(isApprovedReadingEdition(released), true);
  assert.equal(candidates.some(item => item.published || isApprovedReadingEdition(item)), false);
});

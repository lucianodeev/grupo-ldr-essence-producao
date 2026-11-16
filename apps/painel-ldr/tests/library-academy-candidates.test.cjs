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

test('all 20 authored courses convert losslessly, including supplementary task data, and stay blocked', () => {
  const candidates = prepareAllCandidates();
  assert.equal(candidates.length, 20);
  assert.equal(candidates.reduce((n, e) => n + e.modules.length, 0), 131);
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
      const html = renderToStaticMarkup(React.createElement(AcademyMarkdown, { body: converted.body }));
      assert.ok(html.includes('<h3')); assert.ok(html.includes('Resposta comentada'));
    }
    assert.equal(fs.readFileSync(source, 'utf8'), before, 'export must not edit source drafts');
  }
});
test('export rejects paths outside the drafts directory and unreviewed candidates never enter the public registry', () => {
  assert.throws(() => prepareCourseCandidate('../private.json'), /Invalid candidate filename/);
  const publicMetadata = fs.readFileSync(path.join(root, 'apps/painel-ldr/src/lib/academy-reading-editions.ts'), 'utf8');
  assert.ok(!publicMetadata.includes('prepare-course-academy-candidates'));
});

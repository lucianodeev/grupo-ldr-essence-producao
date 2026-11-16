const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const load = require('./helpers/load-ts.cjs')();
const { prepareAcademyCandidate } = require('../../../tools/prepare-customer-service-academy.cjs');
const { exportDraft } = require('../../../tools/export-customer-service-review.cjs');
const { isApprovedReadingEdition, getAcademyReadingEdition } = load('lib/academy-reading-editions.ts');
const { AcademyReadingEditionView, AcademyMarkdown } = load('components/academy-reading-edition.tsx');
const { getAcademySubscriptionCourse } = load('lib/academy-subscription-courses.catalog.ts');
const root = path.resolve(__dirname, '../../..');
const render = (Component, props) => renderToStaticMarkup(React.createElement(Component, props));
// Synthetic approval for component tests only, never persisted or registered.
function syntheticApproved() {
  const edition = prepareAcademyCandidate();
  edition.status = 'approved'; edition.published = true; edition.validatedHours = 1;
  edition.review = Object.fromEntries(Object.keys(edition.review).map(key => [key, true]));
  edition.approval = { reviewer: 'Synthetic test reviewer', reviewedAt: '2026-11-16T00:00:00Z' };
  return edition;
}
test('offline Academy adapter preserves every byte and deterministic identity without mutating the catalog', () => {
  const file = path.join(root, 'apps/painel-ldr/src/lib/academy-subscription-courses.catalog.ts');
  const before = fs.readFileSync(file, 'utf8');
  const candidate = prepareAcademyCandidate(), draft = exportDraft();
  assert.equal(candidate.modules.length, 6);
  assert.equal(candidate.editionId, prepareAcademyCandidate().editionId);
  assert.equal(candidate.productKey, getAcademySubscriptionCourse(candidate.slug).productKey);
  for (const [index, unit] of candidate.modules.entries()) {
    assert.equal(unit.body, draft.modules[index].body);
    assert.equal(unit.sha256, crypto.createHash('sha256').update(unit.body).digest('hex'));
  }
  assert.equal(fs.readFileSync(file, 'utf8'), before);
});
test('pending candidate is absent from Academy and cannot render even by direct mount', () => {
  const candidate = prepareAcademyCandidate();
  assert.equal(isApprovedReadingEdition(candidate), false);
  assert.equal(getAcademyReadingEdition(candidate.slug, candidate.productKey), null);
  assert.equal(render(AcademyReadingEditionView, { edition: candidate }), '');
});
test('every review, named approval, date and validated workload is independently required', () => {
  assert.equal(isApprovedReadingEdition(syntheticApproved()), true);
  for (const field of Object.keys(syntheticApproved().review)) {
    const candidate = syntheticApproved(); candidate.review[field] = false;
    assert.equal(isApprovedReadingEdition(candidate), false, field);
  }
  for (const mutate of [x => x.status = 'draft', x => x.published = false, x => x.approval = null,
    x => x.approval.reviewer = ' ', x => x.approval.reviewedAt = 'invalid',
    x => x.validatedHours = null, x => x.validatedHours = NaN, x => x.validatedHours = 0,
    x => x.modules[1].id = x.modules[0].id, x => x.modules[0].body = '', x => x.modules[0].sha256 = 'invalid']) {
    const candidate = syntheticApproved(); mutate(candidate);
    assert.equal(isApprovedReadingEdition(candidate), false);
  }
});
test('all six real units render teaching text and final review caveats; rubric renders as an accessible table', () => {
  const candidate = prepareAcademyCandidate();
  for (const unit of candidate.modules) {
    const html = render(AcademyMarkdown, { body: unit.body });
    assert.ok(html.includes('Revisões pendentes:'));
    assert.ok(html.includes(unit.title.replaceAll('&', '&amp;')));
    assert.ok(html.length > unit.body.length);
    assert.ok(!html.includes('[object Object]'));
    assert.ok(!html.includes('### '));
  }
  const html = render(AcademyMarkdown, { body: candidate.modules[5].body });
  assert.ok(html.includes('<table')); assert.ok(html.includes('scope="col"'));
  assert.ok(html.includes('Triagem e separação entre facto, relato e hipótese'));
  assert.ok(html.includes('Não há autorização de publicação'));
});
test('Markdown escapes HTML and script URLs instead of running source markup', () => {
  const html = render(AcademyMarkdown, { body: '<script>alert(1)</script>\n\n<img src=x onerror=alert(1)>\n\n[run](javascript:alert(1))\n\n**Legível**' });
  assert.ok(!html.includes('<script>')); assert.ok(!html.includes('<img'));
  assert.ok(!html.includes('href=')); assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(html.includes('<strong>Legível</strong>'));
});
test('reading edition leaves the fifteen historical modules and their storage namespace intact', () => {
  const candidate = prepareAcademyCandidate(), course = getAcademySubscriptionCourse(candidate.slug);
  assert.equal(course.modules.length, 15); assert.equal(course.hours, 120);
  const component = fs.readFileSync(path.join(root, 'apps/painel-ldr/src/components/academy-reading-edition.tsx'), 'utf8');
  assert.ok(!/localStorage|clientSaveProgress|fetch\(|supabase|stripe/i.test(component));
  const route = fs.readFileSync(path.join(root, 'apps/painel-ldr/src/routes/_clientarea.cliente.cursos.assinatura.$slug.tsx'), 'utf8');
  assert.ok(route.includes('ldr-subscription-course-${course.slug}'));
  assert.ok(route.indexOf('if (!active)') < route.indexOf('<AcademyReadingEditionView'));
  assert.ok(route.includes('resourceKey: course.productKey'));
});
test('only synthetic approved fixture renders the separate reader; no draft content enters the registry', () => {
  const html = render(AcademyReadingEditionView, { edition: syntheticApproved() });
  assert.ok(html.includes('Unidades da edição de leitura'));
  assert.ok(html.includes('não altera as conclusões'));
  const registry = fs.readFileSync(path.join(root, 'apps/painel-ldr/src/lib/academy-reading-editions.ts'), 'utf8');
  assert.ok(registry.includes('approvedEditions: readonly AcademyReadingEdition[] = []'));
  assert.ok(!registry.includes('customer-service/')); assert.ok(!registry.includes('body: "'));
});

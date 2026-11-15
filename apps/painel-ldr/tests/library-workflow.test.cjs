const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const workflow = fs.readFileSync(path.resolve(__dirname, '../../../.github/workflows/apply-academy-subscription-courses-20260914.yml'), 'utf8');

test('Academy CI validates curated files without running legacy generators or writing branches', () => {
  const executable = workflow.split('\n').filter(line => !line.trim().startsWith('#')).join('\n');
  assert.match(executable, /contents: read/);
  assert.match(executable, /persist-credentials: false/);
  assert.doesNotMatch(executable, /contents: write|git push|git commit|patch_academy_subscription|patch_hiv_academy|secrets\./);
});

test('Academy CI installs the root lockfile and checks library, drafts, types and build', () => {
  assert.match(workflow, /run: npm ci --no-audit --no-fund/);
  assert.doesNotMatch(workflow, /working-directory:/);
  for (const command of ['node --test apps/painel-ldr/tests/library-*.test.cjs apps/painel-ldr/tests/editorial-drafts.test.cjs', 'node tools/validate-editorial-drafts.cjs', 'node tools/validate-course-drafts.cjs', 'npm --prefix apps/painel-ldr run typecheck', 'npm --prefix apps/painel-ldr run build'])
    assert.ok(workflow.includes('run: ' + command), command);
  for (const changedArea of ['src/content/academy-free/**', 'editorial/drafts/**', 'editorial/courses/**', 'tests/helpers/**'])
    assert.ok(workflow.includes(changedArea), changedArea);
});

const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const source = fs.readFileSync(path.resolve(__dirname, '../src/lib/curriculum-item.ts'), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const target = { exports: {} };
new Function('module', 'exports', compiled)(target, target.exports);
const { curriculumItem } = target.exports;
test('keeps valid course and lesson positions', () => {
  const items = [{ id: 'first' }, { id: 'second' }];
  assert.equal(curriculumItem(items, 1), items[1]);
});
test('recovers stale, negative and invalid saved positions', () => {
  assert.equal(curriculumItem(['first', 'last'], -4), 'first');
  assert.equal(curriculumItem(['first', 'last'], 99), 'last');
  assert.equal(curriculumItem(['first', 'last'], NaN), 'first');
  assert.equal(curriculumItem(['first', 'last'], 0.5), 'first');
});
test('reports missing content rather than rendering an undefined lesson', () => {
  assert.throws(() => curriculumItem([], 0), /conteúdo.*não está disponível/);
});

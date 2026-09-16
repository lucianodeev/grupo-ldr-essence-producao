// Zero-write Profile V1 contract tests. No network, Supabase, credentials, or production data.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const ROOT = path.resolve(__dirname, '../src');

function loadProfileServer(db) {
  const filename = path.resolve(ROOT, 'lib/academic-profile-v1.server.ts');
  const output = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(output, {
    module, exports: module.exports, console, URL,
    require(id) {
      if (id === '@/integrations/supabase/client.server') return { supabaseAdmin: db };
      return require(id);
    },
  }, { filename });
  return module.exports;
}

function fakeDb({ existing = true } = {}) {
  const state = { upserts: [], updates: [] };
  return {
    state,
    from(table) {
      assert.equal(table, 'academic_profiles');
      return {
        select() { return { eq() { return { maybeSingle: async () => ({ data: existing ? { id: 'profile-1' } : null, error: null }) }; } }; },
        upsert(value, options) { state.upserts.push({ value, options }); return Promise.resolve({ error: null }); },
        update(patch) {
          state.updates.push(patch);
          return { eq(field, value) {
            assert.equal(field, 'user_id'); assert.equal(value, 'user-1');
            return { select() { return { single: async () => ({ data: { id: 'profile-1', ...patch }, error: null }) }; } };
          } };
        },
      };
    },
  };
}

test('Profile V1 sanitizes, deduplicates and limits the persisted contract without a real database', async () => {
  const db = fakeDb();
  const { updateAcademicProfileV1 } = loadProfileServer(db);
  const many = Array.from({ length: 30 }, (_, i) => ` item-${i} `);
  await updateAcademicProfileV1('user-1', {
    bio: `  ${'b'.repeat(1300)}  `,
    institution: '  Universidade Teste  ', courses: [' Curso A ', 'Curso A', 'Curso B'], profession: ' Psicanalista ',
    academicArea: ' Saúde ', interests: [' Psicanálise ', 'Psicanálise', ...many], competencies: many,
    researchTopics: many, languages: [' PT ', 'PT', 'FR'], country: ' Brasil ', city: ' São Paulo ',
    professionalObjective: ' Objetivo ', linkedinUrl: 'https://linkedin.example/user', websiteUrl: 'http://example.test/path',
    availableForOpportunities: true, availableForCollaboration: false, showName: false, showLocation: true,
  });
  const p = db.state.updates[0];
  assert.equal(p.bio.length, 1200);
  assert.equal(p.institution, 'Universidade Teste'); assert.deepEqual(Array.from(p.courses), ['Curso A', 'Curso B']);
  assert.equal(p.profession, 'Psicanalista'); assert.equal(p.academic_area, 'Saúde');
  assert.equal(p.interests.length, 20); assert.equal(new Set(p.interests).size, p.interests.length);
  assert.equal(p.competencies.length, 24); assert.equal(p.research_topics.length, 20);
  assert.deepEqual(Array.from(p.languages), ['PT', 'FR']); assert.equal(p.country, 'Brasil'); assert.equal(p.city, 'São Paulo');
  assert.equal(p.professional_objective, 'Objetivo'); assert.equal(p.linkedin_url, 'https://linkedin.example/user');
  assert.equal(p.website_url, 'http://example.test/path'); assert.equal(p.available_for_opportunities, true);
  assert.equal(p.available_for_collaboration, false); assert.equal(p.show_name, false); assert.equal(p.show_location, true);
  assert.match(p.updated_at, /^\d{4}-\d{2}-\d{2}T/);
  const allowed = ['bio','institution','courses','profession','academic_area','interests','competencies','research_topics','languages','country','city','professional_objective','linkedin_url','website_url','available_for_opportunities','available_for_collaboration','show_name','show_location','updated_at'];
  assert.deepEqual(Object.keys(p).sort(), allowed.sort());
});

test('Profile V1 rejects unsafe URL protocols before any update', async () => {
  const db = fakeDb();
  const { updateAcademicProfileV1 } = loadProfileServer(db);
  await assert.rejects(updateAcademicProfileV1('user-1', { websiteUrl: 'javascript:alert(1)' }), /https:\/\/ ou http:\/\//);
  assert.equal(db.state.updates.length, 0);
});

test('Profile V1 creates only the minimal profile shell when none exists', async () => {
  const db = fakeDb({ existing: false });
  const { updateAcademicProfileV1 } = loadProfileServer(db);
  await updateAcademicProfileV1('user-1', { bio: 'Teste' });
  assert.equal(db.state.upserts.length, 1);
  assert.deepEqual(JSON.parse(JSON.stringify(db.state.upserts[0])), { value: { user_id: 'user-1' }, options: { onConflict: 'user_id', ignoreDuplicates: true } });
  assert.equal(db.state.updates.length, 1);
});

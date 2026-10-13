// Valida rascunhos editoriais, sem publicar cursos nem afirmar carga horária concluída.
// Executar: node --test apps/painel-ldr/src/lib/academy-authored/academy-draft-quality.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const draftFiles = [
  "recepcao-hoteleira.initial.ts",
  "quantitativos-basicos.initial.ts",
  "cozinha-custos.initial.ts",
  "apis-rest-testes.initial.ts",
  "educacao-avaliacao.initial.ts",
  "beleza-consulta.initial.ts",
  "saude-seguranca-paciente.initial.ts",
  "psicanalise-escuta.initial.ts"
];

test("oito frentes autorais permanecem em rascunho e com campos pedagógicos", () => {
  const slugs = new Set();
  const ids = new Set();
  for (const file of draftFiles) {
    const source = readFileSync(join(root, file), "utf8");
    assert.match(source, /publicationReady:\s*false\b/, file);
    assert.match(source, /proposedHours:\s*(60|120|240)\b/, file);
    const slug = source.match(/slug:\s*"([^"]+)"/)?.[1];
    assert.ok(slug, `slug ausente em ${file}`);
    assert.ok(!slugs.has(slug), `slug repetido: ${slug}`);
    slugs.add(slug);
    for (const field of ["title", "objective", "scenario", "content", "practice", "assessment", "references"]) {
      const count = [...source.matchAll(new RegExp(`\\b${field}:\\s*`, "g"))].length;
      assert.equal(count, 2, `${file}: campo ${field} deve constar nas duas aulas`);
    }
    const lessonIds = [...source.matchAll(/id:\s*"((?:hotel|obra|gas|api|edu|beauty|saude|psi)\d+-m\d+-a\d+)"/g)].map(m => m[1]);
    assert.equal(lessonIds.length, 2, `${file}: duas aulas esperadas`);
    assert.equal([...source.matchAll(/\bid:\s*"/g)].length, 2, `${file}: IDs adicionais não reconhecidos`);
    for (const id of lessonIds) {
      assert.ok(!ids.has(id), `id de aula repetido: ${id}`);
      ids.add(id);
    }
  }
  assert.equal(slugs.size, 8);
  assert.equal(ids.size, 16);
});


const modulePrefixes = [
  ["recepcao-hoteleira", "hotel60", "atendimento-operacoes-recepcao-hoteleira"],
  ["quantitativos-basicos", "obra60", "leitura-projetos-quantitativos-basicos"],
  ["cozinha-custos", "gas120", "boas-praticas-controle-custos-cozinhas"],
  ["apis-rest-testes", "api120", "desenvolvimento-apis-rest-com-testes"],
  ["educacao-avaliacao", "edu60", "avaliacao-formativa-planeamento-educacional"],
  ["beleza-consulta", "beauty60", "consulta-segura-servicos-beleza"],
  ["saude-seguranca-paciente", "saude60", "seguranca-paciente-comunicacao-equipes"],
  ["psicanalise-escuta", "psi60", "escuta-etica-entrevista-psicanalitica"]
];

test("32 ficheiros e 64 aulas autorais: IDs, slugs, módulos e bloqueio de publicação", () => {
  const globalIds = new Set();
  const allTitles = new Set();
  let checkedFiles = 0;
  for (const [prefix, idPrefix, expectedSlug] of modulePrefixes) {
    for (let module = 1; module <= 4; module++) {
      const filename = module === 1 ? `${prefix}.initial.ts` : `${prefix}.module-0${module}.ts`;
      const source = readFileSync(join(root, filename), "utf8");
      checkedFiles++;
      assert.match(source, /publicationReady:\s*false\b/, filename);
      const slug = source.match(/\bslug:\s*"([^"]+)"/)?.[1];
      assert.equal(slug, expectedSlug, `${filename}: slug divergente`);
      if (module > 1) {
        const declaredModule = Number(source.match(/\bmodule:\s*(\d+)/)?.[1]);
        assert.equal(declaredModule, module, `${filename}: módulo divergente`);
      }
      for (const field of ["title", "objective", "scenario", "content", "practice", "assessment", "references"]) {
        const count = [...source.matchAll(new RegExp(`\\b${field}:\\s*`, "g"))].length;
        assert.equal(count, 2, `${filename}: campo ${field} deve aparecer duas vezes`);
      }
      const ids = [...source.matchAll(/\bid:\s*"([^"]+)"/g)].map(match => match[1]);
      assert.equal(ids.length, 2, `${filename}: duas aulas esperadas`);
      for (let lesson = 1; lesson <= 2; lesson++) {
        const expectedId = `${idPrefix}-m0${module}-a0${lesson}`;
        assert.equal(ids[lesson - 1], expectedId, `${filename}: ordem/ID inesperado`);
        assert.ok(!globalIds.has(expectedId), `ID repetido: ${expectedId}`);
        globalIds.add(expectedId);
      }
      const titles = [...source.matchAll(/\btitle:\s*"([^"]+)"/g)].map(match => match[1].trim().toLowerCase());
      for (const title of titles) {
        assert.ok(!allTitles.has(title), `título exatamente repetido: ${title}`);
        allTitles.add(title);
      }
    }
  }
  assert.equal(checkedFiles, 32);
  assert.equal(globalIds.size, 64);
});

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

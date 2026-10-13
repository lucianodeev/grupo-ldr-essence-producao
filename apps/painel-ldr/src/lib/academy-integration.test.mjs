import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const root = new URL("./", import.meta.url);
const read = (name) => readFileSync(new URL(name, root), "utf8");

test("O gerador só utiliza conteúdo autoral quando o currículo está completo", () => {
  const source = read("professional-formations-lessons.ts");
  assert.match(source, /f\.slug === "planejamento-controle-obras"/);
  assert.match(source, /locale === "pt"/);
  assert.match(source, /validatePlanejamentoControleObrasDraft\(\)\.length === 0/);
  assert.match(source, /getPlanejamentoControleObrasDraft\(locale\)/);
});

test("O adaptador não libera publicação enquanto faltam aulas", () => {
  const source = read("academy-authored/planejamento-controle-obras.adapter.ts");
  assert.match(source, /expectedLessons: 144/);
  assert.match(source, /publicationReady: false/);
  assert.match(source, /draftLessons\.length !== 144/);
  assert.match(source, /if \(locale !== "pt"\) return null/);
});

test("Os quatro conjuntos de aulas autorais estão presentes e têm códigos exclusivos", () => {
  const names = [
    "planejamento-controle-obras.initial.ts",
    "planejamento-controle-obras.quantitativos.ts",
    "planejamento-controle-obras.custos.ts",
    "planejamento-controle-obras.controle.ts",
  ];
  const ids = names.flatMap((name) =>
    [...read("academy-authored/" + name).matchAll(/id: "(pco-m\d{2}-a\d{2})"/g)].map((match) => match[1]),
  );
  assert.equal(ids.length, 14);
  assert.equal(new Set(ids).size, ids.length);
});

test("O gerador legado permanece como fallback", () => {
  const source = read("professional-formations-lessons.ts");
  assert.match(source, /\.modules\.map\(/);
  assert.match(source, /lessonBody\(/);
});

import assert from "node:assert/strict";
import { test } from "node:test";
import { decimalToHundredths } from "../../apps/painel-ldr/src/features/feira360/model.ts";
import { academicReturnPath } from "../../apps/painel-ldr/src/lib/academic-login-return.ts";

test("valores monetários são convertidos sem arredondamento em ponto flutuante", () => {
  for (const [input, expected] of [["19,99", 1999], ["1.1", 110], ["0", 0], ["100.01", 10001], ["1.005", null], ["1e3", null], ["-0.01", null], ["", null]]) {
    assert.equal(decimalToHundredths(input), expected);
  }
});

test("login mantém referências da Feira e aceita somente destinos permitidos", () => {
  assert.equal(academicReturnPath("/feira360/parceiro"), "/feira360/parceiro");
  assert.equal(academicReturnPath("/feira360/p/studio/s/design?ref=campanha"), "/feira360/p/studio/s/design?ref=campanha");
  for (const bad of ["//example.test/feira360/parceiro", "/feira360/admin", "/feira360/p/a/s/%2f", "/feira360/p/a/s/../b"]) {
    assert.equal(academicReturnPath(bad), null);
  }
  assert.equal(academicReturnPath("/cliente/biblioteca"), "/cliente/biblioteca");
});

test("pedido geral conserva origem e âncora no retorno do login", () => {
  const path = "/feira360?ref=ldr-unique#pedido";
  assert.equal(academicReturnPath(path), path);
  assert.equal(academicReturnPath("//outra.example/feira360?ref=ldr-unique#pedido"), null);
});

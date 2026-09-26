import assert from "node:assert/strict";
import test from "node:test";
import { LDR_ONE_READER_APPROVED } from "./ldr-one-reader-catalog.ts";

test("LDR ONE reader catalog includes approved books", () => {
  assert.equal(LDR_ONE_READER_APPROVED.has("ebook_coragem_comecar"), true);
  assert.equal(LDR_ONE_READER_APPROVED.has("ebook_estudos_caso_psicanalise"), true);
});
test("LDR ONE reader catalog excludes editorial and unrelated services", () => {
  for (const key of ["ebook_psicanalise_no_mundo", "revista_psicanalise_no_mundo", "clinica_social_session", "massagem_relaxante"]) {
    assert.equal(LDR_ONE_READER_APPROVED.has(key), false, key);
  }
});

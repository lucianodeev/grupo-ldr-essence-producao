const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

const filename = path.resolve(__dirname, "../src/lib/unified-preview.ts");
const output = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const moduleBox = { exports: {} };
vm.runInNewContext(output, {
  module: moduleBox,
  exports: moduleBox.exports,
  require,
  URL,
  URLSearchParams,
});
const { isUnifiedPreviewHost, unifiedPreviewTarget } = moduleBox.exports;

test("recognizes unified preview hosts without affecting official hosts", () => {
  assert.equal(isUnifiedPreviewHost("ecossistema-ldr-validacao.llucianouam.chatgpt.site"), true);
  assert.equal(isUnifiedPreviewHost("ecossistema-ldr-provisorio.workers.dev"), true);
  assert.equal(isUnifiedPreviewHost("localhost"), true);
  assert.equal(isUnifiedPreviewHost("ldracademy.online"), false);
});

test("keeps Academy routes on the preview host", () => {
  const target = unifiedPreviewTarget(
    "https://ldracademy.online/cliente/biblioteca?tab=ebooks#top",
    "https://ecossistema-ldr-validacao.llucianouam.chatgpt.site",
    "ecossistema-ldr-validacao.llucianouam.chatgpt.site",
  );
  assert.equal(target, "/cliente/biblioteca?tab=ebooks#top");
});

test("maps split official service hosts into their local preview routes", () => {
  const origin = "https://ecossistema-ldr-validacao.llucianouam.chatgpt.site";
  const host = "ecossistema-ldr-validacao.llucianouam.chatgpt.site";
  assert.equal(unifiedPreviewTarget("https://clinicasocial.ldrrhestrategia.com/", origin, host), "/clinica-social");
  assert.equal(unifiedPreviewTarget("https://suporte.ldrrhestrategia.com/", origin, host), "/falar-com-ecossistema");
  assert.equal(unifiedPreviewTarget("https://painel.ldrrhestrategia.com/acesso", origin, host), "/admin");
  assert.equal(unifiedPreviewTarget("https://portal.ldrrhestrategia.com/", origin, host), "/cliente/login?portal=services&v=3");
});

test("never rewrites third-party links", () => {
  const origin = "https://ecossistema-ldr-validacao.llucianouam.chatgpt.site";
  const host = "ecossistema-ldr-validacao.llucianouam.chatgpt.site";
  assert.equal(unifiedPreviewTarget("https://checkout.stripe.com/example", origin, host), null);
  assert.equal(unifiedPreviewTarget("mailto:contato@example.com", origin, host), null);
});

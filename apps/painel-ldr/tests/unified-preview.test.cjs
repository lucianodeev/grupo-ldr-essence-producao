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
const { isUnifiedPreviewHost, isUnifiedEcosystemHost, unifiedPreviewTarget } = moduleBox.exports;

test("recognizes unified preview hosts without affecting official hosts", () => {
  assert.equal(isUnifiedPreviewHost("ecossistema-ldr-validacao.llucianouam.chatgpt.site"), true);
  assert.equal(isUnifiedPreviewHost("ecossistema-ldr-provisorio.workers.dev"), true);
  assert.equal(isUnifiedPreviewHost("ldr-ecossistema-validacao.onrender.com"), true);
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


test("critical ecosystem routes remain generated", () => {
  const routeTree = fs.readFileSync(path.resolve(__dirname, "../src/routeTree.gen.ts"), "utf8");
  const routes = [
    "/ecossistema",
    "/ldr-rh-estrategia",
    "/profissional/cadastro",
    "/cliente/login",
    "/cliente/biblioteca",
    "/cliente/rede-academica",
    "/clinica-social",
    "/clinica-social/solicitar",
    "/clinica-social/profissionais",
    "/profissionais",
    "/profissional/login",
    "/painel-profissional",
    "/empresa/login",
    "/empresa",
    "/carreira",
    "/carreira/vagas",
    "/admin",
    "/falar-com-ecossistema",
  ];
  for (const route of routes) {
    assert.ok(routeTree.includes(`'${route}'`) || routeTree.includes(`"${route}"`), `missing route: ${route}`);
  }
});

test("server and OAuth callback explicitly support unified preview hosts", () => {
  const server = fs.readFileSync(path.resolve(__dirname, "../src/server.ts"), "utf8");
  const callback = fs.readFileSync(path.resolve(__dirname, "../src/routes/api/auth/callback.ts"), "utf8");
  assert.match(server, /isUnifiedPreviewHost\(host\)/);
  assert.match(server, /return null;/);
  assert.match(callback, /isUnifiedPreviewHost\(url\.hostname\)/);
});


test("keeps Academy routes on Render validation host", () => {
  const target = unifiedPreviewTarget(
    "https://ldracademy.online/cliente/biblioteca",
    "https://ldr-ecossistema-validacao.onrender.com",
    "ldr-ecossistema-validacao.onrender.com",
  );
  assert.equal(target, "/cliente/biblioteca");
});


test("maps RH institutional domain into the unified host", () => {
  const origin = "https://ldr-ecossistema-validacao.onrender.com";
  const host = "ldr-ecossistema-validacao.onrender.com";
  assert.equal(
    unifiedPreviewTarget("https://ldrrhestrategia.com/", origin, host),
    "/ldr-rh-estrategia",
  );
});

test("keeps professional registration intent when crossing portal hosts", () => {
  const origin = "https://ldr-ecossistema-validacao.onrender.com";
  const host = "ldr-ecossistema-validacao.onrender.com";
  assert.equal(
    unifiedPreviewTarget("https://portal.ldrrhestrategia.com/profissional/cadastro", origin, host),
    "/profissional/login?mode=cadastro",
  );
});


test("Master OAuth code is exchanged before the admin redirect", () => {
  const server = fs.readFileSync(path.resolve(__dirname, "../src/server.ts"), "utf8");
  assert.match(server, /isLegacyLdrPanelHost\s*&&\s*url\.searchParams\.has\("code"\)/);
  assert.match(server, /callback\.pathname\s*=\s*"\/api\/auth\/callback"/);
  assert.match(server, /callback\.searchParams\.set\("admin",\s*"1"\)/);
});


test("recognizes the Render host as the unified canonical ecosystem host", () => {
  assert.equal(isUnifiedEcosystemHost("ldr-ecossistema-validacao.onrender.com"), true);
  assert.equal(isUnifiedEcosystemHost("ldracademy.online"), false);
  assert.equal(isUnifiedEcosystemHost("www.ldracademy.online"), false);
});

test("keeps legacy LDR links inside the Render ecosystem host", () => {
  const origin = "https://ldr-ecossistema-validacao.onrender.com";
  const host = "ldr-ecossistema-validacao.onrender.com";
  assert.equal(unifiedPreviewTarget("https://clinicasocial.ldrrhestrategia.com/", origin, host), "/clinica-social");
  assert.equal(unifiedPreviewTarget("https://suporte.ldrrhestrategia.com/", origin, host), "/falar-com-ecossistema");
  assert.equal(unifiedPreviewTarget("https://painel.ldrrhestrategia.com/acesso", origin, host), "/admin");
  assert.equal(unifiedPreviewTarget("https://ldrrhestrategia.com/", origin, host), "/ldr-rh-estrategia");
  assert.equal(unifiedPreviewTarget("https://portal.ldrrhestrategia.com/profissional/cadastro", origin, host), "/profissional/login?mode=cadastro");
  assert.equal(unifiedPreviewTarget("https://ldracademy.online/cliente/biblioteca", origin, host), "/cliente/biblioteca");
});

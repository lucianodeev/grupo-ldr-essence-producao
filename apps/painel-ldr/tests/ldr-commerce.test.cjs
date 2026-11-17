const assert = require("node:assert/strict");
const test = require("node:test");
const load = require("./helpers/load-ts.cjs")();

test("store preserves the 91 Academy identities and learner links", () => {
  const { academyUnifiedCatalog } = load("lib/academy-unified-catalog.ts");
  const { STORE_PRODUCTS, findStoreProducts, ebookStorePrice } = load("lib/ldr-store-catalog.ts");
  const academy = STORE_PRODUCTS.filter((product) => product.kind !== "ebook");
  assert.equal(academy.length, 91);
  assert.equal(
    JSON.stringify(academy.map(({ slug, ...product }) => product)),
    JSON.stringify(academyUnifiedCatalog()),
  );
  assert.equal(new Set(STORE_PRODUCTS.map(({ slug }) => slug)).size, STORE_PRODUCTS.length);
  const results = findStoreProducts("PSICANALISE AUTISMO", "ebooks");
  assert.ok(results.some(({ key }) => key === "ebook_psicanalise_autismo"));
  assert.ok(results.every(({ kind }) => kind === "ebook"));
  assert.match(ebookStorePrice(results[0], "BR"), /R\$/);
  assert.match(ebookStorePrice(results[0], "INTL"), /€/);
  assert.equal(findStoreProducts("sem-resultados-98301", "").length, 0);
});

test("checkout requires the opt-in, a Stripe test key and local application and database", () => {
  const { storeSandboxEnabled } = require("../src/lib/ldr-store-sandbox.ts");
  const url = "http://127.0.0.1:3000";
  const env = {
    LDR_STORE_SANDBOX_ENABLED: "true",
    STRIPE_SECRET_KEY: "sk_test_fixture",
    SUPABASE_SERVICE_ROLE_KEY: "local-fixture",
    SUPABASE_URL: "http://127.0.0.1:54321",
    CLIENT_PANEL_URL: url,
  };
  assert.equal(storeSandboxEnabled(env, `${url}/loja`), true);
  for (const change of [
    { LDR_STORE_SANDBOX_ENABLED: undefined },
    { STRIPE_SECRET_KEY: "sk_live_fixture" },
    { SUPABASE_URL: "https://example.invalid" },
    { SUPABASE_URL: "http://127.0.0.1@example.invalid" },
    { VITE_SUPABASE_URL: "https://example.invalid" },
    { SUPABASE_SERVICE_ROLE_KEY: undefined },
    { CLIENT_PANEL_URL: "http://localhost:3001" },
  ])
    assert.equal(storeSandboxEnabled({ ...env, ...change }, url), false);
  assert.equal(storeSandboxEnabled(env, "https://ldrecossistema.online"), false);
});

test("all service briefings use the existing Master intake contract", () => {
  const { PROFESSIONAL_OFFERS, MENTORSHIP_CATALOG_KEYS } = load("lib/ldr-professional-offers.ts");
  const { commercialSupportPayload } = load("lib/commercial-request.ts");
  const { contractOption } = load("lib/contract-catalog.ts");
  for (const { solution } of PROFESSIONAL_OFFERS) {
    const input = {
      source: "servicos-profissionais",
      organization: "Empresa de teste",
      name: "Contacto fictício",
      email: "TESTE@example.invalid",
      interest: "Contratação de serviços",
      solution,
      message: "Exemplo de pedido comercial",
      consent: true,
      website: "",
    };
    const payload = commercialSupportPayload(input);
    assert.equal(payload.p_subject, "Serviços para empresas");
    assert.equal(payload.p_email, "teste@example.invalid");
    assert.ok(payload.p_message.includes(solution));
    assert.equal(payload.p_source_url, "https://ldrecossistema.online/servicos-profissionais");
    assert.throws(() => commercialSupportPayload({ ...input, website: "automático" }));
    assert.throws(() => commercialSupportPayload({ ...input, consent: false }));
  }
  assert.ok(MENTORSHIP_CATALOG_KEYS.every((key) => contractOption(key)?.group === "mentoria"));
});

test("only a complete stored eBook edition can open the store checkout", async () => {
  const key = "ebook_estudos_caso_psicanalise";
  let content = {
    data: { chapters: [["Capítulo sintético", "", ["Texto para verificar a entrega."]]] },
  };
  const filters = new Map();
  const db = {
    from(table) {
      assert.equal(table, "digital_product_content");
      return {
        select(columns) {
          assert.equal(columns, "content");
          return this;
        },
        eq(field, value) {
          filters.set(field, value);
          return this;
        },
        maybeSingle() {
          return Promise.resolve({ data: { content }, error: null });
        },
      };
    },
  };
  const { hasCompleteStoreEbook } = require("./helpers/load-ts.cjs")({
    "@/integrations/supabase/client.server": { supabaseAdmin: db },
  })("lib/digital-content.server.ts");
  assert.equal(await hasCompleteStoreEbook(key, 1), true);
  assert.deepEqual(
    [...filters],
    [
      ["product_key", key],
      ["locale", "pt"],
      ["active", true],
    ],
  );
  assert.equal(await hasCompleteStoreEbook(key, 2), false);
  content.data.chapters[0][2] = [""];
  assert.equal(await hasCompleteStoreEbook(key, 1), false);
});

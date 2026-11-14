const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");

function render(catalog) {
  const file = path.resolve(__dirname, "../src/routes/_clientarea.cliente.contratar.tsx");
  const module = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(file, "utf8"), { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX,
  } }).outputText;
  const imports = {
    react: React, "react/jsx-runtime": require("react/jsx-runtime"),
    "@tanstack/react-router": { createFileRoute: () => config => config },
    "@tanstack/react-start": { useServerFn: () => () => { throw Error("Unexpected checkout"); } },
    "@tanstack/react-query": { useMutation: () => ({ isPending: false }) },
    sonner: { toast: {} },
    "@/lib/client-portal.functions": { clientServiceCheckout() {} },
    "@/lib/client-portal-data": { useClientContractCatalog: () => ({ data: catalog }) },
    "@/lib/i18n": { useI18n: () => ({ locale: "pt", t: key => key }) },
    "@/lib/central": { formatMoney: n => String(n), safeUrl: () => null },
    "@/lib/contract-catalog": { isIndividualSession: i => ["single_paid_session", "package_sessions"].includes(i.billingModel) },
    "@/components/central/ui": { Field: ({ children }) => React.createElement("div", null, children), PageHeader: () => null },
    "@/components/central/agenda-query-feedback": { AgendaQueryFeedback: () => null },
    "@/components/cliente/service-purchase-journey": {
      IndividualServiceSummary: () => null, ServicePurchaseJourney: () => null,
      useServicePurchaseCopy: () => ({}),
      ServiceCheckoutAction: ({ name, enabled }) => React.createElement("button", { "data-service": name, disabled: !enabled }, name),
    },
  };
  vm.runInNewContext(code, { module, exports: module.exports, require(name) {
    if (name in imports) return imports[name];
    throw Error("Unexpected import: " + name);
  } }, { filename: file });
  return renderToStaticMarkup(React.createElement(module.exports.Route.component));
}
const items = [
  { catalogKey: "mentoria_sessao", name: "Single mentorship", group: "mentoria", currency: "EUR", amountCents: 7500, sessions: 1, billingModel: "single_paid_session" },
  { catalogKey: "mentoria_4", name: "Mentorship package", group: "mentoria", currency: "EUR", amountCents: 24300, sessions: 4, billingModel: "package_sessions" },
  { catalogKey: "psicanalise_clinica_eu", name: "Other service", group: "psicanalise", region: "eu", currency: "EUR", amountCents: 5000, sessions: 1, billingModel: "single_paid_session" },
];
test("purchase page enables only the released mentorship and keeps other service actions disabled", () => {
  const html = render({ items, checkoutEnabled: true, checkoutCatalogKeys: ["mentoria_sessao"] });
  assert.match(html, /<button data-service="Single mentorship">/);
  assert.match(html, /<button data-service="Mentorship package" disabled="">/);
  assert.match(html, /<button data-service="Other service" disabled="">/);
});
test("disabled or older catalogue responses cannot expose a live checkout button", () => {
  for (const config of [{ checkoutEnabled: false, checkoutCatalogKeys: ["mentoria_sessao"] }, { checkoutEnabled: true }]) {
    const html = render({ items, ...config });
    assert.match(html, /<button data-service="Single mentorship" disabled="">/);
  }
});

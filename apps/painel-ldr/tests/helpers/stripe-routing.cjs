// Executes the actual webhook routing statements with synthetic handler spies.
// Does not import the route, its dependencies, credentials, network or database.
const fs = require("node:fs"),
  path = require("node:path"),
  vm = require("node:vm"),
  ts = require("typescript");
const file = path.resolve(__dirname, "../../src/routes/api/stripe/webhook.ts");
const text = fs.readFileSync(file, "utf8"),
  source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
function find(predicate) {
  let result;
  function walk(node) {
    if (result) return;
    if (predicate(node)) {
      result = node;
      return;
    }
    ts.forEachChild(node, walk);
  }
  walk(source);
  if (!result) throw new Error("Webhook routing statement not found");
  return result;
}
const routing = find(
  (n) =>
    ts.isIfStatement(n) &&
    n.expression.getText(source).includes('checkoutKind === "ldr_pass_subscription"'),
);
const fallback = find(
  (n) =>
    ts.isIfStatement(n) &&
    n.expression.getText(source).includes("!checkoutKind") &&
    n.getText(source).includes("resolveRecurringCheckoutKind"),
);
const names = ["recurringSubscriptionEvent", "subscriptionCheckoutEvent"];
const declarations = names.map((name) =>
  find((n) => ts.isVariableDeclaration(n) && n.name.getText(source) === name),
);
const js = ts.transpileModule(
  `async function route(eventType,kind,resolvedKind){const calls=[];const event={type:eventType},object={},metadata={};let checkoutKind=kind;
const resolveRecurringCheckoutKind=async()=>{calls.push('resolve');return resolvedKind;};
${["LdrPass", "Company", "Editorial", "Library", "Professional"].map((name) => `const set${name}Subscription=async()=>calls.push('${name}');`).join("\n")}
${fallback.getText(source)}
${declarations.map((n) => "const " + n.getText(source) + ";").join("\n")}
${routing.getText(source)}
return {checkoutKind,calls};}
module.exports=route;`,
  { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } },
).outputText;
const moduleFixture = { exports: {} };
vm.runInNewContext(js, { module: moduleFixture, exports: moduleFixture.exports });
module.exports = moduleFixture.exports;

const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");

test("LDR ONE Business requires five seats in authenticated server handler and checkout", () => {
  const handler = read("src/lib/ldr-pass.functions.ts");
  const checkout = read("src/lib/ldr-pass.server.ts");
  assert.match(handler, /data\.plan==="business"&&\(seats<5\|\|seats>10000\)/);
  assert.match(checkout, /plan==="business"&&\(quantity<5\|\|quantity>10000\)/);
  assert.doesNotMatch(handler, /seats<2\|\|seats>10000/);
  assert.doesNotMatch(checkout, /quantity<2\|\|quantity>10000/);
});

test("LDR ONE page clamps seats to five on URL, input and decrement", () => {
  const page = read("src/routes/ldr-pass.tsx");
  assert.match(page, /Math\.max\(5,Math\.min\(10000,Number\(search\["seats"\]\)\|\|5\)\)/);
  assert.match(page, /Math\.max\(5,Math\.min\(10000,Number\.parseInt\(seatsInput,10\)\|\|5\)\)/);
  assert.match(page, /Math\.max\(5,seats-1\)/);
  assert.match(page, /min=\{5\} max=\{10000\}/);
  assert.match(page, /Quantidade de colaboradores \(mínimo 5\)/);
});

test("LDR ONE sales text states five-seat minimum in all supported languages", () => {
  const page = read("src/routes/__root.tsx");
  for (const label of ["Mínimo de 5 colaboradores.", "Minimum 5 employees.", "Minimum 5 collaborateurs.", "Mínimo 5 empleados."]) {
    assert.ok(page.includes(label), "Missing copy: " + label);
  }
  assert.doesNotMatch(page, /mínimo 2|minimum 2/i);
});


test("LDR ONE handles invoice.paid as a confirmed renewal without changing other products", () => {
  const webhook = read("src/routes/api/stripe/webhook.ts");
  const handler = webhook.slice(webhook.indexOf("async function setLdrPassSubscription("), webhook.indexOf("async function balanceCredit("));
  assert.match(handler, /eventType==="invoice\\.payment_succeeded"\\|\\|eventType==="invoice\\.paid"/);
  assert.match(webhook, /!checkoutKind && \\(event\\.type === "invoice\\.payment_succeeded" \\|\\| event\\.type === "invoice\\.paid" \\|\\| event\\.type === "invoice\\.payment_failed"\\)/);
  assert.match(webhook, /checkoutKind === "ldr_pass_subscription" && \\(subscriptionCheckoutEvent \\|\\| recurringSubscriptionEvent \\|\\| event\\.type === "invoice\\.paid"\\)/);
  const otherHandlers = webhook.slice(webhook.indexOf('} else if (checkoutKind === "company_subscription"'), webhook.indexOf('} else if (checkoutKind === "professional_subscription"'));
  assert.doesNotMatch(otherHandlers, /invoice\\.paid/);
});

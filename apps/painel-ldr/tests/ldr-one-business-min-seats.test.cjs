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


test("LDR ONE routes invoice.paid only to its own subscription handler", async () => {
  const route = require("./helpers/stripe-routing.cjs");
  const result = await route("invoice.paid", "ldr_pass_subscription", null);
  assert.equal(result.checkoutKind, "ldr_pass_subscription");
  assert.deepEqual(Array.from(result.calls), ["LdrPass"]);
  const renewal = await route("invoice.payment_succeeded", "ldr_pass_subscription", null);
  assert.deepEqual(Array.from(renewal.calls), ["LdrPass"]);
});

test("invoice.paid resolves missing checkout metadata before choosing a handler", async () => {
  const route = require("./helpers/stripe-routing.cjs");
  const result = await route("invoice.paid", undefined, "ldr_pass_subscription");
  assert.deepEqual(Array.from(result.calls), ["resolve", "LdrPass"]);
  const unknown = await route("invoice.paid", undefined, null);
  assert.deepEqual(Array.from(unknown.calls), ["resolve"]);
});

test("company invoice.paid support remains isolated and other products keep their existing event contracts", async () => {
  const route = require("./helpers/stripe-routing.cjs");
  assert.deepEqual(Array.from((await route("invoice.paid", "company_subscription", null)).calls), ["Company"]);
  for (const kind of ["library_subscription", "editorial_subscription", "professional_subscription", "unknown"])
    assert.deepEqual(Array.from((await route("invoice.paid", kind, null)).calls), []);
  assert.deepEqual(Array.from((await route("invoice.payment_failed", "library_subscription", null)).calls), ["Library"]);
  assert.deepEqual(Array.from((await route("customer.subscription.updated", "professional_subscription", null)).calls), ["Professional"]);
});

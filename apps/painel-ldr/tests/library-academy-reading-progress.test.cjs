const test = require("node:test");
const assert = require("node:assert/strict");
const loader = require("./helpers/load-ts.cjs");

const edition = { editionId: "edition-a", modules: [{ id: "one" }, { id: "two" }] };

function setup() {
  const rows = [
    { customer_id: "a", product_key: "historical", progress_percent: 60 },
  ];
  const db = {
    from(table) {
      assert.equal(table, "library_progress");
      return {
        async upsert(row, options) {
          assert.deepEqual({ ...options }, {
            onConflict: "customer_id,product_key",
            ignoreDuplicates: true,
          });
          if (!rows.some((saved) =>
            saved.customer_id === row.customer_id && saved.product_key === row.product_key
          )) rows.push(row);
          return { error: null };
        },
        select(column) {
          assert.equal(column, "product_key");
          const criteria = {};
          const query = {
            eq(name, value) {
              criteria[name] = value;
              return query;
            },
            async in(name, values) {
              assert.equal(name, "product_key");
              return {
                data: rows.filter((row) =>
                  Object.entries(criteria).every(([key, value]) => row[key] === value) &&
                  values.includes(row.product_key)
                ),
              };
            },
          };
          return query;
        },
      };
    },
  };
  const load = loader({
    "@/integrations/supabase/client.server": { supabaseAdmin: db },
    "@/lib/client-portal.server": {
      resolveClient: async (id) => id === "denied"
        ? { status: "denied" }
        : { status: "ok", customer: { id } },
    },
  });
  const progress = load("lib/academy-reading-progress.server.ts").loadAcademyReadingProgress;
  return { rows, progress, saveLegacy: load("lib/learning.server.ts").saveClientProgress };
}

test("multiple devices and retries retain every distinct completion for the account and edition", async () => {
  const { progress, rows } = setup();
  assert.deepEqual(Array.from(await progress("a", null, edition)), []);
  await Promise.all([
    progress("a", null, edition, "two"),
    progress("a", null, edition, "one"),
    progress("a", null, edition, "one"),
  ]);
  assert.deepEqual(Array.from(await progress("a", null, edition)), ["one", "two"]);
  assert.deepEqual(Array.from(await progress("b", null, edition)), []);
  assert.deepEqual(Array.from(await progress("a", null, { ...edition, editionId: "edition-b" })), []);
  assert.deepEqual(rows[0], { customer_id: "a", product_key: "historical", progress_percent: 60 });
  assert.equal(rows.length, 3);
});

test("unknown units, denied accounts and writes through the generic progress endpoint are rejected", async () => {
  const { progress, rows, saveLegacy } = setup();
  await assert.rejects(progress("a", null, edition, "missing"), /Unidade inválida/);
  await assert.rejects(progress("denied", null, edition, "one"), /Acesso negado/);
  await assert.rejects(saveLegacy("a", null, {
    productKey: "academy-reading:edition-a:one",
    progressPercent: 100,
  }), /Progresso inválido/);
  assert.equal(rows.length, 1);
});

const test = require("node:test"),
  assert = require("node:assert/strict"),
  loader = require("./helpers/load-ts.cjs");
function setup(initial = [], { failUpdate = false, failInsert = false, client = true } = {}) {
  const rows = new Map(initial.map((r) => [r.customer_id + ":" + r.product_key, { ...r }]));
  const calls = [];
  const db = {
    from(table) {
      assert.equal(table, "library_progress");
      return {
        update(patch) {
          const filters = {};
          let limit;
          const q = {
            eq(k, v) {
              filters[k] = v;
              return q;
            },
            lte(k, v) {
              assert.equal(k, "progress_percent");
              limit = v;
              return q;
            },
            async select() {
              calls.push("update");
              if (failUpdate) return { data: null, error: { code: "XX000" } };
              const row = rows.get(filters.customer_id + ":" + filters.product_key);
              if (row && row.progress_percent <= limit) {
                Object.assign(row, patch);
                return { data: [{ id: row.id }], error: null };
              }
              return { data: [], error: null };
            },
          };
          return q;
        },
        async insert(row) {
          calls.push("insert");
          if (failInsert) return { error: { code: "XX000" } };
          const key = row.customer_id + ":" + row.product_key;
          if (rows.has(key)) return { error: { code: "23505" } };
          rows.set(key, { id: "new", ...row });
          return { error: null };
        },
      };
    },
  };
  const load = loader({
    "@/integrations/supabase/client.server": { supabaseAdmin: db },
    "@/lib/client-portal.server": {
      resolveClient: async () =>
        client ? { status: "ok", customer: { id: "customer-a" } } : { status: "denied" },
    },
    "@/lib/owner-digital-access.server": { hasOwnerDigitalAccess: () => false },
  });
  return { save: load("lib/learning.server.ts").saveClientProgress, rows, calls };
}
const input = (progressPercent, currentLocation = "new") => ({
  productKey: "course_a",
  progressPercent,
  currentLocation,
});
test("a stale device cannot reduce existing progress or replace its location", async () => {
  const x = setup([
    {
      id: "a",
      customer_id: "customer-a",
      product_key: "course_a",
      progress_percent: 85,
      current_location: "saved-high",
    },
  ]);
  await x.save("user-a", null, input(15));
  const row = x.rows.get("customer-a:course_a");
  assert.equal(row.progress_percent, 85);
  assert.equal(row.current_location, "saved-high");
});
test("a newer percentage advances only the authenticated customer product", async () => {
  const x = setup([
    { id: "a", customer_id: "customer-a", product_key: "course_a", progress_percent: 15 },
    { id: "b", customer_id: "customer-b", product_key: "course_a", progress_percent: 20 },
  ]);
  await x.save("user-a", null, input(75));
  assert.equal(x.rows.get("customer-a:course_a").progress_percent, 75);
  assert.equal(x.rows.get("customer-b:course_a").progress_percent, 20);
});
test("concurrent first writes converge to the highest value through the unique-key retry", async () => {
  for (const values of [
    [25, 90],
    [90, 25],
  ]) {
    const x = setup();
    await Promise.all(values.map((p) => x.save("user-a", null, input(p))));
    assert.equal(x.rows.size, 1);
    assert.equal(x.rows.get("customer-a:course_a").progress_percent, 90);
  }
});
test("simultaneous updates on an existing row never decrease the stored maximum", async () => {
  const x = setup([
    { id: "a", customer_id: "customer-a", product_key: "course_a", progress_percent: 40 },
  ]);
  await Promise.all([80, 55, 99, 10].map((p) => x.save("user-a", null, input(p))));
  assert.equal(x.rows.get("customer-a:course_a").progress_percent, 99);
});
test("non-finite values are rejected before any progress mutation", async () => {
  for (const pct of [NaN, Infinity, -Infinity]) {
    const x = setup();
    await assert.rejects(x.save("user-a", null, input(pct)), /inválido/);
    assert.equal(x.calls.length, 0);
  }
});
test("database failures are surfaced rather than acknowledged as successful", async () => {
  for (const flags of [{ failUpdate: true }, { failInsert: true }]) {
    const x = setup([], flags);
    await assert.rejects(x.save("user-a", null, input(20)), /Não foi possível/);
    assert.equal(x.rows.size, 0);
  }
});
test("authentication denial cannot insert a progress row", async () => {
  const x = setup([], { client: false });
  await assert.rejects(x.save("user-a", null, input(20)), /negado/);
  assert.equal(x.calls.length, 0);
});
test("percentages remain bounded and repeated identical writes stay idempotent", async () => {
  const x = setup();
  await x.save("user-a", null, input(-10));
  assert.equal(x.rows.get("customer-a:course_a").progress_percent, 0);
  await x.save("user-a", null, input(999));
  await x.save("user-a", null, input(999));
  assert.equal(x.rows.size, 1);
  assert.equal(x.rows.get("customer-a:course_a").progress_percent, 100);
});

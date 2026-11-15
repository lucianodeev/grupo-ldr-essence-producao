const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const root = path.resolve(__dirname, "../src/lib");
function load(file, imports = {}) {
  const source = fs.readFileSync(path.join(root, file), "utf8");
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(code, { module, exports: module.exports, require(name) {
    if (name === "node:crypto") return require(name);
    if (name in imports) return imports[name];
    throw Error("Unexpected import: " + name);
  }, process: { env: {} }, URL, URLSearchParams, AbortSignal, Date, Number, String, Set, Map, Promise,
  fetch() { throw Error("Unexpected real network request"); } }, { filename: file });
  return module.exports;
}
const catalog = load("contract-catalog.ts");
const checkout = load("individual-service-checkout.server.ts", { "@/lib/contract-catalog": catalog });
const now = 1800000000000;
const input = { catalogKey: "mentoria_4", requestId: "aabbccdd-1111-4111-a111-123456789abc" };
const customer = { id: "customer-A", email: "owner@example.invalid", phone: null };
const env = { INDIVIDUAL_SERVICE_CHECKOUT_ENABLED: "true", INDIVIDUAL_SERVICE_CHECKOUT_CATALOG_KEYS: "mentoria_4", AGENDA_INTEGRATION_ENABLED: "true", STRIPE_SECRET_KEY: "sk_test_fixtureOnly", STRIPE_WEBHOOK_SECRET: "whsec_fixtureOnly" };

function fixture() {
  const state = { reads: 0, writes: 0, requests: [], failSave: false, rows: {
    service_catalog: [{ catalog_key: "mentoria_4", name: "Mentoria — 4 sessões", category: "mentoria", billing_model: "package_sessions", billing_cadence: "one_time", package_sessions: 4, amount_cents: 24300, currency: "EUR", active: true }], orders: [],
  } };
  const db = { from(table) {
    assert.ok(table in state.rows, "checkout must not access credits or appointments");
    const filters = []; let op = "read", row;
    const q = { select() { return q; }, eq(k,v) { filters.push(r => r[k] === v); return q; },
      contains(k,v) { filters.push(r => Object.entries(v).every(([key,value]) => r[k]?.[key] === value)); return q; },
      gte(k,v) { filters.push(r => r[k] >= v); return q; }, limit() { return q; },
      insert(value) { op="insert"; row=value; return q; }, update(value) { op="update"; row=value; return q; },
      async execute(single) {
        state.reads++;
        if (op === "insert") {
          if (state.rows[table].some(r => r.id === row.id)) return { data: null, error: { code: "23505" } };
          const created = { ...row, created_at: new Date(now).toISOString() }; state.rows[table].push(created); state.writes++;
          return { data: created, error: null };
        }
        const found = state.rows[table].filter(r => filters.every(f => f(r)));
        if (op === "update") {
          if (state.failSave) return { data: null, error: { code: "synthetic_save_failure" } };
          found.forEach(r => Object.assign(r, row)); state.writes += found.length;
        }
        return { data: single ? found[0] ?? null : found, error: null };
      }, single() { return q.execute(true); }, maybeSingle() { return q.execute(true); },
      then(resolve,reject) { return q.execute(false).then(resolve,reject); },
    }; return q;
  } };
  const request = async (url, options) => {
    state.requests.push({ url, options, body: options.body.toString() });
    return new Response(JSON.stringify({ id: "cs_test_fixture", url: "https://checkout.stripe.com/c/pay/cs_test_fixture", livemode: false }), { status: 200 });
  };
  const run = (value=input, user="user-A", owner=customer, overrides={}) => checkout.createIndividualServiceCheckout(db, user, owner, value, { env, now: () => now, request, ...overrides });
  return { state, run };
}

test("release defaults to the single mentorship and never opens packages or other services implicitly", async () => {
  const firstRelease = { ...env }; delete firstRelease.INDIVIDUAL_SERVICE_CHECKOUT_CATALOG_KEYS;
  assert.deepEqual([...checkout.individualServiceCheckoutKeys(firstRelease)], ["mentoria_sessao"]);
  assert.deepEqual([...checkout.individualServiceCheckoutKeys({ ...env, INDIVIDUAL_SERVICE_CHECKOUT_ENABLED: "false" })], []);
  assert.deepEqual([...checkout.individualServiceCheckoutKeys({ ...env, INDIVIDUAL_SERVICE_CHECKOUT_CATALOG_KEYS: "" })], []);
  assert.deepEqual([...checkout.individualServiceCheckoutKeys({ ...env, INDIVIDUAL_SERVICE_CHECKOUT_CATALOG_KEYS: "unknown, mentoria_sessao,mentoria_sessao" })], ["mentoria_sessao"]);
  const f = fixture();
  await assert.rejects(f.run(input, "user-A", customer, { env: firstRelease }));
  assert.equal(f.state.reads, 0); assert.equal(f.state.requests.length, 0);
});

test("single mentorship checkout uses the catalogue's 75 EUR and never issues credit before payment", async () => {
  const f = fixture();
  Object.assign(f.state.rows.service_catalog[0], { catalog_key: "mentoria_sessao", name: "Sessão Individual de Mentoria", amount_cents: 7500, billing_model: "single_paid_session", package_sessions: 1 });
  const firstRelease = { ...env }; delete firstRelease.INDIVIDUAL_SERVICE_CHECKOUT_CATALOG_KEYS;
  await f.run({ ...input, catalogKey: "mentoria_sessao" }, "user-A", customer, { env: firstRelease });
  const order = f.state.rows.orders[0];
  const params = new URLSearchParams(f.state.requests[0].body);
  assert.equal(order.amount_cents, 7500); assert.equal(order.metadata.sessions, 1);
  assert.equal(params.get("line_items[0][price_data][unit_amount]"), "7500");
  assert.equal(params.get("line_items[0][price_data][currency]"), "eur");
  assert.equal(order.payment_status, "pendente");
});

test("disabled or incomplete checkout configuration fails before database/network work", async () => {
  for (const name of Object.keys(env)) {
    const f = fixture(); const missing = { ...env }; delete missing[name];
    await assert.rejects(f.run(input,"user-A",customer,{env:missing}));
    assert.equal(f.state.reads,0); assert.equal(f.state.requests.length,0);
  }
});
test("server catalogue controls amount, currency, package size and pending owner-linked order", async () => {
  const f=fixture(); const result=await f.run({...input,amountCents:1,customerId:"attacker"});
  const order=f.state.rows.orders[0], call=f.state.requests[0], params=new URLSearchParams(call.body);
  assert.equal(result.orderId,order.id); assert.equal(order.customer_id,customer.id);
  assert.equal(order.amount_cents,24300); assert.equal(order.metadata.sessions,4);
  assert.equal(order.payment_status,"pendente"); assert.equal(order.status,"novo");
  assert.equal(params.get("line_items[0][price_data][unit_amount]"),"24300");
  assert.equal(params.get("line_items[0][price_data][currency]"),"eur");
  for (const prefix of ["metadata", "payment_intent_data[metadata]"]) {
    assert.equal(params.get(`${prefix}[order_id]`),order.id);
    assert.equal(params.get(`${prefix}[customer_id]`),customer.id);
    assert.equal(params.get(`${prefix}[checkout_kind]`),"individual_service");
  }
  assert.ok(params.get("success_url").startsWith("https://ldrecossistema.online/cliente/pedido/"));
  assert.equal(call.options.redirect,"error"); assert.ok(call.options.signal);
  assert.equal(params.get("metadata[email]"),null);
});
test("same request reuses one order/session; concurrent clicks use the same provider idempotency key", async () => {
  const f=fixture(); await Promise.all([f.run(),f.run()]); await f.run();
  assert.equal(f.state.rows.orders.length,1);
  assert.equal(new Set(f.state.requests.map(r=>r.options.headers["Idempotency-Key"])).size,1);
  assert.equal(new Set(f.state.requests.map(r=>r.body)).size,1);
});
test("ambiguous provider failure keeps the order and retries identical parameters without deleting data", async () => {
  const f=fixture(); let firstBody;
  await assert.rejects(f.run(input,"user-A",customer,{request:async(_u,o)=>{ firstBody=o.body.toString(); throw Error("synthetic connection lost"); }}));
  assert.equal(f.state.rows.orders.length,1);
  await f.run(input,"user-A",customer,{now:()=>now+1000});
  assert.equal(f.state.requests[0].body,firstBody);
});
test("failed session persistence can be retried without creating another order", async () => {
  const f=fixture(); f.state.failSave=true; await assert.rejects(f.run());
  f.state.failSave=false; await f.run();
  assert.equal(f.state.rows.orders.length,1); assert.equal(f.state.requests[0].body,f.state.requests[1].body);
});
test("invalid, inactive, unsupported and non-session catalogue entries cannot start payments", async () => {
  for (const patch of [{active:false},{amount_cents:0},{amount_cents:-10},{amount_cents:1.5},{currency:"XYZ"},{billing_model:"project"},{billing_cadence:"monthly"},{package_sessions:0}]) {
    const f=fixture(); Object.assign(f.state.rows.service_catalog[0],patch);
    await assert.rejects(f.run()); assert.equal(f.state.rows.orders.length,0); assert.equal(f.state.requests.length,0);
  }
  const f=fixture(); await assert.rejects(f.run({...input,catalogKey:"not_whitelisted"}));
  await assert.rejects(f.run({...input,requestId:"not-a-uuid"}));
  assert.equal(f.state.reads,0);
});
test("ownership is part of idempotency; paid, refunded, cancelled or repriced orders are not resumed", async () => {
  assert.notEqual(checkout.individualCheckoutOrderId("user-A",input.requestId),checkout.individualCheckoutOrderId("user-B",input.requestId));
  for (const patch of [{payment_status:"pago"},{payment_status:"reembolsado"},{status:"cancelado"},{customer_id:"customer-B"},{amount_cents:1}]) {
    const f=fixture(); await f.run(); Object.assign(f.state.rows.orders[0],patch);
    await assert.rejects(f.run()); assert.equal(f.state.requests.length,1);
  }
});
test("provider errors/unsafe redirects/mode mismatch never expose secrets or return a payment URL", async () => {
  for (const body of [{id:"cs_test_fixture",url:"https://attacker.invalid/pay",livemode:false},{id:"cs_live_fixture",url:"https://checkout.stripe.com/pay",livemode:true},{error:{message:env.STRIPE_SECRET_KEY}}]) {
    const f=fixture(); await assert.rejects(f.run(input,"user-A",customer,{request:async()=>new Response(JSON.stringify(body))}), e => !e.message.includes(env.STRIPE_SECRET_KEY));
    assert.equal(f.state.rows.orders[0].payment_status,"pendente");
  }
});
test("pending attempts are bounded without removing historical orders", async () => {
  const f=fixture(); f.state.rows.orders=Array.from({length:5},(_,i)=>({id:`old-${i}`,customer_id:customer.id,payment_status:"pendente",created_at:new Date(now).toISOString(),metadata:{checkout_kind:"individual_service"}}));
  await assert.rejects(f.run()); assert.equal(f.state.rows.orders.length,5); assert.equal(f.state.requests.length,0);
});
test("server function requires authentication and rejects client-supplied price or customer fields", () => {
  const auth = {};
  const createServerFn = () => {
    const result = { middleware(value) { result.guards=value; return result; },
      inputValidator(value) { result.parse=value; return result; }, handler(value) { result.handle=value; return result; } };
    return result;
  };
  const api=load("client-portal.functions.ts", {
    "@tanstack/react-start":{createServerFn}, "@tanstack/react-start/server":{getRequest(){}},
    "@/integrations/supabase/auth-middleware":{requireSupabaseAuth:auth},
    "@/lib/client-response.schemas":{}, "@/lib/client-agenda.schemas":{}, zod:require("zod"),
  });
  assert.equal(api.clientServiceCheckout.guards[0],auth);
  assert.equal(api.clientServiceCheckout.parse(input).catalogKey,"mentoria_4");
  for(const extra of [{amountCents:1},{customerId:"someone-else"},{email:"other@example.invalid"},{currency:"BRL"}])assert.throws(()=>api.clientServiceCheckout.parse({...input,...extra}));
});

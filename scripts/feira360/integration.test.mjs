import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { PGlite } from "@electric-sql/pglite";

const migration = new URL("../../apps/painel-ldr/supabase/migrations/20261119095000_feira360.sql", import.meta.url);
const existingRoles = new URL("../../apps/painel-ldr/supabase/migrations/20260820164018_eff62b65-ffac-4508-9f87-27c58f019b8a.sql", import.meta.url);
const actor = (id) => `00000000-0000-4000-8000-${String(id).padStart(12, "0")}`;

async function database({ existingPrivateHelper = true, journeys = false } = {}) {
  const db = new PGlite();
  await db.exec(`
    create role anon; create role authenticated; create role service_role;
    create schema auth;
    create table auth.users (id uuid primary key, email text, email_confirmed_at timestamptz);
    create function auth.uid() returns uuid language sql stable as
      'select nullif(current_setting(''request.jwt.claim.sub'', true), '''')::uuid';
    create type public.app_role as enum ('superadmin', 'client');
    create table public.profiles(id uuid primary key, is_active boolean);
    create table public.user_roles(user_id uuid, role public.app_role);
    insert into public.profiles values ('${actor(4)}', true), ('${actor(5)}', false);
    insert into public.user_roles values ('${actor(4)}', 'superadmin'), ('${actor(5)}', 'superadmin');
    insert into auth.users
      select ('00000000-0000-4000-8000-' || lpad(n::text, 12, '0'))::uuid,
        'fixture-' || n || '@example.test', case when n <> 6 then now() end
      from generate_series(1,6) n;
  `);
  const roleMigration = await readFile(existingRoles, "utf8");
  if (existingPrivateHelper) await db.exec(roleMigration.split("-- Repoint policies")[0]);
  await db.exec(await readFile(migration, "utf8"));

  if (journeys) {
    await db.exec(`
      create table public.ecosystem_contacts (
        id uuid primary key default gen_random_uuid(), name text, email text, subject text,
        message text, source_project text, source_url text, language text, wants_luciano boolean, consent_contact boolean
      );
      create table public.orders (
        id uuid primary key default gen_random_uuid(), order_number text, title text, contact_email text,
        amount_cents integer, currency text, payment_status text, status text, customer_id uuid,
        stripe_checkout_session_id text, metadata jsonb not null
      );
    `);
    await db.exec(await readFile(new URL(
      "../../apps/painel-ldr/supabase/migrations/20261119160000_feira360_journeys.sql", import.meta.url,
    ), "utf8"));
  }

  async function as(id, run) {
    try {
      await db.exec(`set role ${id ? "authenticated" : "anon"}; set request.jwt.claim.sub = '${id ? actor(id) : ""}';`);
      return await run();
    } finally {
      await db.exec("reset role; reset request.jwt.claim.sub;");
    }
  }

  return {
    db,
    as,
    rpc: (id, action, payload = {}) => as(id, async () =>
      (await db.query("select public.feira360_account($1, $2) as result", [action, payload])).rows[0].result),
    journey: (id, action, payload = {}) => as(id, async () =>
      (await db.query("select public.feira360_journeys($1, $2) as result", [action, payload])).rows[0].result),
    catalog: (...filters) => as(0, async () =>
      (await db.query(`select public.feira360_catalog(${filters.map((_, i) => `$${i + 1}`).join(",")}) as result`, filters)).rows[0].result),
  };
}
const firstService = {
  serviceSlug: "design", title: "Design de marca", description: "Descrição de serviço para integração.",
  category: "criativos", modality: "online", priceCents: 12000,
};
const candidate = (slug, locality = "Porto") => ({
  ...firstService, slug, name: "Perfil de teste", bio: "Biografia isolada para teste da FEIRA.", locality,
});
const request = (partner, overrides = {}) => ({
  partner, service: "design", brief: "Preciso de um orçamento para o projeto em questão.", consent: true, source: "campanha_teste", ...overrides,
});
const denied = { code: "42501" };
const invalid = { code: "22023" };

test("catálogo anónimo, aprovação, filtros, serviços adicionais e destaque", async (t) => {
  const { db, rpc, catalog, as } = await database();
  t.after(() => db.close());
  assert.deepEqual(await catalog(), []);
  await assert.rejects(rpc(0, "apply", candidate("anonimo")), denied);
  await assert.rejects(rpc(6, "apply", candidate("sem-confirmacao")), denied);
  await assert.rejects(rpc(1, "apply", { ...candidate("studio"), title: "x" }), { code: "23514" });
  assert.equal((await rpc(1, "partner_dashboard")).partner, null, "candidatura e serviço são atómicos");
  const partner = await rpc(1, "apply", candidate("studio"));
  await assert.rejects(rpc(1, "apply", candidate("outro")), { code: "23505" });
  await assert.rejects(rpc(1, "add_service", firstService), denied);
  assert.equal((await rpc(1, "partner_dashboard")).partner.status, "pending");
  assert.deepEqual(await catalog(), []);
  await assert.rejects(rpc(1, "moderate", { id: partner, status: "approved" }), denied);
  await assert.rejects(rpc(5, "master_dashboard"), denied);
  await rpc(4, "moderate", { id: partner, status: "approved" });
  const [listing] = await catalog("DESIGN", "criativos", "Port", "online", "studio", "design");
  assert.equal(listing.price_cents, 12000);
  assert.equal(listing.featured, false);
  assert.equal(listing.owner_id, undefined);
  assert.deepEqual(await catalog("DESIGN", "tecnologia"), []);
  assert.deepEqual(await catalog("", "", "Lisboa"), []);
  await assert.rejects(as(1, () => db.query("select * from public.feira360_partners")), denied);
  await assert.rejects(as(0, () => db.query("select * from public.feira360_services")), denied);
  const service = await rpc(1, "add_service", { ...firstService, serviceSlug: "consultoria", priceCents: null });
  assert.equal((await catalog()).length, 1);
  await assert.rejects(rpc(3, "quote", request("studio", { service: "consultoria" })), invalid);
  await assert.rejects(rpc(1, "moderate_service", { id: service, status: "approved" }), denied);
  await rpc(4, "moderate_service", { id: service, status: "approved" });
  assert.equal((await catalog()).length, 2);
  assert.equal((await catalog("", "", "", "", "studio", "consultoria"))[0].price_cents, null);
  await assert.rejects(rpc(4, "moderate_service", { id: service, status: "approved" }), invalid);
  await rpc(4, "monetization", { id: partner, plan: "premium", featured: true });
  assert.equal((await catalog())[0].featured, true);
  await db.query("update public.feira360_partners set featured_until = now() - interval '1 day'");
  assert.equal((await catalog())[0].featured, false);
  await rpc(4, "moderate", { id: partner, status: "suspended" });
  assert.deepEqual(await catalog(), []);
  assert.ok((await rpc(4, "master_dashboard")).audit.some(({ action }) => action === "moderate_service"));
});

test("orçamento, consentimento, isolamento, encaminhamento, comissão e auditoria", async (t) => {
  const { db, rpc, as } = await database({ existingPrivateHelper: false });
  t.after(() => db.close());
  const a = await rpc(1, "apply", candidate("studio"));
  const b = await rpc(2, "apply", candidate("outro-studio", "Bruxelas"));
  await assert.rejects(rpc(3, "quote", request("studio")), invalid);
  await rpc(4, "moderate", { id: a, status: "approved" });
  await rpc(4, "moderate", { id: b, status: "approved" });
  await assert.rejects(rpc(0, "quote", request("studio")), denied);
  await assert.rejects(rpc(6, "quote", request("studio")), denied);
  await assert.rejects(rpc(3, "quote", request("studio", { consent: "true" })), invalid);
  const id = await rpc(3, "quote", request("studio", { email: "forjado@example.test" }));
  await assert.rejects(rpc(3, "quote", request("studio")), invalid);
  await assert.rejects(rpc(3, "quote_status", { id, status: "forwarded" }), denied);
  await assert.rejects(rpc(4, "quote_status", { id, status: "won", contractCents: 999 }), invalid);
  await assert.rejects(as(1, () => db.query("select * from public.feira360_quotes")), denied);
  await assert.rejects(as(1, () => db.query("update public.feira360_settings set commission_bps = 0")), denied);
  assert.deepEqual((await rpc(1, "partner_dashboard")).quotes, []);
  await rpc(4, "quote_status", { id, status: "forwarded" });
  const [forwarded] = (await rpc(1, "partner_dashboard")).quotes;
  assert.equal(forwarded.customer_email, "fixture-3@example.test");
  assert.deepEqual((await rpc(2, "partner_dashboard")).quotes, []);
  await assert.rejects(rpc(2, "acknowledge", { id }), denied);
  await rpc(1, "acknowledge", { id });
  assert.equal((await rpc(1, "partner_dashboard")).quotes[0].status, "in_progress");
  await rpc(4, "commission_rate", { bps: 2000 });
  await rpc(4, "quote_status", { id, status: "won", contractCents: 10010 });
  await assert.rejects(rpc(4, "quote_status", { id, status: "won", contractCents: 20000 }), invalid);
  const master = await rpc(4, "master_dashboard");
  const won = master.quotes.find((quote) => quote.id === id);
  assert.equal(won.commission_bps, 1500);
  assert.equal(won.commission_cents, 1502);
  assert.equal(won.source, "campanha_teste");
  assert.deepEqual(master.audit.find(({ target_id, details }) => target_id === id && details.status === "won").details,
    { status: "won", contract_cents: 10010 });
  const next = await rpc(3, "quote", request("outro-studio"));
  assert.equal((await rpc(4, "master_dashboard")).quotes.find((quote) => quote.id === next).commission_bps, 2000);
  await rpc(4, "moderate", { id: b, status: "suspended" });
  await assert.rejects(rpc(4, "quote_status", { id: next, status: "forwarded" }), invalid);
  await rpc(4, "quote_status", { id: next, status: "closed" });
  for (let n = 0; n < 3; n++) await rpc(3, "quote", request("studio", { brief: `Pedido de orçamento com descrição distinta número ${n}.` }));
  await assert.rejects(rpc(3, "quote", request("studio", { brief: "Pedido que excede a limitação horária." })), invalid);
  await rpc(4, "moderate", { id: a, status: "suspended" });
  assert.deepEqual((await rpc(1, "partner_dashboard")).quotes, []);
});

test("pedido geral preserva origem, isola clientes e parceiros e só gera comissão após pagamento", async (t) => {
  const { db, rpc, journey, as } = await database({ journeys: true });
  t.after(() => db.close());
  const partnerA = await rpc(1, "apply", candidate("origem"));
  const partnerB = await rpc(2, "apply", candidate("destino"));
  for (const id of [partnerA, partnerB]) await rpc(4, "moderate", { id, status: "approved" });
  const link = (await journey(1, "partner")).ref;
  const data = {
    requestKey: "08f60368-c3dc-4da9-834e-f739bd89e7af", category: "digital",
    brief: "Preciso de um site acessível com agendamento.", deadline: "30 dias",
    budgetCents: 50000, consent: true, source: link,
  };
  await assert.rejects(journey(0, "submit", data), denied);
  await assert.rejects(journey(6, "submit", data), denied);
  await assert.rejects(journey(3, "submit", { ...data, consent: false }), invalid);
  const id = await journey(3, "submit", data);
  assert.equal(await journey(3, "submit", data), id);
  assert.equal(await journey(3, "submit", { ...data, requestKey: crypto.randomUUID() }), id);
  assert.equal((await journey(3, "mine")).briefs[0].status, "received");
  assert.deepEqual((await journey(5, "mine")).briefs, []);
  await assert.rejects(journey(5, "cancel", { id }), invalid);
  await assert.rejects(journey(3, "forward", { id, partnerId: partnerB }), denied);
  await journey(4, "review", { id });
  await rpc(4, "commission_rate", { bps: 2100 });
  await journey(4, "forward", { id, partnerId: partnerB });
  assert.deepEqual((await journey(1, "partner")).briefs, []);
  const [delivered] = (await journey(2, "partner")).briefs;
  assert.equal(delivered.id, id);
  assert.equal(delivered.customer_email, undefined);
  assert.equal((await journey(1, "partner")).attributed, 1);
  const contactId = await journey(4, "prepare_proposal", { id });
  assert.equal(await journey(4, "prepare_proposal", { id }), contactId);
  await assert.rejects(journey(3, "cancel", { id }), invalid);
  assert.equal((await journey(4, "master"))[0].referral_name, "Perfil de teste");
  const order = (await db.query(`insert into public.orders
    (order_number, title, contact_email, amount_cents, currency, payment_status, status, metadata)
    values ('TESTE', 'Site', 'fixture-3@example.test', 12000, 'EUR', 'pendente', 'novo', $1)
    returning id`, [{ checkout_kind: "enterprise_quote", quote_state: "approved", contact_id: contactId, source_project: "FEIRA 360" }])).rows[0].id;
  await assert.rejects(db.query(`insert into public.orders (metadata)
    select metadata from public.orders where id=$1`, [order]), { code: "23505" });
  await assert.rejects(journey(5, "link_proposal", { id, orderId: order }), denied);
  await journey(4, "link_proposal", { id, orderId: order });
  await journey(4, "link_proposal", { id, orderId: order });
  assert.equal((await journey(3, "mine")).briefs[0].status, "proposal");
  assert.equal((await journey(4, "master"))[0].commission_cents, null);
  await assert.rejects(as(1, () => db.query("select * from public.feira360_briefs")), denied);
  await db.query("update public.orders set payment_status='pago', customer_id=$2, stripe_checkout_session_id='cs_test_fixture', metadata=metadata || $3 where id=$1",
    [order, actor(3), { quote_state: "accepted", user_id: actor(3) }]);
  assert.equal((await journey(3, "mine")).briefs[0].status, "contracted");
  await db.query("update public.orders set payment_status='pago', status='concluido' where id=$1", [order]);
  assert.equal((await journey(3, "mine")).briefs[0].status, "done");
  const paid = (await journey(4, "master"))[0];
  assert.equal(paid.commission_bps, 1500);
  assert.equal(paid.commission_cents, 1800);
  assert.equal((await db.query("select count(*)::integer as total from public.feira360_brief_commissions")).rows[0].total, 1);
  assert.equal((await journey(1, "partner")).converted, 1);
  const cancelId = await journey(5, "submit", data);
  assert.notEqual(cancelId, id);
  await journey(5, "cancel", { id: cancelId });
  assert.equal((await journey(5, "mine")).briefs[0].status, "canceled");
});

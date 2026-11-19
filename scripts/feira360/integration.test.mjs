import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { PGlite } from "@electric-sql/pglite";

const migration = new URL("../../apps/painel-ldr/supabase/migrations/20261119095000_feira360.sql", import.meta.url);
const existingRoles = new URL("../../apps/painel-ldr/supabase/migrations/20260820164018_eff62b65-ffac-4508-9f87-27c58f019b8a.sql", import.meta.url);
const actor = (id) => `00000000-0000-4000-8000-${String(id).padStart(12, "0")}`;

async function database({ existingPrivateHelper = true } = {}) {
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

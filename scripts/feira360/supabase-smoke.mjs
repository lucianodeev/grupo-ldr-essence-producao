import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const { API_URL, DB_URL, ANON_KEY, SERVICE_ROLE_KEY } = JSON.parse(readFileSync(process.argv[2], "utf8"));
for (const endpoint of [API_URL, DB_URL]) {
  assert.ok(["127.0.0.1", "localhost"].includes(new URL(endpoint).hostname), "Use a disposable local Supabase");
}
assert.ok(ANON_KEY && SERVICE_ROLE_KEY);

async function request(path, body, token, expected = 200, key = ANON_KEY) {
  const response = await fetch(new URL(path, API_URL), {
    method: "POST",
    headers: { apikey: key, Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  assert.equal(response.status, expected, `${path}: ${data.code ?? ""}`);
  return data;
}

const accounts = {};
for (const role of ["customer", "partner", "other", "master"]) {
  const email = `feira-${role}@example.com`;
  const password = crypto.randomUUID();
  const user = await request("/auth/v1/admin/users", { email, password, email_confirm: true },
    SERVICE_ROLE_KEY, 200, SERVICE_ROLE_KEY);
  const session = await request("/auth/v1/token?grant_type=password", { email, password }, ANON_KEY);
  assert.match(user.id, /^[a-f0-9-]{36}$/);
  assert.equal(session.user.id, user.id);
  accounts[role] = { id: user.id, token: session.access_token };
}

const migrations = new URL("../../apps/painel-ldr/supabase/migrations/", import.meta.url);
const helpers = readFileSync(new URL("20260820164018_eff62b65-ffac-4508-9f87-27c58f019b8a.sql", migrations), "utf8")
  .split("-- Repoint policies")[0];
const marketplace = readFileSync(new URL("20261119095000_feira360.sql", migrations), "utf8");
execFileSync("psql", [DB_URL, "-v", "ON_ERROR_STOP=1"], { input: `
  create type public.app_role as enum ('superadmin', 'client');
  create table public.profiles(id uuid primary key, is_active boolean);
  create table public.user_roles(user_id uuid, role public.app_role);
  insert into public.profiles values ('${accounts.master.id}', true);
  insert into public.user_roles values ('${accounts.master.id}', 'superadmin');
  ${helpers}
  ${marketplace}
  notify pgrst, 'reload schema';
` });

const catalog = () => request("/rest/v1/rpc/feira360_catalog", {}, ANON_KEY);
const rpc = (role, action, data = {}, expected = 200) => request("/rest/v1/rpc/feira360_account",
  { p_action: action, p_data: data }, accounts[role].token, expected);

for (let attempt = 0; ; attempt++) {
  try { assert.deepEqual(await catalog(), []); break; }
  catch (error) {
    if (attempt === 14) throw error;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}
const candidate = {
  slug: "studio-teste", name: "Perfil de teste", bio: "Biografia isolada para teste da FEIRA.",
  locality: "Porto", serviceSlug: "design", title: "Design de marca", description: "Descrição de serviço para integração.",
  category: "criativos", modality: "online", priceCents: 12000,
};
const partner = await rpc("partner", "apply", candidate);
const other = await rpc("other", "apply", { ...candidate, slug: "outro-teste" });
assert.deepEqual(await catalog(), []);
await rpc("customer", "moderate", { id: partner, status: "approved" }, 403);
for (const id of [partner, other]) await rpc("master", "moderate", { id, status: "approved" });
assert.equal((await catalog()).length, 2);

const quote = await rpc("customer", "quote", {
  partner: candidate.slug, service: candidate.serviceSlug,
  brief: "Preciso de um orçamento para validação da Feira.", consent: true, source: "homologacao",
});
assert.deepEqual((await rpc("partner", "partner_dashboard")).quotes, []);
await rpc("master", "quote_status", { id: quote, status: "forwarded" });
assert.equal((await rpc("partner", "partner_dashboard")).quotes[0].id, quote);
assert.deepEqual((await rpc("other", "partner_dashboard")).quotes, []);
await rpc("partner", "acknowledge", { id: quote });
await rpc("master", "quote_status", { id: quote, status: "won", contractCents: 12000 });
const result = (await rpc("master", "master_dashboard")).quotes.find(({ id }) => id === quote);
assert.equal(result.commission_cents, 1800);
console.log("Supabase Auth, catálogo, orçamento, isolamento e comissão de 15% aprovados.");

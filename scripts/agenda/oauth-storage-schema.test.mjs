import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const sql = readFileSync(new URL("../../apps/painel-ldr/supabase/migrations/20261112000100_calendar_oauth_private_storage.sql", import.meta.url), "utf8");
test("OAuth storage uses RLS and explicitly revokes browser roles", () => {
  for (const table of ["ldr_calendar_oauth_nonces", "ldr_calendar_oauth_secrets"]) {
    assert.match(sql, new RegExp("alter table public\\." + table + " enable row level security", "i"));
    assert.match(sql, new RegExp("revoke all on public\\." + table + " from public, anon, authenticated", "i"));
  }
});
test("OAuth nonce function is invoker-only and not public callable", () => {
  assert.match(sql, /security invoker/i);
  assert.match(sql, /on conflict \(nonce\) do nothing/i);
  assert.match(sql, /revoke all on function public\.ldr_claim_calendar_oauth_nonce\(text, integer\) from public, anon, authenticated/i);
  assert.doesNotMatch(sql, /security definer/i);
});
test("OAuth secret values are encrypted and never have browser grants", () => {
  assert.match(sql, /encrypted_value text not null/i);
  assert.doesNotMatch(sql, /grant .* on public\.ldr_calendar_oauth_secrets to (anon|authenticated)/i);
});

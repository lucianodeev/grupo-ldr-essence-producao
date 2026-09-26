import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const sql = readFileSync(fileURLToPath(new URL("../../supabase/staged/ldr_one_business_seat_allocations_REVIEW_ONLY.sql", import.meta.url)), "utf8");

test("staged allocation SQL contains locking, capacity and active paid checks", () => {
  assert.match(sql, /FROM public\.ldr_pass_subscriptions WHERE id=p_subscription_id FOR UPDATE/);
  assert.match(sql, /s\.ldr_one_seats IS NULL OR s\.ldr_one_seats < 5/);
  assert.match(sql, /seat_count >= s\.ldr_one_seats/);
  assert.match(sql, /s\.current_period_end <= now\(\)/);
  assert.match(sql, /s\.stripe_subscription_id IS NULL/);
  assert.match(sql, /CREATE UNIQUE INDEX IF NOT EXISTS ldr_one_one_active_seat_per_subscription_user/);
  assert.doesNotMatch(sql, /\\n/, "no escaped newline artifacts");
});

test("staged SQL blocks direct public allocation and revocation", () => {
  assert.match(sql, /ENABLE ROW LEVEL SECURITY/);
  for (const fn of ["ldr_one_allocate_seat", "ldr_one_revoke_seat"]) {
    assert.ok(sql.includes("REVOKE ALL ON FUNCTION public." + fn + "(uuid,uuid) FROM PUBLIC, anon, authenticated;"));
    assert.ok(sql.includes("GRANT EXECUTE ON FUNCTION public." + fn + "(uuid,uuid) TO service_role;"));
  }
  assert.match(sql, /WHERE id=p_subscription_id AND ldr_one_offer='business' FOR UPDATE/);
});

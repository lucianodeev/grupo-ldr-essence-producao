import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const staged = readFileSync(new URL("../../supabase/staged/ldr_one_business_seat_allocations_REVIEW_ONLY.sql", import.meta.url), "utf8");

test("staged business allocator serializes competing assignments on subscription row", () => {
  assert.match(staged, /FROM public\.ldr_pass_subscriptions WHERE id=p_subscription_id FOR UPDATE/);
  assert.match(staged, /IF seat_count >= s\.ldr_one_seats THEN RAISE EXCEPTION/);
  assert.match(staged, /CREATE UNIQUE INDEX IF NOT EXISTS ldr_one_one_active_seat_per_subscription_user/);
});

test("staged business allocation does not expose privileged RPCs to public roles", () => {
  assert.match(staged, /ALTER TABLE public\.ldr_one_seat_allocations ENABLE ROW LEVEL SECURITY/);
  assert.match(staged, /REVOKE ALL ON public\.ldr_one_seat_allocations FROM anon, authenticated/);
  assert.match(staged, /REVOKE ALL ON FUNCTION public\.ldr_one_allocate_seat\(uuid,uuid\) FROM PUBLIC, anon, authenticated/);
  assert.match(staged, /REVOKE ALL ON FUNCTION public\.ldr_one_revoke_seat\(uuid,uuid\) FROM PUBLIC, anon, authenticated/);
  assert.match(staged, /GRANT EXECUTE ON FUNCTION public\.ldr_one_allocate_seat\(uuid,uuid\) TO service_role/);
});

test("staged allocator fails closed for unpaid, expired or under-minimum subscriptions", () => {
  assert.match(staged, /s\.ldr_one_offer IS DISTINCT FROM 'business'/);
  assert.match(staged, /s\.ldr_one_seats < 5/);
  assert.match(staged, /s\.status NOT IN \('active','trialing'\)/);
  assert.match(staged, /s\.current_period_end <= now\(\)/);
});

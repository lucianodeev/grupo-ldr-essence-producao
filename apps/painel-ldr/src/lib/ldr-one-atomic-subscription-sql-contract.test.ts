import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
const sql=readFileSync(new URL("../../supabase/staged/ldr_one_atomic_subscription_REVIEW_ONLY.sql",import.meta.url),"utf8");
test("full subscription fields and cursor update atomically after parent lock",()=>{
  assert.match(sql,/WHERE id=p_subscription_id FOR UPDATE/);
  assert.match(sql,/SET status=p_status,[\s\S]*stripe_subscription_id=p_stripe_subscription_id/);
  assert.match(sql,/current_period_end=coalesce\(p_period_end,current_period_end\)/);
  assert.match(sql,/INSERT INTO public\.ldr_one_event_cursor/);
});
test("subscription identity, older events and ambiguous events fail closed",()=>{
  assert.match(sql,/v_subscription\.stripe_subscription_id <> p_stripe_subscription_id/);
  assert.match(sql,/p_event_created < v_cursor\.last_event_created/);
  assert.match(sql,/p_event_created = v_cursor\.last_event_created/);
  assert.match(sql,/p_period_end < v_subscription\.current_period_end/);
});
test("staged privileged function does not change shared webhook",()=>{
  assert.match(sql,/STAGED ONLY/);
  assert.match(sql,/REVOKE ALL ON FUNCTION public\.ldr_one_apply_ordered_subscription/);
  assert.match(sql,/TO service_role/);
  assert.doesNotMatch(sql,/(?:UPDATE|ALTER TABLE|DELETE FROM)\s+public\.stripe_webhook_events/i);
});

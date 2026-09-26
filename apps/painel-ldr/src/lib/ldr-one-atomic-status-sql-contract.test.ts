import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
const sql=readFileSync(new URL("../../supabase/staged/ldr_one_atomic_status_REVIEW_ONLY.sql",import.meta.url),"utf8");
test("ordered LDR ONE status update and cursor advance are in one database function",()=>{
  assert.match(sql,/WHERE id=p_subscription_id FOR UPDATE/);
  assert.match(sql,/UPDATE public\.ldr_pass_subscriptions[\s\S]*SET status=p_status/);
  assert.match(sql,/INSERT INTO public\.ldr_one_event_cursor/);
  assert.match(sql,/IF p_event_created < v_cursor\.last_event_created THEN RETURN 'stale'/);
  assert.match(sql,/IF p_event_created = v_cursor\.last_event_created THEN RETURN 'reconcile'/);
});
test("rejects unauthenticated direct RPC and non-LDR subscriptions",()=>{
  assert.match(sql,/v_subscription\.ldr_one_offer NOT IN \('individual','business'\)/);
  assert.match(sql,/REVOKE ALL ON FUNCTION public\.ldr_one_apply_ordered_status/);
  assert.match(sql,/TO service_role/);
  assert.match(sql,/STAGED ONLY/);
});

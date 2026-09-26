import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
const sql = readFileSync(new URL("../../supabase/staged/ldr_one_webhook_inbox_REVIEW_ONLY.sql", import.meta.url), "utf8");

test("dedicated LDR ONE inbox does not mutate shared Stripe event table", () => {
  assert.match(sql, /CREATE TABLE IF NOT EXISTS public\.ldr_one_webhook_inbox/);
  assert.doesNotMatch(sql, /(?:UPDATE|ALTER TABLE|DELETE FROM)\s+public\.stripe_webhook_events/i);
  assert.match(sql, /STAGED ONLY/);
});
test("atomic claim serializes competing deliveries and leases in-progress work", () => {
  assert.match(sql, /ON CONFLICT \(event_id\) DO NOTHING/);
  assert.match(sql, /WHERE event_id=p_event_id FOR UPDATE/);
  assert.match(sql, /v\.state='completed'/);
  assert.match(sql, /v\.state='processing' AND v\.lease_expires_at > now\(\)/);
  assert.match(sql, /claim_token=v_token, lease_expires_at=now\(\)\+interval '2 minutes'/);
});
test("completion requires the same claim token and an unexpired lease", () => {
  assert.match(sql, /WHERE event_id=p_event_id AND claim_token=p_token AND state='processing'/);
  assert.match(sql, /AND lease_expires_at > now\(\)/);
  assert.match(sql, /GET DIAGNOSTICS v_count = ROW_COUNT/);
});
test("inbox and privileged RPCs are restricted to service role", () => {
  assert.match(sql, /ENABLE ROW LEVEL SECURITY/);
  assert.match(sql, /REVOKE ALL ON public\.ldr_one_webhook_inbox FROM PUBLIC, anon, authenticated/);
  assert.match(sql, /GRANT EXECUTE ON FUNCTION public\.ldr_one_claim_webhook_event\(text,text,integer\) TO service_role/);
  assert.match(sql, /GRANT EXECUTE ON FUNCTION public\.ldr_one_finish_webhook_event\(text,uuid,boolean,text\) TO service_role/);
});

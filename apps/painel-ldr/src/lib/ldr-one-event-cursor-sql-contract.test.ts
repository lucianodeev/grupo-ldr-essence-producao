import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
const sql = readFileSync(new URL("../../supabase/staged/ldr_one_event_cursor_REVIEW_ONLY.sql", import.meta.url), "utf8");

test("cursor is LDR ONE-specific and staged, with no shared event mutations", () => {
  assert.match(sql, /STAGED ONLY/);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS public\.ldr_one_event_cursor/);
  assert.doesNotMatch(sql, /(?:UPDATE|ALTER TABLE|DELETE FROM)\s+public\.stripe_webhook_events/i);
});
test("preflight serializes first event and rejects ambiguous ordering", () => {
  assert.match(sql, /WHERE id=p_subscription_id FOR UPDATE/);
  assert.match(sql, /IF v\.last_event_id=p_event_id THEN RETURN 'duplicate'/);
  assert.match(sql, /IF p_created < v\.last_event_created THEN RETURN 'stale'/);
  assert.match(sql, /IF p_created = v\.last_event_created THEN RETURN 'reconcile'/);
});
test("preflight cannot silently advance cursor or write subscriptions", () => {
  assert.doesNotMatch(sql, /UPDATE\s+public\.ldr_pass_subscriptions/i);
  assert.doesNotMatch(sql, /UPDATE\s+public\.ldr_one_event_cursor/i);
  assert.match(sql, /NEVER call this function and then update a subscription separately/);
});
test("diagnostic RPC and cursor are service-role restricted", () => {
  assert.match(sql, /ENABLE ROW LEVEL SECURITY/);
  assert.match(sql, /REVOKE ALL ON FUNCTION public\.ldr_one_event_order_preflight\(uuid,text,bigint\) FROM PUBLIC,anon,authenticated/);
  assert.match(sql, /GRANT EXECUTE ON FUNCTION public\.ldr_one_event_order_preflight\(uuid,text,bigint\) TO service_role/);
});

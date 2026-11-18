#!/usr/bin/env node
// PR #316: fail-closed preflight for hosted Stripe E2E; performs no API calls.
const fail = (reason) => { console.error('BLOCKED: ' + reason); process.exitCode = 1; };
const secret = process.env.STRIPE_SECRET_KEY_TEST || '';
const webhook = process.env.STRIPE_WEBHOOK_SECRET_TEST || '';
const url = process.env.LDR_E2E_BASE_URL || '';
const supabase = process.env.LDR_E2E_SUPABASE_URL || '';
if (!/^sk_test_[A-Za-z0-9]+$/.test(secret)) fail('missing or invalid test-only Stripe key');
if (!/^whsec_[A-Za-z0-9]+$/.test(webhook)) fail('missing or invalid isolated webhook signing secret');
for (const [label, value] of [['app', url], ['supabase', supabase]]) {
  try {
    const parsed = new URL(value);
    if (!['127.0.0.1', 'localhost', '[::1]'].includes(parsed.hostname)) fail(label + ' URL must be loopback');
    if (!['http:', 'https:'].includes(parsed.protocol)) fail(label + ' URL protocol unsupported');
  } catch { fail(label + ' loopback URL missing or invalid'); }
}
if (process.env.LDR_E2E_STRIPE_TAX !== 'false') fail('Stripe Tax must be explicitly disabled for this run');
if (process.env.LDR_E2E_CONFIRM_ISOLATED !== 'true') fail('isolated run acknowledgement missing');
if (!process.exitCode) console.log('Preflight PASS: test key format, webhook key format, loopback endpoints, Stripe Tax disabled. No network calls or payments performed.');

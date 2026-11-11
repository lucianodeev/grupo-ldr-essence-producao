import test from "node:test";
import assert from "node:assert/strict";
import {
  createCalendarAuthorizationUrl,
  validateCalendarOAuthState,
  exchangeCalendarAuthorizationCode,
} from "../../apps/painel-ldr/src/lib/google-calendar-oauth-setup.server.ts";

const keys = ["GOOGLE_OAUTH_CLIENT_ID", "GOOGLE_OAUTH_CLIENT_SECRET", "GOOGLE_OAUTH_REDIRECT_URI", "GOOGLE_OAUTH_STATE_SECRET"];
const original = Object.fromEntries(keys.map(k => [k, process.env[k]]));
const originalFetch = globalThis.fetch;
test.beforeEach(() => {
  process.env.GOOGLE_OAUTH_CLIENT_ID = "test-client";
  process.env.GOOGLE_OAUTH_CLIENT_SECRET = "synthetic-secret";
  process.env.GOOGLE_OAUTH_REDIRECT_URI = "https://example.invalid/oauth/callback";
  process.env.GOOGLE_OAUTH_STATE_SECRET = "synthetic-state-secret-for-tests-only";
});
test.afterEach(() => {
  globalThis.fetch = originalFetch;
  for (const key of keys) {
    if (original[key] === undefined) delete process.env[key];
    else process.env[key] = original[key];
  }
});

test("authorization URL requests offline consent and least-privilege calendar scopes", () => {
  const url = new URL(createCalendarAuthorizationUrl());
  assert.equal(url.origin, "https://accounts.google.com");
  assert.equal(url.searchParams.get("client_id"), "test-client");
  assert.equal(url.searchParams.get("access_type"), "offline");
  assert.equal(url.searchParams.get("prompt"), "consent");
  assert.equal(url.searchParams.get("redirect_uri"), "https://example.invalid/oauth/callback");
  assert.match(url.searchParams.get("scope") || "", /calendar\.events/);
  assert.match(url.searchParams.get("scope") || "", /calendar\.freebusy/);
  validateCalendarOAuthState(url.searchParams.get("state"));
});

test("tampered or malformed OAuth state is rejected", () => {
  const state = new URL(createCalendarAuthorizationUrl()).searchParams.get("state");
  assert.throws(() => validateCalendarOAuthState(state + "x"), /oauth_state_invalid/);
  assert.throws(() => validateCalendarOAuthState("invalid"), /oauth_state_invalid/);
});

test("expired state is rejected", () => {
  const state = new URL(createCalendarAuthorizationUrl()).searchParams.get("state");
  const originalNow = Date.now;
  try {
    Date.now = () => originalNow() + 11 * 60 * 1000;
    assert.throws(() => validateCalendarOAuthState(state), /oauth_state_invalid/);
  } finally { Date.now = originalNow; }
});

test("token exchange posts authorization code server-side without exposing secret in result", async () => {
  let called = false;
  globalThis.fetch = async (url, options) => {
    called = true;
    assert.equal(url, "https://oauth2.googleapis.com/token");
    assert.equal(options.method, "POST");
    const body = new URLSearchParams(options.body);
    assert.equal(body.get("grant_type"), "authorization_code");
    assert.equal(body.get("code"), "synthetic-code");
    assert.equal(body.get("client_secret"), "synthetic-secret");
    return new Response(JSON.stringify({ refresh_token: "synthetic-refresh", scope: "calendar.events" }), { status: 200 });
  };
  const result = await exchangeCalendarAuthorizationCode("synthetic-code");
  assert.equal(called, true);
  assert.deepEqual(result, { refreshToken: "synthetic-refresh", scope: "calendar.events" });
});

test("token exchange refuses missing refresh token", async () => {
  globalThis.fetch = async () => new Response(JSON.stringify({ access_token: "temporary" }), { status: 200 });
  await assert.rejects(exchangeCalendarAuthorizationCode("synthetic-code"), /oauth_refresh_token_missing/);
});

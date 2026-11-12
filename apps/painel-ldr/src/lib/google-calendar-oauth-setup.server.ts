// Server-only OAuth authorization primitives for a dedicated staging callback.
// No credentials or tokens are ever returned to the browser or logged.
// The route using this module MUST enforce administrator authentication and persist
// refresh tokens in a secret manager before enabling calendar operations.
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const SCOPES = [
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar.freebusy",
];

function required(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error("oauth_not_configured");
  return value;
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function createCalendarAuthorizationUrl(sessionBinding: string): string {
  if (!sessionBinding || sessionBinding.length > 512) throw new Error("oauth_session_invalid");
  const clientId = required("GOOGLE_OAUTH_CLIENT_ID");
  const redirectUri = required("GOOGLE_OAUTH_REDIRECT_URI");
  const stateSecret = required("GOOGLE_OAUTH_STATE_SECRET");
  const nonce = randomBytes(24).toString("base64url");
  const payload = Buffer.from(JSON.stringify({
    nonce,
    sessionHash: sign(sessionBinding, stateSecret),
    exp: Date.now() + 10 * 60 * 1000,
  })).toString("base64url");
  const state = `${payload}.${sign(payload, stateSecret)}`;
  const url = new URL(AUTH_ENDPOINT);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", SCOPES.join(" "));
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("state", state);
  return url.toString();
}

export function validateCalendarOAuthState(state: string, sessionBinding: string): string {
  if (!sessionBinding || sessionBinding.length > 512) throw new Error("oauth_session_invalid");
  const secret = required("GOOGLE_OAUTH_STATE_SECRET");
  const [payload, mac, extra] = state.split(".");
  if (!payload || !mac || extra) throw new Error("oauth_state_invalid");
  const expected = Buffer.from(sign(payload, secret));
  const actual = Buffer.from(mac);
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    throw new Error("oauth_state_invalid");
  }
  let decoded: { nonce?: string; exp?: number; sessionHash?: string };
  try { decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")); }
  catch { throw new Error("oauth_state_invalid"); }
  if (typeof decoded.nonce !== "string" || decoded.nonce.length < 16 ||
      typeof decoded.exp !== "number" || decoded.exp <= Date.now() ||
      decoded.exp > Date.now() + 10 * 60 * 1000 ||
      decoded.sessionHash !== sign(sessionBinding, secret)) {
    throw new Error("oauth_state_invalid");
  }
  return decoded.nonce;
}

/**
 * Exchange a short-lived authorization code in a staging-only authenticated
 * callback. The caller must bind state to an admin session and enforce
 * one-time use of the nonce to prevent replay.
 */
export async function exchangeCalendarAuthorizationCode(code: string): Promise<{
  refreshToken: string;
  scope: string;
}> {
  if (!code || code.length > 4096) throw new Error("oauth_code_invalid");
  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    signal: AbortSignal.timeout(15000),
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: required("GOOGLE_OAUTH_CLIENT_ID"),
      client_secret: required("GOOGLE_OAUTH_CLIENT_SECRET"),
      redirect_uri: required("GOOGLE_OAUTH_REDIRECT_URI"),
    }),
  });
  if (!response.ok) throw new Error("oauth_exchange_failed");
  const result = await response.json() as { refresh_token?: string; scope?: string };
  if (!result.refresh_token) throw new Error("oauth_refresh_token_missing");
  return { refreshToken: result.refresh_token, scope: result.scope || "" };
}

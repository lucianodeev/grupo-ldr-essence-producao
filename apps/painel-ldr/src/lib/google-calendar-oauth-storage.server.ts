import { createCipheriv, randomBytes } from "node:crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { OAuthNonceStore } from "./google-calendar-oauth-nonce.server.ts";
import type { CalendarOAuthTokenVault } from "./google-calendar-oauth-callback.server.ts";

/** Only server credentials may access the private tables; no browser RLS policies. */
function key(): Buffer {
  const encoded = process.env["GOOGLE_CALENDAR_TOKEN_ENCRYPTION_KEY"];
  if (!encoded) throw new Error("oauth_vault_unavailable");
  const decoded = Buffer.from(encoded, "base64");
  if (decoded.length !== 32) throw new Error("oauth_vault_unavailable");
  return decoded;
}

export const calendarOAuthNonceStore: OAuthNonceStore = {
  async claim(nonce, expiresInSeconds) {
    if (!/^[A-Za-z0-9_-]{32}$/.test(nonce)) throw new Error("oauth_state_invalid");
    const { data, error } = await (supabaseAdmin as any).rpc("ldr_claim_calendar_oauth_nonce", {
      p_nonce: nonce,
      p_ttl_seconds: Math.min(600, Math.max(1, Math.trunc(expiresInSeconds))),
    });
    if (error) throw new Error("oauth_store_unavailable");
    return data === true;
  },
};

export const calendarOAuthTokenVault: CalendarOAuthTokenVault = {
  async saveRefreshToken(token, grantedScopes) {
    if (!token) throw new Error("oauth_vault_unavailable");
    const iv = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", key(), iv);
    const encrypted = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
    const payload = Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString("base64");
    const { error } = await (supabaseAdmin as any).from("ldr_calendar_oauth_secrets").upsert({
      secret_name: "google_calendar_refresh_token",
      encrypted_value: payload,
      granted_scopes: grantedScopes,
      updated_at: new Date().toISOString(),
    }, { onConflict: "secret_name" });
    if (error) throw new Error("oauth_vault_unavailable");
  },
};

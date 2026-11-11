import { consumeCalendarOAuthState, type OAuthNonceStore } from "./google-calendar-oauth-nonce.server.ts";
import { exchangeCalendarAuthorizationCode } from "./google-calendar-oauth-setup.server.ts";

export type CalendarOAuthAdminContext = {
  /** Server-verified admin session identifier, never user-supplied query text. */
  sessionBinding: string;
  isAdministrator: boolean;
};

export type CalendarOAuthTokenVault = {
  /** Encrypt and persist server-side; do not expose or log the token. */
  saveRefreshToken(token: string, grantedScopes: string): Promise<void>;
};

/**
 * Call only from a same-origin server callback route after authenticating the
 * session. The concrete route must use an atomic shared nonce store and vault.
 * The token is never returned to the browser.
 */
export async function completeCalendarOAuthCallback(
  params: { code?: string | null; state?: string | null; error?: string | null },
  admin: CalendarOAuthAdminContext,
  nonceStore: OAuthNonceStore,
  vault: CalendarOAuthTokenVault,
): Promise<{ connected: true }> {
  if (!admin?.isAdministrator || !admin.sessionBinding) throw new Error("oauth_admin_required");
  if (params.error) throw new Error("oauth_authorization_denied");
  if (!params.code || !params.state) throw new Error("oauth_callback_invalid");
  if (!vault || typeof vault.saveRefreshToken !== "function") throw new Error("oauth_vault_unavailable");
  await consumeCalendarOAuthState(params.state, admin.sessionBinding, nonceStore);
  const result = await exchangeCalendarAuthorizationCode(params.code);
  await vault.saveRefreshToken(result.refreshToken, result.scope);
  return { connected: true };
}

/**
 * One-time OAuth callback state consumption. A shared atomic store is required
 * (e.g. Redis SET NX EX or a PostgreSQL unique insert) in multi-instance deployments.
 * Never use process-local memory to prevent replay in production.
 */
import { validateCalendarOAuthState } from "./google-calendar-oauth-setup.server.ts";

export type OAuthNonceStore = {
  /** Atomically claim the nonce once; return false if already claimed. */
  claim(nonce: string, expiresInSeconds: number): Promise<boolean>;
};

export async function consumeCalendarOAuthState(
  state: string,
  adminSessionBinding: string,
  store: OAuthNonceStore,
): Promise<void> {
  const nonce = validateCalendarOAuthState(state, adminSessionBinding);
  if (!store || typeof store.claim !== "function") throw new Error("oauth_store_unavailable");
  let claimed: boolean;
  try {
    claimed = await store.claim(nonce, 600);
  } catch {
    throw new Error("oauth_store_unavailable");
  }
  if (claimed !== true) throw new Error("oauth_state_replayed");
}

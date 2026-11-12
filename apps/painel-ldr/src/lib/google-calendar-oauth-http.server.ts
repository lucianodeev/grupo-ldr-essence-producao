import { createCalendarAuthorizationUrl } from "./google-calendar-oauth-setup.server.ts";
import { completeCalendarOAuthCallback, type CalendarOAuthAdminContext, type CalendarOAuthTokenVault } from "./google-calendar-oauth-callback.server.ts";
import type { OAuthNonceStore } from "./google-calendar-oauth-nonce.server.ts";

export type CalendarOAuthDependencies = {
  /** Must validate the server session from the request, not from query parameters. */
  authenticateAdmin(request: Request): Promise<CalendarOAuthAdminContext>;
  nonceStore: OAuthNonceStore;
  vault: CalendarOAuthTokenVault;
};

/** Server-only handlers to mount on an authenticated staging HTTP route. */
export function createCalendarOAuthHttpHandlers(deps: CalendarOAuthDependencies) {
  return {
    async start(request: Request): Promise<Response> {
      if (request.method !== "GET") return new Response(null, { status: 405 });
      const admin = await deps.authenticateAdmin(request);
      if (!admin?.isAdministrator || !admin.sessionBinding) return new Response("Forbidden", { status: 403 });
      const authorizationUrl = createCalendarAuthorizationUrl(admin.sessionBinding);
      return new Response(null, {
        status: 302,
        headers: { Location: authorizationUrl, "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" },
      });
    },
    async callback(request: Request): Promise<Response> {
      if (request.method !== "GET") return new Response(null, { status: 405 });
      const admin = await deps.authenticateAdmin(request);
      if (!admin?.isAdministrator || !admin.sessionBinding) return new Response("Forbidden", { status: 403 });
      const url = new URL(request.url);
      try {
        await completeCalendarOAuthCallback({
          code: url.searchParams.get("code"),
          state: url.searchParams.get("state"),
          error: url.searchParams.get("error"),
        }, admin, deps.nonceStore, deps.vault);
        return new Response("Google Calendar connected", {
          status: 200,
          headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" },
        });
      } catch {
        return new Response("Google Calendar connection failed", {
          status: 400,
          headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" },
        });
      }
    },
  };
}

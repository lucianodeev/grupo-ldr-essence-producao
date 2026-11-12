import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/integrations/google-calendar/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        // OAuth setup does not enable booking/calendar operations.
        if (process.env["GOOGLE_CALENDAR_OAUTH_SETUP_ENABLED"] !== "true") {
          return new Response("Not available", { status: 404, headers: { "Cache-Control": "no-store" } });
        }
        const [{ createCalendarOAuthHttpHandlers }, { authenticateCalendarOAuthAdmin }, { calendarOAuthNonceStore, calendarOAuthTokenVault }] = await Promise.all([
          import("@/lib/google-calendar-oauth-http.server"),
          import("@/lib/google-calendar-oauth-admin.server"),
          import("@/lib/google-calendar-oauth-storage.server"),
        ]);
        const handlers = createCalendarOAuthHttpHandlers({
          authenticateAdmin: authenticateCalendarOAuthAdmin,
          nonceStore: calendarOAuthNonceStore,
          vault: calendarOAuthTokenVault,
        });
        return handlers.callback(request);
      },
    },
  },
});

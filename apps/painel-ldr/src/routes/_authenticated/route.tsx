import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import type { Session } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";
import { getClientAuthState } from "@/integrations/supabase/session.functions";

async function syncBrowserSession(session: Session) {
  const response = await fetch("/api/auth/session-sync", {
    method: "POST",
    credentials: "include",
    cache: "no-store",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    }),
  });
  return response.ok;
}

export const Route = createFileRoute("/_authenticated")({
  head: () => ({ meta: [{ name: "robots", content: "noindex,nofollow" }] }),
  ssr: false,
  beforeLoad: async ({ location }) => {
    // OAuth callbacks exchange the code server-side and persist the Supabase
    // session in SSR cookies before /admin is opened. Check that authoritative
    // server session first instead of requiring a browser-local session.
    const serverAuth = await getClientAuthState().catch(() => null);
    if (serverAuth?.authenticated) return;

    // Password login (and older browser sessions) can exist in the browser
    // before SSR cookies are synchronized. Reuse the same repair flow that is
    // already proven in the client library area, then verify server auth again.
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      const synced = await syncBrowserSession(data.session).catch(() => false);
      if (synced) {
        const verified = await getClientAuthState().catch(() => null);
        if (verified?.authenticated) return;
      }
    }

    const professionalArea =
      location.pathname === "/painel-profissional" ||
      location.pathname.startsWith("/painel-profissional/");
    const loginPath = professionalArea ? "/profissional/login" : "/login";

    if (typeof window !== "undefined" && loginPath === "/login") {
      window.location.replace(loginPath);
      await new Promise<never>(() => {});
    }

    throw redirect({ to: loginPath });
  },
  component: () => <Outlet />,
});

import { createFileRoute } from "@tanstack/react-router";
import { createServerClient, parseCookieHeader, serializeCookieHeader } from "@supabase/ssr";

import { normalizeSupabaseUrl } from "@/integrations/supabase/config";
import type { Database } from "@/integrations/supabase/types";

function config() {
  const supabaseUrl = process.env["SUPABASE_URL"];
  const supabasePublishableKey = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!supabaseUrl || !supabasePublishableKey) throw new Error("Missing Supabase server configuration");
  return { supabaseUrl, supabasePublishableKey };
}

function isServicePortalCallback(url: URL) {
  return (
    url.searchParams.get("portal") === "services" ||
    /^portal\.ldrrhestrategia\.com$/i.test(url.hostname)
  );
}

export const Route = createFileRoute("/api/auth/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const code = url.searchParams.get("code");
        const servicePortal = isServicePortalCallback(url);
        const adminFlow = url.searchParams.get("admin") === "1";
        const { supabaseUrl, supabasePublishableKey } = config();
        const responseHeaders = new Headers({
          "cache-control": "no-store, max-age=0, must-revalidate",
          pragma: "no-cache",
          expires: "0",
        });

        const supabase = createServerClient<Database>(
          normalizeSupabaseUrl(supabaseUrl),
          supabasePublishableKey,
          {
            cookies: {
              getAll() {
                return parseCookieHeader(request.headers.get("cookie") ?? "");
              },
              setAll(cookiesToSet, cacheHeaders) {
                cookiesToSet.forEach(({ name, value, options }) => {
                  responseHeaders.append("set-cookie", serializeCookieHeader(name, value, { ...options, path: "/" }));
                });
                Object.entries(cacheHeaders).forEach(([key, value]) => responseHeaders.set(key, value));
              },
            },
          },
        );

        if (!code) {
          const missingCodeDestination = adminFlow
            ? "/login?auth_error=missing_code"
            : servicePortal
            ? "/cliente/login?portal=services&auth_error=missing_code"
            : "/cliente/login?auth_error=missing_code";
          return new Response(null, {
            status: 303,
            headers: new Headers({ ...Object.fromEntries(responseHeaders), location: missingCodeDestination }),
          });
        }

        const { error } = await supabase.auth.exchangeCodeForSession(code);
        const destination = error
          ? adminFlow
            ? "/login?auth_error=exchange_failed"
            : servicePortal
            ? "/cliente/login?portal=services&auth_error=exchange_failed"
            : "/cliente/login?auth_error=exchange_failed"
          : adminFlow
            ? "/admin"
            : servicePortal
            ? "/cliente?portal=services&v=4"
            : "/cliente/biblioteca";
        responseHeaders.set("location", destination);
        return new Response(null, { status: 303, headers: responseHeaders });
      },
    },
  },
});

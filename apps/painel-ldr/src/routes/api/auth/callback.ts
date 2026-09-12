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

export const Route = createFileRoute("/api/auth/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const code = url.searchParams.get("code");
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
          return new Response(null, {
            status: 303,
            headers: new Headers({ ...Object.fromEntries(responseHeaders), location: "/cliente/login?auth_error=missing_code" }),
          });
        }

        const { error } = await supabase.auth.exchangeCodeForSession(code);
        const destination = error ? "/cliente/login?auth_error=exchange_failed" : "/cliente/biblioteca";
        responseHeaders.set("location", destination);
        return new Response(null, { status: 303, headers: responseHeaders });
      },
    },
  },
});

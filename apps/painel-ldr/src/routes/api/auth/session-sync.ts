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

function json(status: number, payload: unknown, headers?: Headers) {
  const out = headers ?? new Headers();
  out.set("content-type", "application/json; charset=utf-8");
  out.set("cache-control", "no-store, max-age=0, must-revalidate");
  return new Response(JSON.stringify(payload), { status, headers: out });
}

export const Route = createFileRoute("/api/auth/session-sync")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.json().catch(() => null) as { access_token?: string; refresh_token?: string } | null;
        const accessToken = body?.access_token?.trim() ?? "";
        const refreshToken = body?.refresh_token?.trim() ?? "";
        if (!accessToken || !refreshToken) return json(400, { ok: false, error: "missing_session" });

        const { supabaseUrl, supabasePublishableKey } = config();
        const responseHeaders = new Headers();
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

        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (error || !data.user?.id) return json(401, { ok: false, error: "invalid_session" }, responseHeaders);

        return json(200, { ok: true, userId: data.user.id }, responseHeaders);
      },
    },
  },
});

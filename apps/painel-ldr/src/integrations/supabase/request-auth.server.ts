import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { getCookies, getRequest, setCookie, setResponseHeader } from "@tanstack/react-start/server";

import { normalizeSupabaseUrl } from "./config";
import type { Database } from "./types";

function isNewSupabaseApiKey(value: string): boolean {
  return value.startsWith("sb_publishable_") || value.startsWith("sb_secret_");
}

function createSupabaseFetch(supabaseKey: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined,
    );
    if (init?.headers) new Headers(init.headers).forEach((value, key) => headers.set(key, value));
    if (isNewSupabaseApiKey(supabaseKey) && headers.get("Authorization") === `Bearer ${supabaseKey}`) {
      headers.delete("Authorization");
    }
    headers.set("apikey", supabaseKey);
    return fetch(input, { ...init, headers });
  };
}

function config() {
  const supabaseUrl = process.env["SUPABASE_URL"];
  const supabasePublishableKey = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!supabaseUrl || !supabasePublishableKey) throw new Error("Missing Supabase server configuration");
  return { supabaseUrl, supabasePublishableKey };
}

function cookieClient(url: string, key: string) {
  return createServerClient<Database>(normalizeSupabaseUrl(url), key, {
    global: { fetch: createSupabaseFetch(key) },
    cookies: {
      getAll: () => Object.entries(getCookies()).map(([name, value]) => ({ name, value })),
      setAll: (cookiesToSet, headers) => {
        cookiesToSet.forEach(({ name, value, options }) => setCookie(name, value, options));
        Object.entries(headers).forEach(([name, value]) => setResponseHeader(name, value));
      },
    },
  });
}

export async function resolveRequestAuth() {
  const { supabaseUrl, supabasePublishableKey } = config();
  const request = getRequest();
  const authHeader = request?.headers?.get("authorization") ?? null;

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7).trim();
    if (token && token.split(".").length === 3) {
      const supabase = createClient<Database>(
        normalizeSupabaseUrl(supabaseUrl),
        supabasePublishableKey,
        {
          global: {
            fetch: createSupabaseFetch(supabasePublishableKey),
            headers: { Authorization: `Bearer ${token}` },
          },
          auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
        },
      );
      const { data, error } = await supabase.auth.getClaims(token);
      if (!error && data?.claims?.sub) {
        const claims = data.claims as Record<string, unknown>;
        return {
          authenticated: true as const,
          userId: String(data.claims.sub),
          email: typeof claims.email === "string" ? claims.email : null,
          claims,
          supabase,
          source: "bearer" as const,
        };
      }
    }
  }

  const supabase = cookieClient(supabaseUrl, supabasePublishableKey);
  const { data, error } = await supabase.auth.getUser();
  const user = data.user;
  if (error || !user?.id) {
    return {
      authenticated: false as const,
      userId: null,
      email: null,
      claims: {} as Record<string, unknown>,
      supabase,
      source: "none" as const,
    };
  }

  const claims: Record<string, unknown> = {
    sub: user.id,
    email: user.email ?? null,
    user_metadata: user.user_metadata ?? {},
    app_metadata: user.app_metadata ?? {},
  };
  return {
    authenticated: true as const,
    userId: user.id,
    email: user.email ?? null,
    claims,
    supabase,
    source: "cookie" as const,
  };
}

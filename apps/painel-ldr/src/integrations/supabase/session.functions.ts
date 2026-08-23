import { createServerClient } from "@supabase/ssr";
import { createServerFn } from "@tanstack/react-start";
import { getCookies, setCookie, setResponseHeader } from "@tanstack/react-start/server";

import type { Database } from "./types";

function isNewSupabaseApiKey(value: string): boolean {
  return value.startsWith("sb_publishable_") || value.startsWith("sb_secret_");
}

function createSupabaseFetch(supabaseKey: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(input instanceof Request ? input.headers : undefined);

    if (init?.headers) {
      new Headers(init.headers).forEach((value, key) => headers.set(key, value));
    }

    if (
      isNewSupabaseApiKey(supabaseKey) &&
      headers.get("Authorization") === `Bearer ${supabaseKey}`
    ) {
      headers.delete("Authorization");
    }

    headers.set("apikey", supabaseKey);
    return fetch(input, { ...init, headers });
  };
}

function getSupabaseConfig() {
  const supabaseUrl = process.env["SUPABASE_URL"];
  const supabasePublishableKey = process.env["SUPABASE_PUBLISHABLE_KEY"];

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error("Missing Supabase server configuration");
  }

  return { supabaseUrl, supabasePublishableKey };
}

function createRequestSupabaseClient() {
  const { supabaseUrl, supabasePublishableKey } = getSupabaseConfig();

  return createServerClient<Database>(supabaseUrl, supabasePublishableKey, {
    global: {
      fetch: createSupabaseFetch(supabasePublishableKey),
    },
    cookies: {
      getAll: () =>
        Object.entries(getCookies()).map(([name, value]) => ({
          name,
          value,
        })),
      setAll: (cookiesToSet, headers) => {
        cookiesToSet.forEach(({ name, value, options }) => {
          setCookie(name, value, options);
        });
        Object.entries(headers).forEach(([name, value]) => {
          setResponseHeader(name, value);
        });
      },
    },
  });
}

export const getClientAuthState = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = createRequestSupabaseClient();
  const { data, error } = await supabase.auth.getUser();

  return {
    authenticated: !error && Boolean(data.user),
    userId: !error ? (data.user?.id ?? null) : null,
  };
});

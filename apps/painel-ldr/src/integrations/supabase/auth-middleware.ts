import { createMiddleware } from '@tanstack/react-start'
import { getCookies, getRequest, setCookie, setResponseHeader } from '@tanstack/react-start/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { normalizeSupabaseUrl } from './config'
import type { Database } from './types'

function isNewSupabaseApiKey(value: string): boolean {
  return value.startsWith('sb_publishable_') || value.startsWith('sb_secret_');
}

function createSupabaseFetch(supabaseKey: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== 'undefined' && input instanceof Request ? input.headers : undefined,
    );
    if (init?.headers) new Headers(init.headers).forEach((value, key) => headers.set(key, value));
    if (isNewSupabaseApiKey(supabaseKey) && headers.get('Authorization') === `Bearer ${supabaseKey}`) {
      headers.delete('Authorization');
    }
    headers.set('apikey', supabaseKey);
    return fetch(input, { ...init, headers });
  };
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

export const requireSupabaseAuth = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    const SUPABASE_URL = process.env['SUPABASE_URL'];
    const SUPABASE_PUBLISHABLE_KEY = process.env['SUPABASE_PUBLISHABLE_KEY'];
    if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
      throw new Error('Missing Supabase server configuration');
    }

    const request = getRequest();
    if (!request?.headers) throw new Error('Unauthorized: No request headers available');
    const authHeader = request.headers.get('authorization');

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      if (!token || token.split('.').length !== 3) throw new Error('Unauthorized: Invalid token');
      const supabase = createClient<Database>(
        normalizeSupabaseUrl(SUPABASE_URL),
        SUPABASE_PUBLISHABLE_KEY,
        {
          global: {
            fetch: createSupabaseFetch(SUPABASE_PUBLISHABLE_KEY),
            headers: { Authorization: `Bearer ${token}` },
          },
          auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
        },
      );
      const { data, error } = await supabase.auth.getClaims(token);
      if (error || !data?.claims?.sub) throw new Error('Unauthorized: Invalid token');
      return next({ context: { supabase, userId: data.claims.sub, claims: data.claims } });
    }

    // Browser client area authenticates with Supabase SSR cookies. Use the same
    // session source as _clientarea.beforeLoad so protected content serverFns do
    // not reject a valid logged-in session merely because no Bearer header exists.
    const supabase = cookieClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
    const { data, error } = await supabase.auth.getUser();
    const user = data.user;
    if (error || !user?.id) throw new Error('Unauthorized: No authenticated session');

    const claims: Record<string, unknown> = {
      sub: user.id,
      email: user.email ?? null,
      user_metadata: user.user_metadata ?? {},
      app_metadata: user.app_metadata ?? {},
    };
    return next({ context: { supabase, userId: user.id, claims } });
  },
);

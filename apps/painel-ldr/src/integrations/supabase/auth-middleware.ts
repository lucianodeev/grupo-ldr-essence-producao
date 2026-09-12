import { createMiddleware } from '@tanstack/react-start'
import { resolveRequestAuth } from './request-auth.server'

export const requireSupabaseAuth = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    const auth = await resolveRequestAuth();
    if (!auth.authenticated || !auth.userId) {
      throw new Error('Unauthorized: No authenticated session');
    }

    return next({
      context: {
        supabase: auth.supabase,
        userId: auth.userId,
        claims: auth.claims,
      },
    });
  },
);

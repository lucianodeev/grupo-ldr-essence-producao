import { createServerClient, parseCookieHeader } from "@supabase/ssr";
import { createHmac } from "node:crypto";
import { normalizeSupabaseUrl } from "@/integrations/supabase/config";
import type { Database } from "@/integrations/supabase/types";
import type { CalendarOAuthAdminContext } from "./google-calendar-oauth-callback.server.ts";

/**
 * Fail-closed server-side admin authentication for the Calendar OAuth flow.
 * The admin allowlist is an explicit environment variable, never user metadata.
 */
export async function authenticateCalendarOAuthAdmin(request: Request): Promise<CalendarOAuthAdminContext> {
  const deny = { isAdministrator: false, sessionBinding: "" };
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  const allowed = (process.env["GOOGLE_CALENDAR_OAUTH_ADMIN_UIDS"] || "").split(",").map(s => s.trim()).filter(Boolean);
  if (!url || !key || !allowed.length) return deny;
  const cookies = parseCookieHeader(request.headers.get("cookie") || "");
  const supabase = createServerClient<Database>(normalizeSupabaseUrl(url), key, {
    cookies: { getAll: () => cookies, setAll: () => {} },
  });
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user || !allowed.includes(user.id)) return deny;
    // Bind state to the signed server session access token rather than mutable profile data.
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token || session.user.id !== user.id) return deny;
    const secret = process.env["GOOGLE_OAUTH_STATE_SECRET"];
    if (!secret) return deny;
    const sessionBinding = createHmac("sha256", secret).update(session.access_token).digest("hex");
    return { isAdministrator: true, sessionBinding };
  } catch {
    return deny;
  }
}

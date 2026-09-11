import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

function emailOf(claims: Record<string, unknown>): string | null { const value = claims["email"]; return typeof value === "string" ? value : null; }
function requestMarket(): "BR" | "INTL" { try { const request = getRequest(); const country = request?.headers.get("x-vercel-ip-country") ?? request?.headers.get("cf-ipcountry") ?? request?.headers.get("x-country-code"); return country?.trim().toUpperCase() === "BR" ? "BR" : "INTL"; } catch { return "INTL"; } }

export const clientLibrarySubscription = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { getLibrarySubscriptionContext } = await import("@/lib/library-subscription.server");
  const result = await getLibrarySubscriptionContext(context.userId, emailOf(context.claims));
  return { ...result, market: requestMarket() };
});

export const clientCreateLibrarySubscriptionCheckout = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data: { market: "BR" | "INTL" }) => data).handler(async ({ context, data }) => {
  const { createLibrarySubscriptionCheckout } = await import("@/lib/library-subscription.server");
  return createLibrarySubscriptionCheckout(context.userId, emailOf(context.claims), data.market);
});

export const clientSetLibrarySubscriptionCancellation = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data: { cancelAtPeriodEnd: boolean }) => data).handler(async ({ context, data }) => {
  const { setLibrarySubscriptionCancellation } = await import("@/lib/library-subscription.server");
  return setLibrarySubscriptionCancellation(context.userId, emailOf(context.claims), data.cancelAtPeriodEnd);
});

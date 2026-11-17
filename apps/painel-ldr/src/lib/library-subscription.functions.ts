import { isAcademySubscriptionProduct } from "@/lib/academy-unified-catalog";
import { createServerFn } from "@tanstack/react-start";
import { getRequest, setResponseHeader } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { resolveLegacyEntitlement } from "@/lib/entitlements";

function emailOf(claims: Record<string, unknown>): string | null {
  const value = claims["email"];
  return typeof value === "string" ? value : null;
}

async function libraryEdge(accessToken: string | null | undefined) {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key || !accessToken) throw new Error("Sessão da Biblioteca inválida.");
  const response = await fetch(`${url.replace(/\/$/, "")}/functions/v1/client-library-self`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      apikey: key,
      authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ operation: "subscription" }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error("Não foi possível validar a assinatura da Biblioteca.");
  return body as any;
}

function requestMarket(): "BR" | "INTL" {
  try {
    const request = getRequest();
    const country =
      request?.headers.get("x-vercel-ip-country") ??
      request?.headers.get("cf-ipcountry") ??
      request?.headers.get("x-country-code");
    return country?.trim().toUpperCase() === "BR" ? "BR" : "INTL";
  } catch {
    return "INTL";
  }
}

export const clientLibrarySubscription = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    if (!process.env["SUPABASE_SERVICE_ROLE_KEY"]) {
      const result = await libraryEdge(context.accessToken);
      return { ...result, market: requestMarket() };
    }
    const { getLibrarySubscriptionContext } = await import("@/lib/library-subscription.server");
    const result = await getLibrarySubscriptionContext(context.userId, emailOf(context.claims));
    return { ...result, market: requestMarket() };
  });

async function libraryCourseDecision(
  context: { userId: string; claims: Record<string, unknown>; accessToken?: string | null },
  resourceKey: string,
) {
  const eligible = isAcademySubscriptionProduct(resourceKey);
  // Existing non-course digital benefit shares this endpoint; retain its legacy access.
  const legacyDigitalBenefit = resourceKey === "human_room_assisted_synthesis";
  if (!eligible && !legacyDigitalBenefit) return resolveLegacyEntitlement({ resourceKey });
  const result = !process.env["SUPABASE_SERVICE_ROLE_KEY"]
    ? await libraryEdge(context.accessToken)
    : await (async () => {
        const { getLibrarySubscriptionContext } = await import("@/lib/library-subscription.server");
        return getLibrarySubscriptionContext(context.userId, emailOf(context.claims));
      })();
  const expiry = result.subscription?.current_period_end;
  const libraryActive = Boolean(result.active) && (!expiry || Date.parse(expiry) > Date.now());
  let ldrOne = false;
  let owned = false;
  if (eligible && !libraryActive && process.env["SUPABASE_SERVICE_ROLE_KEY"] && result.customer?.id) {
    const { getAcademyCatalogAccess } = await import("@/lib/academy-catalog-access.server");
    const access = await getAcademyCatalogAccess(result.customer.id);
    ldrOne = access.active;
    owned = access.ownedKeys.includes(resourceKey);
  }
  return resolveLegacyEntitlement({
    resourceKey: resourceKey,
    owned, passEnabled: eligible, passEligible: eligible, pass: ldrOne,
    librarySubscription: (eligible || legacyDigitalBenefit) && libraryActive,
    librarySubscriptionId: result.subscription?.id ?? undefined,
    libraryExpiresAt: result.subscription?.current_period_end ?? undefined,
  });
}
export const clientLibraryCourseEntitlement = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { resourceKey: string }) => data)
  .handler(async ({ context, data }) => libraryCourseDecision(context, data.resourceKey));

export const clientAcademyReadingEdition = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { slug: string }) => {
    if (!data || typeof data.slug !== "string" || data.slug.length > 160)
      throw new Error("Curso inválido.");
    return { slug: data.slug };
  })
  .handler(async ({ context, data }) => {
    setResponseHeader("Cache-Control", "private, no-store");
    const { getProtectedAcademyReadingEdition } =
      await import("@/lib/academy-reading-content.server");
    const { hasOwnerDigitalAccess } = await import("@/lib/owner-digital-access.server");
    const owner = hasOwnerDigitalAccess(emailOf(context.claims), context.userId);
    return getProtectedAcademyReadingEdition(context.userId, data.slug, async (key) =>
      owner ? { allowed: true } : libraryCourseDecision(context, key),
    );
  });

export const clientCreateLibrarySubscriptionCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { market: "BR" | "INTL"; billingCycle?: "monthly" | "annual" }) => data)
  .handler(async ({ context, data }) => {
    if (!process.env["SUPABASE_SERVICE_ROLE_KEY"] || !process.env["STRIPE_SECRET_KEY"]) {
      throw new Error("Pagamento da assinatura temporariamente indisponível neste ambiente.");
    }
    const { createLibrarySubscriptionCheckout } = await import("@/lib/library-subscription.server");
    return createLibrarySubscriptionCheckout(
      context.userId,
      emailOf(context.claims),
      data.market,
      data.billingCycle ?? "monthly",
    );
  });

export const clientSetLibrarySubscriptionCancellation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { cancelAtPeriodEnd: boolean }) => data)
  .handler(async ({ context, data }) => {
    if (!process.env["SUPABASE_SERVICE_ROLE_KEY"] || !process.env["STRIPE_SECRET_KEY"]) {
      throw new Error("Gestão da assinatura temporariamente indisponível neste ambiente.");
    }
    const { setLibrarySubscriptionCancellation } =
      await import("@/lib/library-subscription.server");
    return setLibrarySubscriptionCancellation(
      context.userId,
      emailOf(context.claims),
      data.cancelAtPeriodEnd,
    );
  });

// Read-only catalogue access status; kept separate from billing/subscription management.
export const clientAcademyCatalogAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    setResponseHeader("Cache-Control", "private, no-store");
    const { hasOwnerDigitalAccess } = await import("@/lib/owner-digital-access.server");
    if (hasOwnerDigitalAccess(emailOf(context.claims), context.userId)) return { active: true, ownedKeys: [] as string[] };
    const { resolveClient } = await import("@/lib/client-portal.server");
    const resolved = await resolveClient(context.userId, emailOf(context.claims));
    if (resolved.status !== "ok") return { active: false, ownedKeys: [] as string[] };
    const { getAcademyCatalogAccess } = await import("@/lib/academy-catalog-access.server");
    return getAcademyCatalogAccess(resolved.customer.id);
  });

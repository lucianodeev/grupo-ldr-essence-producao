import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

function emailOf(claims: Record<string, unknown>): string | null {
  const value = claims["email"];
  return typeof value === "string" ? value : null;
}

export const networkLanding = createServerFn({ method: "GET" }).handler(async () => {
  const { getNetworkLanding } = await import("@/lib/professional-network.server");
  return getNetworkLanding();
});

export const publicProfessional = createServerFn({ method: "GET" }).inputValidator((data: { slug: string }) => data).handler(async ({ data }) => {
  const { getPublicProfessional } = await import("@/lib/professional-network.server");
  return getPublicProfessional(data.slug);
});

export const professionalDashboard = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { getProfessionalDashboard } = await import("@/lib/professional-network.server");
  return getProfessionalDashboard(context.userId, emailOf(context.claims));
});

export const professionalSaveOnboarding = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data: { step: number; countryCode?: string; currency?: "EUR"|"BRL"; displayName?: string; slug?: string; professionalTitle?: string; categoryId?: string; city?: string; languages?: string[]; onlineEnabled?: boolean; inPersonEnabled?: boolean; about?: string; experienceSummary?: string; educationSummary?: string; specialties?: string[] }) => data).handler(async ({ context, data }) => {
  const { saveProfessionalOnboarding } = await import("@/lib/professional-network.server");
  return saveProfessionalOnboarding(context.userId, emailOf(context.claims), data);
});

export const professionalAddAvailability = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data: { serviceId?: string | null; weekday: number; startTime: string; endTime: string; timezone: string; intervalMinutes?: number; bufferMinutes?: number; modality?: "online"|"in_person"|"both"; locationLabel?: string | null }) => data).handler(async ({ context, data }) => {
  const { addProfessionalAvailability } = await import("@/lib/professional-network.server");
  return addProfessionalAvailability(context.userId, emailOf(context.claims), data);
});

export const professionalSubscriptionCheckout = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data: { planId: string }) => data).handler(async ({ context, data }) => {
  const { createProfessionalSubscriptionCheckout } = await import("@/lib/professional-network.server");
  return createProfessionalSubscriptionCheckout(context.userId, emailOf(context.claims), data.planId);
});

export const marketplaceBookingCheckout = createServerFn({ method: "POST" }).inputValidator((data: { profileSlug: string; serviceId: string; startAt: string; customerName: string; customerEmail: string; timezone: string; modality: "online"|"in_person" }) => data).handler(async ({ data }) => {
  const { createMarketplaceBookingCheckout } = await import("@/lib/professional-network.server");
  return createMarketplaceBookingCheckout(data);
});

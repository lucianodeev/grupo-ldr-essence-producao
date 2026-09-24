import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

function emailOf(claims: Record<string, unknown>): string | null {
  const value = claims["email"];
  return typeof value === "string" ? value : null;
}

async function professionalSelfEdge<T>(
  accessToken: string | null | undefined,
  operation: "dashboard" | "save_onboarding" | "add_availability",
  data?: Record<string, unknown>,
): Promise<T> {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key || !accessToken) throw new Error("Sessão profissional inválida. Entre novamente.");
  const response = await fetch(`${url.replace(/\/$/, "")}/functions/v1/professional-network-self`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      apikey: key,
      authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ operation, data: data ?? {} }),
  });
  const body = await response.json().catch(() => ({})) as Record<string, unknown>;
  if (!response.ok) {
    const code = typeof body["error"] === "string" ? body["error"] : "professional_operation_failed";
    const messages: Record<string, string> = {
      unauthorized: "Sessão profissional expirada. Entre novamente.",
      invalid_category: "Categoria profissional inválida.",
      slug_in_use: "Este endereço público já está em uso. Ajuste o nome do perfil.",
      profile_required: "Complete seu perfil antes de configurar a agenda.",
      invalid_service: "Serviço inválido para este perfil.",
      invalid_availability: "Disponibilidade inválida.",
    };
    throw new Error(messages[code] ?? "Não foi possível concluir esta operação profissional.");
  }
  return body as T;
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
  if (!process.env["SUPABASE_SERVICE_ROLE_KEY"]) {
    return professionalSelfEdge<any>(context.accessToken, "dashboard");
  }
  const { getProfessionalDashboard } = await import("@/lib/professional-network.server");
  return getProfessionalDashboard(context.userId, emailOf(context.claims));
});

export const professionalSaveOnboarding = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data: { step: number; countryCode?: string; currency?: "EUR"|"BRL"; displayName?: string; slug?: string; professionalTitle?: string; categoryId?: string; city?: string; languages?: string[]; onlineEnabled?: boolean; inPersonEnabled?: boolean; about?: string; experienceSummary?: string; educationSummary?: string; specialties?: string[] }) => data).handler(async ({ context, data }) => {
  if (!process.env["SUPABASE_SERVICE_ROLE_KEY"]) {
    return professionalSelfEdge<any>(context.accessToken, "save_onboarding", data as Record<string, unknown>);
  }
  const { saveProfessionalOnboarding } = await import("@/lib/professional-network.server");
  return saveProfessionalOnboarding(context.userId, emailOf(context.claims), data);
});

export const professionalAddAvailability = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data: { serviceId?: string | null; weekday: number; startTime: string; endTime: string; timezone: string; intervalMinutes?: number; bufferMinutes?: number; modality?: "online"|"in_person"|"both"; locationLabel?: string | null }) => data).handler(async ({ context, data }) => {
  if (!process.env["SUPABASE_SERVICE_ROLE_KEY"]) {
    return professionalSelfEdge<{ ok: true }>(context.accessToken, "add_availability", data as Record<string, unknown>);
  }
  const { addProfessionalAvailability } = await import("@/lib/professional-network.server");
  return addProfessionalAvailability(context.userId, emailOf(context.claims), data);
});

export const professionalSubscriptionCheckout = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data: { planId: string; sellerReferral?: string | null }) => data).handler(async ({ context, data }) => {
  const { createProfessionalSubscriptionCheckout } = await import("@/lib/professional-network.server");
  return createProfessionalSubscriptionCheckout(context.userId, emailOf(context.claims), data.planId, data.sellerReferral ?? null);
});

export const professionalConnectStatus = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { getProfessionalConnectStatus } = await import("@/lib/professional-connect.server");
  return getProfessionalConnectStatus(context.userId);
});

export const professionalConnectOnboarding = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { createProfessionalConnectOnboarding } = await import("@/lib/professional-connect.server");
  return createProfessionalConnectOnboarding(context.userId, emailOf(context.claims));
});

export const professionalConnectDashboard = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { createProfessionalConnectDashboardLink } = await import("@/lib/professional-connect.server");
  return createProfessionalConnectDashboardLink(context.userId);
});

export const marketplaceBookingCheckout = createServerFn({ method: "POST" }).inputValidator((data: { profileSlug: string; serviceId: string; startAt: string; customerName: string; customerEmail: string; timezone: string; modality: "online"|"in_person"; clientSource?: "social_clinic"|"professional_direct"|"ldr_generated" }) => data).handler(async ({ data }) => {
  const { createMarketplaceBookingCheckout } = await import("@/lib/professional-network.server");
  return createMarketplaceBookingCheckout(data);
});

import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const professionalNetworkAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { getProfessionalNetworkAdmin } = await import("@/lib/professional-network-admin.server");
    return getProfessionalNetworkAdmin(context.supabase, context.userId);
  });
export const professionalNetworkReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      profileId: string;
      action: "approve" | "pause" | "suspend" | "request_documents";
      identityVerified?: boolean;
      documentsVerified?: boolean;
      profileVerified?: boolean;
    }) => data,
  )
  .handler(async ({ context, data }) => {
    const { reviewProfessional } = await import("@/lib/professional-network-admin.server");
    return reviewProfessional(context.supabase, context.userId, data);
  });
export const professionalNetworkUpsert = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      profileId?: string;
      email?: string;
      displayName: string;
      professionalTitle: string;
      slug?: string;
      categoryId: string;
      countryCode: string;
      city?: string;
      languages?: string[];
      onlineEnabled?: boolean;
      inPersonEnabled?: boolean;
      engagementModel: "subscription" | "commission" | "exempt";
      commissionPercent?: number | null;
      publish?: boolean;
    }) => data,
  )
  .handler(async ({ context, data }) => {
    const { upsertProfessionalByAdmin } = await import("@/lib/professional-network-admin.server");
    return upsertProfessionalByAdmin(context.supabase, context.userId, data);
  });
export const professionalNetworkFinancialUpdate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      commissionPercent?: number;
      payoutFrequencyDays?: number;
      plans?: Array<{ id: string; amountCents: number }>;
    }) => data,
  )
  .handler(async ({ context, data }) => {
    const { updateNetworkFinancialConfig } =
      await import("@/lib/professional-network-admin.server");
    return updateNetworkFinancialConfig(context.supabase, context.userId, data);
  });
export const professionalNetworkPreparePayout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      professionalAccountId: string;
      periodStart: string;
      periodEnd: string;
      currency: "EUR" | "BRL";
      scheduledFor?: string | null;
    }) => data,
  )
  .handler(async ({ context, data }) => {
    const { prepareProfessionalPayout } = await import("@/lib/professional-network-admin.server");
    return prepareProfessionalPayout(context.supabase, context.userId, data);
  });

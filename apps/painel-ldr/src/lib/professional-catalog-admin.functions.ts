import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const professionalCatalogAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { getPendingCatalogServices } = await import("@/lib/professional-catalog-admin.server");
    return getPendingCatalogServices(context.supabase, context.userId);
  });

export const professionalCatalogAdminReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { serviceId: string; action: "approve" | "reject" }) => data)
  .handler(async ({ context, data }) => {
    const { reviewCatalogService } = await import("@/lib/professional-catalog-admin.server");
    return reviewCatalogService(context.supabase, context.userId, data);
  });

export const professionalCatalogAdminFeeCompliance = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { serviceId: string; status: "allowed" | "requires_review" | "restricted"; note?: string | null }) => data)
  .handler(async ({ context, data }) => {
    const { setProfessionalServiceFeeCompliance } = await import("@/lib/professional-catalog-admin.server");
    return setProfessionalServiceFeeCompliance(context.supabase, context.userId, data);
  });

export const professionalCatalogAdminPriceReference = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { referenceId: string; minAmountCents?: number | null; maxAmountCents?: number | null; notes?: string | null }) => data)
  .handler(async ({ context, data }) => {
    const { updateProfessionalPriceReference } = await import("@/lib/professional-catalog-admin.server");
    return updateProfessionalPriceReference(context.supabase, context.userId, data);
  });

export const professionalCatalogAdminServiceActive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { catalogServiceId: string; active: boolean }) => data)
  .handler(async ({ context, data }) => {
    const { setProfessionalCatalogServiceActive } = await import("@/lib/professional-catalog-admin.server");
    return setProfessionalCatalogServiceActive(context.supabase, context.userId, data);
  });

export const professionalCatalogAdminCategoryActive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { categoryId: string; active: boolean }) => data)
  .handler(async ({ context, data }) => {
    const { setProfessionalCategoryActive } = await import("@/lib/professional-catalog-admin.server");
    return setProfessionalCategoryActive(context.supabase, context.userId, data);
  });

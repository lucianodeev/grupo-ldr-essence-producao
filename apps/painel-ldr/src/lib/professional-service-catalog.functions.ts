import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const professionalServiceCatalogForMe = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { getProfessionalServiceCatalog } = await import("@/lib/professional-service-catalog.server");
    return getProfessionalServiceCatalog(context.userId);
  });

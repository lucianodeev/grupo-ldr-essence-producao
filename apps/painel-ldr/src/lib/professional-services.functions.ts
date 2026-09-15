import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type BillingUnit = "session" | "hour" | "30_min" | "project" | "vacancy" | "day" | "package" | "month" | "custom_quote";

export const professionalServiceSave = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: {
    id?: string | null;
    catalogKey?: string | null;
    name: string;
    description?: string | null;
    modality: "online" | "in_person" | "both";
    durationMinutes: number;
    currency: "EUR" | "BRL";
    priceCents: number;
    billingUnit?: BillingUnit;
    countryCodes?: string[];
    languageCodes?: string[];
    city?: string | null;
    publicLocation?: string | null;
    bookingEnabled?: boolean;
    quoteRequired?: boolean;
    availableForPrivate?: boolean;
    availableForCompany?: boolean;
  }) => data)
  .handler(async ({ context, data }) => {
    const { saveProfessionalService } = await import("@/lib/professional-services.server");
    return saveProfessionalService(context.userId, data);
  });

export const professionalServiceSetActive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; active: boolean }) => data)
  .handler(async ({ context, data }) => {
    const { setProfessionalServiceActive } = await import("@/lib/professional-services.server");
    return setProfessionalServiceActive(context.userId, data);
  });

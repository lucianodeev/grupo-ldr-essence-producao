import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const professionalAvailabilitySettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { getProfessionalAvailabilitySettings } = await import("@/lib/professional-availability.server");
    return getProfessionalAvailabilitySettings(context.userId);
  });

export const professionalAvailabilityAdd = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: {
    serviceId?: string | null;
    weekdays: number[];
    startTime: string;
    endTime: string;
    timezone: string;
    intervalMinutes?: number;
    bufferMinutes?: number;
    modality?: "online" | "in_person" | "both";
    locationLabel?: string | null;
  }) => data)
  .handler(async ({ context, data }) => {
    const { addProfessionalAvailabilityBlocks } = await import("@/lib/professional-availability.server");
    return addProfessionalAvailabilityBlocks(context.userId, data);
  });

export const professionalAvailabilityDisable = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { availabilityId: string }) => data)
  .handler(async ({ context, data }) => {
    const { disableProfessionalAvailability } = await import("@/lib/professional-availability.server");
    return disableProfessionalAvailability(context.userId, data.availabilityId);
  });

import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const socialClinicLanding = createServerFn({ method: "GET" }).handler(async () => {
  const { getSocialClinicLanding } = await import("@/lib/social-clinic.server");
  return getSocialClinicLanding();
});

export const socialClinicApply = createServerFn({ method: "POST" }).inputValidator((data: any) => data).handler(async ({ data }) => {
  const { submitSocialClinicPatient } = await import("@/lib/social-clinic.server");
  return submitSocialClinicPatient(data);
});

export const socialClinicProfessionalApply = createServerFn({ method: "POST" }).inputValidator((data: any) => data).handler(async ({ data }) => {
  const { submitSocialClinicProfessional } = await import("@/lib/social-clinic.server");
  return submitSocialClinicProfessional(data);
});

export const socialClinicAdmin = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { getSocialClinicAdmin } = await import("@/lib/social-clinic.server");
  return getSocialClinicAdmin(context.supabase, context.userId);
});

export const socialClinicAdminStatus = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data: any) => data).handler(async ({ context, data }) => {
  const { updateSocialClinicStatus } = await import("@/lib/social-clinic.server");
  return updateSocialClinicStatus(context.supabase, context.userId, data);
});

export const socialClinicAdminConfig = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data: any) => data).handler(async ({ context, data }) => {
  const { updateSocialClinicConfig } = await import("@/lib/social-clinic.server");
  return updateSocialClinicConfig(context.supabase, context.userId, data);
});

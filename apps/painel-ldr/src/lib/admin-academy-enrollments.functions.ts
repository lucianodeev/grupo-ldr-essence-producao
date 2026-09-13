import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const adminAcademyEnrollments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { getAdminAcademyEnrollments } = await import("@/lib/admin-academy-enrollments.server");
    return getAdminAcademyEnrollments(context.supabase, context.userId);
  });

export const adminAcademyEnrollmentSummary = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { getAdminAcademyEnrollmentSummary } = await import("@/lib/admin-academy-enrollments.server");
    return getAdminAcademyEnrollmentSummary(context.supabase, context.userId);
  });

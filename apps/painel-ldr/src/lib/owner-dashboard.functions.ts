import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const ownerDashboardSummary = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { getOwnerDashboardSummary } = await import("@/lib/owner-dashboard.server");
    return getOwnerDashboardSummary(context.supabase, context.userId);
  });

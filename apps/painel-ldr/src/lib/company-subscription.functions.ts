import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { CompanyPlanRegion, CompanyServiceKey } from "@/lib/company-plan-pricing";

function emailOf(claims: Record<string, unknown>): string | null {
  const value = claims["email"];
  return typeof value === "string" ? value : null;
}

export const companySubscriptionContext = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { getCompanySubscriptionContext } = await import("@/lib/company-subscription.server");
    return getCompanySubscriptionContext(context.userId);
  });

export const companySubscriptionCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: {
    planCode: "essential" | "pro" | "custom";
    region: CompanyPlanRegion;
    employees: number;
    services?: CompanyServiceKey[];
    extraCredits?: 0 | 5 | 10 | 25;
  }) => data)
  .handler(async ({ context, data }) => {
    const { createCompanySubscriptionCheckout } = await import("@/lib/company-subscription.server");
    return createCompanySubscriptionCheckout(context.userId, emailOf(context.claims), data);
  });

export const companySubscriptionCancel = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { cancelCompanySubscription } = await import("@/lib/company-subscription.server");
    return cancelCompanySubscription(context.userId, emailOf(context.claims));
  });

export const companySubscriptionResume = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { resumeCompanySubscription } = await import("@/lib/company-subscription.server");
    return resumeCompanySubscription(context.userId, emailOf(context.claims));
  });

import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

function emailOf(claims: Record<string, unknown>): string | null {
  const value = claims["email"];
  return typeof value === "string" ? value : null;
}

export const organizationContext = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { getOrganizationContext } = await import("@/lib/organization-portal.server");
  return getOrganizationContext(context.userId, emailOf(context.claims));
});

export const organizationCreate = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data: { name: string; country?: string | null; phone?: string | null; taxId?: string | null }) => data).handler(async ({ context, data }) => {
  const { createOrganization } = await import("@/lib/organization-portal.server");
  return createOrganization(context.userId, emailOf(context.claims), data);
});

export const organizationDashboard = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { getOrganizationDashboard } = await import("@/lib/organization-portal.server");
  return getOrganizationDashboard(context.userId);
});

export const organizationAddMember = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data: { fullName: string; email: string; department?: string | null; employeeCode?: string | null }) => data).handler(async ({ context, data }) => {
  const { addOrganizationMember } = await import("@/lib/organization-portal.server");
  return addOrganizationMember(context.userId, emailOf(context.claims), data);
});

export const organizationUpdateMember = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data: { memberId: string; phone?: string | null; birthDate?: string | null; vacationStart?: string | null; vacationEnd?: string | null; nextDayOff?: string | null }) => data).handler(async ({ context, data }) => {
  const { updateOrganizationMember } = await import("@/lib/organization-portal.server");
  return updateOrganizationMember(context.userId, emailOf(context.claims), data.memberId, data);
});

export const organizationSetMemberActive = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data: { memberId: string; active: boolean }) => data).handler(async ({ context, data }) => {
  const { setOrganizationMemberActive } = await import("@/lib/organization-portal.server");
  return setOrganizationMemberActive(context.userId, emailOf(context.claims), data.memberId, data.active);
});

export const organizationCheckout = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data: { catalogKey: string; memberIds: string[] }) => data).handler(async ({ context, data }) => {
  const { createOrganizationCheckout } = await import("@/lib/organization-portal.server");
  return createOrganizationCheckout(context.userId, emailOf(context.claims), data);
});

export const employeeContext = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { getEmployeeContext } = await import("@/lib/organization-portal.server");
  return getEmployeeContext(context.userId, emailOf(context.claims));
});

export const employeeRequestBenefit = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data: { benefitId: string }) => data).handler(async ({ context, data }) => {
  const { requestEmployeeBenefit } = await import("@/lib/organization-portal.server");
  return requestEmployeeBenefit(context.userId, emailOf(context.claims), data.benefitId);
});

import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

function emailOf(claims: Record<string, unknown>): string | null {
  const value = claims["email"];
  return typeof value === "string" ? value : null;
}

async function portalEdge<T>(
  accessToken: string | null | undefined,
  slug: "organization-self" | "employee-self",
  operation: string,
  data?: Record<string, unknown>,
): Promise<T> {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key || !accessToken) throw new Error("Sessão inválida. Entre novamente.");
  const response = await fetch(`${url.replace(/\/$/, "")}/functions/v1/${slug}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      apikey: key,
      authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ operation, data: data ?? {} }),
  });
  const body = await response.json().catch(() => ({})) as Record<string, unknown>;
  if (!response.ok) {
    const code = typeof body["error"] === "string" ? body["error"] : "portal_error";
    if (code === "organization_required") throw new Error("Área da empresa não configurada.");
    if (code === "member_exists") throw new Error("Este funcionário já está cadastrado nesta empresa.");
    if (code === "member_not_found") throw new Error("Funcionário não encontrado.");
    if (code === "invalid_member") throw new Error("Informe nome e e-mail válidos.");
    if (code === "benefit_unavailable") throw new Error("Este benefício não pode ser solicitado agora.");
    if (code === "employee_unavailable") throw new Error("Acesso de funcionário não disponível.");
    if (code === "employee_limit") {
      const limit = Number(body["limit"] ?? 0);
      throw new Error(`Seu plano atual permite até ${limit} funcionários.`);
    }
    throw new Error("Não foi possível concluir esta operação.");
  }
  return body as T;
}

export const organizationContext = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  if (!process.env["SUPABASE_SERVICE_ROLE_KEY"]) return portalEdge<any>(context.accessToken, "organization-self", "context");
  const { getOrganizationContext } = await import("@/lib/organization-portal.server");
  return getOrganizationContext(context.userId, emailOf(context.claims));
});

export const organizationCreate = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data: { name: string; country?: string | null; phone?: string | null; taxId?: string | null }) => data).handler(async ({ context, data }) => {
  if (!process.env["SUPABASE_SERVICE_ROLE_KEY"]) return portalEdge<any>(context.accessToken, "organization-self", "create", data as Record<string, unknown>);
  const { createOrganization } = await import("@/lib/organization-portal.server");
  return createOrganization(context.userId, emailOf(context.claims), data);
});

export const organizationDashboard = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  if (!process.env["SUPABASE_SERVICE_ROLE_KEY"]) return portalEdge<any>(context.accessToken, "organization-self", "dashboard");
  const { getOrganizationDashboard } = await import("@/lib/organization-portal.server");
  return getOrganizationDashboard(context.userId);
});

export const organizationAddMember = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data: { fullName: string; email: string; department?: string | null; employeeCode?: string | null }) => data).handler(async ({ context, data }) => {
  if (!process.env["SUPABASE_SERVICE_ROLE_KEY"]) return portalEdge<any>(context.accessToken, "organization-self", "add_member", data as Record<string, unknown>);
  const { addOrganizationMember } = await import("@/lib/organization-portal.server");
  return addOrganizationMember(context.userId, emailOf(context.claims), data);
});

export const organizationUpdateMember = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data: { memberId: string; phone?: string | null; birthDate?: string | null; vacationStart?: string | null; vacationEnd?: string | null; nextDayOff?: string | null }) => data).handler(async ({ context, data }) => {
  if (!process.env["SUPABASE_SERVICE_ROLE_KEY"]) return portalEdge<any>(context.accessToken, "organization-self", "update_member", data as Record<string, unknown>);
  const { updateOrganizationMember } = await import("@/lib/organization-portal.server");
  return updateOrganizationMember(context.userId, emailOf(context.claims), data.memberId, data);
});

export const organizationSetMemberActive = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data: { memberId: string; active: boolean }) => data).handler(async ({ context, data }) => {
  if (!process.env["SUPABASE_SERVICE_ROLE_KEY"]) return portalEdge<any>(context.accessToken, "organization-self", "set_member_active", data as Record<string, unknown>);
  const { setOrganizationMemberActive } = await import("@/lib/organization-portal.server");
  return setOrganizationMemberActive(context.userId, emailOf(context.claims), data.memberId, data.active);
});

export const organizationCheckout = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data: { catalogKey: string; memberIds: string[] }) => data).handler(async ({ context, data }) => {
  if (!process.env["SUPABASE_SERVICE_ROLE_KEY"] || !process.env["STRIPE_SECRET_KEY"]) {
    throw new Error("Pagamento corporativo temporariamente indisponível neste ambiente.");
  }
  const { createOrganizationCheckout } = await import("@/lib/organization-portal.server");
  return createOrganizationCheckout(context.userId, emailOf(context.claims), data);
});

export const employeeContext = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  if (!process.env["SUPABASE_SERVICE_ROLE_KEY"]) return portalEdge<any>(context.accessToken, "employee-self", "context");
  const { getEmployeeContext } = await import("@/lib/organization-portal.server");
  return getEmployeeContext(context.userId, emailOf(context.claims));
});

export const employeeRequestBenefit = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data: { benefitId: string }) => data).handler(async ({ context, data }) => {
  if (!process.env["SUPABASE_SERVICE_ROLE_KEY"]) return portalEdge<any>(context.accessToken, "employee-self", "request_benefit", data as Record<string, unknown>);
  const { requestEmployeeBenefit } = await import("@/lib/organization-portal.server");
  return requestEmployeeBenefit(context.userId, emailOf(context.claims), data.benefitId);
});

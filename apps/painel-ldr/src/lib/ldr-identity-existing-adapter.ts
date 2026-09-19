import { resolveLdrIdentity, type AcademicDisplayRole, type LdrIdentityContext } from "./ldr-identity.ts";

/**
 * Adapter boundary for the existing LDR account model.
 *
 * This module is intentionally read-only and dependency-injected. It does not
 * write, merge or migrate any account. Existing domain resolvers remain the
 * source of truth and can be wired here incrementally.
 */
export type ExistingIdentitySources = {
  resolveCustomer?: (authUserId: string, email: string | null) => Promise<{ id: string } | null>;
  resolveProfessional?: (authUserId: string) => Promise<{ accountId?: string | null; profileId?: string | null } | null>;
  resolveOrganizationMemberships?: (authUserId: string) => Promise<readonly string[]>;
  resolveEmployee?: (authUserId: string) => Promise<{ id: string } | null>;
  resolveAcademic?: (authUserId: string) => Promise<{ profileId: string; displayRole?: AcademicDisplayRole } | null>;
  resolveAdmin?: (authUserId: string, email: string | null) => Promise<{ isAdmin: boolean; isSuperadmin: boolean }>;
};

export async function resolveExistingLdrIdentity(
  authUserId: string,
  email: string | null,
  sources: ExistingIdentitySources,
): Promise<LdrIdentityContext> {
  if (!authUserId?.trim()) throw new Error("authUserId is required");

  const [customer, professional, organizationMembershipIds, employee, academic, admin] = await Promise.all([
    sources.resolveCustomer?.(authUserId, email) ?? Promise.resolve(null),
    sources.resolveProfessional?.(authUserId) ?? Promise.resolve(null),
    sources.resolveOrganizationMemberships?.(authUserId) ?? Promise.resolve([] as readonly string[]),
    sources.resolveEmployee?.(authUserId) ?? Promise.resolve(null),
    sources.resolveAcademic?.(authUserId) ?? Promise.resolve(null),
    sources.resolveAdmin?.(authUserId, email) ?? Promise.resolve({ isAdmin: false, isSuperadmin: false }),
  ]);

  return resolveLdrIdentity({
    authUserId,
    email,
    customerId: customer?.id ?? null,
    professionalAccountId: professional?.accountId ?? null,
    professionalProfileId: professional?.profileId ?? null,
    organizationMembershipIds,
    employeeRecordId: employee?.id ?? null,
    academicProfileId: academic?.profileId ?? null,
    academicDisplayRole: academic?.displayRole ?? null,
    existingAdmin: admin.isAdmin,
    existingSuperadmin: admin.isSuperadmin,
  });
}

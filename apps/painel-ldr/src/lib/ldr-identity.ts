export type LdrRole =
  | "customer"
  | "professional"
  | "organization_member"
  | "employee"
  | "academic_member"
  | "academic_student"
  | "academic_professor"
  | "academic_mentor"
  | "admin"
  | "superadmin";

export type AcademicDisplayRole = "member" | "student" | "professor" | "mentor" | null;

export type IdentitySignals = {
  authUserId: string;
  email?: string | null;
  customerId?: string | null;
  professionalAccountId?: string | null;
  professionalProfileId?: string | null;
  organizationMembershipIds?: readonly string[];
  employeeRecordId?: string | null;
  academicProfileId?: string | null;
  academicDisplayRole?: AcademicDisplayRole;
  existingAdmin?: boolean;
  existingSuperadmin?: boolean;
};

export type LdrIdentityContext = {
  authUserId: string;
  email: string | null;
  customerId: string | null;
  professionalAccountId: string | null;
  professionalProfileId: string | null;
  organizationMembershipIds: readonly string[];
  employeeRecordId: string | null;
  academicProfileId: string | null;
  academicDisplayRole: AcademicDisplayRole;
  roles: readonly LdrRole[];
  isAdmin: boolean;
  isSuperadmin: boolean;
};

const ACADEMIC_ROLE_MAP: Record<Exclude<AcademicDisplayRole, null>, LdrRole> = {
  member: "academic_member",
  student: "academic_student",
  professor: "academic_professor",
  mentor: "academic_mentor",
};

export function resolveLdrIdentity(signals: IdentitySignals): LdrIdentityContext {
  if (!signals.authUserId?.trim()) throw new Error("authUserId is required");

  const roles = new Set<LdrRole>();
  if (signals.customerId) roles.add("customer");
  if (signals.professionalAccountId || signals.professionalProfileId) roles.add("professional");
  if ((signals.organizationMembershipIds?.length ?? 0) > 0) roles.add("organization_member");
  if (signals.employeeRecordId) roles.add("employee");

  const academicRole = signals.academicDisplayRole ?? null;
  if (signals.academicProfileId) {
    roles.add("academic_member");
    if (academicRole) roles.add(ACADEMIC_ROLE_MAP[academicRole]);
  }

  // Privileged roles are accepted only from existing authoritative admin checks.
  // No other role, subscription or entitlement can infer them.
  if (signals.existingAdmin) roles.add("admin");
  if (signals.existingSuperadmin) {
    roles.add("superadmin");
    roles.add("admin");
  }

  return {
    authUserId: signals.authUserId,
    email: signals.email?.trim().toLowerCase() || null,
    customerId: signals.customerId ?? null,
    professionalAccountId: signals.professionalAccountId ?? null,
    professionalProfileId: signals.professionalProfileId ?? null,
    organizationMembershipIds: Object.freeze([...(signals.organizationMembershipIds ?? [])]),
    employeeRecordId: signals.employeeRecordId ?? null,
    academicProfileId: signals.academicProfileId ?? null,
    academicDisplayRole: academicRole,
    roles: Object.freeze([...roles]),
    isAdmin: roles.has("admin"),
    isSuperadmin: roles.has("superadmin"),
  };
}

# LDR ID — Canonical Identity & Roles Map

Status: DESIGN FOUNDATION / NO USER MIGRATION
Date: 2026-09-19

## Principle
One authenticated person may legitimately hold multiple LDR roles at the same time. Role is not identity, subscription, ownership, entitlement or permission.

## Canonical layers
1. AUTH IDENTITY — authoritative authenticated user id (auth_user_id).
2. DOMAIN LINKS — existing customer/professional/organization/academic records linked to that identity.
3. ROLES — descriptive memberships derived from verified domain links.
4. SUBSCRIPTIONS — commercial state, independent from roles.
5. ENTITLEMENTS — access decisions, independent from role naming.
6. PERMISSIONS — action authorization; privileged actions remain server-side.

## Canonical role vocabulary
- customer
- professional
- organization_member
- employee
- academic_member
- academic_student
- academic_professor
- academic_mentor
- admin
- superadmin

This vocabulary is additive. Existing source-specific role values remain authoritative in their domains.

## Resolution rules
- auth_user_id is the primary correlation key when present.
- Existing customer linking/resolution remains untouched.
- Existing professional account/profile remains untouched.
- Academic display_role does not automatically grant administrative permissions.
- A PASS subscription never makes a user admin, professional, employee or professor.
- Being a professional does not automatically grant PASS.
- Ownership and legacy enrollments remain entitlements, not roles.
- superadmin/admin authorization must continue to use existing privileged checks.
- Clinical information must never be copied into identity/role records.

## Multi-role examples
A single auth identity may resolve to:
- customer + academic_member;
- customer + professional;
- professional + academic_professor;
- customer + organization_member;
- superadmin + customer + professional.

No destructive role normalization is allowed.

## Proposed read model
LdrIdentityContext:
- authUserId
- email
- customerId?
- professionalAccountId?
- professionalProfileId?
- organizationMemberships[]
- academicProfileId?
- academicDisplayRole?
- roles[]
- isAdmin
- isSuperadmin

## Safety
This phase does not:
- alter Supabase Auth users;
- merge accounts;
- rewrite emails;
- create subscriptions;
- grant entitlements;
- change RLS;
- expose clinical data.

## Next
Implement a pure/read-only identity resolver contract first. Database adapters can be attached incrementally after tests verify that role resolution cannot escalate privileges.

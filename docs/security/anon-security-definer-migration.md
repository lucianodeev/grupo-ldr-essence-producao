# Anonymous SECURITY DEFINER RPC migration

This branch isolates the migration of browser-facing custom-token RPCs away from anonymous `SECURITY DEFINER` execution.

## Safety guardrails

- Do not revoke `anon EXECUTE` from an RPC until every repository caller and internal database dependency has been identified.
- Do not change production grants as part of discovery.
- Preserve login, seller, checkout, candidate, payment and training flows until a server-side replacement is implemented and tested.
- Prefer server-side/service-role endpoints or Supabase Auth for privileged operations.
- Re-run Supabase Security and Performance Advisors after each database DDL change.
- Migrate in small independently reversible groups.

## Current baseline — 2026-09-17

- 31 anonymous executable `SECURITY DEFINER` functions remain in the Supabase Security Advisor.
- 9 authenticated executable `SECURITY DEFINER` functions remain; authorization/RLS helpers must not be revoked without replacing their dependency path.
- No current RLS policy text directly references the 31 anonymous RPC names.
- Some anonymous RPCs have function-to-function references, so absence from frontend code alone is not sufficient evidence for revocation.
- `ldr_simple_logout(uuid)` has no direct match in the repository default-branch code search, but its grant remains unchanged until the complete caller/deployment path is verified.
- Unused indexes remain informational and are not part of this migration.

No production database permission is changed by this document.
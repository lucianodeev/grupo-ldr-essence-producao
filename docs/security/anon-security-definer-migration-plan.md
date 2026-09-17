# Anonymous SECURITY DEFINER RPC migration plan

Safety baseline for the isolated security branch.

- Preserve production grants during discovery.
- Do not revoke anonymous execution until repository callers and database dependencies are verified.
- Migrate login, seller, checkout, candidate, payment and training flows in small reversible groups.
- Prefer server-side/service-role endpoints or Supabase Auth for privileged operations.
- Re-run Supabase advisors after database DDL changes.

Current baseline (2026-09-17): 31 anonymous executable SECURITY DEFINER functions and 9 authenticated executable SECURITY DEFINER functions remain. No RLS policy text directly references the 31 anonymous RPC names. Some RPCs have function-to-function references. `ldr_simple_logout(uuid)` has no direct default-branch repository code-search match, but its grant remains unchanged pending full caller/deployment verification.

This file changes no production database permission.
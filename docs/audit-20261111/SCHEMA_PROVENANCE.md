# Supabase schema contract - 11 November 2026

The public production bundle `/assets/index-D3RAUj8j.js` on
`https://ldrecossistema.online` identifies project `sfrcsrzuoqdscflfuwik`.
`src/integrations/supabase/types.generated.ts` was obtained through the connected
Supabase type generator for that project. No rows were exported and no database
schema, authorization policy or production configuration was changed.

The previous repository contract (`2988c658`) contains legacy tables and RPCs
absent from this observed public project. The backend `SUPABASE_URL` on Render
could not be checked: both Render connector queries timed out and the browser
had no authenticated Render session. A different backend target remains possible.

`types.ts` therefore preserves the previous legacy-only table/RPC/enum contracts
and adds the observed schema. Observed definitions take precedence for overlapping
tables. This is an additive development contract, **not confirmation that the
legacy schema exists on the deployed backend**. Typecheck continues to expose
incompatible overlapping columns and enum values; no `any` fallback was added.

## Missing legacy tables in the observed public project

- `appointment_calendar_sync`
- `appointment_events`
- `appointments`
- `clinical_access_logs`
- `clinical_attachments`
- `clinical_record_versions`
- `clinical_records`

## Missing legacy functions

- `claim_calendar_sync`
- `client_request_appointment`
- `client_reschedule_appointment`
- `confirm_appointment_tx`
- `confirm_mentorship_session_tx`
- `release_calendar_sync`
- `save_clinical_record_tx`
- `sync_appointment_session`

The legacy `appointment_status` enum is also absent. Overlapping definitions
expose additional conflicts: agenda code expects `appointment_id` and
`confirmed_at` on mentorship sessions, while delivery workflows use enum values
not present in the observed `delivery_status` type. Do not rename statuses,
remove features, or widen these types to make checks pass without resolving the
intended backend schema and reviewing the existing migrations.

## Read-only security findings

Supabase advisors reported RLS enabled without policies on `academic_job_feed_links`,
`ldr_one_seat_assignments` and `ldr_pass_subscriptions`. This denies direct access
by default; it is not itself evidence that those tables are public.
They also flagged callable SECURITY DEFINER functions (`submit_ecosystem_contact`
and `is_superadmin`) and disabled leaked-password protection. Function definitions
were inspected via system catalogs only. The contact function validates consent,
a honeypot, lengths and language, but public exposure still needs an intentional
permissions/rate-limit review. No permissions were changed during this audit.

Advisor guidance:
- https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy
- https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable
- https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

## Release gate

Confirm the actual Render backend target using secret-safe metadata, compare its
schema with the intended migration chain, and test agenda/clinical integrations
in an isolated environment. Production schema changes need a separate reviewed
plan. This branch does not authorize or perform them.

# LDR ONE — production release gates (review only)

Verified 2026-09-28. This document is evidence, not authorization to merge, deploy production billing, or charge customers.

## Verified in isolated sandbox
- Draft PR #236 remains the working release vehicle; it is open, mergeable and still Draft.
- Current release-candidate branch is ahead of `main` and production has not been changed by this release work.
- LDR ONE sandbox unit checks are green on the release candidate; latest observed `sandbox-unit` check on commit `56099e02d5acf715cbd0833ab8589db6b142c387` completed successfully.
- Isolated Render service `srv-das6drvavr4c7397dflg` returned to normal mode and is live after one-shot tests.
- Private PostgreSQL login/session integration passed with rollback.
- Business seats passed against private PostgreSQL with rollback: seat limit, over-allocation denial and revocation.
- Entitlement gate fails closed when Business assignments exceed purchased seats.
- Real Stripe TEST signed lifecycle passed: incomplete -> incomplete_expired, no unpaid entitlement, signed terminal event persisted, Stripe customer and probe DB rows cleaned up.
- Authenticated Stripe TEST checkout previously passed: verified private login -> session-bound checkout -> pending scoped record -> TEST checkout expiration -> DB rollback.
- Server-only isolated portal adapter is covered by CI for authenticated access, terminal-subscription denial, CSRF-protected logout and secure cookie clearing.
- Session tests cover opaque tokens, short TTL, expiry, revocation and current verified customer membership.
- Production Supabase is not reused by the sandbox adapter.
- Permanent-database migration preparation is documented in `docs/ldr-pass/LDR-ONE-PERMANENT-DATABASE-MIGRATION-RUNBOOK-20260928.md`, including migration inputs, backup, restore rehearsal, cutover and rollback.

## Preview deployment status
- Exact candidate commit `56099e02d5acf715cbd0833ab8589db6b142c387` has a successful Netlify deploy preview for PR #236.
- The required Vercel preview is **not proven**. Both Vercel commit-status contexts fail before build with description `Account is blocked.`
- This is an account-level Vercel blocker, not evidence of an LDR ONE build failure. Other historical project previews were READY, but they are not the LDR ONE candidate and are not accepted as release evidence.
- Do not substitute the current production deployment on `main` for the required candidate preview.

## Security evidence scope
- CI evidence exists for secure cookies, CSRF-protected logout, session TTL/expiry/revocation and server-side entitlement denial.
- Existing approved real-environment evidence for login/session and entitlement/seat lifecycle is retained and was not rerun merely to reconfirm it.
- The current LDR ONE workflow does not provide a separately named release-candidate check for rate limiting or one-time password-recovery tokens. Those items must remain evidence-scoped to their previously approved tests or receive a targeted test before release if no durable evidence can be linked.

## Still required before production
1. **Vercel production-candidate preview** — unblock the Vercel account, obtain a READY preview for the exact LDR ONE branch HEAD, then run `scripts/ldr-one-production-candidate-smoke.mjs` against that URL.
2. **Production-candidate portal regression** — verify public/client/professional/company/library/clinic/career routes and authorization boundaries on that exact READY candidate; 401/403 is acceptable where expected and authentication must not be bypassed.
3. **Permanent persistence** — provision an approved durable non-expiring production database and execute the documented backup/restore rehearsal. The current free DB expires 2026-10-27.
4. **Production billing configuration** — only after explicit authorization: configure Stripe LIVE products/prices, live webhook secret and production environment variables. Never copy TEST identifiers into LIVE.
5. **Operations and compliance** — monitoring/alerting, support/refund/cancellation workflow, privacy/legal/tax review and verified production domain/callback configuration.
6. **Release procedure** — confirm rollback, review PR #236, remove Draft only after all blockers above pass, then merge/deploy under explicit production authorization.

## Go/no-go
NO-GO for customer charging today. Keep Stripe LIVE disabled, public checkout disabled, PR #236 Draft, and production services unchanged until the Vercel candidate preview/regression, permanent persistence, operational/compliance checks and explicit production authorization are complete.

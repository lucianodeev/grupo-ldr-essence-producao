# LDR ONE — production release gates (review only)

Verified 2026-09-28. This document is evidence, not authorization to merge, deploy production billing, or charge customers.

## Verified in isolated sandbox
- Draft PR #236 remains the working release vehicle; keep it Draft until all production gates pass.
- Current release-candidate branch is `feat/ldr-one-sandbox-entitlements-20260927`; production has not been changed by this release work.
- LDR ONE sandbox unit checks previously passed and are retained as evidence without unnecessary reruns.
- Isolated Render service `ldr-one-stripe-sandbox` (`srv-das6drvavr4c7397dflg`) is the release sandbox for LDR ONE. Vercel is not part of this release path.
- Render successfully deployed exact branch HEAD `c4bbc27248c58e780d55c7db98c5558ed2d83e54`; deploy `dep-dat8khc9v7es73av23tg` finished live on 2026-09-28.
- Render runtime logs confirm sandbox PostgreSQL configuration, event persistence READY and isolated TEST webhook listening, with no runtime errors observed after the deploy.
- Private PostgreSQL login/session integration passed with rollback.
- Business seats passed against private PostgreSQL with rollback: seat limit, over-allocation denial and revocation.
- Entitlement gate fails closed when Business assignments exceed purchased seats.
- Real Stripe TEST signed lifecycle passed: incomplete -> incomplete_expired, no unpaid entitlement, signed terminal event persisted, Stripe customer and probe DB rows cleaned up.
- Authenticated Stripe TEST checkout previously passed: verified private login -> session-bound checkout -> pending scoped record -> TEST checkout expiration -> DB rollback.
- Server-only isolated portal adapter is covered by CI for authenticated access, terminal-subscription denial, CSRF-protected logout and secure cookie clearing.
- Session tests cover opaque tokens, short TTL, expiry, revocation and current verified customer membership.
- Production Supabase is not reused by the sandbox adapter.
- Permanent-database migration preparation is documented in `docs/ldr-pass/LDR-ONE-PERMANENT-DATABASE-MIGRATION-RUNBOOK-20260928.md`, including migration inputs, backup, restore rehearsal, cutover and rollback.

## Render candidate status
- Exact candidate HEAD `c4bbc27248c58e780d55c7db98c5558ed2d83e54` is LIVE on the isolated Render sandbox.
- Build completed successfully and the service started normally.
- Runtime reports `LDR ONE SANDBOX DB CONFIG: configured-for-sandbox`, `LDR ONE SANDBOX EVENT PERSISTENCE READY` and `Isolated test webhook listening`.
- No runtime error entries were observed after the candidate deploy.
- The read-only external HTTP route smoke is not yet marked PASS because no qualifying request evidence has been captured for the candidate. Do not infer PASS from service-live status alone.

## Security evidence scope
- CI evidence exists for secure cookies, CSRF-protected logout, session TTL/expiry/revocation and server-side entitlement denial.
- Existing approved real-environment evidence for login/session and entitlement/seat lifecycle is retained and was not rerun merely to reconfirm it.
- The current LDR ONE workflow does not provide a separately named release-candidate check for rate limiting or one-time password-recovery tokens. Those items must remain evidence-scoped to their previously approved tests or receive a targeted test before release if no durable evidence can be linked.

## Still required before production
1. **Render candidate HTTP regression** — run read-only checks against the exact Render candidate for the intended public/client/professional/company/library/clinic/career routes where those routes are served by the candidate application. 401/403 is acceptable where expected; authentication must not be bypassed.
2. **Permanent persistence** — provision an approved durable non-expiring production database and execute the documented backup/restore rehearsal. The current free sandbox DB expires 2026-10-27.
3. **Production billing configuration** — only after explicit authorization: configure Stripe LIVE products/prices, live webhook secret and production environment variables. Never copy TEST identifiers into LIVE.
4. **Operations and compliance** — monitoring/alerting, support/refund/cancellation workflow, privacy/legal/tax review and verified production domain/callback configuration.
5. **Release procedure** — confirm rollback, review PR #236, remove Draft only after all blockers above pass, then merge/deploy under explicit production authorization.

## Go/no-go
NO-GO for customer charging today. Keep Stripe LIVE disabled, public checkout disabled, PR #236 Draft, and production services unchanged until the Render candidate regression, permanent persistence, operational/compliance checks and explicit production authorization are complete.

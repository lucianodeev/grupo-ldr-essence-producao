# LDR ONE — production release gates (review only)

Verified 2026-09-28. This document is evidence, not authorization to merge, deploy production billing, or charge customers.

## Verified in isolated sandbox
- Draft PR #236 remains the working release vehicle.
- LDR ONE sandbox unit checks run #170 succeeded at commit db7ead4b76516eacea2476e8c04b684d4bb6fd21.
- Isolated Render service srv-das6drvavr4c7397dflg returned to normal mode and is live after one-shot tests.
- Private PostgreSQL login/session integration passed with rollback.
- Business seats passed against private PostgreSQL with rollback: seat limit, over-allocation denial and revocation.
- Entitlement gate fails closed when Business assignments exceed purchased seats.
- Real Stripe TEST signed lifecycle passed: incomplete -> incomplete_expired, no unpaid entitlement, signed terminal event persisted, Stripe customer and probe DB rows cleaned up.
- Authenticated Stripe TEST checkout previously passed: verified private login -> session-bound checkout -> pending scoped record -> TEST checkout expiration -> DB rollback.
- Server-only isolated portal adapter is covered by CI for authenticated access, terminal-subscription denial, CSRF-protected logout and secure cookie clearing.
- Production Supabase is not reused by the sandbox adapter.

## Still required before production
1. **Permanent persistence** — replace the expiring free sandbox PostgreSQL with a durable production database and documented backup/restore. Current free DB expires 2026-10-27.
2. **Production-candidate portal regression** — smoke-test public/client/professional/company/library/clinic/career routes and authorization boundaries on the exact release candidate.
3. **Production billing configuration** — only after explicit authorization: configure Stripe LIVE products/prices, live webhook secret and production environment variables. Never copy TEST identifiers into LIVE.
4. **Operations and compliance** — monitoring/alerting, support/refund/cancellation workflow, privacy/legal/tax review and verified production domain/callback configuration.
5. **Release procedure** — confirm rollback, review PR #236, remove Draft only after all blockers above pass, then merge/deploy under explicit production authorization.

## External CI status note
The LDR ONE-specific GitHub workflow is green. Repository-wide deployment contexts can fail or remain pending independently (for example blocked Vercel preview contexts); those are not treated as LDR ONE test success and must be resolved/reviewed before release.

## Go/no-go
NO-GO for customer charging today. Keep Stripe LIVE disabled, public checkout disabled, PR #236 Draft, and production services unchanged until permanent persistence, production-candidate regression, operational/compliance checks, and explicit production authorization are complete.

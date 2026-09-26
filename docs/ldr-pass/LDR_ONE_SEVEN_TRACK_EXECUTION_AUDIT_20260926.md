# LDR ONE — Seven-track execution audit (2026-09-26)

Status: **NOT READY FOR LIVE SALES**. This is an execution record, not a launch authorization.

## 1. Payment security
- Confirmed in shared webhook: `markEvent` inserts the event ID before handlers finish; duplicates are immediately acknowledged HTTP 200. A transient downstream failure attempts best-effort deletion of the event marker in the catch block, but that cleanup can fail and concurrent duplicate delivery can be acknowledged before the first handler completes. Shared-product transactional claim/retry design and regression tests remain required.
- Offline `ldr-one-event-ordering.ts` exists but is not wired to webhook; equal-second Stripe events require authoritative reconciliation, not arbitrary ID sorting.

## 2. Stripe end-to-end
- Existing catalog has four staged EUR price IDs; source launch flag is `false`.
- Stripe test-mode checkout, payment success/delay/failure, renewals, cancellation, duplicate/out-of-order events and real signed webhook delivery have not been evidenced by this audit. Do not assert they pass.

## 3. Business database
- READ-ONLY Supabase schema query on project `sfrcsrzuoqdscflfuwik` verified: `public.ldr_pass_subscriptions` and `public.stripe_webhook_events` exist; the intended staged table `public.ldr_one_seat_allocations` has **not yet been checked** by this audit; the earlier query used the wrong table name and cannot establish migration status.
- `stripe_webhook_events` has only `event_id`, `event_type`, `created_at`; no persisted processing state or completion timestamp.
- Keep staged allocation SQL uninstalled until isolated real PostgreSQL concurrency testing, permission review, backup/rollback and separate production authorization. Never use the unrelated Human Room project.

## 4. Portals
- Source policies and tests cover customer checkout guards and business reader gating. Full browser QA for sign-up, customer login, business invitation, allocation, revocation, mobile views, and approved content is not yet evidenced.

## 5. Catalog and legal
- Confirm exact digital catalog eligible for individual/business access, business minimum 5 seats, cancellation/renewal disclosure, local consumer terms and support process. Prices in code are not proof that Stripe live products are activated.

## 6. CI and publication
- For commit `bf08b135d04a610bc7d99bafc2df5e6324a04e79`, GitHub Actions showed entitlement, business-policy tests, full regression, typecheck gate and Render build steps **successful**, while workflow finalization was still in progress when checked. Academy workflow on same commit completed successfully.
- Recheck **latest** commit and all required workflow conclusions after any further changes. Passing a build does not establish production readiness. No production deployment performed.

## 7. Controlled launch
- Separate explicit go-live authorization is required for database migration, live Stripe checkout and production deployment. Before authorization: verified backup and rollback, isolated PostgreSQL concurrency test, Stripe test-mode complete sale, cross-product webhook regression, real portal QA, catalog/terms review, production configuration check.
- No new billable services, plan upgrades or real payments authorized by this audit.

## Current blocking dependency order
1. Fix shared webhook replay safely without regressing other products and implement atomic state ordering/reconciliation.
2. Validate real Stripe test-mode events and isolated PostgreSQL seat concurrency.
3. Review and authorize staged database migration; then verify employee reader and customer portal end-to-end.
4. Confirm catalog, terms, production environment, domains and support.
5. Re-run full CI; request separate authorization for go-live and controlled live purchase.

# LDR ONE — Release gates (no additional cost)

Status: **NOT RELEASED**. This is a checklist, not authorization to deploy or charge.

## Hard constraints
- Do not create a new billable Supabase project or upgrade a plan.
- Do not apply staged SQL to the production database without separate approval, a verified backup, and a maintenance/rollback plan.
- Do not activate live Stripe prices, checkout, subscription enrollment, or `LDR_ONE_LAUNCH_ENABLED` without separate launch authorization.
- Keep `LDR_ONE_BUSINESS_READER_ENABLED` disabled until the allocation table and RPC permissions have been independently verified.
- Keep the unrelated Human Room Supabase project isolated.

## Automated checks
- GitHub LDR ONE validation: entitlement, allocation eligibility, serialized in-memory contention simulation, SQL security contract, launch safety gates, existing regression suite, scoped TypeScript gate and Render build.
- The in-memory contention simulation is not a real PostgreSQL concurrent transaction test.
- Do not claim database-level concurrency is validated until it is tested in an isolated PostgreSQL instance using actual concurrent transactions.

## Before any database migration
1. Confirm zero-cost isolated PostgreSQL testing is possible with already available infrastructure. If not, leave migration staged and uninstalled.
2. Confirm target project and database environment explicitly; never substitute production or Human Room for staging.
3. Verify schema prerequisites with `apps/painel-ldr/supabase/staged/ldr_one_business_seat_preflight_READ_ONLY.sql`.
4. Review SQL grants and security-definer permissions; test parent-row locking and concurrent seat allocations with real PostgreSQL transactions.
5. Prepare verified backup and rollback, obtain explicit authorization before any production change.

## Before enabling paid subscriptions
1. Confirm Stripe test-mode checkout and webhook lifecycle: success, delayed payment, failed renewal, canceled/expired subscription, duplicate/reordered webhooks, idempotency, and current_period_end propagation.
2. Validate authenticated customer-to-employee authorization and email confirmation; do not infer eligibility from email address alone.
3. Confirm approved digital catalog, minimum five business seats, subscription periods, revocation, and support messaging.
4. Verify customer-facing checkout URLs, pricing, and consent; obtain explicit launch authorization.
5. Enable business reader only after migration and permission checks; enable launch only after all required gates pass.

## Current known state
- Source and CI validation can run without purchasing another project.
- Staged SQL is review-only and has not been installed by this work.
- Production data and live payments are outside the scope of this checklist.

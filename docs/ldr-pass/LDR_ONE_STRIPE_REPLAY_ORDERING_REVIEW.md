# LDR ONE — Stripe webhook replay and ordering review (release blocker)

Status: **review only; NOT implemented or production-tested**. Do not enable live subscriptions on the strength of source CI alone.

## Observed shared webhook behavior
- The shared `markEvent` inserts a Stripe event ID into `stripe_webhook_events` **before** the subscription handler finishes.
- On a duplicate event ID it returns `duplicate`. If processing fails after insertion, a Stripe retry can be treated as a duplicate rather than retrying the failed update. Confirm the route's actual duplicate handling before changing shared code.
- Subscription status updates do not currently enforce event-created ordering. An older event delivered after a newer cancellation or failed payment could overwrite the newer state.
- The shared webhook also handles other ecosystem products. A broad change requires regression tests for every existing product route.

## Required isolated design before launch
1. Define durable per-event processing states (received / processing / completed / failed), retry behavior and lease recovery for abandoned processing; use a transaction or equivalent atomic operation for claim/complete where possible.
2. Define a per-subscription monotonic Stripe event timestamp or authoritative Stripe subscription reconciliation. Test duplicate IDs, transient database failure after event claim, concurrent delivery, and reversed delivery order.
3. Verify handling of subscription period end for paid renewals with test-mode Stripe fixtures, including multi-line invoices and missing line subscription references. Never extend an employee's access from unrelated invoice periods.
4. Exercise a real isolated PostgreSQL instance and Stripe **test mode**; no new billable infrastructure or production migration without separate approval.
5. Keep `LDR_ONE_LAUNCH_ENABLED` and `LDR_ONE_BUSINESS_READER_ENABLED` disabled until all gates are independently verified.

## Existing scope
This review intentionally does not change the shared webhook's processing behavior, migrate any table, create a Stripe price, or activate a checkout.

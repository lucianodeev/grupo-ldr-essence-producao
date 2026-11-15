# Mentoria individual — controlled checkout release

## Scope

The first release is `mentoria_sessao`: one session, currently EUR 75 in the live service catalogue. Price and session entitlement remain server-controlled. The other session services retain assisted contracting until explicitly released.

`INDIVIDUAL_SERVICE_CHECKOUT_ENABLED` remains the master gate. With that gate and the agenda enabled, an absent `INDIVIDUAL_SERVICE_CHECKOUT_CATALOG_KEYS` defaults to `mentoria_sessao`. An explicit empty value releases nothing; comma-separated known catalogue keys allow later reviewed additions. The server checks this list before any order or Stripe write, and the purchase page consumes the same list. Missing lists in older cached catalogue responses fail closed.

No migration, production data write, payment, credential replacement, merge, deployment or environment-variable change was performed for this PR.

## Existing payment and scheduling flow

Checkout creates an owner-linked pending order and an idempotent hosted Stripe session. It never grants a credit or marks the order paid. A verified signed webhook checks session, customer, service, currency and amount. The existing paid-order database trigger grants one credit for `single_paid_session`, with a unique order reference. Scheduling still requires the paid order and its credit; staff confirms the request before the calendar event/Meet link is released. Opening the payment return page is not proof of payment.

## External checks (read-only, 2026-11-14)

- The live catalogue identifies the individual mentorship at EUR 75.
- The Ecossistema Stripe webhook is enabled and subscribes to checkout completion, asynchronous success/failure, expiry and refunds.
- The live paid-order credit trigger exists and grants a single-session entitlement only for paid orders.
- The normal calendar now uses the private Atendimentos calendar owned by the authorized Google account; the technical test calendar remains separate. The earlier seven-group real calendar test passed and cleaned its event.

## Validation and remaining gates

- 22 synthetic checkout, catalogue, authorization, ownership and rendered purchase-page tests passed.
- 25 synthetic signed-webhook and calendar-saga tests passed, including delayed payment of the EUR 75 mentorship, duplicate events, refunds and safe calendar retries.
- TypeScript and the Render build must pass on the PR head.
- These checks are not a real Stripe payment or a complete paid client booking. This session's Stripe connector exposes the live account only. Do not inject a fake paid order into production or charge a card to create test entitlement.

After approval and review: publish this change, keep credentials unchanged, set `INDIVIDUAL_SERVICE_CHECKOUT_CATALOG_KEYS=mentoria_sessao`, and enable the master checkout gate only after the isolated Stripe payment/credit/scheduling acceptance test has been completed with authorized sandbox access. Confirm the single-session purchase action, EUR 75 checkout, exactly one credit after signed payment confirmation, request/confirmation/Meet, cancellation and restored availability. Other services must keep assisted contracting. Restore `INDIVIDUAL_SERVICE_CHECKOUT_ENABLED=false` if acceptance fails; do not remove orders or financial history.

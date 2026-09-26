# LDR ONE — Stripe sandbox execution runbook

Status: PREPARED, not executed against Stripe. On 2026-09-26 the connected Stripe account list returned **only live mode** for LUCIANO RODRIGUES ALMEIDA; no test/sandbox context is available to this connection. Never call live-mode writes to simulate payments.

## Before tests
1. Connect or expose the Stripe test/sandbox account in the existing Stripe connection; confirm the account name and `livemode=false` before any write.
2. Use separate test price IDs and `sk_test_` credentials, not the four live price IDs in `ldr-one.catalog.ts`. Do not commit secrets.
3. Deploy only to an authorized isolated test endpoint, with a test signing secret and test database. Do not point test webhooks at production.
4. Run test checkout for individual monthly/annual and business monthly/annual (minimum five seats); verify no live charge.
5. Replay signed duplicate deliveries, simulate transient failure, out-of-order subscription and invoice events, asynchronous payment success/failure, cancellation, failed renewal and expired session. Inspect persisted state and customer entitlements after every case.
6. Require a passing cross-product regression suite before changing the shared webhook; confirm no regression for company, editorial, library, professional, marketplace or seller flows.

STOP if no test Stripe context, isolated endpoint or isolated database is available. The current account connection alone cannot establish end-to-end test success.

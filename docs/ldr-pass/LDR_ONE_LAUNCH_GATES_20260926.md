# LDR ONE — blocking launch checks (2026-09-26)

Status: **NOT CLEARED FOR LAUNCH**. Keep `LDR_ONE_LAUNCH_ENABLED = false` until the checks below have executable evidence and explicit release approval.

## Confirmed in code
- Checkout requires authenticated client, trusted HTTPS `CLIENT_PANEL_URL`, an active launch flag, configured Stripe/Supabase server secrets, and validates audience, billing cycle and seat count.
- Checkout records a pending local subscription before Stripe session creation. Stripe idempotency uses the local subscription ID; a recent pending record blocks repeat requests for 30 minutes.
- Stripe webhook recognizes synchronous and asynchronous checkout outcomes for LDR PASS / LDR ONE.
- The pure `resolveLdrOneEntitlement` function supports approved digital resources while excluding human services.

## Blocking integration gaps (not solved by green CI)
1. **Protected reader not integrated with LDR ONE:** `src/lib/digital-content.server.ts` currently grants non-owner access from paid `orders` only. It does not call `resolveLdrOneEntitlement` or query active LDR ONE subscriptions. Do not enable checkout while subscribers would be denied their purchased digital content.
2. **Business seat assignment:** the `ldr_one_seats` field is only a purchased quantity. Verify server-side mapping from each named employee to a specific active business subscription, maximum assigned seats, removal/reassignment, and immediate revocation on cancellation. Never infer employee access from a shared company email or customer ID.
3. **Approved digital catalog:** establish an explicit, versioned list of subscription-eligible product keys and exclusions before granting reader access; do not equate all digital items with eligible items by default.
4. **Webhook reconciliation:** verify signed Stripe events, event deduplication, out-of-order delivery, late async payment, cancellation, renewal, refund, and subscription metadata fallback using Stripe test mode. Confirm the local row and Stripe subscription cannot be mismatched.
5. **Checkout concurrency:** the recent-pending query is not an atomic uniqueness guarantee. Test simultaneous requests and add a database-backed lock/unique invariant or equivalent before production.
6. **Return URLs:** verify `CLIENT_PANEL_URL` is the intended public HTTPS client origin, and confirm success/cancel routes exist and handle untrusted query parameters safely.
7. **Regression:** run the required focused entitlement tests, existing application regression suite, critical typecheck and Render build after final fixes. Global legacy TypeScript diagnostics are not equivalent to a clean full-project typecheck.
8. **Operational:** verified backup, staged migration/schema reconciliation, Stripe test product/price IDs and webhook endpoint, support/refund process, rollback and explicit approval.

## Test scenarios required
- Individual monthly/annual: paid grants only eligible content; unpaid, canceled, expired and refunded do not; existing lifetime purchases remain available.
- Business: 5-seat minimum, cap enforcement, distinct employees, exhausted seats, reassignment, downgrade and cancellation.
- Stripe: retry same checkout, two simultaneous requests, delayed payment success/failure, duplicate webhook, events out of order and partial database failure.
- Multilingual reader: Portuguese, English, French and Spanish; fallback behavior and missing catalog item.
- Security: unauthenticated request, another customer's ID, expired access, forged webhook, invalid redirect origin.

This checklist documents remaining work; it is not evidence that these scenarios have passed.

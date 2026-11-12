# LDR ONE Business — authenticated checkout next gate (2026-11-12)

## Executed safely
- Existing private-session unit test in `scripts/ldr-one-sandbox-session-checkout.test.mjs` extended from Individual to **Business monthly, 5 seats**.
- Verified server-authenticated account mapping, `line_items[0][quantity]=5`, Business metadata `seats=5`, `plan=business`, `client_reference_id` resolved from authenticated identity, and Stripe TEST checkout URL validation. Uses mocked Stripe only.
- Verified rejection of invalid Business seat quantities 0–4 and 10001, without posting to Stripe and without inserting a subscription row.
- Verified unauthenticated and forged customer-identity requests are rejected.
- GitHub Actions workflow `LDR ONE sandbox unit checks` run **43215973868**, for commit `c7c14eaec724961536bbc9525d28c2156d4d7247`: completed **success**.
- Neon Free isolated project `cool-wave-53666235`, database `ldr_one_sandbox_db`: applied existing reviewed, additive SQL files for `ldr_one_sandbox_customer_members`, `ldr_one_sandbox_invited_users`, and `ldr_one_sandbox_sessions`, plus ENABLE ROW LEVEL SECURITY on each. Zero policies. Verified **0 member records, 0 invited users, 0 sessions**.
- Configured four **Stripe TEST** price IDs on Render legacy sandbox `srv-das6drvavr4c7397dflg` using existing variables, without removing other env values: Business monthly `price_1UKEZQKlx2LyNGeB97DEKLBT`, annual `price_1UKEZbKlx2LyNGeBMKPEz7ui`; Individual monthly `price_1UKEZAKlx2LyNGeB4UMgHaXA`, annual `price_1UKEZPKlx2LyNGeBaeMQxQxc`. Retrieved and confirmed all were active, EUR, and `livemode=false`.

## What is NOT yet homologated
- The authenticated checkout handler is **server-only and not mounted as a real portal route**. The successful unit tests inject a mocked Stripe client; they are not proof of an authenticated browser → live Stripe TEST checkout.
- `LDR_ONE_STRIPE_TEST_SECRET_KEY` is not readable through connected Render tools and cannot be verified present. Never supply secret values in chat or the repo. Checkout remains fail-closed without a valid `sk_test` configured directly in the Render sandbox.
- A test card purchase and a frontend self-service subscription, entitlement and billing UI have not been verified from the real portal. Do not publish to production on this basis.
- The signed Stripe TEST webhook itself has already passed real tests in isolated Render receiver `srv-dbqpb3mi0phs73dc5egg` + Neon, including trialing activation for five seats and revocation; those tests do not substitute for authenticated web checkout.

## Remaining controlled integration
1. Configure/verify a `sk_test_...` secret directly in legacy Render sandbox (not by sharing it in chat).
2. Mount an explicitly isolated login and checkout adapter with reliable session/CSRF protections in a review branch; do not use production auth and never expose privileged DB URLs.
3. End-to-end browser checkout using Stripe TEST card and five sandbox users, then cancel and validate events/rights.
4. Commercial/fiscal LIVE work and production merge/deploy require separate approval.

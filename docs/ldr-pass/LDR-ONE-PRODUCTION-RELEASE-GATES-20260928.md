# LDR ONE — production release gates (review only)

Verified 2026-09-28. This document is not authorization to merge or deploy unfinished payment features.

## Verified
- Draft PR #236 head ee1c14e0c107800e0d391c91fbb7f5aa502af796. Sandbox unit run #131 succeeded.
- Isolated Render receiver srv-das6drvavr4c7397dflg latest deployed cebe445c2865b794c493324f455563b2ca145e1b, live.
- Existing Vercel painel-ldr production deployment on main at 49c5d2b64bb9eb3e80dc6d6d30bd90fdbd069a11 is READY; separate from PR #236.
- Stripe TEST customer and subscription created/canceled and signed subscription events reached isolated receiver; disposable probe intentionally did not grant access.

## Independent workstreams
1. Portal inventory and route smoke tests: public landing, client, professional, enterprise, library, clinic and career. Check Google OAuth callback domains and prohibit master/admin exposure.
2. Dedicated sandbox auth: review invite-only schema, rate limiting, secure session issuance, CSRF, password reset, email verification and isolation; test first invited user. Do not enable incomplete local auth.
3. Individual checkout: verified identity -> pending record -> Stripe TEST -> signed webhook -> scoped active entitlement -> cancellation/revocation. No redirect-based access.
4. Business checkout: min five seats, seat roster ownership and revocation, test monthly/annual pricing and no cross-company access.
5. Production operations: secrets and isolated live billing setup only after complete end-to-end sandbox evidence, backups, monitoring, rollback, legal/privacy review, verified domain ownership.

## Release blockers
- No verified end-to-end real user login/session and isolated identity directory.
- No verified full checkout-to-entitlement-to-revocation sequence for Individual and Business.
- No verified production live Stripe credentials, live webhook, payment tax/legal review or customer support workflow.
- No full cross-portal route and authorization regression report on the actual production candidate.
- Existing sandbox private PostgreSQL free plan expires 2026-10-27; do not use as production persistence.

## Go/no-go
No PR merge, production credential changes, public checkout enablement or customer charging until all blockers are resolved and a rollback-tested candidate is approved. Keep PR #236 draft and all existing production services unchanged meanwhile.

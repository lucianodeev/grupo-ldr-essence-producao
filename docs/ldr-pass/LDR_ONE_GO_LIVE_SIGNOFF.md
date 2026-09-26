# LDR ONE — Go-live authorization gate

Current decision: **NO DEPLOY / NO LIVE CHECKOUT / NO PRODUCTION MIGRATION**. Preparation only; no paid service purchase.

## Evidence required before requesting approval
- [ ] Transactional shared-webhook replay/recovery and subscription ordering or Stripe authoritative reconciliation implemented; cross-product regressions passed.
- [ ] Stripe sandbox context confirmed `livemode=false`; signed end-to-end subscription scenarios passed.
- [ ] Isolated PostgreSQL real concurrent seat-allocation and security tests passed.
- [ ] Verified production backup, restore procedure, rollback SQL and reviewed production migration.
- [ ] Browser QA: sign-up, login, individual checkout return, business invite and acceptance, course/eBook access, cancellation and mobile usability.
- [ ] Catalog scope, prices, taxes/consumer terms, renewal/cancellation notices and support contact approved.
- [ ] Latest PR CI, application build, domain, callback URLs, Stripe webhook endpoint, secrets and monitoring reviewed.

## Separate approvals
1. Production DB migration approval (exact project, backup and maintenance window).
2. Production deployment approval (exact service and release SHA).
3. Live Stripe enablement and one controlled real purchase approval (charges and standard processor fees may apply).

Existing Render service is on free plan, deployed from `main`; PR branch changes are not production changes. Never merge the PR as a substitute for these approvals.

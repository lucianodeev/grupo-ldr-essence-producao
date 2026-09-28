# LDR ONE — Sandbox entitlement compatibility and checkout gate

Status: DISCOVERY / NOT DEPLOYED (2026-09-27)

## Verified
- GitHub Actions sandbox preflight #13 succeeded; Stripe read-only API verified four active, recurring EUR test prices: Individual monthly 3990 cents, annual 39900; Business monthly 1990 per seat, annual 19900.
- `src/routes/ldr-pass.tsx` is a presentation/calculator page; paid plans deliberately show “Contratação em preparação” and do not launch checkout.
- Existing `src/routes/api/stripe/webhook.ts` handles other Stripe payment and subscription types; do not assume it grants LDR ONE access.
- Existing `src/lib/library-subscription.server.ts` grants catalog-specific access through Library subscription records and tagged orders; preserve independent purchases.
- Existing `src/lib/editorial-subscription.server.ts` maintains separate editorial subscription access and checkout.
- Existing `docs/ldr-pass/SOURCE_OF_TRUTH.md` requires additive server-side entitlement enforcement, feature flags and reversible migration.

## Compatibility matrix (initial)
| Source | Current authority | LDR ONE behavior | Gate |
|---|---|---|---|
| Free/public resources | Existing public eligibility | Preserve free access | Never paywall |
| Standalone/lifetime purchase | Existing paid order/ownership | Preserve regardless of ONE state | No revocation |
| Library recurring | library_subscriptions + existing access checks | Preserve independently; mapping TBD | No implicit migration |
| Editorial recurring | editorial_subscriptions | Preserve independently | No implicit migration |
| Individual ONE | Not implemented | Proposed separate subscription + server-side entitlements | Sandbox only |
| Business ONE | Not implemented | Proposed seat-count subscription and explicit member assignments, minimum five | Sandbox only |
| Professional/human services | Existing service-specific eligibility | Not unlimited; credits separate | Do not grant by digital subscription |
| Administrative access | Existing admin checks | Preserve separately | No role escalation |

## Next engineering checkpoints
1. Inventory protected digital routes and their existing access helpers; define approved eligible ONE catalog, including exclusions.
2. Specify additive ONE subscription and seat-assignment persistence and event idempotency; do not reuse Library rows or paid orders as a shortcut.
3. Implement server-side entitlement resolver that aggregates free, owned, Library, editorial and ONE without weakening existing checks.
4. Add sandbox-only checkout behind disabled-by-default feature flag, using only `sk_test_` and the four validated test prices; never put secrets in frontend code.
5. Extend the existing authoritative webhook to route ONE events safely; verify signatures, paid status, subscription ownership, renewal, failure, cancellation and duplicate delivery.
6. Test Individual monthly/annual and Business monthly/annual with minimum five seats, unauthorized access and rollback; verify no live charges.
7. Only after passing tests, review preview and separately approve production release.

## Safety
No production checkout, live keys, production billing migration, new paid customer charges or entitlement changes are authorized by this document. Sandbox preflight validates Stripe prices, not end-to-end checkout or provisioning.

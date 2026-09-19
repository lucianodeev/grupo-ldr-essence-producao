# LDR PASS — Source of Truth

Status: FOUNDATION / DISCOVERY
Date: 2026-09-19

## Mission
Introduce LDR PASS as an additive entitlement and subscription layer over the existing ecosystem. Do not replace working authentication, Stripe, Supabase, Library, Academy, Rede Academica, Career, Human Room, clinical flows, or B2B flows without verified need.

## Verified current architecture
- Monorepo; primary full-stack application: apps/painel-ldr.
- Existing Stripe webhook: /api/stripe/webhook.
- Stripe webhook is the payment-event source of truth.
- Existing persisted Stripe webhook idempotency support.
- Existing Library recurring subscription flow.
- Existing standalone/lifetime purchase flows.
- Existing independent editorial subscription flow.
- Existing access checks already distinguish active Library subscription and owned digital access.
- Some formations are explicitly outside the current Library subscription.

## Non-negotiable invariants
1. No production billing migration during foundation work.
2. Existing customers keep their current access.
3. Standalone purchases remain valid.
4. Free products remain free unless separately approved.
5. Human services are not made unlimited by default.
6. Clinical data stays separated from employer/company visibility.
7. Existing Stripe webhook remains authoritative.
8. New authorization must be enforced server-side, not only in UI.
9. Migrations should be additive and reversible.
10. Feature flags / kill switches are required before rollout.

## Access model
Keep these concepts separate:
- identity: who the account belongs to
- role: student/professional/company/admin/etc.
- ownership: individually purchased assets
- subscription: recurring commercial relationship
- entitlement: effective right to access a resource
- credits: spendable benefit balance, only after unit-economics validation
- permission: technical authorization to perform an action

## Current entitlement sources to preserve
- Free/public eligibility
- Owned/lifetime digital access
- Active Library subscription
- Independent editorial subscription
- Professional/service-specific eligibility
- Administrative/master access where already supported

## Migration principle
The initial LDR PASS engine must aggregate existing access sources rather than rewrite them. Library subscribers will later receive mapped PASS entitlements only after pricing, catalog and migration rules are approved.

## Implementation order
1. Inventory current access checks and catalog.
2. Define canonical entitlement contract.
3. Add read-only entitlement resolver compatible with legacy access.
4. Add automated tests.
5. Validate unit economics and PASS catalog.
6. Only then add PASS billing products.
7. Credits come after economic validation.
8. Add Meu LDR dashboard.
9. Integrate ecosystem modules progressively.
10. Roll out behind feature flags.

## Safety / rollback
Planned flags:
- LDR_PASS_ENABLED
- LDR_ENTITLEMENTS_ENABLED
- LDR_CREDITS_ENABLED
- LDR_UNIFIED_DASHBOARD_ENABLED

Turning a new flag off must leave legacy flows operational.

## Execution states
PLANNED -> IMPLEMENTED_IN_BRANCH -> TESTED -> PREVIEW_VALIDATED -> MERGED -> DEPLOY_READY -> PRODUCTION_VALIDATED

Never claim a later state without evidence.

## Next technical task
Inventory all current server-side access helpers, subscription tables, ownership checks, product keys and protected routes. Produce the first entitlement compatibility matrix before adding database schema or changing billing.

# LDR PASS — Legacy Entitlement Compatibility Matrix

Status: VERIFIED FROM DEFAULT-BRANCH CODE SEARCH
Date: 2026-09-19

This inventory is descriptive only. It does not change billing or production access.

| Existing access source | Verified implementation | Preserve | PASS compatibility |
|---|---|---:|---|
| Library recurring subscription | library-subscription.server.ts + library_subscriptions | YES | Map as legacy subscription entitlement; do not cancel/recreate |
| Owned/paid digital product | orders via catalog_key / metadata.product_key | YES | Resolve as ownership/lifetime entitlement |
| Owner/master digital override | owner-digital-access.server.ts | YES | Keep explicit privileged override, outside commercial PASS |
| Legacy training enrollment | training_enrollments, including grandfathered rows | YES | Preserve grandfathered access |
| Free course enrollment | training_enrollments in free course services | YES | Free entitlement remains independent of PASS |
| Editorial recurring subscription | editorial-subscription.server.ts + editorial_subscriptions | YES | Keep independent until explicit commercial migration |
| Academic Network premium/subscription signal | academic-network.server.ts reads library_subscriptions | YES FOR NOW | Later consume central entitlement resolver instead of direct table coupling |
| Social Clinic/service purchase | service-specific product key / Stripe flow | YES | Do not convert to unlimited PASS access |
| Hotmart purchase | webhook writes product_key ownership metadata | YES | Treat provider-neutral ownership as entitlement source |

## Verified patterns

### Library subscription
The current library helper reads the latest row in `library_subscriptions`, synchronizes state from Stripe, and activates/revokes included access according to subscription status.

### Product ownership
Paid access is commonly identified through `orders.catalog_key` and/or `orders.metadata.product_key`. The future resolver must support both to avoid breaking legacy purchases.

### Grandfathered access
At least one current formation explicitly treats an enrollment without `product_key` as legacy/grandfathered. Centralization must preserve this behavior until each legacy population is migrated deliberately.

### Free access
Free courses use enrollment state independently from paid subscription. PASS must never become a prerequisite for these resources.

### Editorial
Editorial subscriptions have their own recurring Stripe flow and table. They remain a separate entitlement source during PASS foundation.

## Architectural finding

Access logic is currently distributed across product-specific server modules. The first LDR PASS implementation should therefore be an additive, read-only compatibility resolver. Product modules can migrate to it one at a time after tests prove parity.

## Canonical resolver contract — proposed

`resolveEntitlement({ userId, email, resourceKey, capability? })`

Returns:
- allowed: boolean
- resourceKey
- source: free | owner_override | ownership | legacy_enrollment | library_subscription | editorial_subscription | pass | service_specific
- accessType: free | lifetime | recurring | temporary | privileged
- subscriptionId?: string
- expiresAt?: string
- legacy: boolean
- reasons: string[]

The resolver MUST NOT create orders, subscriptions, enrollments, payments, credits, or Stripe events.

## Migration sequence

1. Add resolver types and compatibility adapters.
2. Add parity tests against current Library + ownership + free + legacy behavior.
3. Migrate one low-risk digital resource to resolver.
4. Run regression suite.
5. Expand resource-by-resource.
6. Only after parity: add PASS as a new entitlement source.
7. Billing changes remain a later phase.

## Risk controls
- No schema migration in this inventory step.
- No production writes.
- No Stripe product creation.
- No removal of direct legacy checks yet.
- Academic Network direct subscription coupling is marked for later refactor, not immediate modification.

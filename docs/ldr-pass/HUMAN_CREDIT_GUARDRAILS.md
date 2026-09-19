# LDR PASS — Human Credit Economic Guardrails

Status: DESIGN GATE / NO CREDITS ISSUED
Date: 2026-09-19

## Principle
PASS can unlock access to the care ecosystem, professional discovery and bounded benefits. A subscription is not an unlimited claim on professional labor.

## Credit budget
Each PASS plan must define:
- monthly_credit_budget_minor by currency;
- max_redemptions_per_month;
- eligible_service_keys;
- platform_funded_amount_per_redemption;
- member_copay where applicable;
- professional_payout_amount/rule;
- expiry/rollover rule;
- cancellation/refund behavior.

## Economic ceiling
For every plan:
MAX_MONTHLY_HUMAN_LIABILITY <= APPROVED_PLAN_HUMAN_BUDGET

A redemption must be rejected or moved to member-paid pricing when the plan budget/quantity is exhausted. Never create an unbounded negative credit balance.

## Professional protection
Where the existing service uses the 20% LDR / 80% professional split, preserve that rule unless a separate explicit agreement exists. A marketing discount must not silently become a professional pay cut.

## Clínica Social treatment
- PASS may make Clínica Social professionals/services discoverable from Meu LDR.
- Existing social eligibility, pricing and operational rules remain authoritative.
- PASS may fund a bounded benefit, discount or credit only after the per-session economics are known.
- Employer accounts must not gain access to clinical content.
- Clinical records are not an entitlement/billing data source.

## Lifecycle controls
- Credit issuance only after authoritative subscription activation.
- Monthly grant must be idempotent.
- No new grant for canceled, unpaid, past_due or otherwise ineligible subscriptions.
- Redemption must be atomic to prevent double spend.
- Refund/reversal must restore or reverse credits according to an explicit ledger rule.
- Every grant/redemption/expiration/reversal has an immutable ledger event.
- Feature flag/kill switch required before production activation.

## Proposed data contract (not yet a migration)
Credit wallet:
- customer_id
- plan_key
- currency
- available_minor
- reserved_minor
- cycle_start
- cycle_end

Credit ledger:
- id
- customer_id
- subscription_id
- event_type: grant | reserve | redeem | release | expire | reverse | adjustment
- amount_minor
- service_key
- redemption_id
- idempotency_key
- created_at

## Next gate
Do not create these tables or Stripe PASS products yet. First populate real per-service professional cost, social price, capacity and expected redemption assumptions, then derive a safe plan-level credit ceiling.

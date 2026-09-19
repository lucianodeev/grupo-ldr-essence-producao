# LDR PASS — Unit Economics Gate

Status: PLANNED / MODEL FOUNDATION
Date: 2026-09-19

## Purpose
No LDR PASS price or human-service allowance may be published until contribution margin is modeled and approved.

## Revenue model
For each plan and market:
- gross recurring revenue
- discounts/promotions
- payment processing
- taxes where applicable
- refunds/chargebacks
= net subscription revenue

## Variable cost model
Track separately:
- professional payouts
- AI usage
- infrastructure
- support
- content/licensing
- certificates or physical fulfillment
- included benefits
- credit redemption cost

Contribution margin = net subscription revenue - variable costs.

## Usage scenarios
Every candidate plan must be simulated at:
- light usage
- medium usage
- heavy usage

And at scale:
- 1,000 subscribers
- 10,000 subscribers
- 100,000 subscribers

## Catalog benefit classes
1. DIGITAL_UNLIMITED_CANDIDATE
   Courses, ebooks, library items and digital resources whose marginal usage cost is low enough after validation.
2. FREE_PRESERVED
   Existing free resources; PASS must not remove free access.
3. OWNED_PRESERVED
   Lifetime/standalone purchases; PASS must not invalidate ownership.
4. RECURRING_LEGACY
   Existing recurring products such as Library/editorial; migration requires an explicit commercial decision.
5. CREDIT_ELIGIBLE_CANDIDATE
   Human-delivered services only after cost and capacity validation.
6. SEPARATE_HIGH_COST
   Live cohorts/formations or services with material delivery cost; not unlimited by default.
7. B2B_SEPARATE
   Employer/organization products; not bundled into consumer PASS by default.

## Mandatory fields per catalog item
- resource_key
- product/service name
- benefit_class
- current_price_brl
- current_price_eur
- marginal_cost_estimate
- professional_payout_rule
- platform_fee_rule
- current_access_source
- proposed_pass_treatment
- capacity_constraint
- refund/cancellation exposure
- notes/evidence

## Guardrails
- No human labor is unlimited by default.
- Preserve the existing 20% platform / 80% professional rule where it currently applies.
- Preserve free access and lifetime ownership.
- Do not cancel or recreate existing subscriptions automatically.
- Do not create Stripe PASS prices until the economic gate is approved.
- Credits are designed only after the eligible catalog and cost ceilings are known.
- Candidate prices are hypotheses, not public prices.

## Decision gate
A plan may advance to billing design only when:
1. every included high-cost benefit has a cost owner;
2. heavy-usage contribution margin is understood;
3. credit liability is bounded;
4. migration treatment for legacy subscribers is explicit;
5. BRL and EUR assumptions are documented separately;
6. cancellation/refund effects are included.

## Next implementation task
Build the first catalog economics matrix from verified repository products/services and classify each item before assigning PASS benefits.

# LDR PASS — Initial Catalog Economics Matrix

Status: VERIFIED SEED / COSTS PENDING
Date: 2026-09-19

This matrix records only treatments supported by current repository evidence. Unknown delivery costs remain explicitly TBD; they must not be guessed.

| Resource / area | Current evidence | Benefit class | Initial PASS treatment | Cost gate |
|---|---|---|---|---|
| Biblioteca LDR monthly | BRL 39.90 / EUR 9.90 recurring; BR annual 399.00; first-month promo exists | RECURRING_LEGACY | Preserve current subscribers; candidate for migration/credit into PASS only after commercial decision | Payment fees, tax, legacy migration |
| Biblioteca included digital catalog | Existing subscription provisions many ebooks/formations as subscription access | DIGITAL_UNLIMITED_CANDIDATE | Strong candidate for PASS digital inclusion | Infrastructure/content/support |
| Existing free resources | Existing free access/enrollment paths | FREE_PRESERVED | Remain free with or without PASS | No paywall regression |
| Standalone/lifetime purchases | Paid orders and ownership checks already exist | OWNED_PRESERVED | Keep lifetime ownership; PASS adds an alternate entitlement, never removes ownership | Refund/support exposure |
| Editorial subscription | Independent recurring Stripe subscription/table | RECURRING_LEGACY | Keep separate initially; evaluate later migration or PASS tier benefit | Editorial production + payment costs |
| Human clinical/well-being services | Service-specific purchase/access; professional-delivered | CREDIT_ELIGIBLE_CANDIDATE | PASS may provide discovery/access plus bounded credits or preferred pricing; never unlimited by default | Professional payout + capacity |
| Clínica Social | Social-purpose service flow with service-specific product key | CREDIT_ELIGIBLE_CANDIDATE | PASS can expose professionals and bounded benefits while preserving social rules/prices | Session cost, professional payout, social pricing |
| Live/high-touch formations | Material live/review delivery may exist | SEPARATE_HIGH_COST | Separate entitlement or limited PASS benefit until costed | Instructor/reviewer capacity |
| Corporate/employer products | Separate organization use case | B2B_SEPARATE | Keep outside consumer PASS by default | Contract-specific economics |

## Verified Library price anchors
These are current product facts, not proposed PASS prices:
- Brazil monthly: R$39.90
- International monthly: €9.90
- Brazil annual: R$399.00
- Current first-month promotion in code: 50%, yielding R$19.95 / €4.95 where applicable.

## PASS economics inputs still required
Before pricing PASS, quantify:
- Stripe/payment effective cost by market;
- applicable tax assumptions;
- average infrastructure cost per active subscriber;
- AI allowance/cost if AI is included;
- support cost per subscriber;
- human-service professional cost per redemption;
- expected redemption rate;
- maximum monthly credit liability;
- cancellation/refund/chargeback assumptions;
- live formation delivery cost and capacity.

## Scenario framework
For each candidate plan, calculate light / medium / heavy usage at 1k / 10k / 100k subscribers.

Per subscriber:
NET_REVENUE = GROSS_PRICE - PAYMENT_FEES - TAXES - REFUNDS
VARIABLE_COST = DIGITAL_INFRA + AI + SUPPORT + CONTENT + HUMAN_REDEMPTION + OTHER_BENEFITS
CONTRIBUTION = NET_REVENUE - VARIABLE_COST
CONTRIBUTION_MARGIN = CONTRIBUTION / NET_REVENUE

Human redemption:
EXPECTED_HUMAN_COST = REDEMPTION_RATE × REDEMPTIONS_PER_REDEEMER × PROFESSIONAL_COST_PER_REDEMPTION

## Safety decision
No numeric PASS price is approved by this document. Existing Library prices are reference anchors only. Human-service credits cannot be assigned until professional payout and redemption assumptions are populated.

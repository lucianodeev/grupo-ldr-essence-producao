# LDR PASS — Scenario Model

Status: MODEL FRAMEWORK / INPUTS REQUIRED
Date: 2026-09-19

This model deliberately separates verified facts from assumptions. It does not approve a public PASS price.

## Variables per market

- P = gross monthly subscription price
- F = effective payment-processing rate
- T = effective tax rate
- R = refund/chargeback rate
- D = digital infrastructure + content delivery cost per active subscriber
- A = AI cost per active subscriber
- S = support cost per active subscriber
- H = expected human-service redemption cost per subscriber
- O = other variable benefits per subscriber

NET_REVENUE = P × (1 - F - T - R)
VARIABLE_COST = D + A + S + H + O
CONTRIBUTION = NET_REVENUE - VARIABLE_COST
CONTRIBUTION_MARGIN = CONTRIBUTION / NET_REVENUE

## Human-service cost

- q = share of subscribers redeeming a human benefit in a month
- n = average redemptions among redeemers
- c = platform-funded cost per redemption

H = q × n × c

The professional payout must be modeled independently from the consumer-facing credit value. Where the existing 80% professional / 20% platform rule applies, PASS must not silently reduce the professional's contractual share.

## Usage scenarios

| Scenario | Digital use | AI use | Support | Human redemption |
|---|---|---|---|---|
| Light | low | low | low | low |
| Medium | normal | normal | normal | expected |
| Heavy | high | high | high | upper bounded |

For each scenario calculate totals at 1,000, 10,000 and 100,000 subscribers.

## Required safety thresholds

Before a plan can advance:
- Heavy-use human liability must have a hard monthly ceiling.
- No unlimited human session promise.
- Negative contribution in heavy use requires benefit or price redesign.
- Credits expire or roll over only under an explicitly costed rule.
- Failed/canceled subscriptions must not receive new monthly credits.
- Existing free access and lifetime ownership remain outside credit consumption.

## Scale formulas

For N subscribers:
MONTHLY_GROSS = N × P
MONTHLY_NET = N × NET_REVENUE
MONTHLY_VARIABLE_COST = N × VARIABLE_COST
MONTHLY_CONTRIBUTION = N × CONTRIBUTION
MAX_HUMAN_LIABILITY = N × human_credit_cost_ceiling

## Approval state
No numeric values for F, T, R, D, A, S, H or O are invented here. Populate them from actual provider costs, professional payout rules, historical usage or approved planning assumptions before pricing.

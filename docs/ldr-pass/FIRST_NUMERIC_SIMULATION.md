# LDR PASS — First Numeric Simulation

Status: PLANNING SIMULATION / NOT PUBLIC PRICING
Date: 2026-09-19

## Verified inputs
- Existing professional marketplace default platform fee: 20%.
- Corresponding professional net share under that rule: 80%.
- Existing Library anchors: R$39.90/month and €9.90/month.

No verified universal Clínica Social session price was found in the repository search used for this step, so no social-session price is invented.

## Planning variables
The following are intentionally variables, not facts:
- PASS monthly price P
- payment/tax/refund burden B
- digital + AI + support cost D
- professional service gross price G
- monthly redemption probability q
- redemptions per redeemer n
- PASS-funded share of a redemption x

Under the current 20/80 marketplace split:
PROFESSIONAL_PAYOUT = 0.80 × G
PLATFORM_SHARE_BEFORE_PROCESSING = 0.20 × G

If PASS fully funds a session:
EXPECTED_SESSION_SUBSIDY_PER_SUBSCRIBER = q × n × x

If x equals the full professional payout:
EXPECTED_PROFESSIONAL_LIABILITY = q × n × (0.80 × G)

## Illustrative stress table
These rows show how to evaluate any real service price G without inventing one.

| Monthly redemption q | Redemptions n | PASS funds | Expected liability/subscriber |
|---:|---:|---:|---:|
| 5% | 1 | 25% of G | 0.0125 × G |
| 10% | 1 | 50% of G | 0.05 × G |
| 20% | 1 | 80% professional payout | 0.16 × G |
| 30% | 1 | 80% professional payout | 0.24 × G |
| 20% | 2 | 80% professional payout | 0.32 × G |

At N subscribers, multiply the final column by N.

## Example interpretation
If a verified service later has gross price G, the 20% redemption / one session / full professional-payout scenario costs the PASS pool 16% of G per subscriber on average. This is a formula, not a claim about actual redemption behavior.

## Economic release rule
A plan cannot promise a fixed number of included human sessions until:
1. G is verified per eligible service/currency;
2. professional payout is confirmed;
3. q is supported by history or an approved conservative planning assumption;
4. the resulting heavy-use liability fits inside the plan contribution budget.

Until then, the safe commercial architecture is:
- ecosystem/professional access included;
- digital benefits eligible for broad inclusion;
- human benefits described as bounded credits or preferred member pricing;
- exact credit value unpublished until the cost gate passes.

# LDR Academy B2B — Pilot Runbook

## Goal
Validate one authorized institutional cohort end-to-end without fabricated production data.

## Pilot flow
1. Create the institution only after authorization.
2. Add owner/admin/coordinator memberships.
3. Link only students covered by the pilot's lawful/contractual basis and privacy notice.
4. Record operational events from real product actions.
5. Review follow-up signals with a human; never treat a signal as an automated academic decision.
6. Use the existing LDR Career for career journeys and applications.
7. Review aggregate metrics with the institution.

## Minimum evidence for MVP validation
- institution can authenticate and access only its tenant;
- authorized students can be linked;
- dashboard renders real counts;
- at least one real journey can be followed end-to-end;
- operational events are traceable;
- cross-tenant access tests fail closed;
- no clinical/private data is exposed.

## Metrics language
Operational metrics describe product use. Do not claim dropout reduction, employability improvement, causality, or predictive accuracy without a separately validated study.

## Production gate
Do not apply migrations or merge to main until build/typecheck, RLS negative-path tests, preview smoke tests, and migration review pass.

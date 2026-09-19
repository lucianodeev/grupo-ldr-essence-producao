# LDR Academy Institutional B2B MVP — Final readiness audit

Date: 2026-09-19
PR: #137
Scope: institutional B2B layer only.

## Executive status
**MVP B2B: CODE/DEMO READY, PRODUCTION DATA GATE PENDING.**

The branch is synchronized with main and deploy-preview checks are green. Production database migration has intentionally not been applied.

## Implemented
- Public B2B entry at /instituicoes.
- Authenticated institutional dashboard at /instituicoes/painel.
- Institution, institution-member and institution-student foundations.
- Human-review attention signals with explicit non-predictive semantics.
- Aggregated operational pilot metrics.
- Reuse of existing LDR Carreira instead of a duplicate employability system.
- RLS policies and release checklist.

## Readiness review
### Product / B2B
Customer: education institutions.
Core journey: institution -> student -> follow-up -> competencies/development -> LDR Academy -> LDR Carreira -> opportunities -> operational indicators.
Pilot: bounded cohort; no fake production students.

### Security / privacy
No service_role in client changes. Anonymous table privileges revoked. Institutional access is tenant-scoped by RLS policies. Attention signals do not authorize automated adverse academic decisions.

### Metrics
Initial metrics are operational only: linked students, active students, open signals, high-attention signals. Do not claim retention improvement, dropout reduction, employability uplift or causality without measured evidence.

## Findings by priority
### P0 — critical
None identified in the reviewed diff.

### P1 — must close before production data
1. Apply migration in non-production/staging.
2. Execute negative cross-tenant RLS tests from the security checklist.
3. Confirm generated database types / runtime client compatibility after migration.
4. Execute authenticated dashboard smoke test with two isolated institutions.

### P2 — after safe MVP release
- Expand institutional metrics from validated source tables (learning participation, journeys, competency evidence, applications).
- Complete PT/EN/FR/ES copy coverage for institutional pages.
- Add institution selection if one user legitimately belongs to multiple institutions.
- Add institutional user-management UX rather than database-only membership setup.

### P3 — iteration
- richer cohort filters;
- export/reporting;
- configurable follow-up rules;
- institution branding;
- longitudinal pilot reporting.

## 30-second factual pitch
LDR Academy is being structured as a B2B platform for education institutions to connect student follow-up, skills development, learning and employability in one journey. The institutional MVP reuses the existing Academy and LDR Career ecosystem, adds tenant-scoped institutional access, human-review follow-up signals and operational dashboards, and is designed to support a bounded pilot before broader validation.

## Claims discipline
Allowed now: an institutional B2B MVP has been implemented in a review branch and has successful deploy-preview checks.
Not allowed yet: production-validated institutional deployment; proven dropout reduction; predictive dropout AI; proven employability impact; validated institutional traction unless separately evidenced.

## Production release gate
Mark **MVP B2B READY FOR PRODUCTION DATA** only after all P1 items pass. Until then, keep PR #137 draft and do not apply the migration to production.

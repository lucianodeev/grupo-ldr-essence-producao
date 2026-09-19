# LDR Academy B2B — security and pilot checkpoint

## Scope
Institutional MVP only. No Stripe/payment changes. No production data is created by this package.

## Tenant boundary
- academy_institutions: authenticated owner/member read.
- academy_institution_members: self/owner scoped.
- academy_institution_students: student self or active institution member read.
- academy_student_attention_signals: student self or active institution member read.
- writes are restricted to institution owner/admin/coordinator where applicable.
- anon receives no table privileges.
- service_role is server-only and must never be exposed to browser code.

## Negative tests required before production
1. Anonymous read of all four institutional tables => denied.
2. Institution A member reading Institution B students => zero rows/denied.
3. Institution A member reading Institution B signals => zero rows/denied.
4. Viewer inserting/updating student links => denied.
5. Viewer inserting signals => denied.
6. Coordinator managing only its own institution => allowed.
7. Student reading another student's institutional relationship/signals => denied.
8. academy_institution_metrics for an unrelated institution => zero-valued result under RLS; verify in staging.

## Pilot
Use a real consenting institution and a delimited cohort. Do not seed fake production students.
Operational metrics: linked students, active students, open follow-up signals, high-attention signals.
These are operational measures, not impact/causality metrics.

## Human oversight
Attention signals are observed/rule/manual follow-up signals. They are not a predictive dropout model and must not trigger automated adverse academic decisions.

## Release gate
Do not apply migration or merge to main until typecheck/build, migration validation and cross-tenant RLS tests pass in a non-production environment.

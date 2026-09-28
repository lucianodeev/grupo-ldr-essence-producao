# LDR ONE — permanent database migration runbook

Prepared 2026-09-28. This is a release procedure, not authorization to provision paid infrastructure or modify production.

## Preconditions
- Destination PostgreSQL must be durable, non-expiring and explicitly approved before creation/use.
- Confirm region, PostgreSQL compatibility, encryption, backups, retention and restore capability.
- Never reuse sandbox or production secrets across environments.
- Keep Stripe LIVE and public checkout disabled during migration validation.
- Record source/destination engine versions and migration timestamp without logging credentials.

## Migration inputs
Apply the reviewed LDR ONE schema/migrations from this branch in dependency order:
1. `docs/ldr-pass/sql/ldr-one-sandbox-schema-REVIEW-ONLY.sql`
2. `docs/ldr-pass/sql/ldr-one-sandbox-customer-directory-REVIEW-ONLY.sql`
3. `docs/ldr-pass/sql/ldr-one-sandbox-invite-auth-REVIEW-ONLY.sql`
4. `docs/ldr-pass/sql/ldr-one-sandbox-sessions-REVIEW-ONLY.sql`

Use `scripts/ldr-one-sandbox-migrate.mjs` only after pointing it at the approved destination and preserving its safety guards.

## Backup before cutover
- Take a logical PostgreSQL backup with schema + data using the provider-supported backup or `pg_dump` in custom format.
- Store the backup encrypted with access restricted to operators.
- Record checksum, database version, backup time and retention location.
- Do not place dumps, credentials or connection strings in Git.

## Restore rehearsal
- Restore the backup into an isolated empty database of the same major PostgreSQL version.
- Verify migrations/schema objects, row counts for LDR ONE tables and referential constraints.
- Run read-only access checks and the LDR ONE regression suite against the restored copy.
- Destroy rehearsal data after evidence is recorded.

## Cutover checklist
- Freeze schema changes for the migration window.
- Take final backup and checksum.
- Apply migrations transactionally where supported.
- Configure destination connection through secret storage only.
- Validate login/session, entitlement denial-by-default, Business seat enforcement and webhook persistence.
- Keep checkout disabled until the exact production candidate passes smoke/regression.
- Enable customer traffic only after explicit production authorization.

## Rollback
Rollback if migration, integrity, authorization, session or entitlement validation fails.
1. Keep checkout/customer charging disabled.
2. Revert application connection to the last approved database configuration.
3. Restore the pre-cutover backup if any destination write must be undone.
4. Re-run read-only integrity and authorization checks.
5. Record the failure and remediation before another attempt.

## Current blocker
The current Render PostgreSQL sandbox is FREE but expires 2026-10-27. It is suitable only for sandbox evidence and must not be promoted as permanent production persistence. No paid infrastructure is authorized by this document.

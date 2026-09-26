# LDR ONE — Isolated database and backup plan

Status: READ-ONLY PREFLIGHT DONE; no backup created and no migration executed.

Verified on Supabase project `sfrcsrzuoqdscflfuwik`: `ldr_pass_subscriptions` and `stripe_webhook_events` exist; the staged `ldr_one_seat_allocations` table and `ldr_one_allocate_seat` / `ldr_one_revoke_seat` functions are absent. The current Supabase branch listing exposes main only, not an isolated development database.

1. Confirm an existing no-additional-cost isolated PostgreSQL environment and its exact identifier. Do not assume Supabase branching is free or create a billable project.
2. Install staged SQL ONLY on isolated test database, after reviewing existing prerequisites and function grants. Never apply this file to production as a test.
3. Use synthetic auth users and synthetic subscription rows. Concurrently assign N+1 employees to an N-seat plan; prove exactly N active seats. Test duplicate assignments, revocation/reassignment, expired subscription, anonymous access denial and service-role-only RPC.
4. Inspect schema grants, RLS and `SECURITY DEFINER` search_path. Check Postgres error logs and verify cross-tenant isolation.
5. For eventual production migration, confirm verified backup availability and actual restoration procedure with the operator. Save preflight results and rollback SQL. Obtain a **separate explicit approval** naming the production project and maintenance window before any production write.

STOP if isolated DB, backup validation or permission review cannot be established.

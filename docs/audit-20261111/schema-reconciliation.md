# Schema reconciliation — 2026-11-11

Read-only inspection of Supabase project `sfrcsrzuoqdscflfuwik` compared with `docs/audit-20261111/typescript-remaining.txt`.

## Verified schema mismatch

- `public.mentorship_sessions` has `meeting_url`, `mentorship_id`, `status`, `scheduled_at`, but **does not have** `appointment_id` or `confirmed_at`.
- `public.s8_sessions` has neither `appointment_id` nor `meeting_url`.
- `public.delivery_status` enum values: `pendente`, `em_producao`, `em_revisao`, `entregue`, `cancelada`. Application references `aprovada` and `ajustes_solicitados` which cannot be stored in that enum today.
- `public.deliveries` already has `approved_at` and `needs_client_approval`.

## Affected application paths

- `src/lib/agenda-admin.server.ts`: clears fields on `mentorship_sessions` and `s8_sessions` that do not exist. Runtime writes would fail.
- `src/lib/client-portal.server.ts`: reads absent session fields; gate for showing video links cannot work as written. Delivery approval/adjustment writes invalid enum values.
- `src/lib/central.ts`: exposes invalid delivery status options.

## Required decisions before code changes

1. Define and implement a reviewed schema migration for appointment-to-session linkage and confirmation, **or** redesign these flows using existing relations, with explicit regression tests. Do not expose meeting links before payment, confirmation and calendar synchronization.
2. Decide whether to add delivery enum values through an approved migration or use existing statuses plus approval metadata. Preserve client-facing semantics and event history.
3. Re-generate Supabase types from the verified schema, run typecheck, unit, regression and HTTP tests. Keep typecheck mandatory.
4. No production database DDL was executed during this inspection. Do not modify production without explicit approval.

This document records the real blocker; do not suppress errors using unsafe casts or relaxing TypeScript checks.

-- DRAFT: NOT APPROVED FOR EXECUTION. PostgreSQL / Supabase.
-- This file is an additive schema DESIGN, not a production-ready migration.
-- Dependencies, existing RLS policies, payment-credit invariants and RPCs
-- must be reviewed and integration-tested before running any DDL.
BEGIN;

-- Canonical appointment record. Never backfill by fuzzy date matching.
CREATE TABLE IF NOT EXISTS public.appointments (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 order_id uuid REFERENCES public.orders(id),
 customer_id uuid,
 catalog_key text,
 title text NOT NULL,
 status text NOT NULL DEFAULT 'agendada' CHECK (status IN ('agendada','confirmada','cancelada','reagendada','concluida')),
 starts_at timestamptz,
 ends_at timestamptz,
 duration_minutes integer NOT NULL DEFAULT 50 CHECK (duration_minutes BETWEEN 1 AND 1440),
 meeting_url text,
 client_notes text,
 internal_notes text,
 client_visible boolean NOT NULL DEFAULT false,
 consumes_credit boolean NOT NULL DEFAULT false,
 created_by uuid,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
-- Intentionally no broad anon/authenticated policy or GRANT.
-- Backend authorization and narrowly scoped policies require separate review.

-- Link sessions only by explicit verified UUID, never by time/session number.
ALTER TABLE public.mentorship_sessions
 ADD COLUMN IF NOT EXISTS appointment_id uuid REFERENCES public.appointments(id) ON DELETE SET NULL,
 ADD COLUMN IF NOT EXISTS confirmed_at timestamptz;
CREATE UNIQUE INDEX IF NOT EXISTS mentorship_sessions_appointment_id_unique
 ON public.mentorship_sessions(appointment_id) WHERE appointment_id IS NOT NULL;

-- Deliberately NOT adding s8_sessions appointment_id until its purpose is verified.
-- Deliberately NOT creating RPCs: transactional credit and calendar sync behavior
-- needs verified application invariants before implementation.
-- Deliberately NOT exposing existing mentorship meeting_url to clients.

ROLLBACK; -- Guardrail: running this draft does not persist changes.

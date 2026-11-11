-- DESIGN ONLY / rollback-only; not production migration.
-- Read-only repo audit: calendar-sync.server.ts requires these structures.
BEGIN;
CREATE TABLE IF NOT EXISTS public.appointment_events (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 appointment_id uuid NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
 event text NOT NULL,
 actor_kind text NOT NULL,
 actor_id uuid,
 actor_label text,
 comment text,
 client_visible boolean NOT NULL DEFAULT false,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS appointment_events_appointment_created_idx
 ON public.appointment_events(appointment_id, created_at DESC);
ALTER TABLE public.appointment_events ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.appointment_calendar_sync (
 appointment_id uuid PRIMARY KEY REFERENCES public.appointments(id) ON DELETE CASCADE,
 calendar_id text NOT NULL,
 google_event_id text,
 meet_url text,
 sync_status text NOT NULL DEFAULT 'pendente'
  CHECK (sync_status IN ('pendente','sincronizado','erro','conflito','cancelado','manual')),
 attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
 last_attempt_at timestamptz,
 last_error_code text,
 lease_token uuid,
 lease_expires_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.appointment_calendar_sync ENABLE ROW LEVEL SECURITY;
-- Deliberately no GRANT or broad policies; service-only access to be reviewed.
-- RPC claim/release require concurrency tests and privileges review first.
ROLLBACK;

-- PRE-ACTIVATION ONLY. Never discards appointment or session data.
-- Production execution requires separate explicit approval.
BEGIN;
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM public.appointments) OR EXISTS(SELECT 1 FROM public.mentorship_sessions WHERE appointment_id IS NOT NULL OR confirmed_at IS NOT NULL) THEN
  RAISE EXCEPTION 'rollback refused: retain live data; disable feature flag and use a reviewed forward fix';
 END IF;
END $$;
DROP TRIGGER session_credit_capacity_guard ON public.session_credits;
DROP FUNCTION public.guard_session_credit_capacity();
DROP TRIGGER appointment_session_mirror ON public.appointments;
DROP FUNCTION public.mirror_appointment_session();
DROP TRIGGER appointment_credit_guard ON public.appointments;
DROP FUNCTION public.guard_appointment_credit();
DROP FUNCTION public.client_request_appointment(uuid,uuid,timestamptz,integer,text,uuid,text);
DROP FUNCTION public.client_reschedule_appointment(uuid,uuid,timestamptz,text,uuid,text);
DROP FUNCTION public.confirm_mentorship_session_tx(uuid,timestamptz,text,uuid);
DROP FUNCTION public.confirm_appointment_tx(uuid,timestamptz,integer,text,text);
DROP FUNCTION public.claim_calendar_sync(uuid,text,integer);
DROP FUNCTION public.release_calendar_sync(uuid,uuid,text,text,text,text);
ALTER TABLE public.mentorship_sessions DROP COLUMN appointment_id, DROP COLUMN confirmed_at;
DROP TABLE public.appointment_calendar_sync;
DROP TABLE public.appointment_events;
DROP TABLE public.appointments;
COMMIT;

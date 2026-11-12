-- REVIEW-ONLY hardening proposal. DO NOT EXECUTE IN PRODUCTION.
-- Apply after the five agenda schema/RPC drafts have been reviewed.
-- Explicitly restrict RPC execution to the backend service role.
BEGIN;
REVOKE ALL ON FUNCTION public.confirm_appointment_tx(uuid,timestamptz,integer,text,text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.confirm_mentorship_session_tx(uuid,timestamptz,text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.claim_calendar_sync(uuid,text,integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.release_calendar_sync(uuid,uuid,text,text,text,text) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.confirm_appointment_tx(uuid,timestamptz,integer,text,text) TO service_role;
GRANT EXECUTE ON FUNCTION public.confirm_mentorship_session_tx(uuid,timestamptz,text) TO service_role;
GRANT EXECUTE ON FUNCTION public.claim_calendar_sync(uuid,text,integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.release_calendar_sync(uuid,uuid,text,text,text,text) TO service_role;

-- Restrict new application tables to server-side access.
REVOKE ALL ON TABLE public.appointments,public.appointment_events,public.appointment_calendar_sync FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON TABLE public.appointments,public.appointment_events,public.appointment_calendar_sync TO service_role;
-- Existing mentorship_sessions, orders and session_credits permissions must be audited separately.
-- No broad policies are added. RLS remains enabled on new public tables.
ROLLBACK; -- Review only. No persistent changes.

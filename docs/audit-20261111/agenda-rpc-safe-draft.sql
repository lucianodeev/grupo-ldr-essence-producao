-- DRAFT ONLY. Run after agenda-migration-draft.sql and agenda-calendar-schema-draft.sql
-- have been converted into reviewed migrations. Never apply directly to production.
BEGIN;
-- Mentorship confirmation is deliberately separate from payment-credit allocation.
-- SECURITY INVOKER; service-role invocation only, explicitly revoke PUBLIC.
CREATE OR REPLACE FUNCTION public.confirm_mentorship_session_tx(
 _session_id uuid, _scheduled timestamptz, _meeting text
) RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE v_appointment uuid;
BEGIN
 IF _scheduled IS NULL OR _meeting IS NULL OR length(trim(_meeting)) = 0 THEN
  RAISE EXCEPTION 'invalid session confirmation';
 END IF;
 SELECT appointment_id INTO v_appointment
 FROM public.mentorship_sessions WHERE id = _session_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'sessão não encontrada'; END IF;
 IF v_appointment IS NOT NULL THEN
  PERFORM 1 FROM public.appointments WHERE id = v_appointment FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'linked appointment missing'; END IF;
  UPDATE public.appointments SET starts_at = _scheduled,
   ends_at = _scheduled + (duration_minutes * interval '1 minute'),
   meeting_url = _meeting, status = 'confirmada', updated_at = now()
  WHERE id = v_appointment AND status NOT IN ('cancelada','concluida');
  IF NOT FOUND THEN RAISE EXCEPTION 'appointment not confirmable'; END IF;
 END IF;
 UPDATE public.mentorship_sessions
 SET scheduled_at = _scheduled, meeting_url = _meeting,
  status = 'agendada', confirmed_at = now(), updated_at = now()
 WHERE id = _session_id;
END $$;
REVOKE ALL ON FUNCTION public.confirm_mentorship_session_tx(uuid,timestamptz,text) FROM PUBLIC, anon, authenticated;
-- IMPORTANT: confirm_appointment_tx intentionally not provided: must reconcile
-- order payment, session_credits granted and concurrent allocations first.
-- Google claim/release RPCs intentionally withheld until CAS lease invariants
-- and service-role privileges are verified by isolated integration tests.
ROLLBACK;

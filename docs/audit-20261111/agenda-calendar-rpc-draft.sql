-- REVIEW DRAFT ONLY. Requires appointment_calendar_sync and appointments.
-- No production changes: the transaction is rolled back.
BEGIN;
CREATE OR REPLACE FUNCTION public.claim_calendar_sync(
 _appointment_id uuid, _calendar_id text, _lease_seconds integer
) RETURNS TABLE(claimed boolean, lease_token uuid, google_event_id text,
 meet_url text, sync_status text, attempts integer)
LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE v public.appointment_calendar_sync%ROWTYPE; v_token uuid := gen_random_uuid();
BEGIN
 IF _appointment_id IS NULL OR coalesce(length(trim(_calendar_id)),0)=0
    OR _lease_seconds NOT BETWEEN 1 AND 300 THEN
  RAISE EXCEPTION 'invalid calendar lease request';
 END IF;
 PERFORM 1 FROM public.appointments WHERE id = _appointment_id;
 IF NOT FOUND THEN RAISE EXCEPTION 'appointment not found'; END IF;
 INSERT INTO public.appointment_calendar_sync(appointment_id,calendar_id)
 VALUES (_appointment_id,_calendar_id) ON CONFLICT (appointment_id) DO NOTHING;
 SELECT * INTO v FROM public.appointment_calendar_sync
 WHERE appointment_id=_appointment_id FOR UPDATE;
 IF v.calendar_id <> _calendar_id THEN RAISE EXCEPTION 'calendar mismatch'; END IF;
 IF v.lease_token IS NOT NULL AND v.lease_expires_at > now() THEN
  RETURN QUERY SELECT false, NULL::uuid, v.google_event_id, v.meet_url,
    v.sync_status, v.attempts;
  RETURN;
 END IF;
 UPDATE public.appointment_calendar_sync s
 SET lease_token=v_token, lease_expires_at=now()+make_interval(secs=>_lease_seconds),
 attempts=s.attempts+1, last_attempt_at=now(), updated_at=now()
 WHERE s.appointment_id=_appointment_id
 RETURNING * INTO v;
 RETURN QUERY SELECT true,v.lease_token,v.google_event_id,v.meet_url,v.sync_status,v.attempts;
END $$;
CREATE OR REPLACE FUNCTION public.release_calendar_sync(
 _appointment_id uuid, _token uuid, _status text, _event_id text,
 _meet_url text, _error_code text
) RETURNS boolean LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
BEGIN
 IF _status NOT IN ('pendente','sincronizado','erro','conflito','cancelado','manual') THEN
  RAISE EXCEPTION 'invalid sync status';
 END IF;
 UPDATE public.appointment_calendar_sync s SET
 sync_status=_status, google_event_id=coalesce(_event_id,s.google_event_id),
 meet_url=_meet_url, last_error_code=_error_code,
 lease_token=NULL,lease_expires_at=NULL,updated_at=now()
 WHERE s.appointment_id=_appointment_id AND s.lease_token=_token
 AND s.lease_expires_at > now();
 RETURN FOUND;
END $$;
REVOKE ALL ON FUNCTION public.claim_calendar_sync(uuid,text,integer) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.release_calendar_sync(uuid,uuid,text,text,text,text) FROM PUBLIC,anon,authenticated;
-- Needs isolated integration and failure-injection tests.
ROLLBACK;

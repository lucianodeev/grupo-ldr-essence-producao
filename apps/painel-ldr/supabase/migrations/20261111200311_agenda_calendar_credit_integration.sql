-- Release candidate; apply only after explicit production authorization.
BEGIN;

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

ALTER TABLE public.mentorship_sessions
 ADD COLUMN IF NOT EXISTS appointment_id uuid REFERENCES public.appointments(id) ON DELETE SET NULL,
 ADD COLUMN IF NOT EXISTS confirmed_at timestamptz;
CREATE UNIQUE INDEX IF NOT EXISTS mentorship_sessions_appointment_id_unique
 ON public.mentorship_sessions(appointment_id) WHERE appointment_id IS NOT NULL;


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
 event_generation integer NOT NULL DEFAULT 0 CHECK (event_generation>=0),
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
ALTER TABLE public.appointments ADD COLUMN credit_reserved boolean NOT NULL DEFAULT false;
CREATE INDEX appointments_order_reserved_idx ON public.appointments(order_id) WHERE credit_reserved;
CREATE OR REPLACE FUNCTION public.confirm_appointment_tx(
 _appointment_id uuid, _starts timestamptz, _duration integer,
 _meeting text, _client_note text
) RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE a public.appointments%ROWTYPE; o public.orders%ROWTYPE;
 v_granted bigint; v_used bigint;
BEGIN
 IF _starts IS NULL OR _duration IS NULL OR _duration NOT BETWEEN 1 AND 1440 THEN
  RAISE EXCEPTION 'invalid appointment schedule';
 END IF;
 SELECT * INTO a FROM public.appointments WHERE id=_appointment_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'appointment not found'; END IF;
 IF a.status IN ('cancelada','concluida') THEN RAISE EXCEPTION 'appointment not confirmable'; END IF;
 IF a.consumes_credit THEN
  IF a.order_id IS NULL OR a.customer_id IS NULL OR a.catalog_key IS NULL THEN
   RAISE EXCEPTION 'paid order link required';
  END IF;
  SELECT * INTO o FROM public.orders WHERE id=a.order_id FOR UPDATE;
  IF NOT FOUND OR o.payment_status IS DISTINCT FROM 'pago'
   OR o.customer_id IS DISTINCT FROM a.customer_id
   OR o.catalog_key IS DISTINCT FROM a.catalog_key THEN
   RAISE EXCEPTION 'paid order ownership mismatch';
  END IF;
  -- The order row serializes confirmations for the same order.
  SELECT coalesce(sum(granted),0) INTO v_granted FROM public.session_credits
   WHERE order_id=a.order_id AND customer_id=a.customer_id
   AND catalog_key=a.catalog_key;
  SELECT count(*) INTO v_used FROM public.appointments
   WHERE order_id=a.order_id AND consumes_credit AND credit_reserved
    AND id<>a.id;
  IF v_granted<=v_used THEN RAISE EXCEPTION 'insufficient session credits'; END IF;
 END IF;
 UPDATE public.appointments SET starts_at=_starts,
 ends_at=_starts+make_interval(mins=>_duration),duration_minutes=_duration,
 meeting_url=_meeting,client_notes=coalesce(_client_note,client_notes),
 status='confirmada',updated_at=now() WHERE id=a.id;
END $$;
REVOKE ALL ON FUNCTION public.confirm_appointment_tx(uuid,timestamptz,integer,text,text)
 FROM PUBLIC,anon,authenticated;
CREATE OR REPLACE FUNCTION public.claim_calendar_sync(
 _appointment_id uuid, _calendar_id text, _lease_seconds integer
) RETURNS TABLE(claimed boolean, lease_token uuid, google_event_id text,
 meet_url text, sync_status text, attempts integer, event_generation integer)
LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE v public.appointment_calendar_sync%ROWTYPE; v_token uuid := gen_random_uuid();
BEGIN
 IF _appointment_id IS NULL OR coalesce(length(trim(_calendar_id)),0)=0
    OR _lease_seconds IS NULL OR _lease_seconds NOT BETWEEN 1 AND 300 THEN
  RAISE EXCEPTION 'invalid calendar lease request';
 END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended('ldr-calendar:'||_calendar_id,0));
 PERFORM 1 FROM public.appointments WHERE id = _appointment_id;
 IF NOT FOUND THEN RAISE EXCEPTION 'appointment not found'; END IF;
 INSERT INTO public.appointment_calendar_sync(appointment_id,calendar_id)
 VALUES (_appointment_id,_calendar_id) ON CONFLICT (appointment_id) DO NOTHING;
 SELECT * INTO v FROM public.appointment_calendar_sync
 WHERE appointment_id=_appointment_id FOR UPDATE;
 IF v.calendar_id <> _calendar_id THEN RAISE EXCEPTION 'calendar mismatch'; END IF;
 IF EXISTS(SELECT 1 FROM public.appointment_calendar_sync other_sync WHERE other_sync.calendar_id=_calendar_id AND other_sync.appointment_id<>_appointment_id AND other_sync.lease_token IS NOT NULL AND other_sync.lease_expires_at>clock_timestamp())
 OR (v.lease_token IS NOT NULL AND v.lease_expires_at > clock_timestamp()) THEN
  RETURN QUERY SELECT false, NULL::uuid, v.google_event_id, v.meet_url,
    v.sync_status, v.attempts, v.event_generation;
  RETURN;
 END IF;
 UPDATE public.appointment_calendar_sync s
 SET lease_token=v_token, lease_expires_at=now()+make_interval(secs=>_lease_seconds),
 attempts=s.attempts+1, last_attempt_at=now(), updated_at=now()
 WHERE s.appointment_id=_appointment_id
 RETURNING * INTO v;
 RETURN QUERY SELECT true,v.lease_token,v.google_event_id,v.meet_url,v.sync_status,v.attempts,v.event_generation;
END $$;
CREATE OR REPLACE FUNCTION public.release_calendar_sync(
 _appointment_id uuid, _token uuid, _status text, _event_id text,
 _meet_url text, _error_code text
) RETURNS boolean LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
BEGIN
 IF _status='sincronizado' AND EXISTS(SELECT 1 FROM public.appointments a JOIN public.appointment_calendar_sync s ON s.appointment_id=a.id WHERE a.id=_appointment_id AND (a.status<>'confirmada' OR a.updated_at>s.last_attempt_at)) THEN RETURN false; END IF;
 IF _status IS NULL OR _status NOT IN ('pendente','sincronizado','erro','conflito','cancelado','manual') THEN
  RAISE EXCEPTION 'invalid sync status';
 END IF;
 UPDATE public.appointment_calendar_sync s SET
 sync_status=_status, google_event_id=coalesce(_event_id,s.google_event_id),
 meet_url=_meet_url, last_error_code=_error_code,
 lease_token=NULL,lease_expires_at=NULL,updated_at=now()
 WHERE s.appointment_id=_appointment_id AND s.lease_token=_token
 AND s.lease_expires_at > clock_timestamp();
 RETURN FOUND;
END $$;
REVOKE ALL ON FUNCTION public.claim_calendar_sync(uuid,text,integer) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.release_calendar_sync(uuid,uuid,text,text,text,text) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.confirm_appointment_tx(uuid,timestamptz,integer,text,text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.claim_calendar_sync(uuid,text,integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.release_calendar_sync(uuid,uuid,text,text,text,text) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.confirm_appointment_tx(uuid,timestamptz,integer,text,text) TO service_role;
GRANT EXECUTE ON FUNCTION public.claim_calendar_sync(uuid,text,integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.release_calendar_sync(uuid,uuid,text,text,text,text) TO service_role;

REVOKE ALL ON TABLE public.appointments,public.appointment_events,public.appointment_calendar_sync FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON TABLE public.appointments,public.appointment_events,public.appointment_calendar_sync TO service_role;

-- Invariant applies to RPCs AND direct service-role writes. A reschedule retains
-- its reservation; only cancellation releases it. Completed sessions retain it.
CREATE FUNCTION public.guard_appointment_credit() RETURNS trigger
LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE o public.orders%ROWTYPE; capacity bigint; used bigint;
BEGIN
 IF TG_OP='UPDATE' AND OLD.credit_reserved AND
    (NEW.order_id IS DISTINCT FROM OLD.order_id OR NEW.customer_id IS DISTINCT FROM OLD.customer_id
     OR NEW.catalog_key IS DISTINCT FROM OLD.catalog_key OR NEW.consumes_credit IS DISTINCT FROM OLD.consumes_credit) THEN
  RAISE EXCEPTION 'reserved credit ownership immutable';
 END IF;
 IF TG_OP='UPDATE' AND OLD.status IN ('cancelada','concluida') AND NEW.status<>OLD.status THEN
  RAISE EXCEPTION 'terminal appointment cannot reopen';
 END IF;
 NEW.credit_reserved := NEW.consumes_credit AND NEW.status<>'cancelada' AND
  (NEW.status IN ('confirmada','concluida') OR (TG_OP='UPDATE' AND OLD.credit_reserved));
 IF NEW.status='confirmada' AND (NEW.starts_at IS NULL OR NEW.ends_at IS NULL OR NEW.ends_at<=NEW.starts_at) THEN
  RAISE EXCEPTION 'invalid appointment schedule';
 END IF;
 IF NEW.credit_reserved THEN
  SELECT * INTO o FROM public.orders WHERE id=NEW.order_id FOR UPDATE;
  IF NOT FOUND OR o.payment_status IS DISTINCT FROM 'pago' OR NEW.customer_id IS NULL OR NEW.catalog_key IS NULL
    OR o.customer_id IS DISTINCT FROM NEW.customer_id OR o.catalog_key IS DISTINCT FROM NEW.catalog_key THEN
   RAISE EXCEPTION 'paid order ownership mismatch';
  END IF;
  SELECT coalesce(sum(granted),0) INTO capacity FROM public.session_credits
   WHERE order_id=NEW.order_id AND customer_id=NEW.customer_id AND catalog_key=NEW.catalog_key;
  SELECT count(*) INTO used FROM public.appointments WHERE order_id=NEW.order_id AND credit_reserved AND id<>NEW.id;
  IF capacity<=used THEN RAISE EXCEPTION 'insufficient session credits'; END IF;
 END IF;
 IF NEW.status IN ('cancelada','reagendada') THEN NEW.meeting_url:=NULL; END IF;
 NEW.updated_at:=now(); RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.guard_appointment_credit() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.guard_appointment_credit() TO service_role;
CREATE TRIGGER appointment_credit_guard BEFORE INSERT OR UPDATE ON public.appointments
 FOR EACH ROW EXECUTE FUNCTION public.guard_appointment_credit();

CREATE FUNCTION public.mirror_appointment_session() RETURNS trigger
LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
BEGIN
 IF EXISTS(SELECT 1 FROM public.mentorship_sessions s JOIN public.mentorships m ON m.id=s.mentorship_id
  WHERE s.appointment_id=NEW.id AND (m.order_id IS DISTINCT FROM NEW.order_id OR m.customer_id IS DISTINCT FROM NEW.customer_id)) THEN
  RAISE EXCEPTION 'mentorship ownership mismatch'; END IF;
 IF NEW.status='confirmada' AND NOT NEW.consumes_credit AND EXISTS(
  SELECT 1 FROM public.mentorship_sessions s JOIN public.session_credits c ON c.order_id=NEW.order_id WHERE s.appointment_id=NEW.id) THEN
  RAISE EXCEPTION 'credit-consuming appointment requires payment-validated confirmation'; END IF;
 UPDATE public.mentorship_sessions SET scheduled_at=NEW.starts_at,duration_minutes=NEW.duration_minutes,
 meeting_url=CASE WHEN NEW.status='confirmada' THEN NEW.meeting_url ELSE NULL END,
 confirmed_at=CASE WHEN NEW.status='confirmada' THEN now() ELSE NULL END,
 status=(CASE WHEN NEW.status='confirmada' THEN 'agendada' ELSE NEW.status END)::public.session_status,
 updated_at=now() WHERE appointment_id=NEW.id;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.mirror_appointment_session() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.mirror_appointment_session() TO service_role;
CREATE TRIGGER appointment_session_mirror AFTER UPDATE ON public.appointments
 FOR EACH ROW EXECUTE FUNCTION public.mirror_appointment_session();

CREATE OR REPLACE FUNCTION public.confirm_mentorship_session_tx(_session_id uuid,_scheduled timestamptz,_meeting text)
RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE s public.mentorship_sessions%ROWTYPE; m public.mentorships%ROWTYPE; a public.appointments%ROWTYPE;
BEGIN
 IF _scheduled IS NULL OR coalesce(length(trim(_meeting)),0)=0 THEN RAISE EXCEPTION 'invalid session confirmation'; END IF;
 SELECT * INTO s FROM public.mentorship_sessions WHERE id=_session_id;
 IF NOT FOUND THEN RAISE EXCEPTION 'sessão não encontrada'; END IF;
 IF s.appointment_id IS NULL THEN RAISE EXCEPTION 'explicit appointment link required'; END IF;
 -- Same lock order as ordinary confirmation: appointment, order, session.
 SELECT * INTO a FROM public.appointments WHERE id=s.appointment_id FOR UPDATE;
 SELECT * INTO m FROM public.mentorships WHERE id=s.mentorship_id;
 IF m.order_id IS DISTINCT FROM a.order_id OR m.customer_id IS DISTINCT FROM a.customer_id THEN
  RAISE EXCEPTION 'mentorship ownership mismatch'; END IF;
 IF a.order_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public.orders WHERE id=a.order_id AND payment_status='pago') THEN
  RAISE EXCEPTION 'paid order ownership mismatch'; END IF;
 IF EXISTS(SELECT 1 FROM public.session_credits WHERE order_id=a.order_id) AND NOT a.consumes_credit THEN
  RAISE EXCEPTION 'credit-consuming appointment requires payment-validated confirmation'; END IF;
 PERFORM public.confirm_appointment_tx(a.id,_scheduled,s.duration_minutes,_meeting,NULL);
END $$;
REVOKE ALL ON FUNCTION public.confirm_mentorship_session_tx(uuid,timestamptz,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_mentorship_session_tx(uuid,timestamptz,text) TO service_role;
-- The backend role must have the privileges used by invoker RPCs.
GRANT SELECT,UPDATE ON public.orders,public.mentorship_sessions TO service_role;
GRANT SELECT ON public.mentorships,public.session_credits TO service_role;


-- Browser supplies only IDs and proposed schedule. Backend resolves customer.
CREATE FUNCTION public.client_request_appointment(_customer_id uuid,_order_id uuid,_starts_at timestamptz,
 _duration integer,_note text,_actor uuid,_actor_label text) RETURNS jsonb
LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE o public.orders%ROWTYPE; c public.service_catalog%ROWTYPE; capacity integer; used integer;
 consumes boolean; appointment uuid;
BEGIN
 IF _starts_at IS NULL OR _starts_at<=now() OR _duration IS NULL OR _duration NOT BETWEEN 15 AND 240 THEN
  RETURN jsonb_build_object('ok',false,'error','past_date'); END IF;
 SELECT * INTO o FROM public.orders WHERE id=_order_id FOR UPDATE;
 IF NOT FOUND OR o.customer_id IS DISTINCT FROM _customer_id OR _customer_id IS NULL THEN
  RETURN jsonb_build_object('ok',false,'error','invalid'); END IF;
 IF o.payment_status IS DISTINCT FROM 'pago' THEN RETURN jsonb_build_object('ok',false,'error','not_paid'); END IF;
 SELECT * INTO c FROM public.service_catalog WHERE catalog_key=o.catalog_key AND active;
 IF NOT FOUND THEN RETURN jsonb_build_object('ok',false,'error','invalid'); END IF;
 IF c.billing_model NOT IN ('single_paid_session','package_sessions','project') THEN
  RETURN jsonb_build_object('ok',false,'error','invalid'); END IF;
 consumes:=c.billing_model IN ('single_paid_session','package_sessions');
 SELECT count(*) INTO used FROM public.appointments WHERE order_id=o.id AND status<>'cancelada'
  AND (consumes_credit OR status<>'concluida');
 IF consumes THEN
  SELECT coalesce(sum(granted),0) INTO capacity FROM public.session_credits
   WHERE order_id=o.id AND customer_id=_customer_id AND catalog_key=o.catalog_key;
  IF used>=capacity THEN RETURN jsonb_build_object('ok',false,'error','no_credit'); END IF;
 ELSE
  IF used>0 THEN RETURN jsonb_build_object('ok',false,'error','open_meeting'); END IF;
 END IF;
 INSERT INTO public.appointments(order_id,customer_id,catalog_key,title,starts_at,ends_at,duration_minutes,
  consumes_credit,client_notes,client_visible,created_by)
 VALUES(o.id,_customer_id,o.catalog_key,c.name,_starts_at,_starts_at+make_interval(mins=>_duration),_duration,
  consumes,nullif(left(_note,800),''),true,_actor) RETURNING id INTO appointment;
 INSERT INTO public.appointment_events(appointment_id,event,actor_kind,actor_id,actor_label,comment,client_visible)
 VALUES(appointment,'solicitada','cliente',_actor,left(_actor_label,160),left(_note,800),true);
 RETURN jsonb_build_object('ok',true,'appointment_id',appointment);
END $$;
CREATE FUNCTION public.client_reschedule_appointment(_customer_id uuid,_appointment_id uuid,_starts_at timestamptz,
 _note text,_actor uuid,_actor_label text) RETURNS jsonb
LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE a public.appointments%ROWTYPE;
BEGIN
 IF _starts_at IS NULL OR _starts_at<=now() THEN RETURN jsonb_build_object('ok',false,'error','past_date'); END IF;
 SELECT * INTO a FROM public.appointments WHERE id=_appointment_id FOR UPDATE;
 IF NOT FOUND OR _customer_id IS NULL OR a.customer_id IS DISTINCT FROM _customer_id THEN
  RETURN jsonb_build_object('ok',false,'error','invalid'); END IF;
 IF a.status IN ('cancelada','concluida') THEN RETURN jsonb_build_object('ok',false,'error','closed'); END IF;
 PERFORM 1 FROM public.orders WHERE id=a.order_id AND customer_id=_customer_id AND payment_status='pago' FOR UPDATE;
 IF NOT FOUND THEN RETURN jsonb_build_object('ok',false,'error','not_paid'); END IF;
 UPDATE public.appointments SET starts_at=_starts_at,ends_at=_starts_at+make_interval(mins=>a.duration_minutes),
  status='reagendada',meeting_url=NULL,client_notes=coalesce(nullif(left(_note,800),''),client_notes) WHERE id=a.id;
 UPDATE public.appointment_calendar_sync SET sync_status='pendente',meet_url=NULL,updated_at=now() WHERE appointment_id=a.id;
 INSERT INTO public.appointment_events(appointment_id,event,actor_kind,actor_id,actor_label,comment,client_visible)
 VALUES(a.id,'reagendamento_solicitado','cliente',_actor,left(_actor_label,160),left(_note,800),true);
 RETURN jsonb_build_object('ok',true,'appointment_id',a.id);
END $$;
REVOKE ALL ON FUNCTION public.client_request_appointment(uuid,uuid,timestamptz,integer,text,uuid,text) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.client_reschedule_appointment(uuid,uuid,timestamptz,text,uuid,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.client_request_appointment(uuid,uuid,timestamptz,integer,text,uuid,text) TO service_role;
GRANT EXECUTE ON FUNCTION public.client_reschedule_appointment(uuid,uuid,timestamptz,text,uuid,text) TO service_role;
GRANT SELECT ON public.service_catalog TO service_role;
-- A credit grant mutation uses the same order lock as confirmation.
CREATE FUNCTION public.guard_session_credit_capacity() RETURNS trigger
LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
BEGIN
 PERFORM 1 FROM public.orders WHERE id=NEW.order_id FOR UPDATE;
 IF NEW.granted < (SELECT count(*) FROM public.appointments WHERE order_id=NEW.order_id AND credit_reserved) THEN
  RAISE EXCEPTION 'credit grant below existing reservations'; END IF;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.guard_session_credit_capacity() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.guard_session_credit_capacity() TO service_role;
CREATE TRIGGER session_credit_capacity_guard BEFORE INSERT OR UPDATE ON public.session_credits
 FOR EACH ROW EXECUTE FUNCTION public.guard_session_credit_capacity();
COMMIT;

-- DESIGN DRAFT ONLY: requires appointments and session_credits; no production changes.
-- Credit usage is derived from confirmed, credit-consuming appointments, not decremented.
BEGIN;
CREATE OR REPLACE FUNCTION public.confirm_appointment_tx(
 _appointment_id uuid, _starts timestamptz, _duration integer,
 _meeting text, _client_note text
) RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE a public.appointments%ROWTYPE; o public.orders%ROWTYPE;
 v_granted bigint; v_used bigint;
BEGIN
 IF _starts IS NULL OR _duration NOT BETWEEN 1 AND 1440 THEN
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
  IF NOT FOUND OR o.payment_status <> 'pago'
   OR o.customer_id IS DISTINCT FROM a.customer_id
   OR o.catalog_key IS DISTINCT FROM a.catalog_key THEN
   RAISE EXCEPTION 'paid order ownership mismatch';
  END IF;
  -- The order row serializes confirmations for the same order.
  SELECT coalesce(sum(granted),0) INTO v_granted FROM public.session_credits
   WHERE order_id=a.order_id AND customer_id=a.customer_id
   AND catalog_key=a.catalog_key;
  SELECT count(*) INTO v_used FROM public.appointments
   WHERE order_id=a.order_id AND consumes_credit AND status IN ('confirmada','concluida')
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
-- IMPORTANT unresolved: credit refunds, cancelled reschedules, unique credit grants,
-- and callers' explicit service_role EXECUTE permission need integration tests.
ROLLBACK;

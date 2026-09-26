-- STAGED ONLY. Isolated PostgreSQL tests and separate production approval required.
-- Dedicated LDR ONE inbox: do not change shared stripe_webhook_events or existing products.
CREATE TABLE IF NOT EXISTS public.ldr_one_webhook_inbox (
  event_id text PRIMARY KEY CHECK (event_id ~ '^evt_[A-Za-z0-9]+$'),
  event_type text NOT NULL,
  state text NOT NULL DEFAULT 'received'
    CHECK (state IN ('received','processing','completed','failed')),
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  claim_token uuid,
  lease_expires_at timestamptz,
  received_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  last_error text
);
ALTER TABLE public.ldr_one_webhook_inbox ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.ldr_one_webhook_inbox FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.ldr_one_webhook_inbox TO service_role;

-- One atomic claim per event, even under concurrent webhook deliveries.
-- A non-completed in-flight event is never acknowledged as completed.
CREATE OR REPLACE FUNCTION public.ldr_one_claim_webhook_event(
  p_event_id text, p_event_type text, p_max_attempts integer DEFAULT 10
) RETURNS TABLE(decision text, token uuid)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE v public.ldr_one_webhook_inbox%ROWTYPE; v_token uuid;
BEGIN
  IF p_event_id IS NULL OR p_event_id !~ '^evt_[A-Za-z0-9]+$'
    OR p_event_type IS NULL OR length(p_event_type) = 0
    OR p_max_attempts < 1 OR p_max_attempts > 100 THEN
    RAISE EXCEPTION 'Invalid webhook claim input';
  END IF;
  INSERT INTO public.ldr_one_webhook_inbox(event_id,event_type)
    VALUES (p_event_id,p_event_type) ON CONFLICT (event_id) DO NOTHING;
  SELECT * INTO v FROM public.ldr_one_webhook_inbox
    WHERE event_id=p_event_id FOR UPDATE;
  IF v.event_type <> p_event_type THEN
    RAISE EXCEPTION 'Webhook event type mismatch';
  END IF;
  IF v.state='completed' THEN
    RETURN QUERY SELECT 'acknowledge'::text, NULL::uuid; RETURN;
  END IF;
  IF v.attempts >= p_max_attempts THEN
    RETURN QUERY SELECT 'reject'::text, NULL::uuid; RETURN;
  END IF;
  IF v.state='processing' AND v.lease_expires_at > now() THEN
    RETURN QUERY SELECT 'retry_later'::text, NULL::uuid; RETURN;
  END IF;
  v_token := pg_catalog.gen_random_uuid();
  UPDATE public.ldr_one_webhook_inbox
    SET state='processing', attempts=attempts+1,
      claim_token=v_token, lease_expires_at=now()+interval '2 minutes',
      last_error=NULL
    WHERE event_id=p_event_id;
  RETURN QUERY SELECT 'claim'::text, v_token;
END $$;

CREATE OR REPLACE FUNCTION public.ldr_one_finish_webhook_event(
  p_event_id text, p_token uuid, p_success boolean, p_error text DEFAULT NULL
) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE v_count integer;
BEGIN
  IF p_event_id IS NULL OR p_token IS NULL OR p_success IS NULL THEN
    RAISE EXCEPTION 'Invalid webhook completion input';
  END IF;
  UPDATE public.ldr_one_webhook_inbox
    SET state=CASE WHEN p_success THEN 'completed' ELSE 'failed' END,
      completed_at=CASE WHEN p_success THEN now() ELSE NULL END,
      lease_expires_at=NULL, claim_token=NULL,
      last_error=CASE WHEN p_success THEN NULL ELSE left(coalesce(p_error,'handler failed'),500) END
    WHERE event_id=p_event_id AND claim_token=p_token AND state='processing'
      AND lease_expires_at > now();
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count=1;
END $$;

REVOKE ALL ON FUNCTION public.ldr_one_claim_webhook_event(text,text,integer) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.ldr_one_finish_webhook_event(text,uuid,boolean,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.ldr_one_claim_webhook_event(text,text,integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.ldr_one_finish_webhook_event(text,uuid,boolean,text) TO service_role;
-- TODO before integration: authoritative Stripe reconciliation and per-subscription
-- monotonic update, real concurrent Postgres tests and lease-expiry recovery.

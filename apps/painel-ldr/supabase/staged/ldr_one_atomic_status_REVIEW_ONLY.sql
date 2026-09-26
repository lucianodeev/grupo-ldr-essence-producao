-- STAGED ONLY: isolated PostgreSQL tests and separate migration approval required.
-- Apply AFTER ldr_one_event_cursor_REVIEW_ONLY.sql. No automatic production migration.
-- This is a narrow status/cursor transaction; Stripe authenticity, entitlement
-- verification and same-second reconciliation MUST occur in the server first.
CREATE OR REPLACE FUNCTION public.ldr_one_apply_ordered_status(
  p_subscription_id uuid,
  p_event_id text,
  p_event_created bigint,
  p_status text
) RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE v_subscription public.ldr_pass_subscriptions%ROWTYPE;
        v_cursor public.ldr_one_event_cursor%ROWTYPE;
BEGIN
  IF p_subscription_id IS NULL OR p_event_id IS NULL
    OR p_event_id !~ '^evt_[A-Za-z0-9]+$'
    OR p_event_created IS NULL OR p_event_created <= 0
    OR p_status IS NULL OR p_status NOT IN
      ('pending','active','trialing','past_due','canceled','unpaid','paused','incomplete') THEN
    RAISE EXCEPTION 'Invalid ordered subscription event';
  END IF;
  SELECT * INTO v_subscription FROM public.ldr_pass_subscriptions
    WHERE id=p_subscription_id FOR UPDATE;
  IF NOT FOUND OR v_subscription.ldr_one_offer NOT IN ('individual','business')
    OR v_subscription.stripe_subscription_id IS NULL THEN
    RAISE EXCEPTION 'Valid LDR ONE Stripe subscription required';
  END IF;
  SELECT * INTO v_cursor FROM public.ldr_one_event_cursor
    WHERE subscription_id=p_subscription_id;
  IF FOUND THEN
    IF v_cursor.last_event_id=p_event_id THEN RETURN 'duplicate'; END IF;
    IF p_event_created < v_cursor.last_event_created THEN RETURN 'stale'; END IF;
    IF p_event_created = v_cursor.last_event_created THEN RETURN 'reconcile'; END IF;
  END IF;
  -- The subscription update and cursor advance commit in the SAME transaction.
  UPDATE public.ldr_pass_subscriptions
    SET status=p_status,updated_at=now()
    WHERE id=p_subscription_id;
  INSERT INTO public.ldr_one_event_cursor
    (subscription_id,last_event_created,last_event_id,updated_at)
    VALUES(p_subscription_id,p_event_created,p_event_id,now())
    ON CONFLICT(subscription_id) DO UPDATE
      SET last_event_created=excluded.last_event_created,
          last_event_id=excluded.last_event_id,updated_at=now();
  RETURN 'applied';
END $$;
REVOKE ALL ON FUNCTION public.ldr_one_apply_ordered_status(uuid,text,bigint,text)
  FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.ldr_one_apply_ordered_status(uuid,text,bigint,text)
  TO service_role;
-- IMPORTANT: not a drop-in replacement for setLdrPassSubscription. That path
-- also updates period/customer/session fields and must be reconciled atomically
-- before wiring this RPC into the shared Stripe webhook.

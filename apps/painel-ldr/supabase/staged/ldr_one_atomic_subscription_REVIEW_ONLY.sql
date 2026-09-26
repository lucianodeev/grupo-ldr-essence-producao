-- STAGED ONLY: isolated PostgreSQL validation required; NEVER auto-apply to production.
-- Apply after ldr_one_event_cursor_REVIEW_ONLY.sql.
-- Atomic update of LDR ONE status, Stripe references, billing period and event cursor.
-- Server must verify Stripe signature, identify the LDR ONE product, and reconcile
-- ambiguous same-second events against Stripe before invoking this RPC.
CREATE OR REPLACE FUNCTION public.ldr_one_apply_ordered_subscription(
  p_subscription_id uuid, p_event_id text, p_event_created bigint,
  p_status text, p_stripe_subscription_id text,
  p_stripe_customer_id text DEFAULT NULL,
  p_stripe_checkout_session_id text DEFAULT NULL,
  p_period_start timestamptz DEFAULT NULL,
  p_period_end timestamptz DEFAULT NULL,
  p_cancel_at_period_end boolean DEFAULT NULL
) RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE v_subscription public.ldr_pass_subscriptions%ROWTYPE;
        v_cursor public.ldr_one_event_cursor%ROWTYPE;
BEGIN
  IF p_subscription_id IS NULL OR p_event_id IS NULL
    OR p_event_id !~ '^evt_[A-Za-z0-9]+$'
    OR p_event_created IS NULL OR p_event_created <= 0
    OR p_stripe_subscription_id IS NULL OR p_stripe_subscription_id !~ '^sub_[A-Za-z0-9]+$'
    OR p_status IS NULL OR p_status NOT IN
      ('pending','active','trialing','past_due','canceled','unpaid','paused','incomplete')
    OR (p_period_start IS NOT NULL AND p_period_end IS NOT NULL
        AND p_period_end <= p_period_start) THEN
    RAISE EXCEPTION 'Invalid LDR ONE subscription event';
  END IF;
  -- The parent lock serializes both first-event and subsequent updates.
  SELECT * INTO v_subscription FROM public.ldr_pass_subscriptions
    WHERE id=p_subscription_id FOR UPDATE;
  IF NOT FOUND OR v_subscription.ldr_one_offer IS NULL
    OR v_subscription.ldr_one_offer NOT IN ('individual','business')
    OR (v_subscription.stripe_subscription_id IS NOT NULL
        AND v_subscription.stripe_subscription_id <> p_stripe_subscription_id) THEN
    RAISE EXCEPTION 'LDR ONE subscription identity mismatch';
  END IF;
  SELECT * INTO v_cursor FROM public.ldr_one_event_cursor
    WHERE subscription_id=p_subscription_id;
  IF FOUND THEN
    IF v_cursor.last_event_id=p_event_id THEN RETURN 'duplicate'; END IF;
    IF p_event_created < v_cursor.last_event_created THEN RETURN 'stale'; END IF;
    IF p_event_created = v_cursor.last_event_created THEN RETURN 'reconcile'; END IF;
  END IF;
  -- A caller cannot shorten the known paid period through an incomplete event.
  IF p_period_end IS NOT NULL AND v_subscription.current_period_end IS NOT NULL
    AND p_period_end < v_subscription.current_period_end THEN
    RETURN 'reconcile';
  END IF;
  UPDATE public.ldr_pass_subscriptions
    SET status=p_status,
      stripe_subscription_id=p_stripe_subscription_id,
      stripe_customer_id=coalesce(p_stripe_customer_id,stripe_customer_id),
      stripe_checkout_session_id=coalesce(p_stripe_checkout_session_id,stripe_checkout_session_id),
      current_period_start=coalesce(p_period_start,current_period_start),
      current_period_end=coalesce(p_period_end,current_period_end),
      cancel_at_period_end=coalesce(p_cancel_at_period_end,cancel_at_period_end),
      updated_at=now()
    WHERE id=p_subscription_id;
  INSERT INTO public.ldr_one_event_cursor
    (subscription_id,last_event_created,last_event_id,updated_at)
    VALUES(p_subscription_id,p_event_created,p_event_id,now())
    ON CONFLICT(subscription_id) DO UPDATE
      SET last_event_created=excluded.last_event_created,
          last_event_id=excluded.last_event_id,updated_at=now();
  RETURN 'applied';
END $$;
REVOKE ALL ON FUNCTION public.ldr_one_apply_ordered_subscription(
  uuid,text,bigint,text,text,text,text,timestamptz,timestamptz,boolean)
  FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.ldr_one_apply_ordered_subscription(
  uuid,text,bigint,text,text,text,text,timestamptz,timestamptz,boolean)
  TO service_role;
-- This function is not connected to the production shared webhook. In particular,
-- checkout events without a verified subscription ID must be reconciled first.

-- STAGED ONLY. Requires isolated Postgres concurrency testing and explicit migration approval.
-- Dedicated cursor: does not change shared Stripe webhook tables or other subscriptions.
CREATE TABLE IF NOT EXISTS public.ldr_one_event_cursor (
  subscription_id uuid PRIMARY KEY REFERENCES public.ldr_pass_subscriptions(id) ON DELETE CASCADE,
  last_event_created bigint NOT NULL CHECK (last_event_created > 0),
  last_event_id text NOT NULL CHECK (last_event_id ~ '^evt_[A-Za-z0-9]+$'),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ldr_one_event_cursor ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.ldr_one_event_cursor FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT,UPDATE ON public.ldr_one_event_cursor TO service_role;

-- A decision is made under a row lock. This is a preflight decision only:
-- NEVER call this function and then update a subscription separately.
-- Production needs one transaction that performs the status update and cursor
-- advance atomically, or authoritative Stripe subscription reconciliation.
CREATE OR REPLACE FUNCTION public.ldr_one_event_order_preflight(
  p_subscription_id uuid, p_event_id text, p_created bigint
) RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE v public.ldr_one_event_cursor%ROWTYPE;
BEGIN
  IF p_subscription_id IS NULL OR p_event_id IS NULL
    OR p_event_id !~ '^evt_[A-Za-z0-9]+$'
    OR p_created IS NULL OR p_created <= 0 THEN
    RETURN 'reconcile';
  END IF;
  -- Lock the parent even when no cursor exists, serializing first-event checks.
  PERFORM 1 FROM public.ldr_pass_subscriptions
    WHERE id=p_subscription_id FOR UPDATE;
  IF NOT FOUND THEN RETURN 'reconcile'; END IF;
  SELECT * INTO v FROM public.ldr_one_event_cursor
    WHERE subscription_id=p_subscription_id;
  IF NOT FOUND THEN RETURN 'apply'; END IF;
  IF v.last_event_id=p_event_id THEN RETURN 'duplicate'; END IF;
  IF p_created < v.last_event_created THEN RETURN 'stale'; END IF;
  IF p_created = v.last_event_created THEN RETURN 'reconcile'; END IF;
  RETURN 'apply';
END $$;
REVOKE ALL ON FUNCTION public.ldr_one_event_order_preflight(uuid,text,bigint) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.ldr_one_event_order_preflight(uuid,text,bigint) TO service_role;
COMMENT ON FUNCTION public.ldr_one_event_order_preflight(uuid,text,bigint) IS
  'Diagnostic preflight only. Never authorize a separate subscription update from this result.';

-- STAGED ONLY: review backup and apply in an approved maintenance window.
-- No public grants. Only the server service role may call the allocator.
CREATE TABLE IF NOT EXISTS public.ldr_one_seat_allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL REFERENCES public.ldr_pass_subscriptions(id) ON DELETE CASCADE,
  auth_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz
);
CREATE UNIQUE INDEX IF NOT EXISTS ldr_one_one_active_seat_per_subscription_user
  ON public.ldr_one_seat_allocations(subscription_id,auth_user_id) WHERE revoked_at IS NULL;
CREATE INDEX IF NOT EXISTS ldr_one_active_seat_lookup
  ON public.ldr_one_seat_allocations(auth_user_id,subscription_id) WHERE revoked_at IS NULL;
ALTER TABLE public.ldr_one_seat_allocations ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.ldr_one_seat_allocations FROM anon, authenticated;
-- Lock parent subscription row to serialize concurrent seat assignments.
CREATE OR REPLACE FUNCTION public.ldr_one_allocate_seat(
  p_subscription_id uuid, p_auth_user_id uuid
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE s public.ldr_pass_subscriptions%ROWTYPE; existing_id uuid; seat_count integer; result_id uuid;
BEGIN
  IF p_subscription_id IS NULL OR p_auth_user_id IS NULL THEN RAISE EXCEPTION 'Missing seat assignment identity'; END IF;
  SELECT * INTO s FROM public.ldr_pass_subscriptions WHERE id=p_subscription_id FOR UPDATE;
  IF NOT FOUND OR s.ldr_one_offer IS DISTINCT FROM 'business' OR s.ldr_one_seats < 5\n    OR s.status NOT IN ('active','trialing') OR s.stripe_subscription_id IS NULL\n    OR s.current_period_end IS NULL OR s.current_period_end <= now() THEN
    RAISE EXCEPTION 'Not a valid LDR ONE business subscription';
  END IF;
  SELECT id INTO existing_id FROM public.ldr_one_seat_allocations
    WHERE subscription_id=p_subscription_id AND auth_user_id=p_auth_user_id AND revoked_at IS NULL;
  IF existing_id IS NOT NULL THEN RETURN existing_id; END IF;
  SELECT count(*) INTO seat_count FROM public.ldr_one_seat_allocations
    WHERE subscription_id=p_subscription_id AND revoked_at IS NULL;
  IF seat_count >= s.ldr_one_seats THEN RAISE EXCEPTION 'Purchased seat limit reached'; END IF;
  INSERT INTO public.ldr_one_seat_allocations(subscription_id,auth_user_id)
    VALUES (p_subscription_id,p_auth_user_id) RETURNING id INTO result_id;
  RETURN result_id;
END $$;
REVOKE ALL ON FUNCTION public.ldr_one_allocate_seat(uuid,uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.ldr_one_allocate_seat(uuid,uuid) TO service_role;
COMMENT ON FUNCTION public.ldr_one_allocate_seat(uuid,uuid) IS
  'Server-only allocator; caller MUST verify organization admin authorization and subscription ownership before invocation.';

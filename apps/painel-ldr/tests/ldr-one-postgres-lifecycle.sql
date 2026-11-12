BEGIN;
DO $$
DECLARE sub_id uuid;
BEGIN
  INSERT INTO public.ldr_one_sandbox_subscriptions (customer_id,user_id,plan,billing_cycle,seats,status)
  VALUES ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222','business','monthly',5,'active')
  RETURNING id INTO sub_id;
  INSERT INTO public.ldr_one_sandbox_seat_assignments(subscription_id,user_id)
  VALUES
  (sub_id,'33333333-3333-4333-8333-333333333331'),
  (sub_id,'33333333-3333-4333-8333-333333333332'),
  (sub_id,'33333333-3333-4333-8333-333333333333'),
  (sub_id,'33333333-3333-4333-8333-333333333334'),
  (sub_id,'33333333-3333-4333-8333-333333333335');
  IF (SELECT count(*) FROM public.ldr_one_sandbox_seat_assignments WHERE subscription_id=sub_id)<>5 THEN
    RAISE EXCEPTION 'Five seats were not persisted';
  END IF;
  INSERT INTO public.ldr_one_sandbox_stripe_events (stripe_event_id,stripe_event_created,subscription_id,event_type)
  VALUES ('evt_isolated_test',1790000000,sub_id,'customer.subscription.updated');
  UPDATE public.ldr_one_sandbox_subscriptions SET status='canceled' WHERE id=sub_id;
  IF (SELECT status FROM public.ldr_one_sandbox_subscriptions WHERE id=sub_id)<>'canceled' THEN
    RAISE EXCEPTION 'Subscription cancellation state was not persisted';
  END IF;
  DELETE FROM public.ldr_one_sandbox_seat_assignments WHERE subscription_id=sub_id;
  IF EXISTS (SELECT 1 FROM public.ldr_one_sandbox_seat_assignments WHERE subscription_id=sub_id) THEN
    RAISE EXCEPTION 'Seats were not revoked';
  END IF;
END $$;
DO $$
BEGIN
  BEGIN
    INSERT INTO public.ldr_one_sandbox_subscriptions (customer_id,user_id,plan,billing_cycle,seats,status)
    VALUES ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222','business','monthly',4,'active');
    RAISE EXCEPTION 'BUG: four seats unexpectedly accepted';
  EXCEPTION WHEN check_violation THEN
    RAISE NOTICE 'Four seats rejected as expected';
  END;
END $$;
ROLLBACK;

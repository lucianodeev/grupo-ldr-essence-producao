-- Run ONLY against a disposable isolated PostgreSQL database.
\set ON_ERROR_STOP on
BEGIN;
CREATE ROLE anon NOLOGIN;
CREATE ROLE authenticated NOLOGIN;
CREATE ROLE service_role NOLOGIN;
CREATE SCHEMA auth;
CREATE TABLE auth.users(id uuid PRIMARY KEY);
CREATE TABLE public.ldr_pass_subscriptions(
 id uuid PRIMARY KEY, ldr_one_offer text, ldr_one_seats integer,
 status text, stripe_subscription_id text, stripe_customer_id text,
 stripe_checkout_session_id text, current_period_start timestamptz,
 current_period_end timestamptz, cancel_at_period_end boolean,
 updated_at timestamptz
);
\ir ../staged/ldr_one_business_seat_allocations_REVIEW_ONLY.sql
\ir ../staged/ldr_one_webhook_inbox_REVIEW_ONLY.sql
\ir ../staged/ldr_one_event_cursor_REVIEW_ONLY.sql
\ir ../staged/ldr_one_atomic_subscription_REVIEW_ONLY.sql
INSERT INTO auth.users VALUES
 ('10000000-0000-4000-8000-000000000001'),
 ('10000000-0000-4000-8000-000000000002'),
 ('10000000-0000-4000-8000-000000000003'),
 ('10000000-0000-4000-8000-000000000004'),
 ('10000000-0000-4000-8000-000000000005'),
 ('10000000-0000-4000-8000-000000000006');
INSERT INTO public.ldr_pass_subscriptions(id,ldr_one_offer,ldr_one_seats,status,stripe_subscription_id,current_period_end)
VALUES ('20000000-0000-4000-8000-000000000001','business',5,'active','sub_Test1',now()+interval '30 days');
DO $$
DECLARE sid uuid:='20000000-0000-4000-8000-000000000001'; i int; outcome text; claim record; claimed boolean;
BEGIN
 FOR i IN 1..5 LOOP
   PERFORM public.ldr_one_allocate_seat(sid,('10000000-0000-4000-8000-'||lpad(i::text,12,'0'))::uuid);
 END LOOP;
 IF (SELECT count(*) FROM public.ldr_one_seat_allocations WHERE revoked_at IS NULL)<>5 THEN
   RAISE EXCEPTION 'Expected five active seats'; END IF;
 BEGIN
   PERFORM public.ldr_one_allocate_seat(sid,'10000000-0000-4000-8000-000000000006');
   RAISE EXCEPTION 'Seat limit was bypassed';
 EXCEPTION WHEN OTHERS THEN
   IF SQLERRM='Seat limit was bypassed' THEN RAISE; END IF;
 END;
 IF NOT public.ldr_one_revoke_seat(sid,'10000000-0000-4000-8000-000000000005') THEN
   RAISE EXCEPTION 'Revocation failed'; END IF;
 PERFORM public.ldr_one_allocate_seat(sid,'10000000-0000-4000-8000-000000000006');
 SELECT * INTO claim FROM public.ldr_one_claim_webhook_event('evt_Test1','invoice.payment_succeeded',10);
 IF claim.decision<>'claim' OR claim.token IS NULL THEN RAISE EXCEPTION 'Initial claim failed'; END IF;
 SELECT (decision='retry_later') INTO claimed FROM public.ldr_one_claim_webhook_event('evt_Test1','invoice.payment_succeeded',10);
 IF NOT claimed THEN RAISE EXCEPTION 'Concurrent delivery was acknowledged prematurely'; END IF;
 IF NOT public.ldr_one_finish_webhook_event('evt_Test1',claim.token,true,NULL) THEN
   RAISE EXCEPTION 'Completion failed'; END IF;
 SELECT (decision='acknowledge') INTO claimed FROM public.ldr_one_claim_webhook_event('evt_Test1','invoice.payment_succeeded',10);
 IF NOT claimed THEN RAISE EXCEPTION 'Completed event not acknowledged'; END IF;
 outcome:=public.ldr_one_apply_ordered_subscription(sid,'evt_Test2',100,'past_due','sub_Test1');
 IF outcome<>'applied' THEN RAISE EXCEPTION 'Atomic update failed'; END IF;
 outcome:=public.ldr_one_apply_ordered_subscription(sid,'evt_Test3',99,'active','sub_Test1');
 IF outcome<>'stale' THEN RAISE EXCEPTION 'Stale event applied'; END IF;
 outcome:=public.ldr_one_apply_ordered_subscription(sid,'evt_Test4',100,'active','sub_Test1');
 IF outcome<>'reconcile' THEN RAISE EXCEPTION 'Same-second event applied'; END IF;
 IF (SELECT status FROM public.ldr_pass_subscriptions WHERE id=sid)<>'past_due' THEN
   RAISE EXCEPTION 'Stale event changed status'; END IF;
END $$;
ROLLBACK;

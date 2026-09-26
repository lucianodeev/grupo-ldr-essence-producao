-- READ ONLY. Run against intended test project before any migration.
SELECT current_database() AS database_name,
       current_setting('server_version') AS postgres_version,
       to_regclass('public.ldr_pass_subscriptions') IS NOT NULL AS subscription_table_present,
       to_regclass('public.ldr_one_seat_allocations') IS NOT NULL AS seat_table_present,
       to_regprocedure('public.ldr_one_allocate_seat(uuid,uuid)') IS NOT NULL AS allocation_rpc_present,
       to_regprocedure('public.ldr_one_revoke_seat(uuid,uuid)') IS NOT NULL AS revocation_rpc_present;
SELECT column_name,data_type,is_nullable FROM information_schema.columns
 WHERE table_schema='public' AND table_name='ldr_pass_subscriptions'
 AND column_name IN ('id','customer_id','ldr_one_offer','ldr_one_seats','status','stripe_subscription_id','current_period_end')
 ORDER BY column_name;
-- Once installed, verify no anon/authenticated EXECUTE grants:
SELECT p.proname, r.rolname,
       has_function_privilege(r.rolname,p.oid,'EXECUTE') AS can_execute
 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
 CROSS JOIN (SELECT rolname FROM pg_roles WHERE rolname IN ('anon','authenticated','service_role')) r
 WHERE n.nspname='public' AND p.proname IN ('ldr_one_allocate_seat','ldr_one_revoke_seat')
 ORDER BY p.proname,r.rolname;

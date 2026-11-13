"""Actual agenda RPC tests. Mutations are restricted to a disposable recovery DB."""
from concurrent.futures import ThreadPoolExecutor
import json
import re
import subprocess
import uuid


def verify_recovered(pg):
    # Never accept a network address, a supplied database, or merely a test flag.
    if not (pg.container and re.fullmatch(r'ldr-recovery-[0-9a-f]{12}', pg.container)
            and pg.db == 'ldr_restore'):
        raise RuntimeError('functional_tests_require_isolated_recovery_target')
    inspection = subprocess.run(['docker', 'inspect', pg.container], check=True,
                                capture_output=True, timeout=10)
    config = json.loads(inspection.stdout)[0]
    if (config['HostConfig']['NetworkMode'] != 'none' or
            config['HostConfig'].get('PortBindings') or config.get('Mounts')):
        raise RuntimeError('functional_tests_require_no_network_ports_or_mounts')
    if not pg.json("SELECT to_jsonb(current_database()='ldr_restore' AND current_setting('cron.launch_active_jobs')='off' AND current_setting('pg_net.database_name')='ldr_worker_disabled');", snapshot=False):
        raise RuntimeError('functional_tests_require_disabled_external_workers')

    ids = {n: str(uuid.uuid4()) for n in range(100)}
    q = lambda n: "'" + ids[n] + "'"
    key = 'recovery-' + uuid.uuid4().hex
    calendar = key + '-calendar'
    checks = 0
    def raw(sql):
        return pg.raw(sql, snapshot=False)
    def scalar(expr):
        return pg.json('SELECT to_jsonb(' + expr + ');', snapshot=False)
    def passed(label):
        nonlocal checks
        checks += 1
        print('PASS recovered agenda: ' + label, flush=True)
    def expect(sql, message):
        # Catch ONLY the expected database rejection; unexpected errors still fail.
        raw("DO $test$ BEGIN BEGIN " + sql + "; EXCEPTION WHEN OTHERS THEN "
            "IF SQLERRM=" + "'" + message.replace("'", "''") + "' THEN RETURN; END IF; RAISE; END; "
            "RAISE EXCEPTION 'expected rejection missing'; END $test$;")
    def confirm(n):
        return f"SELECT public.confirm_appointment_tx({q(n)},now()+interval '7 days',50,NULL,NULL)"

    raw(f"""INSERT INTO public.customers(id,full_name) VALUES ({q(2)},'Recovery synthetic'),({q(3)},'Recovery other');
    INSERT INTO public.orders(id,order_number,title,customer_id,catalog_key,payment_status)
    VALUES ({q(1)},'{key}','Recovery synthetic',{q(2)},'mentoria','pendente');
    INSERT INTO public.session_credits(order_id,customer_id,catalog_key,granted) VALUES ({q(1)},{q(2)},'mentoria',1);
    INSERT INTO public.appointments(id,order_id,customer_id,catalog_key,title,consumes_credit) VALUES
    """ + ','.join(f"({q(n)},{q(1)},{q(2)},'mentoria','Recovery synthetic',true)" for n in range(10,40)) + ';')
    expect(confirm(10), 'paid order ownership mismatch'); passed('unpaid order rejected')
    raw(f"UPDATE public.orders SET payment_status='pago' WHERE id={q(1)}; UPDATE public.appointments SET customer_id={q(3)} WHERE id={q(11)};")
    expect(confirm(11), 'paid order ownership mismatch'); passed('wrong customer rejected')
    raw(f"UPDATE public.appointments SET catalog_key='wrong' WHERE id={q(12)};")
    expect(confirm(12), 'paid order ownership mismatch'); passed('wrong catalog rejected')
    for duration in ('NULL', '0'):
        expect(f"SELECT public.confirm_appointment_tx({q(10)},now(),{duration},NULL,NULL)", 'invalid appointment schedule')
    passed('invalid durations rejected')
    raw(confirm(10) + ';' + confirm(10) + ';')
    assert scalar(f"(SELECT count(*)=1 FROM public.appointments WHERE order_id={q(1)} AND credit_reserved)")
    passed('confirmation idempotent')
    expect(confirm(13), 'insufficient session credits'); passed('exhausted credits rejected')
    expect(f"UPDATE public.appointments SET status='confirmada',starts_at=now(),ends_at=now()+interval '1 hour' WHERE id={q(13)}", 'insufficient session credits')
    passed('direct writes cannot bypass credit limits')
    raw(f"UPDATE public.appointments SET status='reagendada' WHERE id={q(10)};")
    expect(confirm(13), 'insufficient session credits'); raw(confirm(10) + ';')
    passed('reschedule retains reservation')
    raw(f"UPDATE public.appointments SET status='cancelada' WHERE id={q(10)};")
    expect(confirm(10), 'appointment not confirmable'); passed('cancellation releases credit and cannot reopen')

    def compete(n):
        # Each docker exec opens an independent actual PostgreSQL connection.
        sql = f"""SET ROLE service_role;
        CREATE FUNCTION pg_temp.try_confirm() RETURNS text LANGUAGE plpgsql AS $t$
        BEGIN PERFORM public.confirm_appointment_tx({q(n)},now()+interval '8 days',50,NULL,NULL);
        RETURN 'confirmed'; EXCEPTION WHEN OTHERS THEN
        IF SQLERRM='insufficient session credits' THEN RETURN 'rejected'; END IF; RAISE; END $t$;
        SELECT to_jsonb(pg_temp.try_confirm());"""
        return pg.json(sql, snapshot=False)
    with ThreadPoolExecutor(max_workers=20) as pool:
        results = list(pool.map(compete, range(20,40)))
    assert results.count('confirmed') == 1 and results.count('rejected') == 19
    passed('20 independent confirmations reserve exactly one credit')
    def claim(_):
        return pg.json(f"SET ROLE service_role; SELECT to_jsonb(c) FROM public.claim_calendar_sync({q(20)},'{calendar}',120) c;", snapshot=False)
    with ThreadPoolExecutor(max_workers=20) as pool:
        leases = list(pool.map(claim, range(20)))
    assert sum(x['claimed'] for x in leases) == 1
    token = next(x['lease_token'] for x in leases if x['claimed'])
    passed('20 calendar claims grant exactly one lease')
    assert scalar(f"public.release_calendar_sync({q(20)},{q(99)},'sincronizado','synthetic',NULL,NULL)") is False
    passed('wrong lease token rejected')
    expect(f"SELECT * FROM public.claim_calendar_sync({q(20)},'wrong-calendar',120)", 'calendar mismatch')
    raw(f"UPDATE public.appointment_calendar_sync SET lease_expires_at=clock_timestamp()-interval '1 second' WHERE appointment_id={q(20)};")
    assert scalar(f"public.release_calendar_sync({q(20)},'{token}','sincronizado','synthetic',NULL,NULL)") is False
    assert claim(0)['claimed']
    passed('expired lease recovers and stale token fails')
    raw(f"INSERT INTO public.mentorships(id,customer_id,order_id) VALUES ({q(50)},{q(2)},{q(1)}); INSERT INTO public.mentorship_sessions(id,mentorship_id,appointment_id) VALUES ({q(51)},{q(50)},{q(13)});")
    expect(f"SELECT public.confirm_mentorship_session_tx({q(51)},now(),'https://meet.google.com/synthetic')", 'insufficient session credits')
    passed('mentorship cannot bypass exhausted credits')
    raw(f"INSERT INTO public.appointments(id,title,consumes_credit) VALUES ({q(60)},'Recovery free',false); INSERT INTO public.mentorships(id) VALUES ({q(61)}); INSERT INTO public.mentorship_sessions(id,mentorship_id) VALUES ({q(62)},{q(61)});")
    expect(f"SELECT public.confirm_mentorship_session_tx({q(62)},now(),'https://meet.google.com/synthetic',{q(13)})", 'mentorship ownership mismatch')
    assert scalar(f"(SELECT appointment_id IS NULL FROM public.mentorship_sessions WHERE id={q(62)})")
    passed('wrong mentorship ownership rolls back')
    raw(f"SET ROLE service_role; SELECT public.confirm_mentorship_session_tx({q(62)},now()+interval '7 days','https://meet.google.com/synthetic',{q(60)}); RESET ROLE;")
    assert scalar(f"(SELECT confirmed_at IS NOT NULL FROM public.mentorship_sessions WHERE id={q(62)})")
    raw(f"UPDATE public.appointments SET status='cancelada' WHERE id={q(60)};")
    assert scalar(f"(SELECT meeting_url IS NULL FROM public.mentorship_sessions WHERE id={q(62)})")
    passed('free mentorship mirrors confirmation and cancellation')
    raw(f"UPDATE public.orders SET payment_status='reembolsado' WHERE id={q(1)};")
    expect(confirm(14), 'paid order ownership mismatch'); passed('refunded orders rejected')
    for role in ('anon','authenticated'):
        # Transaction rollback restores any temporary grant even if a check fails.
        raw(f"BEGIN; SET ROLE {role}; DO $t$ BEGIN BEGIN PERFORM * FROM public.appointments; EXCEPTION WHEN insufficient_privilege THEN RETURN; END; RAISE EXCEPTION 'browser access unexpectedly allowed'; END $t$; ROLLBACK;")
        raw(f"BEGIN; SET ROLE {role}; DO $t$ BEGIN BEGIN PERFORM public.confirm_appointment_tx(NULL,NULL,NULL,NULL,NULL); EXCEPTION WHEN insufficient_privilege THEN RETURN; END; RAISE EXCEPTION 'browser RPC unexpectedly allowed'; END $t$; ROLLBACK;")
    passed('anonymous and authenticated table and RPC access denied')
    raw("BEGIN; GRANT SELECT ON public.session_credits TO authenticated; SET ROLE authenticated; DO $t$ BEGIN IF EXISTS(SELECT 1 FROM public.session_credits) THEN RAISE EXCEPTION 'credit RLS failed'; END IF; END $t$; ROLLBACK;")
    passed('credit RLS denies rows even with temporary SELECT grant')
    raw(f"INSERT INTO public.service_catalog(catalog_key,name,billing_model,amount_cents) VALUES ('{key}','Recovery single','single_paid_session',0); INSERT INTO public.orders(id,order_number,title,customer_id,catalog_key,payment_status) VALUES ({q(70)},'{key}-70','Recovery synthetic',{q(2)},'{key}','pago'); INSERT INTO public.session_credits(order_id,customer_id,catalog_key,granted) VALUES ({q(70)},{q(2)},'{key}',1);")
    def request(_):
        return pg.json(f"SET ROLE service_role; SELECT public.client_request_appointment({q(2)},{q(70)},now()+interval '7 days',50,'',NULL,'Recovery synthetic');", snapshot=False)
    with ThreadPoolExecutor(max_workers=20) as pool:
        requests = list(pool.map(request, range(20)))
    assert sum(x['ok'] for x in requests)==1 and all(x['ok'] or x['error']=='no_credit' for x in requests)
    requested = next(x['appointment_id'] for x in requests if x['ok'])
    # UUID returned by our fixture RPC only; validate before SQL interpolation.
    requested = str(uuid.UUID(requested))
    passed('20 client requests create exactly one pending appointment')
    def reschedule(owner):
        return pg.json(f"SET ROLE service_role; SELECT public.client_reschedule_appointment({q(owner)},'{requested}',now()+interval '9 days','',NULL,'Recovery synthetic');", snapshot=False)
    assert not reschedule(3)['ok'] and reschedule(2)['ok']
    passed('client reschedule enforces ownership')
    raw(f"SELECT public.confirm_appointment_tx('{requested}',now()+interval '9 days',50,NULL,NULL);")
    expect(f"UPDATE public.session_credits SET granted=0 WHERE order_id={q(70)}", 'credit grant below existing reservations')
    passed('reserved credit grant cannot shrink')
    raw(f"UPDATE public.appointments SET status='concluida' WHERE id='{requested}';")
    assert reschedule(2)['error']=='closed'
    passed('completed appointment keeps its credit and stays closed')
    assert scalar("(SELECT count(*)=6 AND bool_and(has_function_privilege('service_role',oid,'EXECUTE') AND NOT has_function_privilege('anon',oid,'EXECUTE') AND NOT has_function_privilege('authenticated',oid,'EXECUTE')) FROM pg_proc WHERE pronamespace='public'::regnamespace AND proname IN ('confirm_appointment_tx','confirm_mentorship_session_tx','claim_calendar_sync','release_calendar_sync','client_request_appointment','client_reschedule_appointment'))")
    passed('six RPCs restricted to service_role')
    # No TRUNCATE, DELETE, bootstrap, or rollback script. The caller destroys only
    # its disposable container. Original recovered records are never fixtures.
    return checks


if __name__ == '__main__':
    import prepare as recovery
    recovery.SYNTHETIC_DIAGNOSTICS=True  # This entry point has synthetic rows only.
    try:
        with recovery.isolated() as pg:
            pg.raw('CREATE DATABASE ldr_restore TEMPLATE template0;', snapshot=False)
            pg.db='ldr_restore'
            bootstrap = recovery.run(['node','--input-type=module','-e',
                "import {bootstrap} from './scripts/agenda/schema-bootstrap.mjs'; process.stdout.write(bootstrap());"]).decode()
            bootstrap=re.sub(r'CREATE ROLE (anon|authenticated) NOLOGIN;',r'DO $r$ BEGIN CREATE ROLE \1 NOLOGIN; EXCEPTION WHEN duplicate_object THEN NULL; END $r$;',bootstrap)
            bootstrap=bootstrap.replace('CREATE ROLE service_role NOLOGIN BYPASSRLS;', 'DO $r$ BEGIN CREATE ROLE service_role NOLOGIN BYPASSRLS; EXCEPTION WHEN duplicate_object THEN NULL; END $r$;')
            pg.raw('SET search_path=public,extensions;\n'+bootstrap, snapshot=False)
            pg.raw(recovery.MIGRATION.read_text(), snapshot=False)
            count=verify_recovered(pg)
            print(f'PASS {count} functional checks on synthetic dependency schema; recovered data still required')
    except BaseException:
        print('BLOCKED isolated_functional_test_failed_details_withheld')
        raise SystemExit(1)

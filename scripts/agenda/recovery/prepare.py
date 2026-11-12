#!/usr/bin/env python3
"""Manual, fail-closed DB/Storage recovery rehearsal. Never writes to the source."""
import argparse
import contextlib
import hashlib
import json
import os
from pathlib import Path
import re
import secrets
import select
import shutil
import subprocess
import sys
import tarfile
import tempfile
import time
import urllib.parse
import urllib.request

PROJECT = 'sfrcsrzuoqdscflfuwik'
IMAGE = 'supabase/postgres:17.6.1.155@sha256:3866d94d8426927e8db3f1c5d790752292bfbe27b5f1f46e199ae1b7d3c1710b'
MIGRATION = Path('apps/painel-ldr/supabase/migrations/20261111200311_agenda_calendar_credit_integration.sql')
MAX_BYTES = 256 * 1024 * 1024
SYNTHETIC_DIAGNOSTICS = False

class Blocked(Exception):
    """Only a constant, non-sensitive message may be printed outside the archive."""

def require(ok, code):
    if not ok:
        raise Blocked(code)

def identifier(value):
    return '"' + value.replace('"', '""') + '"'

def literal(value):
    return "'" + value.replace("'", "''") + "'"

def sha(path):
    h = hashlib.sha256()
    with Path(path).open('rb') as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b''):
            h.update(chunk)
    return h.hexdigest()

def run(cmd, *, data=None, output=None, env=None, timeout=300):
    # Never propagate raw stderr, command args, SQL, URLs, rows, or exceptions.
    try:
        r = subprocess.run(cmd, input=data, stdout=output or subprocess.PIPE,
                           stderr=subprocess.PIPE, env=env, timeout=timeout, check=False)
    except (OSError, subprocess.TimeoutExpired):
        raise Blocked('subprocess_unavailable_or_timeout') from None
    if r.returncode and SYNTHETIC_DIAGNOSTICS:
        print('SYNTHETIC ONLY '+r.stderr.decode(errors='replace'),file=sys.stderr)
    require(r.returncode == 0, 'subprocess_failed_details_withheld')
    return r.stdout

class Pg:
    def __init__(self, container=None, user='postgres', db='postgres', remote_env=None):
        self.container, self.user, self.db = container, user, db
        self.env = remote_env or os.environ.copy()
        self.snapshot = None

    def command(self, program, *args):
        if self.container:
            return ['docker', 'exec', '-i', self.container, program,
                    '-U', self.user, '-d', self.db, *args]
        # Credentials only cross into the official PostgreSQL client container.
        flags = [flag for k in ('PGHOST','PGPORT','PGUSER','PGDATABASE','PGPASSWORD',
                                'PGSSLMODE','PGSSLROOTCERT','PGCONNECT_TIMEOUT','PGOPTIONS')
                 for flag in ('--env', k)]
        return ['docker', 'run', '--rm', '-i', *flags, '--entrypoint', program,
                IMAGE, *args]

    def raw(self, sql, output=None, snapshot=True):
        if self.snapshot and snapshot:
            sql = ('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY; '
                   'SET TRANSACTION SNAPSHOT ' + literal(self.snapshot) + ';\n' + sql + '\nCOMMIT;')
        return run(self.command('psql', '-X', '-qAt', '-v', 'ON_ERROR_STOP=1'),
                   data=sql.encode(), output=output, env=self.env)

    def json(self, sql, snapshot=True):
        return json.loads(self.raw(sql, snapshot=snapshot))

    def dump(self, dest):
        args = ['--format=custom', '--no-password', '--lock-wait-timeout=30s']
        if self.snapshot:
            args += ['--snapshot', self.snapshot]
        with dest.open('wb') as f:
            run(self.command('pg_dump', *args), output=f, env=self.env, timeout=600)
        require(0 < dest.stat().st_size <= MAX_BYTES, 'database_archive_size_limit')

    def roles(self, dest):
        # pg_dumpall has no -d (database) option; override local command construction.
        if self.container:
            cmd = ['docker','exec','-i',self.container,'pg_dumpall','-U',self.user,
                   '--roles-only','--no-role-passwords','--no-password']
        else:
            cmd = self.command('pg_dumpall','--roles-only','--no-role-passwords','--no-password')
        with dest.open('wb') as f:
            run(cmd, output=f, env=self.env)

@contextlib.contextmanager
def snapshot(pg):
    # Keep the exporting transaction open while pg_dump and all table reads import it.
    errors = tempfile.TemporaryFile()
    proc = subprocess.Popen(pg.command('psql','-X','-qAt','-v','ON_ERROR_STOP=1'),
                            stdin=subprocess.PIPE, stdout=subprocess.PIPE,
                            stderr=errors, env=pg.env)
    try:
        proc.stdin.write(b'BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY;\nSELECT pg_export_snapshot() \\g /dev/stdout\n')
        proc.stdin.flush()
        # A CLI/server error closes stdout. Connection timeout is enforced in env.
        require(bool(select.select([proc.stdout],[],[],20)[0]),'snapshot_export_timeout')
        value = proc.stdout.readline().decode().strip()
        if SYNTHETIC_DIAGNOSTICS and not re.fullmatch(r'[0-9A-Fa-f]+-[0-9A-Fa-f]+-[0-9]+',value):
            errors.seek(0)
            print('SYNTHETIC SNAPSHOT '+repr(value)+' '+errors.read().decode(errors='replace'),file=sys.stderr)
        require(bool(re.fullmatch(r'[0-9A-Fa-f]+-[0-9A-Fa-f]+-[0-9]+',value)), 'snapshot_export_failed')
        pg.snapshot = value
        yield
    finally:
        pg.snapshot = None
        if proc.poll() is None:
            try:
                proc.stdin.write(b'ROLLBACK;\n\\q\n'); proc.stdin.flush()
                proc.wait(timeout=10)
            except (BrokenPipeError, subprocess.TimeoutExpired):
                proc.kill(); proc.wait()
        if proc.stdin: proc.stdin.close()
        if proc.stdout: proc.stdout.close()
        errors.close()

TABLES = """SELECT coalesce(jsonb_agg(jsonb_build_object('schema',n.nspname,'name',c.relname,
 'kind',c.relkind,'rls',c.relrowsecurity,'force_rls',c.relforcerowsecurity,'owner',pg_get_userbyid(c.relowner))
 ORDER BY n.nspname,c.relname),'[]') FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
 WHERE c.relkind IN ('r','p','m') AND n.nspname !~ '^pg_' AND n.nspname<>'information_schema'
;"""
CATALOG = """SELECT coalesce(jsonb_agg(x ORDER BY x::text COLLATE "C"),'[]') FROM (
 SELECT jsonb_build_object('kind','column','schema',n.nspname,'table',c.relname,'name',a.attname,
 'type',format_type(a.atttypid,a.atttypmod),'notnull',a.attnotnull,'identity',a.attidentity,
 'generated',a.attgenerated,'default',pg_get_expr(ad.adbin,ad.adrelid)) x
 FROM pg_attribute a JOIN pg_class c ON c.oid=a.attrelid JOIN pg_namespace n ON n.oid=c.relnamespace
 LEFT JOIN pg_attrdef ad ON ad.adrelid=c.oid AND ad.adnum=a.attnum
 WHERE a.attnum>0 AND NOT a.attisdropped AND n.nspname !~ '^pg_' AND n.nspname<>'information_schema'
 AND c.relkind IN ('r','p','m','v')
 UNION ALL SELECT jsonb_build_object('kind','policy','value',to_jsonb(p)) FROM pg_policies p
 WHERE p.schemaname !~ '^pg_'
 UNION ALL SELECT jsonb_build_object('kind','constraint','schema',n.nspname,'table',c.relname,
 'name',k.conname,'definition',pg_get_constraintdef(k.oid)) FROM pg_constraint k
 JOIN pg_class c ON c.oid=k.conrelid JOIN pg_namespace n ON n.oid=c.relnamespace
 WHERE n.nspname !~ '^pg_' AND n.nspname<>'information_schema'
 UNION ALL SELECT jsonb_build_object('kind','index','schema',schemaname,'name',indexname,
 'definition',indexdef) FROM pg_indexes WHERE schemaname !~ '^pg_' AND schemaname<>'information_schema'
 UNION ALL SELECT jsonb_build_object('kind','function','schema',n.nspname,'name',p.proname,
 'args',pg_get_function_identity_arguments(p.oid),'definition',pg_get_functiondef(p.oid),
 'owner',pg_get_userbyid(p.proowner)) FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
 WHERE p.prokind IN ('f','p') AND n.nspname !~ '^pg_' AND n.nspname<>'information_schema'
 AND NOT EXISTS(SELECT 1 FROM pg_depend d WHERE d.classid='pg_proc'::regclass AND d.objid=p.oid AND d.deptype='e')
 UNION ALL SELECT jsonb_build_object('kind','extension_function_owner','schema',n.nspname,
 'name',p.proname,'args',pg_get_function_identity_arguments(p.oid),
 'routine_type',CASE WHEN p.prokind='p' THEN 'PROCEDURE' ELSE 'FUNCTION' END,
 'owner',pg_get_userbyid(p.proowner)) FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
 WHERE p.prokind IN ('f','p') AND n.nspname !~ '^pg_' AND n.nspname<>'information_schema'
 AND EXISTS(SELECT 1 FROM pg_depend d WHERE d.classid='pg_proc'::regclass AND d.objid=p.oid AND d.deptype='e')
 UNION ALL SELECT jsonb_build_object('kind','trigger','schema',n.nspname,'table',c.relname,
 'definition',pg_get_triggerdef(t.oid)) FROM pg_trigger t JOIN pg_class c ON c.oid=t.tgrelid
 JOIN pg_namespace n ON n.oid=c.relnamespace WHERE NOT t.tgisinternal AND n.nspname !~ '^pg_'
 UNION ALL SELECT jsonb_build_object('kind','enum','schema',n.nspname,'name',t.typname,
 'labels',(SELECT jsonb_agg(e.enumlabel ORDER BY e.enumsortorder) FROM pg_enum e WHERE e.enumtypid=t.oid))
 FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace WHERE t.typtype='e' AND n.nspname !~ '^pg_'
 UNION ALL SELECT jsonb_build_object('kind','view','schema',schemaname,'name',viewname,
 'definition',definition) FROM pg_views WHERE schemaname !~ '^pg_' AND schemaname<>'information_schema'
 UNION ALL SELECT jsonb_build_object('kind','extension','name',extname,'version',extversion) FROM pg_extension
 UNION ALL SELECT jsonb_build_object('kind','table_acl','schema',n.nspname,'name',c.relname,
 'grantee',CASE WHEN a.grantee=0 THEN 'PUBLIC' ELSE pg_get_userbyid(a.grantee) END,
 'grantor',pg_get_userbyid(a.grantor),'privilege',a.privilege_type,'grantable',a.is_grantable)
 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace CROSS JOIN LATERAL aclexplode(c.relacl) a
 WHERE n.nspname !~ '^pg_' AND n.nspname<>'information_schema'
 UNION ALL SELECT jsonb_build_object('kind','function_acl','schema',n.nspname,'name',p.proname,
 'args',pg_get_function_identity_arguments(p.oid),'grantee',CASE WHEN a.grantee=0 THEN 'PUBLIC' ELSE pg_get_userbyid(a.grantee) END,
 'grantor',pg_get_userbyid(a.grantor),'privilege',a.privilege_type,'grantable',a.is_grantable)
 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace CROSS JOIN LATERAL aclexplode(p.proacl) a
 WHERE n.nspname !~ '^pg_' AND n.nspname<>'information_schema'
 UNION ALL SELECT jsonb_build_object('kind','schema_acl','name',n.nspname,
 'grantee',CASE WHEN a.grantee=0 THEN 'PUBLIC' ELSE pg_get_userbyid(a.grantee) END,
 'grantor',pg_get_userbyid(a.grantor),'privilege',a.privilege_type,'grantable',a.is_grantable)
 FROM pg_namespace n CROSS JOIN LATERAL aclexplode(n.nspacl) a WHERE n.nspname !~ '^pg_' AND n.nspname<>'information_schema'
 UNION ALL SELECT jsonb_build_object('kind','default_acl','role',pg_get_userbyid(d.defaclrole),
 'schema',n.nspname,'object_type',d.defaclobjtype,
 'grantee',CASE WHEN a.grantee=0 THEN 'PUBLIC' ELSE pg_get_userbyid(a.grantee) END,
 'grantor',pg_get_userbyid(a.grantor),'privilege',a.privilege_type,'grantable',a.is_grantable)
 FROM pg_default_acl d LEFT JOIN pg_namespace n ON n.oid=d.defaclnamespace CROSS JOIN LATERAL aclexplode(d.defaclacl) a
 ) v;"""

# Metadata only in public evidence; detailed catalog, data hashes and filenames stay encrypted.
def inventory(pg, work):
    tables = pg.json(TABLES)
    for i, table in enumerate(tables):
        name = identifier(table['schema'])+'.'+identifier(table['name'])
        path = work / ('rows-'+str(i))
        with path.open('wb') as f:
            pg.raw('SELECT to_jsonb(t)::text FROM '+name+' t ORDER BY to_jsonb(t)::text COLLATE "C";', output=f)
        require(path.stat().st_size <= MAX_BYTES,'table_size_limit')
        table['sha256'] = sha(path)
        with path.open('rb') as f: table['rows'] = sum(1 for _ in f)
        path.unlink()
    seqs = pg.json("SELECT coalesce(jsonb_agg(jsonb_build_object('schema',schemaname,'name',sequencename) ORDER BY schemaname,sequencename),'[]') FROM pg_sequences WHERE schemaname !~ '^pg_';")
    for seq in seqs:
        name=identifier(seq['schema'])+'.'+identifier(seq['name'])
        seq['state']=pg.json('SELECT jsonb_build_object(\'last_value\',last_value::text,\'is_called\',is_called) FROM '+name+';')
    return {'tables':tables,'catalog':pg.json(CATALOG),'sequences':seqs}

@contextlib.contextmanager
def isolated():
    name='ldr-recovery-'+secrets.token_hex(6)
    # No ports, bind mounts, production credentials or outbound network.
    run(['docker','run','-d','--name',name,'--network','none',
         '-e','POSTGRES_HOST_AUTH_METHOD=trust','-e','POSTGRES_PASSWORD='+secrets.token_urlsafe(32),
         IMAGE,'postgres','-c','cron.launch_active_jobs=off','-c','cron.database_name=ldr_restore'])
    pg=Pg(name,user='supabase_admin')
    try:
        for _ in range(90):
            # The image can run PostgreSQL under a supervisor, so PID 1 is not
            # reliable. Its temporary init server has listen_addresses=''.
            ready=subprocess.run(pg.command('psql','-X','-qAt','-v','ON_ERROR_STOP=1',
                                  '-c',"SELECT current_setting('listen_addresses') <> '';"),
                                 stdout=subprocess.PIPE,stderr=subprocess.PIPE,timeout=5)
            if ready.returncode==0 and ready.stdout.strip()==b't': break
            time.sleep(1)
        else: raise Blocked('isolated_postgres_not_ready')
        yield pg
    finally:
        # Only the random disposable container created here is removed, never a remote resource.
        subprocess.run(['docker','rm','-f',name],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)

def restore(pg, archive, roles):
    pg.raw('CREATE ROLE ldr_restore_admin LOGIN SUPERUSER; CREATE DATABASE ldr_restore TEMPLATE template0;',snapshot=False)
    pg.user='ldr_restore_admin'
    # Preserve every ALTER/GRANT; tolerate only duplicate CREATE ROLE in isolated bootstrap.
    role_sql=re.sub(r'^CREATE ROLE (.+);$',r'DO $ldr_role$ BEGIN CREATE ROLE \1; EXCEPTION WHEN duplicate_object THEN NULL; END $ldr_role$;', roles.read_text(), flags=re.M)
    pg.raw(role_sql,snapshot=False)
    pg.db='ldr_restore'
    with archive.open('rb') as f:
        try:
            r=subprocess.run(['docker','exec','-i',pg.container,'pg_restore','-U',pg.user,
                              '-d',pg.db,'--exit-on-error','--single-transaction'],stdin=f,
                              stdout=subprocess.PIPE,stderr=subprocess.PIPE,timeout=600)
        except (OSError,subprocess.TimeoutExpired): raise Blocked('isolated_restore_timeout') from None
    if r.returncode and SYNTHETIC_DIAGNOSTICS:
        print('SYNTHETIC RESTORE '+r.stderr.decode(errors='replace'),file=sys.stderr)
    require(r.returncode==0,'isolated_restore_failed_no_errors_ignored')

def seal(work, out, passphrase):
    require(len(passphrase)>=24,'backup_passphrase_minimum_24_characters')
    require(not any(x in passphrase for x in ('\n','\r','\x00')), 'backup_passphrase_invalid_control_character')
    tarpath=work.parent/'payload.tar'
    with tarfile.open(tarpath,'w') as t:
        for file in sorted(work.rglob('*')):
            require(file.is_file() and not file.is_symlink(),'unexpected_archive_entry')
            t.add(file,arcname=str(file.relative_to(work)),recursive=False)
    encrypted=out/'recovery.tar.gpg'
    gpg_home=work.parent/'gnupg'
    gpg_home.mkdir(mode=0o700)
    run(['gpg','--homedir',str(gpg_home),'--batch','--yes','--pinentry-mode','loopback','--passphrase-fd','0',
         '--symmetric','--cipher-algo','AES256','--output',str(encrypted),str(tarpath)],
        data=passphrase.encode()+b'\n',timeout=300)
    decoded=work.parent/'decrypted.tar'
    run(['gpg','--homedir',str(gpg_home),'--batch','--yes','--pinentry-mode','loopback','--passphrase-fd','0',
         '--output',str(decoded),'--decrypt',str(encrypted)],data=passphrase.encode()+b'\n')
    run(['gpgconf','--homedir',str(gpg_home),'--kill','gpg-agent'])
    require(sha(decoded)==sha(tarpath),'encrypted_archive_roundtrip_mismatch')
    recovered=work.parent/'recovered'; recovered.mkdir()
    with tarfile.open(decoded) as t:
        for member in t.getmembers():
            require(member.isfile() and not Path(member.name).is_absolute() and '..' not in Path(member.name).parts,'unsafe_tar_entry')
        t.extractall(recovered,filter='data')
    for file in work.rglob('*'):
        require(sha(file)==sha(recovered/file.relative_to(work)),'recovered_file_hash_mismatch')
    return recovered

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self,*args,**kwargs):
        raise Blocked('storage_redirect_refused')

def storage_copy(objects, work, key):
    require(bool(key),'storage_credential_missing')
    opener=urllib.request.build_opener(NoRedirect)
    total=0
    entries=[]
    for i,obj in enumerate(objects):
        bucket=urllib.parse.quote(obj['bucket_id'],safe='')
        name=urllib.parse.quote(obj['name'],safe='/')
        url=f'https://{PROJECT}.supabase.co/storage/v1/object/authenticated/{bucket}/{name}'
        req=urllib.request.Request(url,headers={'Authorization':'Bearer '+key,'apikey':key})
        dest=work/f'storage-{i:06d}.bin'
        try:
            with opener.open(req,timeout=60) as response,dest.open('wb') as f:
                while chunk:=response.read(1024*1024):
                    total+=len(chunk); require(total<=MAX_BYTES,'storage_size_limit');f.write(chunk)
        except Blocked: raise
        except Exception: raise Blocked('storage_download_failed_details_withheld') from None
        entries.append({'object':obj,'file':dest.name,'bytes':dest.stat().st_size,'sha256':sha(dest)})
    (work/'storage-manifest.json').write_text(json.dumps(entries,sort_keys=True))

OBJECTS="SELECT coalesce(jsonb_agg(to_jsonb(o) ORDER BY bucket_id,name),'[]') FROM storage.objects o;"

def remote_environment():
    env=os.environ.copy()
    host=env.get('LDR_BACKUP_DB_HOST','')
    direct=host==f'db.{PROJECT}.supabase.co'
    require(direct or bool(re.fullmatch(r'aws-[0-9]+-eu-north-1\.pooler\.supabase\.com',host)), 'unapproved_database_host')
    user='postgres' if direct else 'postgres.'+PROJECT
    password=env.get('LDR_BACKUP_DB_PASSWORD','')
    require(bool(password),'database_password_missing')
    env.update(PGHOST=host,PGPORT='5432',PGUSER=user,PGDATABASE='postgres',PGPASSWORD=password,
               PGSSLMODE='verify-full',PGSSLROOTCERT='system',PGCONNECT_TIMEOUT='15',
               PGOPTIONS='-c default_transaction_read_only=on -c statement_timeout=120000')
    return env

def rehearse(source, work, out, passphrase, live=False):
    with snapshot(source):
        print('PASS read-only snapshot opened',flush=True)
        before=inventory(source,work)
        source.dump(work/'database.dump')
        source.roles(work/'roles.sql')
        print('PASS database and password-free roles exported',flush=True)
        if live:
            objects=source.json(OBJECTS)
            storage_copy(objects,work,os.environ.get('LDR_BACKUP_STORAGE_KEY',''))
            require(source.json(OBJECTS,snapshot=False)==objects,'storage_changed_during_backup')
        (work/'source-manifest.json').write_text(json.dumps(before,sort_keys=True))
        require(inventory(source,work)==before,'source_changed_during_snapshot')
    recovered=seal(work,out,passphrase)
    print('PASS encrypted payload decrypted with matching hashes',flush=True)
    with isolated() as target:
        restore(target,recovered/'database.dump',recovered/'roles.sql')
        print('PASS restore completed in a network-isolated container',flush=True)
        # PostgreSQL creates extension routines under the restoring role.
        # Replay original routine ownership using supported ALTER statements;
        # this also preserves the owner/grantor entries in extension ACLs.
        # Keep exact catalog comparison: no privileges or grantors are ignored.
        for table in before['tables']:
            kind='MATERIALIZED VIEW' if table['kind']=='m' else 'TABLE'
            name=identifier(table['schema'])+'.'+identifier(table['name'])
            target.raw('ALTER '+kind+' '+name+' OWNER TO '+identifier(table['owner'])+';',snapshot=False)
        for entry in before['catalog']:
            if entry.get('kind')=='extension_function_owner':
                routine=identifier(entry['schema'])+'.'+identifier(entry['name'])+'('+entry['args']+')'
                target.raw('ALTER '+entry['routine_type']+' '+routine+' OWNER TO '+identifier(entry['owner'])+';',snapshot=False)
        after=inventory(target,work.parent)
        if before!=after and SYNTHETIC_DIAGNOSTICS:
            for group in before:
                left={json.dumps(v,sort_keys=True) for v in before[group]}
                right={json.dumps(v,sort_keys=True) for v in after[group]}
                if left!=right:
                    print('SYNTHETIC DIFF '+group+' missing='+json.dumps(sorted(left-right)[:8])+' added='+json.dumps(sorted(right-left)[:8]),file=sys.stderr)
        require(before==after,'restored_data_schema_rls_acl_or_sequence_mismatch')
        migration_ok=False
        if live:
            # Only the disposable no-network container can ever receive this SQL.
            target.raw(MIGRATION.read_text(),snapshot=False)
            result=target.json("SELECT jsonb_build_object('rls',(SELECT bool_and(relrowsecurity) FROM pg_class WHERE oid IN ('public.appointments'::regclass,'public.appointment_events'::regclass,'public.appointment_calendar_sync'::regclass)), 'browser_denied', NOT has_table_privilege('anon','public.appointments','SELECT') AND NOT has_table_privilege('authenticated','public.appointments','SELECT'));",snapshot=False)
            require(result=={'rls':True,'browser_denied':True},'restored_migration_permissions_failed')
            migration_ok=True
    return {'database_restore_verified':True,'encrypted_payload_roundtrip_verified':True,
            'storage_files_recovered':live,'storage_service_restore_tested':False,
            'migration_applied_to_isolated_clone':migration_ok,
            'production_gate':False,'project_backup_complete':False,
            'pending':['external_service_configuration_and_encryption_keys',
                       'isolated_storage_service_restore','live_google_calendar_tests',
                       'payment_and_credit_tests_on_recovered_database'],
            'encrypted_archive_sha256':sha(out/'recovery.tar.gpg')}

def main():
    global SYNTHETIC_DIAGNOSTICS
    parser=argparse.ArgumentParser();parser.add_argument('--self-test',action='store_true');args=parser.parse_args()
    SYNTHETIC_DIAGNOSTICS = args.self_test
    os.umask(0o077)
    out=Path(os.environ.get('LDR_BACKUP_OUTPUT',tempfile.mkdtemp(prefix='ldr-ciphertext-'))).resolve()
    require(not out.exists() or not any(out.iterdir()),'output_directory_must_be_empty')
    out.mkdir(parents=True,exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='ldr-rehearsal-') as tmp:
        root=Path(tmp);work=root/'payload';work.mkdir()
        if args.self_test:
            with isolated() as source:
                source.raw("DO $roles$ BEGIN CREATE ROLE anon NOLOGIN; EXCEPTION WHEN duplicate_object THEN NULL; END $roles$; DO $roles$ BEGIN CREATE ROLE authenticated NOLOGIN; EXCEPTION WHEN duplicate_object THEN NULL; END $roles$; DO $roles$ BEGIN CREATE ROLE service_role NOLOGIN BYPASSRLS; EXCEPTION WHEN duplicate_object THEN NULL; END $roles$; CREATE TABLE public.recovery_fixture(id integer PRIMARY KEY, secret text); ALTER TABLE public.recovery_fixture ENABLE ROW LEVEL SECURITY; REVOKE ALL ON public.recovery_fixture FROM PUBLIC; INSERT INTO public.recovery_fixture VALUES (1,'synthetic only'); CREATE SEQUENCE public.recovery_seq; SELECT nextval('public.recovery_seq');",snapshot=False)
                result=rehearse(source,work,out,secrets.token_urlsafe(32))
            # Self-test ciphertext contains synthetic fixtures and has no reusable recovery key.
            (out/'recovery.tar.gpg').unlink()
        else:
            require(os.environ.get('GITHUB_EVENT_NAME')=='workflow_dispatch','manual_dispatch_required')
            require(os.environ.get('GITHUB_REF')=='refs/heads/main','reviewed_main_branch_required')
            require(os.environ.get('LDR_BACKUP_CONFIRM')==PROJECT,'project_confirmation_missing')
            require(os.environ.get('ACTIONS_STEP_DEBUG','').lower()!='true' and os.environ.get('RUNNER_DEBUG','')!='1','debug_logging_must_be_disabled')
            require(bool(os.environ.get('LDR_BACKUP_STORAGE_KEY','')),'storage_credential_missing')
            phrase=os.environ.get('LDR_BACKUP_PASSPHRASE','')
            require(len(phrase)>=24 and not any(c in phrase for c in ('\n','\r','\x00')),'valid_backup_passphrase_required')
            source=Pg(remote_env=remote_environment())
            result=rehearse(source,work,out,os.environ.get('LDR_BACKUP_PASSPHRASE',''),live=True)
        result['self_test']=args.self_test
        (out/'verification.json').write_text(json.dumps(result,indent=2)+'\n')
    print('PASS isolated synthetic rehearsal' if args.self_test else 'PASS encrypted database recovery rehearsal; production gate remains CLOSED')

if __name__=='__main__':
    try: main()
    except BaseException as exc:
        # Do not let exception tracebacks disclose source SQL, row contents, credentials or URLs.
        code=str(exc) if isinstance(exc,Blocked) else 'unexpected_failure_details_withheld'
        print('BLOCKED '+code,file=sys.stderr);sys.exit(1)

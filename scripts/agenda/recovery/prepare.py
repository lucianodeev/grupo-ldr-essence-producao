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
ROOT_CA = Path(__file__).with_name('supabase-prod-ca-2021.crt').resolve()
ROOT_CA_SHA256 = '700723581420dd1ac98fd7e9ac529f0ef210eadcaf87fc868a3ad7d114c2f3b7'
ROOT_CA_CONTAINER_PATH = '/etc/ssl/ldr-supabase-root.crt'

class Blocked(Exception):
    """Only a constant, non-sensitive message may be printed outside the archive."""

def require(ok, code):
    if not ok:
        raise Blocked(code)

def snapshot_failure_code(stderr):
    # Return fixed categories only. Never return fragments of server messages,
    # which can contain usernames, connection strings, SQL, or credential values.
    message = stderr.lower()
    categories = (
        ('snapshot_database_authentication_failed', (b'password authentication failed', b'sasl authentication failed')),
        ('snapshot_pooler_tenant_or_user_not_found', (b'tenant or user not found',)),
        ('snapshot_tls_verification_failed', (b'certificate verify failed', b'root certificate file', b'sslrootcert', b'certificate validation failed')),
        ('snapshot_dns_resolution_failed', (b'could not translate host name', b'name or service not known')),
        ('snapshot_connection_unavailable', (b'connection timed out', b'connection refused', b'network is unreachable')),
        ('snapshot_database_permission_denied', (b'permission denied', b'must be superuser')),
        ('snapshot_client_unavailable', (b'executable file not found', b'cannot connect to the docker daemon')),
    )
    for code, patterns in categories:
        if any(pattern in message for pattern in patterns):
            return code
    return 'snapshot_export_failed_details_withheld'

def restore_failure_code(stderr):
    message = stderr.lower()
    for parameter in ('transaction_timeout','idle_session_timeout','idle_in_transaction_session_timeout'):
        if ('unrecognized configuration parameter "'+parameter+'"').encode() in message:
            return 'isolated_restore_unknown_parameter_'+parameter
    if b'can only be loaded via shared_preload_libraries' in message:
        return 'isolated_restore_shared_preload_required'
    if b'can only be created in database' in message:
        return 'isolated_restore_extension_database_mismatch'
    # Only fixed public platform identifiers may appear in a diagnostic code.
    # SQL statements and arbitrary object names remain completely withheld.
    for schema in ('public','extensions','auth','storage','realtime','graphql','graphql_public','net','vault','pgsodium','pgsodium_masks','cron'):
        if ('schema "'+schema+'" already exists').encode() in message:
            return 'isolated_restore_schema_already_exists_'+schema
    for extension in ('pg_graphql','pg_net','pgsodium','supabase_vault','pg_cron','pg_stat_statements','pgcrypto','uuid-ossp','vector'):
        if extension.encode() in message and any(p in message for p in (b'is not available',b'could not open extension control file',b'could not access file',b'has no installation script')):
            return 'isolated_restore_extension_unavailable_'+extension.replace('-','_')
    if re.search(rb'role "[^"\r\n]+" does not exist',message):
        return 'isolated_restore_missing_role'
    for code, patterns in (
        ('isolated_restore_configuration_incompatible',(b'unrecognized configuration parameter',b'can only be loaded via shared_preload_libraries',b'can only be created in database')),
        ('isolated_restore_permission_denied',(b'permission denied',b'must be owner',b'must be superuser')),
        ('isolated_restore_duplicate_object',(b'already exists',)),
        ('isolated_restore_dependency_missing',(b'does not exist',)),
        ('isolated_restore_data_constraint_failed',(b'violates ',b'duplicate key value')),
    ):
        if any(p in message for p in patterns): return code
    return 'isolated_restore_failed_details_withheld'

def identifier(value):
    return '"' + value.replace('"', '""') + '"'

def safe_inventory_diff(before,after):
    # Counts and fixed catalog categories only. Never emit SQL, identifiers,
    # data, hashes, role names or arbitrary keys from either inventory.
    result={}
    kinds=('column','policy','constraint','index','function','schema_owner','relation_owner',
           'extension_function_owner','trigger','enum','view','extension','table_acl',
           'function_acl','schema_acl','default_acl')
    for group in ('tables','catalog','sequences'):
        left={json.dumps(v,sort_keys=True) for v in before[group]}
        right={json.dumps(v,sort_keys=True) for v in after[group]}
        if left!=right:
            entry={'missing':len(left-right),'added':len(right-left)}
            if group=='catalog':
                entry['kinds']={kind:{'missing':sum(json.loads(x).get('kind')==kind for x in left-right),
                                     'added':sum(json.loads(x).get('kind')==kind for x in right-left)}
                                for kind in kinds if any(json.loads(x).get('kind')==kind for x in (left^right))}
            result[group]=entry
    return result

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
        require(ROOT_CA.is_file() and sha(ROOT_CA) == ROOT_CA_SHA256, 'official_database_ca_checksum_mismatch')
        mount = 'type=bind,src='+str(ROOT_CA)+',dst='+ROOT_CA_CONTAINER_PATH+',readonly'
        return ['docker', 'run', '--rm', '-i', *flags, '--mount', mount, '--entrypoint', program,
                IMAGE, *args]

    def raw(self, sql, output=None, snapshot=True):
        # Canonical pg_get_* output must not depend on per-role search_path.
        sql="SET search_path='';\n"+sql
        if self.snapshot and snapshot:
            sql = ('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY; '
                   'SET TRANSACTION SNAPSHOT ' + literal(self.snapshot) + ';\n' + sql + '\nCOMMIT;')
        return run(self.command('psql', '-X', '-qAt', '-v', 'ON_ERROR_STOP=1'),
                   data=sql.encode(), output=output, env=self.env)

    def json(self, sql, snapshot=True):
        return json.loads(self.raw(sql, snapshot=snapshot))

    def dump(self, dest, schema_only=False):
        args = ['--format=custom', '--no-password', '--lock-wait-timeout=30s']
        if schema_only: args += ['--schema-only']
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
        if not re.fullmatch(r'[0-9A-Fa-f]+-[0-9A-Fa-f]+-[0-9]+',value):
            errors.seek(0)
            stderr = errors.read()
            if SYNTHETIC_DIAGNOSTICS:
                print('SYNTHETIC SNAPSHOT '+repr(value)+' '+stderr.decode(errors='replace'),file=sys.stderr)
            raise Blocked(snapshot_failure_code(stderr))
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
 UNION ALL SELECT jsonb_build_object('kind','schema_owner','name',n.nspname,
 'owner',pg_get_userbyid(n.nspowner)) FROM pg_namespace n
 WHERE n.nspname !~ '^pg_' AND n.nspname<>'information_schema'
 UNION ALL SELECT jsonb_build_object('kind','relation_owner','schema',n.nspname,'name',c.relname,
 'relation_kind',c.relkind,'owner',pg_get_userbyid(c.relowner)) FROM pg_class c
 JOIN pg_namespace n ON n.oid=c.relnamespace WHERE c.relkind IN ('r','p','m','v','S','f')
 AND n.nspname !~ '^pg_' AND n.nspname<>'information_schema'
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
def canonical_catalog(entries):
    # pg_policies.roles is an unordered set represented as an array. Its OID
    # traversal order can change on restore without changing permissions.
    for entry in entries:
        if entry.get('kind')=='policy':
            entry['value']['roles']=sorted(entry['value']['roles'])
    return sorted(entries,key=lambda x:json.dumps(x,sort_keys=True))

def sql_ast(sql):
    # Use PostgreSQL 17's real parser. Keep every semantic node, literal,
    # operator, cast and identifier; omit only source character positions.
    try:
        from pglast.parser import parse_sql_json,get_postgresql_version
        require(get_postgresql_version()[0]==17,'postgres_parser_major_mismatch')
        tree=json.loads(parse_sql_json(sql))
    except Blocked: raise
    except Exception: raise Blocked('catalog_sql_parse_failed') from None
    def visit(value):
        if isinstance(value,list): return [visit(x) for x in value]
        if not isinstance(value,dict): return value
        result={k:visit(v) for k,v in value.items() if k not in ('location','stmt_location','stmt_len')}
        # AND is associative in PostgreSQL's three-valued Boolean logic.
        # Preserve argument order and every OR/NOT boundary; never sort terms.
        if result.get('boolop')=='AND_EXPR' and set(result)<= {'boolop','args'}:
            args=[]
            for arg in result.get('args',[]):
                nested=arg.get('BoolExpr') if isinstance(arg,dict) else None
                if isinstance(nested,dict) and nested.get('boolop')=='AND_EXPR' and set(nested)<= {'boolop','args'}:
                    args.extend(nested.get('args',[]))
                else: args.append(arg)
            result['args']=args
        return result
    return visit(tree)

def comparable_inventory(manifest):
    result=json.loads(json.dumps(manifest))
    for entry in result['catalog']:
        if entry.get('kind')=='constraint':
            entry['definition']=sql_ast('ALTER TABLE '+identifier(entry['schema'])+'.'+identifier(entry['table'])+
                ' ADD CONSTRAINT '+identifier(entry['name'])+' '+entry['definition']+';')
        elif entry.get('kind')=='policy':
            policy=entry['value'];policy['roles']=sorted(policy['roles'])
            for field in ('qual','with_check'):
                if policy.get(field) is not None: policy[field]=sql_ast('SELECT '+policy[field]+';')
    result['catalog']=sorted(result['catalog'],key=lambda x:json.dumps(x,sort_keys=True))
    return result

def inventories_equivalent(before,after):
    return before==after or comparable_inventory(before)==comparable_inventory(after)

PLATFORM_TABLES=(('net','http_request_queue'),('net','_http_response'))

def backup_platform_data(source,work,manifest):
    present={(t['schema'],t['name']) for t in manifest['tables']}
    for schema,table in PLATFORM_TABLES:
        if (schema,table) not in present: continue
        path=work/('platform-'+schema+'-'+table+'.csv')
        with path.open('wb') as f:
            source.raw('COPY '+identifier(schema)+'.'+identifier(table)+' TO STDOUT WITH (FORMAT csv);',output=f)
        require(path.stat().st_size<=MAX_BYTES,'platform_table_size_limit')

def restore_platform_state(target,work,manifest):
    require(bool(target.container) and bool(re.fullmatch(r'ldr-recovery-[0-9a-f]{12}',target.container))
            and target.db=='ldr_restore','isolated_recovery_target_required')
    for schema,table in PLATFORM_TABLES:
        path=work/('platform-'+schema+'-'+table+'.csv')
        if not path.exists(): continue
        with path.open('rb') as f:
            result=subprocess.run(target.command('psql','-X','-q','-v','ON_ERROR_STOP=1','-c',
                'COPY '+identifier(schema)+'.'+identifier(table)+' FROM STDIN WITH (FORMAT csv);'),
                stdin=f,stdout=subprocess.PIPE,stderr=subprocess.PIPE,timeout=120)
        require(result.returncode==0,'isolated_platform_data_restore_failed')
    ddl=[]
    for seq in manifest['sequences']:
        state=seq['state'];name=identifier(seq['schema'])+'.'+identifier(seq['name'])
        require(isinstance(state['is_called'],bool),'invalid_sequence_state')
        ddl.append('SELECT pg_catalog.setval('+literal(name)+'::regclass,'+literal(state['last_value'])+
                   '::bigint,'+('true' if state['is_called'] else 'false')+');')
    # Extension installation can recreate its packaged defaults rather than
    # hosted/custom rules. Reconstruct changed rules from the decrypted manifest.
    current=canonical_catalog(target.json(CATALOG,snapshot=False))
    constraints={(e['schema'],e['table'],e['name']):e for e in current if e.get('kind')=='constraint'}
    policies={(e['value']['schemaname'],e['value']['tablename'],e['value']['policyname']):e
              for e in current if e.get('kind')=='policy'}
    for entry in manifest['catalog']:
        if entry.get('kind')=='constraint':
            key=(entry['schema'],entry['table'],entry['name']);old=constraints.get(key)
            if old==entry: continue
            relation=identifier(key[0])+'.'+identifier(key[1]);constraint=identifier(key[2])
            if old: ddl.append('ALTER TABLE '+relation+' DROP CONSTRAINT '+constraint+';')
            ddl.append('ALTER TABLE '+relation+' ADD CONSTRAINT '+constraint+' '+entry['definition']+';')
        elif entry.get('kind')=='policy':
            p=entry['value'];key=(p['schemaname'],p['tablename'],p['policyname']);old=policies.get(key)
            if old==entry: continue
            require(p['permissive'] in ('PERMISSIVE','RESTRICTIVE') and p['cmd'] in ('ALL','SELECT','INSERT','UPDATE','DELETE'),
                    'invalid_policy_metadata')
            relation=identifier(key[0])+'.'+identifier(key[1]);policy=identifier(key[2])
            if old: ddl.append('DROP POLICY '+policy+' ON '+relation+';')
            roles=','.join('PUBLIC' if role=='public' else identifier(role) for role in p['roles'])
            statement='CREATE POLICY '+policy+' ON '+relation+' AS '+p['permissive']+' FOR '+p['cmd']+' TO '+roles
            if p['qual'] is not None: statement+=' USING ('+p['qual']+')'
            if p['with_check'] is not None: statement+=' WITH CHECK ('+p['with_check']+')'
            ddl.append(statement+';')
    for table in manifest['tables']:
        if table['kind'] not in ('r','p'): continue
        relation=identifier(table['schema'])+'.'+identifier(table['name'])
        ddl.append('ALTER TABLE '+relation+(' ENABLE' if table['rls'] else ' DISABLE')+' ROW LEVEL SECURITY;')
        ddl.append('ALTER TABLE '+relation+(' FORCE' if table['force_rls'] else ' NO FORCE')+' ROW LEVEL SECURITY;')
    target.raw('\n'.join(ddl),snapshot=False)

def inventory(pg, work):
    tables = pg.json(TABLES)
    # Keep the exact canonical row bytes/hash, but avoid one TLS connection and
    # Docker startup per table. JSON object rows cannot equal our plain markers.
    for start in range(0,len(tables),25):
        batch=tables[start:start+25]
        marker='LDR_RECOVERY_'+secrets.token_hex(16)+'_'
        statements=[]
        for i,table in enumerate(batch):
            name=identifier(table['schema'])+'.'+identifier(table['name'])
            statements += ["SELECT "+str(i)+" AS table_index,0 AS phase,''::text AS row_value,"+literal(marker+str(i))+" AS value",
                           'SELECT '+str(i)+',1,to_jsonb(t)::text,to_jsonb(t)::text FROM '+name+' t']
        statements += ["SELECT "+str(len(batch))+",0,''::text,"+literal(marker+'END')+" AS value"]
        sql='SELECT value FROM ('+' UNION ALL '.join(statements)+') inventory_rows ORDER BY table_index,phase,row_value COLLATE "C";'
        path=work/'inventory-batch'
        try:
            with path.open('wb') as f: pg.raw(sql,output=f)
            require(path.stat().st_size<=MAX_BYTES*len(batch),'inventory_batch_size_limit')
            current=-1; digest=None; rows=0; size=0; ended=False
            with path.open('rb') as f:
                for line in f:
                    if line.startswith(marker.encode()):
                        expected=marker+(str(current+1) if current+1<len(batch) else 'END')+'\n'
                        require(line==expected.encode(),'inventory_marker_order_invalid')
                        if current>=0:
                            batch[current].update(sha256=digest.hexdigest(),rows=rows)
                        current+=1
                        if current==len(batch): ended=True; break
                        digest=hashlib.sha256(); rows=0; size=0
                    else:
                        require(0<=current<len(batch) and line.startswith(b'{'),'inventory_row_framing_invalid')
                        size+=len(line); require(size<=MAX_BYTES,'table_size_limit')
                        digest.update(line); rows+=1
                require(ended and not f.read(1),'inventory_batch_incomplete')
        finally:
            path.unlink(missing_ok=True)
    seqs = pg.json("SELECT coalesce(jsonb_agg(jsonb_build_object('schema',schemaname,'name',sequencename) ORDER BY schemaname,sequencename),'[]') FROM pg_sequences WHERE schemaname !~ '^pg_';")
    if seqs:
        states=[]
        for seq in seqs:
            name=identifier(seq['schema'])+'.'+identifier(seq['name'])
            states.append("(SELECT jsonb_build_object('last_value',last_value::text,'is_called',is_called) FROM "+name+")")
        values=pg.json('SELECT jsonb_build_array('+','.join(states)+');')
        require(len(values)==len(seqs),'sequence_inventory_incomplete')
        for seq,state in zip(seqs,values): seq['state']=state
    return {'tables':tables,'catalog':canonical_catalog(pg.json(CATALOG)),'sequences':seqs}

@contextlib.contextmanager
def isolated():
    name='ldr-recovery-'+secrets.token_hex(6)
    # No ports, bind mounts, production credentials or outbound network.
    run(['docker','run','-d','--name',name,'--network','none',
         '-e','POSTGRES_HOST_AUTH_METHOD=trust','-e','POSTGRES_PASSWORD='+secrets.token_urlsafe(32),
         IMAGE,'postgres','-c','shared_preload_libraries=pg_cron,pg_net,pg_stat_statements,supabase_vault',
         '-c','cron.launch_active_jobs=off','-c','cron.database_name=ldr_restore',
         '-c','pg_net.database_name=ldr_worker_disabled'])
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
        require(pg.json("SELECT to_jsonb(current_setting('cron.launch_active_jobs')='off' AND current_setting('cron.database_name')='ldr_restore' AND current_setting('pg_net.database_name')='ldr_worker_disabled');"),
                'isolated_scheduler_configuration_invalid')
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
    if r.returncode:
        raise Blocked(restore_failure_code(r.stderr))

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
               PGSSLMODE='verify-full',PGSSLROOTCERT=ROOT_CA_CONTAINER_PATH,PGCONNECT_TIMEOUT='15',
               PGOPTIONS='-c default_transaction_read_only=on -c statement_timeout=120000')
    return env

def rehearse(source, work, out, passphrase, live=False):
    render_config_verified=False
    if live:
        from external_config import capture
        capture(work,os.environ.get('LDR_BACKUP_APP_CONFIG_JSON',''))
    if live:
        # Fail early on platform schema/extension incompatibility, before the
        # expensive full row inventory. This is not a recovery proof and never
        # replaces the later complete encrypted archive restore/comparison.
        schema_archive=work.parent/'preflight-schema.dump'
        schema_roles=work.parent/'preflight-roles.sql'
        source.dump(schema_archive,schema_only=True)
        source.roles(schema_roles)
        with isolated() as preflight:
            restore(preflight,schema_archive,schema_roles)
        print('PASS isolated schema restore preflight; full recovery still required',flush=True)
    with snapshot(source):
        print('PASS read-only snapshot opened',flush=True)
        before=inventory(source,work)
        source.dump(work/'database.dump')
        source.roles(work/'roles.sql')
        backup_platform_data(source,work,before)
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
        restore_platform_state(target,recovered,json.loads((recovered/'source-manifest.json').read_text()))
        print('PASS restore completed in a network-isolated container',flush=True)
        # PostgreSQL creates extension routines under the restoring role.
        # Replay original routine ownership using supported ALTER statements;
        # this also preserves the owner/grantor entries in extension ACLs.
        # Keep exact catalog comparison: no privileges or grantors are ignored.
        ddl=[]
        relation_kinds={}
        for entry in before['catalog']:
            if entry.get('kind')=='schema_owner':
                ddl.append('ALTER SCHEMA '+identifier(entry['name'])+' OWNER TO '+identifier(entry['owner'])+';')
            elif entry.get('kind')=='relation_owner':
                relation_kinds[(entry['schema'],entry['name'])]=entry['relation_kind']
                kind={'r':'TABLE','p':'TABLE','m':'MATERIALIZED VIEW','v':'VIEW','S':'SEQUENCE','f':'FOREIGN TABLE'}[entry['relation_kind']]
                name=identifier(entry['schema'])+'.'+identifier(entry['name'])
                ddl.append('ALTER '+kind+' '+name+' OWNER TO '+identifier(entry['owner'])+';')
            elif entry.get('kind')=='extension_function_owner':
                routine=identifier(entry['schema'])+'.'+identifier(entry['name'])+'('+entry['args']+')'
                ddl.append('ALTER '+entry['routine_type']+' '+routine+' OWNER TO '+identifier(entry['owner'])+';')
        target.raw('\n'.join(ddl),snapshot=False)
        # Recreate explicit source ACLs, including explicit owner grants that a
        # logical restore may leave implicit. This does not invent permissions:
        # every grant is from the captured source catalog and the final comparison
        # still rejects any missing or additional privilege or grantor.
        grants=[]
        for entry in before['catalog']:
            kind=entry.get('kind')
            if kind not in ('schema_acl','table_acl','function_acl'): continue
            grantee='PUBLIC' if entry['grantee']=='PUBLIC' else identifier(entry['grantee'])
            option=' WITH GRANT OPTION' if entry['grantable'] else ''
            if kind=='schema_acl':
                obj='SCHEMA '+identifier(entry['name'])
            elif kind=='table_acl':
                object_type='SEQUENCE' if relation_kinds.get((entry['schema'],entry['name']))=='S' else 'TABLE'
                obj=object_type+' '+identifier(entry['schema'])+'.'+identifier(entry['name'])
            else:
                obj='ROUTINE '+identifier(entry['schema'])+'.'+identifier(entry['name'])+'('+entry['args']+')'
            grants.append('SET ROLE '+identifier(entry['grantor'])+'; GRANT '+entry['privilege']+
                          ' ON '+obj+' TO '+grantee+option+'; RESET ROLE;')
        target.raw('\n'.join(grants),snapshot=False)
        after=inventory(target,work.parent)
        matches=inventories_equivalent(before,after)
        if not matches:
            print('DIAGNOSTIC inventory_diff '+json.dumps(safe_inventory_diff(before,after),sort_keys=True),flush=True)
            private_diff={}
            for group in ('catalog',):
                left={json.dumps(v,sort_keys=True) for v in before[group]}
                right={json.dumps(v,sort_keys=True) for v in after[group]}
                private_diff[group]={'missing':[json.loads(x) for x in sorted(left-right)],
                                     'added':[json.loads(x) for x in sorted(right-left)]}
            run(['node',str(Path(__file__).with_name('encrypt-diagnostic.mjs')),
                 str(out/'diagnostic-cipher.json')],data=json.dumps(private_diff).encode())
        if not matches and SYNTHETIC_DIAGNOSTICS:
            for group in before:
                left={json.dumps(v,sort_keys=True) for v in before[group]}
                right={json.dumps(v,sort_keys=True) for v in after[group]}
                if left!=right:
                    print('SYNTHETIC DIFF '+group+' missing='+json.dumps(sorted(left-right)[:8])+' added='+json.dumps(sorted(right-left)[:8]),file=sys.stderr)
        require(matches,'restored_data_schema_rls_acl_or_sequence_mismatch')
        print('PASS exact data, sequence, RLS, ACL and parsed rule comparison',flush=True)
        if live and (recovered/'render-environment.json').exists():
            from external_config import verify_calendar_key
            render_config_verified=verify_calendar_key(target,recovered,run)
            require(render_config_verified,'recovered_calendar_key_failed')
            print('PASS encrypted Render configuration roundtrip and recovered Calendar token decryption',flush=True)
        migration_ok=False
        if live:
            # Only the disposable no-network container can ever receive this SQL.
            target.raw(MIGRATION.read_text(),snapshot=False)
            result=target.json("SELECT jsonb_build_object('rls',(SELECT bool_and(relrowsecurity) FROM pg_class WHERE oid IN ('public.appointments'::regclass,'public.appointment_events'::regclass,'public.appointment_calendar_sync'::regclass)), 'browser_denied', NOT has_table_privilege('anon','public.appointments','SELECT') AND NOT has_table_privilege('authenticated','public.appointments','SELECT'));",snapshot=False)
            require(result=={'rls':True,'browser_denied':True},'restored_migration_permissions_failed')
            migration_ok=True
            print('PASS agenda migration and basic permissions in isolated clone',flush=True)
            from verify_recovered import verify_recovered
            functional_checks=verify_recovered(target)
    return {'database_restore_verified':True,'encrypted_payload_roundtrip_verified':True,
            'table_count':len(before['tables']),'sequence_count':len(before['sequences']),
            'storage_files_recovered':live,'storage_service_restore_tested':False,
            'migration_applied_to_isolated_clone':migration_ok,
            'recovered_functional_checks':functional_checks if live else 0,
            'payment_and_credit_tests_on_recovered_database':live,
            'render_configuration_backup_verified':render_config_verified,
            'calendar_token_key_recovery_verified':render_config_verified,
            'production_gate':False,'project_backup_complete':False,
            'pending':['external_service_configuration_and_encryption_keys',
                       'isolated_storage_service_restore','live_google_calendar_tests'],
            'encrypted_archive_sha256':sha(out/'recovery.tar.gpg')}

def main():
    global SYNTHETIC_DIAGNOSTICS
    parser=argparse.ArgumentParser();parser.add_argument('--self-test',action='store_true');args=parser.parse_args()
    SYNTHETIC_DIAGNOSTICS = args.self_test
    sql_ast('SELECT true;')
    os.umask(0o077)
    out=Path(os.environ.get('LDR_BACKUP_OUTPUT',tempfile.mkdtemp(prefix='ldr-ciphertext-'))).resolve()
    require(not out.exists() or not any(out.iterdir()),'output_directory_must_be_empty')
    out.mkdir(parents=True,exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='ldr-rehearsal-') as tmp:
        root=Path(tmp);work=root/'payload';work.mkdir()
        if args.self_test:
            with isolated() as probe:
                probe.raw('CREATE DATABASE ldr_restore TEMPLATE template0;',snapshot=False)
                probe.db='ldr_restore'
                probe.raw('CREATE SCHEMA extensions; CREATE EXTENSION pg_cron WITH SCHEMA pg_catalog; CREATE EXTENSION pg_net WITH SCHEMA extensions;',snapshot=False)
                print('PASS isolated platform extension startup with scheduler disabled',flush=True)
            with isolated() as source:
                source.raw("DO $roles$ BEGIN CREATE ROLE anon NOLOGIN; EXCEPTION WHEN duplicate_object THEN NULL; END $roles$; DO $roles$ BEGIN CREATE ROLE authenticated NOLOGIN; EXCEPTION WHEN duplicate_object THEN NULL; END $roles$; DO $roles$ BEGIN CREATE ROLE service_role NOLOGIN BYPASSRLS; EXCEPTION WHEN duplicate_object THEN NULL; END $roles$; CREATE TABLE public.recovery_fixture(id integer PRIMARY KEY, secret text); ALTER TABLE public.recovery_fixture ENABLE ROW LEVEL SECURITY; REVOKE ALL ON public.recovery_fixture FROM PUBLIC; INSERT INTO public.recovery_fixture VALUES (1,'synthetic only'); CREATE SEQUENCE public.recovery_seq; SELECT nextval('public.recovery_seq');",snapshot=False)
                source.raw("CREATE SCHEMA IF NOT EXISTS extensions; CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions; INSERT INTO net._http_response(id,status_code,content,timed_out,created) VALUES (7001,200,E'synthetic only\\nsecond line',false,now()); SELECT pg_catalog.setval('net.http_request_queue_id_seq'::regclass,42,true); ALTER TABLE net._http_response ADD CONSTRAINT ldr_synthetic_positive_id CHECK (id>0); ALTER TABLE net._http_response ENABLE ROW LEVEL SECURITY; CREATE POLICY ldr_synthetic_response ON net._http_response TO authenticated,anon USING (false);",snapshot=False)
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

"""Storage API recovery rehearsal. Only disposable Docker network namespaces."""
import base64
import contextlib
import hashlib
import hmac
import json
from pathlib import Path, PurePosixPath
import re
import secrets
import subprocess
import tempfile
import time
import urllib.parse
import uuid

IMAGE='supabase/storage-api:v1.90.3@sha256:17010384ae107d663638aac64aaa794c23d5e9b834ebbe206eb392290b37e358'
SYNTHETIC_DIAGNOSTICS=False
TENANT='ldr-recovery-local'
BUCKET='ldr-recovery-files'
ROOT='/var/lib/ldr-storage-recovery'


def require(value, code):
    if not value:
        raise RuntimeError(code)


def jwt(secret, role, subject=None):
    enc=lambda value:base64.urlsafe_b64encode(json.dumps(value,separators=(',',':')).encode()).rstrip(b'=')
    claims={'role':role,'iss':'supabase','aud':'authenticated','exp':int(time.time())+3600}
    if subject: claims['sub']=subject
    payload=enc({'alg':'HS256','typ':'JWT'})+b'.'+enc(claims)
    return (payload+b'.'+base64.urlsafe_b64encode(hmac.new(secret.encode(),payload,hashlib.sha256).digest()).rstrip(b'=')).decode()


def guard(pg):
    require(pg.container and re.fullmatch(r'ldr-recovery-[0-9a-f]{12}',pg.container)
            and pg.db=='ldr_restore','storage_requires_disposable_recovery_database')
    result=subprocess.run(['docker','inspect',pg.container],capture_output=True,check=True,timeout=10)
    config=json.loads(result.stdout)[0]
    require(config['HostConfig']['NetworkMode']=='none' and not config['HostConfig'].get('PortBindings')
            and not config.get('Mounts'),'storage_requires_no_network_ports_or_mounts')


def backend_path(obj):
    parts=[BUCKET,TENANT,obj['bucket_id'],obj['name']]
    if obj.get('version'): parts.append(obj['version'])
    for part in parts:
        require(isinstance(part,str) and part and not part.startswith('/')
                and '\\' not in part and '\x00' not in part
                and all(p not in ('..','.') for p in part.split('/')),'storage_unsafe_backend_path')
    return str(PurePosixPath(ROOT,*parts))


CLIENT=r"""
let input=''; for await (const c of process.stdin) input+=c;
const p=JSON.parse(input);const headers={...(p.token?{Authorization:'Bearer '+p.token}:{}),...(p.headers||{})};
try {
 const r=await fetch('http://127.0.0.1:5000'+p.path,{method:p.method||'GET',headers,
 body:p.body?Buffer.from(p.body,'base64'):undefined,signal:AbortSignal.timeout(10000)});
 const b=Buffer.from(await r.arrayBuffer());
 console.log(JSON.stringify({status:r.status,bytes:b.length,sha256:(await import('node:crypto')).createHash('sha256').update(b).digest('hex')}));
}catch{console.log(JSON.stringify({status:0}));}
"""


@contextlib.contextmanager
def service(pg):
    guard(pg)
    name='ldr-storage-'+secrets.token_hex(6)
    secret=secrets.token_urlsafe(48)
    password=secrets.token_urlsafe(32)
    tokens={role:jwt(secret,role) for role in ('anon','service_role')}
    # This is ONLY a password for the recovered disposable local role. Never a source credential.
    pg.raw("ALTER ROLE supabase_storage_admin LOGIN PASSWORD '"+password+"';",snapshot=False)
    settings={
        'DATABASE_URL':f'postgres://supabase_storage_admin:{password}@127.0.0.1:5432/ldr_restore',
        'AUTH_JWT_SECRET':secret,'ANON_KEY':tokens['anon'],'SERVICE_KEY':tokens['service_role'],
        'STORAGE_BACKEND':'file','FILE_STORAGE_BACKEND_PATH':ROOT,'GLOBAL_S3_BUCKET':BUCKET,
        'TENANT_ID':TENANT,'REGION':'local','SERVER_HOST':'127.0.0.1','SERVER_PORT':'5000',
        'POSTGREST_URL':'http://127.0.0.1:3000','STORAGE_PUBLIC_URL':'http://127.0.0.1:5000',
        'ENABLE_IMAGE_TRANSFORMATION':'false','TUS_USE_FILE_VERSION_SEPARATOR':'false',
        'DB_ALLOW_MIGRATION_REFRESH':'false','DB_INSTALL_ROLES':'false',
        'DB_SUPER_USER':'supabase_storage_admin','PG_QUEUE_ENABLE':'false',
        'PG_QUEUE_WORKERS_ENABLE':'false','VECTOR_ENABLED':'false','VECTOR_STORE_MIGRATIONS_ENABLED':'false',
        'HTTP_PROXY':'','HTTPS_PROXY':'','ALL_PROXY':'',
    }
    cmd=['docker','run','-d','--name',name,'--network','container:'+pg.container]
    for key,value in settings.items():cmd+=['--env',key+'='+value]
    cmd.append(IMAGE)
    result=subprocess.run(cmd,capture_output=True,timeout=60)
    require(result.returncode==0,'isolated_storage_start_failed')
    def request(path,token=None,method='GET',body=None,headers=None):
        data={'path':path,'token':token,'method':method,'headers':headers}
        if body is not None:data['body']=base64.b64encode(body).decode()
        r=subprocess.run(['docker','exec','-i',name,'node','--input-type=module','-e',CLIENT],input=json.dumps(data).encode(),
                         capture_output=True,timeout=20)
        require(r.returncode==0,'isolated_storage_client_failed')
        return json.loads(r.stdout)
    try:
        for _ in range(60):
            try:
                if request('/status')['status']==200:break
            except (RuntimeError,ValueError):pass
            time.sleep(1)
        else:
            if SYNTHETIC_DIAGNOSTICS:
                diagnostic=subprocess.run(['docker','logs',name],capture_output=True,timeout=10)
                text=(diagnostic.stdout+diagnostic.stderr).decode(errors='replace')
                for value in [password,secret,*settings.values(),*tokens.values()]:
                    if len(value)>=16:text=text.replace(value,'[redacted]')
                text=re.sub(r'postgres(?:ql)?://[^\s"\\]+','[redacted-local-uri]',text)
                text=re.sub(r'eyJ[A-Za-z0-9_.-]+','[redacted-local-jwt]',text)
                print('SYNTHETIC STORAGE ONLY '+text[-6000:],flush=True)
            raise RuntimeError('isolated_storage_not_ready')
        yield name,request,tokens,secret
    finally:
        subprocess.run(['docker','rm','-f',name],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)


def verify_storage(pg,payload):
    guard(pg)
    entries=json.loads((payload/'storage-manifest.json').read_text())
    before=pg.json("SELECT coalesce(jsonb_agg(to_jsonb(o) ORDER BY bucket_id,name),'[]') FROM storage.objects o;",snapshot=False)
    require([x['object'] for x in entries]==before,'storage_recovered_metadata_mismatch')
    buckets=pg.json("SELECT coalesce(jsonb_agg(to_jsonb(b) ORDER BY id),'[]') FROM storage.buckets b;",snapshot=False)
    bucket_by_id={b['id']:b for b in buckets}
    checks=0
    with service(pg) as (name,request,tokens,secret):
        for entry in entries:
            obj=entry['object'];path=backend_path(obj)
            require(re.fullmatch(r'storage-[0-9]{6}\.bin',entry['file']),'storage_invalid_payload_name')
            file=payload/entry['file']
            require(file.stat().st_size==entry['bytes'] and hashlib.sha256(file.read_bytes()).hexdigest()==entry['sha256'],
                    'storage_payload_hash_mismatch')
            # Official FileBackend layout, fixed root, stdin bytes, no shell interpolation or mounts.
            seed="const fs=require('node:fs'),p=require('node:path');const f=process.argv[1];if(!f.startsWith('"+ROOT+"/'))process.exit(2);fs.mkdirSync(p.dirname(f),{recursive:true});fs.writeFileSync(f,fs.readFileSync(0));"
            with file.open('rb') as content:
                r=subprocess.run(['docker','exec','-i',name,'node','-e',seed,path],stdin=content,
                                 stdout=subprocess.PIPE,stderr=subprocess.PIPE,timeout=60)
            require(r.returncode==0,'isolated_storage_file_seed_failed')
            url='/object/authenticated/'+urllib.parse.quote(obj['bucket_id'],safe='')+'/'+urllib.parse.quote(obj['name'],safe='/')
            response=request(url,tokens['service_role'])
            require(response=={'status':200,'bytes':entry['bytes'],'sha256':entry['sha256']},'storage_service_readback_mismatch')
            checks+=1
            public=request(url.replace('/authenticated/','/public/',1))
            if bucket_by_id[obj['bucket_id']]['public']:
                require(public==response,'public_storage_recovery_failed')
            else:
                require(400<=public['status']<500,'private_storage_public_route_not_denied')
            checks+=1
            subjects=[('anon',None),('authenticated',str(uuid.uuid4()))]
            owner=obj.get('owner_id') or obj.get('owner')
            if owner:
                try:subjects.append(('authenticated',str(uuid.UUID(owner))))
                except (ValueError,TypeError):pass
            for role,subject in subjects:
                object_id=str(uuid.UUID(obj['id']))
                claims=json.dumps({'role':role,'sub':subject or ''},separators=(',',':')).replace("'","''")
                if bucket_by_id[obj['bucket_id']]['public']:
                    visible=True  # Official public buckets intentionally bypass row SELECT policies.
                else:
                    has_select=pg.json(f"SELECT to_jsonb(has_table_privilege('{role}','storage.objects','SELECT'));",snapshot=False)
                    visible=has_select and pg.json(f"BEGIN; SET LOCAL ROLE {role}; DO $c$ BEGIN PERFORM set_config('request.jwt.claims','{claims}',true); PERFORM set_config('request.jwt.claim.sub','{subject or ''}',true); END $c$; SELECT to_jsonb(EXISTS(SELECT 1 FROM storage.objects WHERE id='{object_id}')); ROLLBACK;",snapshot=False)
                result=request(url,jwt(secret,role,subject))
                if visible:
                    require(result==response,'storage_rls_allowed_readback_mismatch')
                else:
                    require(400<=result['status']<500,'storage_rls_denied_read_exposed')
                checks+=1
        require(pg.json("SELECT coalesce(jsonb_agg(to_jsonb(o) ORDER BY bucket_id,name),'[]') FROM storage.objects o;",snapshot=False)==before,
                'storage_service_changed_recovered_metadata')
        require(pg.json("SELECT coalesce(jsonb_agg(to_jsonb(b) ORDER BY id),'[]') FROM storage.buckets b;",snapshot=False)==buckets,
                'storage_service_changed_recovered_buckets')
    print(f'PASS isolated Storage service: {len(entries)} objects, {checks} content/public-access checks; metadata preserved',flush=True)
    return {'objects':len(entries),'buckets':len(buckets),'checks':checks}


if __name__=='__main__':
    import prepare as recovery
    SYNTHETIC_DIAGNOSTICS=True
    try:
        with recovery.isolated() as pg,tempfile.TemporaryDirectory(prefix='ldr-storage-synthetic-') as directory:
            pg.raw("CREATE DATABASE ldr_restore TEMPLATE template0;",snapshot=False);pg.db='ldr_restore'
            pg.raw("CREATE SCHEMA auth; CREATE TABLE auth.users(id uuid PRIMARY KEY); CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; DO $r$ BEGIN CREATE ROLE anon NOLOGIN; EXCEPTION WHEN duplicate_object THEN NULL; END $r$; DO $r$ BEGIN CREATE ROLE authenticated NOLOGIN; EXCEPTION WHEN duplicate_object THEN NULL; END $r$; DO $r$ BEGIN CREATE ROLE service_role NOLOGIN BYPASSRLS; EXCEPTION WHEN duplicate_object THEN NULL; END $r$; DO $r$ BEGIN CREATE ROLE supabase_storage_admin LOGIN SUPERUSER; EXCEPTION WHEN duplicate_object THEN ALTER ROLE supabase_storage_admin SUPERUSER; END $r$; GRANT anon,authenticated,service_role TO supabase_storage_admin;",snapshot=False)
            payload=Path(directory)
            with service(pg) as (name,request,tokens,_):
                for public in (False,True):
                    bucket='recovery-public' if public else 'recovery-private'
                    body=json.dumps({'id':bucket,'name':bucket,'public':public}).encode()
                    require(request('/bucket',tokens['service_role'],'POST',body,{'Content-Type':'application/json'})['status']==200,'synthetic_bucket_creation_failed')
                    require(request('/object/'+bucket+'/nested/fixture.txt',tokens['service_role'],'POST',b'synthetic restored bytes',{'Content-Type':'text/plain'})['status']==200,'synthetic_object_upload_failed')
                objects=pg.json("SELECT jsonb_agg(to_jsonb(o) ORDER BY bucket_id,name) FROM storage.objects o;",snapshot=False)
                entries=[]
                for i,obj in enumerate(objects):
                    file=payload/f'storage-{i:06d}.bin';file.write_bytes(b'synthetic restored bytes')
                    entries.append({'object':obj,'file':file.name,'bytes':file.stat().st_size,'sha256':hashlib.sha256(file.read_bytes()).hexdigest()})
                (payload/'storage-manifest.json').write_text(json.dumps(entries))
            verify_storage(pg,payload)
            print('PASS synthetic isolated Storage API recovery; production objects still required')
    except BaseException as error:
        # Only fixed failure categories; no body, row, path, token, or service log.
        code=str(error) if isinstance(error,RuntimeError) else 'unexpected_storage_rehearsal_failure'
        print('BLOCKED '+code)
        raise SystemExit(1)

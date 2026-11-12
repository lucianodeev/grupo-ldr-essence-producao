// Destructive operations are limited to a new disposable database on loopback.
// Run after verify.mjs in a fresh isolated cluster. Never accepts a remote host.
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';
import {createHash} from 'node:crypto';import assert from 'node:assert/strict';
const {Client}=createRequire(process.env.AGENDA_PG_PACKAGE||import.meta.url)('pg');
if(!['localhost','127.0.0.1'].includes(process.env.PGHOST)||process.env.DATABASE_URL||process.env.PGSERVICE||process.env.PGHOSTADDR)throw Error('Only explicit isolated loopback PG environment allowed');
const bin=process.env.AGENDA_POSTGRES_CLIENT_BIN;
if(!bin)throw Error('Set AGENDA_POSTGRES_CLIENT_BIN to PostgreSQL 17 client bin directory');
const source=new Client();await source.connect();
const work=fs.mkdtempSync(path.join(os.tmpdir(),'ldr-backup-'));
const targetName='agenda_restore_'+Date.now().toString(36);
let targetCreated=false;let restored;
const quote=x=>'"'+x.replaceAll('"','""')+'"';
async function command(program,args){
 return new Promise((resolve,reject)=>{
  const child=spawn(path.join(bin,program),args,{env:{...process.env,PGDATABASE:process.env.PGDATABASE},stdio:['ignore','pipe','pipe']});
  let stdout='',stderr='';child.stdout.on('data',x=>stdout+=x);child.stderr.on('data',x=>stderr+=x);
  child.on('error',reject);child.on('exit',code=>code===0?resolve(stdout):reject(Error(program+' failed ('+code+'): '+stderr)));
 });
}
async function snapshot(client){
 const tables=(await client.query("SELECT n.nspname AS schema,c.relname AS name,c.relrowsecurity AS rls FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname IN ('public','auth','private') AND c.relkind='r' ORDER BY 1,2")).rows;
 const data=[];
 for(const t of tables){const rows=(await client.query(`SELECT to_jsonb(t) AS row FROM ${quote(t.schema)}.${quote(t.name)} t ORDER BY to_jsonb(t)::text`)).rows;data.push({table:t.schema+'.'+t.name,count:rows.length,sha256:createHash('sha256').update(JSON.stringify(rows)).digest('hex'),rls:t.rls});}
 const definitions=(await client.query(`SELECT 'constraint' AS kind,n.nspname||'.'||c.relname||'.'||x.conname AS name,pg_get_constraintdef(x.oid) AS definition FROM pg_constraint x JOIN pg_class c ON c.oid=x.conrelid JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname IN ('public','auth','private')
 UNION ALL SELECT 'function',n.nspname||'.'||p.proname||'('||pg_get_function_identity_arguments(p.oid)||')',pg_get_functiondef(p.oid) FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname IN ('public','auth','private')
 UNION ALL SELECT 'trigger',n.nspname||'.'||c.relname||'.'||t.tgname,pg_get_triggerdef(t.oid) FROM pg_trigger t JOIN pg_class c ON c.oid=t.tgrelid JOIN pg_namespace n ON n.oid=c.relnamespace WHERE NOT t.tgisinternal AND n.nspname IN ('public','auth','private')
 UNION ALL SELECT 'column',n.nspname||'.'||c.relname||'.'||a.attname,jsonb_build_object('name',a.attname,'type',format_type(a.atttypid,a.atttypmod),'notnull',a.attnotnull,'generated',a.attgenerated,'default',pg_get_expr(d.adbin,d.adrelid))::text FROM pg_attribute a JOIN pg_class c ON c.oid=a.attrelid JOIN pg_namespace n ON n.oid=c.relnamespace LEFT JOIN pg_attrdef d ON d.adrelid=c.oid AND d.adnum=a.attnum WHERE a.attnum>0 AND NOT a.attisdropped AND c.relkind='r' AND n.nspname IN ('public','auth','private')
 UNION ALL SELECT 'enum',n.nspname||'.'||t.typname,(SELECT jsonb_agg(e.enumlabel ORDER BY e.enumsortorder)::text FROM pg_enum e WHERE e.enumtypid=t.oid) FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace WHERE t.typtype='e' AND n.nspname IN ('public','auth','private')
 UNION ALL SELECT 'index',schemaname||'.'||indexname,indexdef FROM pg_indexes WHERE schemaname IN ('public','auth','private')
 UNION ALL SELECT 'policy',schemaname||'.'||tablename||'.'||policyname,to_jsonb(p)::text FROM pg_policies p WHERE schemaname IN ('public','auth','private') ORDER BY 1,2`)).rows;
 const grants=(await client.query(`SELECT 'table' AS kind,n.nspname||'.'||c.relname AS name,grantee::regrole::text AS grantee,privilege_type,is_grantable FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace CROSS JOIN LATERAL aclexplode(c.relacl) WHERE n.nspname IN ('public','auth','private')
 UNION ALL SELECT 'schema',n.nspname,grantee::regrole::text,privilege_type,is_grantable FROM pg_namespace n CROSS JOIN LATERAL aclexplode(n.nspacl) WHERE n.nspname IN ('public','auth','private')
 UNION ALL SELECT 'function',n.nspname||'.'||p.proname||'('||pg_get_function_identity_arguments(p.oid)||')',grantee::regrole::text,privilege_type,is_grantable FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace CROSS JOIN LATERAL aclexplode(p.proacl) WHERE n.nspname IN ('public','auth','private') ORDER BY 1,2,3,4,5`)).rows;
 const sequence=(await client.query('SELECT last_value::text,is_called FROM public.order_number_seq')).rows;
 return {data,definitions,grants,sequence};
}
try{
 assert.equal((await source.query("SELECT to_regclass('public.appointments') IS NOT NULL AS ready")).rows[0].ready,true,'apply migration and synthetic fixtures first');
 // Non-empty canonical appointment, mentor link, audit/event and sync state.
 await source.query(`INSERT INTO public.appointments(id,title,consumes_credit) VALUES ('00000000-0000-4000-8000-000000000090','Synthetic backup restore',false);
 INSERT INTO public.mentorship_sessions(id,mentorship_id,appointment_id) VALUES ('00000000-0000-4000-8000-000000000091','00000000-0000-4000-8000-000000000061','00000000-0000-4000-8000-000000000090');
 SELECT public.confirm_mentorship_session_tx('00000000-0000-4000-8000-000000000091',now()+interval '1 day','https://meet.google.com/test');
 INSERT INTO public.appointment_events(appointment_id,event,actor_kind) VALUES ('00000000-0000-4000-8000-000000000090','backup_test','equipe');
 INSERT INTO public.appointment_calendar_sync(appointment_id,calendar_id,sync_status) VALUES ('00000000-0000-4000-8000-000000000090','synthetic-calendar','manual');
 SELECT nextval('public.order_number_seq');`);
 const before=await snapshot(source);
 const archive=path.join(work,'agenda-synthetic.dump');
 console.log((await command('pg_dump',['--version'])).trim());
 const started=Date.now();await command('pg_dump',['--format=custom','--no-owner','--file',archive]);
 assert(fs.statSync(archive).size>0);console.log('PASS custom archive created; only isolated synthetic database');
 await source.query('CREATE DATABASE '+quote(targetName));targetCreated=true;
 await command('pg_restore',['--exit-on-error','--single-transaction','--no-owner','--dbname',targetName,archive]);
 restored=new Client({database:targetName});await restored.connect();
 const after=await snapshot(restored);
 assert.deepEqual(after.data,before.data);console.log('PASS restored rows, counts, SHA256 content digests and RLS match for '+before.data.length+' tables');
 assert.deepEqual(after.definitions,before.definitions);console.log('PASS restored columns, enums, triggers, constraints, indexes, policies and functions match ('+before.definitions.length+' definitions)');
 assert.deepEqual(after.grants,before.grants);console.log('PASS restored schema, table and function grants match ('+before.grants.length+' grants)');
 assert.deepEqual(after.sequence,before.sequence);console.log('PASS restored sequence position matches');
 await restored.query('SET ROLE anon');await assert.rejects(()=>restored.query('SELECT * FROM appointments'),/permission denied/);await assert.rejects(()=>restored.query('SELECT confirm_appointment_tx(NULL,NULL,NULL,NULL,NULL)'),/permission denied/);await restored.query('RESET ROLE');console.log('PASS restored public access remains denied');
 const rows=(await restored.query("SELECT a.status,s.confirmed_at IS NOT NULL AS confirmed FROM appointments a JOIN mentorship_sessions s ON s.appointment_id=a.id WHERE a.id='00000000-0000-4000-8000-000000000090'")).rows;
 assert.deepEqual(rows,[{status:'confirmada',confirmed:true}]);console.log('PASS restored mentorship and appointment relationship remains confirmed');
 console.log('SUCCESS synthetic full-database backup/restore; archive SHA256 '+createHash('sha256').update(fs.readFileSync(archive)).digest('hex')+'; elapsed_ms '+(Date.now()-started));
}finally{
 if(restored)await restored.end();
 if(targetCreated)await source.query('DROP DATABASE '+quote(targetName));
 await source.end();fs.rmSync(work,{recursive:true,force:true});
}

// Starts a disposable PostgreSQL server in the same execution namespace.
import {spawn} from 'node:child_process';
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'ldr-agenda-'));
const bin=process.env.AGENDA_POSTGRES_BIN;
if(!bin)throw Error('Set AGENDA_POSTGRES_BIN to PostgreSQL bin directory');
async function init(){await new Promise((resolve,reject)=>{const c=spawn(path.join(bin,'initdb'),['-D',dir,'-U','postgres','-A','trust','--locale=C'],{stdio:['ignore','ignore','pipe']});let err='';c.stderr.on('data',d=>err+=d);c.on('exit',code=>code?reject(Error(err)):resolve());});}
await init();
const child=spawn(path.join(bin,'postgres'),['-D',dir,'-h','127.0.0.1','-p','55439','-k',''],{stdio:['ignore','ignore','pipe']});
try{
 await new Promise((resolve,reject)=>{child.stderr.on('data',d=>{if(d.toString().includes('ready to accept connections'))resolve()});child.on('exit',c=>reject(Error('postgres exited '+c)));});
 Object.assign(process.env,{PGHOST:'127.0.0.1',PGPORT:'55439',PGUSER:'postgres',PGDATABASE:'postgres'});
 await import('./verify.mjs');
 if(process.env.AGENDA_VERIFY_BACKUP === 'true') await import('./backup-restore.mjs');
}finally{child.kill('SIGTERM');await new Promise(r=>child.on('exit',r));fs.rmSync(dir,{recursive:true,force:true});}

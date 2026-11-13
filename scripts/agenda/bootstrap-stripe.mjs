import {createCipheriv,createPublicKey,publicEncrypt,randomBytes,createHash,createHmac,randomUUID,constants} from 'node:crypto';
import {readFileSync,writeFileSync,mkdirSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';

export const TARGET='https://ldrecossistema.online/api/stripe/webhook';
export const ACCOUNT='acct_1U28k7Klx2LyNGeB';
export const PURPOSE='agenda-webhook-bootstrap-20261113';
export const EVENTS=['checkout.session.completed','checkout.session.expired','checkout.session.async_payment_succeeded','checkout.session.async_payment_failed','payment_intent.payment_failed','charge.refunded'];
const assert=(value)=>{if(!value)throw Error('bootstrap_guard_failed');};
export function configuration(text){
 const env=JSON.parse(text);
 assert(env.SUPABASE_URL==='https://sfrcsrzuoqdscflfuwik.supabase.co');
 assert(env.AGENDA_INTEGRATION_ENABLED==='false'&&env.GOOGLE_CALENDAR_VALIDATION_ENABLED==='false');
 assert(/^[sr]k_live_[A-Za-z0-9]+$/.test(env.STRIPE_SECRET_KEY??''));
 return env;
}
export async function stripeRequest(key,path,method='GET',params=null,idempotency=null){
 assert(/^\/v1\/(account|webhook_endpoints(?:\?limit=100(?:&starting_after=we_[A-Za-z0-9]+)?)?|webhook_endpoints\/we_[A-Za-z0-9]+)$/.test(path));
 assert(method==='GET'||method==='POST');
 const headers={Authorization:'Bearer '+key,'Stripe-Version':'2026-09-30.endive'};
 if(params)headers['Content-Type']='application/x-www-form-urlencoded';
 if(idempotency)headers['Idempotency-Key']=idempotency;
 const r=await fetch('https://api.stripe.com'+path,{method,headers,redirect:'error',signal:AbortSignal.timeout(20000),...(params?{body:new URLSearchParams(params)}:{})});
 assert(r.ok);const text=await r.text();assert(text.length<2097152);return JSON.parse(text);
}
export async function inventory(api){
 let path='/v1/webhook_endpoints?limit=100',rows=[];
 for(let n=0;n<10;n++){
  const page=await api(path);assert(Array.isArray(page.data));rows.push(...page.data);
  if(!page.has_more)return rows;
  const tail=page.data.at(-1)?.id;assert(/^we_[A-Za-z0-9]+$/.test(tail??''));path='/v1/webhook_endpoints?limit=100&starting_after='+tail;
 }
 throw Error('inventory_limit');
}
export async function prepare(api){
 assert((await api('/v1/account')).id===ACCOUNT);
 const existing=(await inventory(api)).filter(e=>e.url===TARGET);
 assert(existing.length<=1&&existing.every(e=>e.metadata?.purpose===PURPOSE));
 const params={url:TARGET,description:'Ecossistema LDR agenda — controlled activation', 'metadata[project]':'ecossistema-ldr','metadata[purpose]':PURPOSE};
 EVENTS.forEach((e,i)=>params[`enabled_events[${i}]`]=e);
 // A fixed key makes interrupted/repeated preparation replay the same creation,
 // rather than creating duplicates. Never alter an unrelated endpoint.
 const endpoint=await api('/v1/webhook_endpoints','POST',params,'ldr-agenda-webhook-bootstrap-20261113');
 assert(/^we_[A-Za-z0-9]+$/.test(endpoint.id??'')&&endpoint.url===TARGET&&endpoint.livemode===true);
 const disabled=await api('/v1/webhook_endpoints/'+endpoint.id,'POST',{disabled:'true'});
 assert(disabled.status==='disabled'&&disabled.url===TARGET);
 assert(/^whsec_[A-Za-z0-9]+$/.test(endpoint.secret??''));
 return {id:endpoint.id,secret:endpoint.secret};
}
export function seal(payload,pem){
 const plain=Buffer.from(JSON.stringify(payload)),key=randomBytes(32),iv=randomBytes(12);
 const cipher=createCipheriv('aes-256-gcm',key,iv);const ciphertext=Buffer.concat([cipher.update(plain),cipher.final()]);
 const wrapped=publicEncrypt({key:createPublicKey(pem),padding:constants.RSA_PKCS1_OAEP_PADDING,oaepHash:'sha256'},key);
 const result={algorithm:'RSA-OAEP-SHA256+AES-256-GCM',key:wrapped.toString('base64'),iv:iv.toString('base64'),tag:cipher.getAuthTag().toString('base64'),ciphertext:ciphertext.toString('base64')};
 key.fill(0);plain.fill(0);return result;
}
export async function enable(api,env,id,proofEvent,request=fetch){
 assert(/^we_[A-Za-z0-9]+$/.test(id??'')&&/^evt_[A-Za-z0-9]+$/.test(proofEvent??''));
 assert(env.STRIPE_WEBHOOK_VALIDATION_ENABLED!=='true');
 assert((await api('/v1/account')).id===ACCOUNT);
 const endpoint=await api('/v1/webhook_endpoints/'+id);
 assert(endpoint.url===TARGET&&endpoint.livemode===true&&endpoint.metadata?.purpose===PURPOSE&&EVENTS.every(e=>endpoint.enabled_events?.includes(e)));
 const dbKey=env.SUPABASE_SERVICE_ROLE_KEY;assert(typeof dbKey==='string'&&dbKey.length>20);
 const auth={apikey:dbKey,...(dbKey.startsWith('eyJ')?{Authorization:'Bearer '+dbKey}:{})};
 const receiptUrl=env.SUPABASE_URL+'/rest/v1/stripe_webhook_events?event_id=eq.'+encodeURIComponent('ldr_validation:'+proofEvent)+'&select=event_id,event_type&limit=2';
 const rr=await request(receiptUrl,{method:'GET',headers:auth,redirect:'error',signal:AbortSignal.timeout(20000)});assert(rr.ok);
 const rows=await rr.json();assert(rows.length===1&&rows[0].event_type==='ldr_validation.customer.created');
 const schema=await request(env.SUPABASE_URL+'/rest/v1/appointments?select=id&limit=0',{method:'GET',headers:auth,redirect:'error',signal:AbortSignal.timeout(20000)});assert(schema.ok);
 const event={id:'evt_ldrprobe'+randomUUID().replaceAll('-',''),type:'ldr.integration_probe',livemode:true,data:{object:{metadata:{}}}};
 const raw=JSON.stringify(event),t=Math.floor(Date.now()/1000);
 const signature=`t=${t},v1=${createHmac('sha256',env.STRIPE_WEBHOOK_SECRET).update(`${t}.${raw}`).digest('hex')}`;
 const send=(sig,body=raw)=>request(TARGET,{method:'POST',headers:{'content-type':'application/json','stripe-signature':sig},body,redirect:'error',signal:AbortSignal.timeout(30000)});
 const invalid=await send(`t=${t},v1=${'0'.repeat(64)}`);assert(invalid.status===400);
 const first=await send(signature);assert(first.status===200&&(await first.json()).received===true);
 const duplicate=await send(signature);assert(duplicate.status===200&&(await duplicate.json()).duplicate===true);
 const active=await api('/v1/webhook_endpoints/'+id,'POST',{disabled:'false'});assert(active.status==='enabled'&&active.url===TARGET);
 return {endpoint_id:id,endpoint_enabled:true,mode:'live',account_matches_expected:true,real_sandbox_delivery_verified:true,live_receiver_signature_verified:true,duplicate_prevention_verified:true,invalid_signature_rejected:true,charges_created:0};
}

async function main(){
 assert(process.env.GITHUB_REF==='refs/heads/main'&&process.env.GITHUB_ACTOR==='lucianodeev');
 assert(process.env.PROJECT_CONFIRMATION==='sfrcsrzuoqdscflfuwik');
 const guard=await fetch('https://api.github.com/repos/lucianodeev/grupo-ldr-essence-producao/actions/runs/43420267390',{headers:{Authorization:'Bearer '+process.env.GH_TOKEN,Accept:'application/vnd.github+json'},redirect:'error',signal:AbortSignal.timeout(20000)});
 assert(guard.ok);const backup=await guard.json();assert(backup.conclusion==='success'&&backup.head_sha==='845c5b01eb694056cf86a2c2286f1fbf3d1377d9');
 const env=configuration(process.env.LDR_BACKUP_APP_CONFIG_JSON??'');
 const api=(...args)=>stripeRequest(env.STRIPE_SECRET_KEY,...args);
 const out=process.env.BOOTSTRAP_OUTPUT;assert(out&&out.startsWith(process.env.RUNNER_TEMP+'/'));mkdirSync(out,{recursive:true,mode:0o700});
 if(process.env.BOOTSTRAP_ACTION==='enable'){
  const result=await enable(api,env,process.env.ENDPOINT_ID,process.env.PROOF_EVENT_ID);
  writeFileSync(join(out,'verification.json'),JSON.stringify(result),{mode:0o600});console.log('PASS Stripe endpoint activated after signed receiver and real sandbox delivery checks');return;
 }
 assert(process.env.BOOTSTRAP_ACTION==='prepare');
 const result=await prepare(api);
 const updated={...env,STRIPE_WEBHOOK_SECRET:result.secret};
 const pem=readFileSync(new URL('./stripe-bootstrap-recipient.pub',import.meta.url),'utf8');
 writeFileSync(join(out,'handoff-cipher.json'),JSON.stringify(seal({endpoint_id:result.id,render_configuration:updated},pem)),{mode:0o600});
 const passphrase=process.env.LDR_BACKUP_PASSPHRASE??'';assert(passphrase.length>=24&&!passphrase.includes('\n'));
 const tmp=mkdtempSync(join(tmpdir(),'ldr-stripe-private-'));const plain=Buffer.from(JSON.stringify({endpoint_id:result.id,render_configuration:updated}));
 try{
  const input=join(tmp,'config.json');writeFileSync(input,plain,{mode:0o600});
  const patch=join(out,'render-stripe-configuration.json.gpg');
  const run=args=>{const r=spawnSync('gpg',args,{input:Buffer.from(passphrase+'\n'),maxBuffer:4*1024*1024});assert(r.status===0);return r.stdout;};
  run(['--batch','--yes','--pinentry-mode','loopback','--passphrase-fd','0','--symmetric','--cipher-algo','AES256','--output',patch,input]);
  const roundtrip=run(['--batch','--pinentry-mode','loopback','--passphrase-fd','0','--decrypt',patch]);assert(roundtrip.equals(plain));roundtrip.fill(0);
  const verification={endpoint_id:result.id,endpoint_disabled:true,mode:'live',account_matches_expected:true,charges_created:0,configuration_patch_roundtrip_verified:true,configuration_patch_sha256:createHash('sha256').update(readFileSync(patch)).digest('hex')};
  writeFileSync(join(out,'verification.json'),JSON.stringify(verification),{mode:0o600});
 }finally{plain.fill(0);rmSync(tmp,{recursive:true,force:true});}
 console.log('PASS dedicated Stripe webhook prepared disabled; configuration encrypted and recovered without emitting secrets');
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)main().catch(()=>{console.error('BLOCKED Stripe bootstrap failed; details withheld; agenda remains disabled');process.exitCode=1;});

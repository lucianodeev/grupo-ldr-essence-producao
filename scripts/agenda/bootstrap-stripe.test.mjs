import test from 'node:test';
import assert from 'node:assert/strict';
import {generateKeyPairSync,privateDecrypt,createDecipheriv,constants} from 'node:crypto';
import {configuration,prepare,enable,seal,TARGET,ACCOUNT,PURPOSE,EVENTS} from './bootstrap-stripe.mjs';
const env={SUPABASE_URL:'https://sfrcsrzuoqdscflfuwik.supabase.co',AGENDA_INTEGRATION_ENABLED:'false',GOOGLE_CALENDAR_VALIDATION_ENABLED:'false',STRIPE_SECRET_KEY:'sk_live_synthetic',STRIPE_WEBHOOK_SECRET:'synthetic-main',SUPABASE_SERVICE_ROLE_KEY:'synthetic-server-key-no-real-access'};
const endpoint={id:'we_synthetic',url:TARGET,livemode:true,status:'disabled',metadata:{purpose:PURPOSE},enabled_events:EVENTS};
test('invalid project, enabled agenda, or test key stops before any API',()=>{
 for(const patch of [{SUPABASE_URL:'https://other.invalid'},{AGENDA_INTEGRATION_ENABLED:'true'},{STRIPE_SECRET_KEY:'sk_test_fixture'}])assert.throws(()=>configuration(JSON.stringify({...env,...patch})));
 assert.equal(configuration(JSON.stringify(env)).AGENDA_INTEGRATION_ENABLED,'false');
});
test('wrong account or unrelated existing endpoint cannot create or change a webhook',async()=>{
 for(const wrongAccount of [true,false]){
  const calls=[];const api=async(path,method='GET')=>{calls.push(method);if(path==='/v1/account')return {id:wrongAccount?'acct_other':ACCOUNT};return {data:[{...endpoint,metadata:{purpose:'unrelated'},status:'enabled'}]};};
  await assert.rejects(()=>prepare(api));assert(!calls.includes('POST'));
 }
});
test('preparation is idempotently scoped and disables only its own new endpoint',async()=>{
 const calls=[];const api=async(path,method='GET',params,key)=>{calls.push({path,method,params,key});if(path==='/v1/account')return{id:ACCOUNT};if(method==='GET')return{data:[]};if(path==='/v1/webhook_endpoints')return{...endpoint,secret:'whsec_synthetic'};return endpoint;};
 assert.equal((await prepare(api)).secret,'whsec_synthetic');
 assert.equal(calls.at(-1).path,'/v1/webhook_endpoints/we_synthetic');assert.equal(calls.at(-1).params.disabled,'true');
 assert.equal(calls.find(c=>c.key)?.key,'ldr-agenda-webhook-bootstrap-20261113');
 assert(calls.every(c=>c.method==='GET'||c.method==='POST'));
});
test('handoff secrets exist only in authenticated encryption recoverable by the local recipient',()=>{
 const {publicKey,privateKey}=generateKeyPairSync('rsa',{modulusLength:2048});
 const payload={secret:'private synthetic only'};const blob=seal(payload,publicKey.export({type:'spki',format:'pem'}));
 assert(!JSON.stringify(blob).includes(payload.secret));
 const key=privateDecrypt({key:privateKey,padding:constants.RSA_PKCS1_OAEP_PADDING,oaepHash:'sha256'},Buffer.from(blob.key,'base64'));
 const decipher=createDecipheriv('aes-256-gcm',key,Buffer.from(blob.iv,'base64'));decipher.setAuthTag(Buffer.from(blob.tag,'base64'));
 assert.deepEqual(JSON.parse(Buffer.concat([decipher.update(Buffer.from(blob.ciphertext,'base64')),decipher.final()])),payload);
});
test('enable refuses missing sandbox receipt or schema without changing Stripe state',async()=>{
 for(const missing of ['receipt','schema']){
  const calls=[];const api=async(path,method='GET')=>{calls.push(method);return path==='/v1/account'?{id:ACCOUNT}:endpoint;};
  const request=async url=>new Response(JSON.stringify(missing==='receipt'?[]:[{event_type:'ldr_validation.customer.created'}]),{status:url.includes('/appointments?')&&missing==='schema'?404:200});
  await assert.rejects(()=>enable(api,env,'we_synthetic','evt_fixture',request));assert(!calls.includes('POST'));
 }
});
test('enable requires real receipt, migrated schema, valid signature, duplicate and bad-signature rejection',async()=>{
 const calls=[];const api=async(path,method='GET',params)=>{calls.push({path,method,params});return path==='/v1/account'?{id:ACCOUNT}:method==='POST'?{...endpoint,status:'enabled'}:endpoint;};
 let posts=0;const request=async(url,options)=>{
  if(url.includes('/stripe_webhook_events?'))return new Response(JSON.stringify([{event_type:'ldr_validation.customer.created'}]));
  if(url.includes('/appointments?'))return new Response('[]');
  posts++;return posts===1?new Response('{}',{status:400}):new Response(JSON.stringify(posts===2?{received:true}:{received:true,duplicate:true}));
 };
 const result=await enable(api,env,'we_synthetic','evt_fixture',request);assert(result.real_sandbox_delivery_verified);assert.equal(posts,3);
 assert.equal(calls.at(-1).params.disabled,'false');assert.equal(result.charges_created,0);
});

// Synthetic fixtures only. No network, customer data, or database writes.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ts=require('typescript');
const source=fs.readFileSync(path.join(__dirname,'../src/lib/support-conversation.server.ts'),'utf8');
const moduleFixture={exports:{}};
vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{module:moduleFixture,exports:moduleFixture.exports,require:id=>id.startsWith('@/')?{supabaseAdmin:{}}:require(id),console,Date,Map});
const api=moduleFixture.exports;
const id='11111111-1111-4111-8111-111111111111',fileId='22222222-2222-4222-8222-222222222222';
const owner='owner@example.test';
function context(email=owner,verified=true){return{userId:'synthetic-user',supabase:{auth:{getUser:async()=>({data:{user:{id:'synthetic-user',email,email_confirmed_at:verified?'2026-01-01':null}}})}}};}
function db(options={}){
 const calls=[];let signed=0;
 const contact={id,protocol:'TEST-ONLY',subject:'Support',email:owner,message:'Synthetic',status:'novo'};
 return{calls,get signed(){return signed},storage:{from:()=>({createSignedUrl:async()=>{signed++;return{data:{signedUrl:'https://example.test/private'}}}})},from(table){const filters={},entry={table,filters,operation:'select'};calls.push(entry);const q={select(v){entry.select=v;return q},eq(k,v){filters[k]=v;return q},in(k,v){filters[k]=v;return q},order(){return q},limit(){return q},insert(v){entry.operation='insert';entry.value=v;return q},update(v){entry.operation='update';entry.value=v;return q},maybeSingle(){entry.single=true;return q},then(resolve){let data=null,error=null;if(entry.operation==='select'){if(table==='ecosystem_contacts'){data=filters.email===owner&&!options.missing?contact:null;if(!entry.single)data=data?[{id,protocol:'TEST-ONLY',subject:'Support',status:'novo'}]:[]}else if(table==='ecosystem_contact_attachments')data=entry.single?{contact_id:id,storage_path:'private/file'}:[];else data=[{contact_id:id,created_at:'2026-01-02T12:00:00Z',direction:'outbound',body:'Synthetic reply'}];}else if(options.failInsert&&entry.operation==='insert')error=new Error('Synthetic insert failure');else if(options.failUpdate&&entry.operation==='update')error=new Error('Synthetic update failure');resolve({data,error})}};return q}};
}
test('verified identity is normalized and forged context is denied',async()=>{assert.equal((await api.supportIdentity(context('OWNER@EXAMPLE.TEST'))).email,owner);const c=context();c.userId='forged';await assert.rejects(api.supportIdentity(c));});
test('unverified and anonymous users cannot read conversations',async()=>{await assert.rejects(api.listSupportConversations(context(owner,false),db()));const c=context();c.supabase.auth.getUser=async()=>({data:{user:null}});await assert.rejects(api.listSupportConversations(c,db()));});
test('list scopes contacts by verified email and reply IDs',async()=>{const d=db();const rows=await api.listSupportConversations(context(),d);assert.equal(rows[0].lastReplyAt,'2026-01-02T12:00:00Z');assert.equal(d.calls[0].filters.email,owner);assert.deepEqual(Array.from(d.calls[1].filters.contact_id),[id]);assert.equal(d.calls[1].filters.direction,'outbound');});
test('other user list is empty and never queries messages',async()=>{const d=db();const rows=await api.listSupportConversations(context('other@example.test'),d);assert.equal(rows.length,0);assert.equal(d.calls.length,1);});
test('cross-user thread cannot query messages or attachments',async()=>{const d=db();await assert.rejects(api.readSupportConversation(context('other@example.test'),id,d));assert.equal(d.calls.length,1);});
test('owned thread excludes email and private storage paths',async()=>{const d=db();const result=await api.readSupportConversation(context(),id,d);assert.equal(result.contact.email,undefined);assert.ok(!d.calls.find(x=>x.table==='ecosystem_contact_attachments').select.includes('storage_path'));});
test('cross-user message cannot insert or update',async()=>{const d=db();await assert.rejects(api.sendSupportMessage(context('other@example.test'),{id,body:'Test'},d));assert.ok(d.calls.every(x=>x.operation==='select'));});
test('message validation rejects blank, excessive body and invalid ID',async()=>{for(const input of[{id,body:' '},{id,body:'x'.repeat(4001)},{id:'not-a-uuid',body:'Test'}])await assert.rejects(api.sendSupportMessage(context(),input,db()));});
test('saved message uses authenticated sender and reopens support',async()=>{const d=db();await api.sendSupportMessage(context(),{id,body:' Synthetic '},d);assert.equal(d.calls[1].value.sender,owner);assert.equal(d.calls[1].value.body,'Synthetic');assert.equal(d.calls[2].value.status,'em_atendimento');});
test('failed message insert is not reported as success',async()=>{const d=db({failInsert:true});await assert.rejects(api.sendSupportMessage(context(),{id,body:'Test'},d));assert.equal(d.calls.filter(x=>x.operation==='update').length,0);});
test('saved message is acknowledged despite subsequent status failure to avoid duplicate sends',async()=>{assert.equal((await api.sendSupportMessage(context(),{id,body:'Test'},db({failUpdate:true}))).ok,true);});
test('private attachment from another user is never signed',async()=>{const d=db();await assert.rejects(api.supportAttachmentUrl(context('other@example.test'),fileId,d));assert.equal(d.signed,0);});
test('owned attachment uses short private signed URL',async()=>{const d=db();assert.equal(await api.supportAttachmentUrl(context(),fileId,d),'https://example.test/private');assert.equal(d.signed,1);});
test('cross-user upload cannot replace authorization token',async()=>{const d=db();await assert.rejects(api.supportUploadAuthorization(context('other@example.test'),id,d));assert.ok(d.calls.every(x=>x.operation==='select'));});
test('upload authorization stores only token hash',async()=>{const d=db();const auth=await api.supportUploadAuthorization(context(),id,d);const saved=d.calls[1].value;assert.equal(auth.uploadToken.length,64);assert.equal(saved.upload_token_hash.length,64);assert.notEqual(saved.upload_token_hash,auth.uploadToken);});

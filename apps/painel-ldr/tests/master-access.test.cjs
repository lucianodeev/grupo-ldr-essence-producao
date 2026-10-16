const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ts=require('typescript');
const source=ts.transpileModule(fs.readFileSync(require('node:path').join(__dirname,'../src/lib/access.server.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
async function check({email='tcanaveze@gmail.com',active=true,role='superadmin',authId='caller',confirmed=true,internal=false,authError=null,profileEmail=email}={}) {
 const user={id:authId,email,email_confirmed_at:confirmed?'2026-08-31':null};
 const result={data:{user},error:authError};
 const db={auth:{getUser:async()=>result,admin:{getUserById:async id=>{assert.equal(id,'caller');return result;}}},from(table){const q={select:()=>q,eq:()=>q,maybeSingle:async()=>({data:{id:'caller',email:profileEmail,is_active:active},error:null}),then(resolve){return Promise.resolve({data:role?[{role}]:[],error:null}).then(resolve)}};return q;}};
 const admin=internal?db:{};
 const mod={exports:{}};
 vm.runInNewContext(source,{exports:mod.exports,module:mod,require:id=>{assert.equal(id,'@/integrations/supabase/client.server');return {supabaseAdmin:admin}},console,process});
 return mod.exports.resolveAccess(db,'caller');
}
for(const email of ['tcanaveze@gmail.com','llucianouam@gmail.com'])for(const internal of [false,true])test(`${email}: ${internal?'internal':'session'} grants Master`,async()=>assert.equal((await check({email,internal})).authorized,true));
for(const [label,args] of Object.entries({inactive:{active:false},noRole:{role:null},outsider:{email:'outsider@example.com'},wrongId:{authId:'another'},unconfirmed:{confirmed:false},authFailure:{authError:{message:'invalid'}},forgedProfile:{email:'outsider@example.com',profileEmail:'tcanaveze@gmail.com'}}))test(`denies ${label}`,async()=>assert.equal((await check(args)).authorized,false));

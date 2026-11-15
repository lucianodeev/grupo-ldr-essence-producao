// Real local sessions -> HTTP session-sync -> protected server functions and UI.
// Does not submit checkout or contact any OAuth/payment provider.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {createRequire} from 'node:module';
const {chromium}=createRequire(process.env.PLAYWRIGHT_PACKAGE)('playwright');
const status=JSON.parse(fs.readFileSync(process.env.LDR_LOCAL_SUPABASE_STATUS,'utf8'));
assert.equal(new URL(status.API_URL).hostname,'127.0.0.1');
const identities=JSON.parse(fs.readFileSync(process.env.LDR_LOCAL_BROWSER_IDENTITIES,'utf8'));
const cwd=new URL('../../apps/painel-ldr/',import.meta.url);
const env={PATH:process.env.PATH,NODE_ENV:'production',RENDER:'true',
 SUPABASE_URL:status.API_URL,SUPABASE_PUBLISHABLE_KEY:status.ANON_KEY,SUPABASE_SERVICE_ROLE_KEY:status.SERVICE_ROLE_KEY,
 VITE_SUPABASE_URL:status.API_URL,VITE_SUPABASE_PUBLISHABLE_KEY:status.ANON_KEY};
const buildLog=fs.openSync('/tmp/ldr-free-browser-build.log','w',0o600);
await new Promise((resolve,reject)=>{const child=spawn('npm',['run','build:render'],{cwd,env,stdio:['ignore',buildLog,buildLog]});child.on('error',reject);child.on('exit',code=>code?reject(Error('Local application build failed; see private runner log')):resolve());});
fs.closeSync(buildLog);console.log('PASS local application build with local Auth configuration');
const origin='http://127.0.0.1:43218';
const server=spawn(process.execPath,['.output/server/index.mjs'],{cwd,env:{...env,HOST:'127.0.0.1',PORT:'43218'},stdio:['ignore','pipe','pipe']});
let browser;
try{
 await new Promise((resolve,reject)=>{const timeout=setTimeout(()=>reject(Error('Local application did not start')),20000);server.stdout.on('data',b=>{if(b.toString().includes('Listening')){clearTimeout(timeout);resolve();}});server.on('error',reject);});
 browser=await chromium.launch();
 const guest=await browser.newContext({locale:'pt-PT'}),guestPage=await guest.newPage();
 await guestPage.goto(origin+'/cliente/propostas');await guestPage.waitForURL('**/cliente/login?**');
 assert.equal(new URL(guestPage.url()).searchParams.get('next'),'/cliente/propostas');
 assert.equal((await guest.request.post(origin+'/api/auth/session-sync',{data:{access_token:'invalid',refresh_token:'invalid'}})).status(),401);
 await guest.close();console.log('PASS guest redirect and invalid HTTP session rejected');
 for(const actor of ['master','owner','other']){
  const context=await browser.newContext({locale:'pt-PT',viewport:{width:390,height:844}});
  const response=await context.request.post(origin+'/api/auth/session-sync',{data:identities[actor]});assert.equal(response.status(),200);
  const page=await context.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  if(actor==='master'){
   await page.goto(origin+'/admin/contatos');await page.getByRole('button').filter({hasText:identities.protocol}).waitFor();
   console.log('PASS Master sees private contact through actual server middleware and cookies');
  }else{
   await page.goto(origin+'/cliente/propostas');
   if(actor==='owner')await page.getByRole('heading',{name:identities.title,exact:true}).waitFor();
   else{await page.getByText('Ainda não há propostas aprovadas para este e-mail.',{exact:true}).waitFor();assert.equal(await page.getByRole('heading',{name:identities.title,exact:true}).count(),0);}
   console.log(`PASS ${actor} cookie-authenticated proposal page preserves ownership`);
  }
  assert.deepEqual(errors,[],`${actor} browser exceptions`);await context.close();
 }
 console.log('PASS authenticated 390px local HTTP/browser checks; no provider requests submitted');
}finally{await browser?.close();server.kill('SIGTERM');fs.rmSync(process.env.LDR_LOCAL_BROWSER_IDENTITIES,{force:true});}

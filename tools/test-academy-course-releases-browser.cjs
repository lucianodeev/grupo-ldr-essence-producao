// Isolated real-reader checks; no signed-in production user, provider traffic or progress writes.
'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {build}=require('esbuild'),{chromium}=require(process.env.LDR_READER_PLAYWRIGHT||'playwright');
const root=path.resolve(__dirname,'..'),scratch='/tmp/ldr-course-reading-releases';
const load=require('../apps/painel-ldr/tests/helpers/load-ts.cjs')();
const editions=load('content/academy-reading/courses-reading-release.server.ts').RELEASED_COURSE_READING_EDITIONS;
const normal=text=>text.replace(/\*\*/g,'').replace(/\s+/g,' ').trim();
async function main(){
 fs.mkdirSync(scratch,{recursive:true});
 await build({stdin:{contents:`import React,{useState} from 'react';import {createRoot} from 'react-dom/client';import {AcademyReadingEditionView} from './src/components/academy-reading-edition';
 const editions=${JSON.stringify(editions)};window.__writes=[];const write=Storage.prototype.setItem;Storage.prototype.setItem=function(...args){window.__writes.push(args);return write.apply(this,args)};
 function Review(){const [course,setCourse]=useState(0);const edition=editions[course];const pending=new URLSearchParams(location.search).has('pending');return <main className="mx-auto max-w-6xl space-y-5 p-4"><h1>Verificação isolada das edições de leitura</h1><label htmlFor="published-course">Curso publicado</label><select id="published-course" className="block w-full min-w-0 max-w-full border p-3" value={course} onChange={e=>setCourse(Number(e.target.value))}>{editions.map((e,i)=><option key={e.slug} value={i}>{e.slug}</option>)}</select><AcademyReadingEditionView key={edition.editionId} edition={pending?{...edition,status:'draft'}:edition}/></main>};createRoot(document.getElementById('root')).render(<Review/>);`,loader:'tsx',sourcefile:'published-reader-fixture.tsx',resolveDir:path.join(root,'apps/painel-ldr')},bundle:true,platform:'browser',outfile:path.join(scratch,'fixture.js'),define:{'process.env.NODE_ENV':'"production"'},tsconfig:path.join(root,'apps/painel-ldr/tsconfig.json')});
 const assets=path.join(root,'apps/painel-ldr/dist/client/assets'),css=fs.readdirSync(assets).filter(f=>f.endsWith('.css'));assert.ok(css.length);
 const server=http.createServer((req,res)=>{
  if(req.url==='/fixture.js'){res.setHeader('Content-Type','text/javascript');return res.end(fs.readFileSync(path.join(scratch,'fixture.js')))}
  const file=path.basename(req.url);if(req.url.startsWith('/assets/')&&css.includes(file)){res.setHeader('Content-Type','text/css');return res.end(fs.readFileSync(path.join(assets,file)))}
  res.setHeader('Content-Type','text/html; charset=utf-8');res.end('<!doctype html><html lang="pt"><head><meta name="viewport" content="width=device-width,initial-scale=1">'+css.map(f=>'<link rel="stylesheet" href="/assets/'+f+'">').join('')+'</head><body><div id="root"></div><script src="/fixture.js"></script></body></html>');
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const origin='http://127.0.0.1:'+server.address().port;let browser;const results=[];
 try{
  browser=await chromium.launch({headless:true,args:['--no-sandbox'],...(process.env.LDR_READER_CHROMIUM?{executablePath:process.env.LDR_READER_CHROMIUM}:{})});
  for(const viewport of [{width:390,height:844},{width:1280,height:900}]){
   const page=await browser.newPage({viewport}),errors=[],external=[],courses=[];
   page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(!r.url().startsWith(origin))external.push(r.url())});await page.goto(origin);
   for(const [course,e]of editions.entries()){
    await page.getByLabel('Curso publicado',{exact:true}).selectOption(String(course));
    const nav=page.getByRole('navigation',{name:'Unidades da edição de leitura'});await nav.waitFor();assert.equal(await nav.getByRole('button').count(),e.modules.length);
    const units=[];
    for(const [index,m]of e.modules.entries()){
     await nav.getByRole('button').nth(index).click();const article=page.getByRole('article',{name:m.title,exact:true});await article.waitFor();const text=normal(await article.innerText());
     for(const block of m.body.split(/\n\s*\n/))if(!block.startsWith('#'))assert.ok(text.includes(normal(block)),e.slug+'/'+m.id+': missing reading text');
     assert.equal(await nav.getByRole('button').nth(index).getAttribute('aria-current'),'step');assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),e.slug+'/'+m.id+': overflow');
     units.push({id:m.id,sha256:m.sha256,sourceSha256:m.sourceSha256});
    }
    await nav.getByRole('button').nth(0).focus();await page.keyboard.press('Tab');assert.ok(await nav.getByRole('button').nth(1).evaluate(e=>e===document.activeElement));await page.keyboard.press('Enter');assert.equal(await nav.getByRole('button').nth(1).getAttribute('aria-current'),'step');
    courses.push({slug:e.slug,editionId:e.editionId,units,keyboard:true});
   }
   assert.deepEqual(errors,[]);assert.deepEqual(external,[]);assert.deepEqual(await page.evaluate(()=>window.__writes),[]);
   await page.screenshot({path:path.join(scratch,'published-'+viewport.width+'.png'),fullPage:false});
   await page.goto(origin+'/?pending');await page.getByLabel('Curso publicado',{exact:true}).waitFor();assert.equal(await page.getByRole('article').count(),0);
   results.push({viewport,courses,scriptErrors:0,externalRequests:0,storageWrites:0,pageOverflow:false,pendingHidden:true});await page.close();
  }
  const report={pass:true,scope:'Real reading component with published data in a local fixture, not authenticated production traffic, specialist review or assistive-technology validation',courses:editions.length,units:editions.reduce((n,e)=>n+e.modules.length,0),results};fs.writeFileSync(path.join(scratch,'results.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({pass:true,courses:report.courses,units:report.units,viewports:results.map(r=>r.viewport),storageWrites:0,scriptErrors:0}));
 }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
}
main().catch(error=>{console.error(error);process.exitCode=1});

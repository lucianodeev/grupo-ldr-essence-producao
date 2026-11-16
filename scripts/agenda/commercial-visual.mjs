// Credential-free local build only. No forms or payments are submitted.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
const require = createRequire(process.env.PLAYWRIGHT_PACKAGE || import.meta.url);
const {chromium} = require('playwright');
const port = '43218', origin = `http://127.0.0.1:${port}`;
const evidence = process.env.LDR_VISUAL_OUTPUT || '/tmp/ldr-commercial-visual';
await fs.mkdir(evidence,{recursive:true});
const server = spawn(process.execPath,['.output/server/index.mjs'],{
  cwd:new URL('../../apps/painel-ldr/',import.meta.url),
  env:{PATH:process.env.PATH,NODE_ENV:'production',HOST:'127.0.0.1',PORT:port},stdio:['ignore','pipe','pipe']});
let browser;
try {
  await new Promise((resolve,reject)=>{
    const timeout=setTimeout(()=>reject(Error('Local build did not start')),20000);
    server.stdout.on('data',b=>{if(b.toString().includes('Listening')){clearTimeout(timeout);resolve();}});
    server.once('error',reject);server.once('exit',()=>reject(Error('Local build stopped')));
  });
  browser=await chromium.launch({...(process.env.CHROMIUM_PATH ? {executablePath:process.env.CHROMIUM_PATH} : {}),headless:true});
  for(const width of [390,1280]){
    const page=await browser.newPage({viewport:{width,height:900}});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(origin,{waitUntil:'networkidle'});
    await page.getByRole('heading',{name:'Consultoria, tecnologia e pessoas para desenvolver o seu negócio.',exact:true}).waitFor();
    assert.equal(new URL(page.url()).pathname,'/');
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
    assert.equal(overflow,false,`homepage horizontal overflow ${width}px`);
    await page.screenshot({path:`${evidence}/homepage-${width}.jpg`,fullPage:false});
    const technology=page.getByRole('heading',{name:'Tecnologia, IA e automação',exact:true}).locator('..');
    await technology.getByRole('link',{name:'Solicitar proposta →',exact:true}).click();
    await page.getByRole('heading',{name:'Vamos construir a proposta certa.',exact:true}).waitFor();
    assert.equal(await page.getByLabel('Solução de interesse').inputValue(),'Tecnologia, IA e automação');
    await page.getByText('Não é necessário pagar para pedir orçamento',{exact:false}).waitFor();
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,`proposal overflow ${width}px`);
    await page.screenshot({path:`${evidence}/proposal-${width}.jpg`,fullPage:false});
    await page.goto(`${origin}/empresas/servicos`,{waitUntil:'networkidle'});
    await page.getByRole('link',{name:'Conhecer o programa e o checklist gratuito',exact:true}).click();
    await page.getByRole('heading',{name:'Uma chegada preparada. Um primeiro mês com direção.',exact:true}).waitFor();
    assert.equal(new URL(page.url()).pathname,'/empresas/integracao-colaboradores');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,`onboarding overflow ${width}px`);
    await page.screenshot({path:`${evidence}/onboarding-${width}.jpg`,fullPage:false});
    await page.screenshot({path:`${evidence}/onboarding-full-${width}.jpg`,fullPage:true});
    const downloading=page.waitForEvent('download');
    await page.getByRole('link',{name:'Descarregar checklist gratuito (.txt)',exact:true}).click();
    const download=await downloading, text=await fs.readFile(await download.path(),'utf8');
    assert.equal(download.suggestedFilename(),'LDR-checklist-integracao-colaboradores.txt');
    assert.equal((text.match(/^\d+\. \[ \]/gm)||[]).length,12);
    assert.ok(text.includes('Responsável:')&&text.includes('Primeiros 30 dias'));
    assert.ok(text.includes('não contrata serviços nem gera qualquer cobrança'));
    await page.getByRole('link',{name:'Solicitar proposta gratuita',exact:true}).first().click();
    assert.equal(await page.getByLabel('Solução de interesse').inputValue(),'Integração de novos colaboradores');
    assert.equal(new URL(page.url()).searchParams.get('source'),'integracao-colaboradores');
    // Inspect the real client form transport, but stop before any server/DB handler.
    let submitted;
    await page.route('**/_serverFn/**',async route=>{
      submitted=route.request().postData();await route.abort();
    });
    await page.getByLabel('Organização',{exact:true}).fill('Synthetic onboarding company');
    await page.getByLabel('Nome de contacto',{exact:true}).fill('Synthetic contact');
    await page.getByLabel('E-mail profissional',{exact:true}).fill('onboarding@example.invalid');
    await page.getByLabel('Como podemos ajudar?',{exact:true}).fill('Synthetic local form test. Two remote hires with different start dates.');
    await page.getByRole('checkbox',{name:/Autorizo o uso destes dados/}).check();
    await page.getByRole('button',{name:'Enviar pedido institucional',exact:true}).click();
    await page.getByRole('alert').filter({hasText:'Não foi possível confirmar o pedido.'}).waitFor();
    assert.ok(submitted?.includes('Integração de novos colaboradores'));
    assert.ok(submitted?.includes('https://ldrecossistema.online/empresas/integracao-colaboradores'));
    assert.ok(submitted?.includes('Serviços para empresas'));
    assert.equal(await page.getByRole('heading',{name:'Pedido recebido',exact:true}).count(),0);
    await page.unroute('**/_serverFn/**');
    console.log(`PASS ${width}px onboarding: child page, free 12-action download, selected source/solution, intercepted form payload and failure feedback; no database request sent`);
    await page.goto(`${origin}/?area=academy`,{waitUntil:'networkidle'});
    assert.equal(await page.getByRole('heading',{name:'Consultoria, tecnologia e pessoas para desenvolver o seu negócio.',exact:true}).count(),0);
    await page.goto(`${origin}/cliente/propostas`,{waitUntil:'networkidle'});
    assert.equal(new URL(page.url()).pathname,'/cliente/login');
    assert.equal(new URL(page.url()).searchParams.get('next'),'/cliente/propostas');
    assert.deepEqual(errors,[],`uncaught browser errors ${width}px`);
    console.log(`PASS ${width}px: homepage, selected free proposal, Academy and private login redirect; no browser errors`);
    await page.close();
  }
} finally {await browser?.close();server.kill('SIGTERM');}

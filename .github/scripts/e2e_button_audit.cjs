const { chromium } = require('/tmp/ldr-e2e/node_modules/playwright');
const fs = require('fs');

const BASE = 'https://painel.ldrrhestrategia.com';
const PUBLIC_ROUTES = ['/', '/acesso', '/para-profissionais', '/planos-empresas', '/profissionais', '/profissionais/psicanalise', '/profissional/luciano-rodrigues-almeida', '/rede-profissionais/termos', '/mensagens-profissionais?profissional=luciano-rodrigues-almeida', '/formulario', '/cliente/login', '/empresa/login', '/funcionario/login', '/profissional/login', '/login', '/reset-password', '/cliente/ativar', '/cliente/definir-senha'];
const GUARDED_ROUTES = [['/cliente','/cliente/login'], ['/empresa','/empresa/login'], ['/funcionario','/funcionario/login'], ['/painel-profissional','/profissional/login'], ['/admin','/login']];
const OAUTH_ROUTES = ['/cliente/login','/empresa/login','/funcionario/login','/profissional/login'];
const report = { startedAt:new Date().toISOString(), base:BASE, routes:[], links:[], flows:[], buttons:[], warnings:[], failures:[] };
const internal = new Set();
const ctxOpts = (extra={}) => ({ locale:'pt-BR', ...extra });
const fail = (type, detail) => report.failures.push({type,detail});

async function tracked(context){
  const page=await context.newPage(); const errors=[];
  page.on('pageerror',e=>errors.push(`pageerror: ${e.message}`));
  page.on('console',m=>{if(m.type()==='error'&&!/favicon|ERR_BLOCKED_BY_CLIENT/i.test(m.text()))errors.push(`console: ${m.text()}`)});
  return {page,errors};
}

async function auditRoute(context,path){
  const {page,errors}=await tracked(context);
  try{
    const r=await page.goto(BASE+path,{waitUntil:'domcontentloaded',timeout:30000}); await page.waitForTimeout(650);
    const buttons=await page.locator('button').evaluateAll(ns=>ns.map(n=>({text:(n.innerText||n.getAttribute('aria-label')||'').replace(/\s+/g,' ').trim(),disabled:n.disabled,type:n.getAttribute('type')||'submit'})));
    const anchors=await page.locator('a[href]').evaluateAll(ns=>ns.map(n=>({text:(n.innerText||n.getAttribute('aria-label')||'').replace(/\s+/g,' ').trim(),href:n.href})));
    for(const a of anchors){try{const u=new URL(a.href);if(u.origin===BASE&&!u.pathname.startsWith('/api/'))internal.add(u.pathname+u.search)}catch{}}
    const status=r?.status()??null; report.buttons.push({path,count:buttons.length,items:buttons}); report.routes.push({path,status,finalUrl:page.url(),title:await page.title(),buttons:buttons.length,anchors:anchors.length,browserErrors:errors});
    if(status===null||status>=500)fail('route',`${path} respondeu ${status}`); if(errors.length)fail('browser-error',`${path}: ${errors.join(' | ')}`);
  }catch(e){fail('route-exception',`${path}: ${e.message}`)} finally{await page.close()}
}

async function checkLinks(context){
  for(const path of [...internal].sort()){
    try{const r=await context.request.get(BASE+path,{timeout:20000,failOnStatusCode:false});const status=r.status();report.links.push({path,status,ok:status<500});if(status>=500)fail('internal-link',`${path} respondeu ${status}`)}
    catch(e){report.links.push({path,status:null,ok:false,error:e.message});fail('internal-link-exception',`${path}: ${e.message}`)}
  }
}

async function testGuard(browser,from,expected){
  const context=await browser.newContext(ctxOpts()); const {page,errors}=await tracked(context);
  try{await page.goto(BASE+from,{waitUntil:'domcontentloaded',timeout:30000});await page.waitForTimeout(2200);const finalPath=new URL(page.url()).pathname;const ok=finalPath===expected||finalPath.startsWith(expected+'/');report.flows.push({flow:'anonymous-guard',from,expected,finalPath,ok,browserErrors:errors});if(!ok)fail('guard',`${from} terminou em ${finalPath}, esperado ${expected}`)}catch(e){fail('guard-exception',`${from}: ${e.message}`)}
  await context.close();
}

async function testOAuth(browser,route){
  const context=await browser.newContext(ctxOpts()); const {page,errors}=await tracked(context);
  try{await page.goto(BASE+route,{waitUntil:'domcontentloaded',timeout:30000});const b=page.getByRole('button',{name:/Google/i});await b.waitFor({state:'visible',timeout:10000});await b.click();try{await page.waitForURL(/accounts\.google\.com|google\.com\/o\/oauth|supabase\.co\/auth\/v1/i,{timeout:15000})}catch{}const finalUrl=page.url();const ok=/accounts\.google\.com|google\.com\/o\/oauth|supabase\.co\/auth\/v1/i.test(finalUrl);report.flows.push({flow:'google-oauth',route,finalUrl,ok,browserErrors:errors});if(!ok)fail('oauth',`${route} não chegou ao Google/Supabase`)}catch(e){fail('oauth-exception',`${route}: ${e.message}`)}
  await context.close();
}

async function testAdminLogin(browser){
  const context=await browser.newContext(ctxOpts()); const {page,errors}=await tracked(context);
  try{
    await page.goto(BASE+'/login',{waitUntil:'domcontentloaded',timeout:30000});await page.locator('#email').fill(`e2e.invalid.${Date.now()}@example.invalid`);await page.locator('#password').fill('invalid-password-for-e2e-only');await page.getByRole('button',{name:/^Entrar$/i}).click();await page.waitForTimeout(1300);
    const handled=await page.getByText(/Não foi possível entrar/i).count()>0;report.flows.push({flow:'admin-invalid-login',ok:handled,finalUrl:page.url(),browserErrors:errors});if(!handled)fail('admin-login','Credencial inválida não exibiu erro controlado.');
    await page.getByRole('button',{name:/Esqueci minha senha/i}).click();const recovery=await page.getByRole('button',{name:/Enviar instruções/i}).isVisible();report.flows.push({flow:'admin-recovery-toggle',ok:recovery});if(!recovery)fail('admin-recovery','Recuperação não abriu.');
  }catch(e){fail('admin-login-exception',e.message)} await context.close();
}

async function testCompany(browser){
  const context=await browser.newContext(ctxOpts({viewport:{width:1280,height:900}})); const {page,errors}=await tracked(context);
  try{
    await page.goto(BASE+'/planos-empresas',{waitUntil:'domcontentloaded',timeout:30000});
    const labels=['Brasil','Europa','Psicanálise / atendimento individual','Orientação Profissional','Carreira','Mentoria','Massagem Laboral','Hora de Bem-Estar','Palestras','Treinamentos','Ações corporativas','Nenhum','+5','+10','+25'];const clicked=[];
    for(const label of labels){const loc=page.getByRole('button',{name:label,exact:true});if(await loc.count()){await loc.first().click();clicked.push(label);await page.waitForTimeout(60)}}
    const total=await page.getByText(/Total mensal estimado/i).count()>0;const ok=clicked.length===labels.length&&total&&!errors.length;report.flows.push({flow:'company-configurator',clicked,totalVisible:total,ok,browserErrors:errors});if(!ok)fail('company-configurator',`Interações=${clicked.length}/${labels.length}, total=${total}, errors=${errors.join(' | ')}`);
  }catch(e){fail('company-configurator-exception',e.message)} await context.close();
}

async function testDirectory(browser){
  const context=await browser.newContext(ctxOpts({viewport:{width:1280,height:900}})); const {page,errors}=await tracked(context);
  try{
    await page.goto(BASE+'/profissionais',{waitUntil:'domcontentloaded',timeout:30000});const search=page.getByRole('textbox',{name:/Qual profissional/i});await search.fill('Luciano');await page.waitForTimeout(120);const found=await page.getByText(/Luciano Rodrigues Almeida/i).count()>0;
    const online=page.getByRole('button',{name:/^Online$/i});if(await online.count())await online.click();const clear=page.getByRole('button',{name:/Limpar filtros/i});const clearVisible=await clear.count()>0;if(clearVisible)await clear.click();const restored=(await search.inputValue())==='';const ok=found&&restored&&!errors.length;report.flows.push({flow:'directory-filters',found,clearVisible,restored,ok,browserErrors:errors});if(!ok)fail('directory',`found=${found}, clear=${clearVisible}, restored=${restored}, errors=${errors.join(' | ')}`);
  }catch(e){fail('directory-exception',e.message)} await context.close();
}

async function testProfile(browser){
  const context=await browser.newContext(ctxOpts({viewport:{width:1280,height:900}})); const {page,errors}=await tracked(context);
  try{
    await page.goto(BASE+'/profissional/luciano-rodrigues-almeida',{waitUntil:'domcontentloaded',timeout:30000});const book=page.getByRole('button',{name:/^AGENDAR$/i});if(await book.count())await book.click();await page.waitForTimeout(180);const booking=await page.locator('#agendar').count()>0;const chat=await page.getByRole('link',{name:/CHAT/i}).first().getAttribute('href').catch(()=>null);const noAvailability=await page.getByText(/ainda não possui horários disponíveis/i).count()>0;const ok=booking&&!!chat&&!errors.length;report.flows.push({flow:'professional-profile',bookingSection:booking,chatHref:chat,noAvailability,ok,browserErrors:errors});if(!ok)fail('professional-profile',`booking=${booking}, chat=${chat}, errors=${errors.join(' | ')}`);if(noAvailability)report.warnings.push('Perfil público: AGENDAR abre corretamente, mas não há horários ativos configurados; o checkout de atendimento não aparece até existir disponibilidade.');
  }catch(e){fail('professional-profile-exception',e.message)} await context.close();
}

async function testLanguage(browser){
  const context=await browser.newContext(ctxOpts()); const {page,errors}=await tracked(context);
  try{await page.goto(BASE+'/acesso',{waitUntil:'domcontentloaded',timeout:30000});const select=page.getByLabel('Idioma');const changed=[];for(const v of ['en','fr','es','pt']){await select.selectOption(v);changed.push(await select.inputValue());await page.waitForTimeout(70)}const ok=changed.join(',')==='en,fr,es,pt'&&!errors.length;report.flows.push({flow:'language-selector',changed,ok,browserErrors:errors});if(!ok)fail('language-selector',`values=${changed.join(',')}, errors=${errors.join(' | ')}`)}catch(e){fail('language-selector-exception',e.message)} await context.close();
}

(async()=>{
  const browser=await chromium.launch({headless:true});const context=await browser.newContext(ctxOpts({viewport:{width:1280,height:900}}));for(const p of PUBLIC_ROUTES)await auditRoute(context,p);await checkLinks(context);await context.close();
  for(const [from,to] of GUARDED_ROUTES)await testGuard(browser,from,to);for(const route of OAUTH_ROUTES)await testOAuth(browser,route);await testAdminLogin(browser);await testCompany(browser);await testDirectory(browser);await testProfile(browser);await testLanguage(browser);await browser.close();
  report.finishedAt=new Date().toISOString();fs.mkdirSync('artifacts',{recursive:true});fs.writeFileSync('artifacts/e2e-button-audit.json',JSON.stringify(report,null,2));const md=['# Auditoria E2E de botões — Painel LDR','',`Início: ${report.startedAt}`,`Fim: ${report.finishedAt}`,'',`Rotas auditadas: ${report.routes.length}`,`Links internos verificados: ${report.links.length}`,`Fluxos especiais: ${report.flows.length}`,`Falhas: ${report.failures.length}`,`Avisos: ${report.warnings.length}`,'','## Falhas',...(report.failures.length?report.failures.map(x=>`- ${x.type}: ${x.detail}`):['- Nenhuma']),'','## Avisos',...(report.warnings.length?report.warnings.map(x=>`- ${x}`):['- Nenhum']),'','## Fluxos',...report.flows.map(x=>`- ${x.flow}: ${x.ok===false?'FALHOU':'OK'}${x.route?` (${x.route})`:''}${x.from?` (${x.from} -> ${x.finalPath})`:''}`)].join('\n');fs.writeFileSync('artifacts/e2e-button-audit.md',md);console.log(md);if(report.failures.length)process.exitCode=1;
})();

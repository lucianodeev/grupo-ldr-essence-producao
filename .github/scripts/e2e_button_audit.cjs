const { chromium } = require('/tmp/ldr-e2e/node_modules/playwright');
const fs = require('fs');

const BASE = 'https://painel.ldrrhestrategia.com';
const PUBLIC_ROUTES = [
  '/', '/acesso', '/para-profissionais', '/planos-empresas', '/profissionais',
  '/profissionais/psicanalise', '/profissional/luciano-rodrigues-almeida',
  '/rede-profissionais/termos', '/mensagens-profissionais?profissional=luciano-rodrigues-almeida',
  '/formulario', '/cliente/login', '/empresa/login', '/funcionario/login',
  '/profissional/login', '/login', '/reset-password', '/cliente/ativar', '/cliente/definir-senha'
];
const GUARDED_ROUTES = [
  ['/cliente', '/cliente/login'],
  ['/empresa', '/empresa/login'],
  ['/funcionario', '/funcionario/login'],
  ['/painel-profissional', '/profissional/login'],
  ['/admin', '/login'],
];
const OAUTH_ROUTES = ['/cliente/login', '/empresa/login', '/funcionario/login', '/profissional/login'];
const report = { startedAt: new Date().toISOString(), base: BASE, routes: [], links: [], flows: [], buttons: [], warnings: [], failures: [] };
const uniqueInternalLinks = new Set();

function cleanText(value) { return String(value || '').replace(/\s+/g, ' ').trim().slice(0, 180); }
function addFailure(type, detail) { report.failures.push({ type, detail }); }

async function newTrackedPage(context) {
  const page = await context.newPage();
  const browserErrors = [];
  page.on('pageerror', e => browserErrors.push(`pageerror: ${e.message}`));
  page.on('console', m => {
    if (m.type() === 'error') {
      const t = m.text();
      if (!/favicon|ERR_BLOCKED_BY_CLIENT/i.test(t)) browserErrors.push(`console: ${t}`);
    }
  });
  return { page, browserErrors };
}

async function auditPublicRoute(context, path) {
  const { page, browserErrors } = await newTrackedPage(context);
  try {
    const response = await page.goto(BASE + path, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(700);
    const status = response ? response.status() : null;
    const title = await page.title();
    const buttons = await page.locator('button').evaluateAll(nodes => nodes.map(n => ({
      text: (n.innerText || n.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim(),
      disabled: n.disabled,
      type: n.getAttribute('type') || 'submit'
    })));
    report.buttons.push({ path, count: buttons.length, items: buttons });
    const anchors = await page.locator('a[href]').evaluateAll(nodes => nodes.map(n => ({
      text: (n.innerText || n.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim(), href: n.href
    })));
    for (const a of anchors) {
      try {
        const u = new URL(a.href);
        if (u.origin === BASE && !u.pathname.startsWith('/api/')) uniqueInternalLinks.add(u.pathname + u.search);
      } catch {}
    }
    const ok = status !== null && status < 500;
    report.routes.push({ path, status, finalUrl: page.url(), title, buttons: buttons.length, anchors: anchors.length, browserErrors });
    if (!ok) addFailure('route', `${path} respondeu ${status}`);
    if (browserErrors.length) addFailure('browser-error', `${path}: ${browserErrors.join(' | ')}`);
  } catch (e) {
    addFailure('route-exception', `${path}: ${e.message}`);
  } finally { await page.close(); }
}

async function checkInternalLinks(context) {
  for (const path of [...uniqueInternalLinks].sort()) {
    try {
      const r = await context.request.get(BASE + path, { timeout: 20000, failOnStatusCode: false });
      const status = r.status();
      report.links.push({ path, status, ok: status < 500 });
      if (status >= 500) addFailure('internal-link', `${path} respondeu ${status}`);
    } catch (e) {
      report.links.push({ path, status: null, ok: false, error: e.message });
      addFailure('internal-link-exception', `${path}: ${e.message}`);
    }
  }
}

async function testGuard(browser, from, expected) {
  const context = await browser.newContext();
  const { page, browserErrors } = await newTrackedPage(context);
  try {
    await page.goto(BASE + from, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2500);
    const finalPath = new URL(page.url()).pathname;
    const ok = finalPath === expected || finalPath.startsWith(expected + '/');
    report.flows.push({ flow: 'anonymous-guard', from, expected, finalPath, ok, browserErrors });
    if (!ok) addFailure('guard', `${from} terminou em ${finalPath}, esperado ${expected}`);
  } catch (e) { addFailure('guard-exception', `${from}: ${e.message}`); }
  await context.close();
}

async function testOAuth(browser, route) {
  const context = await browser.newContext();
  const { page, browserErrors } = await newTrackedPage(context);
  try {
    await page.goto(BASE + route, { waitUntil: 'domcontentloaded', timeout: 30000 });
    const google = page.getByRole('button', { name: /Google/i });
    await google.waitFor({ state: 'visible', timeout: 10000 });
    await google.click();
    try { await page.waitForURL(/accounts\.google\.com|google\.com\/o\/oauth|supabase\.co\/auth\/v1/i, { timeout: 15000 }); } catch {}
    const finalUrl = page.url();
    const ok = /accounts\.google\.com|google\.com\/o\/oauth|supabase\.co\/auth\/v1/i.test(finalUrl);
    report.flows.push({ flow: 'google-oauth', route, finalUrl, ok, browserErrors });
    if (!ok) addFailure('oauth', `${route} não chegou ao provedor Google/Supabase: ${finalUrl}`);
  } catch (e) { addFailure('oauth-exception', `${route}: ${e.message}`); }
  await context.close();
}

async function testAdminLogin(browser) {
  const context = await browser.newContext();
  const { page, browserErrors } = await newTrackedPage(context);
  try {
    await page.goto(BASE + '/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.locator('#email').fill(`e2e.invalid.${Date.now()}@example.invalid`);
    await page.locator('#password').fill('invalid-password-for-e2e-only');
    await page.getByRole('button', { name: /^Entrar$/i }).click();
    await page.waitForTimeout(1500);
    const invalidHandled = await page.getByText(/Não foi possível entrar/i).count() > 0;
    report.flows.push({ flow: 'admin-invalid-login', ok: invalidHandled, finalUrl: page.url(), browserErrors });
    if (!invalidHandled) addFailure('admin-login', 'Credencial inválida não exibiu erro controlado.');

    await page.getByRole('button', { name: /Esqueci minha senha/i }).click();
    const recoveryVisible = await page.getByRole('button', { name: /Enviar instruções/i }).isVisible();
    report.flows.push({ flow: 'admin-recovery-toggle', ok: recoveryVisible });
    if (!recoveryVisible) addFailure('admin-recovery', 'Botão de recuperação não abriu o formulário.');
  } catch (e) { addFailure('admin-login-exception', e.message); }
  await context.close();
}

async function testCompanyConfigurator(browser) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const { page, browserErrors } = await newTrackedPage(context);
  try {
    await page.goto(BASE + '/planos-empresas', { waitUntil: 'domcontentloaded', timeout: 30000 });
    const labels = ['Brasil', 'Europa', 'Psicanálise / atendimento individual', 'Orientação Profissional', 'Carreira', 'Mentoria', 'Massagem Laboral', 'Hora de Bem-Estar', 'Palestras', 'Treinamentos', 'Ações corporativas', '+5', '+10', '+25', 'Nenhum'];
    const clicked = [];
    for (const label of labels) {
      const loc = page.getByRole('button', { name: label, exact: true });
      if (await loc.count()) { await loc.first().click(); clicked.push(label); await page.waitForTimeout(80); }
    }
    const totalVisible = await page.getByText(/Total mensal estimado/i).count() > 0;
    const ok = clicked.length >= 10 && totalVisible && browserErrors.length === 0;
    report.flows.push({ flow: 'company-configurator', clicked, totalVisible, ok, browserErrors });
    if (!ok) addFailure('company-configurator', `Interações=${clicked.length}, totalVisible=${totalVisible}, errors=${browserErrors.join(' | ')}`);
  } catch (e) { addFailure('company-configurator-exception', e.message); }
  await context.close();
}

async function testDirectory(browser) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const { page, browserErrors } = await newTrackedPage(context);
  try {
    await page.goto(BASE + '/profissionais', { waitUntil: 'domcontentloaded', timeout: 30000 });
    const search = page.getByRole('textbox', { name: /Qual profissional/i });
    await search.fill('Luciano');
    await page.waitForTimeout(150);
    const found = await page.getByText(/Luciano Rodrigues Almeida/i).count() > 0;
    const online = page.getByRole('button', { name: /^Online$/i });
    if (await online.count()) await online.click();
    const clear = page.getByRole('button', { name: /Limpar filtros/i });
    const clearVisible = await clear.count() > 0;
    if (clearVisible) await clear.click();
    const restored = (await search.inputValue()) === '';
    const ok = found && restored && browserErrors.length === 0;
    report.flows.push({ flow: 'directory-filters', found, clearVisible, restored, ok, browserErrors });
    if (!ok) addFailure('directory', `found=${found}, clear=${clearVisible}, restored=${restored}, errors=${browserErrors.join(' | ')}`);
  } catch (e) { addFailure('directory-exception', e.message); }
  await context.close();
}

async function testProfessionalProfile(browser) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const { page, browserErrors } = await newTrackedPage(context);
  try {
    await page.goto(BASE + '/profissional/luciano-rodrigues-almeida', { waitUntil: 'domcontentloaded', timeout: 30000 });
    const book = page.getByRole('button', { name: /^AGENDAR$/i });
    if (await book.count()) await book.click();
    await page.waitForTimeout(200);
    const bookingSection = await page.locator('#agendar').count() > 0;
    const chatHref = await page.getByRole('link', { name: /CHAT/i }).first().getAttribute('href').catch(() => null);
    const noAvailability = await page.getByText(/ainda não possui horários disponíveis/i).count() > 0;
    const ok = bookingSection && !!chatHref && browserErrors.length === 0;
    report.flows.push({ flow: 'professional-profile', bookingSection, chatHref, noAvailability, ok, browserErrors });
    if (!ok) addFailure('professional-profile', `booking=${bookingSection}, chat=${chatHref}, errors=${browserErrors.join(' | ')}`);
    if (noAvailability) report.warnings.push('Perfil público: botão AGENDAR funciona e abre a área de agendamento, porém não há horários ativos configurados; checkout de atendimento não pode ser concluído até existir disponibilidade.');
  } catch (e) { addFailure('professional-profile-exception', e.message); }
  await context.close();
}

async function testLanguageSelector(browser) {
  const context = await browser.newContext();
  const { page, browserErrors } = await newTrackedPage(context);
  try {
    await page.goto(BASE + '/acesso', { waitUntil: 'domcontentloaded', timeout: 30000 });
    const select = page.getByLabel('Idioma');
    const changed = [];
    for (const value of ['en', 'fr', 'es', 'pt']) { await select.selectOption(value); changed.push(await select.inputValue()); await page.waitForTimeout(80); }
    const ok = changed.join(',') === 'en,fr,es,pt' && browserErrors.length === 0;
    report.flows.push({ flow: 'language-selector', changed, ok, browserErrors });
    if (!ok) addFailure('language-selector', `values=${changed.join(',')}, errors=${browserErrors.join(' | ')}`);
  } catch (e) { addFailure('language-selector-exception', e.message); }
  await context.close();
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  for (const path of PUBLIC_ROUTES) await auditPublicRoute(context, path);
  await checkInternalLinks(context);
  await context.close();

  for (const [from, expected] of GUARDED_ROUTES) await testGuard(browser, from, expected);
  for (const route of OAUTH_ROUTES) await testOAuth(browser, route);
  await testAdminLogin(browser);
  await testCompanyConfigurator(browser);
  await testDirectory(browser);
  await testProfessionalProfile(browser);
  await testLanguageSelector(browser);
  await browser.close();

  report.finishedAt = new Date().toISOString();
  fs.mkdirSync('artifacts', { recursive: true });
  fs.writeFileSync('artifacts/e2e-button-audit.json', JSON.stringify(report, null, 2));
  const md = [
    '# Auditoria E2E de botões — Painel LDR',
    '', `Início: ${report.startedAt}`, `Fim: ${report.finishedAt}`,
    '', `Rotas auditadas: ${report.routes.length}`, `Links internos verificados: ${report.links.length}`, `Fluxos especiais: ${report.flows.length}`, `Falhas: ${report.failures.length}`, `Avisos: ${report.warnings.length}`,
    '', '## Falhas', ...(report.failures.length ? report.failures.map(x => `- ${x.type}: ${x.detail}`) : ['- Nenhuma']),
    '', '## Avisos', ...(report.warnings.length ? report.warnings.map(x => `- ${x}`) : ['- Nenhum']),
    '', '## Fluxos', ...report.flows.map(x => `- ${x.flow}: ${x.ok === false ? 'FALHOU' : 'OK'}${x.route ? ` (${x.route})` : ''}${x.from ? ` (${x.from} -> ${x.finalPath})` : ''}`),
  ].join('\n');
  fs.writeFileSync('artifacts/e2e-button-audit.md', md);
  console.log(md);
  if (report.failures.length) process.exitCode = 1;
})();

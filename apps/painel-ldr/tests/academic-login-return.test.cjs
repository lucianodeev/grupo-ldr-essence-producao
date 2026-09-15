// Isolated login regressions: no real accounts, credentials, or production writes.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const ssr = require('@supabase/ssr');
const ROOT = path.resolve(__dirname, '../src');

function load(name, mocks = {}, globals = {}) {
  const filename = path.resolve(ROOT, name);
  const output = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const module = { exports: {} };
  const resolve = id => {
    if (Object.hasOwn(mocks, id)) return mocks[id];
    if (id.startsWith('@/')) return load(id.slice(2) + '.ts', mocks, globals);
    return require(id);
  };
  vm.runInNewContext(output, { module, exports: module.exports, require: resolve, console, URL, Request, Response, Headers, ...globals }, { filename });
  return module.exports;
}

const helper = load('lib/academic-login-return.ts');
const next = '/cliente/rede-academica/desafios?tab=ativos#lista';
const cookie = ssr.serializeCookieHeader(helper.ACADEMIC_RETURN_COOKIE, next);

test('academic return preserves nested route, search and hash; rejects external or unrelated destinations', () => {
  assert.equal(helper.academicReturnPath(next), next);
  assert.equal(helper.academicLoginHref(next), `/cliente/login?next=${encodeURIComponent(next)}`);
  for (const target of ['https://evil.test', '//evil.test/cliente/rede-academica', '/\\evil.test', '/cliente/biblioteca', '/cliente/rede-academica-falsa', '/cliente/rede-academica/../../admin', '/cliente/rede-academica\r\nLocation: bad', null, 1]) {
    assert.equal(helper.academicReturnPath(target), null, String(target));
    assert.equal(helper.academicLoginHref(target), '/cliente/login');
  }
});

function callback(error = null) {
  const exchanges = [];
  const route = load('routes/api/auth/callback.ts', {
    '@tanstack/react-router': { createFileRoute: () => options => options },
    '@supabase/ssr': {
      ...ssr,
      createServerClient: (_url, _key, options) => ({ auth: {
        async exchangeCodeForSession(code) {
          exchanges.push({ code, cookies: options.cookies.getAll() });
          if (!error) options.cookies.setAll([{ name: 'test-session', value: 'fixture', options: { httpOnly: true } }], { 'cache-control': 'private, no-store' });
          return { error };
        },
      } }),
    },
  }, { process: { env: { SUPABASE_URL: 'https://example.supabase.co', SUPABASE_PUBLISHABLE_KEY: 'test-key' } } }).Route;
  return { exchanges, run: (url, cookies = '') => route.server.handlers.GET({ request: new Request(url, { headers: { cookie: cookies } }) }) };
}

test('successful academic callback receives same-origin verifier and returns to exact route with session cookies', async () => {
  const handler = callback();
  const response = await handler.run(`${helper.ACADEMY_ORIGIN}/api/auth/callback?code=test-only`, `${cookie}; test-code-verifier=fixture`);
  assert.equal(response.status, 303);
  assert.equal(response.headers.get('location'), next);
  assert.equal(handler.exchanges.length, 1);
  assert.ok(handler.exchanges[0].cookies.some(c => c.name === 'test-code-verifier' && c.value === 'fixture'));
  assert.match(response.headers.get('set-cookie'), /test-session=fixture/);
  assert.match(response.headers.get('set-cookie'), /ldr_academic_return_to=; Max-Age=0/);
  assert.match(response.headers.get('cache-control'), /no-store/);
});

test('failed and missing OAuth code return to academic login with a visible error and preserved destination', async () => {
  for (const [suffix, error, expected] of [['?code=test-only', { message: 'expired' }, 'exchange_failed'], ['', null, 'missing_code']]) {
    const handler = callback(error);
    const response = await handler.run(`${helper.ACADEMY_ORIGIN}/api/auth/callback${suffix}`, cookie);
    assert.equal(response.headers.get('location'), `${helper.academicLoginHref(next)}&auth_error=${expected}`);
    assert.match(response.headers.get('set-cookie'), /Max-Age=0/);
    assert.equal(handler.exchanges.length, suffix ? 1 : 0);
  }
});

test('academic navigation cookie cannot redirect another portal or an external host', async () => {
  const cases = [
    ['https://ldracademy.online', '?code=test-only&admin=1', cookie, '/admin'],
    ['https://ldracademy.online', '?code=test-only', `${cookie}; ldr_portal_oauth=company`, '/empresa/login?auth_complete=1'],
    ['https://ldracademy.online', '?code=test-only', `${cookie}; ldr_portal_oauth=employee`, '/funcionario/login?auth_complete=1'],
    ['https://ldracademy.online', '?code=test-only', `${cookie}; ldr_portal_oauth=professional`, '/profissional/login?auth_complete=1'],
    ['https://portal.ldrrhestrategia.com', '?code=test-only', cookie, '/cliente?portal=services&v=4'],
    ['https://painel.ldrrhestrategia.com', '?code=test-only', cookie, '/cliente/biblioteca'],
    ['https://ldracademy.online', '?code=test-only', ssr.serializeCookieHeader(helper.ACADEMIC_RETURN_COOKIE, '//evil.test'), '/cliente/biblioteca'],
    ['https://ldracademy.online', '?code=test-only', '', '/cliente/biblioteca'],
  ];
  for (const [origin, query, cookies, expected] of cases) {
    assert.equal((await callback().run(`${origin}/api/auth/callback${query}`, cookies)).headers.get('location'), expected);
  }
});

function login(host, search = {}, session = null) {
  const effects = [], oauth = [], redirects = [], cookies = [];
  const location = { hostname: host, origin: `https://${host}`, replace: url => redirects.push(url) };
  const document = { referrer: '', set cookie(value) { cookies.push(value); } };
  const route = load('routes/cliente.login.tsx', {
    '@tanstack/react-router': { createFileRoute: () => options => ({ ...options, useSearch: () => options.validateSearch(search) }), Link: 'a' },
    'react': { useEffect: fn => effects.push(fn), useRef: value => ({ current: value }), useState: value => [value, () => {}] },
    'sonner': { toast: { error: () => {} } },
    '@/integrations/supabase/client': { supabase: { auth: {
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
      getSession: async () => ({ data: { session } }),
      signInWithOAuth: async args => { oauth.push(args); return { data: { url: 'https://accounts.google.com/test-only' }, error: null }; },
    } } },
  }, { window: { location }, document, fetch: async () => ({ ok: true }) }).Route;
  const tree = route.component();
  const button = tree.props.children.find(child => child?.type === 'button');
  return { tree, effects, oauth, redirects, cookies, click: () => button.props.onClick() };
}

test('Google login uses canonical callback and bounded academic return cookie before leaving the domain', async () => {
  const page = login('ldracademy.online', { next });
  await page.click();
  assert.equal(page.oauth[0].options.redirectTo, `${helper.ACADEMY_ORIGIN}/api/auth/callback`);
  assert.equal(page.oauth[0].options.skipBrowserRedirect, true);
  assert.match(page.cookies[0], /Max-Age=600; Path=\/; Secure; SameSite=Lax/);
  assert.equal(ssr.parseCookieHeader(page.cookies[0])[0].value, next);
  assert.deepEqual(page.redirects, ['https://accounts.google.com/test-only']);
});

test('existing authenticated session returns to requested academic route; aliases canonicalize before auth', async () => {
  const page = login('ldracademy.online', { next }, { access_token: 'fixture', refresh_token: 'fixture' });
  page.effects.forEach(effect => effect());
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(page.redirects, [next]);
  const alias = login('www.ldracademy.online', { next });
  alias.effects.forEach(effect => effect());
  assert.deepEqual(alias.redirects, [`${helper.ACADEMY_ORIGIN}${helper.academicLoginHref(next)}`]);
  assert.equal(alias.oauth.length, 0);
});

test('services OAuth callback and absence of academic cookies are preserved', async () => {
  const page = login('portal.ldrrhestrategia.com', { portal: 'services', next });
  await page.click();
  assert.equal(page.oauth[0].options.redirectTo, 'https://portal.ldrrhestrategia.com/api/auth/callback');
  assert.equal(page.cookies.length, 0);
});

test('failed login presents an accessible retry message instead of a silent loop', () => {
  const page = login('ldracademy.online', { next, auth_error: 'exchange_failed' });
  const alert = page.tree.props.children.find(child => child?.props?.role === 'alert');
  assert.match(alert.props.children, /Não foi possível concluir o login/);
});

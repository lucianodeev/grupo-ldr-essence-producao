import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { readFileSync } from 'node:fs';

// Run only against a local build, without inherited database/payment credentials.
const port = process.env.LDR_SMOKE_PORT || '42165';
const server = spawn(process.execPath, ['.output/server/index.mjs'], {
  env: { PATH: process.env.PATH, NODE_ENV: 'production', HOST: '127.0.0.1', PORT: port },
  stdio: ['ignore', 'pipe', 'pipe'],
});
const deadline = setTimeout(() => server.kill('SIGKILL'), 45000);
try {
  await new Promise((resolve, reject) => {
    server.stdout.on('data', chunk => { if (chunk.toString().includes('Listening')) resolve(); });
    server.once('error', reject);
    server.once('exit', code => reject(new Error(`Local server stopped: ${code}`)));
  });
  const routes = new Map([
    ['/empresas', 'Pessoas, estratégia e desenvolvimento'],
    ['/empresas/servicos', 'RH &amp; Estratégia'],
    ['/empresas/proposta', 'Vamos construir a proposta certa'],
    ['/empresas/academy', 'Academy para empresas e instituições'],
    ['/empresas/ldr-one', 'LDR ONE para empresas'],
  ]);
  const links = new Set();
  for (const [route, title] of routes) {
    const response = await fetch(`http://127.0.0.1:${port}${route}`);
    assert.equal(response.status, 200, route);
    const html = await response.text();
    const headings = [...html.matchAll(/<h1[^>]*>(.*?)<\/h1>/gs)].map(match => match[1]);
    assert.equal(headings.length, 1, `${route}: one page heading`);
    assert.ok(headings[0].includes(title), `${route}: correct child page rendered`);
    if (route === '/empresas/proposta') {
      assert.match(html, /name="consent"/);
      assert.match(html, /name="organization"/);
      assert.match(html, /Enviar pedido institucional/);
    }
    for (const match of html.matchAll(/href="(\/(?!\/)[^"#]*)"/g)) links.add(match[1].replaceAll('&amp;', '&'));
    console.log(`${route}: HTTP 200, heading verified`);
  }
  const routeRegistry = readFileSync('src/routeTree.gen.ts', 'utf8').split('export interface FileRoutesByFullPath {')[1].split('\n}')[0];
  const knownRoutes = new Set([...routeRegistry.matchAll(/^  '([^']+)':/gm)].map(match => match[1]));
  let assets = 0;
  for (const route of links) {
    if (route.startsWith('/assets/') || /\.[a-z0-9]{2,5}(?:[?#]|$)/i.test(route)) {
      const response = await fetch(`http://127.0.0.1:${port}${route}`);
      assert.equal(response.status, 200, route);
      assets++;
    } else {
      assert.ok(knownRoutes.has(route.split(/[?#]/)[0]), `${route}: registered destination`);
    }
  }
  console.log(`${routes.size} enterprise HTTP routes, ${assets} HTTP assets and ${links.size} registered internal targets passed. Database-backed destination behavior requires a configured test backend. No forms submitted.`);
} finally {
  clearTimeout(deadline);
  if (server.exitCode === null && server.signalCode === null) {
    server.kill('SIGTERM');
    const force = setTimeout(() => server.kill('SIGKILL'), 6000);
    await once(server, 'exit').catch(() => {});
    clearTimeout(force);
  }
}

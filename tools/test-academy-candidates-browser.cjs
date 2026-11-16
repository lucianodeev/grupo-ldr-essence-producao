// Private, local fixture: no account, production traffic, activation or approval overrides.
'use strict';
const fs = require('node:fs'), path = require('node:path'), http = require('node:http');
const assert = require('node:assert/strict');
const { build } = require('esbuild');
const { chromium } = require(process.env.LDR_READER_PLAYWRIGHT || 'playwright');
const { prepareAllCandidates } = require('./prepare-course-academy-candidates.cjs');
const root = path.resolve(__dirname, '..');
const scratch = process.env.LDR_CANDIDATE_EVIDENCE || '/tmp/ldr-candidates-browser';
const editions = prepareAllCandidates();
const normal = text => text.replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
async function main() {
  fs.mkdirSync(scratch, { recursive: true });
  await build({
    stdin: {
      contents: `import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import {AcademyMarkdown,AcademyReadingEditionView} from './src/components/academy-reading-edition';
const editions=${JSON.stringify(editions)};
window.__writes=[];const write=Storage.prototype.setItem;
Storage.prototype.setItem=function(...args){window.__writes.push(args);return write.apply(this,args)};
function Review(){const [course,setCourse]=useState(0),[unit,setUnit]=useState(0);
const edition=editions[course],module=edition.modules[unit];
return <main className="mx-auto max-w-6xl space-y-5 p-4">
<h1>Revisão técnica isolada — conteúdos não publicados</h1>
<label htmlFor="review-course">Curso em revisão</label><select id="review-course" value={course} onChange={event=>{setCourse(Number(event.target.value));setUnit(0)}} className="block w-full min-w-0 max-w-full border p-3">{editions.map((item,index)=><option key={item.slug} value={index}>{item.slug}</option>)}</select>
<nav aria-label="Unidades em revisão" className="grid gap-2 sm:grid-cols-2">{edition.modules.map((item,index)=><button type="button" key={item.id} aria-current={unit===index?'step':undefined} onClick={()=>setUnit(index)} className="min-w-0 rounded border p-3 text-left">{item.id}. {item.title}</button>)}</nav>
<article aria-label={module.title} className="min-w-0 rounded border p-4"><h2>{module.title}</h2><AcademyMarkdown body={module.body}/></article>
<section aria-label="Bloqueio de publicação"><AcademyReadingEditionView edition={edition}/></section>
</main>}
createRoot(document.getElementById('root')).render(<Review/>);`,
      loader: 'tsx', sourcefile: 'candidate-review-fixture.tsx',
      resolveDir: path.join(root, 'apps/painel-ldr'),
    },
    bundle: true, platform: 'browser', outfile: path.join(scratch, 'fixture.js'),
    define: { 'process.env.NODE_ENV': '"production"' },
    tsconfig: path.join(root, 'apps/painel-ldr/tsconfig.json'),
  });
  const assets = path.join(root, 'apps/painel-ldr/dist/client/assets');
  const styles = fs.readdirSync(assets).filter(file => file.endsWith('.css'));
  assert.ok(styles.length, 'Build real application styles first');
  const server = http.createServer((request, response) => {
    if (request.url === '/fixture.js') {
      response.setHeader('Content-Type', 'text/javascript; charset=utf-8');
      return response.end(fs.readFileSync(path.join(scratch, 'fixture.js')));
    }
    const name = path.basename(request.url);
    if (request.url.startsWith('/assets/') && styles.includes(name)) {
      response.setHeader('Content-Type', 'text/css');
      return response.end(fs.readFileSync(path.join(assets, name)));
    }
    response.setHeader('Content-Type', 'text/html; charset=utf-8');
    response.end(`<!doctype html><html lang="pt"><head><meta name="viewport" content="width=device-width,initial-scale=1">${styles.map(name => `<link rel="stylesheet" href="/assets/${name}">`).join('')}</head><body><div id="root"></div><script src="/fixture.js"></script></body></html>`);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = 'http://127.0.0.1:' + server.address().port;
  let browser;
  const results = [];
  try {
    browser = await chromium.launch({ headless: true, args: ['--no-sandbox'],
      ...(process.env.LDR_READER_CHROMIUM ? { executablePath: process.env.LDR_READER_CHROMIUM } : {}) });
    for (const viewport of [{ width: 390, height: 844 }, { width: 1280, height: 900 }]) {
      const page = await browser.newPage({ viewport });
      const errors = [], externalRequests = [], courses = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('request', request => { if (!request.url().startsWith(origin + '/')) externalRequests.push(request.url()); });
      await page.goto(origin);
      await page.screenshot({ path: path.join(scratch, 'initial-' + viewport.width + '.png') });
      for (const [courseIndex, edition] of editions.entries()) {
        await page.getByLabel('Curso em revisão', { exact: true }).selectOption(String(courseIndex));
        const nav = page.getByRole('navigation', { name: 'Unidades em revisão' });
        assert.equal(await nav.getByRole('button').count(), edition.modules.length);
        const checks = [];
        for (const [index, module] of edition.modules.entries()) {
          await nav.getByRole('button').nth(index).click();
          const article = page.getByRole('article', { name: module.title, exact: true });
          await article.waitFor();
          const text = normal(await article.innerText());
          // Inspect every authored paragraph, objective, answer, rubric and supplementary datum.
          for (const block of module.body.split(/\n\s*\n/)) {
            if (!block.startsWith('#')) assert.ok(text.includes(normal(block)), edition.slug + '/' + module.id + ': missing text');
          }
          assert.equal(await nav.getByRole('button').nth(index).getAttribute('aria-current'), 'step');
          assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), edition.slug + '/' + module.id + ': page overflow');
          assert.equal(await page.getByRole('region', { name: 'Bloqueio de publicação' }).getByRole('article').count(), 0);
          checks.push({ id: module.id, sha256: module.sha256, sourceSha256: module.sourceSha256 });
        }
        await nav.getByRole('button').nth(0).focus();
        await page.keyboard.press('Tab');
        assert.ok(await nav.getByRole('button').nth(1).evaluate(element => element === document.activeElement));
        await page.keyboard.press('Enter');
        assert.equal(await nav.getByRole('button').nth(1).getAttribute('aria-current'), 'step');
        courses.push({ slug: edition.slug, editionId: edition.editionId, units: checks, keyboard: true, publicationBlocked: true });
      }
      assert.deepEqual(errors, []); assert.deepEqual(externalRequests, []);
      assert.deepEqual(await page.evaluate(() => window.__writes), []);
      await page.screenshot({ path: path.join(scratch, 'review-' + viewport.width + '.png'), fullPage: false });
      results.push({ viewport, courses, scriptErrors: 0, externalRequests: 0, storageWrites: 0, pageOverflow: false });
      await page.close();
    }
    const report = { pass: true, scope: 'Offline AcademyMarkdown rendering and fixture navigation only; no specialist, assistive-technology or participant review; no publication approval',
      courses: editions.length, units: editions.reduce((total, edition) => total + edition.modules.length, 0), results };
    fs.writeFileSync(path.join(scratch, 'results.json'), JSON.stringify(report, null, 2));
    console.log(JSON.stringify({ pass: true, courses: report.courses, units: report.units, viewports: results.map(result => result.viewport), published: 0 }));
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });

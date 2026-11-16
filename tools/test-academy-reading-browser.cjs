const fs = require("node:fs"),
  path = require("node:path"),
  http = require("node:http"),
  assert = require("node:assert/strict");
const root = process.cwd();
const { build } = require(path.join(root, "node_modules/esbuild"));
const { chromium } = require(process.env.LDR_READER_PLAYWRIGHT || "playwright");
const { prepareAcademyCandidate } = require(
  path.join(root, "tools/prepare-customer-service-academy.cjs"),
);
const scratch = "/tmp/ldr-reading-browser";
fs.mkdirSync(scratch, { recursive: true });
const source = prepareAcademyCandidate();
// Approved reading content inside an isolated local fixture, never a signed-in production account.
const load = require(
  path.join(root, "apps/painel-ldr/tests/helpers/load-ts.cjs"),
)();
const fixture = load(
  "content/academy-reading/customer-service-release.server.ts",
).CUSTOMER_SERVICE_READING_EDITION;
(async () => {
  await build({
    stdin: {
      contents: `import React from 'react'; import {createRoot} from 'react-dom/client'; import {AcademyReadingEditionView} from './src/components/academy-reading-edition'; const edition=${JSON.stringify(fixture)}; const draft=${JSON.stringify(source)}; window.__writes=[]; const original=Storage.prototype.setItem; Storage.prototype.setItem=function(...args){window.__writes.push(args);return original.apply(this,args)}; createRoot(document.getElementById('root')).render(<><p>TESTE ISOLADO — edição de leitura; sem sessão real.</p><AcademyReadingEditionView edition={new URLSearchParams(location.search).has('pending')?draft:edition}/></>);`,
      resolveDir: path.join(root, "apps/painel-ldr"),
      sourcefile: "reading-browser-fixture.tsx",
      loader: "tsx",
    },
    bundle: true,
    outfile: path.join(scratch, "fixture.js"),
    platform: "browser",
    define: { "process.env.NODE_ENV": '"production"' },
    tsconfig: path.join(root, "apps/painel-ldr/tsconfig.json"),
  });
  const assets = path.join(root, "apps/painel-ldr/dist/client/assets");
  const css = fs.readdirSync(assets).filter((f) => f.endsWith(".css"));
  const server = http.createServer((req, res) => {
    if (req.url === "/fixture.js") {
      res.setHeader("Content-Type", "text/javascript");
      return res.end(fs.readFileSync(path.join(scratch, "fixture.js")));
    }
    if (req.url.startsWith("/assets/")) {
      const file = path.basename(req.url);
      res.setHeader("Content-Type", "text/css");
      return res.end(fs.readFileSync(path.join(assets, file)));
    }
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.end(
      `<!doctype html><html lang="pt"><head><meta name="viewport" content="width=device-width,initial-scale=1">${css.map((f) => `<link rel="stylesheet" href="/assets/${f}">`).join("")}</head><body><div id="root" style="max-width:1100px;margin:auto;padding:16px"></div><script src="/fixture.js"></script></body></html>`,
    );
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const url = "http://127.0.0.1:" + server.address().port;

  let browser;
  const results = [];
  try {
    browser = await chromium.launch({
      ...(process.env.LDR_READER_CHROMIUM
        ? { executablePath: process.env.LDR_READER_CHROMIUM }
        : {}),
      headless: true,
      args: ["--no-sandbox"],
    });
    for (const viewport of [
      { width: 390, height: 844 },
      { width: 1280, height: 900 },
    ]) {
      const page = await browser.newPage({ viewport });
      const errors = [];
      const unexpected = [];
      page.on("pageerror", (e) => errors.push(e.message));
      page.on("request", (r) => {
        if (!r.url().startsWith(url)) unexpected.push(r.url());
      });
      await page.goto(url);
      const nav = page.getByRole("navigation", {
        name: "Unidades da edição de leitura",
      });
      await nav.waitFor();
      assert.equal(await nav.getByRole("button").count(), 6);
      for (let index = 0; index < 6; index++) {
        await nav.getByRole("button").nth(index).click();
        const article = page.getByRole("article", {
          name: source.modules[index].title,
        });
        await article.waitFor();
        assert.ok((await article.innerText()).length > 1000);
        assert.ok(!(await article.innerText()).includes("Revisões pendentes:"));
        assert.equal(
          await nav.getByRole("button").nth(index).getAttribute("aria-current"),
          "step",
        );
        assert.ok(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          "page overflow " + viewport.width + " unit " + index,
        );
      }
      assert.equal(await page.getByRole("columnheader").count(), 3);
      assert.equal(await page.getByRole("table").count(), 1);
      await nav.getByRole("button").nth(0).focus();
      await page.keyboard.press("Tab");
      assert.ok(
        await nav
          .getByRole("button")
          .nth(1)
          .evaluate((e) => e === document.activeElement),
      );
      await page.keyboard.press("Enter");
      assert.equal(
        await nav.getByRole("button").nth(1).getAttribute("aria-current"),
        "step",
      );
      assert.deepEqual(await page.evaluate(() => window.__writes), []);
      assert.deepEqual(unexpected, []);
      assert.deepEqual(errors, []);
      await page.screenshot({
        path: path.join(scratch, "reader-" + viewport.width + ".png"),
        fullPage: true,
      });
      await page.goto(url + "/?pending");
      await page.waitForFunction(() => Array.isArray(window.__writes));
      assert.equal(
        await page
          .getByRole("navigation", { name: "Unidades da edição de leitura" })
          .count(),
        0,
      );
      assert.equal(await page.getByRole("article").count(), 0);
      results.push({
        viewport,
        units: 6,
        keyboard: true,
        rubricTable: true,
        pageOverflow: false,
        storageWrites: 0,
        externalRequests: 0,
        scriptErrors: 0,
        pendingCandidateHidden: true,
      });
      await page.close();
    }
    const report = {
      pass: true,
      scope:
        "Isolated approved reading component fixture; not real signed-in account flow",
      results,
    };
    fs.writeFileSync(
      path.join(scratch, "results.json"),
      JSON.stringify(report, null, 2),
    );
    console.log(JSON.stringify(report, null, 2));
  } finally {
    if (browser) await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

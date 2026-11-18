const { createServer } = require("node:http");
const assert = require("node:assert/strict");
const { chromium } = require(process.env.LDR_DEMO_PLAYWRIGHT ?? "playwright");

async function main() {
  const writes = [];
  const fixture = createServer(async (request, response) => {
    const pathname = new URL(request.url, "http://127.0.0.1:54321").pathname;
    response.setHeader("content-type", "application/json");
    if (request.method === "GET" && pathname === "/rest/v1/service_catalog") {
      return response.end(
        JSON.stringify([
          {
            catalog_key: "mentoria_sessao",
            name: "Sessão Individual de Mentoria",
            billing_model: "single_paid_session",
            amount_cents: 7500,
            currency: "EUR",
          },
          {
            catalog_key: "mentoria_4",
            name: "Mentoria — 4 sessões",
            billing_model: "package_sessions",
            package_sessions: 4,
            amount_cents: 24300,
            currency: "EUR",
          },
        ]),
      );
    }
    if (
      request.method === "POST" &&
      pathname.startsWith("/rest/v1/ecosystem_contact")
    ) {
      let body = "";
      for await (const chunk of request) body += chunk;
      writes.push([pathname, JSON.parse(body)]);
      if (pathname.endsWith("ecosystem_contacts"))
        return response.end(
          JSON.stringify({ id: "fixture-contact", protocol: "LDR-DEMO-01" }),
        );
      return response.end("{}");
    }
    response.statusCode = 404;
    response.end(JSON.stringify({ message: "Fixture only" }));
  });
  await new Promise((resolve) => fixture.listen(54321, "127.0.0.1", resolve));
  let browser;
  try {
    browser = await chromium.launch({
      args: ["--no-zygote", "--single-process"],
    });
    const page = await browser.newPage({
      viewport: { width: 1280, height: 900 },
    });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("**/*", (route) => {
      const url = new URL(route.request().url());
      return url.hostname === "127.0.0.1" ? route.continue() : route.abort();
    });
    for (const width of [1280, 390]) {
      await page.setViewportSize({ width, height: 900 });
      const base = "http://127.0.0.1:3128";
      assert.equal((await page.goto(base + "/loja")).status(), 200);
      await page
        .getByRole("heading", { name: "LDR Store", exact: true })
        .waitFor();
      assert.equal(
        await page.locator("[data-academy-subscription=true]").count(),
        91,
      );
      assert.equal(
        await page.locator("[data-academy-subscription=false]").count(),
        15,
      );
      await page.getByLabel("Categoria").selectOption("ebooks");
      await page
        .getByLabel("Pesquisar no catálogo")
        .fill("psicanalise autismo");
      await page.getByLabel("Moeda").selectOption("BR");
      await page.getByRole("link", { name: /Psicanálise e Autismo/ }).click();
      await page.getByText("R$ 19,90", { exact: true }).waitFor();
      await page.getByText("Índice da edição").click();
      await page
        .getByText("Funcionamento Autístico", { exact: true })
        .waitFor();
      assert.equal(
        await page.getByRole("button", { name: /checkout/i }).count(),
        0,
      );
      assert.equal(
        await page
          .getByRole("link", { name: "Abrir leitor na Biblioteca" })
          .getAttribute("href"),
        "/cliente/biblioteca/ebook_psicanalise_autismo",
      );
      await page
        .getByRole("link", { name: "Serviços profissionais", exact: true })
        .click();
      await page.getByText("Mentoria — 4 sessões").waitFor();
      await page
        .getByRole("link", { name: "Pedir proposta de Recrutamento e seleção" })
        .click();
      assert.equal(
        await page.getByLabel("Solução de interesse").inputValue(),
        "Recrutamento e seleção",
      );
      await page.getByText(/Descreva a função, o número de vagas/).waitFor();
      await page.getByLabel("Organização").fill("Empresa sintética");
      await page.getByLabel("Nome de contacto").fill("Contacto local");
      await page.getByLabel("E-mail profissional").fill("demo@example.invalid");
      await page
        .getByLabel("Como podemos ajudar?")
        .fill("Duas vagas de teste para início em dezembro.");
      await page.getByLabel("Autorizo o uso").check();
      await page
        .getByRole("button", { name: "Enviar pedido institucional" })
        .click();
      await page.getByText("LDR-DEMO-01", { exact: true }).waitFor();
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
        true,
      );
      assert.deepEqual(errors, []);
      console.log(
        `${width}px: loja, filtros, moeda, detalhe, Biblioteca, preço de mentoria, briefing e protocolo aprovados`,
      );
    }
    assert.equal(writes.length, 4);
    for (const [, payload] of writes.filter(([path]) =>
      path.endsWith("ecosystem_contacts"),
    )) {
      assert.equal(
        payload.source_url,
        "https://ldrecossistema.online/servicos-profissionais",
      );
      assert.match(payload.message, /Recrutamento e seleção/);
    }
    console.log(
      "4 escritas locais sintéticas; nenhuma operação externa no navegador.",
    );
  } finally {
    await browser?.close();
    await new Promise((resolve) => fixture.close(resolve));
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

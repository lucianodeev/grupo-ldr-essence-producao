// Run after free-supabase-integration.mjs on the same disposable local database.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createHmac, randomBytes } from "node:crypto";
import fs from "node:fs";
import http from "node:http";
import { createRequire } from "node:module";
import { setTimeout as delay } from "node:timers/promises";
import { pathToFileURL } from "node:url";
import { gzipSync } from "node:zlib";
import { hostedStripe } from "./stripe-hosted-e2e.mjs";

const require = createRequire(
  new URL("../../apps/painel-ldr/package.json", import.meta.url),
);
const { createClient } = require("@supabase/supabase-js");
const { Client } = createRequire(process.env.AGENDA_PG_PACKAGE)("pg");
const { chromium } = createRequire(process.env.PLAYWRIGHT_PACKAGE)(
  "playwright",
);
const status = JSON.parse(
  fs.readFileSync(process.env.LDR_LOCAL_SUPABASE_STATUS, "utf8"),
);
const identities = JSON.parse(
  fs.readFileSync(process.env.LDR_LOCAL_BROWSER_IDENTITIES, "utf8"),
);
assert.equal(new URL(status.API_URL).hostname, "127.0.0.1");
const dbUrl = new URL(status.DB_URL);
assert.equal(dbUrl.hostname, "127.0.0.1");
dbUrl.username = "supabase_admin";

const origin = "http://127.0.0.1:43218";
const cwd = new URL("../../apps/painel-ldr/", import.meta.url);
const bookKey = "ebook_psicanalise_autismo";
const reader = `/cliente/biblioteca/${bookKey}`;
const marker = "Texto privado de leitura da edição sintética.";
const quoteTitle = "Proposta sintética de integração E2E";
const pg = new Client({ connectionString: dbUrl.toString() });
const db = createClient(status.API_URL, status.SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const hosted = process.env.LDR_E2E_STRIPE_MODE === "hosted";
if (
  hosted &&
  (process.env.LDR_E2E_CONFIRM_ISOLATED !== "true" ||
    process.env.LDR_E2E_STRIPE_TAX !== "false")
)
  throw Error(
    "Hosted E2E requires explicit isolation and Stripe Tax disabled.",
  );
const stripeKey = hosted
  ? process.env.STRIPE_SECRET_KEY_TEST
  : "sk_test_" + randomBytes(20).toString("hex");
const stripe = hosted
  ? hostedStripe({ apiKey: stripeKey, appOrigin: origin })
  : null;
let hookSecret = "whsec_" + randomBytes(20).toString("hex");

const stripeCalls = [];
const sessions = new Map();
const provider = http.createServer(async (request, response) => {
  try {
    assert.equal(request.method, "POST");
    assert.equal(request.url, "/checkout");
    assert.equal(request.headers.authorization, `Bearer ${stripeKey}`);
    const parts = [];
    for await (const part of request) parts.push(part);
    const body = new URLSearchParams(Buffer.concat(parts).toString());
    const key = request.headers["idempotency-key"];
    assert.equal(typeof key, "string");
    const wasCreated = sessions.has(key);
    const session = stripe
      ? await stripe.createSession(body, key)
      : {
          id:
            sessions.get(key)?.id ??
            `cs_test_${randomBytes(12).toString("hex")}`,
          livemode: false,
        };
    const { id } = session;
    const metadata = Object.fromEntries(
      [...body].flatMap(([name, value]) => {
        const match = name.match(/^metadata\[(.+)\]$/);
        return match ? [[match[1], value]] : [];
      }),
    );
    const payment = { id, body, key, metadata };
    stripeCalls.push(payment);
    sessions.set(key, payment);
    // Lose the first ebook response after the fixture provider creates the session.
    if (metadata.checkout_kind === "ldr_store_sandbox" && !wasCreated) {
      response.writeHead(502).end("Synthetic interrupted response");
      return;
    }
    response.writeHead(200, { "content-type": "application/json" });
    response.end(
      JSON.stringify({
        id,
        url: session.url ?? `https://checkout.stripe.com/c/pay/${id}`,
        livemode: session.livemode,
      }),
    );
  } catch {
    if (hosted)
      console.error(
        "Hosted Stripe session request rejected by the isolated transport.",
      );
    response.writeHead(400).end("Invalid isolated transport request");
  }
});

function unwrap(result) {
  assert.equal(result.error, null, result.error?.message);
  return result.data;
}
async function order(id) {
  return unwrap(
    await db
      .from("orders")
      .select(
        "id,customer_id,payment_status,metadata,stripe_checkout_session_id",
      )
      .eq("id", id)
      .single(),
  );
}
async function poll(action) {
  for (let i = 0; i < 120; i++) {
    try {
      if (await action()) return;
    } catch {
      /* let local service start */
    }
    await delay(250);
  }
  throw Error("Local service did not become ready");
}
function pass(text) {
  console.log("PASS " + text);
}

async function webhook(payment, type, overrides = {}, paid = true) {
  const event = {
    id: `evt_${randomBytes(8).toString("hex")}`,
    livemode: false,
    type,
    data: {
      object: {
        id: payment.id,
        payment_status: paid ? "paid" : "unpaid",
        amount_total: Number(
          payment.body.get("line_items[0][price_data][unit_amount]"),
        ),
        currency: payment.body.get("line_items[0][price_data][currency]"),
        payment_intent: `pi_${payment.id.slice(8)}`,
        metadata: payment.metadata,
        ...overrides,
      },
    },
  };
  return event;
}
async function send(event) {
  const raw = JSON.stringify(event);
  const time = Math.floor(Date.now() / 1000);
  const signature = createHmac("sha256", hookSecret)
    .update(`${time}.${raw}`)
    .digest("hex");
  const result = await fetch(origin + "/api/stripe/webhook", {
    method: "POST",
    headers: { "Stripe-Signature": `t=${time},v1=${signature}` },
    body: raw,
  });
  assert.equal(result.status, 200, event.type);
  return result.json();
}

async function seed() {
  await pg.query(`
    CREATE TABLE public.digital_product_content (
      product_key text NOT NULL, locale text NOT NULL, title text NOT NULL, content jsonb NOT NULL,
      version integer NOT NULL, active boolean NOT NULL, PRIMARY KEY(product_key, locale)
    );
    CREATE TABLE public.ecosystem_contact_attachments (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(), contact_id uuid NOT NULL REFERENCES ecosystem_contacts(id),
      created_at timestamptz DEFAULT now()
    );
    CREATE TABLE public.library_subscriptions (id uuid PRIMARY KEY, customer_id uuid, status text, current_period_end timestamptz, created_at timestamptz DEFAULT now());
    CREATE TABLE public.ldr_pass_subscriptions (id uuid PRIMARY KEY, customer_id uuid, status text, current_period_end timestamptz, plan text, created_at timestamptz DEFAULT now());
    CREATE TABLE public.organization_members (id uuid PRIMARY KEY, auth_user_id uuid, portal_active boolean, email text);
    ALTER TABLE digital_product_content ENABLE ROW LEVEL SECURITY;
    ALTER TABLE ecosystem_contact_attachments ENABLE ROW LEVEL SECURITY;
    ALTER TABLE library_subscriptions ENABLE ROW LEVEL SECURITY;
    ALTER TABLE ldr_pass_subscriptions ENABLE ROW LEVEL SECURITY;
    ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
    GRANT SELECT ON digital_product_content TO anon,authenticated;
    GRANT SELECT,INSERT ON digital_product_content TO service_role;
    GRANT SELECT ON ecosystem_contact_attachments TO authenticated,service_role;
    GRANT SELECT ON library_subscriptions,ldr_pass_subscriptions,organization_members TO service_role;
    CREATE POLICY fixture_master_attachment_read ON ecosystem_contact_attachments FOR SELECT TO authenticated
      USING (EXISTS (SELECT 1 FROM ecosystem_contacts c WHERE c.id = contact_id));
    NOTIFY pgrst,'reload schema';
  `);
  const edition = {
    kind: "ebook",
    pages: Array.from({ length: 20 }, (_, i) => ({
      titulo: `Capítulo ${i + 1} — Validação sintética`,
      texto: i === 0 ? marker : `Página sintética ${i + 1}.`,
    })),
  };
  const content = {
    encoding: "gzip-base64",
    payload: gzipSync(JSON.stringify(edition)).toString("base64"),
  };
  await pg.query(
    "INSERT INTO digital_product_content VALUES ($1,'pt','Edição sintética de validação',$2,1,true)",
    [bookKey, content],
  );
  await poll(
    async () =>
      (
        await db
          .from("digital_product_content")
          .select("product_key")
          .eq("product_key", bookKey)
          .single()
      ).data?.product_key === bookKey,
  );
}

let app, browser;
const scratch = fs.mkdtempSync(
  new URL(
    "ldr-store-e2e-",
    pathToFileURL(process.env.TMPDIR ? process.env.TMPDIR + "/" : "/tmp/"),
  ),
);
try {
  await pg.connect();
  await seed();
  if (stripe) hookSecret = await stripe.start();
  await new Promise((resolve, reject) => {
    provider.once("error", reject);
    provider.listen(0, "127.0.0.1", resolve);
  });
  const providerUrl = `http://127.0.0.1:${provider.address().port}/checkout`;
  const preload = `
    const original = globalThis.fetch;
    globalThis.fetch = (input, options) => {
      const url = new URL(input instanceof Request ? input.url : input);
      if (url.href === "https://api.stripe.com/v1/checkout/sessions") return original(${JSON.stringify(providerUrl)}, options);
      if (!["127.0.0.1", "localhost"].includes(url.hostname)) throw new Error("External request blocked during fixture execution");
      return original(input, options);
    };`;
  const env = {
    PATH: process.env.PATH,
    NODE_ENV: "production",
    NODE_OPTIONS: "--max-old-space-size=5200",
    HOST: "127.0.0.1",
    PORT: "43218",
    CLIENT_PANEL_URL: origin,
    SUPABASE_URL: status.API_URL,
    SUPABASE_PUBLISHABLE_KEY: status.ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: status.SERVICE_ROLE_KEY,
    VITE_SUPABASE_URL: status.API_URL,
    VITE_SUPABASE_PUBLISHABLE_KEY: status.ANON_KEY,
    LDR_STORE_SANDBOX_ENABLED: "true",
    ENTERPRISE_QUOTES_CHECKOUT_ENABLED: "true",
    STRIPE_SECRET_KEY: stripeKey,
    STRIPE_WEBHOOK_SECRET: hookSecret,
  };
  const buildLog = fs.openSync(scratch + "/build.log", "w", 0o600);
  await new Promise((resolve, reject) => {
    const build = spawn("npm", ["run", "build:render"], {
      cwd,
      env: { ...env, STRIPE_SECRET_KEY: "", STRIPE_WEBHOOK_SECRET: "" },
      stdio: ["ignore", buildLog, buildLog],
    });
    build.on("error", reject);
    build.on("exit", (code) =>
      code === 0 ? resolve() : reject(Error("Render build failed")),
    );
  }).finally(() => fs.closeSync(buildLog));
  pass("Render build with disposable Supabase configuration");
  const serverLog = fs.openSync(scratch + "/server.log", "w", 0o600);
  app = spawn(
    process.execPath,
    [
      "--import",
      "data:text/javascript;base64," + Buffer.from(preload).toString("base64"),
      ".output/server/index.mjs",
    ],
    { cwd, env, stdio: ["ignore", serverLog, serverLog] },
  );
  fs.closeSync(serverLog);
  await poll(async () => (await fetch(origin + "/loja")).ok);

  browser = await chromium.launch({
    headless: !hosted,
    ...(process.env.LDR_BROWSER_SINGLE_PROCESS === "true"
      ? { args: ["--no-zygote", "--single-process"] }
      : {}),
  });
  const context = await browser.newContext({
    locale: "pt-PT",
    viewport: { width: 390, height: 844 },
  });
  await context.route("**/*", (route) => {
    const url = new URL(route.request().url());
    if (url.origin === origin || url.origin === status.API_URL)
      return route.continue();
    if (
      hosted &&
      url.protocol === "https:" &&
      (url.hostname.endsWith(".stripe.com") ||
        url.hostname.endsWith(".stripe.network"))
    )
      return route.continue();
    if (!hosted && url.origin === "https://checkout.stripe.com") {
      return route.fulfill({
        status: 200,
        contentType: "text/html",
        body: "<h1>Fixture Stripe local</h1>",
      });
    }
    return route.abort();
  });
  const page = await context.newPage();
  const evidence = process.env.LDR_COMMERCE_EVIDENCE;
  if (evidence) fs.mkdirSync(evidence, { recursive: true });
  const screenshot = async (name, locator) => {
    if (evidence)
      await locator.screenshot({
        path: `${evidence}/${name}.png`,
      });
  };
  page.setDefaultTimeout(12000);
  async function login(actor) {
    await context.clearCookies();
    const response = await context.request.post(
      origin + "/api/auth/session-sync",
      { data: identities[actor] },
    );
    assert.equal(response.status(), 200);
  }
  async function inaccessibleBook() {
    await page.goto(origin + reader);
    await page
      .getByText("Não foi possível abrir este conteúdo.", { exact: true })
      .waitFor();
    assert.equal(await page.getByText(marker).count(), 0);
  }

  await page.goto(origin + "/cliente/propostas");
  await page.waitForURL("**/cliente/login?**");
  assert.equal(
    new URL(page.url()).searchParams.get("next"),
    "/cliente/propostas",
  );
  const invalidSession = await context.request.post(
    origin + "/api/auth/session-sync",
    {
      data: { access_token: "invalid", refresh_token: "invalid" },
    },
  );
  assert.equal(invalidSession.status(), 401);
  pass("guest redirect and invalid Supabase session denied");

  await login("owner");
  await inaccessibleBook();
  await page.goto(origin + "/loja/psicanalise-autismo");
  await page.getByRole("button", { name: "Abrir checkout de teste" }).click();
  await page
    .getByText("Confirme a sessão de teste e a disponibilidade da edição.")
    .waitFor();
  await Promise.all([
    page.waitForURL("https://checkout.stripe.com/c/pay/**"),
    page.getByRole("button", { name: "Abrir checkout de teste" }).click(),
  ]);
  const [first, digital] = stripeCalls;
  assert.equal(first.key, digital.key);
  assert.equal(first.id, digital.id);
  assert.equal(first.body.toString(), digital.body.toString());
  const matchingOrders = await pg.query(
    "SELECT count(*)::int AS total FROM orders WHERE catalog_key = $1 AND customer_id = $2",
    [bookKey, digital.metadata.customer_id],
  );
  assert.equal(matchingOrders.rows[0].total, 1);
  assert.equal(
    digital.body.get("line_items[0][price_data][unit_amount]"),
    "490",
  );
  assert.equal(new URL(digital.body.get("success_url")).origin, origin);
  assert.equal(
    (await order(digital.metadata.order_id)).payment_status,
    "pendente",
  );
  pass(
    "eBook retry keeps one order and the same Stripe checkout session after lost response",
  );
  let digitalPaid, hostedDigitalPaid;
  if (stripe) {
    hostedDigitalPaid = await stripe.complete(digital.metadata.order_id);
    digitalPaid = hostedDigitalPaid.event;
    await stripe.replay(hostedDigitalPaid);
  } else {
    assert.equal(
      await page.getByRole("heading", { name: "Fixture Stripe local" }).count(),
      1,
    );
    await inaccessibleBook();
    digitalPaid = await webhook(digital, "checkout.session.completed");
    const digitalFailed = await webhook(
      digital,
      "payment_intent.payment_failed",
      {},
      false,
    );
    await send(digitalFailed);
    assert.equal(
      (await order(digital.metadata.order_id)).payment_status,
      "falhou",
    );
    await inaccessibleBook();
    await send(digitalPaid);
    assert.equal((await send(digitalPaid)).duplicate, true);
  }
  assert.equal((await order(digital.metadata.order_id)).payment_status, "pago");
  await page.goto(origin + reader);
  await page.getByText(marker, { exact: true }).waitFor();
  await screenshot(
    "biblioteca-compra-teste",
    page.locator("article").filter({ hasText: marker }),
  );
  assert.equal(
    await context.request.get(origin + reader).then((r) => r.status()),
    200,
  );
  pass(
    `paid event delivers the edition in Biblioteca, duplicate ignored (order ${digital.metadata.order_id}, ${hosted ? "hosted test" : "fixture"} session ${digital.id})`,
  );

  await login("other");
  await inaccessibleBook();
  const other = createClient(status.API_URL, status.ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  unwrap(await other.auth.setSession(identities.other));
  assert.deepEqual(
    unwrap(await other.from("digital_product_content").select("product_key")),
    [],
  );
  assert.deepEqual(
    unwrap(
      await other
        .from("orders")
        .select("id")
        .eq("id", digital.metadata.order_id),
    ),
    [],
  );
  pass("second authenticated customer denied by Biblioteca and PostgREST RLS");
  let digitalRefund;
  if (stripe) {
    const refund = await stripe.refundBook(digital.metadata.order_id);
    digitalRefund = refund.event;
    await stripe.replay(refund);
    await stripe.replay(hostedDigitalPaid);
  } else {
    digitalRefund = await webhook(digital, "charge.refunded", {
      id: "ch_fixture",
      amount: 490,
      amount_refunded: 490,
    });
    await send(digitalRefund);
    assert.equal((await send(digitalRefund)).duplicate, true);
    await send({ ...digitalPaid, id: "evt_" + randomBytes(8).toString("hex") });
  }
  assert.equal(
    (await order(digital.metadata.order_id)).payment_status,
    "reembolsado",
  );
  await login("owner");
  await inaccessibleBook();
  pass(
    "integral refund revokes customer reading and a late paid event cannot restore it",
  );

  await context.clearCookies();
  await page.goto(origin + "/servicos-profissionais");
  await page.getByLabel("Organização").fill("Empresa sintética E2E");
  await page.getByLabel("Nome de contacto").fill("Cliente sintético");
  await page.getByLabel("E-mail profissional").fill("owner@example.test");
  await page
    .getByLabel("Como podemos ajudar?")
    .fill("Briefing sintético para testar integração.");
  await page.getByLabel("Autorizo o uso").check();
  await page
    .getByRole("button", { name: "Enviar pedido institucional" })
    .click();
  await page.getByRole("heading", { name: "Pedido recebido" }).waitFor();
  const contact = unwrap(
    await db
      .from("ecosystem_contacts")
      .select("id,protocol,source_url")
      .eq("email", "owner@example.test")
      .ilike("message", "%Briefing sintético para testar integração.%")
      .single(),
  );
  assert.equal(
    contact.source_url,
    "https://ldrecossistema.online/servicos-profissionais",
  );
  assert.deepEqual(
    unwrap(
      await other.from("ecosystem_contacts").select("id").eq("id", contact.id),
    ),
    [],
  );

  await login("master");
  await page.goto(origin + "/admin/contatos");
  await page.getByRole("button").filter({ hasText: contact.protocol }).click();
  await page.getByLabel("Título", { exact: true }).fill(quoteTitle);
  await page
    .getByLabel("Âmbito, entregas e condições")
    .fill("Escopo e entrega sintéticos para comprovar o fluxo completo.");
  await page.getByLabel("Valor total").fill("123,45");
  await page.getByRole("button", { name: "Preparar rascunho" }).click();
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Aprovar proposta" }).click();
  await page.getByText(/Aprovada · pendente/).waitFor();
  pass(
    `briefing ${contact.protocol} arrives in Master; proposal prepared and approved`,
  );

  await login("other");
  await page.goto(origin + "/cliente/propostas");
  await page
    .getByText("Ainda não há propostas aprovadas para este e-mail.")
    .waitFor();
  await login("owner");
  await page.goto(origin + "/cliente/propostas");
  const card = page
    .getByRole("heading", { name: quoteTitle })
    .locator("xpath=ancestor::li");
  await card.getByLabel("Li e aceito").check();
  await Promise.all([
    page.waitForURL("https://checkout.stripe.com/c/pay/**"),
    card
      .getByRole("button", { name: "Aceitar e continuar para pagamento" })
      .click(),
  ]);
  const quote = stripeCalls.at(-1);
  assert.equal(quote.metadata.checkout_kind, "enterprise_quote");
  assert.equal(
    quote.body.get("line_items[0][price_data][unit_amount]"),
    "12345",
  );
  for (const field of ["success_url", "cancel_url"])
    assert.equal(new URL(quote.body.get(field)).origin, origin);
  assert.equal(
    (await order(quote.metadata.order_id)).metadata.quote_state,
    "accepted",
  );
  let quotePaid;
  if (stripe) {
    const paid = await stripe.complete(quote.metadata.order_id);
    quotePaid = paid.event;
    await stripe.replay(paid);
  } else {
    quotePaid = await webhook(quote, "checkout.session.completed");
    await send(quotePaid);
    assert.equal((await send(quotePaid)).duplicate, true);
  }
  assert.equal((await order(quote.metadata.order_id)).payment_status, "pago");
  await page.goto(origin + "/cliente/propostas");
  await card.getByText(/Pagamento: pago/).waitFor();
  await login("master");
  await page.goto(origin + "/admin/contatos");
  await page.getByRole("button").filter({ hasText: contact.protocol }).click();
  await page.getByText(/Aceita · pago/).waitFor();
  await screenshot(
    "master-proposta-paga-teste",
    page.getByRole("region", { name: "Propostas e pagamentos" }),
  );
  pass(
    `accepted quote reconciled in both client and Master UIs (order ${quote.metadata.order_id}, ${hosted ? "hosted test" : "fixture"} session ${quote.id})`,
  );
  const receipts = unwrap(
    await db
      .from("stripe_webhook_events")
      .select("event_id")
      .in("event_id", [digitalPaid.id, digitalRefund.id, quotePaid.id]),
  );
  assert.equal(receipts.length, 3);
  assert.equal(sessions.size, 2);
  pass(
    `local order and receipt tables reconcile to two ${hosted ? "Stripe test" : "fixture"} sessions with no duplicates`,
  );
} catch (error) {
  if (hosted) {
    // Browser errors and subprocess logs can contain session URLs or headers.
    console.error(
      "Hosted Stripe E2E stopped. The last PASS identifies the completed stage.",
    );
    process.exitCode = 1;
  } else {
    for (const name of ["build.log", "server.log"]) {
      const file = scratch + "/" + name;
      if (fs.existsSync(file))
        console.error(
          fs
            .readFileSync(file, "utf8")
            .split("\n")
            .slice(-12)
            .join("\n")
            .replaceAll(status.SERVICE_ROLE_KEY, "[redacted]")
            .replaceAll(status.ANON_KEY, "[redacted]")
            .replaceAll(stripeKey, "[redacted]")
            .replaceAll(hookSecret, "[redacted]"),
        );
    }
    throw error;
  }
} finally {
  await browser?.close();
  app?.kill("SIGTERM");
  await stripe?.stop();
  if (provider.listening)
    await new Promise((resolve) => provider.close(resolve));
  await pg.end();
  fs.rmSync(scratch, { recursive: true, force: true });
}

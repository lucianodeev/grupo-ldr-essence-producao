import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import http from "node:http";
import { setTimeout as delay } from "node:timers/promises";

const apiOrigin = "https://api.stripe.com";
const checkoutOrigin = "https://checkout.stripe.com";
const accountId = "acct_1U28k7Klx2LyNGeB";

export function hostedStripe({ apiKey, appOrigin }) {
  if (!/^(?:sk|rk)_test_[A-Za-z0-9]+$/.test(apiKey ?? ""))
    throw Error("Hosted E2E requires a Stripe test-only API key.");
  if (new URL(appOrigin).hostname !== "127.0.0.1")
    throw Error("Hosted E2E requires a loopback app.");

  const events = new Map();
  const orders = new Map();
  const webhook = appOrigin + "/api/stripe/webhook";
  let listener;
  let ready = false;

  async function api(path, options = {}) {
    const response = await fetch(apiOrigin + path, {
      ...options,
      headers: { ...options.headers, Authorization: "Bearer " + apiKey },
      redirect: "error",
      signal: AbortSignal.timeout(20000),
    });
    if (!response.ok)
      throw Error("Stripe test API failed (HTTP " + response.status + ").");
    return response.json();
  }

  async function deliver(body, signature) {
    const response = await fetch(webhook, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "stripe-signature": signature,
      },
      body,
      signal: AbortSignal.timeout(10000),
    });
    assert.ok(response.ok, "App declined Stripe-signed webhook");
    return response.json();
  }

  const relay = http.createServer(async (req, res) => {
    try {
      if (req.method !== "POST" || req.url !== "/stripe") {
        res.writeHead(404).end();
        return;
      }
      const parts = [];
      let bytes = 0;
      for await (const part of req) {
        bytes += part.length;
        if (bytes > 1024 * 1024) {
          res.writeHead(413).end();
          return;
        }
        parts.push(part);
      }
      const body = Buffer.concat(parts);
      const event = JSON.parse(body);
      const object = event.data?.object;
      const order = orders.get(object?.metadata?.order_id);
      // The CLI sees other test activity on the account. Leave it outside this app.
      if (
        event.livemode !== false ||
        !order ||
        object.metadata.checkout_kind !== order.kind ||
        (event.type === "checkout.session.completed" &&
          object.id !== order.sessionId) ||
        (event.type === "charge.refunded" &&
          object.payment_intent !== order.paymentIntent)
      ) {
        res.writeHead(204).end();
        return;
      }
      const signature = req.headers["stripe-signature"];
      if (typeof signature !== "string") {
        res.writeHead(400).end();
        return;
      }
      await deliver(body, signature);
      events.set(order.id + "/" + event.type, { event, body, signature });
      res.writeHead(200).end();
    } catch {
      res.writeHead(502).end();
    }
  });

  async function waitForEvent(order, type, seconds = 240) {
    for (let elapsed = 0; elapsed < seconds; elapsed++) {
      const received = events.get(order.id + "/" + type);
      if (received) return received;
      if (!ready)
        throw Error("Stripe CLI stopped before receiving the webhook.");
      await delay(1000);
    }
    throw Error("Timed out waiting for Stripe test event " + type);
  }

  return {
    async start() {
      const account = await api("/v1/account");
      assert.equal(
        account.id === accountId,
        true,
        "Unexpected Stripe test account",
      );
      await new Promise((resolve, reject) => {
        relay.once("error", reject);
        relay.listen(0, "127.0.0.1", resolve);
      });
      // Explicit test API key and no --live flag. Keep CLI output out of terminal logs.
      listener = spawn(
        "stripe",
        [
          "listen",
          "--events",
          "checkout.session.completed,charge.refunded",
          "--forward-to",
          "http://127.0.0.1:" + relay.address().port + "/stripe",
        ],
        {
          env: {
            PATH: process.env.PATH,
            HOME: process.env.HOME,
            STRIPE_API_KEY: apiKey,
          },
          stdio: ["ignore", "pipe", "pipe"],
        },
      );
      return new Promise((resolve, reject) => {
        let output = "";
        const timeout = setTimeout(
          () => reject(Error("Stripe CLI listener did not become ready.")),
          30000,
        );
        const fail = () => {
          clearTimeout(timeout);
          ready = false;
          reject(
            Error(
              "Stripe CLI listener unavailable. Check installation and test key permissions.",
            ),
          );
        };
        listener.once("error", fail);
        listener.once("exit", fail);
        const read = (chunk) => {
          if (ready) return;
          output = (output + chunk.toString()).slice(-4096);
          const secret = output.match(/whsec_[A-Za-z0-9]+/)?.[0];
          if (secret && output.includes("Ready!")) {
            ready = true;
            clearTimeout(timeout);
            output = "";
            resolve(secret);
          }
        };
        listener.stdout.on("data", read);
        listener.stderr.on("data", read);
      });
    },

    async createSession(body, idempotencyKey) {
      const kind = body.get("metadata[checkout_kind]");
      const id = body.get("metadata[order_id]");
      const amount = kind === "ldr_store_sandbox" ? 490 : 12345;
      assert.ok(id && ["ldr_store_sandbox", "enterprise_quote"].includes(kind));
      for (const field of ["success_url", "cancel_url"])
        assert.equal(new URL(body.get(field)).origin, appOrigin);
      assert.equal(body.get("customer_email"), "owner@example.test");
      assert.equal(
        body.get("line_items[0][price_data][unit_amount]"),
        String(amount),
      );
      assert.equal(body.get("line_items[0][price_data][currency]"), "eur");
      assert.notEqual(body.get("automatic_tax[enabled]"), "true");
      const checkoutParams = new URLSearchParams(body);
      checkoutParams.set("automatic_tax[enabled]", "false");
      checkoutParams.set("adaptive_pricing[enabled]", "false");
      const session = await api("/v1/checkout/sessions", {
        method: "POST",
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          "idempotency-key": idempotencyKey,
        },
        body: checkoutParams,
      });
      assert.equal(session.livemode, false);
      assert.ok(/^cs_test_[A-Za-z0-9]+$/.test(session.id));
      assert.equal(new URL(session.url).origin === checkoutOrigin, true);
      assert.equal(session.automatic_tax?.enabled, false);
      assert.equal(session.amount_total, amount);
      assert.equal(session.currency, "eur");
      const previous = orders.get(id);
      if (previous) assert.equal(previous.sessionId, session.id);
      else orders.set(id, { id, sessionId: session.id, kind, amount });
      return { id: session.id, url: session.url, livemode: false };
    },

    async complete(orderId) {
      const order = orders.get(orderId);
      assert.ok(order);
      console.log(
        "ACTION Complete the hosted Stripe test checkout in Chromium with a Stripe test card.",
      );
      const received = await waitForEvent(order, "checkout.session.completed");
      const session = received.event.data.object;
      assert.equal(session.payment_status, "paid");
      assert.equal(session.amount_total, order.amount);
      assert.equal(session.currency, "eur");
      assert.ok(/^pi_[A-Za-z0-9]+$/.test(session.payment_intent));
      const intent = await api("/v1/payment_intents/" + session.payment_intent);
      assert.equal(intent.livemode, false);
      assert.equal(intent.status, "succeeded");
      assert.equal(intent.amount_received, order.amount);
      assert.equal(intent.currency, "eur");
      order.paymentIntent = intent.id;
      return received;
    },

    async refundBook(orderId) {
      const order = orders.get(orderId);
      assert.equal(order?.kind, "ldr_store_sandbox");
      assert.ok(order.paymentIntent);
      const refund = await api("/v1/refunds", {
        method: "POST",
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          "idempotency-key": "ldr-hosted-e2e-refund-" + orderId,
        },
        body: new URLSearchParams({
          payment_intent: order.paymentIntent,
          amount: String(order.amount),
        }),
      });
      assert.equal(refund.livemode, false);
      assert.equal(refund.status, "succeeded");
      assert.equal(refund.amount, order.amount);
      assert.equal(refund.currency, "eur");
      const received = await waitForEvent(order, "charge.refunded", 30);
      assert.equal(received.event.data.object.amount_refunded, order.amount);
      return received;
    },

    async replay({ body, signature }) {
      assert.equal((await deliver(body, signature)).duplicate, true);
    },

    async stop() {
      listener?.kill("SIGTERM");
      if (relay.listening) await new Promise((resolve) => relay.close(resolve));
    },
  };
}

import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createHmac } from "node:crypto";
import { createServer } from "node:net";

async function freePort() {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = server.address().port;
  await new Promise((resolve) => server.close(resolve));
  return port;
}
async function receiver(secret) {
  const port = await freePort();
  const child = spawn(process.execPath, ["scripts/ldr-one-stripe-test-webhook.mjs"], {
    env: { ...process.env, PORT: String(port), LDR_ONE_STRIPE_TEST_WEBHOOK_SECRET: secret },
    stdio: "ignore",
  });
  const origin = "http://127.0.0.1:" + port;
  for (let attempt = 0; attempt < 60; attempt++) {
    if (child.exitCode !== null) throw Error("Receiver exited early");
    try { const r = await fetch(origin + "/health"); if (r.ok) return { child, origin }; } catch {}
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  child.kill();
  throw Error("Receiver did not start");
}
function signature(secret, body) {
  const t = Math.floor(Date.now() / 1000);
  return "t=" + t + ",v1=" + createHmac("sha256", secret).update(t + "." + body).digest("hex");
}
test("isolated webhook rejects invalid signatures and live events, accepts signed test events", async () => {
  const secret = "whsec_localtest123";
  const { child, origin } = await receiver(secret);
  try {
    assert.equal((await (await fetch(origin + "/health")).text()), "sandbox only");
    const body = JSON.stringify({ id: "evt_test_local", type: "checkout.session.completed", livemode: false });
    const post = (payload, sig) => fetch(origin + "/stripe/test-webhook", {
      method: "POST", headers: { "stripe-signature": sig }, body: payload
    });
    assert.equal((await post(body, "t=1,v1=" + "0".repeat(64))).status, 400);
    assert.equal((await post(JSON.stringify({ ...JSON.parse(body), livemode: true }), signature(secret, JSON.stringify({ ...JSON.parse(body), livemode: true })))).status, 400);
    const ok = await post(body, signature(secret, body));
    assert.equal(ok.status, 200);
    assert.deepEqual(await ok.json(), { received: true, sandbox: true });
  } finally {
    child.kill();
  }
});
test("receiver with no secret rejects webhook posts", async () => {
  const { child, origin } = await receiver("");
  try {
    const response = await fetch(origin + "/stripe/test-webhook", { method: "POST", body: "{}" });
    assert.equal(response.status, 503);
  } finally { child.kill(); }
});

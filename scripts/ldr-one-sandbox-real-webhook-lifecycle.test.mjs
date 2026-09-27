import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const source=await readFile(new URL("./ldr-one-sandbox-real-webhook-lifecycle.mjs",import.meta.url),"utf8");
test("real webhook probe is guarded by isolated Render and explicit TEST flag",()=>{
 assert.match(source,/RENDER_SERVICE_ID!=="srv-das6drvavr4c7397dflg"/);
 assert.match(source,/LDR_ONE_SANDBOX_REAL_WEBHOOK_LIFECYCLE!=="yes"/);
 assert.match(source,/LDR_ONE_SANDBOX_PERSIST_EVENTS!=="yes"/);
 assert.match(source,/sk_test_/);
 assert.match(source,/payment_behavior:"default_incomplete"/);
});
test("probe denies unpaid access and attempts cleanup without leaking secrets",()=>{
 assert.match(source,/sub.status!=="incomplete"/);
 assert.match(source,/checkSandboxEntitlement/);
 assert.match(source,/if\(sub\).*?DELETE/s);
 assert.match(source,/if\(stripeCustomer\).*?DELETE/s);
 assert.match(source,/if\(inserted\).*?DELETE FROM public\.ldr_one_sandbox_subscriptions/s);
 assert.doesNotMatch(source,/console\.log\(.*(?:key|secret)/);
});

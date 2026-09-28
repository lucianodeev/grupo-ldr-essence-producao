import test from "node:test";import assert from "node:assert/strict";import {spawnSync} from "node:child_process";
test("real checkout integration refuses unapproved execution without touching Stripe",()=>{
 const r=spawnSync(process.execPath,["scripts/ldr-one-sandbox-checkout-integration.mjs"],{env:{PATH:process.env.PATH,LDR_ONE_SANDBOX_CHECKOUT_INTEGRATION:"no"},encoding:"utf8",timeout:5000});
 assert.notEqual(r.status,0);assert.match(r.stderr,/Sandbox-only integration guard/);
});

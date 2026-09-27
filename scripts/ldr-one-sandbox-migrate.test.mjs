import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
test("migration refuses to run without explicit flag or database credentials",()=>{
  const run=spawnSync(process.execPath,["scripts/ldr-one-sandbox-migrate.mjs"],{
    encoding:"utf8",env:{...process.env,LDR_ONE_ALLOW_SANDBOX_MIGRATION:"",DATABASE_URL:""}
  });
  assert.notEqual(run.status,0);
  assert.match(run.stderr,/Explicit sandbox migration flag required/);
});
test("migration refuses production database before opening a connection",()=>{
  const run=spawnSync(process.execPath,["scripts/ldr-one-sandbox-migrate.mjs"],{
    encoding:"utf8",env:{...process.env,LDR_ONE_ALLOW_SANDBOX_MIGRATION:"yes",DATABASE_URL:"postgres://user:password@localhost:5432/production"}
  });
  assert.notEqual(run.status,0);
  assert.match(run.stderr,/Wrong database: migration refused/);
});

test("receiver refuses migration outside designated Render service",()=>{
  const run=spawnSync(process.execPath,["scripts/ldr-one-stripe-test-webhook.mjs"],{
    encoding:"utf8",env:{...process.env,LDR_ONE_ALLOW_SANDBOX_MIGRATION:"yes",RENDER_SERVICE_ID:"wrong-service"}
  });
  assert.notEqual(run.status,0);
  assert.match(run.stderr,/Migration refused: wrong Render service/);
});

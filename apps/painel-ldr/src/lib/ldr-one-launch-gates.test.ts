import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { LDR_ONE_LAUNCH_ENABLED } from "./ldr-one.catalog.ts";

test("LDR ONE launch remains disabled until separately approved", () => {
  assert.equal(LDR_ONE_LAUNCH_ENABLED, false);
});

test("business employee reader requires an explicit runtime opt-in", () => {
  const source = readFileSync(fileURLToPath(new URL("./ldr-one-business-reader.server.ts", import.meta.url)), "utf8");
  assert.match(source, /process\.env\["LDR_ONE_BUSINESS_READER_ENABLED"\] !== "true"/);
  assert.match(source, /LDR_ONE_READER_APPROVED\.has\(productKey\)/);
});

test("staged seat schema is never silently applied by the application", () => {
  const source = readFileSync(fileURLToPath(new URL("../../supabase/staged/ldr_one_business_seat_allocations_REVIEW_ONLY.sql", import.meta.url)), "utf8");
  assert.match(source, /STAGED ONLY/);
  assert.match(source, /REVOKE ALL ON FUNCTION public\.ldr_one_allocate_seat/);
  assert.match(source, /REVOKE ALL ON FUNCTION public\.ldr_one_revoke_seat/);
});

test("business checkout refuses payment preparation until employee reader is enabled", () => {
  const source = readFileSync(fileURLToPath(new URL("./ldr-one-checkout.server.ts", import.meta.url)), "utf8");
  assert.match(source, /input\.audience === "business" && process\.env\["LDR_ONE_BUSINESS_READER_ENABLED"\] !== "true"/);
  assert.match(source, /if \(!LDR_ONE_LAUNCH_ENABLED\)/);
});

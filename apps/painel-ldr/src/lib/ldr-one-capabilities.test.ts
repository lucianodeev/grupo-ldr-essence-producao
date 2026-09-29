import assert from "node:assert/strict";
import test from "node:test";
import { freeCapabilities, hasLdrOneCapability, LDR_ONE_CAPABILITIES } from "./ldr-one-capabilities.ts";

const REQUIRED_FREE = [
  "academic_network.basic",
  "opportunities.basic",
  "career.basic",
  "academy.free",
  "human_room.basic",
  "professionals.discovery",
  "company.jobs.basic",
] as const;

test("existing ecosystem entry capabilities stay free", () => {
  const free = new Set(freeCapabilities());
  for (const capability of REQUIRED_FREE) assert.equal(free.has(capability), true, capability);
});

test("free tier never receives premium capabilities by accident", () => {
  assert.equal(hasLdrOneCapability("free", "academic_network.premium"), false);
  assert.equal(hasLdrOneCapability("free", "opportunities.advanced"), false);
  assert.equal(hasLdrOneCapability("free", "career.premium"), false);
  assert.equal(hasLdrOneCapability("free", "human_room.premium"), false);
  assert.equal(hasLdrOneCapability("free", "company.jobs.featured"), false);
});

test("LDR ONE unlocks individual premium but not company-only features", () => {
  assert.equal(hasLdrOneCapability("one", "academic_network.premium"), true);
  assert.equal(hasLdrOneCapability("one", "career.premium"), true);
  assert.equal(hasLdrOneCapability("one", "company.talent_pool"), false);
});

test("business tier inherits lower tiers and unlocks company premium", () => {
  assert.equal(hasLdrOneCapability("business", "academic_network.basic"), true);
  assert.equal(hasLdrOneCapability("business", "career.premium"), true);
  assert.equal(hasLdrOneCapability("business", "company.jobs.featured"), true);
  assert.equal(hasLdrOneCapability("business", "company.talent_pool"), true);
  assert.equal(hasLdrOneCapability("business", "company.analytics"), true);
});

test("catalog is additive-only", () => {
  for (const item of LDR_ONE_CAPABILITIES) assert.equal(item.additiveOnly, true, item.capability);
});

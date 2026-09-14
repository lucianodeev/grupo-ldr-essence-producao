import assert from "node:assert/strict";
import test from "node:test";
import {
  calculatePlatformSplit,
  calculateSettledPlatformSplit,
} from "./platform-fee.ts";

test("R$100 divide R$20/R$80", () =>
  assert.deepEqual(calculatePlatformSplit(10000), {
    grossAmountCents: 10000,
    platformFeePercent: 20,
    platformFeeCents: 2000,
    professionalNetCents: 8000,
  }));

test("€100 divide €20/€80", () =>
  assert.deepEqual(calculatePlatformSplit(10000), {
    grossAmountCents: 10000,
    platformFeePercent: 20,
    platformFeeCents: 2000,
    professionalNetCents: 8000,
  }));

test("R$30 da Clínica Social divide R$6/R$24", () =>
  assert.deepEqual(calculatePlatformSplit(3000), {
    grossAmountCents: 3000,
    platformFeePercent: 20,
    platformFeeCents: 600,
    professionalNetCents: 2400,
  }));

test("€20 da Clínica Social divide €4/€16", () =>
  assert.deepEqual(calculatePlatformSplit(2000), {
    grossAmountCents: 2000,
    platformFeePercent: 20,
    platformFeeCents: 400,
    professionalNetCents: 1600,
  }));

test("estorno integral não cobra comissão", () =>
  assert.equal(
    calculateSettledPlatformSplit(5000, 5000).platformFeeCents,
    0,
  ));

test("estorno parcial recalcula sobre o liquidado", () =>
  assert.deepEqual(calculateSettledPlatformSplit(5000, 1000), {
    refundAmountCents: 1000,
    grossAmountCents: 4000,
    platformFeePercent: 20,
    platformFeeCents: 800,
    professionalNetCents: 3200,
  }));

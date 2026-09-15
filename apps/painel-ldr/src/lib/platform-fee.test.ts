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

test("R$80 da Clínica Social divide R$16/R$64", () =>
  assert.deepEqual(calculatePlatformSplit(8000), {
    grossAmountCents: 8000,
    platformFeePercent: 20,
    platformFeeCents: 1600,
    professionalNetCents: 6400,
  }));

test("€25 da Clínica Social divide €5/€20", () =>
  assert.deepEqual(calculatePlatformSplit(2500), {
    grossAmountCents: 2500,
    platformFeePercent: 20,
    platformFeeCents: 500,
    professionalNetCents: 2000,
  }));

test("R$180 da sessão padrão divide R$36/R$144", () =>
  assert.deepEqual(calculatePlatformSplit(18000), {
    grossAmountCents: 18000,
    platformFeePercent: 20,
    platformFeeCents: 3600,
    professionalNetCents: 14400,
  }));

test("€50 da sessão padrão divide €10/€40", () =>
  assert.deepEqual(calculatePlatformSplit(5000), {
    grossAmountCents: 5000,
    platformFeePercent: 20,
    platformFeeCents: 1000,
    professionalNetCents: 4000,
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

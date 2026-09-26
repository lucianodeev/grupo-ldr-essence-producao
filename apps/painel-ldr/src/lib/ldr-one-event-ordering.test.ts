import assert from "node:assert/strict";
import test from "node:test";
import { ldrOneEventOrderingDecision as decide } from "./ldr-one-event-ordering.ts";

test("first event and newer event can be applied", () => {
  const first = { created: 100, eventId: "evt_first" };
  assert.equal(decide(null, first), "apply");
  assert.equal(decide(first, { created: 101, eventId: "evt_newer" }), "apply");
});
test("repeated event and older delivery do not overwrite current state", () => {
  const current = { created: 200, eventId: "evt_current" };
  assert.equal(decide(current, current), "duplicate");
  assert.equal(decide(current, { created: 199, eventId: "evt_older" }), "stale");
});
test("same-second events and invalid timestamps require authoritative reconciliation", () => {
  const current = { created: 200, eventId: "evt_current" };
  assert.equal(decide(current, { created: 200, eventId: "evt_other" }), "reconcile");
  assert.equal(decide(current, { created: 0, eventId: "evt_bad" }), "reconcile");
  assert.equal(decide(null, { created: 200, eventId: "" }), "reconcile");
});

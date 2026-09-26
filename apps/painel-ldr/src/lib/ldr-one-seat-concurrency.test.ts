import assert from "node:assert/strict";
import test from "node:test";
import { canAllocateBusinessSeat, canAccessLdrOneBusinessSeat } from "./ldr-one-business-seat-policy.ts";

/** In-memory serial queue models the SQL allocator's parent subscription FOR UPDATE lock.
 * This is a simulation, NOT a substitute for running a real Postgres concurrency test.
 */
test("serialized simultaneous seat requests cannot exceed purchased capacity", async () => {
  const assigned: string[] = [];
  let queue = Promise.resolve();
  const allocate = (user: string) => {
    const result = queue.then(() => {
      if (!canAllocateBusinessSeat(5, assigned, user)) return false;
      if (!assigned.includes(user)) assigned.push(user);
      return true;
    });
    queue = result.then(() => undefined);
    return result;
  };
  const results = await Promise.all(
    ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"].map(allocate),
  );
  assert.equal(results.filter(Boolean).length, 5);
  assert.deepEqual(assigned, ["a", "b", "c", "d", "e"]);
  assert.equal(await allocate("a"), true, "repeated allocation is idempotent");
  assert.equal(await allocate("f"), false, "capacity remains enforced");
});

test("revoked and expired employee seats cannot grant reader access", () => {
  const subscription = {
    status: "active", stripe_subscription_id: "sub_test",
    current_period_end: "2026-10-26T12:00:00Z",
    ldr_one_offer: "business", ldr_one_seats: 5,
  };
  const seat = { subscription_id: "sub-local", auth_user_id: "user-a", revoked_at: null };
  const now = Date.parse("2026-09-26T12:00:00Z");
  assert.equal(canAccessLdrOneBusinessSeat(subscription, seat, "sub-local", "user-a", now), true);
  assert.equal(canAccessLdrOneBusinessSeat(subscription, { ...seat, revoked_at: "2026-09-26T12:01:00Z" }, "sub-local", "user-a", now), false);
  assert.equal(canAccessLdrOneBusinessSeat(subscription, seat, "sub-local", "user-a", Date.parse("2026-10-26T12:00:00Z")), false);
});

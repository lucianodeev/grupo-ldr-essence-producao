import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const root = new URL("../../", import.meta.url);
const read = (path: string) => readFileSync(new URL(path, root), "utf8");

test("LDR ONE remains disabled while shared webhook replay is not transactional", () => {
  const webhook = read("src/routes/api/stripe/webhook.ts");
  const catalog = read("src/lib/ldr-one.catalog.ts");
  const checkout = read("src/lib/ldr-one-checkout.server.ts");
  const reader = read("src/lib/ldr-one-business-reader.server.ts");

  const earlyEventClaim = webhook.indexOf("const eventMark = await markEvent(event.id, event.type)");
  const duplicateAcknowledgment = webhook.indexOf('if (eventMark === "duplicate") return json(200');
  const handler = webhook.indexOf("await handleSellerStripeEvent(event, object)");
  assert.ok(earlyEventClaim >= 0 && duplicateAcknowledgment > earlyEventClaim && handler > duplicateAcknowledgment,
    "If the shared webhook replay implementation changes, review this release blocker test.");

  assert.match(catalog, /LDR_ONE_LAUNCH_ENABLED\s*=\s*false\s+as\s+const/);
  assert.match(checkout, /LDR_ONE_LAUNCH_ENABLED/);
  assert.match(checkout, /LDR_ONE_BUSINESS_READER_ENABLED/);
  assert.match(reader, /LDR_ONE_BUSINESS_READER_ENABLED/);
});

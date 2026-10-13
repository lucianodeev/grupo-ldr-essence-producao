const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..", "src");
const server = fs.readFileSync(path.join(root, "lib/professional-availability.server.ts"), "utf8");
const actions = fs.readFileSync(path.join(root, "lib/professional-availability.functions.ts"), "utf8");
const page = fs.readFileSync(path.join(root, "routes/_authenticated/painel-profissional.disponibilidade.tsx"), "utf8");
const update = server.split("export async function updateProfessionalAvailability(")[1];

test("availability update requires authenticated user context", () => {
  assert.match(actions, /professionalAvailabilityUpdate = createServerFn[\s\S]*?\.middleware\(\[requireSupabaseAuth\]\)/);
  assert.match(actions, /updateProfessionalAvailability\(context\.userId, data\)/);
});

test("availability update scopes both read and write to the authenticated profile", () => {
  assert.ok(update, "update handler exists");
  assert.match(update, /const profile = await ownProfile\(userId\)/);
  const [read, ...rest] = update.split('db.from("professional_availability")');
  assert.equal(read.includes(".update("), false);
  assert.ok(rest.length >= 3, "read, conflict check, and write queries exist");
  assert.match(rest[0], /\.eq\("id", input\.availabilityId\)[\s\S]*?\.eq\("professional_profile_id", profile\.id\)/);
  assert.match(rest[1], /\.eq\("professional_profile_id", profile\.id\)/);
  assert.match(rest[2], /\.update\([\s\S]*?\.eq\("id", existing\.id\)\.eq\("professional_profile_id", profile\.id\)/);
});

test("update validates time, timezone, conflicts and never changes ownership", () => {
  assert.match(update, /end <= start/);
  assert.match(update, /validTimezone\(timezone\)/);
  assert.match(update, /if \(overlap\) fail/);
  const write = update.split(".update({")[1].split("})")[0];
  assert.doesNotMatch(write, /professional_profile_id|professional_service_id|weekday|auth_user_id/);
});

test("editing retains record identity and exposes a cancel action", () => {
  assert.match(page, /availabilityId: editingId!/);
  assert.match(page, /onClick=\{\(\) => beginEdit\(row\)\}/);
  assert.match(page, /onClick=\{\(\) => setEditingId\(null\)\}/);
});

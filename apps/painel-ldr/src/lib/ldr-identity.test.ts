import test from "node:test";
import assert from "node:assert/strict";
import { resolveLdrIdentity } from "./ldr-identity.ts";

test("supports multiple simultaneous non-privileged roles", () => {
  const identity = resolveLdrIdentity({
    authUserId: "user-1",
    email: " Person@Example.com ",
    customerId: "customer-1",
    professionalAccountId: "professional-1",
    academicProfileId: "academic-1",
    academicDisplayRole: "professor",
    organizationMembershipIds: ["org-member-1"],
    employeeRecordId: "employee-1",
  });
  assert.equal(identity.email, "person@example.com");
  assert.deepEqual(new Set(identity.roles), new Set([
    "customer","professional","organization_member","employee","academic_member","academic_professor",
  ]));
  assert.equal(identity.isAdmin, false);
  assert.equal(identity.isSuperadmin, false);
});

test("academic display role never escalates to admin", () => {
  const identity = resolveLdrIdentity({
    authUserId: "user-2",
    academicProfileId: "academic-2",
    academicDisplayRole: "professor",
  });
  assert.equal(identity.isAdmin, false);
  assert.equal(identity.isSuperadmin, false);
  assert.equal(identity.roles.includes("admin"), false);
  assert.equal(identity.roles.includes("superadmin"), false);
});

test("professional and customer roles never escalate privileges", () => {
  const identity = resolveLdrIdentity({
    authUserId: "user-3",
    customerId: "customer-3",
    professionalProfileId: "profile-3",
  });
  assert.equal(identity.isAdmin, false);
  assert.equal(identity.isSuperadmin, false);
});

test("superadmin is accepted only from explicit authoritative signal", () => {
  const identity = resolveLdrIdentity({
    authUserId: "user-4",
    existingSuperadmin: true,
  });
  assert.equal(identity.isSuperadmin, true);
  assert.equal(identity.isAdmin, true);
  assert.deepEqual(new Set(identity.roles), new Set(["superadmin","admin"]));
});

test("admin does not imply superadmin", () => {
  const identity = resolveLdrIdentity({
    authUserId: "user-5",
    existingAdmin: true,
  });
  assert.equal(identity.isAdmin, true);
  assert.equal(identity.isSuperadmin, false);
});

test("auth user id is mandatory", () => {
  assert.throws(() => resolveLdrIdentity({ authUserId: "   " }), /authUserId is required/);
});

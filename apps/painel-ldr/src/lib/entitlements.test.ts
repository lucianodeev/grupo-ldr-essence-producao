import assert from "node:assert/strict";
import test from "node:test";
import { resolveLegacyEntitlement } from "./entitlements";

test("owner override has highest precedence", () => {
  const x=resolveLegacyEntitlement({resourceKey:"course",ownerOverride:true,librarySubscription:true});
  assert.equal(x.allowed,true); assert.equal(x.source,"owner_override"); assert.equal(x.accessType,"privileged");
});
test("free access does not depend on subscription",()=>{const x=resolveLegacyEntitlement({resourceKey:"free-course",free:true});assert.equal(x.source,"free");assert.equal(x.allowed,true)});
test("lifetime ownership outranks recurring subscription",()=>{const x=resolveLegacyEntitlement({resourceKey:"book",owned:true,librarySubscription:true});assert.equal(x.source,"ownership");assert.equal(x.accessType,"lifetime")});
test("grandfathered enrollment remains lifetime-compatible",()=>{const x=resolveLegacyEntitlement({resourceKey:"training",legacyEnrollment:true});assert.equal(x.allowed,true);assert.equal(x.legacy,true);assert.equal(x.source,"legacy_enrollment")});
test("library subscription maps to recurring legacy entitlement",()=>{const x=resolveLegacyEntitlement({resourceKey:"training",librarySubscription:true,librarySubscriptionId:"sub-row",libraryExpiresAt:"2026-10-01T00:00:00Z"});assert.equal(x.source,"library_subscription");assert.equal(x.subscriptionId,"sub-row");assert.equal(x.expiresAt,"2026-10-01T00:00:00Z")});
test("editorial subscription remains independent",()=>{const x=resolveLegacyEntitlement({resourceKey:"magazine",editorialSubscription:true,editorialSubscriptionId:"editorial-row"});assert.equal(x.source,"editorial_subscription")});
test("service-specific access is not converted to PASS",()=>{const x=resolveLegacyEntitlement({resourceKey:"session",serviceSpecific:true});assert.equal(x.source,"service_specific");assert.equal(x.accessType,"temporary")});
test("missing entitlement denies access",()=>{const x=resolveLegacyEntitlement({resourceKey:"premium"});assert.equal(x.allowed,false);assert.equal(x.source,"none")});

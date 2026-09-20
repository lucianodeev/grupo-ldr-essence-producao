import assert from "node:assert/strict";
import test from "node:test";
import { classifyEntitlementResource, isPassEligibleResource, resolveLegacyEntitlement } from "./entitlements";

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

test("PASS stays disabled unless feature flag is enabled",()=>{const x=resolveLegacyEntitlement({resourceKey:"curso_digital_base",pass:true});assert.equal(x.allowed,false);assert.equal(x.source,"none")});
test("enabled PASS grants recurring access to eligible digital resources",()=>{const x=resolveLegacyEntitlement({resourceKey:"curso_digital_base",pass:true,passEnabled:true,passSubscriptionId:"pass-row",passExpiresAt:"2026-11-01T00:00:00Z"});assert.equal(x.allowed,true);assert.equal(x.source,"pass");assert.equal(x.subscriptionId,"pass-row");assert.equal(x.legacy,false)});
test("lifetime ownership still outranks PASS",()=>{const x=resolveLegacyEntitlement({resourceKey:"curso_digital_base",owned:true,pass:true,passEnabled:true});assert.equal(x.source,"ownership");assert.equal(x.accessType,"lifetime")});
test("PASS does not absorb Biblioteca legacy area",()=>{const x=resolveLegacyEntitlement({resourceKey:"biblioteca_legacy_monthly",pass:true,passEnabled:true});assert.equal(x.allowed,false);assert.equal(x.source,"none");assert.equal(x.reasons[0],"pass_not_eligible_for_resource")});
test("PASS does not absorb editorial subscription area",()=>{const x=resolveLegacyEntitlement({resourceKey:"revista_psicanalise_no_mundo",pass:true,passEnabled:true});assert.equal(x.allowed,false);assert.equal(x.reasons[0],"pass_not_eligible_for_resource")});
test("PASS does not create unlimited human-service access",()=>{const x=resolveLegacyEntitlement({resourceKey:"clinica_social_session",pass:true,passEnabled:true});assert.equal(x.allowed,false);assert.equal(x.reasons[0],"pass_not_eligible_for_resource")});
test("explicit PASS eligibility can be enabled for approved digital resources",()=>{const x=resolveLegacyEntitlement({resourceKey:"formacao_psicanalise_600h",pass:true,passEnabled:true,passEligible:true});assert.equal(x.allowed,true);assert.equal(x.source,"pass")});
test("resource classifier keeps separated areas outside PASS by default",()=>{assert.equal(classifyEntitlementResource("revista_psicanalise_no_mundo"),"editorial_separate");assert.equal(classifyEntitlementResource("clinica_social_session"),"human_service_separate");assert.equal(isPassEligibleResource({resourceKey:"ebook_coragem_comecar"}),true)});

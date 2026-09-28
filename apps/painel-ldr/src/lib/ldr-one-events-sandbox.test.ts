import test from "node:test";
import assert from "node:assert/strict";
import { reduceOneSandboxEvent, hasOneDigitalEntitlement } from "./ldr-one-events-sandbox.ts";
const row = { recordId:"row1",customerId:"customer1",stripeSubscriptionId:null,status:"pending" as const,seats:5,lastEventId:null };
const event = (type:string,overrides:Record<string,unknown>={})=>({
  id:"evt1",type,livemode:false,
  metadata:{checkout_kind:"ldr_one_subscription",sandbox:"true",ldr_one_subscription_id:"row1",customer_id:"customer1"},
  object:{id:"sub1",subscription:"sub1",payment_status:"paid",status:"active"},
  ...overrides,
});
test("paid test checkout activates; duplicate is idempotent",()=>{
  const first=reduceOneSandboxEvent(row,event("checkout.session.completed"));
  assert.equal(first.next.status,"active");
  assert.equal(hasOneDigitalEntitlement(first.next),true);
  const again=reduceOneSandboxEvent(first.next,event("checkout.session.completed"));
  assert.equal(again.duplicate,true);
});
test("failed renewal and cancellation revoke digital entitlement",()=>{
  const active=reduceOneSandboxEvent(row,event("checkout.session.completed")).next;
  const failed=reduceOneSandboxEvent(active,event("invoice.payment_failed",{id:"evt2"})).next;
  assert.equal(failed.status,"past_due");
  assert.equal(hasOneDigitalEntitlement(failed),false);
  const canceled=reduceOneSandboxEvent(failed,event("customer.subscription.deleted",{id:"evt3"})).next;
  assert.equal(canceled.status,"canceled");
  assert.equal(hasOneDigitalEntitlement(canceled),false);
});
test("rejects live events, ownership mismatch and subscription swap",()=>{
  assert.throws(()=>reduceOneSandboxEvent(row,event("checkout.session.completed",{livemode:true})));
  assert.throws(()=>reduceOneSandboxEvent(row,event("checkout.session.completed",{metadata:{checkout_kind:"ldr_one_subscription",sandbox:"true",ldr_one_subscription_id:"row1",customer_id:"other"}})));
  const active=reduceOneSandboxEvent(row,event("checkout.session.completed")).next;
  assert.throws(()=>reduceOneSandboxEvent(active,event("invoice.payment_succeeded",{id:"evt2",object:{subscription:"sub2"}})));
});
test("unpaid checkout never grants access",()=>{
  const pending=reduceOneSandboxEvent(row,event("checkout.session.completed",{object:{subscription:"sub1",payment_status:"unpaid"}})).next;
  assert.equal(hasOneDigitalEntitlement(pending),false);
});

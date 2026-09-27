import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveSandboxEventIdentity} from './ldr-one-sandbox-webhook-bridge.mjs';
test('live event refused',()=>assert.throws(()=>resolveSandboxEventIdentity({livemode:true}),/Live/));
test('missing object refused',()=>assert.throws(()=>resolveSandboxEventIdentity({livemode:false}),/object/));
test('unrelated test event ignored',()=>assert.equal(resolveSandboxEventIdentity({livemode:false,data:{object:{metadata:{}}}}),null));

test("signed checkout and invoice events cannot independently activate entitlements",()=>{
 for(const type of ["checkout.session.completed","invoice.payment_succeeded"]){
  const event={livemode:false,type,data:{object:{metadata:{sandbox:"true",checkout_kind:"ldr_one_subscription",ldr_one_subscription_id:"e49bc51e-2af6-4c3d-a91e-a713e1ed69cb",customer_id:"1e2f550b-a4c1-4788-8d34-f0b159c0dc41"}}}};
  assert.equal(resolveSandboxEventIdentity(event),null);
 }
});

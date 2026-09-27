import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveSandboxEventIdentity} from './ldr-one-sandbox-webhook-bridge.mjs';
test('live event refused',()=>assert.throws(()=>resolveSandboxEventIdentity({livemode:true}),/Live/));
test('missing object refused',()=>assert.throws(()=>resolveSandboxEventIdentity({livemode:false}),/object/));
test('unrelated test event ignored',()=>assert.equal(resolveSandboxEventIdentity({livemode:false,data:{object:{metadata:{}}}}),null));

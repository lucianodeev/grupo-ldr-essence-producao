// Actual application transport, isolated temporary Stripe sandbox only.
// No production env, DB, customers, webhook writes or live credentials are loaded.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import {randomUUID} from 'node:crypto';
const require=createRequire(new URL('../../apps/painel-ldr/package.json',import.meta.url));
const ts=require('typescript');
const config=process.env.STRIPE_SANDBOX_CONFIG;
assert.ok(config,'Explicit temporary sandbox config required');
const profile=JSON.parse(execFileSync('python3',['-c',
  'import tomllib,json,sys; print(json.dumps(tomllib.load(open(sys.argv[1],"rb"))["default"]))',config],{encoding:'utf8'}));
assert.ok(profile.sandbox_expires_at,'Temporary isolated sandbox required');
const key=profile.test_mode_api_key;
assert.match(key,/^(?:[sr]k|rkcs)_test_[A-Za-z0-9]+$/);
const source=fs.readFileSync(new URL('../../apps/painel-ldr/src/lib/service-checkout-provider.server.ts',import.meta.url),'utf8');
const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022}}).outputText;
const {hostedServiceCheckout}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
const order={id:randomUUID(),title:'LDR isolated application transport verification',amount_cents:1234,currency:'EUR',contact_email:null};
const metadata={checkout_kind:'enterprise_quote',order_id:order.id,customer_id:randomUUID(),catalog_key:''};
const expires=Math.floor(Date.now()/1000)+3600;
let session;
try {
  session=await hostedServiceCheckout(order,metadata,expires,{env:{STRIPE_SECRET_KEY:key}});
  const repeated=await hostedServiceCheckout(order,metadata,expires,{env:{STRIPE_SECRET_KEY:key}});
  assert.equal(session.id,repeated.id);
  assert.ok(session.id.startsWith('cs_test_'));
  const response=await fetch('https://api.stripe.com/v1/checkout/sessions/'+session.id,{headers:{Authorization:'Bearer '+key}});
  assert.equal(response.ok,true);
  const actual=await response.json();
  assert.equal(actual.livemode,false);assert.equal(actual.amount_total,1234);assert.equal(actual.currency,'eur');
  assert.deepEqual(actual.metadata,metadata);assert.equal(actual.expires_at,expires);
  console.log('PASS actual application transport: remote Stripe price, metadata, expiry and idempotent session');
} finally {
  if(session){
    const response=await fetch('https://api.stripe.com/v1/checkout/sessions/'+session.id+'/expire',{
      method:'POST',headers:{Authorization:'Bearer '+key}});
    assert.equal(response.ok,true);
    assert.equal((await response.json()).status,'expired');
    console.log('PASS sandbox checkout cleanup: session expired');
  }
}

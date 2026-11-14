import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
const ts = createRequire(new URL('../apps/painel-ldr/package.json', import.meta.url))('typescript');
const source = fs.readFileSync(new URL('../apps/painel-ldr/src/routes/api/stripe/webhook.ts', import.meta.url), 'utf8');
function extract(name, next) {
  const start = source.indexOf('async function ' + name + '(');
  const end = source.indexOf('\nasync function ' + next + '(', start);
  assert(start >= 0 && end > start, name + ' function boundaries');
  return source.slice(start, end);
}
const resolver = extract('resolveRecurringCheckoutKind', 'setLdrPassSubscription');
const ldr = extract('setLdrPassSubscription', 'balanceCredit');
const company = extract('setCompanySubscription', 'setLibrarySubscription');
function harness(rows) {
  const updates = [];
  const database = async () => ({ from(table) {
    const q = { table, patch: null, filters: {}, select(){return this}, update(p){this.patch=p;return this}, eq(k,v){this.filters[k]=v;return this}, limit(){return this},
      then(ok,fail) { const match=rows[table]?.some(r=>Object.entries(this.filters).every(([k,v])=>r[k]===v)); if(this.patch && match) updates.push({table,patch:this.patch}); return Promise.resolve({data:this.patch?null:match?[{id:'synthetic'}]:[],error:null}).then(ok,fail); } };
    return q;
  } });
  const stripeId = x => typeof x === 'string' ? x : x?.id ?? null;
  const isoFromUnix = x => typeof x === 'number' ? new Date(x*1000).toISOString() : null;
  const js = ts.transpileModule(resolver+'\n'+ldr+'\n'+company, {compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
  const api = new Function('database','stripeId','isoFromUnix',js+';return {resolveRecurringCheckoutKind,setLdrPassSubscription,setCompanySubscription}') (database,stripeId,isoFromUnix);
  return {...api,updates};
}
test('subscription lifecycle resolves by sub_ object id without checkout_kind', async()=>{
 const h=harness({ldr_pass_subscriptions:[{stripe_subscription_id:'sub_synthetic'}]});
 assert.equal(await h.resolveRecurringCheckoutKind({id:'sub_synthetic'}),'ldr_pass_subscription');
 assert.equal(await h.resolveRecurringCheckoutKind({subscription:'sub_synthetic'}),'ldr_pass_subscription');
});
test('renewal paid activates linked LDR PASS subscription',async()=>{
 const h=harness({ldr_pass_subscriptions:[{stripe_subscription_id:'sub_synthetic'}]});
 await h.setLdrPassSubscription({}, {subscription:'sub_synthetic'}, 'invoice.paid');
 assert.equal(h.updates.length,1);assert.equal(h.updates[0].patch.status,'active');
});
test('failed renewal marks past_due and deletion cancels LDR PASS',async()=>{
 const h=harness({ldr_pass_subscriptions:[{stripe_subscription_id:'sub_synthetic'}]});
 await h.setLdrPassSubscription({}, {subscription:'sub_synthetic'}, 'invoice.payment_failed');
 await h.setLdrPassSubscription({}, {id:'sub_synthetic'}, 'customer.subscription.deleted');
 assert.deepEqual(h.updates.map(x=>x.patch.status),['past_due','canceled']);
});
test('company paid renewal, failure and deletion update linked subscription',async()=>{
 const h=harness({company_subscriptions:[{stripe_subscription_id:'sub_company'}]});
 await h.setCompanySubscription({}, {subscription:'sub_company'}, 'invoice.paid');
 await h.setCompanySubscription({}, {subscription:'sub_company'}, 'invoice.payment_failed');
 await h.setCompanySubscription({}, {id:'sub_company'}, 'customer.subscription.deleted');
 assert.deepEqual(h.updates.map(x=>x.patch.status),['active','past_due','canceled']);
});

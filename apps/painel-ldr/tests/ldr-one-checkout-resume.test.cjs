const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ts=require('typescript');
const path=require('node:path');
function page(search,checkout){
 const effects=[],replacements=[],errors=[];
 const window={location:{href:'https://ldrrhestrategia.com/ldr-pass?checkout=resume',assign(){throw Error('Unexpected login loop');}},history:{state:{},replaceState(...args){replacements.push(args);}}};
 const mocks={
  react:{useState:v=>[v,v=>errors.push(v)],useRef:v=>({current:v}),useEffect:fn=>effects.push(fn)},
  '@tanstack/react-router':{Link:()=>null,createFileRoute:()=>options=>({...options,useSearch:()=>search})},
  '@/lib/ldr-pass.functions':{clientCreateLdrPassCheckout:checkout},
 };
 const module={exports:{}};
 const output=ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/routes/ldr-pass.tsx'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 vm.runInNewContext(output,{module,exports:module.exports,require:id=>mocks[id]??require(id),window,URL,console});
 module.exports.Route.component();
 return {effects,replacements,window,errors};
}
for(const plan of ['individual','business'])test(`resumes ${plan} checkout once with chosen annual billing and seats`,async()=>{
 const calls=[];
 const p=page({plan,billing:'annual',seats:8,checkout:'resume'},async value=>{calls.push(value.data);return {url:'https://checkout.stripe.com/c/pay/cs_live_fixture'};});
 p.effects[0]();p.effects[0]();
 await new Promise(setImmediate);
 assert.equal(calls.length,1);
 assert.equal(calls[0].plan,plan);assert.equal(calls[0].billing,'annual');assert.equal(calls[0].seats,plan==='individual'?1:8);
 assert.equal(p.replacements.length,1);assert.equal(p.replacements[0][2],'/ldr-pass');
 assert.equal(p.window.location.href,'https://checkout.stripe.com/c/pay/cs_live_fixture');
});
test('a missing session after return shows an error instead of looping login',async()=>{
 const p=page({plan:'individual',billing:'monthly',seats:5,checkout:'resume'},async()=>{throw 'Unauthorized: No authenticated session';});
 p.effects[0]();await new Promise(setImmediate);
 assert.ok(p.errors.some(v=>typeof v==='string'&&v.includes('Sua sessão não foi confirmada')));
});
test('ordinary plan visits do not create checkouts',()=>{
 let calls=0;
 const p=page({plan:'individual',billing:'monthly',seats:5},async()=>{calls++;});
 p.effects[0]();assert.equal(calls,0);
});

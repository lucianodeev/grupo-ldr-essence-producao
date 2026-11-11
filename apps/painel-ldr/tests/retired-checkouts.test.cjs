const assert=require('node:assert/strict');
const {test}=require('node:test');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const directory=path.resolve(__dirname,'../src/lib');
const files=fs.readdirSync(directory).filter(name=>name.endsWith('commerce.server.ts')).concat('client-portal.server.ts','professional-formations.server.ts','psychoanalyst-performance.server.ts');
for(const file of files){
 const source=ts.createSourceFile(file,fs.readFileSync(path.join(directory,file),'utf8'),ts.ScriptTarget.Latest,true);
 for(const fn of source.statements.filter(ts.isFunctionDeclaration)){
  if(!fn.modifiers?.some(m=>m.kind===ts.SyntaxKind.ExportKeyword)||!fn.name?.text.includes('Checkout')||!fn.body?.getText(source).includes('Novas compras individuais'))continue;
  test(`${fn.name.text}: retired purchases reject before payment/network activity`,async()=>{
   let network=0;const target={exports:{}};
   const output=ts.transpileModule(fn.getText(source),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
   vm.runInNewContext(output,{exports:target.exports,fail:message=>{throw new Error(message)},fetch:()=>{network++;throw new Error('Network access forbidden in this test')},
    logDigitalCheckout:()=>{},requireClient:async()=>({id:'synthetic',fullName:'Synthetic',email:null,phone:null,country:null}),
    getProfessionalFormation:()=>({slug:'synthetic'}),DIGITAL_CHECKOUT_CONFIG:{ebook_coragem_comecar:{title:'Synthetic'}},
   });
   await assert.rejects(()=>target.exports[fn.name.text]('synthetic-user',null,{productKey:'ebook_coragem_comecar',market:'INTL'},'INTL'),/Novas compras individuais/);
   assert.equal(network,0);
  });
 }
}

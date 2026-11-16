const assert=require('node:assert/strict');
const {test}=require('node:test');
const fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const source=fs.readFileSync(path.resolve(__dirname,'../src/lib/commercial-request.ts'),'utf8');
const target={exports:{}};
new Function('require','module','exports',ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(require,target,target.exports);
const {commercialSupportPayload,commercialProtocol,COMMERCIAL_INTERESTS}=target.exports;
const input={organization:'Instituição de teste',name:'Contacto de teste',email:'CONTACT@example.invalid',interest:'Contratação de serviços',solution:'Formação empresarial',message:'Pedido sintético para validação local.',consent:true,website:''};
test('routes all commercial intents into the existing institutional support contract',()=>{
 for(const interest of COMMERCIAL_INTERESTS){const p=commercialSupportPayload({...input,interest});assert.equal(p.p_subject,'Serviços para empresas');assert.equal(p.p_email,'contact@example.invalid');assert.equal(p.p_consent,true);assert.equal(p.p_wants_luciano,false);assert.ok(p.p_message.includes(interest));assert.ok(p.p_message.length<=4000);assert.equal(p.p_source_url,'https://ldrecossistema.online/empresas/proposta');}
});
test('rejects missing consent, spam, invalid contacts and unbounded messages before submission',()=>{
 for(const change of [{consent:false},{website:'spam'},{email:'invalid'},{organization:''},{message:'x'.repeat(3001)},{interest:'unknown'}])assert.throws(()=>commercialSupportPayload({...input,...change}));
});
test('does not claim receipt without a nonempty confirmed protocol',()=>{
 assert.equal(commercialProtocol({protocol:'LDR-TEST'}),'LDR-TEST');assert.equal(commercialProtocol('LDR-TEST'),'LDR-TEST');
 for(const result of [null,{},true,{protocol:''},{protocol:5}])assert.throws(()=>commercialProtocol(result));
});
test('onboarding requests preserve the existing Master subject and identify the reviewed source only',()=>{
 const payload=commercialSupportPayload({...input,solution:'Integração de novos colaboradores',source:'integracao-colaboradores'});
 assert.equal(payload.p_subject,'Serviços para empresas');
 assert.equal(payload.p_source_project,'Central Empresas LDR');
 assert.equal(payload.p_source_url,'https://ldrecossistema.online/empresas/integracao-colaboradores');
 assert.ok(payload.p_message.includes('Solução: Integração de novos colaboradores'));
 assert.equal(payload.p_email,'contact@example.invalid');
 for(const source of ['https://attacker.invalid','/cliente/agenda','other'])assert.throws(()=>commercialSupportPayload({...input,source}));
 assert.equal(commercialSupportPayload(input).p_source_url,'https://ldrecossistema.online/empresas/proposta');
});

test('onboarding attribution cannot be assigned to another commercial solution',()=>{
 assert.throws(()=>commercialSupportPayload({...input,source:'integracao-colaboradores',solution:'Formação empresarial'}));
 assert.equal(commercialSupportPayload({...input,source:'integracao-colaboradores',solution:'Integração de novos colaboradores'}).p_source_url,'https://ldrecossistema.online/empresas/integracao-colaboradores');
});

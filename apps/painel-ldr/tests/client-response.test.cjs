const assert=require('node:assert/strict');
const {test}=require('node:test');
const fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const target={exports:{}};
new Function('require','module','exports',ts.transpileModule(fs.readFileSync(path.resolve(__dirname,'../src/lib/client-response.schemas.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(require,target,target.exports);
const {clientContextSchema,clientOverviewSchema,clientLibrarySchema,ownerSummarySchema}=target.exports;
const customer={id:'synthetic',fullName:'Synthetic',email:null,phone:null};
test('supports existing client context variants and excludes extra private fields',()=>{
 const value=clientContextSchema.parse({status:'ok',customer:{...customer,internalNotes:'not a public field'}});
 assert.equal(value.customer.country,null);assert.equal('internalNotes' in value.customer,false);
 assert.deepEqual(clientContextSchema.parse({status:'blocked'}),{status:'blocked'});
 assert.throws(()=>clientContextSchema.parse({status:'ok'}));
});
test('validates empty overview without inventing orders, sessions or history',()=>{
 const value=clientOverviewSchema.parse({customer,orders:[],mentorships:[],deliveries:[],sessions:[],history:[]});
 assert.equal(value.orders.length,0);assert.equal(value.sessions.length,0);
 assert.throws(()=>clientOverviewSchema.parse({customer,orders:'unverified'}));
});
test('preserves library prices and denied access without coercing entitlements',()=>{
 const product={key:'ebook_coragem_comecar',title:'Synthetic',description:'Synthetic',priceBrlCents:990,priceEurCents:490,entitled:false,purchaseUrl:'/synthetic'};
 const value=clientLibrarySchema.parse({customer,products:[product]});assert.deepEqual(value.products[0],product);
 assert.throws(()=>clientLibrarySchema.parse({customer,products:[{...product,entitled:'true'}]}));
});
test('rejects malformed financial summaries instead of displaying unverified amounts',()=>{
 const metrics={activeProfessionals:0,pendingProfessionals:0,activeCompanies:0,activeEmployees:0,activeSubscriptions:0,paidPayments:0,pendingPayouts:0,pendingNotifications:0};
 assert.equal(ownerSummarySchema.parse({generatedAt:'synthetic',metrics,financialByCurrency:[]}).metrics.paidPayments,0);
 assert.throws(()=>ownerSummarySchema.parse({generatedAt:'synthetic',metrics:{...metrics,paidPayments:'100'},financialByCurrency:[]}));
});

// Verify paid teaching bodies are server-only even after the production build.
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const load=require('../apps/painel-ldr/tests/helpers/load-ts.cjs')();
const {CUSTOMER_SERVICE_READING_EDITION:edition}=load('content/academy-reading/customer-service-release.server.ts');
const {CUSTOMER_SERVICE_PRACTICE_GUIDE:guide}=load('content/academy-reading/customer-service-practice.server.ts');
const {RELEASED_COURSE_READING_EDITIONS:releases}=load('content/academy-reading/courses-reading-release.server.ts');
const protectedModules=[...edition.modules,...guide.modules,...releases.flatMap(item=>item.modules)];
const directory=path.resolve(__dirname,'../apps/painel-ldr/dist/client');
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?walk(path.join(dir,entry.name)):[path.join(dir,entry.name)]);}
const files=walk(directory).filter(file=>/\.(js|json|map)$/.test(file));assert.ok(files.length>0,'Client build missing');
const markers=protectedModules.map(module=>{
 const isPractice=guide.modules.includes(module);
 const paragraph=module.body.split(/\n\s*\n/).find(block=>isPractice?block.startsWith('contexto:'):block.split(/\s+/).length>45 && !block.startsWith('#'));assert.ok(paragraph);
 const marker=(isPractice?paragraph.slice('contexto: '.length):paragraph).slice(0,120);
 return {id:module.id,marker,escaped:JSON.stringify(marker).slice(1,-1)};
});
for(const file of files){const asset=fs.readFileSync(file,'utf8');for(const {id,marker,escaped} of markers){
 assert.ok(!asset.includes(marker) && !asset.includes(escaped),`Teaching body leaked into ${path.basename(file)}: ${id}`);
}}
console.log(JSON.stringify({pass:true,clientFiles:files.length,protectedUnits:protectedModules.length,teachingBodiesInPublicAssets:false}));

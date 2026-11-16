// Verify paid teaching bodies are server-only even after the production build.
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const load=require('../apps/painel-ldr/tests/helpers/load-ts.cjs')();
const {CUSTOMER_SERVICE_READING_EDITION:edition}=load('content/academy-reading/customer-service-release.server.ts');
const directory=path.resolve(__dirname,'../apps/painel-ldr/dist/client');
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?walk(path.join(dir,entry.name)):[path.join(dir,entry.name)]);}
const files=walk(directory).filter(file=>/\.(js|json|map)$/.test(file));assert.ok(files.length>0,'Client build missing');
for(const file of files){const asset=fs.readFileSync(file,'utf8');for(const module of edition.modules){
 const paragraph=module.body.split(/\n\s*\n/).find(block=>block.split(/\s+/).length>45 && !block.startsWith('#'));assert.ok(paragraph);
 const marker=paragraph.slice(0,120);
 assert.ok(!asset.includes(marker) && !asset.includes(JSON.stringify(marker).slice(1,-1)),`Teaching body leaked into ${path.basename(file)}: ${module.id}`);
}}
console.log(JSON.stringify({pass:true,clientFiles:files.length,protectedUnits:edition.modules.length,teachingBodiesInPublicAssets:false}));

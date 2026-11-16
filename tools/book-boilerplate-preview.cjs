// Local editorial previews only: no database client, network, activation or original-file writes.
const crypto=require('node:crypto');
const hash=text=>crypto.createHash('sha256').update(text).digest('hex');
function stable(value){if(Array.isArray(value))return value.map(stable);if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort().map(key=>[key,stable(value[key])]));return value;}
const checksum=value=>hash(JSON.stringify(stable(value)));
const canonical=text=>(text.normalize('NFKC').toLowerCase().match(/[\p{L}\p{N}_]+/gu)||[]).join(' ');
function units(content){
 if(content.kind==='ebook'&&Array.isArray(content.pages))return content.pages.map((page,index)=>({index,title:page.titulo,text:page.texto,set:(copy,text)=>{copy.pages[index].texto=text;}}));
 if(Array.isArray(content.data?.chapters))return content.data.chapters.map((chapter,index)=>({index,title:chapter[1],text:chapter[2].join('\n\n'),set:(copy,text)=>{copy.data.chapters[index][2]=text.split('\n\n');}}));
 throw new Error('Unsupported source structure');
}
function sentences(text){
 const result=[];let start=0;
 const add=end=>{const raw=text.slice(start,end),leading=raw.length-raw.trimStart().length,trailing=raw.length-raw.trimEnd().length;if(raw.trim())result.push({start:start+leading,end:end-trailing,text:raw.trim()});};
 for(const boundary of text.matchAll(/(?<=[.!?])\s+|\n+/gu)){add(boundary.index);start=boundary.index+boundary[0].length;}
 add(text.length);return result;
}
function repeatedGroups(content,minOccurrences=10){
 const groups=new Map();
 for(const unit of units(content))for(const [sentenceIndex,sentence] of sentences(unit.text).entries()){
  const normalized=canonical(sentence.text);if(normalized.split(' ').length<9)continue;
  const key=hash(normalized),group=groups.get(key)||{sha256:key,locations:[]};
  group.locations.push({unit:unit.index+1,sentence:sentenceIndex+1,textSha256:hash(sentence.text)});groups.set(key,group);
 }
 return [...groups.values()].filter(group=>new Set(group.locations.map(item=>item.unit)).size>=minOccurrences).sort((a,b)=>a.sha256.localeCompare(b.sha256));
}
function buildPlan(row,selectedHashes,{minOccurrences=10}={}){
 if(!Array.isArray(selectedHashes)||!selectedHashes.length)throw new Error('Explicit sentence selection required');
 const content=row.decoded,groups=repeatedGroups(content,minOccurrences).filter(group=>selectedHashes.includes(group.sha256));
 if(groups.length!==new Set(selectedHashes).size)throw new Error('Selection does not match repeated source groups');
 return {productKey:row.product_key,locale:row.locale,baseVersion:row.version,candidateVersion:row.version+1,status:'review-required',published:false,operation:'remove-selected-repetitions-after-first-occurrence',canonicalization:'JSON.stringify with recursively sorted object keys, SHA256 UTF8',baseContentSha256:checksum(content),unitCount:units(content).length,selectedGroups:groups.length,removals:groups.flatMap(group=>group.locations.slice(1).map(location=>({...location,sha256:group.sha256}))),remaining:'Editorial continuity, clinical claims where applicable, authorial voice, and reader positions still require review. No new narrative, patient or biographical facts are supplied.'};
}
function applyPreview(row,plan){
 if(plan.published!==false||plan.status!=='review-required'||plan.operation!=='remove-selected-repetitions-after-first-occurrence')throw new Error('Only unpublished review previews are supported');
 if(row.product_key!==plan.productKey||row.locale!==plan.locale||row.version!==plan.baseVersion||checksum(row.decoded)!==plan.baseContentSha256)throw new Error('Source identity or checksum mismatch');
 const sourceUnits=units(row.decoded);if(sourceUnits.length!==plan.unitCount)throw new Error('Unit count mismatch');
 const allowed=new Set(repeatedGroups(row.decoded,2).flatMap(group=>group.locations.slice(1).map(location=>`${location.unit}:${location.sentence}:${group.sha256}`)));
 const copy=structuredClone(row.decoded),byUnit=new Map();
 for(const removal of plan.removals){const list=byUnit.get(removal.unit)||[];list.push(removal);byUnit.set(removal.unit,list);}
 for(const [number,removals] of byUnit){
  const unit=sourceUnits[number-1];if(!unit)throw new Error('Missing source unit');
  const spans=sentences(unit.text),selected=[],seen=new Set();
  for(const removal of removals){
   if(!allowed.has(`${removal.unit}:${removal.sentence}:${removal.sha256}`))throw new Error('Selected passage must be a repeated copy after its first occurrence');
   const span=spans[removal.sentence-1];if(!span||seen.has(removal.sentence)||hash(span.text)!==removal.textSha256||hash(canonical(span.text))!==removal.sha256)throw new Error('Selected passage mismatch');
   seen.add(removal.sentence);selected.push(span);
  }
  let text=unit.text;for(const span of selected.sort((a,b)=>b.start-a.start))text=text.slice(0,span.start)+text.slice(span.end);
  unit.set(copy,text);
 }
 return copy;
}
module.exports={hash,checksum,units,sentences,repeatedGroups,buildPlan,applyPreview};

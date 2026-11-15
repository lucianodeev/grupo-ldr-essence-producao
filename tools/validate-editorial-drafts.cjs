/* Offline review of candidate editions. This tool NEVER activates a version or writes to Supabase. */
const fs=require('node:fs'),path=require('node:path');
function validateDraft(d){
 const errors=[];if(!d||typeof d!=='object')return{errors:['Invalid draft'],activationEligible:false};
 if(!/^[a-z0-9_]+$/.test(d.productKey||''))errors.push('Missing product key');
 if(!Number.isInteger(d.baseVersion)||d.candidateVersion<=d.baseVersion)errors.push('Version must advance without replacing the base');
 if(!/^[a-f0-9]{64}$/.test(d.baseCanonicalSha256||''))errors.push('Missing canonical base checksum');
 const chapters=Array.isArray(d.chapters)?d.chapters:[],ids=new Set(),sources=new Set((d.sources||[]).map(s=>s.id));
 for(const c of chapters){if(ids.has(c.id))errors.push('Duplicate chapter '+c.id);ids.add(c.id);if(!c.title||!c.objectives?.length||!c.exercise||!c.assessment?.answer)errors.push('Incomplete teaching structure '+c.id);for(const id of c.sourceIds||[])if(!sources.has(id))errors.push('Unknown reference '+id);const text=(c.sections||[]).flatMap(s=>s.paragraphs||[]).join(' ');if(text.split(/\s+/).length<400)errors.push('Chapter requires development '+c.id);}
 if(d.published!==false)errors.push('Draft export must remain unpublished');
 const complete=chapters.length===d.expectedChapterCount&&chapters.every((c,i)=>c.id===String(i+1));
 // Approval is necessary but never sufficient: completeness and base identity must be reviewed independently.
 const activationEligible=errors.length===0&&complete&&d.status==='approved'&&d.review?.scientific===true&&d.review?.editorial===true&&d.review?.rights===true&&d.review?.reader===true;
 return{errors,authoredChapters:chapters.length,expectedChapters:d.expectedChapterCount,complete,activationEligible};
}
module.exports={validateDraft};
if(require.main===module){const dir=path.resolve(__dirname,'../editorial/drafts');let failed=false;for(const name of fs.readdirSync(dir).filter(n=>n.endsWith('.json'))){const result=validateDraft(JSON.parse(fs.readFileSync(path.join(dir,name),'utf8')));console.log(name,JSON.stringify(result));if(result.errors.length)failed=true;}if(failed)process.exitCode=1;}

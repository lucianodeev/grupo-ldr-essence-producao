const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {prepareKit}=require('../../../tools/prepare-academy-pilot-kit.cjs');
function draft(){return{slug:'synthetic-course',title:'<script>unsafe title</script>',status:'draft',published:false,sources:[],modules:[{id:'1',title:'Unidade',objectives:['Ler'],sections:[{title:'Texto',paragraphs:['<img src=x onerror=alert(1)>']}],case:'Caso',exercise:'Tarefa',assessment:{question:'Pergunta',answer:'PRIVATE_ASSESSMENT_ANSWER',rubric:['PRIVATE_REVIEW_CRITERION']},workPacket:{resolucaoComentada:'PRIVATE_WORKED_SOLUTION',quintaCandidaturaDeTreino:{limite:'150 palavras'}}}]};}
test('pilot material separates facilitator keys and leaves all human results empty',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'ldr-pilot-test-'));try{
 const output=path.join(dir,'kit');
 const manifest=prepareKit([draft()],output,'a'.repeat(40));
 assert.equal(manifest.status,'prepared-not-applied');assert.equal(manifest.publicationApproved,false);assert.equal(manifest.validatedHours,null);
 for(const key of ['participants','specialistReviews','observedTimes'])assert.deepEqual(manifest[key],[]);
 const html=fs.readFileSync(path.join(output,'Participantes/synthetic-course.html'),'utf8');
 assert.ok(html.includes('150 palavras'));assert.ok(!html.includes('<script>'));assert.ok(!html.includes('<img'));assert.ok(html.includes('&lt;img'));
 for(const marker of ['PRIVATE_ASSESSMENT_ANSWER','PRIVATE_REVIEW_CRITERION','PRIVATE_WORKED_SOLUTION'])assert.ok(!html.includes(marker));
 const key=fs.readFileSync(path.join(output,'Gabaritos/synthetic-course.md'),'utf8');assert.ok(key.includes('PRIVATE_ASSESSMENT_ANSWER'));assert.ok(key.includes('PRIVATE_WORKED_SOLUTION'));
 assert.ok(fs.readFileSync(path.join(output,'Registo_pilotagem.csv'),'utf8').includes('nao_aplicado'));
 assert.ok(!/fetch\(|XMLHttpRequest|<form|<script/i.test(html));
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('pilot preparation rejects public repository output and published inputs',()=>{
 assert.throws(()=>prepareKit([],path.resolve(__dirname,'../public/pilot'),'a'.repeat(40)),/outside the repository/);
 const item=draft();item.published=true;
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'ldr-pilot-reject-'));try{assert.throws(()=>prepareKit([item],path.join(dir,'kit'),'a'.repeat(40)),/unpublished/);}finally{fs.rmSync(dir,{recursive:true,force:true});}
});

test('regeneration refuses an existing kit and preserves collected responses, times, reviews and manifest',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'ldr-pilot-preserve-'));
 try{
  const output=path.join(dir,'kit');prepareKit([draft()],output,'a'.repeat(40));
  const records={
   'Registo_pilotagem.csv':'participant_code,reading_minutes,response\nP01,12,Observed answer\n',
   'Revisao_especializada.csv':'reviewer_reference,decision\nR01,changes required\n',
   'Manifesto.json':'{"local_observation":"must remain unchanged"}\n'
  };
  for(const [name,text]of Object.entries(records))fs.writeFileSync(path.join(output,name),text);
  const html=fs.readFileSync(path.join(output,'Participantes/synthetic-course.html'));
  assert.throws(()=>prepareKit([draft()],output,'b'.repeat(40)),/already exists.*preserved/);
  for(const [name,text]of Object.entries(records))assert.equal(fs.readFileSync(path.join(output,name),'utf8'),text);
  assert.deepEqual(fs.readFileSync(path.join(output,'Participantes/synthetic-course.html')),html);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});

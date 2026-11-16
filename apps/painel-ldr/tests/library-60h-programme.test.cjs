const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const React = require('react'), { renderToStaticMarkup } = require('react-dom/server');
const { validateProgramme, prepareProgramme, reviewMarkdown, FILE } = require('../../../tools/prepare-customer-service-60h.cjs');
const root = path.resolve(__dirname,'../../..');
const read = () => JSON.parse(fs.readFileSync(path.join(root,FILE),'utf8'));
const hash = text => crypto.createHash('sha256').update(text).digest('hex');
const load = require('./helpers/load-ts.cjs')();
const { isApprovedReadingEdition } = load('lib/academy-reading-editions.ts');
const { AcademyMarkdown, AcademyReadingEditionView } = load('components/academy-reading-edition.tsx');
test('60 hours are estimated once per activity, with deliverables and no invented pilot or approval', () => {
 const p=read(), result=validateProgramme(p); assert.deepEqual(result.errors,[]);
 assert.equal(result.activities,30); assert.deepEqual(result.totals,{study:720,practice:1080,case:720,project:840,assessment:240});
 assert.equal(p.modules.reduce((n,m)=>n+m.activities.reduce((t,a)=>t+a.steps.length,0),0),78);
 assert.equal(p.pilot.participants.length,0); assert.equal(p.pilot.observations.length,0);
 for (const mutate of [q=>q.modules[0].activities[0].steps[0].minutes++,q=>q.validatedHours=60,q=>q.published=true,q=>q.approval={reviewer:'fake'},q=>q.review.workload=true,q=>q.pilot.observations.push({minutes:600}),q=>q.modules[1].activities[0].id=q.modules[0].activities[0].id,q=>q.modules[0].baseReading.sha256='0'.repeat(64)]) {
   const q=structuredClone(p);mutate(q);assert.ok(validateProgramme(q).errors.length,'unsafe change must be rejected');
 }
});
test('offline Academy export preserves student tasks, separates new keys, and blocks the public reader',()=>{
 const p=read(), before=fs.readFileSync(path.join(root,FILE),'utf8'), student=prepareProgramme(),teacher=prepareProgramme(root,{answers:true});
 assert.equal(student.modules.length,6); assert.notEqual(student.editionId,teacher.editionId);
 assert.equal(isApprovedReadingEdition(student),false); assert.equal(isApprovedReadingEdition(teacher),false);
 assert.ok(!renderToStaticMarkup(React.createElement(AcademyReadingEditionView,{edition:student})).includes('<article'));
 for(const [i,m] of p.modules.entries()){
  const out=student.modules[i];assert.equal(out.sha256,hash(out.body));assert.equal(out.sourceSha256,hash(JSON.stringify(m)));
  assert.ok(out.body.includes(fs.readFileSync(path.join(root,m.baseReading.path),'utf8')));
  for(const a of m.activities)for(const s of [...a.steps.map(s=>s.instruction),...a.submissionFields,...a.acceptanceCriteria]) assert.ok(out.body.includes(s));
  for(const a of m.activities)for(const key of a.facilitatorKey) assert.ok(teacher.modules[i].body.includes(key));
  assert.ok(!out.body.includes('Gabarito do facilitador'));
  const html=renderToStaticMarkup(React.createElement(AcademyMarkdown,{body:out.body}));assert.ok(html.includes('<h3'));assert.ok(html.includes('Rascunho'));
 }
 // A unique sentinel verifies key filtering independently of the actual wording, which can recur in base self-assessments.
 const tmp=fs.mkdtempSync(path.join(require('node:os').tmpdir(),'ldr-60h-'));
 try {fs.mkdirSync(path.join(tmp,'editorial/programmes'),{recursive:true});fs.cpSync(path.join(root,'docs/audit-20261115/course-development/customer-service'),path.join(tmp,'docs/audit-20261115/course-development/customer-service'),{recursive:true});
 p.modules[0].activities[0].facilitatorKey.push('FACILITATOR_ONLY_SENTINEL_60H');fs.writeFileSync(path.join(tmp,FILE),JSON.stringify(p));
 assert.ok(!prepareProgramme(tmp).modules[0].body.includes('FACILITATOR_ONLY_SENTINEL_60H'));assert.ok(prepareProgramme(tmp,{answers:true}).modules[0].body.includes('FACILITATOR_ONLY_SENTINEL_60H'));
 } finally{fs.rmSync(tmp,{recursive:true,force:true});}
 assert.equal(fs.readFileSync(path.join(root,FILE),'utf8'),before);
});
test('worked case calculations use actual scenario data and distinct denominators',()=>{
 const p=read(), queue=p.modules[1].casePacket.fila, order=['Q2','Q3','Q1','Q4'];
 let elapsed=0;const ends=order.map(id=>{elapsed+=queue.find(q=>q.id===id).tratamentoMin;return elapsed;});assert.deepEqual(ends,[20,35,45,50]);
 assert.equal(50+15-45,20); // extended Q2 then Q3 finishes twenty minutes after 09:45.
 const periods=p.modules[3].casePacket.periodos;
 const stats=periods.map(period=>({messages:period.registos.reduce((n,row)=>n+row.mensagens,0),incidents:new Set(period.registos.filter(row=>row.confirmado).map(row=>row.pedido)).size,total:period.pedidosTotais}));
 assert.deepEqual(stats,[{messages:8,incidents:2,total:100},{messages:5,incidents:1,total:80}]);
 const rates=stats.map(s=>s.incidents/s.total*100);assert.deepEqual(rates,[2,1.25]);assert.equal((rates[0]-rates[1])/rates[0]*100,37.5);
 const a=p.modules[4].casePacket.amostra;assert.equal(a.respostas/a.casos*100,40);assert.equal(a.satisfeitosEntreRespostas/a.respostas*100,75);assert.equal(a.casos-a.respostas,a.semResposta);
});
test('review document remains reproducible and published edition is still the separate reading-only release',()=>{
 assert.equal(fs.readFileSync(path.join(root,'docs/customer-service-60h-review.md'),'utf8'),reviewMarkdown());
 const {CUSTOMER_SERVICE_READING_EDITION:released}=load('content/academy-reading/customer-service-release.server.ts');
 assert.equal(isApprovedReadingEdition(released),true);assert.equal(released.validatedHours,null);assert.equal(released.certificate,false);
 assert.notEqual(released.editionId,prepareProgramme().editionId);
});

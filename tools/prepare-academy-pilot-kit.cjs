// Creates offline study materials only. Never starts a study, contacts people or approves publication.
'use strict';
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const ROOT = path.resolve(__dirname, '..');
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const csv = rows => rows.map(row => row.map(value => '"' + String(value ?? '').replace(/"/g, '""') + '"').join(',')).join('\r\n') + '\r\n';
function studentData(module) {
  if (module.simulationPacket) {
    const keys = ['status','vacancy','candidateExamples','preparationMinutes','conversationMinutes','prompts','debrief','recordingRequired','certificateEligible'];
    return Object.fromEntries(keys.filter(key => key in module.simulationPacket).map(key => [key, module.simulationPacket[key]]));
  }
  if (!module.workPacket) return null;
  const keys = ['natureza','quintaCandidaturaDeTreino','calendarioDeTreino','listaSintetica','synthetic','entries','recoveryQuestions','realPayments','realAccessChanges'];
  return Object.fromEntries(keys.filter(key => key in module.workPacket).map(key => [key,module.workPacket[key]]));
}
const PROTOCOL = `# Aplicação da revisão e pilotagem

Estado: preparado, não aplicado. Zero participantes e zero pareceres recolhidos por este kit.

1. O responsável identifica revisores com competência nos domínios dos cursos. Não se presume que uma única pessoa possa validar todos os temas. Cada parecer deve identificar âmbito, versão, fontes examinadas, problemas e decisão fundamentada; uma revisão de código não é parecer pedagógico.
2. Entregar primeiro apenas as fichas da pasta Participantes. Usar pessoas reais que aceitem participar, com perfil relacionado com o público pretendido. A composição do grupo será registada e justificada pelo responsável; este kit não define uma amostra estatisticamente validada. Não incluir alunos automaticamente ou contactar terceiros sem instrução.
3. Para cada unidade, registar separadamente leitura e execução da atividade, pausas e apoios utilizados. Tempos ficam em branco até observação real. O participante trabalha com os dados sintéticos fornecidos, sem revelar informações pessoais, profissionais reservadas ou clínicas. Não gravar imagem/voz nem recolher nome, email ou documentos neste formulário.
4. Guardar a resposta antes de consultar o gabarito. O material de estudo conserva exemplos explicados: isto é pilotagem formativa, não exame controlado. O facilitador usa os critérios e o gabarito para descrever compreensão, erros, ambiguidades e necessidade de apoio, sem atribuir diagnóstico ou escore psicométrico.
5. Observar navegação e formatos, incluindo tecnologias de apoio quando disponíveis, e registar a condição real. Teste automático em Chromium não substitui essa observação. Uma dificuldade de acesso não deve ser atribuída automaticamente a incompreensão do conteúdo.
6. O revisor confronta o que foi observado com os objetivos. Registar problema, trecho, impacto e correção proposta. Repetir apenas as partes cuja alteração ou resultado o justifique. Resultados deste grupo não demonstram eficácia universal.
7. O responsável decide o âmbito de uma eventual edição e o que permanece por validar. Não converter tempo estimado ou poucos registos em 80–160 horas certificadas. Recolha de tempos não aprova certificados. Não publicar enquanto existirem pendências de conteúdo/direitos ou decisão de aprovação em falta.

Os ficheiros não enviam dados, não fazem login, não acedem a Stripe/Supabase nem alteram progresso. Não colocar este kit em diretório público. Entregar o gabarito apenas ao facilitador/revisor até terminar a tentativa correspondente.
`;
function prepareKit(documents, output, sourceCommit) {
  output = path.resolve(output);
  const relative = path.relative(ROOT, output);
  if (!relative.startsWith('..' + path.sep) && relative !== '..') throw new Error('Pilot output must be outside the repository/public application');
  if (!/^[a-f0-9]{40}$/.test(sourceCommit)) throw new Error('Exact source commit required');
  fs.mkdirSync(output, { recursive: true });
  fs.mkdirSync(path.join(output, 'Participantes'), { recursive: true });
  fs.mkdirSync(path.join(output, 'Gabaritos'), { recursive: true });
  const pilot = [['source_commit','course_slug','unit_id','module_sha256','participant_code','date','reading_minutes','activity_minutes','pause_minutes','support_used','response','difficulty','status']];
  const specialist = [['source_commit','course_slug','reviewer_reference','domain_and_scope','review_date','pedagogy_findings','sources_and_rights_findings','accessibility_findings','required_changes','decision','status']];
  const courses = [];
  const slugs = new Set();
  for (const draft of documents) {
    if (draft.status !== 'draft' || draft.published !== false || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(draft.slug) || slugs.has(draft.slug)) throw new Error('Unique unpublished draft required');
    slugs.add(draft.slug);
    const sections = [], keys = [], units = [];
    for (const module of draft.modules) {
      const moduleHash = sha(JSON.stringify(module));
      const packet = studentData(module);
      sections.push(`<section><h2>${esc(module.id)}. ${esc(module.title)}</h2><h3>Objetivos</h3><ul>${module.objectives.map(item=>'<li>'+esc(item)+'</li>').join('')}</ul>${module.sections.map(section=>'<h3>'+esc(section.title)+'</h3>'+section.paragraphs.map(p=>'<p>'+esc(p)+'</p>').join('')).join('')}<h3>Caso</h3><p>${esc(module.case)}</p>${packet && Object.keys(packet).length ? '<h3>Dados complementares</h3><pre>'+esc(JSON.stringify(packet,null,2))+'</pre>' : ''}<h3>Atividade</h3><p>${esc(module.exercise)}</p><h3>Pergunta de verificação</h3><p>${esc(module.assessment.question)}</p><p>Registe a resposta e os tempos na folha de pilotagem antes de consultar o gabarito.</p></section>`);
      keys.push(`# ${module.id}. ${module.title}\n\nCaso: ${module.case}\n\nAtividade: ${module.exercise}\n\nPergunta: ${module.assessment.question}\n\nResposta de verificação: ${module.assessment.answer}\n\nCritérios:\n${module.assessment.rubric.map(item=>'- '+item).join('\n')}\n\n${module.workPacket || module.simulationPacket ? 'Pacote do facilitador:\n\n'+JSON.stringify(module.workPacket || module.simulationPacket,null,2) : ''}`);
      pilot.push([sourceCommit,draft.slug,module.id,moduleHash,'','','','','','','','','nao_aplicado']);
      units.push({id:module.id,sha256:moduleHash});
    }
    const html = `<!doctype html><html lang="pt"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(draft.title)} — pilotagem</title><style>body{font:18px/1.7 system-ui,sans-serif;max-width:850px;margin:auto;padding:24px;color:#13263b}h1,h2{line-height:1.25}section{border-top:2px solid #bdcbd9;margin-top:2rem;padding-top:1rem}pre{white-space:pre-wrap;overflow-wrap:anywhere;font:15px/1.7 system-ui}p,li{overflow-wrap:anywhere}.notice{background:#eef3f8;padding:16px}a{color:#154e83}@media print{body{font-size:12pt}}</style><h1>${esc(draft.title)}</h1><p class="notice">Rascunho para pilotagem — não publicado. Sem carga horária validada ou certificado. Os casos são sintéticos; não utilizar dados reais. Material de estudo com exemplos explicados, não exame controlado.</p><p>Versão de origem: ${sourceCommit}. Leia o protocolo antes de iniciar.</p>${sections.join('')}<h2>Referências e alcance</h2><ul>${draft.sources.map(source=>'<li>'+esc(source.title)+'<br>'+esc(source.url)+'<p>'+esc(source.scope)+'</p></li>').join('')}</ul></html>`;
    fs.writeFileSync(path.join(output,'Participantes',draft.slug+'.html'), html);
    fs.writeFileSync(path.join(output,'Gabaritos',draft.slug+'.md'), '# Uso do facilitador — '+draft.title+'\n\nNão distribuir antes da tentativa. Não é aprovação pedagógica.\n\n'+keys.join('\n\n---\n\n')+'\n');
    specialist.push([sourceCommit,draft.slug,'','','','','','','','','nao_realizado']);
    courses.push({slug:draft.slug,title:draft.title,units,participantFileSha256:sha(html)});
  }
  const manifest = {schema:'ldr-academy-pilot-kit-v1',sourceCommit,courses,courseCount:courses.length,unitCount:courses.reduce((n,c)=>n+c.units.length,0),participants:[],specialistReviews:[],observedTimes:[],publicationApproved:false,validatedHours:null,status:'prepared-not-applied'};
  fs.writeFileSync(path.join(output,'Manifesto.json'), JSON.stringify(manifest,null,2)+'\n');
  fs.writeFileSync(path.join(output,'Registo_pilotagem.csv'), '\ufeff'+csv(pilot));
  fs.writeFileSync(path.join(output,'Revisao_especializada.csv'), '\ufeff'+csv(specialist));
  fs.writeFileSync(path.join(output,'Protocolo.md'), PROTOCOL);
  fs.writeFileSync(path.join(output,'LEIA_PRIMEIRO.md'), `# Kit privado de revisão e pilotagem\n\n${courses.length} cursos, ${manifest.unitCount} unidades. Estado: preparado, não aplicado. Não há participantes, pareceres ou tempos observados.\n\nComece por Protocolo.md. Entregue apenas a ficha adequada de Participantes; Gabaritos é do facilitador. Os dois CSV estão por preencher e não são resultados. Nenhum ficheiro aprova publicação ou certificação. Não colocar em hospedagem pública.\n`);
  return manifest;
}
if (require.main === module) {
  const index = process.argv.indexOf('--out');
  if (index < 0 || !process.argv[index+1]) throw new Error('Use --out ABSOLUTE_PRIVATE_OUTPUT --commit EXACT_SOURCE_SHA');
  const commit = process.argv[process.argv.indexOf('--commit')+1];
  const docs = fs.readdirSync(path.join(ROOT,'editorial/courses')).filter(file=>file.endsWith('.json')).sort().map(file=>JSON.parse(fs.readFileSync(path.join(ROOT,'editorial/courses',file),'utf8')));
  const manifest = prepareKit(docs,process.argv[index+1],commit);
  console.log(JSON.stringify({courses:manifest.courseCount,units:manifest.unitCount,participants:0,specialistReviews:0,observedTimes:0,publicationApproved:false,status:manifest.status}));
}
module.exports = { prepareKit, studentData };

// Build owner-authorized reading-only releases; source drafts and historical curricula remain intact.
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {prepareCourseCandidate}=require('./prepare-course-academy-candidates.cjs');
const ROOT=path.resolve(__dirname,'..');
const sha=value=>crypto.createHash('sha256').update(value).digest('hex');
const DISCLOSURE='Edição de leitura e prática com revisão interna assistida por IA e publicação autorizada pelo responsável. Não é parecer profissional externo ou validação de eficácia. Sem horas certificadas e sem certificado; os casos são didáticos e as atividades decorrem ao seu ritmo.';
function makeReleases(root=ROOT){
 const files=fs.readdirSync(path.join(root,'editorial/courses')).filter(file=>file.endsWith('.pt.json')).sort();
 if(files.length!==49)throw new Error('Expected exactly the 49 authored courses');
 const metadata=[],editions=[],evidence=[];
 for(const file of files){
  const raw=fs.readFileSync(path.join(root,'editorial/courses',file),'utf8'),draft=JSON.parse(raw);
  const candidate=prepareCourseCandidate(file,root);
  if(Object.values(draft.review).some(value=>value!==false)||draft.published!==false||draft.validatedHours!==null)throw new Error('Source state changed: '+file);
  const modules=candidate.modules.map(module=>{
   const body=module.body.replace('Rascunho para revisão. Não publicado. Sem carga horária validada e sem certificado.',DISCLOSURE)
    .replaceAll('Consulta registada no rascunho: ','Referência consultada em: ');
   return {...module,body,sha256:sha(body)};
  });
  const words=modules.reduce((sum,module)=>sum+module.body.trim().split(/\s+/u).length,0);
  const reading={min:Math.max(1,Math.ceil(words/250)),max:Math.max(1,Math.ceil(words/200)),wordsPerMinute:[200,250]};
  const edition={...candidate,editionId:'reading-'+sha(raw+'\n'+modules.map(module=>module.sha256).join('\n')),
   status:'approved',published:true,releaseMode:'reading-only',certificate:false,validatedHours:null,estimatedReadingMinutes:reading,
   releaseDisclosure:DISCLOSURE,
   review:{pedagogy:true,editorial:true,rights:true,accessibility:true,workload:true,reader:true},
   approval:{reviewer:'LDR — revisão interna assistida por IA; edição de leitura autorizada por Luciano Rodrigues Almeida',reviewedAt:'2026-11-17'},modules};
  const sentences=draft.scope.split(/(?<=[.!?])\s+/u).filter(sentence=>!/(históric|horas|\bcarga\b|edição candidata|não importad|catálogo ativo|em revisão|migração|roteiro automático|não é substituição ativa)/iu.test(sentence));
  const summary=sentences.slice(0,2).join(' ');
  if(!summary)throw new Error('Missing specific public scope: '+file);
  metadata.push({slug:draft.slug,productKey:draft.productKey,title:draft.title,summary,moduleCount:modules.length,estimatedReadingMinutes:reading});
  editions.push(edition);
  evidence.push({file,slug:draft.slug,productKey:draft.productKey,sourceSha256:sha(raw),editionId:edition.editionId,words,readingMinutes:reading,
   modules:modules.map(module=>({id:module.id,sourceSha256:module.sourceSha256,sha256:module.sha256})),
   reviewScope:{pedagogy:'Objetivos, dados fictícios, exercícios, respostas e limites existentes; sem avaliação de eficácia.',editorial:'Derivação rastreável; só o aviso de rascunho e o rótulo de consulta foram alterados.',rights:'Textos didáticos próprios assistidos por IA, casos sintéticos, referências por ligação; sem incorporar imagens, manuais ou excertos externos. Não é parecer jurídico.',accessibility:'HTML do leitor, teclado, contraste/overflow e marcação; sem certificação de acessibilidade ou teste com tecnologias de apoio.',workload:'Estimativa de leitura do corpo exportado a200–250palavras/minuto; exclui execução das atividades, sem validar horas históricas.',reader:'Contrato, acesso ao produto, integridade e navegador verificáveis em CI antes de merge.'}});
 }
 if(new Set(editions.map(e=>e.slug)).size!==49||new Set(editions.map(e=>e.productKey)).size!==49)throw new Error('Duplicate release identities');
 if(editions.reduce((sum,e)=>sum+e.modules.length,0)!==193)throw new Error('Unexpected unit count');
 return {metadata,editions,evidence};
}
function generated(root=ROOT){
 const {metadata,editions,evidence}=makeReleases(root);
 return {
  'apps/painel-ldr/src/lib/academy-course-reading-catalog.ts': '// Public metadata only; no teaching bodies, answers or source packets.\nexport const ACADEMY_COURSE_READING_CATALOG = '+JSON.stringify(metadata,null,2)+';\nexport function getAcademyCourseReadingMetadata(slug: string) {\n  return ACADEMY_COURSE_READING_CATALOG.find(item => item.slug === slug) ?? null;\n}\n',
  'apps/painel-ldr/src/content/academy-reading/courses-reading-release.server.ts':'import type { AcademyReadingEdition } from "@/lib/academy-reading-editions";\n// Generated server-only reading releases. Review scope and provenance are recorded separately.\nexport const RELEASED_COURSE_READING_EDITIONS: AcademyReadingEdition[] = '+JSON.stringify(editions,null,2)+';\n',
  'editorial/reviews/course-reading-publication-20261117.json':JSON.stringify({kind:'owner-authorized-internal-reading-release',date:'2026-11-17',authorization:{responsible:'Luciano Rodrigues Almeida',instruction:'Ok executar todos 49 para finalizar',scope:'Publicar49edições de leitura e prática sem converter horas históricas em carga certificada.'},scope:'Revisão interna assistida por IA da edição derivada; não é parecer externo, validação científica, habilitação profissional ou certificação.',externalReview:false,participantPilot:false,assistiveTechnologyTest:false,validatedHours:null,certificate:false,sourceDraftsRemainUnpublished:true,courses:evidence},null,2)+'\n',
  'docs/academy-49-reading-publication-20261117.md':['# Publicação das49edições de leitura e prática','Publicação autorizada pelo responsável. Revisão interna assistida por IA; sem parecer externo, pilotagem ou horas certificadas. As fontes editoriais conservam o estado de rascunho e as revisões formais pendentes.','As estimativas abaixo usam todo o corpo de leitura exportado, incluindo exemplos, respostas comentadas e referências, a200–250palavras/minuto. Excluem o tempo de realizar e rever as atividades. Não se atribuem60horas a todos nem se validam as horas históricas.','O leitor conserva os currículos históricos e o respetivo progresso. Produto, assinaturas, pagamentos e certificados existentes não são modificados. Os conteúdos completos são carregados no servidor após autorização; o catálogo público contém apenas título, âmbito, número de unidades e estimativa.','| Edição | Unidades | Leitura estimada |','| --- | ---: | ---: |',...metadata.map(m=>'| '+m.title+' | '+m.moduleCount+' | '+m.estimatedReadingMinutes.min+'–'+m.estimatedReadingMinutes.max+' min |'),'A aprovação interna da edição de leitura tem alcance delimitado, registado por curso em editorial/reviews/course-reading-publication-20261117.json. Não afirma domínio profissional, eficácia, revisão de especialista ou cumprimento das horas anunciadas no currículo antigo.','Os testes de publicação devem confirmar49edições/193unidades, escopo individual, conservação dos textos/atividades, vínculo aos produtos, bloqueio de acesso, ausência dos corpos nos ativos públicos, teclado e renderização móvel/desktop. Os resultados efetivamente observados serão registados no PR.','O curso Atendimento ao Cliente e o seu percurso opcional de60horas estimadas permanecem como estavam; o eBook não integra esta publicação.'].join('\n\n')+'\n',
 };
}
if(require.main===module){const outputs=generated();for(const [file,content]of Object.entries(outputs)){const target=path.join(ROOT,file);if(process.argv.includes('--check')){if(!fs.existsSync(target)||fs.readFileSync(target,'utf8')!==content)throw new Error('Stale release: '+file);}else{fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,content);}}console.log(JSON.stringify({courses:49,units:193,readingOnly:true,validatedHours:null,certificate:false,mode:process.argv.includes('--check')?'check':'generate'}));}
module.exports={makeReleases,generated,DISCLOSURE};

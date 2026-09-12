import type { PF, PFLocale, PFSlug } from "@/lib/professional-formations.catalog";

const labels={
 pt:{lesson:"Aula",objective:"Objetivo",question:"Pergunta central",concepts:"Conceitos e teoria",context:"Contexto",caseLabel:"Caso aplicado",critical:"Análise crítica",practice:"Atividade",errors:"Erros comuns e limites",synthesis:"Síntese",refs:"Referências"},
 en:{lesson:"Lesson",objective:"Objective",question:"Central question",concepts:"Concepts and theory",context:"Context",caseLabel:"Applied case",critical:"Critical analysis",practice:"Activity",errors:"Common errors and limits",synthesis:"Synthesis",refs:"References"},
 fr:{lesson:"Leçon",objective:"Objectif",question:"Question centrale",concepts:"Concepts et théorie",context:"Contexte",caseLabel:"Cas appliqué",critical:"Analyse critique",practice:"Activité",errors:"Erreurs fréquentes et limites",synthesis:"Synthèse",refs:"Références"},
 es:{lesson:"Clase",objective:"Objetivo",question:"Pregunta central",concepts:"Conceptos y teoría",context:"Contexto",caseLabel:"Caso aplicado",critical:"Análisis crítico",practice:"Actividad",errors:"Errores comunes y límites",synthesis:"Síntesis",refs:"Referencias"},
} as const;

const stages={
 pt:[
  ["vocabulário essencial e delimitação do campo","construa um glossário comentado e diferencie conceitos que costumam ser confundidos"],
  ["origens, contexto e evolução do tema","monte uma linha do tempo somente com marcos confirmados em fontes confiáveis"],
  ["modelos explicativos e critérios de comparação","compare duas abordagens sem declarar superioridade sem evidência"],
  ["problemas, necessidades e diagnóstico situacional","transforme um problema amplo em perguntas verificáveis e critérios observáveis"],
  ["processo, método e sequência de trabalho","desenhe um fluxo com entrada, decisão, execução, registro e revisão"],
  ["ferramentas e documentação profissional","crie um instrumento de registro adequado ao módulo e justifique cada campo"],
  ["caso aplicado: leitura inicial","mapeie fatos, lacunas de informação, atores e riscos antes de propor solução"],
  ["caso aplicado: alternativas e decisão","compare ao menos três alternativas usando critérios explícitos"],
  ["comunicação com público, cliente ou equipe","produza uma comunicação clara, ética e adequada ao contexto do módulo"],
  ["qualidade, indicadores e evidências","defina como verificar qualidade sem confundir atividade executada com resultado"],
  ["ética, consentimento, privacidade e limites","elabore um checklist de limites de atuação, consentimento e proteção de dados pertinente ao tema"],
  ["riscos, encaminhamento e situações de exceção","identifique sinais de risco e quando interromper, encaminhar ou buscar orientação especializada"],
  ["integração com operação, gestão e sustentabilidade","ligue o conteúdo a recursos, tempo, custos, organização e continuidade"],
  ["revisão crítica e melhoria","audite uma entrega anterior, localize fragilidades e produza uma versão corrigida"],
  ["aplicação ao projeto final","incorpore o módulo ao projeto final com evidências, critérios de avaliação e próximos passos"],
 ],
 en:[
  ["essential vocabulary and scope","build an annotated glossary and separate concepts that are commonly confused"],["origins, context and evolution","build a timeline using only milestones confirmed by reliable sources"],["explanatory models and comparison criteria","compare two approaches without claiming superiority without evidence"],["problems, needs and situational diagnosis","turn a broad problem into verifiable questions and observable criteria"],["process, method and workflow","design a workflow with input, decision, execution, record and review"],["tools and professional documentation","create a module-appropriate record and justify each field"],["applied case: initial reading","map facts, information gaps, stakeholders and risks before proposing a solution"],["applied case: alternatives and decision","compare at least three alternatives using explicit criteria"],["communication with audience, client or team","produce clear, ethical communication suited to the module context"],["quality, indicators and evidence","define how quality will be checked without confusing activity with outcomes"],["ethics, consent, privacy and boundaries","create a checklist for scope, consent and data protection relevant to the topic"],["risk, referral and exceptions","identify warning signs and when to stop, refer or seek specialized guidance"],["integration with operations, management and sustainability","connect learning to resources, time, costs, organization and continuity"],["critical review and improvement","audit an earlier deliverable, identify weaknesses and produce a corrected version"],["application to the final project","integrate the module into the final project with evidence, assessment criteria and next steps"],
 ],
 fr:[
  ["vocabulaire essentiel et délimitation du champ","construisez un glossaire commenté et distinguez les concepts souvent confondus"],["origines, contexte et évolution","construisez une chronologie avec des repères confirmés par des sources fiables"],["modèles explicatifs et critères de comparaison","comparez deux approches sans affirmer de supériorité sans preuve"],["problèmes, besoins et diagnostic de situation","transformez un problème général en questions vérifiables et critères observables"],["processus, méthode et séquence de travail","concevez un flux avec entrée, décision, exécution, traçabilité et révision"],["outils et documentation professionnelle","créez un support de traçabilité adapté au module et justifiez chaque champ"],["cas appliqué : lecture initiale","cartographiez faits, informations manquantes, acteurs et risques avant toute solution"],["cas appliqué : alternatives et décision","comparez au moins trois alternatives avec des critères explicites"],["communication avec public, client ou équipe","produisez une communication claire, éthique et adaptée au contexte"],["qualité, indicateurs et preuves","définissez comment vérifier la qualité sans confondre activité et résultat"],["éthique, consentement, confidentialité et limites","élaborez une checklist de limites, consentement et protection des données"],["risques, orientation et situations d’exception","identifiez les signaux d’alerte et quand interrompre, orienter ou demander un avis spécialisé"],["intégration à l’exploitation, gestion et durabilité","reliez l’apprentissage aux ressources, temps, coûts, organisation et continuité"],["révision critique et amélioration","auditez une production antérieure et produisez une version corrigée"],["application au projet final","intégrez le module au projet final avec preuves, critères d’évaluation et prochaines étapes"],
 ],
 es:[
  ["vocabulario esencial y delimitación del campo","crea un glosario comentado y separa conceptos que suelen confundirse"],["orígenes, contexto y evolución","crea una línea de tiempo con hitos confirmados por fuentes fiables"],["modelos explicativos y criterios de comparación","compara dos enfoques sin afirmar superioridad sin evidencia"],["problemas, necesidades y diagnóstico situacional","convierte un problema amplio en preguntas verificables y criterios observables"],["proceso, método y secuencia de trabajo","diseña un flujo con entrada, decisión, ejecución, registro y revisión"],["herramientas y documentación profesional","crea un registro adecuado al módulo y justifica cada campo"],["caso aplicado: lectura inicial","mapea hechos, lagunas de información, actores y riesgos antes de proponer soluciones"],["caso aplicado: alternativas y decisión","compara al menos tres alternativas mediante criterios explícitos"],["comunicación con público, cliente o equipo","produce una comunicación clara, ética y adecuada al contexto"],["calidad, indicadores y evidencias","define cómo verificar calidad sin confundir actividad con resultado"],["ética, consentimiento, privacidad y límites","crea una lista de control sobre límites, consentimiento y protección de datos"],["riesgo, derivación y excepciones","identifica señales de riesgo y cuándo detener, derivar o buscar orientación especializada"],["integración con operación, gestión y sostenibilidad","conecta el aprendizaje con recursos, tiempo, costes, organización y continuidad"],["revisión crítica y mejora","audita una entrega anterior, detecta debilidades y produce una versión corregida"],["aplicación al proyecto final","integra el módulo en el proyecto final con evidencias, criterios de evaluación y próximos pasos"],
 ],
} as const;

function specialRule(slug:PFSlug,locale:PFLocale){
 const rules:Partial<Record<PFSlug,Record<PFLocale,string>>>={
  "jornalismo-digital":{pt:"Verifique fatos, origem de documentos, contexto, direito de resposta e a separação entre notícia, análise e opinião.",en:"Verify facts, document provenance, context, right of reply, and the distinction between news, analysis and opinion.",fr:"Vérifiez les faits, l’origine des documents, le contexte, le droit de réponse et la distinction entre information, analyse et opinion.",es:"Verifica hechos, origen de documentos, contexto, derecho de respuesta y separación entre noticia, análisis y opinión."},
  "estetica-beleza":{pt:"Mantenha a atividade em práticas não invasivas e dentro dos limites profissionais aplicáveis.",en:"Keep the activity within non-invasive practices and applicable professional boundaries.",fr:"Maintenez l’activité dans les pratiques non invasives et les limites professionnelles applicables.",es:"Mantén la actividad en prácticas no invasivas y dentro de los límites profesionales aplicables."},
  "terapias-contemporaneas":{pt:"Não diagnostique nem substitua cuidado médico ou psicológico; priorize consentimento, risco e encaminhamento.",en:"Do not diagnose or replace medical or psychological care; prioritize consent, risk and referral.",fr:"Ne diagnostiquez pas et ne remplacez pas les soins médicaux ou psychologiques; privilégiez consentement, risque et orientation.",es:"No diagnostiques ni sustituyas atención médica o psicológica; prioriza consentimiento, riesgo y derivación."},
  "educacao-financeira":{pt:"Trate exemplos como educação financeira, nunca como recomendação individual de investimento.",en:"Treat examples as financial education, never individualized investment advice.",fr:"Traitez les exemples comme éducation financière, jamais comme conseil d’investissement individualisé.",es:"Trata los ejemplos como educación financiera, nunca como recomendación individual de inversión."},
  "mediacao-conflitos":{pt:"Diferencie formação livre de requisitos legais para mediação judicial e verifique a jurisdição aplicável.",en:"Distinguish non-degree training from legal requirements for court mediation and check the applicable jurisdiction.",fr:"Distinguez la formation libre des exigences légales de la médiation judiciaire et vérifiez les règles de la juridiction concernée.",es:"Diferencia la formación libre de los requisitos legales de mediación judicial y verifica la jurisdicción aplicable."},
 };
 return rules[slug]?.[locale]??(locale==="pt"?"Verifique fontes atuais quando uma decisão depender de regra legal, técnica ou profissional.":locale==="fr"?"Vérifiez les sources actuelles lorsqu’une décision dépend d’une règle légale, technique ou professionnelle.":locale==="es"?"Verifica fuentes actuales cuando una decisión dependa de una norma legal, técnica o profesional.":"Check current sources whenever a decision depends on a legal, technical or professional rule.");
}

export function buildProfessionalFormationLessons(f:PF,locale:PFLocale){
 const t=f.i18n[locale]??f.i18n.pt;
 const perModule=Math.max(1,Math.floor(f.lessons/f.modulesCount));
 const L=labels[locale],S=stages[locale];
 const join=(a:string,b:string)=>`${a}: ${b}`;
 return t.modules.map((moduleTitle,mi)=>({id:mi+1,title:moduleTitle,lessons:Array.from({length:perModule},(_,li)=>{
  const n=mi*perModule+li+1,[focus,task]=S[li%S.length];
  const previous=t.modules[Math.max(0,mi-1)],next=t.modules[Math.min(t.modules.length-1,mi+1)];
  return {
   id:`${f.slug}-m${mi+1}-l${li+1}`,
   title:`${L.lesson} ${n} · ${moduleTitle} — ${focus}`,
   summary:`${moduleTitle}: ${focus}.`,
   content:[
    join(L.objective,`${focus}; compreender o tema dentro de “${moduleTitle}” e produzir uma evidência de aprendizagem útil ao projeto “${t.project}”.`),
    join(L.question,`o que precisa ser compreendido, verificado ou decidido em “${moduleTitle}” quando o foco é ${focus}?`),
    join(L.concepts,`defina os termos centrais do módulo antes de aplicá-los; contraste conceitos próximos, registre pressupostos e diferencie fato, interpretação, hipótese e decisão profissional.`),
    join(L.context,`relacione “${moduleTitle}” ao percurso da formação. Recupere o que foi construído em “${previous}” e identifique o que esta aula prepara para “${next}”.`),
    join(L.caseLabel,`analise uma situação plausível centrada em “${moduleTitle}”. Liste fatos disponíveis, informação ausente, pessoas afetadas, restrições, riscos e critérios antes de escolher uma ação.`),
    join(L.critical,`compare alternativas e explicite vantagens, limites, efeitos não intencionais e evidências necessárias. Não transforme opinião, hábito de mercado ou preferência pessoal em regra universal.`),
    join(L.practice,`${task}. A entrega deve mencionar “${moduleTitle}”, os critérios utilizados, o que foi verificado e como poderá ser revisada.`),
    join(L.errors,`evite respostas genéricas, modelos copiados sem adaptação, dados sem fonte, promessas de resultado e extrapolação de competência. ${specialRule(f.slug,locale)}`),
    join(L.synthesis,`registre três aprendizados específicos de “${moduleTitle}”, uma decisão que você revisaria após esta aula e a conexão concreta com o projeto final.`),
    join(L.refs,`use somente fontes reais e verificáveis: livros de autores identificáveis, artigos acadêmicos, documentos técnicos e fontes oficiais pertinentes a “${moduleTitle}”. Registre autoria ou instituição, título e data; nunca invente referência para preencher a atividade.`),
   ],
  };
 }))}));
}

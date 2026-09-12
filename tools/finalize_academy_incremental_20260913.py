from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]

def replace(path, old, new, required=False):
    p=ROOT/path
    s=p.read_text(encoding='utf-8')
    if old not in s:
        if required: raise SystemExit(f'Missing required pattern in {path}: {old[:80]}')
        return False
    p.write_text(s.replace(old,new),encoding='utf-8')
    print('updated',path)
    return True

# 1) Public commercial copy: Do Mamão ao Negócio must not advertise live meetings.
p='apps/painel-ldr/src/components/training-launch-page.tsx'
repls={
'["6 encontros ao vivo", "São 2 por mês durante a primeira jornada. A participação é opcional e não bloqueia progresso nem certificado."]':'["Projetos práticos", "A formação inclui aplicação prática progressiva, registro das decisões e avaliação do projeto desenvolvido ao longo da jornada."]',
'liveTitle: "Encontros ao vivo: apoio, não obrigação"':'liveTitle: "Projetos práticos e avaliação"',
'liveText: "Os 6 encontros são espaços extras de conversa, dúvidas, empreendedorismo, networking e temas complementares. A presença não é obrigatória e não interfere na conclusão da formação."':'liveText: "A aprendizagem é consolidada por projetos práticos e avaliação de projetos, conectando pesquisa, teste, execução e revisão sem depender de encontros ao vivo."',
'["6 live meetings","Two per month. Participation is optional and does not block completion."]':'["Practical projects","The journey includes applied project work, documented decisions and project assessment throughout the training."]',
'liveTitle:"Live meetings: support, not obligation"':'liveTitle:"Practical projects and assessment"',
'liveText:"The 6 meetings are optional spaces for conversation, questions, networking and complementary entrepreneurship topics."':'liveText:"Learning is consolidated through practical projects and project assessment, connecting research, testing, execution and review without relying on live meetings."',
'["6 rencontres en direct","Deux par mois, facultatives et non bloquantes."]':'["Projets pratiques","Le parcours comprend des applications pratiques, la documentation des décisions et l’évaluation du projet développé."]',
'liveTitle:"Rencontres en direct : soutien, pas obligation"':'liveTitle:"Projets pratiques et évaluation"',
'liveText:"Les 6 rencontres sont facultatives et servent aux échanges, questions, networking et thèmes complémentaires."':'liveText:"L’apprentissage est consolidé par des projets pratiques et leur évaluation, reliant recherche, test, exécution et révision sans dépendre de rencontres en direct."',
'["6 encuentros en vivo","Dos por mes, opcionales y no bloquean la finalización."]':'["Proyectos prácticos","El recorrido incluye aplicación práctica, registro de decisiones y evaluación del proyecto desarrollado."]',
'liveTitle:"Encuentros en vivo: apoyo, no obligación"':'liveTitle:"Proyectos prácticos y evaluación"',
'liveText:"Los 6 encuentros son opcionales y sirven para conversar, resolver dudas, hacer networking y tratar temas complementarios."':'liveText:"El aprendizaje se consolida mediante proyectos prácticos y evaluación de proyectos, conectando investigación, prueba, ejecución y revisión sin depender de encuentros en vivo."',
'<span className="rounded-full bg-white/10 px-3 py-2">6 encontros opcionais</span>':'<span className="rounded-full bg-white/10 px-3 py-2">Projetos práticos</span>',
'materiais e gravações quantas vezes quiser':'materiais e atividades quantas vezes quiser',
'materials and recordings without repurchasing':'materials and activities without repurchasing',
'les supports et les enregistrements restent accessibles':'les supports et les activités restent accessibles',
'materiales y grabaciones pueden revisarse':'materiales y actividades pueden revisarse',
}
for a,b in repls.items(): replace(p,a,b)

# 2) Library sales cards: only the designated Psychoanalysis + Autism + International Practice offer may advertise six live meetings.
p='apps/painel-ldr/src/lib/library-sales-card-i18n.ts'
repls={
'["🌍 INTERNACIONAL · PREMIUM","Psicanálise Internacional, Neurodiversidade e Autismo","21 módulos · 6–12 meses · 2 encontros ao vivo/mês · fora da assinatura"]':'["🌍 INTERNACIONAL · PREMIUM","Psicanálise Internacional, Neurodiversidade e Autismo","21 módulos · 6–12 meses · 100% online · projetos e avaliação · fora da assinatura"]',
'["🌍 INTERNATIONAL · PREMIUM","International Psychoanalysis, Neurodiversity and Autism","21 modules · 6–12 months · 2 live meetings/month · outside subscription"]':'["🌍 INTERNATIONAL · PREMIUM","International Psychoanalysis, Neurodiversity and Autism","21 modules · 6–12 months · 100% online · projects and assessment · outside subscription"]',
'["🌍 INTERNATIONAL · PREMIUM","Psychanalyse internationale, neurodiversité et autisme","21 modules · 6–12 mois · 2 rencontres en direct/mois · hors abonnement"]':'["🌍 INTERNATIONAL · PREMIUM","Psychanalyse internationale, neurodiversité et autisme","21 modules · 6–12 mois · 100% en ligne · projets et évaluation · hors abonnement"]',
'["🌍 INTERNACIONAL · PREMIUM","Psicoanálisis Internacional, Neurodiversidad y Autismo","21 módulos · 6–12 meses · 2 encuentros en vivo/mes · fuera de suscripción"]':'["🌍 INTERNACIONAL · PREMIUM","Psicoanálisis Internacional, Neurodiversidad y Autismo","21 módulos · 6–12 meses · 100% online · proyectos y evaluación · fuera de suscripción"]',
'["PSYCHOANALYSIS","Online Psychoanalysis Training","14 modules · 1,200 hours · 220 units · 6 live meetings"]':'["PSYCHOANALYSIS","Psychoanalysis Training with Emphasis on Autism and International Practice","15 modules · 1,200 hours · 240 units · 6 live meetings"]',
'["PSYCHANALYSE","Formation en Ligne en Psychanalyse","14 modules · 1 200 heures · 220 unités · 6 rencontres en direct"]':'["PSYCHANALYSE","Formation en Psychanalyse avec Accent sur l’Autisme et la Pratique Internationale","15 modules · 1 200 heures · 240 unités · 6 rencontres en direct"]',
'["PSICOANÁLISIS","Formación Online en Psicoanálisis","14 módulos · 1.200 horas · 220 unidades · 6 encuentros en vivo"]':'["PSICOANÁLISIS","Formación en Psicoanálisis con Énfasis en Autismo y Actuación Internacional","15 módulos · 1.200 horas · 240 unidades · 6 encuentros en vivo"]',
}
for a,b in repls.items(): replace(p,a,b)

# 3) Remove commercial live-meeting promises from Brief Psychoanalytic Therapy public-facing copy.
for p in [
 'apps/painel-ldr/src/components/brief-therapy-training-page.tsx',
 'apps/painel-ldr/src/routes/_clientarea.cliente.treinamentos.terapia-breve-psicanalitica.tsx',
 'apps/painel-ldr/src/lib/brief-therapy-commerce.server.ts',
]:
    replace(p,'6 encontros ao vivo','projetos práticos e avaliação de projetos')
    replace(p,'6 live meetings','practical projects and project assessment')
    replace(p,'6 rencontres en direct','projets pratiques et évaluation de projets')
    replace(p,'6 encuentros en vivo','proyectos prácticos y evaluación de proyectos')

# 4) Replace generic repeated lesson generation with module-aware, lesson-specific learning design.
p=ROOT/'apps/painel-ldr/src/lib/professional-formations.catalog.ts'
s=p.read_text(encoding='utf-8')
start=s.index('export function buildLessons(f:PF,locale:PFLocale){')
new=r'''export function buildLessons(f:PF,locale:PFLocale){
 const t=pfText(f,locale),perModule=Math.max(1,Math.floor(f.lessons/f.modulesCount));
 const L={
  pt:{lesson:"Aula",objective:"Objetivo",question:"Pergunta central",concepts:"Conceitos e teoria",context:"Contexto",caseLabel:"Caso aplicado",critical:"Análise crítica",practice:"Atividade",errors:"Erros comuns e limites",synthesis:"Síntese",refs:"Referências"},
  en:{lesson:"Lesson",objective:"Objective",question:"Central question",concepts:"Concepts and theory",context:"Context",caseLabel:"Applied case",critical:"Critical analysis",practice:"Activity",errors:"Common errors and limits",synthesis:"Synthesis",refs:"References"},
  fr:{lesson:"Leçon",objective:"Objectif",question:"Question centrale",concepts:"Concepts et théorie",context:"Contexte",caseLabel:"Cas appliqué",critical:"Analyse critique",practice:"Activité",errors:"Erreurs fréquentes et limites",synthesis:"Synthèse",refs:"Références"},
  es:{lesson:"Clase",objective:"Objetivo",question:"Pregunta central",concepts:"Conceptos y teoría",context:"Contexto",caseLabel:"Caso aplicado",critical:"Análisis crítico",practice:"Actividad",errors:"Errores comunes y límites",synthesis:"Síntesis",refs:"Referencias"}
 }[locale];
 const stages={
  pt:[
   ["vocabulário essencial e delimitação do campo","construir um glossário comentado e separar conceitos que costumam ser confundidos"],
   ["origens, contexto e evolução do tema","montar uma linha do tempo apenas com marcos confirmados em fontes confiáveis"],
   ["modelos explicativos e critérios de comparação","comparar duas abordagens sem declarar superioridade sem evidência"],
   ["problemas, necessidades e diagnóstico situacional","transformar um problema amplo em perguntas verificáveis e critérios observáveis"],
   ["processo, método e sequência de trabalho","desenhar um fluxo de trabalho com entrada, decisão, execução e revisão"],
   ["ferramentas e documentação profissional","criar um instrumento de registro adequado ao módulo e justificar cada campo"],
   ["caso aplicado: leitura inicial","mapear fatos, lacunas de informação, atores e riscos antes de propor qualquer solução"],
   ["caso aplicado: alternativas e decisão","comparar pelo menos três alternativas usando critérios explícitos"],
   ["comunicação com público, cliente ou equipe","produzir uma comunicação clara, ética e adequada ao contexto do módulo"],
   ["qualidade, indicadores e evidências","definir como verificar qualidade sem confundir atividade executada com resultado alcançado"],
   ["ética, consentimento, privacidade e limites","elaborar um checklist de limites de atuação, consentimento e proteção de dados pertinente ao tema"],
   ["riscos, encaminhamento e situações de exceção","identificar sinais de risco e quando interromper, encaminhar ou buscar orientação especializada"],
   ["integração com operação, gestão e sustentabilidade","ligar a aprendizagem a recursos, tempo, custos, organização e continuidade"],
   ["revisão crítica e melhoria","auditar uma entrega anterior, localizar fragilidades e produzir uma versão corrigida"],
   ["aplicação ao projeto final","incorporar o módulo ao projeto final com evidências, critérios de avaliação e próximos passos"]
  ],
  en:[
   ["essential vocabulary and scope","build an annotated glossary and separate concepts that are commonly confused"],["origins, context and evolution","build a timeline using only milestones confirmed by reliable sources"],["explanatory models and comparison criteria","compare two approaches without claiming superiority without evidence"],["problems, needs and situational diagnosis","turn a broad problem into verifiable questions and observable criteria"],["process, method and workflow","design a workflow with input, decision, execution and review"],["tools and professional documentation","create a module-appropriate record and justify each field"],["applied case: initial reading","map facts, information gaps, stakeholders and risks before proposing a solution"],["applied case: alternatives and decision","compare at least three alternatives using explicit criteria"],["communication with audience, client or team","produce clear, ethical communication suited to the module context"],["quality, indicators and evidence","define how quality will be checked without confusing activity with outcomes"],["ethics, consent, privacy and boundaries","create a checklist for scope, consent and data protection relevant to the topic"],["risk, referral and exceptions","identify warning signs and when to stop, refer or seek specialized guidance"],["integration with operations, management and sustainability","connect learning to resources, time, costs, organization and continuity"],["critical review and improvement","audit an earlier deliverable, identify weaknesses and produce a corrected version"],["application to the final project","integrate the module into the final project with evidence, assessment criteria and next steps"]
  ],
  fr:[
   ["vocabulaire essentiel et délimitation du champ","construire un glossaire commenté et distinguer les concepts souvent confondus"],["origines, contexte et évolution","construire une chronologie avec des repères confirmés par des sources fiables"],["modèles explicatifs et critères de comparaison","comparer deux approches sans affirmer de supériorité sans preuve"],["problèmes, besoins et diagnostic de situation","transformer un problème général en questions vérifiables et critères observables"],["processus, méthode et séquence de travail","concevoir un flux avec entrée, décision, exécution et révision"],["outils et documentation professionnelle","créer un support de traçabilité adapté au module et justifier chaque champ"],["cas appliqué : lecture initiale","cartographier faits, informations manquantes, acteurs et risques avant toute solution"],["cas appliqué : alternatives et décision","comparer au moins trois alternatives avec des critères explicites"],["communication avec public, client ou équipe","produire une communication claire, éthique et adaptée au contexte"],["qualité, indicateurs et preuves","définir comment vérifier la qualité sans confondre activité et résultat"],["éthique, consentement, confidentialité et limites","élaborer une checklist de limites, consentement et protection des données"],["risques, orientation et situations d’exception","identifier les signaux d’alerte et quand interrompre, orienter ou demander un avis spécialisé"],["intégration à l’exploitation, gestion et durabilité","relier l’apprentissage aux ressources, temps, coûts, organisation et continuité"],["révision critique et amélioration","auditer une production antérieure et produire une version corrigée"],["application au projet final","intégrer le module au projet final avec preuves, critères d’évaluation et prochaines étapes"]
  ],
  es:[
   ["vocabulario esencial y delimitación del campo","crear un glosario comentado y separar conceptos que suelen confundirse"],["orígenes, contexto y evolución","crear una línea de tiempo con hitos confirmados por fuentes fiables"],["modelos explicativos y criterios de comparación","comparar dos enfoques sin afirmar superioridad sin evidencia"],["problemas, necesidades y diagnóstico situacional","convertir un problema amplio en preguntas verificables y criterios observables"],["proceso, método y secuencia de trabajo","diseñar un flujo con entrada, decisión, ejecución y revisión"],["herramientas y documentación profesional","crear un registro adecuado al módulo y justificar cada campo"],["caso aplicado: lectura inicial","mapear hechos, lagunas de información, actores y riesgos antes de proponer soluciones"],["caso aplicado: alternativas y decisión","comparar al menos tres alternativas mediante criterios explícitos"],["comunicación con público, cliente o equipo","producir una comunicación clara, ética y adecuada al contexto"],["calidad, indicadores y evidencias","definir cómo verificar calidad sin confundir actividad con resultado"],["ética, consentimiento, privacidad y límites","crear una lista de control sobre límites, consentimiento y protección de datos"],["riesgo, derivación y excepciones","identificar señales de riesgo y cuándo detener, derivar o buscar orientación especializada"],["integración con operación, gestión y sostenibilidad","conectar el aprendizaje con recursos, tiempo, costes, organización y continuidad"],["revisión crítica y mejora","auditar una entrega anterior, detectar debilidades y producir una versión corregida"],["aplicación al proyecto final","integrar el módulo en el proyecto final con evidencias, criterios de evaluación y próximos pasos"]
  ]
 }[locale];
 const special:Partial<Record<PFSlug,string>>={
  "jornalismo-digital":locale==="pt"?"Verifique fatos, origem dos documentos, contexto, direito de resposta e separação entre notícia, análise e opinião.":locale==="fr"?"Vérifiez les faits, l’origine des documents, le contexte, le droit de réponse et la distinction entre information, analyse et opinion.":locale==="es"?"Verifica hechos, origen de documentos, contexto, derecho de respuesta y separación entre noticia, análisis y opinión.":"Verify facts, document provenance, context, right of reply, and the distinction between news, analysis and opinion.",
  "estetica-beleza":locale==="pt"?"Mantenha a atividade em práticas não invasivas e dentro dos limites profissionais aplicáveis.":locale==="fr"?"Maintenez l’activité dans les pratiques non invasives et les limites professionnelles applicables.":locale==="es"?"Mantén la actividad en prácticas no invasivas y dentro de los límites profesionales aplicables.":"Keep the activity within non-invasive practices and applicable professional boundaries.",
  "terapias-contemporaneas":locale==="pt"?"Não diagnostique nem substitua cuidado médico ou psicológico; priorize consentimento, risco e encaminhamento.":locale==="fr"?"Ne diagnostiquez pas et ne remplacez pas les soins médicaux ou psychologiques; privilégiez consentement, risque et orientation.":locale==="es"?"No diagnostiques ni sustituyas atención médica o psicológica; prioriza consentimiento, riesgo y derivación.":"Do not diagnose or replace medical or psychological care; prioritize consent, risk and referral.",
  "educacao-financeira":locale==="pt"?"Trate exemplos como educação financeira, nunca como recomendação individual de investimento.":locale==="fr"?"Traitez les exemples comme éducation financière, jamais comme conseil d’investissement individualisé.":locale==="es"?"Trata los ejemplos como educación financiera, nunca como recomendación individual de inversión.":"Treat examples as financial education, never individualized investment advice.",
  "mediacao-conflitos":locale==="pt"?"Diferencie formação livre de requisitos legais para mediação judicial e verifique regras da jurisdição aplicável.":locale==="fr"?"Distinguez la formation libre des exigences légales de la médiation judiciaire et vérifiez les règles de la juridiction concernée.":locale==="es"?"Diferencia la formación libre de los requisitos legales de mediación judicial y verifica la jurisdicción aplicable.":"Distinguish non-degree training from legal requirements for court mediation and check the applicable jurisdiction."
 };
 const join=(a:string,b:string)=>`${a}: ${b}`;
 return t.modules.map((moduleTitle,mi)=>({id:mi+1,title:moduleTitle,lessons:Array.from({length:perModule},(_,li)=>{
  const n=mi*perModule+li+1;
  const [focus,task]=stages[li%stages.length];
  const next=t.modules[Math.min(mi+1,t.modules.length-1)];
  const prev=t.modules[Math.max(mi-1,0)];
  const title=`${L.lesson} ${n} · ${moduleTitle} — ${focus}`;
  const content=[
   join(L.objective,`${focus}: compreender o tema dentro de “${moduleTitle}” e produzir uma evidência de aprendizagem útil ao projeto “${t.project}”.`),
   join(L.question,`o que precisa ser compreendido, verificado ou decidido em “${moduleTitle}” quando o foco é ${focus}?`),
   join(L.concepts,`defina os termos centrais do módulo antes de aplicá-los; contraste conceitos próximos, registre pressupostos e diferencie fato, interpretação, hipótese e decisão profissional.`),
   join(L.context,`relacione “${moduleTitle}” ao percurso da formação. Recupere o que foi construído em “${prev}” e identifique o que esta aula prepara para “${next}”.`),
   join(L.caseLabel,`analise uma situação plausível centrada em “${moduleTitle}”. Liste fatos disponíveis, informação ausente, pessoas afetadas, restrições, riscos e critérios antes de escolher uma ação.`),
   join(L.critical,`compare alternativas e explicite vantagens, limites, efeitos não intencionais e evidências necessárias. Não transforme opinião, hábito de mercado ou preferência pessoal em regra universal.`),
   join(L.practice,`${task}. A entrega deve mencionar “${moduleTitle}”, os critérios utilizados, o que foi verificado e como poderá ser revisada.`),
   join(L.errors,`evite respostas genéricas, modelos copiados sem adaptação, dados sem fonte, promessas de resultado e extrapolação de competência. ${special[f.slug]??"Verifique fontes atuais quando a decisão depender de regra legal, técnica ou profissional."}`),
   join(L.synthesis,`registre três aprendizados específicos de “${moduleTitle}”, uma decisão que você revisaria após esta aula e a conexão concreta com o projeto final.`),
   join(L.refs,`use somente fontes reais e verificáveis: livros de autores identificáveis, artigos acadêmicos, documentos técnicos e fontes oficiais pertinentes a “${moduleTitle}”. Registre autoria/instituição, título e data; nunca invente referência para preencher a atividade.`)
  ];
  return{id:`${f.slug}-m${mi+1}-l${li+1}`,title,summary:`${moduleTitle}: ${focus}.`,content};
 })}));
}
'''
p.write_text(s[:start]+new,encoding='utf-8')
print('updated',p.relative_to(ROOT))

# Simple invariant checks before build.
cat=(ROOT/'apps/painel-ldr/src/lib/professional-formations.catalog.ts').read_text(encoding='utf-8')
for slug in ['jornalismo-digital','estetica-beleza','terapias-contemporaneas','copywriting-vendas','educacao-financeira','mediacao-conflitos']:
    assert f'slug:"{slug}"' in cat, slug
assert 'priceBrlCents:29999' in cat and 'priceEurCents:4990' in cat
assert 'includedInSubscription:false' in cat
print('academy invariants OK')

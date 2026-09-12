import { Link } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, BookOpen, CheckCircle2, Clock3, GraduationCap, MessageCircle, Sparkles, UsersRound, Video } from "lucide-react";
import { LanguageSelect, useI18n } from "@/lib/i18n";

const PANEL = "https://painel.ldrrhestrategia.com";

const COPY = {
  pt: {
    badge: "LANÇAMENTO · 50% OFF · PRIMEIROS 100 ALUNOS",
    title: "Do Mamão ao Negócio",
    lead: "Uma formação prática de 3 meses para transformar ideia, pesquisa, teste e execução em um projeto de negócio mais claro e aplicável.",
    normal: "Valor normal",
    launch: "Valor de lançamento",
    brNormal: "R$ 599,99",
    euNormal: "€ 100,56",
    brLaunch: "R$ 299,99",
    euLaunch: "€ 49,90",
    note: "Pagamento único · acesso vitalício · sem assinatura",
    cta: "COMEÇAR MINHA FORMAÇÃO",
    login: "JÁ TENHO ACESSO",
    howTitle: "Como funciona sua formação",
    howIntro: "O conteúdo não é liberado de uma vez. A jornada foi desenhada para durar 3 meses reais e estimular pesquisa, teste, aplicação e revisão.",
    cards: [
      ["3 meses · 300 horas", "A formação oficial dura no mínimo 90 dias. O acesso ao conteúdo permanece vitalício depois disso."],
      ["1 nova pergunta por dia", "Todos os dias uma nova etapa é liberada. Perguntas futuras permanecem bloqueadas até a data correspondente."],
      ["Escolha + resposta escrita", "Cada atividade pede uma escolha objetiva e também uma resposta em texto para justificar, pesquisar, testar e registrar o aprendizado."],
      ["Revisar e corrigir", "Perguntas já liberadas podem ser revistas. O aluno pode editar e melhorar suas respostas conforme testa a ideia no mundo real."],
      ["Projetos práticos", "A formação inclui aplicação prática progressiva, registro das decisões e avaliação do projeto desenvolvido ao longo da jornada."],
      ["1 projeto com avaliação", "Após 90 dias, o aluno pode enviar um projeto oficial. A primeira avaliação individual está incluída na compra."],
    ],
    monthsTitle: "Uma jornada em 3 ciclos",
    months: [
      ["Mês 1 · Fundamentos e diagnóstico", "Problema, cliente, contexto, proposta, pesquisa, posicionamento e clareza de negócio."],
      ["Mês 2 · Construção e validação", "Oferta, preço, canais, testes, comunicação, operação, custos e validação com pessoas reais."],
      ["Mês 3 · Execução e projeto final", "Plano de ação, primeiros clientes, ajustes, indicadores, organização e consolidação do projeto."],
    ],
    liveTitle: "Projetos práticos e avaliação",
    liveText: "A aprendizagem é consolidada por projetos práticos e avaliação de projetos, conectando pesquisa, teste, execução e revisão sem depender de encontros ao vivo.",
    projectTitle: "Projeto final com devolutiva humana",
    projectText: "Depois dos 90 dias, o aluno envia o projeto pela plataforma. A equipe analisa, registra correções e devolve o feedback dentro da própria área do aluno. Uma avaliação está incluída. Avaliações adicionais custam R$ 179,90 ou € 29,90 cada.",
    lifetimeTitle: "Depois dos 3 meses, o acesso continua",
    lifetimeText: "O aluno pode rever aulas, perguntas, respostas, materiais e atividades quantas vezes quiser. Não precisa recomprar o treinamento.",
    finalCta: "QUERO GARANTIR O VALOR DE LANÇAMENTO",
  },
  en: {
    badge: "LAUNCH · 50% OFF · FIRST 100 STUDENTS", title: "From Papaya to Business", lead: "A practical 3-month journey to turn research, testing and execution into a clearer business project.", normal: "Regular price", launch: "Launch price", brNormal: "R$ 599.99", euNormal: "€100.56", brLaunch: "R$ 299.99", euLaunch: "€49.90", note: "One-time payment · lifetime access · no subscription", cta: "START MY TRAINING", login: "I ALREADY HAVE ACCESS", howTitle: "How the training works", howIntro: "Content is not released all at once. The journey lasts 3 real months and encourages research, testing, application and review.",
    cards: [["3 months · 300 hours","Official completion requires at least 90 days, with lifetime content access afterwards."],["1 new question per day","A new step unlocks daily while future questions remain locked."],["Choice + written answer","Each activity requires an objective choice and a written justification."],["Review and improve","Unlocked questions can be revisited and answers improved after real-world testing."],["Practical projects","The journey includes applied project work, documented decisions and project assessment throughout the training."],["1 reviewed business project","After 90 days, one individual project review is included."]],
    monthsTitle:"Three learning cycles", months:[["Month 1 · Foundations and diagnosis","Problem, customer, context, research and positioning."],["Month 2 · Building and validation","Offer, price, channels, testing, communication and costs."],["Month 3 · Execution and final project","Action plan, first customers, metrics and project consolidation."]], liveTitle:"Practical projects and assessment", liveText:"Learning is consolidated through practical projects and project assessment, connecting research, testing, execution and review without relying on live meetings.", projectTitle:"Final project with human feedback", projectText:"After 90 days, the student submits the project in the platform and receives corrections and feedback. One review is included; extra reviews cost R$179.90 or €29.90.", lifetimeTitle:"Lifetime access after the 3 months", lifetimeText:"Students can revisit content, questions, materials and activities without repurchasing.", finalCta:"GET THE LAUNCH PRICE"
  },
  fr: {
    badge:"LANCEMENT · -50% · 100 PREMIERS ÉLÈVES", title:"De la Papaye à l’Entreprise", lead:"Une formation pratique de 3 mois pour transformer recherche, test et exécution en projet d’entreprise plus clair.", normal:"Prix normal", launch:"Prix de lancement", brNormal:"R$ 599,99", euNormal:"100,56 €", brLaunch:"R$ 299,99", euLaunch:"49,90 €", note:"Paiement unique · accès à vie · sans abonnement", cta:"COMMENCER MA FORMATION", login:"J’AI DÉJÀ ACCÈS", howTitle:"Comment fonctionne la formation", howIntro:"Le contenu n’est pas libéré d’un seul coup. Le parcours dure 3 mois réels et encourage recherche, test, application et révision.",
    cards:[["3 mois · 300 heures","La validation officielle demande au moins 90 jours, puis l’accès reste à vie."],["1 nouvelle question par jour","Une nouvelle étape est libérée chaque jour; les suivantes restent bloquées."],["Choix + réponse écrite","Chaque activité demande un choix et une justification écrite."],["Réviser et corriger","Les questions débloquées peuvent être revues et améliorées."],["Projets pratiques","Le parcours comprend des applications pratiques, la documentation des décisions et l’évaluation du projet développé."],["1 projet évalué","Après 90 jours, une première évaluation individuelle est incluse."]],
    monthsTitle:"Trois cycles", months:[["Mois 1 · Fondamentaux et diagnostic","Problème, client, contexte, recherche et positionnement."],["Mois 2 · Construction et validation","Offre, prix, canaux, tests, communication et coûts."],["Mois 3 · Exécution et projet final","Plan d’action, premiers clients, indicateurs et consolidation."]], liveTitle:"Projets pratiques et évaluation", liveText:"L’apprentissage est consolidé par des projets pratiques et leur évaluation, reliant recherche, test, exécution et révision sans dépendre de rencontres en direct.", projectTitle:"Projet final avec retour humain", projectText:"Après 90 jours, le projet est envoyé dans la plateforme pour correction et feedback. Une évaluation est incluse; les suivantes coûtent R$ 179,90 ou 29,90 €.", lifetimeTitle:"Accès à vie après les 3 mois", lifetimeText:"Le contenu, les questions, les supports et les activités restent accessibles sans nouvel achat.", finalCta:"PROFITER DU PRIX DE LANCEMENT"
  },
  es: {
    badge:"LANZAMIENTO · 50% OFF · PRIMEROS 100 ALUMNOS", title:"De la Papaya al Negocio", lead:"Una formación práctica de 3 meses para convertir investigación, prueba y ejecución en un proyecto de negocio más claro.", normal:"Precio normal", launch:"Precio de lanzamiento", brNormal:"R$ 599,99", euNormal:"€ 100,56", brLaunch:"R$ 299,99", euLaunch:"€ 49,90", note:"Pago único · acceso vitalicio · sin suscripción", cta:"EMPEZAR MI FORMACIÓN", login:"YA TENGO ACCESO", howTitle:"Cómo funciona la formación", howIntro:"El contenido no se libera todo de una vez. El recorrido dura 3 meses reales y fomenta investigación, prueba, aplicación y revisión.",
    cards:[["3 meses · 300 horas","La finalización oficial exige al menos 90 días y luego el acceso sigue siendo vitalicio."],["1 nueva pregunta por día","Cada día se desbloquea una nueva etapa y las futuras permanecen bloqueadas."],["Elección + respuesta escrita","Cada actividad exige una opción objetiva y una justificación escrita."],["Revisar y corregir","Las preguntas desbloqueadas se pueden revisar y mejorar."],["Proyectos prácticos","El recorrido incluye aplicación práctica, registro de decisiones y evaluación del proyecto desarrollado."],["1 proyecto evaluado","Después de 90 días, una evaluación individual está incluida."]],
    monthsTitle:"Tres ciclos", months:[["Mes 1 · Fundamentos y diagnóstico","Problema, cliente, contexto, investigación y posicionamiento."],["Mes 2 · Construcción y validación","Oferta, precio, canales, pruebas, comunicación y costes."],["Mes 3 · Ejecución y proyecto final","Plan de acción, primeros clientes, métricas y consolidación."]], liveTitle:"Proyectos prácticos y evaluación", liveText:"El aprendizaje se consolida mediante proyectos prácticos y evaluación de proyectos, conectando investigación, prueba, ejecución y revisión sin depender de encuentros en vivo.", projectTitle:"Proyecto final con devolución humana", projectText:"Tras 90 días, el alumno envía el proyecto en la plataforma y recibe correcciones y feedback. Una evaluación está incluida; las adicionales cuestan R$ 179,90 o € 29,90.", lifetimeTitle:"Acceso vitalicio después de los 3 meses", lifetimeText:"El contenido, preguntas, materiales y actividades pueden revisarse sin volver a comprar.", finalCta:"QUIERO EL PRECIO DE LANZAMIENTO"
  }
} as const;

export function TrainingLaunchPage() {
  const { locale } = useI18n();
  const c = COPY[locale];
  return <div className="min-h-screen bg-[#fffaf2] text-[#33111c]">
    <header className="border-b border-[#d7ad54]/40 bg-[#5b0824] text-white"><div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6"><Link to="/" className="font-serif text-xl font-bold">Grupo LDR Essence</Link><LanguageSelect/></div></header>
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <section className="overflow-hidden rounded-[2rem] border border-[#d7ad54] bg-[#5b0824] text-white shadow-2xl shadow-[#5b0824]/15"><div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-[1.25fr_.75fr] lg:items-center"><div><div className="inline-flex items-center gap-2 rounded-full bg-[#d7ad54] px-3 py-1.5 text-xs font-black uppercase tracking-[.14em] text-[#44101d]"><Sparkles className="h-4 w-4"/>{c.badge}</div><h1 className="mt-5 max-w-3xl font-serif text-4xl font-bold leading-tight sm:text-6xl">{c.title}</h1><p className="mt-4 max-w-2xl text-base leading-7 text-[#f5e8dd] sm:text-lg">{c.lead}</p><div className="mt-6 flex flex-wrap gap-2 text-sm font-bold"><span className="rounded-full bg-white/10 px-3 py-2">3 meses</span><span className="rounded-full bg-white/10 px-3 py-2">300 horas</span><span className="rounded-full bg-white/10 px-3 py-2">Acesso vitalício</span><span className="rounded-full bg-white/10 px-3 py-2">Projetos práticos</span></div></div><div className="rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur"><p className="text-xs font-black uppercase tracking-[.16em] text-[#edcc80]">{c.normal}</p><div className="mt-2 flex flex-wrap gap-3 text-sm opacity-70"><span className="line-through">{c.brNormal}</span><span className="line-through">{c.euNormal}</span></div><p className="mt-5 text-xs font-black uppercase tracking-[.16em] text-[#edcc80]">{c.launch}</p><div className="mt-2 grid gap-1"><strong className="text-4xl">{c.brLaunch}</strong><strong className="text-2xl text-[#f2d38b]">{c.euLaunch}</strong></div><p className="mt-3 text-xs opacity-80">{c.note}</p><a href={`${PANEL}/cliente/biblioteca`} className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#d7ad54] px-5 py-3 text-center text-sm font-black text-[#42111d] shadow-lg">{c.cta}<ArrowRight className="h-4 w-4"/></a><a href={`${PANEL}/cliente/login`} className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-2xl border border-white/25 px-5 py-3 text-center text-sm font-black">{c.login}</a></div></div></section>

      <section className="mt-8"><div className="max-w-3xl"><p className="text-xs font-black uppercase tracking-[.16em] text-[#9d711b]">FORMAÇÃO GUIADA</p><h2 className="mt-2 font-serif text-3xl sm:text-4xl">{c.howTitle}</h2><p className="mt-3 leading-7 text-[#6a5960]">{c.howIntro}</p></div><div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{c.cards.map(([title,text],i)=><article key={title} className="rounded-3xl border border-[#ead3a2] bg-white p-5 shadow-sm"><div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#5b0824] text-[#f1d18b]">{i===0?<Clock3 className="h-5 w-5"/>:i===1?<BookOpen className="h-5 w-5"/>:i===2?<MessageCircle className="h-5 w-5"/>:i===3?<CheckCircle2 className="h-5 w-5"/>:i===4?<Video className="h-5 w-5"/>:<GraduationCap className="h-5 w-5"/>}</div><h3 className="mt-4 font-serif text-xl font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-[#6a5960]">{text}</p></article>)}</div></section>

      <section className="mt-8 rounded-[2rem] border border-[#ead3a2] bg-white p-6 sm:p-8"><h2 className="font-serif text-3xl">{c.monthsTitle}</h2><div className="mt-5 grid gap-4 lg:grid-cols-3">{c.months.map(([title,text])=><div key={title} className="rounded-2xl bg-[#fff4df] p-5"><h3 className="font-bold text-[#6a0c2a]">{title}</h3><p className="mt-2 text-sm leading-6 text-[#6a5960]">{text}</p></div>)}</div></section>

      <section className="mt-8 grid gap-4 lg:grid-cols-3"><article className="rounded-3xl border border-[#ead3a2] bg-white p-6"><UsersRound className="h-6 w-6 text-[#6a0c2a]"/><h2 className="mt-4 font-serif text-2xl">{c.liveTitle}</h2><p className="mt-3 text-sm leading-6 text-[#6a5960]">{c.liveText}</p></article><article className="rounded-3xl border border-[#ead3a2] bg-white p-6"><BadgeCheck className="h-6 w-6 text-[#6a0c2a]"/><h2 className="mt-4 font-serif text-2xl">{c.projectTitle}</h2><p className="mt-3 text-sm leading-6 text-[#6a5960]">{c.projectText}</p></article><article className="rounded-3xl border border-[#ead3a2] bg-white p-6"><GraduationCap className="h-6 w-6 text-[#6a0c2a]"/><h2 className="mt-4 font-serif text-2xl">{c.lifetimeTitle}</h2><p className="mt-3 text-sm leading-6 text-[#6a5960]">{c.lifetimeText}</p></article></section>

      <section className="mt-8 rounded-[2rem] bg-[#5b0824] p-7 text-center text-white sm:p-10"><p className="text-sm font-black uppercase tracking-[.16em] text-[#e8c873]">50% OFF · PRIMEIROS 100 ALUNOS</p><h2 className="mt-3 font-serif text-3xl sm:text-4xl">{c.brLaunch} · {c.euLaunch}</h2><a href={`${PANEL}/cliente/biblioteca`} className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#d7ad54] px-6 py-3 text-sm font-black text-[#42111d]">{c.finalCta}<ArrowRight className="h-4 w-4"/></a></section>
    </main>
  </div>;
}

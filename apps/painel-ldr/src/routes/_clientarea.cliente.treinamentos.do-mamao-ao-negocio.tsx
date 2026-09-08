import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowLeft, BookOpen, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight,
  FileCheck2, GraduationCap, HelpCircle, MessageCircle, Moon, Settings2,
  Sun, Video,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  clientCreateDoMamaoProjectReviewCheckout,
  clientDoMamaoTrainingExperience,
  clientSaveDoMamaoTrainingState,
  clientSubmitDoMamaoProject,
} from "@/lib/training-commerce.functions";
import { clientAddLibraryComment, clientLearningHub } from "@/lib/learning.functions";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_clientarea/cliente/treinamentos/do-mamao-ao-negocio")({
  component: DoMamaoTraining,
});

type Locale = "pt" | "en" | "fr" | "es";
type Area = "inicio" | "trilha" | "projeto" | "encontros" | "ajuda";
type Step = { month: 1 | 2 | 3; mentor: string; question: string; placeholder?: string; options?: string[] };

const COPY = {
  pt: {
    back:"Meus treinamentos", meta:"Formação · 3 meses · 300 horas", lifetime:"Acesso vitalício",
    progress:"Progresso", stage:"Etapa atual", next:"Próximo passo", continue:"Continuar de onde parei",
    start:"Início", journey:"Trilha", project:"Meu Projeto", live:"Encontros", help:"Ajuda",
    month1:"Mês 1 · Fundamentos e diagnóstico", month2:"Mês 2 · Construção e validação",
    month3:"Mês 3 · Execução e projeto final", after:"Formação concluída · acesso vitalício",
    minimum:"Conclusão oficial após 90 dias", included:"1 avaliação oficial incluída",
    sixLives:"6 encontros ao vivo extras · 2 por mês", optional:"Participação opcional. Não interfere na conclusão nem no certificado.",
    appearance:"Aparência e idioma", light:"Claro", dark:"Escuro", smaller:"A−", larger:"A+",
    synced:"Sincronizado", saving:"Salvando…", failed:"Falha ao sincronizar",
    guided:"Conversa guiada", guidedHelp:"Uma etapa por vez, como uma conversa com seu mentor.",
    answer:"Sua resposta", saveContinue:"Salvar e continuar", previous:"Anterior", nextStep:"Próxima",
    completeContent:"Conteúdo completo da formação", openContent:"Abrir conteúdo da etapa",
    closeContent:"Fechar conteúdo", supportContent:"Use o conteúdo completo como apoio. Sua jornada principal continua na conversa guiada.",
    projectLocked:"A primeira entrega oficial é liberada ao completar os 90 dias.",
    projectReady:"Seu projeto já pode ser enviado para avaliação.", credits:"Créditos disponíveis",
    title:"Nome do projeto", link:"Link do projeto (opcional)", body:"Descrição ou conteúdo do projeto",
    submit:"Enviar projeto para avaliação", extra:"Nova avaliação de projeto",
    extraHelp:"Depois da avaliação incluída, compre 1 novo crédito sem recomprar o curso.",
    buyBR:"Comprar por R$ 179,90", buyEU:"Comprar por € 29,90", sent:"Projetos enviados",
    noLive:"Nenhum encontro publicado no momento.", nextLive:"Participar", materials:"Materiais",
    notices:"Avisos", noNotice:"Nenhum aviso novo.", questions:"Perguntas e respostas",
    ask:"Escreva sua dúvida…", send:"Enviar pergunta", loading:"Carregando seu treinamento…",
    unavailable:"Não foi possível abrir o treinamento. Confirme que sua compra já foi aprovada.",
    days:"dias de jornada", cohort:"Turma",
  },
  en: {
    back:"My training", meta:"Training · 3 months · 300 hours", lifetime:"Lifetime access",
    progress:"Progress", stage:"Current stage", next:"Next step", continue:"Continue where I left off",
    start:"Home", journey:"Path", project:"My Project", live:"Sessions", help:"Help",
    month1:"Month 1 · Foundations and diagnosis", month2:"Month 2 · Build and validation",
    month3:"Month 3 · Execution and final project", after:"Program completed · lifetime access",
    minimum:"Official completion after 90 days", included:"1 official project review included",
    sixLives:"6 extra live sessions · 2 per month", optional:"Participation is optional and does not affect completion or certificate.",
    appearance:"Appearance and language", light:"Light", dark:"Dark", smaller:"A−", larger:"A+",
    synced:"Synced", saving:"Saving…", failed:"Sync failed", guided:"Guided conversation",
    guidedHelp:"One step at a time, like a conversation with your mentor.", answer:"Your answer",
    saveContinue:"Save and continue", previous:"Previous", nextStep:"Next", completeContent:"Full training content",
    openContent:"Open step content", closeContent:"Close content",
    supportContent:"Use the full content as support. Your main journey continues in the guided conversation.",
    projectLocked:"The first official submission unlocks after 90 days.", projectReady:"Your project can now be submitted.",
    credits:"Available credits", title:"Project name", link:"Project link (optional)", body:"Project description or content",
    submit:"Submit project for review", extra:"New project review",
    extraHelp:"After the included review, buy one new credit without repurchasing the training.",
    buyBR:"Buy for R$ 179.90", buyEU:"Buy for €29.90", sent:"Submitted projects",
    noLive:"No session published right now.", nextLive:"Join", materials:"Materials",
    notices:"Announcements", noNotice:"No new announcement.", questions:"Questions and answers",
    ask:"Write your question…", send:"Send question", loading:"Loading your training…",
    unavailable:"The training could not be opened. Confirm that your purchase has been approved.",
    days:"days in journey", cohort:"Cohort",
  },
  fr: {
    back:"Mes formations", meta:"Formation · 3 mois · 300 heures", lifetime:"Accès à vie",
    progress:"Progression", stage:"Étape actuelle", next:"Prochaine étape", continue:"Reprendre où je me suis arrêté",
    start:"Accueil", journey:"Parcours", project:"Mon Projet", live:"Rencontres", help:"Aide",
    month1:"Mois 1 · Fondamentaux et diagnostic", month2:"Mois 2 · Construction et validation",
    month3:"Mois 3 · Exécution et projet final", after:"Formation terminée · accès à vie",
    minimum:"Validation officielle après 90 jours", included:"1 évaluation officielle incluse",
    sixLives:"6 rencontres en direct supplémentaires · 2 par mois", optional:"Participation facultative, sans impact sur la validation ni le certificat.",
    appearance:"Apparence et langue", light:"Clair", dark:"Sombre", smaller:"A−", larger:"A+",
    synced:"Synchronisé", saving:"Enregistrement…", failed:"Échec de synchronisation", guided:"Conversation guidée",
    guidedHelp:"Une étape à la fois, comme une conversation avec votre mentor.", answer:"Votre réponse",
    saveContinue:"Enregistrer et continuer", previous:"Précédent", nextStep:"Suivant", completeContent:"Contenu complet",
    openContent:"Ouvrir le contenu", closeContent:"Fermer le contenu",
    supportContent:"Utilisez le contenu complet comme support. Le parcours principal reste la conversation guidée.",
    projectLocked:"Le premier dépôt officiel est débloqué après 90 jours.", projectReady:"Votre projet peut être envoyé.",
    credits:"Crédits disponibles", title:"Nom du projet", link:"Lien du projet (optionnel)", body:"Description ou contenu du projet",
    submit:"Envoyer le projet", extra:"Nouvelle évaluation",
    extraHelp:"Après l’évaluation incluse, achetez un nouveau crédit sans racheter la formation.",
    buyBR:"Acheter pour R$ 179,90", buyEU:"Acheter pour 29,90 €", sent:"Projets envoyés",
    noLive:"Aucune rencontre publiée.", nextLive:"Participer", materials:"Matériels",
    notices:"Annonces", noNotice:"Aucune nouvelle annonce.", questions:"Questions et réponses",
    ask:"Écrivez votre question…", send:"Envoyer", loading:"Chargement de votre formation…",
    unavailable:"Impossible d’ouvrir la formation. Vérifiez que votre achat a été confirmé.",
    days:"jours de parcours", cohort:"Groupe",
  },
  es: {
    back:"Mis entrenamientos", meta:"Formación · 3 meses · 300 horas", lifetime:"Acceso de por vida",
    progress:"Progreso", stage:"Etapa actual", next:"Próximo paso", continue:"Continuar donde lo dejé",
    start:"Inicio", journey:"Ruta", project:"Mi Proyecto", live:"Encuentros", help:"Ayuda",
    month1:"Mes 1 · Fundamentos y diagnóstico", month2:"Mes 2 · Construcción y validación",
    month3:"Mes 3 · Ejecución y proyecto final", after:"Formación concluida · acceso de por vida",
    minimum:"Finalización oficial después de 90 días", included:"1 evaluación oficial incluida",
    sixLives:"6 encuentros en vivo extra · 2 por mes", optional:"Participación opcional, sin afectar la finalización ni el certificado.",
    appearance:"Apariencia e idioma", light:"Claro", dark:"Oscuro", smaller:"A−", larger:"A+",
    synced:"Sincronizado", saving:"Guardando…", failed:"Error al sincronizar", guided:"Conversación guiada",
    guidedHelp:"Un paso a la vez, como una conversación con tu mentor.", answer:"Tu respuesta",
    saveContinue:"Guardar y continuar", previous:"Anterior", nextStep:"Siguiente", completeContent:"Contenido completo",
    openContent:"Abrir contenido", closeContent:"Cerrar contenido",
    supportContent:"Usa el contenido completo como apoyo. Tu recorrido principal continúa en la conversación guiada.",
    projectLocked:"La primera entrega oficial se habilita después de 90 días.", projectReady:"Tu proyecto ya puede enviarse.",
    credits:"Créditos disponibles", title:"Nombre del proyecto", link:"Enlace del proyecto (opcional)", body:"Descripción o contenido del proyecto",
    submit:"Enviar proyecto", extra:"Nueva evaluación",
    extraHelp:"Después de la evaluación incluida, compra un nuevo crédito sin volver a comprar el curso.",
    buyBR:"Comprar por R$ 179,90", buyEU:"Comprar por € 29,90", sent:"Proyectos enviados",
    noLive:"No hay encuentros publicados.", nextLive:"Participar", materials:"Materiales",
    notices:"Avisos", noNotice:"No hay avisos nuevos.", questions:"Preguntas y respuestas",
    ask:"Escribe tu duda…", send:"Enviar", loading:"Cargando tu entrenamiento…",
    unavailable:"No fue posible abrir el entrenamiento. Confirma que tu compra ya fue aprobada.",
    days:"días de recorrido", cohort:"Grupo",
  },
} as const;

const STEPS: Record<Locale, Step[]> = {
  pt: [
    {month:1,mentor:"Vamos começar pelo ponto mais importante: entender onde você está hoje.",question:"Você já tem uma ideia de negócio?",options:["Sim, já tenho","Tenho uma ideia, mas ainda está confusa","Ainda não tenho"]},
    {month:1,mentor:"Um negócio forte começa por um problema real.",question:"Qual problema você gostaria de resolver?",placeholder:"Descreva o problema em poucas linhas."},
    {month:1,mentor:"Agora vamos aproximar sua ideia de uma pessoa real.",question:"Quem você imagina que compraria essa solução?",placeholder:"Descreva seu cliente de forma simples."},
    {month:2,mentor:"Chegou a hora de transformar a ideia em uma oferta clara.",question:"O que exatamente você pretende oferecer?",placeholder:"Produto, serviço, experiência ou combinação."},
    {month:2,mentor:"Preço não nasce só do custo. Ele precisa fazer sentido para o cliente e para o negócio.",question:"Como você imagina cobrar por essa oferta?",placeholder:"Valor, faixa de preço ou modelo de cobrança."},
    {month:2,mentor:"Antes de crescer, vamos validar.",question:"Qual é a menor forma de testar essa ideia com uma pessoa real?",placeholder:"Escreva um teste simples que você pode fazer."},
    {month:3,mentor:"Agora saímos da ideia e entramos em execução.",question:"Quais são as três ações mais importantes para colocar isso em prática?",placeholder:"1. ...  2. ...  3. ..."},
    {month:3,mentor:"Todo projeto precisa de uma forma de chegar ao cliente.",question:"Onde você pretende encontrar seus primeiros clientes?",placeholder:"Canais, lugares, redes ou contatos."},
    {month:3,mentor:"Estamos chegando ao seu projeto final.",question:"Em uma frase, qual negócio você quer construir e por quê?",placeholder:"Escreva a versão mais clara da sua proposta."},
  ],
  en: [
    {month:1,mentor:"Let's start by understanding where you are today.",question:"Do you already have a business idea?",options:["Yes, I do","I have an idea, but it is still unclear","Not yet"]},
    {month:1,mentor:"A strong business starts with a real problem.",question:"What problem would you like to solve?",placeholder:"Describe it in a few lines."},
    {month:1,mentor:"Now let's connect the idea to a real person.",question:"Who do you imagine would buy this solution?",placeholder:"Describe your customer simply."},
    {month:2,mentor:"It is time to turn the idea into a clear offer.",question:"What exactly do you plan to offer?",placeholder:"Product, service, experience or combination."},
    {month:2,mentor:"Price must make sense for both customer and business.",question:"How do you imagine charging for this offer?",placeholder:"Price, range or payment model."},
    {month:2,mentor:"Before growing, let's validate.",question:"What is the smallest way to test this idea with a real person?",placeholder:"Write one simple test."},
    {month:3,mentor:"Now we move from idea to execution.",question:"What are the three most important actions to put this into practice?",placeholder:"1. ...  2. ...  3. ..."},
    {month:3,mentor:"Every project needs a route to the customer.",question:"Where will you find your first customers?",placeholder:"Channels, places, networks or contacts."},
    {month:3,mentor:"We are reaching your final project.",question:"In one sentence, what business do you want to build and why?",placeholder:"Write your clearest proposal."},
  ],
  fr: [
    {month:1,mentor:"Commençons par comprendre où vous en êtes aujourd’hui.",question:"Avez-vous déjà une idée d’entreprise ?",options:["Oui","J’ai une idée encore floue","Pas encore"]},
    {month:1,mentor:"Une entreprise solide part d’un problème réel.",question:"Quel problème souhaitez-vous résoudre ?",placeholder:"Décrivez-le en quelques lignes."},
    {month:1,mentor:"Rapprochons maintenant l’idée d’une personne réelle.",question:"Qui pourrait acheter cette solution ?",placeholder:"Décrivez simplement votre client."},
    {month:2,mentor:"Transformons l’idée en une offre claire.",question:"Que souhaitez-vous proposer exactement ?",placeholder:"Produit, service, expérience ou combinaison."},
    {month:2,mentor:"Le prix doit avoir du sens pour le client et l’entreprise.",question:"Comment imaginez-vous facturer cette offre ?",placeholder:"Prix, fourchette ou modèle."},
    {month:2,mentor:"Avant de grandir, validons.",question:"Quel est le plus petit test possible avec une personne réelle ?",placeholder:"Écrivez un test simple."},
    {month:3,mentor:"Nous passons maintenant à l’exécution.",question:"Quelles sont les trois actions les plus importantes ?",placeholder:"1. ...  2. ...  3. ..."},
    {month:3,mentor:"Chaque projet doit trouver son client.",question:"Où trouverez-vous vos premiers clients ?",placeholder:"Canaux, lieux, réseaux ou contacts."},
    {month:3,mentor:"Nous arrivons au projet final.",question:"En une phrase, quelle entreprise voulez-vous construire et pourquoi ?",placeholder:"Écrivez votre proposition la plus claire."},
  ],
  es: [
    {month:1,mentor:"Empecemos entendiendo dónde estás hoy.",question:"¿Ya tienes una idea de negocio?",options:["Sí, ya la tengo","Tengo una idea, pero aún es confusa","Todavía no"]},
    {month:1,mentor:"Un negocio fuerte comienza con un problema real.",question:"¿Qué problema te gustaría resolver?",placeholder:"Descríbelo en pocas líneas."},
    {month:1,mentor:"Ahora acerquemos la idea a una persona real.",question:"¿Quién compraría esta solución?",placeholder:"Describe a tu cliente de forma simple."},
    {month:2,mentor:"Es hora de convertir la idea en una oferta clara.",question:"¿Qué vas a ofrecer exactamente?",placeholder:"Producto, servicio, experiencia o combinación."},
    {month:2,mentor:"El precio debe tener sentido para el cliente y para el negocio.",question:"¿Cómo imaginas cobrar por esta oferta?",placeholder:"Precio, rango o modelo de cobro."},
    {month:2,mentor:"Antes de crecer, validemos.",question:"¿Cuál es la forma más pequeña de probar esta idea con una persona real?",placeholder:"Escribe una prueba simple."},
    {month:3,mentor:"Ahora pasamos de la idea a la ejecución.",question:"¿Cuáles son las tres acciones más importantes?",placeholder:"1. ...  2. ...  3. ..."},
    {month:3,mentor:"Todo proyecto necesita llegar al cliente.",question:"¿Dónde encontrarás a tus primeros clientes?",placeholder:"Canales, lugares, redes o contactos."},
    {month:3,mentor:"Estamos llegando al proyecto final.",question:"En una frase, ¿qué negocio quieres construir y por qué?",placeholder:"Escribe tu propuesta más clara."},
  ],
};

function DoMamaoTraining() {
  const { locale: appLocale } = useI18n();
  const [locale, setLocale] = useState<Locale>((["pt","en","fr","es"].includes(appLocale) ? appLocale : "pt") as Locale);
  const [area, setArea] = useState<Area>("inicio");
  const [theme, setTheme] = useState<"light"|"dark">("light");
  const [scale, setScale] = useState(1);
  const [showContent, setShowContent] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [guidedAnswers, setGuidedAnswers] = useState<Record<string,string>>({});
  const [question, setQuestion] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [projectUrl, setProjectUrl] = useState("");
  const [projectText, setProjectText] = useState("");
  const [syncLabel, setSyncLabel] = useState(COPY.pt.synced);

  const copy = COPY[locale];
  const steps = STEPS[locale];
  const experienceFn = useServerFn(clientDoMamaoTrainingExperience);
  const saveFn = useServerFn(clientSaveDoMamaoTrainingState);
  const submitProjectFn = useServerFn(clientSubmitDoMamaoProject);
  const projectCheckoutFn = useServerFn(clientCreateDoMamaoProjectReviewCheckout);
  const learningFn = useServerFn(clientLearningHub);
  const commentFn = useServerFn(clientAddLibraryComment);
  const queryClient = useQueryClient();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cloudStateRef = useRef<Record<string,unknown>>({});
  const [cloudProgress, setCloudProgress] = useState(0);

  const { data, isLoading, error } = useQuery({ queryKey:["do-mamao-training-experience"], queryFn:() => experienceFn({}) });
  const { data: learning } = useQuery({ queryKey:["client-learning-hub"], queryFn:() => learningFn({}) });

  useEffect(() => { if (data) setCloudProgress(Number(data.progressPercent ?? 0)); }, [data]);
  useEffect(() => setSyncLabel(copy.synced), [copy.synced]);

  const save = useMutation({
    mutationFn:(state:Record<string,unknown>) => saveFn({ data:{ state } }),
    onMutate:() => setSyncLabel(copy.saving),
    onSuccess:(result) => { setCloudProgress(Number(result.progressPercent ?? 0)); setSyncLabel(copy.synced); },
    onError:() => setSyncLabel(copy.failed),
  });
  const ask = useMutation({
    mutationFn:() => commentFn({ data:{ body:question, trainingId:data!.trainingId } }),
    onSuccess:async() => { setQuestion(""); await queryClient.invalidateQueries({ queryKey:["client-learning-hub"] }); },
  });
  const submitProject = useMutation({
    mutationFn:() => submitProjectFn({ data:{ title:projectTitle, projectUrl, projectText } }),
    onSuccess:async() => { setProjectTitle(""); setProjectUrl(""); setProjectText(""); await queryClient.invalidateQueries({ queryKey:["do-mamao-training-experience"] }); },
  });
  const buyReview = useMutation({
    mutationFn:(market:"BR"|"INTL") => projectCheckoutFn({ data:{ market } }),
    onSuccess:(result) => { if (result.url) window.location.assign(result.url); },
  });

  useEffect(() => {
    const onMessage = (event:MessageEvent) => {
      if (!iframeRef.current?.contentWindow || event.source !== iframeRef.current.contentWindow) return;
      const payload = event.data as {type?:string;key?:string;state?:Record<string,unknown>} | null;
      if (!payload || payload.type !== "ldr-training-state" || payload.key !== "ldr_training_v3_library_ready" || !payload.state) return;
      cloudStateRef.current = payload.state;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => save.mutate(payload.state!), 650);
    };
    window.addEventListener("message", onMessage);
    return () => { window.removeEventListener("message", onMessage); if (timerRef.current) clearTimeout(timerRef.current); };
  }, [save]);

  const applyReaderPreferences = useCallback(() => {
    const frame = iframeRef.current;
    const doc = frame?.contentDocument;
    if (!doc?.documentElement) return;
    doc.documentElement.style.fontSize = `${scale * 100}%`;
    doc.documentElement.style.colorScheme = theme;
    let style = doc.getElementById("ldr-guided-reader") as HTMLStyleElement | null;
    if (!style) { style = doc.createElement("style"); style.id = "ldr-guided-reader"; doc.head?.appendChild(style); }
    style.textContent = `
      html,body{max-width:100%!important;overflow-x:hidden!important;box-sizing:border-box!important}
      *,*:before,*:after{box-sizing:border-box!important}
      img,video,iframe,table{max-width:100%!important}
      body{padding-bottom:32px!important}
      ${theme === "dark" ? "html,body{background:#111827!important;color:#f8fafc!important} input,textarea,select{background:#0f172a!important;color:#fff!important;border-color:#64748b!important}" : "html,body{background:#fffaf2!important;color:#301018!important}"}
    `;
    const adminPattern = /^(admin|administrador|administração|administration|administrator|área admin|painel admin)$/i;
    doc.querySelectorAll<HTMLElement>("a,button,[role='button']").forEach((el) => {
      const label = (el.textContent || el.getAttribute("aria-label") || "").trim();
      if (adminPattern.test(label)) { el.style.display = "none"; el.setAttribute("aria-hidden","true"); }
    });
    try {
      const raw = frame?.contentWindow?.localStorage?.getItem("ldr_training_v3_library_ready");
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string,unknown>;
        cloudStateRef.current = parsed;
        const ga = (parsed.guidedAnswers && typeof parsed.guidedAnswers === "object" ? parsed.guidedAnswers : {}) as Record<string,string>;
        setGuidedAnswers(ga);
        const idx = typeof parsed.guidedStep === "number" ? parsed.guidedStep : 0;
        setStepIndex(Math.max(0, Math.min(steps.length - 1, idx)));
      }
    } catch {}
    frame?.contentWindow?.postMessage({type:"ldr-training-preferences",locale,theme,scale},"*");
  }, [locale, scale, steps.length, theme]);

  useEffect(() => { if (showContent) applyReaderPreferences(); }, [applyReaderPreferences, showContent, data]);

  const current = steps[stepIndex];
  useEffect(() => { setAnswer(guidedAnswers[`guided_${locale}_${stepIndex}`] ?? ""); }, [guidedAnswers, locale, stepIndex]);

  const saveGuided = () => {
    if (!answer.trim()) return;
    const key = `guided_${locale}_${stepIndex}`;
    const nextGuided = { ...guidedAnswers, [key]:answer.trim() };
    setGuidedAnswers(nextGuided);
    const base = cloudStateRef.current ?? {};
    const answers = (base.answers && typeof base.answers === "object" ? base.answers : {}) as Record<string,unknown>;
    const reflections = (base.reflections && typeof base.reflections === "object" ? base.reflections : {}) as Record<string,unknown>;
    const merged:Record<string,unknown> = {
      ...base,
      answers:{ ...answers, [key]:answer.trim() },
      reflections:{ ...reflections, [key]:answer.trim() },
      guidedAnswers:nextGuided,
      guidedStep:Math.min(steps.length - 1, stepIndex + 1),
      lastPanel:`guided-${stepIndex + 1}`,
    };
    cloudStateRef.current = merged;
    save.mutate(merged);
    if (stepIndex < steps.length - 1) setStepIndex((v) => v + 1);
  };

  const startDate = data?.enrolledAt ? new Date(data.enrolledAt) : null;
  const minEndDate = data?.officialCompletionEligibleAt ? new Date(data.officialCompletionEligibleAt) : null;
  const days = startDate ? Math.max(0, Math.floor((Date.now() - startDate.getTime()) / 86400000)) : 0;
  const stage = days < 30 ? copy.month1 : days < 60 ? copy.month2 : days < 90 ? copy.month3 : copy.after;
  const dateLocale = locale === "pt" ? "pt-BR" : locale === "fr" ? "fr-FR" : locale === "es" ? "es-ES" : "en-US";
  const trainingSessions = learning?.sessions?.filter((x:any) => x.training_id === data?.trainingId) ?? [];
  const announcements = (learning?.announcements?.filter((x:any) => x.training_id === data?.trainingId) ?? []).slice(0,3);
  const materials = learning?.materials?.filter((x:any) => x.training_id === data?.trainingId) ?? [];
  const comments = useMemo(() => (learning?.comments?.filter((x:any) => x.training_id === data?.trainingId) ?? []).slice(-8), [learning?.comments, data?.trainingId]);

  if (isLoading) return <div className="s8-card"><p className="text-sm text-muted-foreground">{copy.loading}</p></div>;
  if (error || !data) return <div className="s8-card"><h1 className="font-serif text-2xl">Do Mamão ao Negócio</h1><p className="mt-2 text-sm">{copy.unavailable}</p></div>;

  const nav = [
    ["inicio", copy.start, BookOpen], ["trilha", copy.journey, GraduationCap], ["projeto", copy.project, FileCheck2],
    ["encontros", copy.live, Video], ["ajuda", copy.help, HelpCircle],
  ] as const;

  return <div className="min-w-0 max-w-full space-y-4 overflow-x-hidden pb-24">
    <section className="overflow-hidden rounded-3xl border border-[#cda34a] bg-[#5b0824] text-white shadow-sm">
      <div className="p-4 sm:p-6">
        <a href="/cliente/treinamentos" className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-[#f5dfac]"><ArrowLeft className="h-4 w-4"/>{copy.back}</a>
        <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[.16em] text-[#d9ae54]">{copy.meta}</p>
            <h1 className="mt-1 break-words font-serif text-3xl font-bold text-[#fff7e8]">Do Mamão ao Negócio</h1>
            <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold"><span className="rounded-full bg-white/10 px-3 py-1.5">{copy.lifetime}</span><span className="rounded-full bg-white/10 px-3 py-1.5">{copy.minimum}</span></div>
          </div>
          <details className="rounded-2xl border border-white/20 bg-white/5 p-3">
            <summary className="flex min-h-10 cursor-pointer items-center gap-2 text-sm font-bold"><Settings2 className="h-4 w-4"/>{copy.appearance}</summary>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
              <select value={locale} onChange={(e) => setLocale(e.target.value as Locale)} className="col-span-2 min-h-11 rounded-xl border border-white/20 bg-white px-3 text-[#5b0824] sm:col-span-1"><option value="pt">Português</option><option value="en">English</option><option value="fr">Français</option><option value="es">Español</option></select>
              <button onClick={() => setTheme("light")} className="min-h-11 rounded-xl bg-white px-3 font-bold text-[#5b0824]"><Sun className="mx-auto h-4 w-4"/></button>
              <button onClick={() => setTheme("dark")} className="min-h-11 rounded-xl bg-white px-3 font-bold text-[#5b0824]"><Moon className="mx-auto h-4 w-4"/></button>
              <button onClick={() => setScale((v) => Math.max(.85, v - .1))} className="min-h-11 rounded-xl bg-white px-3 font-bold text-[#5b0824]">{copy.smaller}</button>
              <button onClick={() => setScale((v) => Math.min(1.35, v + .1))} className="min-h-11 rounded-xl bg-white px-3 font-bold text-[#5b0824]">{copy.larger}</button>
            </div>
          </details>
        </div>
        <div className="mt-5"><div className="mb-2 flex items-center justify-between text-xs font-semibold"><span>{copy.progress}</span><span>{cloudProgress}% · {syncLabel}</span></div><div className="h-2 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-[#d4a63e] transition-all" style={{width:`${Math.max(2,cloudProgress)}%`}}/></div></div>
      </div>
      <nav className="grid grid-cols-3 gap-1 border-t border-white/10 bg-[#47051b] p-2 sm:grid-cols-5">{nav.map(([id,label,Icon]) => <button key={id} onClick={() => setArea(id)} className={`min-h-14 rounded-xl px-2 py-2 text-xs font-bold ${area === id ? "bg-[#d4a63e] text-[#3d0818]" : "text-[#fff7e8] hover:bg-white/10"}`}><Icon className="mx-auto mb-1 h-4 w-4"/><span className="block truncate">{label}</span></button>)}</nav>
    </section>

    {area === "inicio" && <section className="grid gap-4 lg:grid-cols-[1.25fr_.75fr]">
      <div className="rounded-3xl border border-[#ead3a2] bg-[#fffaf0] p-4 sm:p-6"><p className="text-xs font-bold uppercase tracking-[.15em] text-[#ae7e22]">{copy.stage}</p><h2 className="mt-2 font-serif text-2xl font-bold text-[#64102d]">{stage}</h2><div className="mt-4 grid grid-cols-2 gap-3 text-sm"><div className="rounded-2xl bg-white p-3"><span className="block text-xs text-muted-foreground">{copy.cohort}</span><strong>{data.cohortNumber ?? "—"}</strong></div><div className="rounded-2xl bg-white p-3"><span className="block text-xs text-muted-foreground">{copy.days}</span><strong>{days}</strong></div></div><button onClick={() => setArea("trilha")} className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#6d0d2e] px-5 font-bold text-white shadow-sm"><BookOpen className="h-5 w-5"/>{copy.continue}</button></div>
      <div className="rounded-3xl border border-[#ead3a2] bg-white p-4 sm:p-6"><p className="text-xs font-bold uppercase tracking-[.15em] text-[#ae7e22]">{copy.next}</p><p className="mt-2 text-sm font-semibold text-[#64102d]">{copy.guided}</p><p className="mt-2 text-sm leading-6 text-muted-foreground">{copy.guidedHelp}</p><div className="mt-4 space-y-2 text-sm"><p>✓ {copy.included}</p><p>✓ {copy.sixLives}</p><p>✓ {copy.lifetime}</p></div></div>
    </section>}

    {area === "trilha" && <section className="space-y-4">
      <div className="rounded-3xl border border-[#ead3a2] bg-[#fffaf0] p-4 sm:p-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.15em] text-[#ae7e22]">{copy.guided}</p><h2 className="mt-1 font-serif text-2xl font-bold text-[#64102d]">{current.month === 1 ? copy.month1 : current.month === 2 ? copy.month2 : copy.month3}</h2></div><span className="rounded-full bg-[#6d0d2e] px-3 py-1.5 text-xs font-bold text-white">{stepIndex + 1}/{steps.length}</span></div><div className="mt-5 h-2 overflow-hidden rounded-full bg-[#eadcc0]"><div className="h-full rounded-full bg-[#c99a35]" style={{width:`${((stepIndex + 1)/steps.length)*100}%`}}/></div>
        <div className="mt-6 max-w-2xl space-y-4"><div className="max-w-[92%] rounded-3xl rounded-tl-md bg-[#6d0d2e] px-5 py-4 text-white shadow-sm"><p className="text-xs font-bold uppercase tracking-[.14em] text-[#f0cf82]">Luciano · Mentor</p><p className="mt-2 leading-7">{current.mentor}</p></div><div className="ml-auto max-w-[94%] rounded-3xl rounded-tr-md border border-[#ead3a2] bg-white px-5 py-4"><p className="font-bold text-[#64102d]">{current.question}</p>{current.options ? <div className="mt-4 grid gap-2">{current.options.map((option) => <button key={option} onClick={() => setAnswer(option)} className={`min-h-12 rounded-2xl border px-4 text-left text-sm font-semibold ${answer === option ? "border-[#b98727] bg-[#fff1ce] text-[#64102d]" : "border-[#e8d7b4] bg-white"}`}>{option}</button>)}</div> : <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder={current.placeholder || copy.answer} className="mt-4 min-h-32 w-full rounded-2xl border border-[#e5d4af] bg-white p-4 text-sm outline-none focus:border-[#b98727]"/>}</div></div>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><button disabled={stepIndex === 0} onClick={() => setStepIndex((v) => Math.max(0,v-1))} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-[#d9c292] px-4 font-semibold disabled:opacity-40"><ChevronLeft className="h-4 w-4"/>{copy.previous}</button><button disabled={!answer.trim() || save.isPending} onClick={saveGuided} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#6d0d2e] px-5 font-bold text-white disabled:opacity-50"><CheckCircle2 className="h-5 w-5"/>{copy.saveContinue}</button><button disabled={stepIndex === steps.length - 1} onClick={() => setStepIndex((v) => Math.min(steps.length-1,v+1))} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-[#d9c292] px-4 font-semibold disabled:opacity-40">{copy.nextStep}<ChevronRight className="h-4 w-4"/></button></div>
      </div>
      <div className="rounded-3xl border border-[#ead3a2] bg-white p-4 sm:p-6"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="font-serif text-xl font-bold text-[#64102d]">{copy.completeContent}</h3><p className="mt-1 text-sm text-muted-foreground">{copy.supportContent}</p></div><button onClick={() => setShowContent((v) => !v)} className="min-h-11 rounded-2xl border border-[#c99a35] px-4 text-sm font-bold text-[#64102d]">{showContent ? copy.closeContent : copy.openContent}</button></div>{showContent && <div className="mt-4 overflow-hidden rounded-2xl border border-[#e8d8b7] bg-[#fffaf2]"><iframe ref={iframeRef} title="Do Mamão ao Negócio" srcDoc={data.html} onLoad={applyReaderPreferences} className="block h-[68vh] min-h-[520px] max-h-[760px] w-full border-0" sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-downloads"/></div>}</div>
    </section>}

    {area === "projeto" && <section className="grid gap-4 lg:grid-cols-2"><div className="rounded-3xl border border-[#ead3a2] bg-[#fffaf0] p-4 sm:p-6"><div className="flex items-center justify-between gap-3"><h2 className="font-serif text-2xl font-bold text-[#64102d]">{copy.project}</h2><span className="rounded-full bg-[#fff1ce] px-3 py-1 text-xs font-bold text-[#70430b]">{copy.credits}: {data.availableProjectCredits ?? 0}</span></div><p className="mt-3 text-sm leading-6">{data.projectSubmissionEligible ? copy.projectReady : copy.projectLocked}</p>{!data.projectSubmissionEligible && minEndDate && <p className="mt-2 text-sm font-semibold text-[#64102d]">{minEndDate.toLocaleDateString(dateLocale)}</p>}{data.projectSubmissionEligible && Number(data.availableProjectCredits ?? 0) > 0 && <div className="mt-5 space-y-3"><input value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)} placeholder={copy.title} className="min-h-12 w-full rounded-2xl border border-[#dfcca5] bg-white px-4"/><input value={projectUrl} onChange={(e) => setProjectUrl(e.target.value)} placeholder={copy.link} className="min-h-12 w-full rounded-2xl border border-[#dfcca5] bg-white px-4"/><textarea value={projectText} onChange={(e) => setProjectText(e.target.value)} placeholder={copy.body} className="min-h-36 w-full rounded-2xl border border-[#dfcca5] bg-white p-4"/><button disabled={!projectTitle.trim() || !projectText.trim() || submitProject.isPending} onClick={() => submitProject.mutate()} className="min-h-12 w-full rounded-2xl bg-[#6d0d2e] px-5 font-bold text-white disabled:opacity-50">{copy.submit}</button></div>}</div><div className="rounded-3xl border border-[#ead3a2] bg-white p-4 sm:p-6"><h3 className="font-serif text-xl font-bold text-[#64102d]">{copy.extra}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{copy.extraHelp}</p><div className="mt-4 grid gap-2 sm:grid-cols-2"><button onClick={() => buyReview.mutate("BR")} className="min-h-12 rounded-2xl border border-[#c99a35] px-4 font-bold text-[#64102d]">{copy.buyBR}</button><button onClick={() => buyReview.mutate("INTL")} className="min-h-12 rounded-2xl border border-[#c99a35] px-4 font-bold text-[#64102d]">{copy.buyEU}</button></div><h4 className="mt-6 font-bold text-[#64102d]">{copy.sent}</h4><div className="mt-2 space-y-2">{(data.projectSubmissions ?? []).length ? (data.projectSubmissions ?? []).map((p:any) => <div key={p.id} className="rounded-2xl bg-[#fffaf0] p-3 text-sm"><strong>{p.title}</strong><span className="ml-2 text-xs text-muted-foreground">{p.status}</span>{p.feedback && <p className="mt-2 text-xs">{p.feedback}</p>}</div>) : <p className="text-sm text-muted-foreground">—</p>}</div></div></section>}

    {area === "encontros" && <section className="space-y-4"><div className="rounded-3xl border border-[#ead3a2] bg-[#fffaf0] p-4 sm:p-6"><h2 className="font-serif text-2xl font-bold text-[#64102d]">{copy.sixLives}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{copy.optional}</p><div className="mt-5 grid gap-3 md:grid-cols-2">{trainingSessions.length ? trainingSessions.map((s:any) => <article key={s.id} className="rounded-2xl border border-[#ead3a2] bg-white p-4"><p className="text-xs font-bold uppercase tracking-[.12em] text-[#ae7e22]"><CalendarDays className="mr-1 inline h-4 w-4"/>{new Date(s.starts_at).toLocaleString(dateLocale)}</p><h3 className="mt-2 font-bold text-[#64102d]">{s.title}</h3>{s.description && <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>}{s.meeting_url && <a href={s.meeting_url} target="_blank" rel="noreferrer" className="mt-3 inline-flex min-h-10 items-center rounded-xl bg-[#6d0d2e] px-4 text-sm font-bold text-white">{copy.nextLive}</a>}</article>) : <p className="text-sm text-muted-foreground">{copy.noLive}</p>}</div></div><div className="rounded-3xl border border-[#ead3a2] bg-white p-4 sm:p-6"><h3 className="font-serif text-xl font-bold text-[#64102d]">{copy.materials}</h3><p className="mt-2 text-sm">{materials.length}</p></div></section>}

    {area === "ajuda" && <section className="grid gap-4 lg:grid-cols-2"><div className="rounded-3xl border border-[#ead3a2] bg-[#fffaf0] p-4 sm:p-6"><h2 className="font-serif text-2xl font-bold text-[#64102d]">{copy.notices}</h2><div className="mt-4 space-y-3">{announcements.length ? announcements.map((a:any) => <article key={a.id} className="rounded-2xl bg-white p-4"><strong className="text-[#64102d]">{a.title}</strong><p className="mt-2 text-sm leading-6">{a.body}</p></article>) : <p className="text-sm text-muted-foreground">{copy.noNotice}</p>}</div></div><div className="rounded-3xl border border-[#ead3a2] bg-white p-4 sm:p-6"><h2 className="font-serif text-2xl font-bold text-[#64102d]">{copy.questions}</h2><div className="mt-4 flex gap-2"><textarea value={question} onChange={(e) => setQuestion(e.target.value)} placeholder={copy.ask} className="min-h-24 flex-1 rounded-2xl border border-[#dfcca5] p-3"/><button disabled={!question.trim() || ask.isPending} onClick={() => ask.mutate()} className="self-end min-h-11 rounded-2xl bg-[#6d0d2e] px-4 font-bold text-white">{copy.send}</button></div><div className="mt-5 space-y-2">{comments.map((c:any) => <div key={c.id} className="rounded-2xl bg-[#fffaf0] p-3 text-sm"><div className="flex items-center gap-2 font-semibold text-[#64102d]"><MessageCircle className="h-4 w-4"/>{c.author_kind === "professional" ? "LDR Essence" : "Aluno"}</div><p className="mt-1">{c.body}</p></div>)}</div></div></section>}

    <div className="fixed bottom-4 left-1/2 z-30 w-[calc(100%-24px)] max-w-md -translate-x-1/2 sm:hidden"><button onClick={() => setArea("trilha")} className="min-h-14 w-full rounded-2xl bg-[#6d0d2e] px-5 font-bold text-white shadow-xl">{copy.continue}</button></div>
  </div>;
}

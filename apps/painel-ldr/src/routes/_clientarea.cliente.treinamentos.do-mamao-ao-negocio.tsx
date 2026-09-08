import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, BookOpen, CalendarDays, CheckCircle2, Clock3, Cloud, GraduationCap, Megaphone, MessageCircle, Moon, Send, Sun, ZoomIn, ZoomOut } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { clientDoMamaoTrainingExperience, clientSaveDoMamaoTrainingState } from "@/lib/training-commerce.functions";
import { clientAddLibraryComment, clientLearningHub } from "@/lib/learning.functions";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_clientarea/cliente/treinamentos/do-mamao-ao-negocio")({ component: DoMamaoTraining });

type Locale = "pt" | "en" | "fr" | "es";
const COPY = {
  pt: { back:"Meus treinamentos", meta:"Treinamento · 3 meses · 300 horas", desc:"Sistema S8 · atividades · quizzes · Laboratório de Campo · Projeto de Negócio · fórum · encontros ao vivo", synced:"Sincronizado com sua conta", saving:"Salvando na nuvem…", failed:"Falha ao sincronizar — sua resposta continua salva neste dispositivo", progress:"Progresso", cohort:"Turma", certificate:"Certificado disponível a partir de", loading:"Carregando seu treinamento…", unavailable:"Não foi possível abrir o treinamento. Confirme que sua compra já foi aprovada.", library:"Voltar à Biblioteca", light:"Claro", dark:"Escuro", smaller:"Diminuir letra", larger:"Aumentar letra", language:"Idioma", reading:"Aparência", access:"Acesso ao treinamento", accessHelp:"Seu progresso é salvo automaticamente. Continue de onde parou sempre que voltar ao painel.", journey:"Sua jornada de 3 meses", started:"Início", ends:"Fim do ciclo", stage:"Etapa atual", month1:"Mês 1 · Fundamentos e diagnóstico", month2:"Mês 2 · Construção e validação", month3:"Mês 3 · Execução e projeto final", next:"Próximo passo", continue:"Continuar treinamento", nextMeeting:"Próximo encontro", noMeeting:"Nenhum encontro publicado no momento.", announcements:"Avisos", noAnnouncement:"Nenhum aviso novo.", materials:"Materiais", questions:"Perguntas e respostas", ask:"Escreva sua dúvida sobre o treinamento…", send:"Enviar pergunta", sent:"Pergunta enviada", team:"Equipe LDR Essence" },
  en: { back:"My training", meta:"Training · 3 months · 300 hours", desc:"S8 System · activities · quizzes · Field Lab · Business Project · forum · live meetings", synced:"Synced with your account", saving:"Saving to the cloud…", failed:"Sync failed — your answer remains saved on this device", progress:"Progress", cohort:"Cohort", certificate:"Certificate available from", loading:"Loading your training…", unavailable:"The training could not be opened. Confirm that your purchase has been approved.", library:"Back to Library", light:"Light", dark:"Dark", smaller:"Smaller text", larger:"Larger text", language:"Language", reading:"Appearance", access:"Training access", accessHelp:"Your progress is saved automatically. Continue where you left off whenever you return to the panel.", journey:"Your 3-month journey", started:"Start", ends:"Cycle end", stage:"Current stage", month1:"Month 1 · Foundations and diagnosis", month2:"Month 2 · Build and validation", month3:"Month 3 · Execution and final project", next:"Next step", continue:"Continue training", nextMeeting:"Next live session", noMeeting:"No live session published right now.", announcements:"Announcements", noAnnouncement:"No new announcement.", materials:"Materials", questions:"Questions and answers", ask:"Write your question about the training…", send:"Send question", sent:"Question sent", team:"LDR Essence Team" },
  fr: { back:"Mes formations", meta:"Formation · 3 mois · 300 heures", desc:"Système S8 · activités · quiz · Laboratoire de Terrain · Projet d’Entreprise · forum · rencontres en direct", synced:"Synchronisé avec votre compte", saving:"Enregistrement dans le cloud…", failed:"Échec de la synchronisation — votre réponse reste enregistrée sur cet appareil", progress:"Progression", cohort:"Groupe", certificate:"Certificat disponible à partir du", loading:"Chargement de votre formation…", unavailable:"Impossible d’ouvrir la formation. Vérifiez que votre achat a été confirmé.", library:"Retour à la bibliothèque", light:"Clair", dark:"Sombre", smaller:"Réduire le texte", larger:"Agrandir le texte", language:"Langue", reading:"Apparence", access:"Accès à la formation", accessHelp:"Votre progression est enregistrée automatiquement. Reprenez où vous vous êtes arrêté à chaque retour sur le panneau.", journey:"Votre parcours de 3 mois", started:"Début", ends:"Fin du cycle", stage:"Étape actuelle", month1:"Mois 1 · Fondamentaux et diagnostic", month2:"Mois 2 · Construction et validation", month3:"Mois 3 · Exécution et projet final", next:"Prochaine étape", continue:"Continuer la formation", nextMeeting:"Prochaine rencontre", noMeeting:"Aucune rencontre publiée pour le moment.", announcements:"Annonces", noAnnouncement:"Aucune nouvelle annonce.", materials:"Matériels", questions:"Questions et réponses", ask:"Écrivez votre question sur la formation…", send:"Envoyer", sent:"Question envoyée", team:"Équipe LDR Essence" },
  es: { back:"Mis entrenamientos", meta:"Entrenamiento · 3 meses · 300 horas", desc:"Sistema S8 · actividades · cuestionarios · Laboratorio de Campo · Proyecto de Negocio · foro · encuentros en vivo", synced:"Sincronizado con tu cuenta", saving:"Guardando en la nube…", failed:"Falló la sincronización — tu respuesta permanece guardada en este dispositivo", progress:"Progreso", cohort:"Grupo", certificate:"Certificado disponible a partir del", loading:"Cargando tu entrenamiento…", unavailable:"No fue posible abrir el entrenamiento. Confirma que tu compra ya fue aprobada.", library:"Volver a la Biblioteca", light:"Claro", dark:"Oscuro", smaller:"Reducir letra", larger:"Aumentar letra", language:"Idioma", reading:"Apariencia", access:"Acceso al entrenamiento", accessHelp:"Tu progreso se guarda automáticamente. Continúa desde donde lo dejaste cada vez que vuelvas al panel.", journey:"Tu recorrido de 3 meses", started:"Inicio", ends:"Fin del ciclo", stage:"Etapa actual", month1:"Mes 1 · Fundamentos y diagnóstico", month2:"Mes 2 · Construcción y validación", month3:"Mes 3 · Ejecución y proyecto final", next:"Próximo paso", continue:"Continuar entrenamiento", nextMeeting:"Próximo encuentro", noMeeting:"No hay encuentros publicados en este momento.", announcements:"Avisos", noAnnouncement:"No hay avisos nuevos.", materials:"Materiales", questions:"Preguntas y respuestas", ask:"Escribe tu duda sobre el entrenamiento…", send:"Enviar pregunta", sent:"Pregunta enviada", team:"Equipo LDR Essence" },
} as const;

function DoMamaoTraining() {
  const { locale: appLocale } = useI18n();
  const [locale, setLocale] = useState<Locale>((appLocale === "pt" || appLocale === "en" || appLocale === "fr" || appLocale === "es" ? appLocale : "pt") as Locale);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [scale, setScale] = useState(1);
  const [question, setQuestion] = useState("");
  const copy = COPY[locale];
  const experienceFn = useServerFn(clientDoMamaoTrainingExperience);
  const saveFn = useServerFn(clientSaveDoMamaoTrainingState);
  const learningFn = useServerFn(clientLearningHub);
  const commentFn = useServerFn(clientAddLibraryComment);
  const queryClient = useQueryClient();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [syncLabel, setSyncLabel] = useState(copy.synced);
  const [cloudProgress, setCloudProgress] = useState(0);

  const { data, isLoading, error } = useQuery({ queryKey: ["do-mamao-training-experience"], queryFn: () => experienceFn({}) });
  const { data: learning } = useQuery({ queryKey: ["client-learning-hub"], queryFn: () => learningFn({}) });
  useEffect(() => { if (data) setCloudProgress(data.progressPercent); }, [data]);
  useEffect(() => { setSyncLabel(copy.synced); }, [copy.synced]);

  const save = useMutation({ mutationFn: (state: Record<string, unknown>) => saveFn({ data: { state } }), onMutate: () => setSyncLabel(copy.saving), onSuccess: (result) => { setCloudProgress(result.progressPercent); setSyncLabel(copy.synced); }, onError: () => setSyncLabel(copy.failed) });
  const ask = useMutation({ mutationFn: () => commentFn({ data: { body: question, trainingId: data!.trainingId } }), onSuccess: async () => { setQuestion(""); await queryClient.invalidateQueries({ queryKey: ["client-learning-hub"] }); } });

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (!iframeRef.current?.contentWindow || event.source !== iframeRef.current.contentWindow) return;
      const payload = event.data as { type?: string; key?: string; state?: Record<string, unknown> } | null;
      if (!payload || payload.type !== "ldr-training-state" || payload.key !== "ldr_training_v3_library_ready" || !payload.state) return;
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
    doc.documentElement.dataset.ldrTheme = theme;
    doc.documentElement.style.colorScheme = theme;
    let style = doc.getElementById("ldr-panel-reader-preferences") as HTMLStyleElement | null;
    if (!style) { style = doc.createElement("style"); style.id = "ldr-panel-reader-preferences"; doc.head?.appendChild(style); }
    style.textContent = theme === "dark" ? `html,body{background:#0f172a!important;color:#f8fafc!important;color-scheme:dark!important} body{min-height:100vh} body *{border-color:#475569} article,section,.card,.module,.panel,.content,.page,.box,.container,.lesson,.quiz,.atividade{background-color:#111827!important;color:#f8fafc!important} h1,h2,h3,h4,h5,h6,p,li,label,small,span{color:inherit} input,textarea,select{background:#0f172a!important;color:#fff!important;border-color:#64748b!important}` : `html,body{background:#ffffff!important;color:#172033!important;color-scheme:light!important} input,textarea,select{color:inherit}`;
    const adminPattern = /^(admin|administrador|administração|administration|administrator|área admin|painel admin)$/i;
    doc.querySelectorAll<HTMLElement>("a,button,[role='button']").forEach((el) => { const label = (el.textContent || el.getAttribute("aria-label") || "").trim(); if (adminPattern.test(label)) { el.style.display = "none"; el.setAttribute("aria-hidden", "true"); } });
    frame?.contentWindow?.postMessage({ type:"ldr-training-preferences", locale, theme, scale }, "*");
    try { frame?.contentWindow?.localStorage?.setItem("ldr_training_locale", locale); } catch {}
  }, [locale, scale, theme]);

  useEffect(() => { applyReaderPreferences(); }, [applyReaderPreferences, data]);

  const dateLocale = locale === "pt" ? "pt-BR" : locale === "fr" ? "fr-FR" : locale === "es" ? "es-ES" : "en-US";
  const startDate = data?.enrolledAt ? new Date(data.enrolledAt) : null;
  const endDate = startDate ? new Date(startDate) : null;
  if (endDate) endDate.setMonth(endDate.getMonth() + 3);
  const days = startDate ? Math.max(0, Math.floor((Date.now() - startDate.getTime()) / 86400000)) : 0;
  const stage = days < 30 ? copy.month1 : days < 60 ? copy.month2 : copy.month3;
  const trainingSessions = learning?.sessions?.filter((x:any) => x.training_id === data?.trainingId) ?? [];
  const nextSession = trainingSessions.find((x:any) => new Date(x.starts_at).getTime() >= Date.now()) ?? null;
  const announcements = (learning?.announcements?.filter((x:any) => x.training_id === data?.trainingId) ?? []).slice(0, 2);
  const materials = learning?.materials?.filter((x:any) => x.training_id === data?.trainingId) ?? [];
  const comments = useMemo(() => (learning?.comments?.filter((x:any) => x.training_id === data?.trainingId) ?? []).slice(-8), [learning?.comments, data?.trainingId]);

  if (isLoading) return <div className="s8-card"><p className="text-sm text-muted-foreground">{copy.loading}</p></div>;
  if (error || !data) return <div className="s8-card"><h1 className="font-serif text-2xl">Do Mamão ao Negócio</h1><p className="mt-2 text-sm text-muted-foreground">{copy.unavailable}</p><a href="/cliente/biblioteca" className="mt-4 inline-flex min-h-11 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground">{copy.library}</a></div>;

  return <div className="min-w-0 space-y-4">
    <section className="s8-card" style={{ background:"linear-gradient(145deg,#0b2341,#071426)", color:"#ffffff", borderColor:"#c9a63a" }}>
      <div className="flex min-w-0 flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1"><a href="/cliente/treinamentos" className="inline-flex min-h-11 items-center gap-1 text-xs font-bold opacity-80 hover:opacity-100"><ArrowLeft className="h-4 w-4"/> {copy.back}</a><p className="mt-3 break-words text-xs font-bold uppercase tracking-[.18em]" style={{color:"#d6ad63"}}>{copy.meta}</p><h1 className="mt-1 flex min-w-0 items-center gap-2 break-words !text-[#f7ead8] font-serif text-2xl sm:text-3xl"><GraduationCap className="h-7 w-7 shrink-0"/> Do Mamão ao Negócio</h1><p className="mt-2 break-words text-sm leading-6 opacity-85">{copy.desc}</p><div className="mt-4 max-w-2xl rounded-xl border px-4 py-3 text-sm" style={{borderColor:"rgba(214,173,99,.45)",background:"rgba(255,255,255,.05)"}}><strong className="block text-[#f7ead8]">{copy.access}</strong><span className="mt-1 block text-xs leading-5 opacity-85">{copy.accessHelp}</span></div></div>
        <div className="grid min-w-0 gap-3"><div className="rounded-xl border p-3" style={{borderColor:"#b58a44",background:"rgba(255,255,255,.05)"}}><p className="mb-2 text-xs font-bold uppercase tracking-[.12em] opacity-80">{copy.reading}</p><div className="flex flex-wrap gap-2" aria-label="Controles de leitura"><button type="button" aria-pressed={theme === "light"} onClick={() => setTheme("light")} className={`inline-flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold ${theme === "light" ? "bg-white text-slate-900" : ""}`}><Sun className="h-4 w-4"/> {copy.light}</button><button type="button" aria-pressed={theme === "dark"} onClick={() => setTheme("dark")} className={`inline-flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold ${theme === "dark" ? "bg-slate-950 text-white" : ""}`}><Moon className="h-4 w-4"/> {copy.dark}</button><button type="button" aria-label={copy.smaller} onClick={() => setScale(v => Math.max(.9, +(v-.1).toFixed(1)))} className="inline-flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold"><ZoomOut className="h-4 w-4"/> A−</button><button type="button" aria-label={copy.larger} onClick={() => setScale(v => Math.min(1.4, +(v+.1).toFixed(1)))} className="inline-flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold"><ZoomIn className="h-4 w-4"/> A+</button><label className="inline-flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold"><span>{copy.language}</span><select value={locale} onChange={e => setLocale(e.target.value as Locale)} className="bg-transparent font-bold"><option value="pt">PT</option><option value="en">EN</option><option value="fr">FR</option><option value="es">ES</option></select></label></div></div><div className="min-w-[220px] rounded-xl border p-4" style={{borderColor:"#b58a44",background:"rgba(255,255,255,.06)"}}><div className="flex items-center gap-2 text-sm font-bold"><Cloud className="h-4 w-4"/> {syncLabel}</div><div className="mt-3 flex items-center justify-between text-xs"><span>{copy.progress}</span><strong>{cloudProgress}%</strong></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-black/25"><div className="h-full rounded-full" style={{width:`${cloudProgress}%`,background:"#d6ad63"}}/></div>{data.cohortNumber ? <p className="mt-3 text-xs">{copy.cohort} {data.cohortNumber}</p> : null}{data.certificateAvailableAt ? <p className="mt-2 flex items-center gap-1 text-xs"><CheckCircle2 className="h-4 w-4"/> {copy.certificate} {new Date(data.certificateAvailableAt).toLocaleDateString(dateLocale)}</p> : null}</div></div>
      </div>
    </section>

    <section className="grid gap-4 lg:grid-cols-4">
      <article className="s8-card lg:col-span-2"><p className="text-xs font-bold uppercase tracking-[.14em] text-primary">{copy.journey}</p><div className="mt-4 grid gap-3 sm:grid-cols-3"><div className="rounded-xl bg-accent/50 p-3"><Clock3 className="mb-2 h-4 w-4"/><p className="text-xs text-muted-foreground">{copy.started}</p><strong className="text-sm">{startDate?.toLocaleDateString(dateLocale)}</strong></div><div className="rounded-xl bg-accent/50 p-3"><CalendarDays className="mb-2 h-4 w-4"/><p className="text-xs text-muted-foreground">{copy.ends}</p><strong className="text-sm">{endDate?.toLocaleDateString(dateLocale)}</strong></div><div className="rounded-xl bg-accent/50 p-3"><GraduationCap className="mb-2 h-4 w-4"/><p className="text-xs text-muted-foreground">{copy.stage}</p><strong className="text-sm">{stage}</strong></div></div><a href="#conteudo-treinamento" className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground">{copy.continue}</a></article>
      <article className="s8-card"><p className="flex items-center gap-2 text-sm font-bold"><CalendarDays className="h-4 w-4"/> {copy.nextMeeting}</p>{nextSession ? <div className="mt-3"><strong className="block text-sm">{nextSession.title}</strong><span className="mt-1 block text-xs text-muted-foreground">{new Date(nextSession.starts_at).toLocaleString(dateLocale)}</span>{nextSession.meeting_url ? <a href={nextSession.meeting_url} target="_blank" rel="noreferrer" className="mt-3 inline-flex text-sm font-bold text-primary underline">Abrir encontro</a> : null}</div> : <p className="mt-3 text-sm text-muted-foreground">{copy.noMeeting}</p>}</article>
      <article className="s8-card"><p className="flex items-center gap-2 text-sm font-bold"><BookOpen className="h-4 w-4"/> {copy.materials}</p><strong className="mt-3 block text-3xl font-serif text-primary">{materials.length}</strong><p className="text-xs text-muted-foreground">{locale === "pt" ? "materiais publicados para sua turma" : "published materials"}</p></article>
    </section>

    <section className="grid gap-4 lg:grid-cols-2"><article className="s8-card"><h2 className="flex items-center gap-2 font-serif text-xl"><Megaphone className="h-5 w-5"/> {copy.announcements}</h2><div className="mt-3 grid gap-3">{announcements.length ? announcements.map((a:any)=><div key={a.id} className="rounded-xl border border-border p-3"><strong className="text-sm">{a.title}</strong><p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">{a.body}</p></div>) : <p className="text-sm text-muted-foreground">{copy.noAnnouncement}</p>}</div></article><article className="s8-card"><h2 className="flex items-center gap-2 font-serif text-xl"><MessageCircle className="h-5 w-5"/> {copy.questions}</h2><div className="mt-3 max-h-56 space-y-2 overflow-y-auto">{comments.length ? comments.map((c:any)=><div key={c.id} className={`rounded-xl p-3 text-sm ${c.author_kind === "professional" ? "bg-primary/10" : "bg-accent/50"}`}><strong className="block text-xs">{c.author_kind === "professional" ? copy.team : c.author_label}</strong><p className="mt-1 whitespace-pre-line">{c.body}</p></div>) : <p className="text-sm text-muted-foreground">{locale === "pt" ? "Nenhuma pergunta ainda." : "No questions yet."}</p>}</div><textarea value={question} onChange={e=>setQuestion(e.target.value)} placeholder={copy.ask} className="mt-3 min-h-24 w-full rounded-xl border border-border bg-background p-3 text-sm"/><button type="button" disabled={!question.trim()||ask.isPending} onClick={()=>ask.mutate()} className="mt-2 inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground disabled:opacity-50"><Send className="h-4 w-4"/> {copy.send}</button></article></section>

    <section id="conteudo-treinamento" className={`min-w-0 overflow-hidden rounded-2xl border shadow-sm ${theme === "dark" ? "border-slate-700 bg-slate-950" : "border-border bg-background"}`}><iframe ref={iframeRef} onLoad={applyReaderPreferences} title="Do Mamão ao Negócio — treinamento completo" srcDoc={data.html} className="block w-full border-0" style={{minHeight:"calc(100vh - 150px)",height:"1200px"}} allow="clipboard-write" /></section>
  </div>;
}

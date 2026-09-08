import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, CheckCircle2, Cloud, GraduationCap, Moon, Sun, ZoomIn, ZoomOut } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { clientDoMamaoTrainingExperience, clientSaveDoMamaoTrainingState } from "@/lib/training-commerce.functions";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_clientarea/cliente/treinamentos/do-mamao-ao-negocio")({ component: DoMamaoTraining });

type Locale = "pt" | "en" | "fr" | "es";
const COPY = {
  pt: { back:"Meus treinamentos", meta:"Treinamento · 3 meses · 300 horas", desc:"Sistema S8 · atividades · quizzes · Laboratório de Campo · Projeto de Negócio · fórum · encontros ao vivo", synced:"Sincronizado com sua conta", saving:"Salvando na nuvem…", failed:"Falha ao sincronizar — sua resposta continua salva neste dispositivo", progress:"Progresso", cohort:"Turma", certificate:"Certificado disponível a partir de", loading:"Carregando seu treinamento…", unavailable:"Não foi possível abrir o treinamento. Confirme que sua compra já foi aprovada.", library:"Voltar à Biblioteca", light:"Claro", dark:"Escuro", smaller:"Diminuir letra", larger:"Aumentar letra", language:"Idioma", reading:"Aparência", access:"Acesso ao treinamento", accessHelp:"Seu progresso é salvo automaticamente. Continue de onde parou sempre que voltar ao painel." },
  en: { back:"My training", meta:"Training · 3 months · 300 hours", desc:"S8 System · activities · quizzes · Field Lab · Business Project · forum · live meetings", synced:"Synced with your account", saving:"Saving to the cloud…", failed:"Sync failed — your answer remains saved on this device", progress:"Progress", cohort:"Cohort", certificate:"Certificate available from", loading:"Loading your training…", unavailable:"The training could not be opened. Confirm that your purchase has been approved.", library:"Back to Library", light:"Light", dark:"Dark", smaller:"Smaller text", larger:"Larger text", language:"Language", reading:"Appearance", access:"Training access", accessHelp:"Your progress is saved automatically. Continue where you left off whenever you return to the panel." },
  fr: { back:"Mes formations", meta:"Formation · 3 mois · 300 heures", desc:"Système S8 · activités · quiz · Laboratoire de Terrain · Projet d’Entreprise · forum · rencontres en direct", synced:"Synchronisé avec votre compte", saving:"Enregistrement dans le cloud…", failed:"Échec de la synchronisation — votre réponse reste enregistrée sur cet appareil", progress:"Progression", cohort:"Groupe", certificate:"Certificat disponible à partir du", loading:"Chargement de votre formation…", unavailable:"Impossible d’ouvrir la formation. Vérifiez que votre achat a été confirmé.", library:"Retour à la bibliothèque", light:"Clair", dark:"Sombre", smaller:"Réduire le texte", larger:"Agrandir le texte", language:"Langue", reading:"Apparence", access:"Accès à la formation", accessHelp:"Votre progression est enregistrée automatiquement. Reprenez où vous vous êtes arrêté à chaque retour sur le panneau." },
  es: { back:"Mis entrenamientos", meta:"Entrenamiento · 3 meses · 300 horas", desc:"Sistema S8 · actividades · cuestionarios · Laboratorio de Campo · Proyecto de Negocio · foro · encuentros en vivo", synced:"Sincronizado con tu cuenta", saving:"Guardando en la nube…", failed:"Falló la sincronización — tu respuesta permanece guardada en este dispositivo", progress:"Progreso", cohort:"Grupo", certificate:"Certificado disponible a partir del", loading:"Cargando tu entrenamiento…", unavailable:"No fue posible abrir el entrenamiento. Confirma que tu compra ya fue aprobada.", library:"Volver a la Biblioteca", light:"Claro", dark:"Oscuro", smaller:"Reducir letra", larger:"Aumentar letra", language:"Idioma", reading:"Apariencia", access:"Acceso al entrenamiento", accessHelp:"Tu progreso se guarda automáticamente. Continúa desde donde lo dejaste cada vez que vuelvas al panel." },
} as const;

function DoMamaoTraining() {
  const { locale: appLocale } = useI18n();
  const [locale, setLocale] = useState<Locale>((appLocale === "pt" || appLocale === "en" || appLocale === "fr" || appLocale === "es" ? appLocale : "pt") as Locale);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [scale, setScale] = useState(1);
  const copy = COPY[locale];
  const experienceFn = useServerFn(clientDoMamaoTrainingExperience);
  const saveFn = useServerFn(clientSaveDoMamaoTrainingState);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [syncLabel, setSyncLabel] = useState(copy.synced);
  const [cloudProgress, setCloudProgress] = useState(0);

  const { data, isLoading, error } = useQuery({ queryKey: ["do-mamao-training-experience"], queryFn: () => experienceFn({}) });
  useEffect(() => { if (data) setCloudProgress(data.progressPercent); }, [data]);
  useEffect(() => { setSyncLabel(copy.synced); }, [copy.synced]);

  const save = useMutation({
    mutationFn: (state: Record<string, unknown>) => saveFn({ data: { state } }),
    onMutate: () => setSyncLabel(copy.saving),
    onSuccess: (result) => { setCloudProgress(result.progressPercent); setSyncLabel(copy.synced); },
    onError: () => setSyncLabel(copy.failed),
  });

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
    if (!style) {
      style = doc.createElement("style");
      style.id = "ldr-panel-reader-preferences";
      doc.head?.appendChild(style);
    }

    style.textContent = theme === "dark"
      ? `
        html,body{background:#0f172a!important;color:#f8fafc!important;color-scheme:dark!important}
        body{min-height:100vh}
        body *{border-color:#475569}
        article,section,.card,.module,.panel,.content,.page,.box,.container,.lesson,.quiz,.atividade{background-color:#111827!important;color:#f8fafc!important}
        h1,h2,h3,h4,h5,h6,p,li,label,small,span{color:inherit}
        input,textarea,select{background:#0f172a!important;color:#fff!important;border-color:#64748b!important}
        button:not([disabled]),a[role='button'],.btn{filter:none!important}
      `
      : `
        html,body{background:#ffffff!important;color:#172033!important;color-scheme:light!important}
        article,section,.card,.module,.panel,.content,.page,.box,.container,.lesson,.quiz,.atividade{color:inherit}
        input,textarea,select{color:inherit}
      `;

    // O conteúdo incorporado não deve expor controles administrativos na experiência do cliente.
    const adminPattern = /^(admin|administrador|administração|administration|administrator|área admin|painel admin)$/i;
    doc.querySelectorAll<HTMLElement>("a,button,[role='button']").forEach((el) => {
      const label = (el.textContent || el.getAttribute("aria-label") || "").trim();
      if (adminPattern.test(label)) {
        el.style.display = "none";
        el.setAttribute("aria-hidden", "true");
      }
    });

    frame?.contentWindow?.postMessage({ type:"ldr-training-preferences", locale, theme, scale }, "*");
    try { frame?.contentWindow?.localStorage?.setItem("ldr_training_locale", locale); } catch { /* srcDoc pode bloquear storage em alguns navegadores */ }
  }, [locale, scale, theme]);

  useEffect(() => { applyReaderPreferences(); }, [applyReaderPreferences, data]);

  if (isLoading) return <div className="s8-card"><p className="text-sm text-muted-foreground">{copy.loading}</p></div>;
  if (error || !data) return <div className="s8-card"><h1 className="font-serif text-2xl">Do Mamão ao Negócio</h1><p className="mt-2 text-sm text-muted-foreground">{copy.unavailable}</p><a href="/cliente/biblioteca" className="mt-4 inline-flex min-h-11 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground">{copy.library}</a></div>;

  return <div className="min-w-0 space-y-4">
    <section className="s8-card" style={{ background:"linear-gradient(145deg,#0b2341,#071426)", color:"#ffffff", borderColor:"#c9a63a" }}>
      <div className="flex min-w-0 flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1">
          <a href="/cliente/treinamentos" className="inline-flex min-h-11 items-center gap-1 text-xs font-bold opacity-80 hover:opacity-100"><ArrowLeft className="h-4 w-4"/> {copy.back}</a>
          <p className="mt-3 break-words text-xs font-bold uppercase tracking-[.18em]" style={{color:"#d6ad63"}}>{copy.meta}</p>
          <h1 className="mt-1 flex min-w-0 items-center gap-2 break-words !text-[#f7ead8] font-serif text-2xl sm:text-3xl"><GraduationCap className="h-7 w-7 shrink-0"/> Do Mamão ao Negócio</h1>
          <p className="mt-2 break-words text-sm leading-6 opacity-85">{copy.desc}</p>
          <div className="mt-4 max-w-2xl rounded-xl border px-4 py-3 text-sm" style={{borderColor:"rgba(214,173,99,.45)",background:"rgba(255,255,255,.05)"}}>
            <strong className="block text-[#f7ead8]">{copy.access}</strong>
            <span className="mt-1 block text-xs leading-5 opacity-85">{copy.accessHelp}</span>
          </div>
        </div>
        <div className="grid min-w-0 gap-3">
          <div className="rounded-xl border p-3" style={{borderColor:"#b58a44",background:"rgba(255,255,255,.05)"}}>
            <p className="mb-2 text-xs font-bold uppercase tracking-[.12em] opacity-80">{copy.reading}</p>
            <div className="flex flex-wrap gap-2" aria-label="Controles de leitura">
              <button type="button" aria-pressed={theme === "light"} onClick={() => setTheme("light")} className={`inline-flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold ${theme === "light" ? "bg-white text-slate-900" : ""}`}><Sun className="h-4 w-4"/> {copy.light}</button>
              <button type="button" aria-pressed={theme === "dark"} onClick={() => setTheme("dark")} className={`inline-flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold ${theme === "dark" ? "bg-slate-950 text-white" : ""}`}><Moon className="h-4 w-4"/> {copy.dark}</button>
              <button type="button" aria-label={copy.smaller} onClick={() => setScale(v => Math.max(.9, +(v-.1).toFixed(1)))} className="inline-flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold"><ZoomOut className="h-4 w-4"/> A−</button>
              <button type="button" aria-label={copy.larger} onClick={() => setScale(v => Math.min(1.4, +(v+.1).toFixed(1)))} className="inline-flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold"><ZoomIn className="h-4 w-4"/> A+</button>
              <label className="inline-flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold"><span>{copy.language}</span><select value={locale} onChange={e => setLocale(e.target.value as Locale)} className="bg-transparent font-bold"><option value="pt">PT</option><option value="en">EN</option><option value="fr">FR</option><option value="es">ES</option></select></label>
            </div>
          </div>
          <div className="min-w-[220px] rounded-xl border p-4" style={{borderColor:"#b58a44",background:"rgba(255,255,255,.06)"}}><div className="flex items-center gap-2 text-sm font-bold"><Cloud className="h-4 w-4"/> {syncLabel}</div><div className="mt-3 flex items-center justify-between text-xs"><span>{copy.progress}</span><strong>{cloudProgress}%</strong></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-black/25"><div className="h-full rounded-full" style={{width:`${cloudProgress}%`,background:"#d6ad63"}}/></div>{data.cohortNumber ? <p className="mt-3 text-xs">{copy.cohort} {data.cohortNumber}</p> : null}{data.certificateAvailableAt ? <p className="mt-2 flex items-center gap-1 text-xs"><CheckCircle2 className="h-4 w-4"/> {copy.certificate} {new Date(data.certificateAvailableAt).toLocaleDateString(locale === "pt" ? "pt-BR" : locale === "fr" ? "fr-FR" : locale === "es" ? "es-ES" : "en-US")}</p> : null}</div>
        </div>
      </div>
    </section>
    <section className={`min-w-0 overflow-hidden rounded-2xl border shadow-sm ${theme === "dark" ? "border-slate-700 bg-slate-950" : "border-border bg-background"}`}>
      <iframe ref={iframeRef} onLoad={applyReaderPreferences} title="Do Mamão ao Negócio — treinamento completo" srcDoc={data.html} className="block w-full border-0" style={{minHeight:"calc(100vh - 150px)",height:"1200px"}} allow="clipboard-write" />
    </section>
  </div>;
}

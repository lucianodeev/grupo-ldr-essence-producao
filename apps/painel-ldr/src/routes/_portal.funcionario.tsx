import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Building2, Gift, LogOut } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { LanguageSelect, useI18n } from "@/lib/i18n";
import { employeeContext, employeeRequestBenefit } from "@/lib/organization-portal.functions";

export const Route = createFileRoute("/_portal/funcionario")({ component: EmployeePortal });

type AnyRow = Record<string, any>;

const COPY = {
  pt: {
    title: "Área do Funcionário", signOut: "Sair", loading: "Carregando benefícios…", loadError: "Não foi possível carregar seus benefícios.",
    unlinkedTitle: "Acesso ainda não vinculado", unlinkedText: "Não localizamos seu e-mail na lista de funcionários de uma empresa. Peça ao responsável da empresa para cadastrar exatamente o e-mail desta conta Google.",
    blockedTitle: "Benefício temporariamente inativo", blockedText: "Seu cadastro existe, mas a empresa desativou o acesso aos benefícios. Fale com o responsável da sua empresa.",
    eyebrow: "Seus benefícios", hello: "Olá", intro: "Aqui aparecem somente os serviços que sua empresa comprou e atribuiu a você.",
    noneTitle: "Nenhum benefício liberado ainda", noneText: "Quando sua empresa concluir uma compra e selecionar você como beneficiário, o serviço aparecerá aqui automaticamente.",
    available: "Disponível", requested: "Solicitado", used: "Utilizado", benefit: "Benefício", credits: "crédito(s) disponível(is)",
    requestSuccess: "Solicitação enviada. A equipe poderá seguir com o agendamento.", requestError: "Não foi possível solicitar.", sending: "Enviando…", use: "Usar / solicitar benefício",
    requestedText: "Sua solicitação já foi registrada e está aguardando organização do atendimento.", noCredit: "Este benefício não possui crédito disponível para nova solicitação.",
  },
  en: {
    title: "Employee Area", signOut: "Sign out", loading: "Loading benefits…", loadError: "Could not load your benefits.",
    unlinkedTitle: "Access not linked yet", unlinkedText: "We could not find your email in a company's employee list. Ask the company administrator to register the exact email used by this Google account.",
    blockedTitle: "Benefit temporarily inactive", blockedText: "Your registration exists, but the company has disabled access to benefits. Contact your company administrator.",
    eyebrow: "Your benefits", hello: "Hello", intro: "Only services purchased by your company and assigned to you appear here.",
    noneTitle: "No benefits available yet", noneText: "When your company completes a purchase and selects you as a beneficiary, the service will appear here automatically.",
    available: "Available", requested: "Requested", used: "Used", benefit: "Benefit", credits: "credit(s) available",
    requestSuccess: "Request sent. The team can now organize the appointment.", requestError: "Could not send the request.", sending: "Sending…", use: "Use / request benefit",
    requestedText: "Your request has already been registered and is waiting for the service to be organized.", noCredit: "This benefit has no credit available for a new request.",
  },
  fr: {
    title: "Espace Collaborateur", signOut: "Se déconnecter", loading: "Chargement des avantages…", loadError: "Impossible de charger vos avantages.",
    unlinkedTitle: "Accès pas encore associé", unlinkedText: "Votre e-mail n’a pas été trouvé dans la liste des collaborateurs d’une entreprise. Demandez au responsable d’enregistrer exactement l’adresse e-mail de ce compte Google.",
    blockedTitle: "Avantage temporairement inactif", blockedText: "Votre inscription existe, mais l’entreprise a désactivé l’accès aux avantages. Contactez le responsable de votre entreprise.",
    eyebrow: "Vos avantages", hello: "Bonjour", intro: "Seuls les services achetés par votre entreprise et qui vous sont attribués apparaissent ici.",
    noneTitle: "Aucun avantage disponible pour le moment", noneText: "Lorsque votre entreprise finalise un achat et vous sélectionne comme bénéficiaire, le service apparaît automatiquement ici.",
    available: "Disponible", requested: "Demandé", used: "Utilisé", benefit: "Avantage", credits: "crédit(s) disponible(s)",
    requestSuccess: "Demande envoyée. L’équipe peut maintenant organiser le rendez-vous.", requestError: "Impossible d’envoyer la demande.", sending: "Envoi…", use: "Utiliser / demander l’avantage",
    requestedText: "Votre demande est déjà enregistrée et attend l’organisation du service.", noCredit: "Cet avantage ne dispose plus de crédit pour une nouvelle demande.",
  },
  es: {
    title: "Área del Empleado", signOut: "Salir", loading: "Cargando beneficios…", loadError: "No fue posible cargar tus beneficios.",
    unlinkedTitle: "Acceso aún no vinculado", unlinkedText: "No encontramos tu correo en la lista de empleados de una empresa. Pide al responsable que registre exactamente el correo de esta cuenta de Google.",
    blockedTitle: "Beneficio temporalmente inactivo", blockedText: "Tu registro existe, pero la empresa desactivó el acceso a los beneficios. Habla con el responsable de tu empresa.",
    eyebrow: "Tus beneficios", hello: "Hola", intro: "Aquí aparecen únicamente los servicios que tu empresa compró y te asignó.",
    noneTitle: "Aún no hay beneficios disponibles", noneText: "Cuando tu empresa complete una compra y te seleccione como beneficiario, el servicio aparecerá aquí automáticamente.",
    available: "Disponible", requested: "Solicitado", used: "Utilizado", benefit: "Beneficio", credits: "crédito(s) disponible(s)",
    requestSuccess: "Solicitud enviada. El equipo podrá organizar la cita.", requestError: "No fue posible enviar la solicitud.", sending: "Enviando…", use: "Usar / solicitar beneficio",
    requestedText: "Tu solicitud ya fue registrada y está esperando la organización del servicio.", noCredit: "Este beneficio no tiene crédito disponible para una nueva solicitud.",
  },
} as const;

const SERVICE_NAMES: Record<string, Record<string, string>> = {
  massagem_laboral_10_eu: { pt: "Massagem Laboral — 10 min", en: "Workplace Massage — 10 min", fr: "Massage en entreprise — 10 min", es: "Masaje Laboral — 10 min" },
  massagem_laboral_15_eu: { pt: "Massagem Laboral — 15 min", en: "Workplace Massage — 15 min", fr: "Massage en entreprise — 15 min", es: "Masaje Laboral — 15 min" },
  massagem_laboral_20_eu: { pt: "Massagem Laboral — 20 min", en: "Workplace Massage — 20 min", fr: "Massage en entreprise — 20 min", es: "Masaje Laboral — 20 min" },
  massagem_laboral_30_eu: { pt: "Massagem Laboral — 30 min", en: "Workplace Massage — 30 min", fr: "Massage en entreprise — 30 min", es: "Masaje Laboral — 30 min" },
  massagem_laboral_40_eu: { pt: "Massagem Laboral — até 40 min", en: "Workplace Massage — up to 40 min", fr: "Massage en entreprise — jusqu’à 40 min", es: "Masaje Laboral — hasta 40 min" },
  orientacao_profissional_eu: { pt: "Orientação profissional", en: "Career guidance", fr: "Orientation professionnelle", es: "Orientación profesional" },
  orientacao_profissional_br: { pt: "Orientação profissional", en: "Career guidance", fr: "Orientation professionnelle", es: "Orientación profesional" },
  plano_carreira_eu: { pt: "Diagnóstico de Carreira + Plano Profissional", en: "Career Assessment + Professional Plan", fr: "Diagnostic de carrière + Plan professionnel", es: "Diagnóstico de carrera + Plan profesional" },
  plano_carreira_br: { pt: "Diagnóstico de Carreira + Plano Profissional", en: "Career Assessment + Professional Plan", fr: "Diagnostic de carrière + Plan professionnel", es: "Diagnóstico de carrera + Plan profesional" },
  transicao_carreira_eu: { pt: "Transição de carreira", en: "Career transition", fr: "Transition de carrière", es: "Transición de carrera" },
  transicao_carreira_br: { pt: "Transição de carreira", en: "Career transition", fr: "Transition de carrière", es: "Transición de carrera" },
  carreira_internacional_eu: { pt: "Carreira Internacional", en: "International Career", fr: "Carrière internationale", es: "Carrera internacional" },
  carreira_internacional_br: { pt: "Carreira Internacional", en: "International Career", fr: "Carrière internationale", es: "Carrera internacional" },
  mentoria_sessao: { pt: "Sessão Individual de Mentoria", en: "Individual Mentorship Session", fr: "Séance individuelle de mentorat", es: "Sesión individual de mentoría" },
  mentoria_4: { pt: "Mentoria — 4 sessões", en: "Mentorship — 4 sessions", fr: "Mentorat — 4 séances", es: "Mentoría — 4 sesiones" },
  mentoria_8: { pt: "Mentoria — 8 sessões", en: "Mentorship — 8 sessions", fr: "Mentorat — 8 séances", es: "Mentoría — 8 sesiones" },
  psicanalise_clinica_eu: { pt: "Psicanálise Clínica — Sessão Online", en: "Clinical Psychoanalysis — Online Session", fr: "Psychanalyse clinique — Séance en ligne", es: "Psicoanálisis clínico — Sesión online" },
  psicanalise_clinica_br: { pt: "Psicanálise Clínica — Sessão Online", en: "Clinical Psychoanalysis — Online Session", fr: "Psychanalyse clinique — Séance en ligne", es: "Psicoanálisis clínico — Sesión online" },
};

function EmployeePortal() {
  const { locale } = useI18n();
  const copy = COPY[locale];
  const navigate = useNavigate();
  const getContext = useServerFn(employeeContext);
  const requestBenefit = useServerFn(employeeRequestBenefit);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try { setData(await getContext()); }
    catch { toast.error(copy.loadError); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);

  async function signOut() { await supabase.auth.signOut(); navigate({ to: "/funcionario/login", replace: true }); }
  const serviceName = (benefit: AnyRow) => SERVICE_NAMES[benefit.catalog_key]?.[locale] ?? benefit.service?.name ?? copy.benefit;

  if (loading) return <div className="min-h-screen p-6"><div className="s8-card mx-auto max-w-md text-center">{copy.loading}</div></div>;

  return <div className="min-h-screen" style={{ background: "var(--cream)" }}>
    <header className="text-primary-foreground" style={{ background: "linear-gradient(135deg, var(--wine-deep), var(--wine))" }}><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6"><div><p className="font-serif text-xl sm:text-2xl">Grupo LDR Essence</p><p className="text-xs opacity-80">{copy.title}</p></div><div className="flex items-center gap-3"><LanguageSelect/><button type="button" onClick={signOut} className="flex items-center gap-2 rounded-lg border border-white/30 px-3 py-2 text-sm font-bold"><LogOut className="h-4 w-4"/>{copy.signOut}</button></div></div></header>
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {data?.status === "unlinked" ? <Message title={copy.unlinkedTitle} text={copy.unlinkedText}/> : data?.status === "blocked" ? <Message title={copy.blockedTitle} text={copy.blockedText}/> : <>
        <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">{copy.eyebrow}</p><h1 className="mt-1 font-serif text-3xl sm:text-4xl">{copy.hello}, {data?.member?.full_name}</h1><p className="mt-2 text-sm text-muted-foreground">{copy.intro}</p></div>{data?.organization?.name && <span className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-2 text-xs font-bold text-primary"><Building2 className="h-4 w-4"/>{data.organization.name}</span>}</div>
        <section className="mt-7 grid gap-4 sm:grid-cols-2">{(data?.benefits ?? []).length === 0 ? <div className="s8-card sm:col-span-2"><Gift className="h-6 w-6 text-primary"/><h2 className="mt-3 font-serif text-2xl">{copy.noneTitle}</h2><p className="mt-2 text-sm text-muted-foreground">{copy.noneText}</p></div> : (data.benefits as AnyRow[]).map((benefit) => {
          const remaining = Math.max(Number(benefit.credits_granted) - Number(benefit.credits_used), 0);
          const assigned = benefit.status === "assigned";
          const status = benefit.status === "assigned" ? copy.available : benefit.status === "requested" ? copy.requested : benefit.status === "used" ? copy.used : benefit.status;
          return <article key={benefit.id} className="s8-card min-w-0"><div className="flex items-start justify-between gap-3"><span className="rounded-2xl bg-primary/10 p-3 text-primary"><Gift className="h-5 w-5"/></span><span className="rounded-full bg-muted px-2.5 py-1 text-xs font-bold">{status}</span></div><h2 className="mt-4 break-words font-serif text-2xl">{serviceName(benefit)}</h2><div className="mt-3 rounded-xl bg-primary/5 p-3"><p className="text-sm"><strong>{remaining}</strong> / {benefit.credits_granted} {copy.credits}</p></div>{assigned && remaining > 0 ? <button type="button" disabled={busyId===benefit.id} onClick={async()=>{setBusyId(benefit.id);try{await requestBenefit({data:{benefitId:benefit.id}});toast.success(copy.requestSuccess);await load();}catch{toast.error(copy.requestError);}finally{setBusyId(null);}}} className="mt-4 w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground disabled:opacity-60">{busyId===benefit.id?copy.sending:copy.use}</button> : <p className="mt-4 text-xs text-muted-foreground">{benefit.status === "requested" ? copy.requestedText : copy.noCredit}</p>}</article>;
        })}</section>
      </>}
    </main>
  </div>;
}

function Message({ title, text }: { title: string; text: string }) { return <section className="s8-card mx-auto max-w-2xl text-center"><h1 className="font-serif text-3xl">{title}</h1><p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">{text}</p></section>; }

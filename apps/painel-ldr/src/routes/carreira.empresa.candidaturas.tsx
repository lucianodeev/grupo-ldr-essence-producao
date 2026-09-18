import { useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Accessibility,
  AlertCircle,
  ArrowLeft,
  BriefcaseBusiness,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { LanguageSelect, useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/carreira/empresa/candidaturas")({
  component: CompanyApplicationsPage,
});

type Locale = "pt" | "en" | "fr" | "es";
type StatusKey = "received" | "in_review" | "interview" | "finalist" | "rejected" | "hired" | "archived";
type Copy = typeof C.pt;

type ApplicationRow = {
  id: string;
  jobId: string;
  jobTitle: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string | null;
  candidateLocation: string | null;
  profileUrl: string | null;
  summary: string | null;
  accessibilityNeeds: string | null;
  communicationPreference: string | null;
  shareAccessibility: boolean;
  allowLdrSupport: boolean;
  status: StatusKey;
  createdAt: string | null;
  companyNote: string | null;
  rejectionReason: string | null;
};

const statusKeys: StatusKey[] = ["received", "in_review", "interview", "finalist", "rejected", "hired", "archived"];
const closedStatuses = new Set<StatusKey>(["rejected", "hired", "archived"]);

const C = {
  pt: {
    back: "Voltar para área da empresa",
    guide: "Guia de triagem responsável",
    title: "Triagem de candidaturas",
    sub: "Acompanhe candidaturas reais das suas vagas e registre decisões com critérios objetivos, acessíveis e respeitosos.",
    login: "Entre na sua conta para visualizar candidaturas da empresa.",
    loadError: "Não foi possível carregar as candidaturas agora.",
    noCompany: "Nenhuma empresa vinculada ao seu usuário foi encontrada.",
    noJobs: "Sua empresa ainda não possui vagas cadastradas.",
    pendingStructure: "A estrutura final de candidaturas ainda não está ativa no banco. A migration já deve ser revisada antes da produção.",
    untitledJob: "Vaga sem título",
    received: "Recebida",
    in_review: "Em análise",
    interview: "Entrevista",
    finalist: "Finalista",
    rejected: "Recusada",
    hired: "Contratada",
    archived: "Arquivada",
    total: "Total",
    active: "Ativas",
    closed: "Finalizadas",
    filter: "Filtrar por status",
    all: "Todas",
    loading: "Carregando candidaturas…",
    empty: "Nenhuma candidatura encontrada para este filtro.",
    candidate: "Candidato",
    job: "Vaga",
    contact: "Contato",
    accessibility: "Acessibilidade",
    accessibilityShared: "Compartilhada com autorização",
    accessibilityNotShared: "Não compartilhada com a empresa",
    ldrSupport: "Apoio LDR autorizado",
    summary: "Resumo da candidatura",
    profile: "Perfil / currículo",
    communication: "Preferência de comunicação",
    created: "Recebida em",
    note: "Nota objetiva da triagem",
    notePlaceholder: "Ex.: requisitos atendidos, pontos a confirmar, motivo objetivo da decisão…",
    save: "Atualizar status",
    saving: "Salvando…",
    updateSuccess: "Status atualizado com segurança.",
    updateError: "Não foi possível atualizar agora.",
    mustReason: "Para recusar, registre um motivo objetivo relacionado à vaga.",
    refresh: "Atualizar lista",
    protectedTitle: "Regra de proteção",
    protectedText: "Dados de acessibilidade não devem ser usados como filtro negativo. Eles servem apenas para adaptação, comunicação e participação justa no processo seletivo.",
  },
  en: {
    back: "Back to company area",
    guide: "Responsible triage guide",
    title: "Application triage",
    sub: "Track real applications for your jobs and record decisions with objective, accessible and respectful criteria.",
    login: "Sign in to view company applications.",
    loadError: "Unable to load applications now.",
    noCompany: "No company linked to your user was found.",
    noJobs: "Your company has no jobs yet.",
    pendingStructure: "The final applications structure is not active in the database yet. The migration must be reviewed before production.",
    untitledJob: "Untitled job",
    received: "Received",
    in_review: "In review",
    interview: "Interview",
    finalist: "Finalist",
    rejected: "Rejected",
    hired: "Hired",
    archived: "Archived",
    total: "Total",
    active: "Active",
    closed: "Closed",
    filter: "Filter by status",
    all: "All",
    loading: "Loading applications…",
    empty: "No applications found for this filter.",
    candidate: "Candidate",
    job: "Job",
    contact: "Contact",
    accessibility: "Accessibility",
    accessibilityShared: "Shared with consent",
    accessibilityNotShared: "Not shared with the company",
    ldrSupport: "LDR support authorized",
    summary: "Application summary",
    profile: "Profile / resume",
    communication: "Communication preference",
    created: "Received at",
    note: "Objective triage note",
    notePlaceholder: "E.g. requirements met, points to confirm, objective reason for the decision…",
    save: "Update status",
    saving: "Saving…",
    updateSuccess: "Status updated safely.",
    updateError: "Unable to update now.",
    mustReason: "To reject, record an objective job-related reason.",
    refresh: "Refresh list",
    protectedTitle: "Protection rule",
    protectedText: "Accessibility data must not be used as a negative filter. It exists only for accommodation, communication and fair participation in the selection process.",
  },
  fr: {
    back: "Retour à l’espace entreprise",
    guide: "Guide de triage responsable",
    title: "Tri des candidatures",
    sub: "Suivez les candidatures réelles de vos offres et enregistrez les décisions avec des critères objectifs, accessibles et respectueux.",
    login: "Connectez-vous pour visualiser les candidatures de l’entreprise.",
    loadError: "Impossible de charger les candidatures maintenant.",
    noCompany: "Aucune entreprise liée à votre utilisateur n’a été trouvée.",
    noJobs: "Votre entreprise n’a pas encore d’offres.",
    pendingStructure: "La structure finale des candidatures n’est pas encore active dans la base. La migration doit être revue avant la production.",
    untitledJob: "Offre sans titre",
    received: "Reçue",
    in_review: "En analyse",
    interview: "Entretien",
    finalist: "Finaliste",
    rejected: "Refusée",
    hired: "Embauchée",
    archived: "Archivée",
    total: "Total",
    active: "Actives",
    closed: "Terminées",
    filter: "Filtrer par statut",
    all: "Toutes",
    loading: "Chargement des candidatures…",
    empty: "Aucune candidature trouvée pour ce filtre.",
    candidate: "Candidat",
    job: "Offre",
    contact: "Contact",
    accessibility: "Accessibilité",
    accessibilityShared: "Partagée avec autorisation",
    accessibilityNotShared: "Non partagée avec l’entreprise",
    ldrSupport: "Soutien LDR autorisé",
    summary: "Résumé de la candidature",
    profile: "Profil / CV",
    communication: "Préférence de communication",
    created: "Reçue le",
    note: "Note objective de triage",
    notePlaceholder: "Ex. exigences remplies, points à confirmer, raison objective de la décision…",
    save: "Mettre à jour le statut",
    saving: "Enregistrement…",
    updateSuccess: "Statut mis à jour en sécurité.",
    updateError: "Impossible de mettre à jour maintenant.",
    mustReason: "Pour refuser, indiquez une raison objective liée à l’offre.",
    refresh: "Actualiser la liste",
    protectedTitle: "Règle de protection",
    protectedText: "Les données d’accessibilité ne doivent pas être utilisées comme filtre négatif. Elles servent uniquement à l’adaptation, à la communication et à une participation équitable.",
  },
  es: {
    back: "Volver al área de empresa",
    guide: "Guía de triage responsable",
    title: "Triage de candidaturas",
    sub: "Acompaña candidaturas reales de tus vacantes y registra decisiones con criterios objetivos, accesibles y respetuosos.",
    login: "Inicia sesión para ver las candidaturas de la empresa.",
    loadError: "No fue posible cargar las candidaturas ahora.",
    noCompany: "No se encontró ninguna empresa vinculada a tu usuario.",
    noJobs: "Tu empresa aún no tiene vacantes registradas.",
    pendingStructure: "La estructura final de candidaturas aún no está activa en la base. La migración debe revisarse antes de producción.",
    untitledJob: "Vacante sin título",
    received: "Recibida",
    in_review: "En análisis",
    interview: "Entrevista",
    finalist: "Finalista",
    rejected: "Rechazada",
    hired: "Contratada",
    archived: "Archivada",
    total: "Total",
    active: "Activas",
    closed: "Finalizadas",
    filter: "Filtrar por estado",
    all: "Todas",
    loading: "Cargando candidaturas…",
    empty: "No hay candidaturas para este filtro.",
    candidate: "Candidato",
    job: "Vacante",
    contact: "Contacto",
    accessibility: "Accesibilidad",
    accessibilityShared: "Compartida con autorización",
    accessibilityNotShared: "No compartida con la empresa",
    ldrSupport: "Apoyo LDR autorizado",
    summary: "Resumen de la candidatura",
    profile: "Perfil / CV",
    communication: "Preferencia de comunicación",
    created: "Recibida el",
    note: "Nota objetiva del triage",
    notePlaceholder: "Ej.: requisitos cumplidos, puntos a confirmar, motivo objetivo de la decisión…",
    save: "Actualizar estado",
    saving: "Guardando…",
    updateSuccess: "Estado actualizado con seguridad.",
    updateError: "No fue posible actualizar ahora.",
    mustReason: "Para rechazar, registra un motivo objetivo relacionado con la vacante.",
    refresh: "Actualizar lista",
    protectedTitle: "Regla de protección",
    protectedText: "Los datos de accesibilidad no deben usarse como filtro negativo. Sirven solo para adaptación, comunicación y participación justa.",
  },
} as const;

function isLocale(value: string): value is Locale {
  return value === "pt" || value === "en" || value === "fr" || value === "es";
}

function normalizeStatus(value?: string | null): StatusKey {
  if (value === "submitted") return "received";
  return statusKeys.includes(value as StatusKey) ? (value as StatusKey) : "received";
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
  } catch {
    return value;
  }
}

function getStatusLabel(status: StatusKey, t: Copy) {
  return t[status];
}

function CompanyApplicationsPage() {
  const { locale } = useI18n();
  const t = C[isLocale(locale) ? locale : "pt"];
  const [rows, setRows] = useState<ApplicationRow[]>([]);
  const [statusFilter, setStatusFilter] = useState<"all" | StatusKey>("all");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const filteredRows = useMemo(
    () => statusFilter === "all" ? rows : rows.filter((row) => row.status === statusFilter),
    [rows, statusFilter],
  );
  const stats = useMemo(() => ({
    total: rows.length,
    active: rows.filter((row) => !closedStatuses.has(row.status)).length,
    closed: rows.filter((row) => closedStatuses.has(row.status)).length,
  }), [rows]);

  const load = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    const { data: sessionData } = await supabase.auth.getUser();
    const userId = sessionData.user?.id;
    if (!userId) {
      setRows([]);
      setMessage({ type: "error", text: t.login });
      setLoading(false);
      return;
    }

    const { data: companies, error: companiesError } = await (supabase.from("career_companies" as never) as any)
      .select("id,name")
      .eq("owner_user_id", userId);
    if (companiesError) {
      setRows([]);
      setMessage({ type: "error", text: t.loadError });
      setLoading(false);
      return;
    }

    const companyIds = ((companies ?? []) as Array<{ id: string }>).map((company) => company.id).filter(Boolean);
    if (!companyIds.length) {
      setRows([]);
      setMessage({ type: "error", text: t.noCompany });
      setLoading(false);
      return;
    }

    const { data: jobs, error: jobsError } = await (supabase.from("career_jobs" as never) as any)
      .select("id,title,company_id")
      .in("company_id", companyIds);
    if (jobsError) {
      setRows([]);
      setMessage({ type: "error", text: t.loadError });
      setLoading(false);
      return;
    }

    const jobRows = (jobs ?? []) as Array<{ id: string; title?: string | null }>;
    const jobIds = jobRows.map((job) => job.id).filter(Boolean);
    if (!jobIds.length) {
      setRows([]);
      setMessage({ type: "error", text: t.noJobs });
      setLoading(false);
      return;
    }

    const jobTitleById = new Map(jobRows.map((job) => [job.id, job.title ?? t.untitledJob]));
    const enhancedSelect = "id,job_id,candidate_name,candidate_email,candidate_phone,candidate_location,profile_url,summary,accessibility_needs,communication_preference,share_accessibility_with_company,allow_ldr_accessibility_support,status,company_note,rejection_reason,created_at,triaged_at";
    const baseSelect = "id,job_id,candidate_name,candidate_email,candidate_phone,candidate_location,profile_url,summary,accessibility_needs,communication_preference,share_accessibility_with_company,allow_ldr_accessibility_support,status,created_at";
    let result = await (supabase.from("career_applications" as never) as any)
      .select(enhancedSelect)
      .in("job_id", jobIds)
      .order("created_at", { ascending: false });

    if (result.error) {
      result = await (supabase.from("career_applications" as never) as any)
        .select(baseSelect)
        .in("job_id", jobIds)
        .order("created_at", { ascending: false });
    }

    if (result.error) {
      setRows([]);
      setMessage({ type: "error", text: t.pendingStructure });
      setLoading(false);
      return;
    }

    const mapped = ((result.data ?? []) as Array<Record<string, any>>).map((item) => ({
      id: String(item.id),
      jobId: String(item.job_id),
      jobTitle: jobTitleById.get(String(item.job_id)) ?? t.untitledJob,
      candidateName: String(item.candidate_name ?? ""),
      candidateEmail: String(item.candidate_email ?? ""),
      candidatePhone: item.candidate_phone ?? null,
      candidateLocation: item.candidate_location ?? null,
      profileUrl: item.profile_url ?? null,
      summary: item.summary ?? null,
      accessibilityNeeds: item.accessibility_needs ?? null,
      communicationPreference: item.communication_preference ?? null,
      shareAccessibility: Boolean(item.share_accessibility_with_company),
      allowLdrSupport: Boolean(item.allow_ldr_accessibility_support),
      status: normalizeStatus(item.status),
      createdAt: item.created_at ?? null,
      companyNote: item.company_note ?? null,
      rejectionReason: item.rejection_reason ?? null,
    }));

    setRows(mapped);
    setNotes(Object.fromEntries(mapped.map((row) => [row.id, row.rejectionReason ?? row.companyNote ?? ""])));
    setLoading(false);
  }, [t]);

  useEffect(() => { void load(); }, [load]);

  async function updateStatus(row: ApplicationRow, next: StatusKey) {
    const note = (notes[row.id] ?? "").trim();
    if (next === "rejected" && note.length < 8) {
      setMessage({ type: "error", text: t.mustReason });
      return;
    }
    setSavingId(row.id);
    setMessage(null);
    const enhancedPayload = {
      status: next,
      company_note: note || null,
      rejection_reason: next === "rejected" ? note : null,
      triaged_at: new Date().toISOString(),
    };
    let result = await (supabase.from("career_applications" as never) as any)
      .update(enhancedPayload)
      .eq("id", row.id);
    if (result.error) {
      result = await (supabase.from("career_applications" as never) as any)
        .update({ status: next })
        .eq("id", row.id);
    }
    setSavingId(null);
    if (result.error) {
      setMessage({ type: "error", text: t.updateError });
      return;
    }
    setRows((current) => current.map((item) => item.id === row.id ? { ...item, status: next, companyNote: note || item.companyNote, rejectionReason: next === "rejected" ? note : null } : item));
    setMessage({ type: "success", text: t.updateSuccess });
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <a href="/carreira/empresa" className="inline-flex items-center gap-2 text-sm font-bold text-[#07345b] hover:underline">
            <ArrowLeft size={18} aria-hidden="true" /> {t.back}
          </a>
          <LanguageSelect />
        </div>
      </header>

      <section className="bg-gradient-to-br from-[#052844] via-[#07345b] to-[#0b477a] text-white">
        <div className="mx-auto max-w-6xl px-5 py-12">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold">
            <BriefcaseBusiness size={16} aria-hidden="true" /> LDR Carreira
          </span>
          <h1 className="mt-5 text-4xl font-black tracking-tight md:text-5xl">{t.title}</h1>
          <p className="mt-4 max-w-3xl text-lg text-white/85">{t.sub}</p>
          <a href="/carreira/empresa/guia-triagem-responsavel" className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-[#07345b]">
            <ShieldCheck size={18} aria-hidden="true" /> {t.guide}
          </a>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 py-8">
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label={t.total} value={stats.total} />
          <StatCard label={t.active} value={stats.active} />
          <StatCard label={t.closed} value={stats.closed} />
        </div>

        <div className="mt-6 rounded-3xl border border-blue-100 bg-blue-50 p-5 text-[#07345b]">
          <h2 className="flex items-center gap-2 font-black"><ShieldCheck size={20} aria-hidden="true" /> {t.protectedTitle}</h2>
          <p className="mt-2 text-sm leading-relaxed">{t.protectedText}</p>
        </div>

        <div className="mt-6 flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-sm md:flex-row md:items-end md:justify-between">
          <label className="block text-sm font-bold text-slate-700">
            {t.filter}
            <select className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 md:w-72" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "all" | StatusKey)}>
              <option value="all">{t.all}</option>
              {statusKeys.map((status) => <option key={status} value={status}>{getStatusLabel(status, t)}</option>)}
            </select>
          </label>
          <button type="button" onClick={() => void load()} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-black text-[#07345b] hover:bg-slate-50">
            {t.refresh}
          </button>
        </div>

        {message && <div role="status" className={`mt-5 flex gap-2 rounded-2xl p-4 text-sm font-semibold ${message.type === "success" ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-900"}`}>
          {message.type === "success" ? <CheckCircle2 size={20} aria-hidden="true" /> : <AlertCircle size={20} aria-hidden="true" />}
          {message.text}
        </div>}

        {loading ? <div className="mt-8 flex items-center gap-3 rounded-3xl bg-white p-8 text-slate-600 shadow-sm"><Loader2 className="animate-spin" aria-hidden="true" /> {t.loading}</div> : null}

        {!loading && filteredRows.length === 0 ? <div className="mt-8 rounded-3xl bg-white p-8 text-slate-600 shadow-sm">{t.empty}</div> : null}

        <div className="mt-8 grid gap-5">
          {filteredRows.map((row) => (
            <article key={row.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">{getStatusLabel(row.status, t)}</span>
                  <h2 className="mt-3 flex items-center gap-2 text-2xl font-black text-[#07345b]"><UserRound aria-hidden="true" /> {row.candidateName}</h2>
                  <p className="mt-1 text-sm text-slate-500">{t.job}: {row.jobTitle}</p>
                </div>
                <div className="text-sm text-slate-500">{t.created}: {formatDate(row.createdAt)}</div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <Info title={t.contact}>
                  <p>{row.candidateEmail}</p>
                  {row.candidatePhone ? <p>{row.candidatePhone}</p> : null}
                  {row.candidateLocation ? <p>{row.candidateLocation}</p> : null}
                </Info>
                <Info title={t.accessibility} icon={<Accessibility size={18} aria-hidden="true" />}>
                  <p className="font-semibold">{row.shareAccessibility ? t.accessibilityShared : t.accessibilityNotShared}</p>
                  {row.shareAccessibility && row.accessibilityNeeds ? <p className="mt-1 text-slate-600">{row.accessibilityNeeds}</p> : null}
                  {row.allowLdrSupport ? <p className="mt-1 text-[#07345b]">{t.ldrSupport}</p> : null}
                  {row.communicationPreference ? <p className="mt-1 text-slate-600">{t.communication}: {row.communicationPreference}</p> : null}
                </Info>
              </div>

              {row.summary ? <Info title={t.summary} className="mt-4"><p>{row.summary}</p></Info> : null}
              {row.profileUrl ? <p className="mt-4 text-sm"><a href={row.profileUrl} target="_blank" rel="noreferrer" className="font-bold text-[#07345b] underline">{t.profile}</a></p> : null}

              <div className="mt-5 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
                <label className="block text-sm font-bold text-slate-700">
                  {t.note}
                  <textarea className="mt-2 min-h-24 w-full rounded-2xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-[#c99b2d] focus:ring-2 focus:ring-[#c99b2d]/20" placeholder={t.notePlaceholder} value={notes[row.id] ?? ""} onChange={(event) => setNotes((current) => ({ ...current, [row.id]: event.target.value }))} />
                </label>
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
                  <select className="rounded-xl border border-slate-300 px-4 py-3" value={row.status} onChange={(event) => void updateStatus(row, event.target.value as StatusKey)} disabled={savingId === row.id}>
                    {statusKeys.map((status) => <option key={status} value={status}>{getStatusLabel(status, t)}</option>)}
                  </select>
                  <button type="button" onClick={() => void updateStatus(row, row.status)} disabled={savingId === row.id} className="rounded-xl bg-[#07345b] px-5 py-3 text-sm font-black text-white disabled:opacity-60">
                    {savingId === row.id ? t.saving : t.save}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return <div className="rounded-3xl bg-white p-6 shadow-sm"><p className="text-sm font-bold text-slate-500">{label}</p><p className="mt-2 text-4xl font-black text-[#07345b]">{value}</p></div>;
}

function Info({ title, children, icon, className = "" }: { title: string; children: React.ReactNode; icon?: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700 ${className}`}><h3 className="mb-2 flex items-center gap-2 font-black text-slate-900">{icon}{title}</h3>{children}</div>;
}

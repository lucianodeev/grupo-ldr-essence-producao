import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import {
  Accessibility,
  AlertCircle,
  BriefcaseBusiness,
  Loader2,
  MapPin,
  Search,
  ShieldCheck,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { LanguageSelect, useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/carreira/vagas")({ component: NestedRoute });

type JobRow = Record<string, any> & {
  id: string;
  title?: string | null;
  category?: string | null;
  country?: string | null;
  city?: string | null;
  work_mode?: string | null;
  contract_type?: string | null;
  published_at?: string | null;
  career_companies?: { name?: string | null } | null;
};

const C = {
  pt: {
    title: "Encontrar vagas",
    sub: "Oportunidades publicadas e validadas no LDR Carreira, com atenção à acessibilidade e à candidatura pelo perfil.",
    search: "Buscar por cargo, empresa, categoria ou cidade",
    allModes: "Todos os modelos",
    inclusiveOnly: "Mostrar somente vagas com sinalização inclusiva",
    clear: "Limpar filtros",
    empty: "Nenhuma vaga publicada encontrada.",
    emptyFiltered: "Nenhuma vaga encontrada com estes filtros.",
    loading: "Carregando vagas publicadas...",
    view: "Ver vaga",
    apply: "Candidatar pelo perfil",
    applyHint: "Envie seus dados com acessibilidade opcional e consentida.",
    remote: "Remoto",
    hybrid: "Híbrido",
    onsite: "Presencial",
    inclusive: "Vaga inclusiva",
    pcd: "Aberta a PcD",
    resources: "Recursos de acessibilidade",
    interview: "Apoio no processo seletivo",
    sign: "Língua de sinais quando aplicável",
    warning: "Alguns campos de acessibilidade ainda não estão disponíveis no banco. A listagem foi carregada com os dados seguros existentes.",
    companyFallback: "Empresa validada",
    noLocation: "Localidade a confirmar",
  },
  en: {
    title: "Find jobs",
    sub: "Published and validated opportunities on LDR Carreira, with accessibility and profile-based applications in mind.",
    search: "Search by role, company, category or city",
    allModes: "All work modes",
    inclusiveOnly: "Show only jobs marked as inclusive",
    clear: "Clear filters",
    empty: "No published jobs found.",
    emptyFiltered: "No jobs found with these filters.",
    loading: "Loading published jobs...",
    view: "View job",
    apply: "Apply with profile",
    applyHint: "Submit organized data with optional, consent-based accessibility information.",
    remote: "Remote",
    hybrid: "Hybrid",
    onsite: "On-site",
    inclusive: "Inclusive job",
    pcd: "Open to disabled candidates",
    resources: "Accessibility resources",
    interview: "Selection-process support",
    sign: "Sign language when applicable",
    warning: "Some accessibility fields are not available in the database yet. The listing was loaded with the existing safe data.",
    companyFallback: "Validated company",
    noLocation: "Location to be confirmed",
  },
  fr: {
    title: "Trouver des offres",
    sub: "Opportunités publiées et validées sur LDR Carreira, avec attention à l’accessibilité et à la candidature via le profil.",
    search: "Rechercher par poste, entreprise, catégorie ou ville",
    allModes: "Tous les formats",
    inclusiveOnly: "Afficher seulement les offres signalées comme inclusives",
    clear: "Réinitialiser",
    empty: "Aucune offre publiée trouvée.",
    emptyFiltered: "Aucune offre trouvée avec ces filtres.",
    loading: "Chargement des offres publiées...",
    view: "Voir l’offre",
    apply: "Postuler avec profil",
    applyHint: "Envoyez vos données avec accessibilité optionnelle et consentie.",
    remote: "Télétravail",
    hybrid: "Hybride",
    onsite: "Présentiel",
    inclusive: "Offre inclusive",
    pcd: "Ouverte aux candidats en situation de handicap",
    resources: "Ressources d’accessibilité",
    interview: "Soutien au processus de sélection",
    sign: "Langue des signes si applicable",
    warning: "Certains champs d’accessibilité ne sont pas encore disponibles dans la base. La liste a été chargée avec les données sûres existantes.",
    companyFallback: "Entreprise validée",
    noLocation: "Lieu à confirmer",
  },
  es: {
    title: "Encontrar vacantes",
    sub: "Oportunidades publicadas y validadas en LDR Carreira, con atención a la accesibilidad y a la candidatura desde el perfil.",
    search: "Buscar por puesto, empresa, categoría o ciudad",
    allModes: "Todos los modelos",
    inclusiveOnly: "Mostrar solo vacantes señaladas como inclusivas",
    clear: "Limpiar filtros",
    empty: "No se encontraron vacantes publicadas.",
    emptyFiltered: "No se encontraron vacantes con estos filtros.",
    loading: "Cargando vacantes publicadas...",
    view: "Ver vacante",
    apply: "Postular con perfil",
    applyHint: "Envía tus datos con accesibilidad opcional y consentida.",
    remote: "Remoto",
    hybrid: "Híbrido",
    onsite: "Presencial",
    inclusive: "Vacante inclusiva",
    pcd: "Abierta a personas con discapacidad",
    resources: "Recursos de accesibilidad",
    interview: "Apoyo en el proceso selectivo",
    sign: "Lengua de señas cuando aplique",
    warning: "Algunos campos de accesibilidad aún no están disponibles en la base de datos. La lista se cargó con los datos seguros existentes.",
    companyFallback: "Empresa validada",
    noLocation: "Ubicación por confirmar",
  },
} as const;

const baseSelect =
  "id,title,category,country,city,work_mode,contract_type,published_at,career_companies(name)";

const enhancedSelect = `${baseSelect},accessibility_inclusive,accessibility_pcd_only:accessibility_designated_disability,accessibility_resources:accessibility_features,accessibility_details`;

function hasValue(value: unknown) {
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "string") return value.trim().length > 0;
  return Boolean(value);
}

function isInclusiveJob(job: JobRow) {
  return [
    job.accessibility_inclusive,
    job.accessibility_pcd_open,
    job.accessibility_pcd_only,
    job.accessibility_resources,
    job.accessibility_interview_support,
    job.accessibility_sign_language,
  ].some(hasValue);
}

function getWorkModeLabel(value: string | null | undefined, t: (typeof C)["pt"]) {
  const normalized = String(value ?? "").toLowerCase();
  if (normalized.includes("remote") || normalized.includes("remoto")) return t.remote;
  if (normalized.includes("hybrid") || normalized.includes("hibrid") || normalized.includes("híbrid")) return t.hybrid;
  if (normalized.includes("onsite") || normalized.includes("presencial")) return t.onsite;
  return value || "—";
}

function Jobs() {
  const { locale } = useI18n();
  const t = C[locale as keyof typeof C] ?? C.pt;
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [usedFallback, setUsedFallback] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [workMode, setWorkMode] = useState("all");
  const [inclusiveOnly, setInclusiveOnly] = useState(false);

  useEffect(() => {
    let alive = true;

    async function loadJobs() {
      setLoading(true);
      setError(null);

      const request = (select: string) =>
        (supabase.from("career_jobs" as never) as any)
          .select(select)
          .eq("status", "published")
          .order("published_at", { ascending: false })
          .limit(50);

      const enhanced = await request(enhancedSelect);
      const result = enhanced.error ? await request(baseSelect) : enhanced;

      if (!alive) return;

      if (enhanced.error && !result.error) setUsedFallback(true);
      if (result.error) {
        setError("Não foi possível carregar as vagas. Tente novamente.");
        setJobs([]);
      } else {
        setJobs(result.data ?? []);
      }

      setLoading(false);
    }

    void loadJobs();

    return () => {
      alive = false;
    };
  }, []);

  const filteredJobs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return jobs.filter((job) => {
      const companyName = job.career_companies?.name ?? "";
      const searchable = [job.title, companyName, job.category, job.city, job.country]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesQuery = !normalizedQuery || searchable.includes(normalizedQuery);
      const matchesWorkMode =
        workMode === "all" || String(job.work_mode ?? "").toLowerCase().includes(workMode);
      const matchesInclusive = !inclusiveOnly || isInclusiveJob(job);

      return matchesQuery && matchesWorkMode && matchesInclusive;
    });
  }, [jobs, query, workMode, inclusiveOnly]);

  const hasFilters = query.trim().length > 0 || workMode !== "all" || inclusiveOnly;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-5 py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#07345b]/10 px-3 py-1 text-sm font-semibold text-[#07345b]">
              <ShieldCheck size={16} /> LDR Carreira
            </p>
            <h1 className="flex items-center gap-3 text-3xl font-bold text-[#07345b]">
              <BriefcaseBusiness /> {t.title}
            </h1>
            <p className="mt-2 max-w-3xl text-slate-600">{t.sub}</p>
          </div>
          <LanguageSelect />
        </div>

        <section className="mt-8 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-5" aria-label="Filtros de vagas">
          <div className="grid gap-3 lg:grid-cols-[1fr_220px]">
            <label className="relative block">
              <span className="sr-only">{t.search}</span>
              <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t.search}
                className="min-h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-slate-900 outline-none transition focus:border-[#07345b] focus:bg-white focus:ring-4 focus:ring-[#07345b]/10"
              />
            </label>

            <label className="block">
              <span className="sr-only">{t.allModes}</span>
              <select
                value={workMode}
                onChange={(event) => setWorkMode(event.target.value)}
                className="min-h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-slate-900 outline-none transition focus:border-[#07345b] focus:bg-white focus:ring-4 focus:ring-[#07345b]/10"
              >
                <option value="all">{t.allModes}</option>
                <option value="remote">{t.remote}</option>
                <option value="hybrid">{t.hybrid}</option>
                <option value="onsite">{t.onsite}</option>

              </select>
            </label>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-slate-50 p-3 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={inclusiveOnly}
                onChange={(event) => setInclusiveOnly(event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-[#07345b] focus:ring-[#07345b]"
              />
              <span>{t.inclusiveOnly}</span>
            </label>

            {hasFilters && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setWorkMode("all");
                  setInclusiveOnly(false);
                }}
                className="min-h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-[#07345b] transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-[#07345b]/10"
              >
                {t.clear}
              </button>
            )}
          </div>
        </section>



        {error && (
          <div className="mt-5 flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900" role="alert">
            <AlertCircle className="mt-0.5 shrink-0" size={18} />
            <p>{error}</p>
          </div>
        )}

        <div className="mt-8 grid gap-4" aria-live="polite">
          {loading && (
            <div className="flex items-center gap-3 rounded-2xl bg-white p-6 text-slate-600 shadow-sm">
              <Loader2 className="animate-spin" size={20} />
              <span>{t.loading}</span>
            </div>
          )}

          {!loading && !error && filteredJobs.length === 0 && (
            <p className="rounded-2xl bg-white p-6 text-slate-600 shadow-sm">
              {jobs.length === 0 ? t.empty : t.emptyFiltered}
            </p>
          )}

          {!loading &&
            !error &&
            filteredJobs.map((job) => {
              const companyName = job.career_companies?.name || t.companyFallback;
              const location = [job.city, job.country].filter(Boolean).join(", ") || t.noLocation;
              const inclusive = isInclusiveJob(job);

              return (
                <article key={job.id} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                  <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
                    <div className="min-w-0">
                      <div className="mb-3 flex flex-wrap gap-2">
                        {inclusive && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 ring-1 ring-emerald-100">
                            <Accessibility size={14} /> {t.inclusive}
                          </span>
                        )}
                        {hasValue(job.accessibility_pcd_open) || hasValue(job.accessibility_pcd_only) ? (
                          <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-800 ring-1 ring-blue-100">
                            {t.pcd}
                          </span>
                        ) : null}
                      </div>

                      <h2 className="text-xl font-bold text-[#07345b]">{job.title}</h2>
                      <p className="mt-1 text-slate-600">
                        {companyName} · {job.category || "—"}
                      </p>
                      <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                        <MapPin size={16} />
                        <span>{location}</span>
                        <span aria-hidden="true">·</span>
                        <span>{getWorkModeLabel(job.work_mode, t)}</span>
                        <span aria-hidden="true">·</span>
                        <span>{job.contract_type || "—"}</span>
                      </p>

                      {inclusive && (
                        <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-700">
                          {hasValue(job.accessibility_resources) && <span className="rounded-full bg-slate-100 px-3 py-1">{t.resources}</span>}
                          {hasValue(job.accessibility_interview_support) && <span className="rounded-full bg-slate-100 px-3 py-1">{t.interview}</span>}
                          {hasValue(job.accessibility_sign_language) && <span className="rounded-full bg-slate-100 px-3 py-1">{t.sign}</span>}
                        </div>
                      )}
                    </div>

                    <div className="flex shrink-0 flex-col gap-2 md:w-56">
                      <Link
                        to="/carreira/vagas/$jobId/candidatura"
                        params={{ jobId: job.id }}
                        className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#07345b] px-5 text-center font-semibold text-white transition hover:bg-[#0b426f] focus:outline-none focus:ring-4 focus:ring-[#07345b]/20"
                      >
                        {t.apply}
                      </Link>
                      <Link
                        to="/carreira/vagas/$jobId"
                        params={{ jobId: job.id }}
                        className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-center font-semibold text-[#07345b] transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-[#07345b]/10"
                      >
                        {t.view}
                      </Link>
                      <p className="text-center text-xs text-slate-500">{t.applyHint}</p>
                    </div>
                  </div>
                </article>
              );
            })}
        </div>
      </div>
    </main>
  );
}

function NestedRoute() { const { pathname } = useLocation(); return pathname.replace(/\/+$/, "") !== "/carreira/vagas" ? <Outlet /> : <Jobs />; }

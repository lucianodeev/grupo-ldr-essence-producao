import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import {
  Accessibility,
  ArrowLeft,
  DollarSign,
  Globe2,
  Languages,
  Loader2,
  MapPin,
  Send,
  ShieldCheck,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { LanguageSelect, useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/carreira/vagas/$jobId")({ component: NestedRoute });

type JobRow = Record<string, any> & {
  id: string;
  title?: string | null;
  description?: string | null;
  responsibilities?: string | null;
  requirements?: string | null;
  country?: string | null;
  city?: string | null;
  work_mode?: string | null;
  contract_type?: string | null;
  publication_language?: string | null;
  required_languages?: string[] | string | null;
  salary_currency?: string | null;
  salary_min?: number | string | null;
  salary_max?: number | string | null;
  salary_period?: string | null;
  career_companies?: { name?: string | null; website?: string | null } | null;
};

const C = {
  pt: {
    back: "Voltar para vagas",
    about: "Sobre a vaga",
    resp: "Responsabilidades",
    req: "Requisitos mínimos",
    apply: "Candidatar pelo perfil",
    closed: "Vaga indisponível ou não publicada.",
    loading: "Carregando vaga...",
    safe: "Esta vaga passou pela etapa de publicação da plataforma.",
    journeyTitle: "Candidatura rápida e inclusiva",
    journeyText:
      "Você pode avançar usando seu perfil profissional. Dados de acessibilidade só devem ser compartilhados quando você autorizar na próxima etapa.",
    salary: "Faixa salarial",
    languages: "Idiomas",
    location: "Localização",
    work: "Modelo",
    company: "Empresa",
    inclusive: "Vaga inclusiva",
    pcd: "Aberta para PcD",
    resources: "Recursos de acessibilidade informados",
    interview: "Apoio no processo seletivo",
    sign: "Apoio em língua de sinais/comunicação",
    fallbackWarning:
      "Alguns campos avançados de acessibilidade ainda não estão disponíveis no banco. A vaga foi carregada com os dados seguros atuais.",
    notInformed: "Não informado",
  },
  en: {
    back: "Back to jobs",
    about: "About the job",
    resp: "Responsibilities",
    req: "Minimum requirements",
    apply: "Apply with profile",
    closed: "Job unavailable or not published.",
    loading: "Loading job...",
    safe: "This job passed the platform publication stage.",
    journeyTitle: "Fast and inclusive application",
    journeyText:
      "You can move forward using your professional profile. Accessibility information is shared only when you authorize it in the next step.",
    salary: "Salary range",
    languages: "Languages",
    location: "Location",
    work: "Work model",
    company: "Company",
    inclusive: "Inclusive job",
    pcd: "Open to disabled candidates",
    resources: "Accessibility resources informed",
    interview: "Selection process support",
    sign: "Sign language/communication support",
    fallbackWarning:
      "Some advanced accessibility fields are not available in the database yet. The job was loaded with the current safe data.",
    notInformed: "Not informed",
  },
  fr: {
    back: "Retour aux offres",
    about: "À propos du poste",
    resp: "Responsabilités",
    req: "Exigences minimales",
    apply: "Postuler avec profil",
    closed: "Offre indisponible ou non publiée.",
    loading: "Chargement de l’offre...",
    safe: "Cette offre a passé l’étape de publication de la plateforme.",
    journeyTitle: "Candidature rapide et inclusive",
    journeyText:
      "Vous pouvez avancer avec votre profil professionnel. Les informations d’accessibilité ne sont partagées que si vous l’autorisez à l’étape suivante.",
    salary: "Fourchette salariale",
    languages: "Langues",
    location: "Localisation",
    work: "Modèle de travail",
    company: "Entreprise",
    inclusive: "Offre inclusive",
    pcd: "Ouverte aux candidats en situation de handicap",
    resources: "Ressources d’accessibilité indiquées",
    interview: "Accompagnement dans le processus de sélection",
    sign: "Soutien en langue des signes/communication",
    fallbackWarning:
      "Certains champs avancés d’accessibilité ne sont pas encore disponibles dans la base. L’offre a été chargée avec les données sûres actuelles.",
    notInformed: "Non renseigné",
  },
  es: {
    back: "Volver a vacantes",
    about: "Sobre la vacante",
    resp: "Responsabilidades",
    req: "Requisitos mínimos",
    apply: "Postular con perfil",
    closed: "Vacante no disponible o no publicada.",
    loading: "Cargando vacante...",
    safe: "Esta vacante pasó por la etapa de publicación de la plataforma.",
    journeyTitle: "Postulación rápida e inclusiva",
    journeyText:
      "Puedes avanzar usando tu perfil profesional. Los datos de accesibilidad solo se comparten cuando lo autorizas en la próxima etapa.",
    salary: "Rango salarial",
    languages: "Idiomas",
    location: "Ubicación",
    work: "Modalidad",
    company: "Empresa",
    inclusive: "Vacante inclusiva",
    pcd: "Abierta a personas con discapacidad",
    resources: "Recursos de accesibilidad informados",
    interview: "Apoyo en el proceso de selección",
    sign: "Apoyo en lengua de señas/comunicación",
    fallbackWarning:
      "Algunos campos avanzados de accesibilidad aún no están disponibles en la base de datos. La vacante se cargó con los datos seguros actuales.",
    notInformed: "No informado",
  },
} as const;

type Copy = (typeof C)[keyof typeof C];

const baseSelect =
  "id,title,description,responsibilities,requirements,country,city,work_mode,contract_type,publication_language,required_languages,salary_currency,salary_min,salary_max,salary_period,career_companies(name,website)";

const enhancedSelect = `${baseSelect},accessibility_inclusive,accessibility_pcd_only:accessibility_designated_disability,accessibility_resources:accessibility_features,accessibility_details`;

function hasValue(value: unknown) {
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "string") return value.trim().length > 0;
  return Boolean(value);
}

function formatSalary(job: JobRow, t: Copy) {
  const min = hasValue(job.salary_min) ? String(job.salary_min) : "";
  const max = hasValue(job.salary_max) ? String(job.salary_max) : "";
  const currency = job.salary_currency ?? "";
  const period = job.salary_period ? `/${job.salary_period}` : "";

  if (!min && !max) return t.notInformed;
  if (min && max) return `${currency} ${min} - ${max}${period}`.trim();
  return `${currency} ${min || max}${period}`.trim();
}

function formatLanguages(value: JobRow["required_languages"], fallback: string) {
  if (Array.isArray(value)) return value.filter(Boolean).join(", ") || fallback;
  if (typeof value === "string" && value.trim()) return value;
  return fallback;
}

function getBadges(job: JobRow, t: Copy) {
  return [
    job.accessibility_inclusive ? t.inclusive : null,
    job.accessibility_pcd_open || job.accessibility_pcd_only ? t.pcd : null,
    hasValue(job.accessibility_resources) ? t.resources : null,
    job.accessibility_interview_support ? t.interview : null,
    job.accessibility_sign_language ? t.sign : null,
  ].filter(Boolean) as string[];
}

function Job() {
  const { jobId } = Route.useParams();
  const { locale } = useI18n();
  const t = C[locale as keyof typeof C] ?? C.pt;
  const [job, setJob] = useState<JobRow | null>();
  const [usedFallback, setUsedFallback] = useState(false);

  useEffect(() => {
    let alive = true;

    void (async () => {
      const table = supabase.from("career_jobs" as never) as any;
      const enhanced = await table
        .select(enhancedSelect)
        .eq("id", jobId)
        .eq("status", "published")
        .maybeSingle();

      if (!enhanced.error) {
        if (alive) {
          setJob(enhanced.data ?? null);
          setUsedFallback(false);
        }
        return;
      }

      const fallback = await table
        .select(baseSelect)
        .eq("id", jobId)
        .eq("status", "published")
        .maybeSingle();

      if (alive) {
        setJob(fallback.data ?? null);
        setUsedFallback(Boolean(fallback.data));
      }
    })();

    return () => {
      alive = false;
    };
  }, [jobId]);

  const badges = useMemo(() => (job ? getBadges(job, t) : []), [job, t]);
  const location = useMemo(
    () => (job ? [job.city, job.country].filter(Boolean).join(", ") || t.notInformed : t.notInformed),
    [job, t.notInformed],
  );

  if (job === null) {
    return (
      <main className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-6 text-slate-700 shadow-sm">{t.closed}</div>
      </main>
    );
  }

  if (!job) {
    return (
      <main className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto flex max-w-3xl items-center gap-3 rounded-2xl bg-white p-6 text-slate-700 shadow-sm">
          <Loader2 className="animate-spin" size={18} aria-hidden="true" />
          <span>{t.loading}</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-5 py-10">
        <div className="flex items-center justify-between gap-4">
          <Link
            to="/carreira/vagas"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-[#07345b] shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-[#07345b]/10"
          >
            <ArrowLeft size={16} aria-hidden="true" /> {t.back}
          </Link>
          <LanguageSelect />
        </div>

        <article className="mt-5 overflow-hidden rounded-3xl bg-white shadow-sm">
          <div className="bg-[#07345b] px-6 py-8 text-white md:px-9">
            <p className="font-semibold text-[#f2c94c]">{job.career_companies?.name || t.company}</p>
            <h1 className="mt-2 text-3xl font-bold md:text-4xl">{job.title}</h1>
            <p className="mt-4 flex flex-wrap items-center gap-2 text-white/85">
              <MapPin size={18} aria-hidden="true" />
              {location} · {job.work_mode || t.notInformed} · {job.contract_type || t.notInformed}
            </p>
          </div>

          <div className="grid gap-6 p-6 md:grid-cols-[1fr_320px] md:p-9">
            <div>
              <div className="flex gap-2 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                <ShieldCheck size={19} className="mt-0.5 shrink-0" aria-hidden="true" />
                <span>{t.safe}</span>
              </div>



              {badges.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2" aria-label="Accessibility badges">
                  {badges.map((badge) => (
                    <span
                      key={badge}
                      className="inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800"
                    >
                      <Accessibility size={14} aria-hidden="true" /> {badge}
                    </span>
                  ))}
                </div>
              )}

              <S title={t.about}>{job.description || t.notInformed}</S>
              {job.responsibilities && <S title={t.resp}>{job.responsibilities}</S>}
              <S title={t.req}>{job.requirements || t.notInformed}</S>
            </div>

            <aside className="h-fit rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h2 className="text-lg font-bold text-[#07345b]">{t.journeyTitle}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyText}</p>

              <div className="mt-5 space-y-3 text-sm text-slate-700">
                <Info icon={<DollarSign size={17} aria-hidden="true" />} label={t.salary} value={formatSalary(job, t)} />
                <Info icon={<Languages size={17} aria-hidden="true" />} label={t.languages} value={formatLanguages(job.required_languages, t.notInformed)} />
                <Info icon={<Globe2 size={17} aria-hidden="true" />} label={t.work} value={job.work_mode || t.notInformed} />
                <Info icon={<MapPin size={17} aria-hidden="true" />} label={t.location} value={location} />
              </div>

              <Link
                to="/carreira/vagas/$jobId/candidatura"
                params={{ jobId: job.id }}
                className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#07345b] px-5 font-semibold text-white transition hover:bg-[#0b426f] focus:outline-none focus:ring-4 focus:ring-[#07345b]/20"
              >
                <Send size={17} aria-hidden="true" />
                {t.apply}
              </Link>
            </aside>
          </div>
        </article>
      </div>
    </main>
  );
}

function Info({ icon, label, value }: { icon: ReactNode; label: string; value: ReactNode }) {
  return (
    <div className="flex gap-2 rounded-xl bg-white p-3">
      <span className="mt-0.5 text-[#c28d19]">{icon}</span>
      <span>
        <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
        <span className="font-semibold text-[#07345b]">{value}</span>
      </span>
    </div>
  );
}

function S({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-xl font-bold text-[#07345b]">{title}</h2>
      <p className="mt-3 whitespace-pre-line leading-7 text-slate-700">{children}</p>
    </section>
  );
}

function NestedRoute() { const { pathname } = useLocation(); return pathname.replace(/\/+$/, "").endsWith("/candidatura") ? <Outlet /> : <Job />; }

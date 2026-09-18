import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { companyLoginHref } from "@/lib/company-login-return";
import { Building2, BriefcaseBusiness, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { LanguageSelect, useI18n } from "@/lib/i18n";

const C = {
  pt: {
    title: "Área da empresa",
    sub: "Publique gratuitamente e organize seu processo seletivo em um só lugar.",
    company: "Empresa",
    responsible: "Responsável",
    email: "E-mail profissional",
    country: "País",
    city: "Cidade",
    website: "Site (opcional)",
    job: "Nova vaga",
    jobTitle: "Título da vaga",
    category: "Categoria",
    description: "Descrição",
    responsibilities: "Responsabilidades",
    requirements: "Requisitos mínimos",
    mode: "Modalidade",
    contract: "Contrato",
    language: "Idioma da publicação",
    save: "Salvar rascunho",
    review: "Enviar para análise",
    success: "Vaga salva. A publicação pública depende de validação.",
    login: "Entre na sua conta para acessar a área da empresa.",
    safe: "A empresa não pode aprovar ou publicar a própria vaga.",
    onsite: "Presencial",
    hybrid: "Híbrido",
    remote: "Remoto",
    remoteInt: "Remoto internacional",
    employment: "Emprego",
    internship: "Estágio",
    trainee: "Trainee",
    freelance: "Freelance",
    temporary: "Temporário",
    other: "Outro",
    freelanceType: "Tipo de projeto freelancer",
    oneOff: "Projeto pontual",
    recurring: "Projeto recorrente",
    timezone: "Fuso horário",
    startDate: "Data prevista de início",
    duration: "Duração estimada",
    availability: "Disponibilidade / horário combinado",
    workload: "Carga de trabalho estimada",
    error: "Não foi possível concluir a operação.",
  },
  en: {
    title: "Company area",
    sub: "Post for free and organize your recruitment process in one place.",
    company: "Company",
    responsible: "Responsible person",
    email: "Professional email",
    country: "Country",
    city: "City",
    website: "Website (optional)",
    job: "New job",
    jobTitle: "Job title",
    category: "Category",
    description: "Description",
    responsibilities: "Responsibilities",
    requirements: "Minimum requirements",
    mode: "Work mode",
    contract: "Contract",
    language: "Publication language",
    save: "Save draft",
    review: "Submit for review",
    success: "Job saved. Public publication requires validation.",
    login: "Sign in to access the company area.",
    safe: "A company cannot approve or publish its own job.",
    onsite: "On-site",
    hybrid: "Hybrid",
    remote: "Remote",
    remoteInt: "International remote",
    employment: "Employment",
    internship: "Internship",
    trainee: "Trainee",
    freelance: "Freelance",
    temporary: "Temporary",
    other: "Other",
    freelanceType: "Freelance project type",
    oneOff: "One-off project",
    recurring: "Recurring project",
    timezone: "Time zone",
    startDate: "Expected start date",
    duration: "Estimated duration",
    availability: "Availability / agreed online hours",
    workload: "Estimated workload",
    error: "Unable to complete the operation.",
  },
  fr: {
    title: "Espace entreprise",
    sub: "Publiez gratuitement et organisez votre recrutement au même endroit.",
    company: "Entreprise",
    responsible: "Responsable",
    email: "E-mail professionnel",
    country: "Pays",
    city: "Ville",
    website: "Site (facultatif)",
    job: "Nouvelle offre",
    jobTitle: "Titre du poste",
    category: "Catégorie",
    description: "Description",
    responsibilities: "Responsabilités",
    requirements: "Exigences minimales",
    mode: "Modalité",
    contract: "Contrat",
    language: "Langue de publication",
    save: "Enregistrer le brouillon",
    review: "Envoyer pour validation",
    success: "Offre enregistrée. La publication publique nécessite une validation.",
    login: "Connectez-vous pour accéder à l’espace entreprise.",
    safe: "L’entreprise ne peut pas approuver ni publier sa propre offre.",
    onsite: "Présentiel",
    hybrid: "Hybride",
    remote: "À distance",
    remoteInt: "À distance international",
    employment: "Emploi",
    internship: "Stage",
    trainee: "Trainee",
    freelance: "Freelance",
    temporary: "Temporaire",
    other: "Autre",
    freelanceType: "Type de projet freelance",
    oneOff: "Projet ponctuel",
    recurring: "Projet récurrent",
    timezone: "Fuseau horaire",
    startDate: "Date de début prévue",
    duration: "Durée estimée",
    availability: "Disponibilité / horaires convenus",
    workload: "Charge de travail estimée",
    error: "Impossible de terminer l’opération.",
  },
  es: {
    title: "Área de empresa",
    sub: "Publica gratis y organiza tu proceso de selección en un solo lugar.",
    company: "Empresa",
    responsible: "Responsable",
    email: "Correo profesional",
    country: "País",
    city: "Ciudad",
    website: "Sitio web (opcional)",
    job: "Nueva vacante",
    jobTitle: "Título",
    category: "Categoría",
    description: "Descripción",
    responsibilities: "Responsabilidades",
    requirements: "Requisitos mínimos",
    mode: "Modalidad",
    contract: "Contrato",
    language: "Idioma de publicación",
    save: "Guardar borrador",
    review: "Enviar a revisión",
    success: "Vacante guardada. La publicación pública requiere validación.",
    login: "Inicia sesión para acceder al área de empresa.",
    safe: "La empresa no puede aprobar ni publicar su propia vacante.",
    onsite: "Presencial",
    hybrid: "Híbrido",
    remote: "Remoto",
    remoteInt: "Remoto internacional",
    employment: "Empleo",
    internship: "Prácticas",
    trainee: "Trainee",
    freelance: "Freelance",
    temporary: "Temporal",
    other: "Otro",
    freelanceType: "Tipo de proyecto freelance",
    oneOff: "Proyecto puntual",
    recurring: "Proyecto recurrente",
    timezone: "Zona horaria",
    startDate: "Fecha prevista de inicio",
    duration: "Duración estimada",
    availability: "Disponibilidad / horario acordado",
    workload: "Carga de trabajo estimada",
    error: "No fue posible completar la operación.",
  },
} as const;
export function CompanyJobsPage() {
  const { locale } = useI18n();
  const t = C[locale];
  const [userId, setUserId] = useState<string | null | undefined>(undefined);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedVersion, setSavedVersion] = useState(0);
  const [company, setCompany] = useState({
    name: "",
    responsible_name: "",
    professional_email: "",
    country: "",
    city: "",
    website: "",
  });
  const [job, setJob] = useState({
    title: "",
    category: "",
    description: "",
    responsibilities: "",
    requirements: "",
    work_mode: "remote",
    contract_type: "employment",
    publication_language: locale as string,
    country: "",
    city: "",
    freelance_project_type: "one_off",
    timezone: "",
    expected_start_date: "",
    estimated_duration: "",
    availability_details: "",
    estimated_workload: "",
    accessibility_inclusive: false,
    accessibility_designated_disability: false,
    accessibility_features: [] as string[],
    accessibility_details: "",
  });
  useEffect(() => {
    void (async () => {
      const { data } = await supabase.auth.getUser();
      const id = data.user?.id ?? null;
      setUserId(id);
      if (!id) return;
      const { data: c } = await (supabase.from("career_companies" as never) as any)
        .select("*")
        .eq("owner_user_id", id)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (c) {
        setCompanyId(c.id);
        setCompany({
          name: c.name ?? "",
          responsible_name: c.responsible_name ?? "",
          professional_email: c.professional_email ?? "",
          country: c.country ?? "",
          city: c.city ?? "",
          website: c.website ?? "",
        });
      }
    })().catch(() => {
      setUserId(null);
      setStatus(t.error);
    });
  }, []);
  const cls =
    "w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#c99b2d] focus:ring-2 focus:ring-[#c99b2d]/20";
  async function ensureCompany() {
    if (!userId) return null;
    const payload = {
      owner_user_id: userId,
      ...company,
      city: company.city || null,
      website: company.website || null,
    };
    if (companyId) {
      const { error } = await (supabase.from("career_companies" as never) as any)
        .update(payload)
        .eq("id", companyId);
      if (error) return null;
      return companyId;
    }
    const { data, error } = await (supabase.from("career_companies" as never) as any)
      .insert(payload)
      .select("id")
      .single();
    if (error) return null;
    setCompanyId(data.id);
    return data.id;
  }
  async function save(next: "draft" | "pending_review") {
    if (saving) return;
    setSaving(true);
    try {
      setStatus("");
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(company.professional_email.trim());
      const requiredOk =
        company.name.trim().length >= 2 &&
        company.responsible_name.trim().length >= 2 &&
        emailOk &&
        company.country.trim().length >= 2 &&
        job.title.trim().length >= 3 &&
        job.category.trim().length >= 2 &&
        job.description.trim().length >= 80 &&
        job.requirements.trim().length >= 20;
      if (!requiredOk) {
        setStatus(t.error);
        return;
      }
      if (company.website.trim()) {
        try {
          const u = new URL(company.website);
          if (!["http:", "https:"].includes(u.protocol)) {
            setStatus(t.error);
            return;
          }
        } catch {
          setStatus(t.error);
          return;
        }
      }
      const cid = await ensureCompany();
      if (!cid) {
        setStatus(t.error);
        return;
      }
      const freelance = job.contract_type === "freelance";
      const payload = {
        company_id: cid,
        ...job,
        country: (job.country || company.country).trim(),
        city: (job.city || company.city || "").trim() || null,
        status: next,
        freelance_project_type: freelance ? job.freelance_project_type : null,
        timezone: freelance ? job.timezone.trim() || null : null,
        expected_start_date: freelance ? job.expected_start_date || null : null,
        estimated_duration: freelance ? job.estimated_duration.trim() || null : null,
        availability_details: freelance ? job.availability_details.trim() || null : null,
        estimated_workload: freelance ? job.estimated_workload.trim() || null : null,
      };
      const { error } = await (supabase.from("career_jobs" as never) as any).insert(payload);
      setStatus(error ? t.error : t.success);
      if (!error) { setSavedVersion(v => v + 1); setJob(current => ({ ...current, title: "", description: "", requirements: "", responsibilities: "" })); }
    } catch {
      setStatus(t.error);
    } finally {
      setSaving(false);
    }
  }
  if (userId === undefined)
    return (
      <main className="p-6" role="status">
        {locale === "pt"
          ? "Carregando…"
          : locale === "fr"
            ? "Chargement…"
            : locale === "es"
              ? "Cargando…"
              : "Loading…"}
      </main>
    );
  if (userId === null)
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-4xl px-5 py-12">
          <div className="flex justify-end">
            <LanguageSelect />
          </div>
          <h1 className="mt-8 text-3xl font-bold text-[#07345b]">{locale === "pt" ? "Publicar vaga" : locale === "fr" ? "Publier une offre" : locale === "es" ? "Publicar vacante" : "Post a job"}</h1><p className="mt-4 rounded-2xl bg-white p-6">{t.login}</p>
          <a
            className="mt-5 inline-flex min-h-12 items-center rounded-xl bg-[#07345b] px-5 py-3 font-bold text-white"
            href={companyLoginHref("/carreira/empresa/publicar")}
          >
            {locale === "pt"
              ? "Entrar para publicar"
              : locale === "fr"
                ? "Se connecter pour publier"
                : locale === "es"
                  ? "Entrar para publicar"
                  : "Sign in to post"}
          </a>
        </div>
      </main>
    );
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-5 py-10">
        <Link reloadDocument to="/carreira/empresa" className="mb-5 inline-block font-semibold text-[#07345b]">
          ← {t.title}
        </Link>
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
          <div>
            <h1 className="flex items-center gap-3 text-3xl font-bold text-[#07345b]">
              <Building2 />
              {t.title}
            </h1>
            <p className="mt-2 text-slate-600">{t.sub}</p>
          </div>
          <LanguageSelect />
        </div>
        <div className="mt-6 flex gap-2 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
          <ShieldCheck size={20} />
          {t.safe}
        </div>
        <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-[#07345b]">{t.company}</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <I l={t.company}>
              <input
                required
                className={cls}
                value={company.name}
                onChange={(e) => setCompany({ ...company, name: e.target.value })}
              />
            </I>
            <I l={t.responsible}>
              <input
                required
                className={cls}
                value={company.responsible_name}
                onChange={(e) => setCompany({ ...company, responsible_name: e.target.value })}
              />
            </I>
            <I l={t.email}>
              <input
                required
                type="email"
                className={cls}
                value={company.professional_email}
                onChange={(e) => setCompany({ ...company, professional_email: e.target.value })}
              />
            </I>
            <I l={t.country}>
              <input
                required
                className={cls}
                value={company.country}
                onChange={(e) => setCompany({ ...company, country: e.target.value })}
              />
            </I>
            <I l={t.city}>
              <input
                className={cls}
                value={company.city}
                onChange={(e) => setCompany({ ...company, city: e.target.value })}
              />
            </I>
            <I l={t.website}>
              <input
                type="url"
                className={cls}
                value={company.website}
                onChange={(e) => setCompany({ ...company, website: e.target.value })}
              />
            </I>
          </div>
        </section>
        <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-xl font-bold text-[#07345b]">
            <BriefcaseBusiness />
            {t.job}
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <I l={t.jobTitle}>
              <input
                required
                className={cls}
                value={job.title}
                onChange={(e) => setJob({ ...job, title: e.target.value })}
              />
            </I>
            <I l={t.category}>
              <input
                required
                className={cls}
                value={job.category}
                onChange={(e) => setJob({ ...job, category: e.target.value })}
              />
            </I>
            <I l={t.mode}>
              <select
                className={cls}
                value={job.work_mode}
                onChange={(e) => setJob({ ...job, work_mode: e.target.value })}
              >
                <option value="onsite">{t.onsite}</option>
                <option value="hybrid">{t.hybrid}</option>
                <option value="remote">{t.remote}</option>
                <option value="remote_international">{t.remoteInt}</option>
              </select>
            </I>
            <I l={t.contract}>
              <select
                className={cls}
                value={job.contract_type}
                onChange={(e) => setJob({ ...job, contract_type: e.target.value })}
              >
                {["employment", "internship", "trainee", "freelance", "temporary", "other"].map(
                  (x) => (
                    <option key={x} value={x}>
                      {(t as any)[x]}
                    </option>
                  ),
                )}
              </select>
            </I>
            <I l={t.language}>
              <select
                className={cls}
                value={job.publication_language}
                onChange={(e) => setJob({ ...job, publication_language: e.target.value })}
              >
                {["pt", "en", "fr", "es"].map((x) => (
                  <option key={x} value={x}>
                    {x.toUpperCase()}
                  </option>
                ))}
              </select>
            </I>
            <I l={t.country}>
              <input
                className={cls}
                value={job.country}
                onChange={(e) => setJob({ ...job, country: e.target.value })}
              />
            </I>
          </div>
          {job.contract_type === "freelance" && (
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <I l={t.freelanceType}>
                  <select
                    className={cls}
                    value={job.freelance_project_type}
                    onChange={(e) => setJob({ ...job, freelance_project_type: e.target.value })}
                  >
                    <option value="one_off">{t.oneOff}</option>
                    <option value="recurring">{t.recurring}</option>
                  </select>
                </I>
                <I l={t.timezone}>
                  <input
                    className={cls}
                    placeholder="Europe/Brussels"
                    value={job.timezone}
                    onChange={(e) => setJob({ ...job, timezone: e.target.value })}
                  />
                </I>
                <I l={t.startDate}>
                  <input
                    type="date"
                    className={cls}
                    value={job.expected_start_date}
                    onChange={(e) => setJob({ ...job, expected_start_date: e.target.value })}
                  />
                </I>
                <I l={t.duration}>
                  <input
                    className={cls}
                    value={job.estimated_duration}
                    onChange={(e) => setJob({ ...job, estimated_duration: e.target.value })}
                  />
                </I>
                <I l={t.availability}>
                  <input
                    className={cls}
                    value={job.availability_details}
                    onChange={(e) => setJob({ ...job, availability_details: e.target.value })}
                  />
                </I>
                <I l={t.workload}>
                  <input
                    className={cls}
                    value={job.estimated_workload}
                    onChange={(e) => setJob({ ...job, estimated_workload: e.target.value })}
                  />
                </I>
              </div>
            </div>
          )}
          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <h3 className="font-bold text-[#07345b]">
              {locale === "pt"
                ? "Acessibilidade e inclusão"
                : locale === "fr"
                  ? "Accessibilité et inclusion"
                  : locale === "es"
                    ? "Accesibilidad e inclusión"
                    : "Accessibility and inclusion"}
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              {locale === "pt"
                ? "Informe somente condições reais desta oportunidade. A empresa é responsável por observar a legislação aplicável."
                : locale === "fr"
                  ? "Indiquez uniquement les conditions réelles de cette offre. L’entreprise reste responsable du respect du droit applicable."
                  : locale === "es"
                    ? "Indica únicamente condiciones reales de esta oportunidad. La empresa es responsable de cumplir la legislación aplicable."
                    : "Declare only actual conditions of this opportunity. The company remains responsible for applicable law."}
            </p>
            <div className="mt-4 grid gap-3 text-sm">
              <label className="flex gap-3">
                <input
                  type="checkbox"
                  checked={job.accessibility_inclusive}
                  onChange={(e) => setJob({ ...job, accessibility_inclusive: e.target.checked })}
                />
                {locale === "pt"
                  ? "Oportunidade inclusiva — incentiva candidaturas de pessoas com deficiência"
                  : locale === "fr"
                    ? "Offre inclusive — encourage les candidatures de personnes en situation de handicap"
                    : locale === "es"
                      ? "Oportunidad inclusiva — fomenta candidaturas de personas con discapacidad"
                      : "Inclusive opportunity — welcomes applications from people with disabilities"}
              </label>
              <label className="flex gap-3">
                <input
                  type="checkbox"
                  checked={job.accessibility_designated_disability}
                  onChange={(e) =>
                    setJob({ ...job, accessibility_designated_disability: e.target.checked })
                  }
                />
                {locale === "pt"
                  ? "Oportunidade destinada a PcD, quando juridicamente aplicável"
                  : locale === "fr"
                    ? "Offre destinée aux personnes en situation de handicap, lorsque légalement applicable"
                    : locale === "es"
                      ? "Oportunidad destinada a personas con discapacidad, cuando sea legalmente aplicable"
                      : "Opportunity designated for people with disabilities, where legally applicable"}
              </label>
              {[
                [
                  "physical_access",
                  "Acesso físico",
                  "Accès physique",
                  "Acceso físico",
                  "Physical access",
                ],
                [
                  "text_communication",
                  "Comunicação por texto",
                  "Communication par texte",
                  "Comunicación por texto",
                  "Text communication",
                ],
                ["captions", "Legendas", "Sous-titres", "Subtítulos", "Captions"],
                [
                  "sign_language_interpreter",
                  "Intérprete de língua de sinais",
                  "Interprète en langue des signes",
                  "Intérprete de lengua de signos",
                  "Sign-language interpreter",
                ],
                [
                  "assistive_technology",
                  "Tecnologia assistiva",
                  "Technologie d’assistance",
                  "Tecnología de asistencia",
                  "Assistive technology",
                ],
                [
                  "reasonable_accommodation",
                  "Adaptação razoável mediante solicitação",
                  "Aménagement raisonnable sur demande",
                  "Adaptación razonable previa solicitud",
                  "Reasonable accommodation on request",
                ],
                [
                  "accessible_interview",
                  "Entrevista acessível",
                  "Entretien accessible",
                  "Entrevista accesible",
                  "Accessible interview",
                ],
              ].map(([v = "", pt, fr, es, en]) => (
                <label key={v} className="flex gap-3">
                  <input
                    type="checkbox"
                    checked={job.accessibility_features.includes(v)}
                    onChange={(e) =>
                      setJob({
                        ...job,
                        accessibility_features: e.target.checked
                          ? [...job.accessibility_features, v]
                          : job.accessibility_features.filter((x) => x !== v),
                      })
                    }
                  />
                  {locale === "pt" ? pt : locale === "fr" ? fr : locale === "es" ? es : en}
                </label>
              ))}
            </div>
            <textarea
              maxLength={1200}
              rows={3}
              className={cls + " mt-4"}
              aria-label={
                locale === "pt"
                  ? "Informações adicionais sobre acessibilidade"
                  : locale === "fr"
                    ? "Informations complémentaires sur l’accessibilité"
                    : locale === "es"
                      ? "Información adicional sobre accesibilidad"
                      : "Additional accessibility information"
              }
              placeholder={
                locale === "pt"
                  ? "Informações adicionais sobre acessibilidade (opcional)"
                  : locale === "fr"
                    ? "Informations complémentaires sur l’accessibilité (facultatif)"
                    : locale === "es"
                      ? "Información adicional sobre accesibilidad (opcional)"
                      : "Additional accessibility information (optional)"
              }
              value={job.accessibility_details}
              onChange={(e) => setJob({ ...job, accessibility_details: e.target.value })}
            />
          </div>
          <div className="mt-4 grid gap-4">
            <I l={t.description}>
              <textarea
                required
                minLength={80}
                rows={5}
                className={cls}
                value={job.description}
                onChange={(e) => setJob({ ...job, description: e.target.value })}
              />
            </I>
            <I l={t.responsibilities}>
              <textarea
                rows={4}
                className={cls}
                value={job.responsibilities}
                onChange={(e) => setJob({ ...job, responsibilities: e.target.value })}
              />
            </I>
            <I l={t.requirements}>
              <textarea
                required
                minLength={20}
                rows={4}
                className={cls}
                value={job.requirements}
                onChange={(e) => setJob({ ...job, requirements: e.target.value })}
              />
            </I>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              disabled={saving}
              onClick={() => void save("draft")}
              className="min-h-12 rounded-xl border border-[#07345b] px-5 font-semibold text-[#07345b]"
            >
              {t.save}
            </button>
            <button
              disabled={saving}
              onClick={() => void save("pending_review")}
              className="min-h-12 rounded-xl bg-[#07345b] px-5 font-semibold text-white"
            >
              {t.review}
            </button>
          </div>
          {status && (
            <p role="status" className="mt-4 rounded-xl bg-slate-50 p-3 text-sm">
              {status}
            </p>
          )}
        </section>
        <CloseProcesses key={savedVersion} companyId={companyId} locale={locale} />
      </div>
    </main>
  );
}
function CloseProcesses({ companyId, locale }: { companyId: string | null; locale: string }) {
  const [jobs, setJobs] = useState<any[]>([]);
  const [msg, setMsg] = useState("");
  async function load() {
    if (!companyId) {
      setJobs([]);
      return;
    }
    const { data } = await (supabase.from("career_jobs" as never) as any)
      .select("id,title,status,close_reason")
      .eq("company_id", companyId)
      .neq("status", "closed")
      .order("created_at", { ascending: false });
    setJobs(data ?? []);
  }
  useEffect(() => {
    void load();
  }, [companyId]);
  async function close(id: string, reason: string) {
    if (
      !confirm(
        locale === "pt"
          ? "Confirmar encerramento desta vaga?"
          : locale === "fr"
            ? "Confirmer la clôture de cette offre ?"
            : locale === "es"
              ? "¿Confirmar el cierre de esta vacante?"
              : "Confirm closing this job?",
      )
    )
      return;
    const { data, error: updateError } = await (supabase.from("career_jobs" as never) as any).update({ status: "closed", close_reason: reason, closed_at: new Date().toISOString() }).eq("id", id).eq("company_id", companyId).select("id").single();
    const error = updateError || !data;
    setMsg(
      error
        ? locale === "pt"
          ? "Não foi possível encerrar."
          : locale === "fr"
            ? "Impossible de clôturer."
            : locale === "es"
              ? "No fue posible cerrar."
              : "Unable to close."
        : locale === "pt"
          ? "Processo encerrado."
          : locale === "fr"
            ? "Processus clôturé."
            : locale === "es"
              ? "Proceso cerrado."
              : "Process closed.",
    );
    if (!error) await load();
  }
  const labels: any = {
    pt: {
      title: "Encerrar processo",
      empty: "Nenhuma vaga ativa para encerrar.",
      filled: "Vaga preenchida",
      process_closed: "Processo encerrado",
      cancelled: "Vaga cancelada",
      action: "Encerrar",
    },
    en: {
      title: "Close process",
      empty: "No active jobs to close.",
      filled: "Position filled",
      process_closed: "Process closed",
      cancelled: "Job cancelled",
      action: "Close",
    },
    fr: {
      title: "Clôturer le processus",
      empty: "Aucune offre active à clôturer.",
      filled: "Poste pourvu",
      process_closed: "Processus clôturé",
      cancelled: "Offre annulée",
      action: "Clôturer",
    },
    es: {
      title: "Cerrar proceso",
      empty: "No hay vacantes activas para cerrar.",
      filled: "Vacante cubierta",
      process_closed: "Proceso cerrado",
      cancelled: "Vacante cancelada",
      action: "Cerrar",
    },
  };
  const t = labels[locale] ?? labels.en;
  return (
    <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-[#07345b]">{t.title}</h2>
      {msg && (
        <p role="status" className="mt-3 rounded-xl bg-slate-50 p-3 text-sm">
          {msg}
        </p>
      )}
      <div className="mt-4 grid gap-3">
        {jobs.length === 0 && <p className="text-sm text-slate-600">{t.empty}</p>}
        {jobs.map((j) => (
          <div
            key={j.id}
            className="grid gap-3 rounded-xl border border-slate-200 p-4 sm:grid-cols-[1fr_auto_auto] sm:items-center"
          >
            <div>
              <p className="font-semibold text-[#07345b]">{j.title}</p>
              <p className="text-xs text-slate-500">{j.status}</p>
            </div>
            <select
              id={`close-${j.id}`}
              defaultValue="filled"
              className="rounded-xl border border-slate-200 px-3 py-2"
            >
              <option value="filled">{t.filled}</option>
              <option value="process_closed">{t.process_closed}</option>
              <option value="cancelled">{t.cancelled}</option>
            </select>
            <button
              onClick={() => {
                const el = document.getElementById(`close-${j.id}`) as HTMLSelectElement | null;
                void close(j.id, el?.value ?? "process_closed");
              }}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold"
            >
              {t.action}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
function I({ l, children }: { l: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      <span className="mb-2 block">{l}</span>
      {children}
    </label>
  );
}

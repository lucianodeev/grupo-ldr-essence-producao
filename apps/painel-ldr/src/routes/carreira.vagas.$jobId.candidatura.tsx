import { FormEvent, useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Accessibility,
  AlertCircle,
  ArrowLeft,
  BriefcaseBusiness,
  CheckCircle2,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { LanguageSelect, useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/carreira/vagas/$jobId/candidatura")({
  component: ApplicationCenter,
});

type JobRow = Record<string, any> & {
  id: string;
  title?: string | null;
  category?: string | null;
  country?: string | null;
  city?: string | null;
  work_mode?: string | null;
  contract_type?: string | null;
  career_companies?: { name?: string | null } | null;
};

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  profileUrl: string;
  summary: string;
  accessibilityNeeds: string;
  communicationPreference: string;
  shareAccessibilityWithCompany: boolean;
  allowLdrSupport: boolean;
  consentTruth: boolean;
  consentPrivacy: boolean;
};

const initialForm: FormState = {
  fullName: "",
  email: "",
  phone: "",
  location: "",
  profileUrl: "",
  summary: "",
  accessibilityNeeds: "",
  communicationPreference: "",
  shareAccessibilityWithCompany: false,
  allowLdrSupport: false,
  consentTruth: false,
  consentPrivacy: false,
};

const C = {
  pt: {
    back: "Voltar para vagas",
    title: "Central de Candidatura",
    sub: "Candidate-se pelo perfil com dados organizados, acessibilidade opcional e consentimento claro.",
    loadingJob: "Carregando vaga...",
    jobUnavailable: "Não foi possível carregar esta vaga agora.",
    companyFallback: "Empresa validada",
    locationFallback: "Localidade a confirmar",
    formTitle: "Dados da candidatura",
    fullName: "Nome completo",
    email: "E-mail",
    phone: "WhatsApp/telefone opcional",
    location: "Cidade/país onde você está",
    profileUrl: "Link do LinkedIn, portfólio ou perfil LDR opcional",
    summary: "Resumo profissional e por que essa vaga faz sentido para você",
    summaryHelp: "Escreva de forma objetiva. Isso ajuda a empresa a avaliar aderência sem depender apenas de currículo.",
    accessibilityTitle: "Acessibilidade e comunicação",
    accessibilityIntro: "Informações opcionais. Você decide se quer compartilhar com a empresa ou somente com a LDR para apoio no processo.",
    accessibilityNeeds: "Necessidades de acessibilidade, adaptação ou apoio no processo seletivo",
    communicationPreference: "Preferência de comunicação",
    communicationPlaceholder: "Selecione uma opção",
    commEmail: "E-mail",
    commPhone: "Telefone/WhatsApp",
    commVideo: "Videochamada",
    commSign: "Língua de sinais quando aplicável",
    shareCompany: "Autorizo compartilhar estas informações de acessibilidade com a empresa para organização do processo seletivo.",
    allowLdr: "Autorizo a LDR a usar estas informações para apoiar minha candidatura antes de enviar à empresa.",
    consentTruth: "Confirmo que as informações enviadas são verdadeiras e estão atualizadas.",
    consentPrivacy: "Entendo que dados sensíveis são opcionais e devem ser usados somente para acessibilidade, apoio e inclusão, nunca para discriminação.",
    submit: "Enviar candidatura",
    submitting: "Enviando...",
    success: "Candidatura enviada com segurança.",
    safePending: "Não foi possível salvar automaticamente agora. Seus dados não foram perdidos nesta tela; tente novamente após a estrutura de candidatura estar ativa no banco.",
    requiredHint: "Preencha nome, e-mail, resumo e os consentimentos obrigatórios para enviar.",
    privacyNote: "A candidatura foi desenhada para reduzir risco de reprovação por informação incompleta, preservando controle do candidato sobre dados sensíveis.",
    antiDiscrimination: "Acessibilidade, PcD ou apoio de comunicação não devem ser usados como critério negativo de triagem.",
  },
  en: {
    back: "Back to jobs",
    title: "Application Center",
    sub: "Apply through your profile with organized data, optional accessibility information and clear consent.",
    loadingJob: "Loading job...",
    jobUnavailable: "This job could not be loaded right now.",
    companyFallback: "Validated company",
    locationFallback: "Location to be confirmed",
    formTitle: "Application details",
    fullName: "Full name",
    email: "Email",
    phone: "Optional WhatsApp/phone",
    location: "City/country where you are",
    profileUrl: "Optional LinkedIn, portfolio or LDR profile link",
    summary: "Professional summary and why this role makes sense for you",
    summaryHelp: "Be objective. This helps the company assess fit beyond the resume alone.",
    accessibilityTitle: "Accessibility and communication",
    accessibilityIntro: "Optional information. You decide whether to share it with the company or only with LDR for process support.",
    accessibilityNeeds: "Accessibility, adjustment or selection-process support needs",
    communicationPreference: "Communication preference",
    communicationPlaceholder: "Select an option",
    commEmail: "Email",
    commPhone: "Phone/WhatsApp",
    commVideo: "Video call",
    commSign: "Sign language when applicable",
    shareCompany: "I authorize sharing this accessibility information with the company to organize the selection process.",
    allowLdr: "I authorize LDR to use this information to support my application before sending it to the company.",
    consentTruth: "I confirm the information submitted is true and up to date.",
    consentPrivacy: "I understand sensitive data is optional and must be used only for accessibility, support and inclusion, never for discrimination.",
    submit: "Send application",
    submitting: "Sending...",
    success: "Application submitted safely.",
    safePending: "The application could not be saved automatically right now. Your data was not lost on this screen; try again after the application structure is active in the database.",
    requiredHint: "Fill in name, email, summary and the required consent fields to submit.",
    privacyNote: "This application flow is designed to reduce rejection risk caused by incomplete information while preserving candidate control over sensitive data.",
    antiDiscrimination: "Accessibility, disability or communication support must not be used as a negative screening criterion.",
  },
  fr: {
    back: "Retour aux offres",
    title: "Centre de candidature",
    sub: "Candidatez via votre profil avec des données organisées, des informations d’accessibilité optionnelles et un consentement clair.",
    loadingJob: "Chargement de l’offre...",
    jobUnavailable: "Cette offre ne peut pas être chargée pour le moment.",
    companyFallback: "Entreprise validée",
    locationFallback: "Lieu à confirmer",
    formTitle: "Données de candidature",
    fullName: "Nom complet",
    email: "E-mail",
    phone: "WhatsApp/téléphone optionnel",
    location: "Ville/pays où vous êtes",
    profileUrl: "Lien LinkedIn, portfolio ou profil LDR optionnel",
    summary: "Résumé professionnel et pourquoi cette offre vous correspond",
    summaryHelp: "Soyez objectif. Cela aide l’entreprise à évaluer l’adéquation au-delà du CV seul.",
    accessibilityTitle: "Accessibilité et communication",
    accessibilityIntro: "Informations optionnelles. Vous décidez si elles sont partagées avec l’entreprise ou seulement avec LDR pour un accompagnement du processus.",
    accessibilityNeeds: "Besoins d’accessibilité, d’adaptation ou d’appui dans le processus de sélection",
    communicationPreference: "Préférence de communication",
    communicationPlaceholder: "Sélectionnez une option",
    commEmail: "E-mail",
    commPhone: "Téléphone/WhatsApp",
    commVideo: "Visioconférence",
    commSign: "Langue des signes si applicable",
    shareCompany: "J’autorise le partage de ces informations d’accessibilité avec l’entreprise pour organiser le processus de sélection.",
    allowLdr: "J’autorise LDR à utiliser ces informations pour soutenir ma candidature avant l’envoi à l’entreprise.",
    consentTruth: "Je confirme que les informations envoyées sont vraies et à jour.",
    consentPrivacy: "Je comprends que les données sensibles sont optionnelles et doivent être utilisées uniquement pour l’accessibilité, l’appui et l’inclusion, jamais pour discriminer.",
    submit: "Envoyer la candidature",
    submitting: "Envoi...",
    success: "Candidature envoyée en sécurité.",
    safePending: "La candidature n’a pas pu être enregistrée automatiquement pour le moment. Vos données ne sont pas perdues sur cet écran ; réessayez lorsque la structure de candidature sera active dans la base.",
    requiredHint: "Remplissez le nom, l’e-mail, le résumé et les consentements obligatoires pour envoyer.",
    privacyNote: "Ce parcours vise à réduire le risque de refus dû à des informations incomplètes tout en gardant le contrôle du candidat sur ses données sensibles.",
    antiDiscrimination: "L’accessibilité, le handicap ou l’appui de communication ne doivent pas être utilisés comme critère négatif de tri.",
  },
  es: {
    back: "Volver a vacantes",
    title: "Centro de Candidatura",
    sub: "Postúlate desde tu perfil con datos organizados, accesibilidad opcional y consentimiento claro.",
    loadingJob: "Cargando vacante...",
    jobUnavailable: "No fue posible cargar esta vacante ahora.",
    companyFallback: "Empresa validada",
    locationFallback: "Ubicación por confirmar",
    formTitle: "Datos de la candidatura",
    fullName: "Nombre completo",
    email: "Correo electrónico",
    phone: "WhatsApp/teléfono opcional",
    location: "Ciudad/país donde estás",
    profileUrl: "Enlace opcional de LinkedIn, portafolio o perfil LDR",
    summary: "Resumen profesional y por qué esta vacante tiene sentido para ti",
    summaryHelp: "Escribe de forma objetiva. Esto ayuda a la empresa a evaluar afinidad más allá del currículum.",
    accessibilityTitle: "Accesibilidad y comunicación",
    accessibilityIntro: "Información opcional. Tú decides si compartirla con la empresa o solo con LDR para apoyo en el proceso.",
    accessibilityNeeds: "Necesidades de accesibilidad, adaptación o apoyo en el proceso selectivo",
    communicationPreference: "Preferencia de comunicación",
    communicationPlaceholder: "Selecciona una opción",
    commEmail: "Correo electrónico",
    commPhone: "Teléfono/WhatsApp",
    commVideo: "Videollamada",
    commSign: "Lengua de señas cuando aplique",
    shareCompany: "Autorizo compartir esta información de accesibilidad con la empresa para organizar el proceso selectivo.",
    allowLdr: "Autorizo a LDR a usar esta información para apoyar mi candidatura antes de enviarla a la empresa.",
    consentTruth: "Confirmo que la información enviada es verdadera y está actualizada.",
    consentPrivacy: "Entiendo que los datos sensibles son opcionales y deben usarse solo para accesibilidad, apoyo e inclusión, nunca para discriminación.",
    submit: "Enviar candidatura",
    submitting: "Enviando...",
    success: "Candidatura enviada con seguridad.",
    safePending: "No fue posible guardar automáticamente ahora. Tus datos no se perdieron en esta pantalla; intenta nuevamente cuando la estructura de candidatura esté activa en la base.",
    requiredHint: "Completa nombre, correo, resumen y consentimientos obligatorios para enviar.",
    privacyNote: "Este flujo está diseñado para reducir el riesgo de rechazo por información incompleta, preservando el control del candidato sobre datos sensibles.",
    antiDiscrimination: "La accesibilidad, discapacidad o apoyo de comunicación no deben usarse como criterio negativo de selección.",
  },
} as const;

function ApplicationCenter() {
  const { jobId } = Route.useParams();
  const { locale } = useI18n();
  const t = C[locale as keyof typeof C] ?? C.pt;
  const [job, setJob] = useState<JobRow | null>(null);
  const [jobLoading, setJobLoading] = useState(true);
  const [jobError, setJobError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState<"idle" | "success" | "error">("idle");
  const [submitMessage, setSubmitMessage] = useState("");

  useEffect(() => {
    let alive = true;

    async function loadJob() {
      setJobLoading(true);
      setJobError(null);
      const { data, error } = await (supabase.from("career_jobs" as never) as any)
        .select("id,title,category,country,city,work_mode,contract_type,career_companies(name)")
        .eq("id", jobId)
        .eq("status", "published")
        .maybeSingle();

      if (!alive) return;
      if (error) {
        setJobError(error.message ?? t.jobUnavailable);
        setJob(null);
      } else {
        setJob(data ?? null);
      }
      setJobLoading(false);
    }

    void loadJob();

    return () => {
      alive = false;
    };
  }, [jobId, t.jobUnavailable]);

  const canSubmit = useMemo(() => {
    return (
      form.fullName.trim().length > 2 &&
      /\S+@\S+\.\S+/.test(form.email) &&
      form.summary.trim().length > 20 &&
      form.consentTruth &&
      form.consentPrivacy
    );
  }, [form]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit || submitting) return;

    setSubmitting(true);
    setSubmitState("idle");
    setSubmitMessage("");

    const shareAccessibility = form.shareAccessibilityWithCompany || form.allowLdrSupport;
    const payload = {
      job_id: jobId,
      candidate_name: form.fullName.trim(),
      candidate_email: form.email.trim().toLowerCase(),
      candidate_phone: form.phone.trim() || null,
      candidate_location: form.location.trim() || null,
      profile_url: form.profileUrl.trim() || null,
      summary: form.summary.trim(),
      accessibility_needs: shareAccessibility ? form.accessibilityNeeds.trim() || null : null,
      communication_preference: form.communicationPreference || null,
      share_accessibility_with_company: form.shareAccessibilityWithCompany,
      allow_ldr_accessibility_support: form.allowLdrSupport,
      status: "submitted",
    };

    const { error } = await (supabase.from("career_applications" as never) as any).insert(payload);

    if (error) {
      setSubmitState("error");
      setSubmitMessage(t.safePending);
    } else {
      setSubmitState("success");
      setSubmitMessage(t.success);
      setForm(initialForm);
    }

    setSubmitting(false);
  }

  const companyName = job?.career_companies?.name || t.companyFallback;
  const location = [job?.city, job?.country].filter(Boolean).join(", ") || t.locationFallback;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-5 py-10">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link
            to="/carreira/vagas"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-[#07345b] shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-[#07345b]/10"
          >
            <ArrowLeft size={16} /> {t.back}
          </Link>
          <LanguageSelect />
        </div>

        <section className="rounded-3xl bg-[#07345b] p-6 text-white shadow-sm sm:p-8">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-semibold">
            <ShieldCheck size={16} /> LDR Carreira
          </p>
          <h1 className="flex items-center gap-3 text-3xl font-bold">
            <BriefcaseBusiness /> {t.title}
          </h1>
          <p className="mt-3 max-w-3xl text-white/85">{t.sub}</p>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <form onSubmit={handleSubmit} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
            <h2 className="text-xl font-bold text-[#07345b]">{t.formTitle}</h2>
            <p className="mt-2 text-sm text-slate-600">{t.requiredHint}</p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">{t.fullName}</span>
                <input
                  value={form.fullName}
                  onChange={(event) => update("fullName", event.target.value)}
                  className="mt-2 min-h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-slate-900 outline-none focus:border-[#07345b] focus:bg-white focus:ring-4 focus:ring-[#07345b]/10"
                  required
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700">{t.email}</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => update("email", event.target.value)}
                  className="mt-2 min-h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-slate-900 outline-none focus:border-[#07345b] focus:bg-white focus:ring-4 focus:ring-[#07345b]/10"
                  required
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700">{t.phone}</span>
                <input
                  value={form.phone}
                  onChange={(event) => update("phone", event.target.value)}
                  className="mt-2 min-h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-slate-900 outline-none focus:border-[#07345b] focus:bg-white focus:ring-4 focus:ring-[#07345b]/10"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700">{t.location}</span>
                <input
                  value={form.location}
                  onChange={(event) => update("location", event.target.value)}
                  className="mt-2 min-h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-slate-900 outline-none focus:border-[#07345b] focus:bg-white focus:ring-4 focus:ring-[#07345b]/10"
                />
              </label>
            </div>

            <label className="mt-4 block">
              <span className="text-sm font-semibold text-slate-700">{t.profileUrl}</span>
              <input
                value={form.profileUrl}
                onChange={(event) => update("profileUrl", event.target.value)}
                className="mt-2 min-h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-slate-900 outline-none focus:border-[#07345b] focus:bg-white focus:ring-4 focus:ring-[#07345b]/10"
              />
            </label>

            <label className="mt-4 block">
              <span className="text-sm font-semibold text-slate-700">{t.summary}</span>
              <textarea
                value={form.summary}
                onChange={(event) => update("summary", event.target.value)}
                rows={5}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-[#07345b] focus:bg-white focus:ring-4 focus:ring-[#07345b]/10"
                required
              />
              <span className="mt-1 block text-xs text-slate-500">{t.summaryHelp}</span>
            </label>

            <section className="mt-6 rounded-3xl border border-emerald-100 bg-emerald-50 p-4">
              <h3 className="flex items-center gap-2 text-lg font-bold text-emerald-950">
                <Accessibility size={20} /> {t.accessibilityTitle}
              </h3>
              <p className="mt-2 text-sm text-emerald-900">{t.accessibilityIntro}</p>

              <label className="mt-4 block">
                <span className="text-sm font-semibold text-emerald-950">{t.accessibilityNeeds}</span>
                <textarea
                  value={form.accessibilityNeeds}
                  onChange={(event) => update("accessibilityNeeds", event.target.value)}
                  rows={4}
                  className="mt-2 w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-slate-900 outline-none focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
                />
              </label>

              <label className="mt-4 block">
                <span className="text-sm font-semibold text-emerald-950">{t.communicationPreference}</span>
                <select
                  value={form.communicationPreference}
                  onChange={(event) => update("communicationPreference", event.target.value)}
                  className="mt-2 min-h-12 w-full rounded-2xl border border-emerald-100 bg-white px-4 text-slate-900 outline-none focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
                >
                  <option value="">{t.communicationPlaceholder}</option>
                  <option value="email">{t.commEmail}</option>
                  <option value="phone">{t.commPhone}</option>
                  <option value="video">{t.commVideo}</option>
                  <option value="sign_language">{t.commSign}</option>
                </select>
              </label>

              <label className="mt-4 flex gap-3 text-sm font-medium text-emerald-950">
                <input
                  type="checkbox"
                  checked={form.shareAccessibilityWithCompany}
                  onChange={(event) => update("shareAccessibilityWithCompany", event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-emerald-300 text-emerald-700 focus:ring-emerald-700"
                />
                <span>{t.shareCompany}</span>
              </label>

              <label className="mt-3 flex gap-3 text-sm font-medium text-emerald-950">
                <input
                  type="checkbox"
                  checked={form.allowLdrSupport}
                  onChange={(event) => update("allowLdrSupport", event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-emerald-300 text-emerald-700 focus:ring-emerald-700"
                />
                <span>{t.allowLdr}</span>
              </label>
            </section>

            <div className="mt-5 space-y-3 rounded-2xl bg-slate-50 p-4">
              <label className="flex gap-3 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={form.consentTruth}
                  onChange={(event) => update("consentTruth", event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-[#07345b] focus:ring-[#07345b]"
                  required
                />
                <span>{t.consentTruth}</span>
              </label>

              <label className="flex gap-3 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={form.consentPrivacy}
                  onChange={(event) => update("consentPrivacy", event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-[#07345b] focus:ring-[#07345b]"
                  required
                />
                <span>{t.consentPrivacy}</span>
              </label>
            </div>

            {submitMessage && (
              <div
                className={`mt-5 flex gap-3 rounded-2xl p-4 text-sm ${
                  submitState === "success" ? "bg-emerald-50 text-emerald-900" : "bg-amber-50 text-amber-900"
                }`}
                role={submitState === "success" ? "status" : "alert"}
              >
                {submitState === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                <p>{submitMessage}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={!canSubmit || submitting}
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#07345b] px-5 font-bold text-white transition hover:bg-[#052944] focus:outline-none focus:ring-4 focus:ring-[#07345b]/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting && <Loader2 className="animate-spin" size={18} />}
              {submitting ? t.submitting : t.submit}
            </button>
          </form>

          <aside className="space-y-4">
            <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              {jobLoading && (
                <p className="flex items-center gap-2 text-slate-600">
                  <Loader2 className="animate-spin" size={18} /> {t.loadingJob}
                </p>
              )}
              {!jobLoading && jobError && (
                <p className="flex gap-2 text-sm text-red-800">
                  <AlertCircle size={18} /> {t.jobUnavailable}
                </p>
              )}
              {!jobLoading && job && (
                <div>
                  <p className="text-sm font-semibold text-slate-500">{companyName}</p>
                  <h2 className="mt-1 text-xl font-bold text-[#07345b]">{job.title}</h2>
                  <p className="mt-2 text-sm text-slate-600">{job.category}</p>
                  <p className="mt-3 text-sm font-medium text-slate-700">{location}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {[job.work_mode, job.contract_type].filter(Boolean).join(" · ")}
                  </p>
                </div>
              )}
            </section>

            <section className="rounded-3xl border border-blue-100 bg-blue-50 p-5 text-sm text-blue-950">
              <h3 className="font-bold">{t.privacyNote}</h3>
              <p className="mt-3">{t.antiDiscrimination}</p>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

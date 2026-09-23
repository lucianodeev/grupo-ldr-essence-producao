import { useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  BriefcaseBusiness,
  CheckCircle2,
  Loader2,
  Send,
  ShieldCheck,
  Upload,
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
  name: string;
  email: string;
  phone: string;
  professionalArea: string;
  profileUrl: string;
  accessibilityNeeds: string;
  shareAccessibility: boolean;
  consent: boolean;
};

const empty: FormState = {
  name: "",
  email: "",
  phone: "",
  professionalArea: "",
  profileUrl: "",
  accessibilityNeeds: "",
  shareAccessibility: false,
  consent: false,
};

const inputClass =
  "min-h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-slate-900 outline-none transition focus:border-[#07345b] focus:bg-white focus:ring-4 focus:ring-[#07345b]/10";

const C = {
  pt: {
    title: "Central de candidatura",
    subtitle:
      "Envie seu perfil para esta vaga. A empresa recebe seus dados principais e apenas as informações de acessibilidade que você autorizar compartilhar.",
    back: "Voltar para a vaga",
    loading: "Carregando vaga...",
    closed: "Vaga indisponível ou não publicada.",
    safe: "A candidatura será registrada com fallback seguro, sem depender de migração em produção.",
    name: "Nome completo",
    email: "E-mail",
    phone: "Telefone ou WhatsApp",
    area: "Área, experiência ou objetivo profissional",
    profileUrl: "Link do perfil ou portfólio",
    resume: "Anexar currículo (PDF, DOC ou DOCX)",
    resumeHelp: "Arquivo privado, até 5 MB. Somente você e a empresa responsável pela vaga poderão acessar.",
    resumeLogin: "Para anexar currículo com segurança, entre na sua conta LDR antes de enviar.",
    accessibility: "Necessidades de acessibilidade para o processo seletivo",
    shareAccessibility:
      "Autorizo compartilhar estas informações de acessibilidade com a empresa para viabilizar adaptações no processo seletivo.",
    consent:
      "Confirmo que desejo enviar minha candidatura para esta vaga e aceito ser contatado pela equipe LDR ou pela empresa responsável.",
    submit: "Enviar candidatura pelo perfil",
    success: "Candidatura enviada com sucesso. A equipe LDR poderá acompanhar a conexão com a empresa.",
    error: "Não foi possível enviar a candidatura agora. Tente novamente em instantes.",
    optional: "Opcional",
    companyFallback: "Empresa validada",
    jobFallback: "Vaga publicada",
  },
  en: {
    title: "Application center",
    subtitle:
      "Send your profile for this job. The company receives your main details and only the accessibility information you authorize sharing.",
    back: "Back to job",
    loading: "Loading job...",
    closed: "Job unavailable or not published.",
    safe: "The application will be registered with a safe fallback, without requiring a production migration.",
    name: "Full name",
    email: "Email",
    phone: "Phone or WhatsApp",
    area: "Area, experience or professional goal",
    profileUrl: "Profile or portfolio link",
    resume: "Attach résumé (PDF, DOC or DOCX)",
    resumeHelp: "Private file, up to 5 MB. Only you and the company responsible for the job can access it.",
    resumeLogin: "Sign in to your LDR account to attach a résumé securely.",
    accessibility: "Accessibility needs for the selection process",
    shareAccessibility:
      "I authorize sharing this accessibility information with the company so adjustments can be arranged in the selection process.",
    consent:
      "I confirm I want to submit my application for this job and accept being contacted by LDR or the responsible company.",
    submit: "Apply with profile",
    success: "Application sent successfully. The LDR team may follow up on the connection with the company.",
    error: "The application could not be sent right now. Please try again shortly.",
    optional: "Optional",
    companyFallback: "Validated company",
    jobFallback: "Published job",
  },
  fr: {
    title: "Centre de candidature",
    subtitle:
      "Envoyez votre profil pour cette offre. L’entreprise reçoit vos informations principales et seulement les informations d’accessibilité que vous autorisez à partager.",
    back: "Retour à l’offre",
    loading: "Chargement de l’offre...",
    closed: "Offre indisponible ou non publiée.",
    safe: "La candidature sera enregistrée avec un fallback sécurisé, sans dépendre d’une migration en production.",
    name: "Nom complet",
    email: "E-mail",
    phone: "Téléphone ou WhatsApp",
    area: "Domaine, expérience ou objectif professionnel",
    profileUrl: "Lien du profil ou portfolio",
    resume: "Joindre le CV (PDF, DOC ou DOCX)",
    resumeHelp: "Fichier privé, jusqu’à 5 Mo. Seuls vous et l’entreprise responsable de l’offre pouvez y accéder.",
    resumeLogin: "Connectez-vous à votre compte LDR pour joindre votre CV en toute sécurité.",
    accessibility: "Besoins d’accessibilité pour le processus de sélection",
    shareAccessibility:
      "J’autorise le partage de ces informations d’accessibilité avec l’entreprise afin de prévoir les adaptations du processus de sélection.",
    consent:
      "Je confirme vouloir envoyer ma candidature pour cette offre et accepter d’être contacté par LDR ou par l’entreprise responsable.",
    submit: "Postuler avec profil",
    success: "Candidature envoyée avec succès. L’équipe LDR pourra suivre la mise en relation avec l’entreprise.",
    error: "La candidature n’a pas pu être envoyée maintenant. Réessayez dans quelques instants.",
    optional: "Optionnel",
    companyFallback: "Entreprise validée",
    jobFallback: "Offre publiée",
  },
  es: {
    title: "Central de candidatura",
    subtitle:
      "Envía tu perfil para esta vacante. La empresa recibe tus datos principales y solo la información de accesibilidad que autorices compartir.",
    back: "Volver a la vacante",
    loading: "Cargando vacante...",
    closed: "Vacante no disponible o no publicada.",
    safe: "La candidatura se registrará con fallback seguro, sin depender de una migración en producción.",
    name: "Nombre completo",
    email: "Correo electrónico",
    phone: "Teléfono o WhatsApp",
    area: "Área, experiencia u objetivo profesional",
    profileUrl: "Enlace del perfil o portafolio",
    resume: "Adjuntar currículum (PDF, DOC o DOCX)",
    resumeHelp: "Archivo privado, hasta 5 MB. Solo tú y la empresa responsable de la vacante pueden acceder.",
    resumeLogin: "Inicia sesión en tu cuenta LDR para adjuntar el currículum de forma segura.",
    accessibility: "Necesidades de accesibilidad para el proceso selectivo",
    shareAccessibility:
      "Autorizo compartir esta información de accesibilidad con la empresa para facilitar adaptaciones en el proceso selectivo.",
    consent:
      "Confirmo que deseo enviar mi candidatura para esta vacante y acepto ser contactado por LDR o por la empresa responsable.",
    submit: "Postular con perfil",
    success: "Candidatura enviada con éxito. El equipo LDR podrá acompañar la conexión con la empresa.",
    error: "No fue posible enviar la candidatura ahora. Inténtalo nuevamente en instantes.",
    optional: "Opcional",
    companyFallback: "Empresa validada",
    jobFallback: "Vacante publicada",
  },
} as const;

function ApplicationCenter() {
  const { jobId } = Route.useParams();
  const { locale } = useI18n();
  const t = C[locale as keyof typeof C] ?? C.pt;
  const [job, setJob] = useState<JobRow | null | undefined>(undefined);
  const [form, setForm] = useState<FormState>(empty);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [resume, setResume] = useState<File | null>(null);

  useEffect(() => {
    let alive = true;

    async function loadJob() {
      setLoadError(null);

      const { data, error } = await (supabase.from("career_jobs" as never) as any)
        .select("id,title,category,country,city,work_mode,contract_type,status,career_companies(name)")
        .eq("id", jobId)
        .eq("status", "published")
        .maybeSingle();

      if (!alive) return;

      if (error) {
        setLoadError("Não foi possível carregar a vaga. Tente novamente.");
        setJob(null);
      } else {
        setJob(data ?? null);
      }
    }

    void loadJob();

    return () => {
      alive = false;
    };
  }, [jobId]);

  const companyName = job?.career_companies?.name || t.companyFallback;
  const location = [job?.city, job?.country].filter(Boolean).join(", ");
  const ready = Boolean(form.name.trim() && form.email.trim() && form.professionalArea.trim() && form.consent);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ready || submitting || !job) return;

    setSubmitting(true);
    setStatus("idle");

    let resumePath: string | null = null;
    if (resume) {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData.user;
      if (!user) {
        setStatus("error");
        setLoadError(t.resumeLogin);
        setSubmitting(false);
        return;
      }
      const allowed = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
      if (!allowed.includes(resume.type) || resume.size > 5 * 1024 * 1024) {
        setStatus("error");
        setLoadError("Currículo inválido. Envie PDF, DOC ou DOCX com até 5 MB.");
        setSubmitting(false);
        return;
      }
      const ext = resume.name.split(".").pop()?.toLowerCase() || "pdf";
      resumePath = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("career-resumes").upload(resumePath, resume, { contentType: resume.type, upsert: false });
      if (uploadError) {
        setStatus("error");
        setLoadError("Não foi possível anexar o currículo com segurança.");
        setSubmitting(false);
        return;
      }
    }

    const jobSummary = [
      `job_id=${job?.id ?? jobId}`,
      `job_title=${job?.title ?? t.jobFallback}`,
      `company=${companyName}`,
      job?.category ? `category=${job.category}` : "category=not_informed",
      location ? `location=${location}` : "location=not_informed",
    ].join(" | ");

    const applicationSummary = [
      jobSummary,
      `professional_area=${form.professionalArea.trim()}`,
      `profile_url=${form.profileUrl.trim() || "not_informed"}`,
      form.shareAccessibility ? "share_accessibility=yes" : "share_accessibility=no",
      `accessibility_needs=${
        form.shareAccessibility && form.accessibilityNeeds.trim() ? form.accessibilityNeeds.trim() : "not_shared"
      }`,
    ].join(" | ");

    const { error: applicationError } = await (supabase.from("career_applications" as never) as any).insert({
      job_id: job?.id ?? jobId,
      candidate_name: form.name.trim(),
      candidate_email: form.email.trim(),
      candidate_phone: form.phone.trim() || null,
      profile_url: form.profileUrl.trim() || null,
      summary: applicationSummary,
      accessibility_needs:
        form.shareAccessibility && form.accessibilityNeeds.trim() ? form.accessibilityNeeds.trim() : null,
      share_accessibility_with_company: form.shareAccessibility,
      resume_path: resumePath,
      status: "submitted",
    });

    if (applicationError) {
      if (resumePath) await supabase.storage.from("career-resumes").remove([resumePath]);
      setStatus("error");
      setSubmitting(false);
      return;
    }

    setStatus("success");
    setForm(empty);
    setResume(null);
    setSubmitting(false);
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-5 py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <Link reloadDocument
            to="/carreira/vagas/$jobId"
            params={{ jobId }}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 font-semibold text-[#07345b] transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-[#07345b]/10"
          >
            <ArrowLeft size={18} aria-hidden="true" />
            {t.back}
          </Link>
          <LanguageSelect />
        </div>

        <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 md:p-8">
          <p className="inline-flex items-center gap-2 rounded-full bg-[#07345b]/10 px-3 py-1 text-sm font-semibold text-[#07345b]">
            <BriefcaseBusiness size={16} aria-hidden="true" />
            LDR Carreira
          </p>
          <h1 className="mt-4 text-3xl font-bold text-[#07345b] md:text-4xl">{t.title}</h1>
          <p className="mt-3 max-w-3xl text-slate-600">{t.subtitle}</p>

          {job === undefined && (
            <div className="mt-6 flex items-center gap-3 rounded-2xl bg-slate-50 p-4 text-slate-600" role="status">
              <Loader2 className="animate-spin" size={20} aria-hidden="true" />
              <span>{t.loading}</span>
            </div>
          )}

          {(job === null || loadError) && (
            <div
              className="mt-6 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
              role="alert"
            >
              <AlertCircle className="mt-0.5 shrink-0" size={18} aria-hidden="true" />
              <p>{loadError || t.closed}</p>
            </div>
          )}

          {job && (
            <div className="mt-6 rounded-2xl bg-slate-50 p-5">
              <p className="font-semibold text-[#c28d19]">{companyName}</p>
              <h2 className="mt-1 text-2xl font-bold text-[#07345b]">{job.title || t.jobFallback}</h2>
              <p className="mt-2 text-sm text-slate-600">
                {[job.category, location, job.work_mode, job.contract_type].filter(Boolean).join(" · ")}
              </p>
              <p className="mt-4 inline-flex items-start gap-2 rounded-xl bg-white p-3 text-sm text-slate-600">
                <ShieldCheck className="mt-0.5 shrink-0" size={18} aria-hidden="true" />
                {t.safe}
              </p>
            </div>
          )}
        </section>

        {job && (
          <form
            onSubmit={handleSubmit}
            aria-describedby="application-status"
            className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 md:p-8"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field label={t.name} required>
                <input
                  required
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  className={inputClass}
                />
              </Field>

              <Field label={t.email} required>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  className={inputClass}
                />
              </Field>

              <Field label={`${t.phone} (${t.optional})`}>
                <input
                  type="tel"
                  inputMode="tel"
                  value={form.phone}
                  onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                  className={inputClass}
                />
              </Field>

              <Field label={`${t.profileUrl} (${t.optional})`}>
                <input
                  type="url"
                  value={form.profileUrl}
                  onChange={(event) => setForm((current) => ({ ...current, profileUrl: event.target.value }))}
                  className={inputClass}
                />
              </Field>

              <label className="block md:col-span-2">
                <span className="text-sm font-semibold text-slate-800">{t.resume} ({t.optional})</span>
                <div className="mt-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#07345b]"><Upload size={18} aria-hidden="true" /> {resume?.name || t.resume}</div>
                  <input type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(event) => setResume(event.target.files?.[0] ?? null)} className="mt-3 block w-full text-sm text-slate-700" />
                  <p className="mt-2 text-xs text-slate-500">{t.resumeHelp}</p>
                </div>
              </label>

              <label className="block md:col-span-2">
                <span className="text-sm font-semibold text-slate-800">{t.area} *</span>
                <textarea
                  required
                  value={form.professionalArea}
                  onChange={(event) => setForm((current) => ({ ...current, professionalArea: event.target.value }))}
                  rows={4}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-[#07345b] focus:bg-white focus:ring-4 focus:ring-[#07345b]/10"
                />
              </label>

              <label className="block md:col-span-2">
                <span className="text-sm font-semibold text-slate-800">
                  {t.accessibility} ({t.optional})
                </span>
                <textarea
                  value={form.accessibilityNeeds}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, accessibilityNeeds: event.target.value }))
                  }
                  rows={3}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-[#07345b] focus:bg-white focus:ring-4 focus:ring-[#07345b]/10"
                />
              </label>
            </div>

            <div className="mt-5 grid gap-3">
              <Check
                checked={form.shareAccessibility}
                onChange={(value) => setForm((current) => ({ ...current, shareAccessibility: value }))}
              >
                {t.shareAccessibility}
              </Check>

              <Check checked={form.consent} onChange={(value) => setForm((current) => ({ ...current, consent: value }))}>
                {t.consent}
              </Check>
            </div>

            <div id="application-status" className="mt-5" aria-live="polite">
              {status === "success" && (
                <p className="flex gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                  <CheckCircle2 size={18} aria-hidden="true" /> {t.success}
                </p>
              )}
              {status === "error" && (
                <p className="flex gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
                  <AlertCircle size={18} aria-hidden="true" /> {t.error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!ready || submitting}
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#07345b] px-6 font-semibold text-white transition hover:bg-[#0b426f] focus:outline-none focus:ring-4 focus:ring-[#07345b]/20 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {submitting ? (
                <Loader2 className="animate-spin" size={18} aria-hidden="true" />
              ) : (
                <Send size={18} aria-hidden="true" />
              )}
              {t.submit}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}

function Field({ label, children, required = false }: { label: string; children: ReactNode; required?: boolean }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-800">
        {label}
        {required ? " *" : ""}
      </span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function Check({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  children: ReactNode;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4 rounded border-slate-300 text-[#07345b] focus:ring-[#07345b]"
      />
      <span>{children}</span>
    </label>
  );
}

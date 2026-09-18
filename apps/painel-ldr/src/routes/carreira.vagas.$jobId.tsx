import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, MapPin, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { LanguageSelect, useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/carreira/vagas/$jobId")({ component: Job });

const C = {
  pt: {
    back: "Voltar para vagas",
    about: "Sobre a vaga",
    resp: "Responsabilidades",
    req: "Requisitos mínimos",
    apply: "Candidatar pelo perfil",
    closed: "Vaga indisponível ou não publicada.",
    safe: "Esta vaga passou pela etapa de publicação da plataforma.",
  },
  en: {
    back: "Back to jobs",
    about: "About the job",
    resp: "Responsibilities",
    req: "Minimum requirements",
    apply: "Apply with profile",
    closed: "Job unavailable or not published.",
    safe: "This job passed the platform publication stage.",
  },
  fr: {
    back: "Retour aux offres",
    about: "À propos du poste",
    resp: "Responsabilités",
    req: "Exigences minimales",
    apply: "Postuler avec profil",
    closed: "Offre indisponible ou non publiée.",
    safe: "Cette offre a passé l’étape de publication de la plateforme.",
  },
  es: {
    back: "Volver a vacantes",
    about: "Sobre la vacante",
    resp: "Responsabilidades",
    req: "Requisitos mínimos",
    apply: "Postular con perfil",
    closed: "Vacante no disponible o no publicada.",
    safe: "Esta vacante pasó por la etapa de publicación de la plataforma.",
  },
} as const;

function Job() {
  const { jobId } = Route.useParams();
  const { locale } = useI18n();
  const t = C[locale as keyof typeof C] ?? C.pt;
  const [j, setJ] = useState<any>();

  useEffect(() => {
    let alive = true;

    void (async () => {
      const { data } = await (supabase.from("career_jobs" as never) as any)
        .select(
          "id,title,description,responsibilities,requirements,country,city,work_mode,contract_type,publication_language,required_languages,salary_currency,salary_min,salary_max,salary_period,career_companies(name,website)",
        )
        .eq("id", jobId)
        .eq("status", "published")
        .maybeSingle();

      if (alive) setJ(data ?? null);
    })();

    return () => {
      alive = false;
    };
  }, [jobId]);

  if (j === null) {
    return (
      <main className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-6">{t.closed}</div>
      </main>
    );
  }

  if (!j) return null;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-5 py-10">
        <div className="flex items-center justify-between gap-4">
          <Link
            to="/carreira/vagas"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-[#07345b] shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-[#07345b]/10"
          >
            <ArrowLeft size={16} /> {t.back}
          </Link>
          <LanguageSelect />
        </div>

        <article className="mt-5 rounded-3xl bg-white p-6 shadow-sm md:p-9">
          <p className="font-semibold text-[#c28d19]">{j.career_companies?.name}</p>
          <h1 className="mt-2 text-3xl font-bold text-[#07345b] md:text-4xl">{j.title}</h1>
          <p className="mt-4 flex flex-wrap items-center gap-2 text-slate-600">
            <MapPin size={18} />
            {[j.city, j.country].filter(Boolean).join(", ")} · {j.work_mode} · {j.contract_type}
          </p>

          <div className="mt-6 flex gap-2 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
            <ShieldCheck size={19} /> {t.safe}
          </div>

          <S title={t.about}>{j.description}</S>
          {j.responsibilities && <S title={t.resp}>{j.responsibilities}</S>}
          <S title={t.req}>{j.requirements}</S>

          <Link
            to="/carreira/vagas/$jobId/candidatura"
            params={{ jobId: j.id }}
            className="mt-8 inline-flex min-h-12 items-center justify-center rounded-xl bg-[#07345b] px-6 font-semibold text-white transition hover:bg-[#0b426f] focus:outline-none focus:ring-4 focus:ring-[#07345b]/20"
          >
            {t.apply}
          </Link>
        </article>
      </div>
    </main>
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

import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Clock3, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { LanguageSelect, useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/admin/carreira/vagas")({ component: Moderation });

const C = {
  pt: { title: "Moderação de vagas", sub: "Revise vagas antes da publicação pública.", empty: "Nenhuma vaga aguardando análise.", publish: "Aprovar e publicar", reject: "Rejeitar", pending: "Pendente", done: "Moderação concluída.", error: "Não foi possível concluir a moderação." },
  en: { title: "Job moderation", sub: "Review jobs before public publication.", empty: "No jobs awaiting review.", publish: "Approve and publish", reject: "Reject", pending: "Pending", done: "Moderation completed.", error: "Unable to complete moderation." },
  fr: { title: "Modération des offres", sub: "Vérifiez les offres avant leur publication.", empty: "Aucune offre en attente.", publish: "Approuver et publier", reject: "Rejeter", pending: "En attente", done: "Modération terminée.", error: "Impossible de terminer la modération." },
  es: { title: "Moderación de vacantes", sub: "Revisa las vacantes antes de su publicación.", empty: "No hay vacantes pendientes.", publish: "Aprobar y publicar", reject: "Rechazar", pending: "Pendiente", done: "Moderación completada.", error: "No fue posible completar la moderación." },
} as const;

function Moderation() {
  const { locale } = useI18n();
  const t = C[locale];
  const [jobs, setJobs] = useState<any[]>([]);
  const [status, setStatus] = useState("");

  async function load() {
    const { data } = await (supabase.from("career_jobs" as never) as any)
      .select("id,title,category,description,requirements,country,city,work_mode,contract_type,created_at,career_companies(name,professional_email)")
      .eq("status", "pending_review")
      .order("created_at", { ascending: true })
      .limit(100);
    setJobs(data ?? []);
  }

  useEffect(() => { void load(); }, []);

  async function act(id: string, next: "published" | "rejected") {
    setStatus("");
    const { error } = await supabase.rpc("career_admin_set_job_status" as never, { p_job_id: id, p_status: next } as never);
    if (error) { setStatus(t.error); return; }
    setStatus(t.done);
    await load();
  }

  return <main className="min-h-screen bg-slate-50"><div className="mx-auto max-w-5xl px-5 py-10">
    <div className="mb-4"><a href="/admin/contatos" className="font-semibold text-[#07345b]">Atendimento do Ecossistema →</a></div><div className="flex items-start justify-between gap-4"><div><h1 className="text-3xl font-bold text-[#07345b]">{t.title}</h1><p className="mt-2 text-slate-600">{t.sub}</p></div><LanguageSelect /></div>
    {status && <p role="status" className="mt-5 rounded-xl bg-white p-4 text-sm">{status}</p>}
    <div className="mt-8 grid gap-5">
      {jobs.length === 0 && <p className="rounded-2xl bg-white p-6">{t.empty}</p>}
      {jobs.map((j) => <article key={j.id} className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-semibold text-amber-700"><Clock3 size={17} />{t.pending}</div>
        <h2 className="mt-2 text-xl font-bold text-[#07345b]">{j.title}</h2>
        <p className="mt-1 text-slate-600">{j.career_companies?.name} · {j.category} · {[j.city, j.country].filter(Boolean).join(", ")}</p>
        <p className="mt-4 whitespace-pre-line text-sm leading-6 text-slate-700">{j.description}</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button onClick={() => void act(j.id, "published")} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#07345b] px-5 font-semibold text-white"><CheckCircle2 size={18} />{t.publish}</button>
          <button onClick={() => void act(j.id, "rejected")} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-red-300 px-5 font-semibold text-red-700"><XCircle size={18} />{t.reject}</button>
        </div>
      </article>)}
    </div>
  </div></main>;
}

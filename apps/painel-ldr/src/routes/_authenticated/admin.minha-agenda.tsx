import { Link, createFileRoute } from "@tanstack/react-router";
import { useAccess, useAppointments } from "@/lib/central-data";

export const Route = createFileRoute("/_authenticated/admin/minha-agenda")({ component: MinhaAgendaAdmin });

function MinhaAgendaAdmin() {
  const access = useAccess();
  const appointments = useAppointments();
  if (access.isLoading) return <div className="s8-card mx-auto max-w-md text-center">Carregando...</div>;
  if (!access.data?.authorized || access.data.role !== "superadmin") return <div className="s8-card mx-auto max-w-xl text-center"><h1 className="font-serif text-3xl">403</h1><p className="mt-2 text-sm text-muted-foreground">Área exclusiva do administrador master.</p></div>;

  const now = new Date();
  const todayKey = now.toLocaleDateString("pt-BR");
  const today = (appointments.data ?? []).filter((item) => item.starts_at && new Date(item.starts_at).toLocaleDateString("pt-BR") === todayKey);
  const upcoming = (appointments.data ?? []).filter((item) => item.starts_at && new Date(item.starts_at).getTime() >= now.getTime()).slice(0, 8);

  return <div className="space-y-6">
    <section className="rounded-2xl border border-[#C7A33B]/60 bg-[#F8F3E8] p-6 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#C7A33B]">Painel Master LDR</p>
      <h1 className="mt-2 font-serif text-3xl text-[#0B1F3A]">Minha agenda</h1>
      <p className="mt-3 text-sm text-slate-600">Visão rápida dos compromissos cadastrados na agenda central.</p>
      <div className="mt-5 flex flex-wrap gap-3"><span className="rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#0B1F3A]">Hoje: {today.length}</span><span className="rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#0B1F3A]">Próximos: {upcoming.length}</span></div>
    </section>

    <section className="rounded-2xl border border-[#C7A33B]/40 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-serif text-2xl text-[#0B1F3A]">Próximos compromissos</h2><Link to="/painel-profissional/agenda" className="rounded-xl bg-[#0B1F3A] px-4 py-2.5 text-sm font-bold text-white">Abrir agenda completa</Link></div>
      {appointments.isLoading ? <p className="mt-4 text-sm text-slate-500">Carregando agenda...</p> : upcoming.length === 0 ? <p className="mt-4 text-sm text-slate-500">Nenhum próximo compromisso encontrado.</p> : <div className="mt-4 grid gap-3">{upcoming.map((item) => <article key={item.id} className="rounded-xl border border-slate-200 bg-[#F8F3E8] p-4"><p className="font-bold text-[#0B1F3A]">{item.starts_at ? new Date(item.starts_at).toLocaleString("pt-BR") : "Horário não definido"}</p><p className="mt-1 text-sm text-slate-600">Status: {item.status ?? "—"}</p></article>)}</div>}
    </section>

    <div className="flex flex-wrap gap-3"><Link to="/admin/meus-atendimentos" className="rounded-xl border border-[#C7A33B] bg-white px-4 py-3 text-sm font-bold text-[#0B1F3A]">Meus atendimentos</Link><Link to="/admin" className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-[#0B1F3A]">← Painel Master</Link></div>
  </div>;
}

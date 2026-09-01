import { Link, createFileRoute } from "@tanstack/react-router";
import { useAccess, useAppointments, useCustomers } from "@/lib/central-data";

export const Route = createFileRoute("/_authenticated/admin/minha-agenda")({ component: MinhaAgendaAdmin });

function MinhaAgendaAdmin() {
  const access = useAccess();
  const appointments = useAppointments();
  const customers = useCustomers();
  if (access.isLoading) return <div className="s8-card mx-auto max-w-md text-center">Carregando...</div>;
  if (!access.data?.authorized || access.data.role !== "superadmin") return <div className="s8-card mx-auto max-w-xl text-center"><h1 className="font-serif text-3xl">403</h1><p className="mt-2 text-sm text-muted-foreground">Área exclusiva do administrador master.</p></div>;

  const now = new Date();
  const todayKey = now.toLocaleDateString("pt-BR");
  const list = appointments.data ?? [];
  const today = list.filter((item) => item.starts_at && new Date(item.starts_at).toLocaleDateString("pt-BR") === todayKey);
  const upcoming = list.filter((item) => item.starts_at && new Date(item.starts_at).getTime() >= now.getTime()).slice(0, 12);
  const customerById = new Map((customers.data ?? []).map((item) => [item.id, item]));

  return <div className="space-y-6">
    <section className="rounded-2xl border border-[#C7A33B]/60 bg-[#F8F3E8] p-6 shadow-sm sm:p-8">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#C7A33B]">Painel Master LDR</p>
      <h1 className="mt-2 font-serif text-3xl text-[#0B1F3A] sm:text-4xl">Minha agenda</h1>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">Visão operacional dos seus compromissos usando a agenda central já existente.</p>
      <div className="mt-5 flex flex-wrap gap-3"><span className="rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#0B1F3A]">Hoje: {today.length}</span><span className="rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#0B1F3A]">Próximos exibidos: {upcoming.length}</span></div>
    </section>

    {appointments.isError && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">Não foi possível carregar sua agenda agora. Tente novamente em instantes.</div>}

    <section className="rounded-2xl border border-[#C7A33B]/40 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-serif text-2xl text-[#0B1F3A]">Próximos compromissos</h2><Link to="/painel-profissional/agenda" className="rounded-xl bg-[#0B1F3A] px-4 py-2.5 text-sm font-bold text-white">Abrir agenda completa</Link></div>
      {appointments.isLoading ? <p className="mt-4 text-sm text-slate-500">Carregando agenda...</p> : upcoming.length === 0 ? <p className="mt-4 text-sm text-slate-500">Nenhum próximo compromisso encontrado.</p> : <div className="mt-4 grid gap-3">{upcoming.map((item) => {
        const customer = item.customer_id ? customerById.get(item.customer_id) : undefined;
        return <article key={item.id} className="rounded-2xl border border-slate-200 bg-[#F8F3E8] p-4">
          <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-bold text-[#0B1F3A]">{item.title || "Atendimento"}</p><p className="mt-1 text-sm text-slate-600">{item.starts_at ? new Date(item.starts_at).toLocaleString("pt-BR") : "Horário não definido"}</p></div><span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#0B1F3A]">{item.status ?? "—"}</span></div>
          <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3"><p><span className="font-bold text-[#0B1F3A]">Cliente:</span> {customer?.full_name ?? "Não vinculado"}</p><p><span className="font-bold text-[#0B1F3A]">Duração:</span> {item.duration_minutes ?? "—"} min</p><p><span className="font-bold text-[#0B1F3A]">Serviço:</span> {item.catalog_key ?? "—"}</p></div>
          {item.meeting_url && <a href={item.meeting_url} target="_blank" rel="noreferrer" className="mt-3 inline-flex rounded-xl bg-[#0B1F3A] px-4 py-2.5 text-sm font-bold text-white">Abrir Meet</a>}
        </article>;
      })}</div>}
    </section>

    <div className="flex flex-wrap gap-3"><Link to="/admin/meus-atendimentos" className="rounded-xl border border-[#C7A33B] bg-white px-4 py-3 text-sm font-bold text-[#0B1F3A]">Meus atendimentos</Link><Link to="/admin" className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-[#0B1F3A]">← Painel Master</Link></div>
  </div>;
}

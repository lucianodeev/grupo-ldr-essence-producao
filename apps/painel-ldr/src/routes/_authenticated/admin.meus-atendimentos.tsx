import { Link, createFileRoute } from "@tanstack/react-router";
import { useAccess, useAppointments } from "@/lib/central-data";

export const Route = createFileRoute("/_authenticated/admin/meus-atendimentos")({ component: MeusAtendimentosAdmin });

function MeusAtendimentosAdmin() {
  const access = useAccess();
  const appointments = useAppointments();
  if (access.isLoading) return <div className="s8-card mx-auto max-w-md text-center">Carregando...</div>;
  if (!access.data?.authorized || access.data.role !== "superadmin") {
    return <div className="s8-card mx-auto max-w-xl text-center"><h1 className="font-serif text-3xl">403</h1><p className="mt-2 text-sm text-muted-foreground">Área exclusiva do administrador master.</p></div>;
  }

  const now = new Date();
  const nextAppointment = (appointments.data ?? []).find((item) => item.starts_at && new Date(item.starts_at).getTime() >= now.getTime());

  return <div className="space-y-6">
    <section className="rounded-2xl border border-[#C7A33B]/60 bg-[#F8F3E8] p-6 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#C7A33B]">Painel Master LDR</p>
      <h1 className="mt-2 font-serif text-3xl text-[#0B1F3A]">Meus atendimentos</h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">Sua central pessoal de operação. Os dados continuam vindo das áreas já existentes para evitar duplicação e preservar as regras atuais.</p>
      <div className="mt-5 rounded-xl border border-[#C7A33B]/35 bg-white p-4"><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#C7A33B]">Próximo atendimento</p><p className="mt-1 font-serif text-xl text-[#0B1F3A]">{nextAppointment?.starts_at ? new Date(nextAppointment.starts_at).toLocaleString("pt-BR") : "Nenhum próximo atendimento encontrado"}</p>{nextAppointment && <p className="mt-1 text-sm text-slate-600">Status: {nextAppointment.status ?? "—"}</p>}</div>
    </section>

    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Link to="/painel-profissional/psicanalise" className="rounded-2xl border border-[#C7A33B]/40 bg-white p-5 shadow-sm"><h2 className="font-serif text-xl text-[#0B1F3A]">Atendimentos</h2><p className="mt-2 text-sm text-slate-600">Abrir a área operacional de sessões e acompanhamento.</p><span className="mt-4 inline-block text-sm font-bold text-[#0B1F3A]">Abrir →</span></Link>
      <Link to="/admin/minha-agenda" className="rounded-2xl border border-[#C7A33B]/40 bg-white p-5 shadow-sm"><h2 className="font-serif text-xl text-[#0B1F3A]">Agenda</h2><p className="mt-2 text-sm text-slate-600">Consultar compromissos, horários e próximos atendimentos.</p><span className="mt-4 inline-block text-sm font-bold text-[#0B1F3A]">Abrir →</span></Link>
      <Link to="/admin/meus-clientes" className="rounded-2xl border border-[#C7A33B]/40 bg-white p-5 shadow-sm"><h2 className="font-serif text-xl text-[#0B1F3A]">Clientes</h2><p className="mt-2 text-sm text-slate-600">Acessar clientes vinculados à sua operação.</p><span className="mt-4 inline-block text-sm font-bold text-[#0B1F3A]">Abrir →</span></Link>
      <Link to="/admin/meus-pedidos" className="rounded-2xl border border-[#C7A33B]/40 bg-white p-5 shadow-sm"><h2 className="font-serif text-xl text-[#0B1F3A]">Pedidos</h2><p className="mt-2 text-sm text-slate-600">Consultar contratações e pedidos relacionados aos atendimentos.</p><span className="mt-4 inline-block text-sm font-bold text-[#0B1F3A]">Abrir →</span></Link>
    </section>

    <div className="flex flex-wrap gap-3"><Link to="/painel-profissional/psicanalise" className="inline-flex rounded-xl bg-[#0B1F3A] px-4 py-3 text-sm font-bold text-white">Abrir atendimento operacional</Link><Link to="/admin" className="inline-flex rounded-xl border border-[#C7A33B] bg-white px-4 py-3 text-sm font-bold text-[#0B1F3A]">← Voltar ao Painel Master</Link></div>
  </div>;
}

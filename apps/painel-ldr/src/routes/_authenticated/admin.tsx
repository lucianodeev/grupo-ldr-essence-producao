import { Link, createFileRoute } from "@tanstack/react-router";
import { useAccess, useAppointments, useCustomers, useOrders, useTeam } from "@/lib/central-data";

export const Route = createFileRoute("/_authenticated/admin")({ component: MasterAdmin });

const sections = [
  { title: "Meus atendimentos", description: "Acesse sua operação diária, sessões, agenda e clientes próprios.", links: [
    ["Central de atendimentos", "/admin/meus-atendimentos"],
    ["Minha agenda", "/admin/minha-agenda"],
    ["Meus clientes", "/admin/meus-clientes"],
    ["Meus pedidos", "/admin/meus-pedidos"],
  ]},
  { title: "Rede de Profissionais LDR", description: "Administre profissionais, serviços, planos, financeiro, repasses, conformidade e conteúdo.", links: [
    ["Central da Rede", "/admin/rede"],
    ["Profissionais", "/painel-profissional/rede-profissionais"],
    ["Serviços da rede", "/painel-profissional/rede-servicos"],
    ["Planos da rede", "/painel-profissional/rede-planos"],
  ]},
  { title: "Empresas, funcionários e operação", description: "Centralize empresas, colaboradores, equipe, catálogo, entregas e acessos.", links: [
    ["Central de empresas", "/admin/empresas"],
    ["Equipe LDR", "/painel-profissional/equipe"],
    ["Catálogo de serviços", "/painel-profissional/catalogo"],
    ["Gestão de acessos", "/painel-profissional/acessos"],
  ]},
  { title: "Financeiro e desenvolvimento", description: "Acompanhe financeiro, pedidos, mentorias, S8 e treinamentos do ecossistema.", links: [
    ["Central financeira", "/admin/financeiro"],
    ["Mentoria", "/painel-profissional/mentoria"],
    ["Sistema S8", "/painel-profissional/s8"],
    ["Treinamentos", "/painel-profissional/treinamentos"],
  ]},
] as const;

function MasterAdmin() {
  const access = useAccess();
  const appointments = useAppointments();
  const customers = useCustomers();
  const orders = useOrders();
  const team = useTeam();
  if (access.isLoading) return <div className="s8-card mx-auto max-w-md text-center">Carregando painel master...</div>;
  if (!access.data?.authorized || access.data.role !== "superadmin") {
    return <div className="s8-card mx-auto max-w-xl text-center"><h1 className="font-serif text-3xl">403</h1><p className="mt-2 text-sm text-muted-foreground">Esta área é exclusiva do administrador master da LDR.</p></div>;
  }

  const now = new Date();
  const todayKey = now.toLocaleDateString("pt-BR");
  const appointmentList = appointments.data ?? [];
  const todayAppointments = appointmentList.filter((item) => item.starts_at && new Date(item.starts_at).toLocaleDateString("pt-BR") === todayKey);
  const nextAppointment = appointmentList.find((item) => item.starts_at && new Date(item.starts_at).getTime() >= now.getTime());
  const metrics = [
    ["Atendimentos hoje", todayAppointments.length],
    ["Clientes visíveis", customers.data?.length ?? 0],
    ["Pedidos visíveis", orders.data?.length ?? 0],
    ["Equipe autorizada", Array.isArray(team.data) ? team.data.length : 0],
  ] as const;

  return <div className="space-y-7">
    <section className="rounded-2xl border border-[#C7A33B]/60 bg-[#F8F3E8] p-6 shadow-sm sm:p-8">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#C7A33B]">Painel Master LDR</p>
      <h1 className="mt-2 font-serif text-3xl text-[#0B1F3A] sm:text-4xl">Central de administração e atendimentos</h1>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">Um único ponto de acesso para administrar o ecossistema LDR e sua própria operação, mantendo profissionais, empresas, funcionários e clientes separados por permissão.</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link to="/admin/meus-atendimentos" className="rounded-xl bg-[#0B1F3A] px-4 py-3 text-sm font-bold text-white">Iniciar / acompanhar atendimentos</Link>
        <Link to="/admin/minha-agenda" className="rounded-xl border border-[#C7A33B] bg-white px-4 py-3 text-sm font-bold text-[#0B1F3A]">Abrir minha agenda</Link>
        <Link to="/admin/financeiro" className="rounded-xl border border-[#C7A33B] bg-white px-4 py-3 text-sm font-bold text-[#0B1F3A]">Financeiro</Link>
      </div>
    </section>

    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map(([label,value]) => <article key={label} className="rounded-2xl border border-[#C7A33B]/35 bg-white p-5 shadow-sm"><p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{label}</p><p className="mt-2 font-serif text-4xl text-[#0B1F3A]">{value}</p></article>)}
    </section>

    <section className="rounded-2xl border border-[#C7A33B]/40 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#C7A33B]">Próximo atendimento</p><h2 className="mt-1 font-serif text-2xl text-[#0B1F3A]">{nextAppointment?.starts_at ? new Date(nextAppointment.starts_at).toLocaleString("pt-BR") : "Nenhum próximo atendimento encontrado"}</h2></div><Link to="/admin/minha-agenda" className="rounded-xl bg-[#0B1F3A] px-4 py-3 text-sm font-bold text-white">Ver agenda</Link></div>
      {nextAppointment && <p className="mt-3 text-sm text-slate-600">Status: {nextAppointment.status ?? "—"}</p>}
    </section>

    <section className="grid gap-5 md:grid-cols-2">
      {sections.map(section => <article key={section.title} className="rounded-2xl border border-[#C7A33B]/40 bg-white p-5 shadow-sm">
        <h2 className="font-serif text-2xl text-[#0B1F3A]">{section.title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{section.description}</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {section.links.map(([label,to]) => <Link key={to} to={to} className="rounded-xl border border-[#C7A33B]/35 bg-[#F8F3E8] px-3 py-3 text-sm font-semibold text-[#0B1F3A] transition hover:border-[#C7A33B] hover:bg-white">{label} →</Link>)}
        </div>
      </article>)}
    </section>

    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="font-serif text-2xl text-[#0B1F3A]">Separação de acesso</h2>
      <div className="mt-3 grid gap-3 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-3">
        <p><strong className="text-[#0B1F3A]">Master:</strong> visão administrativa global.</p>
        <p><strong className="text-[#0B1F3A]">Profissional:</strong> somente dados e operação próprios.</p>
        <p><strong className="text-[#0B1F3A]">Empresa:</strong> somente sua organização e funcionários.</p>
        <p><strong className="text-[#0B1F3A]">Funcionário:</strong> somente seus benefícios e serviços.</p>
        <p><strong className="text-[#0B1F3A]">Cliente:</strong> somente seus pedidos, agenda e dados.</p>
      </div>
    </section>
  </div>;
}

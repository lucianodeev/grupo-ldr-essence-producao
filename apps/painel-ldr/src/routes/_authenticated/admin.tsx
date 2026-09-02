import { useQuery } from "@tanstack/react-query";
import { Link, Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";

import { useAccess, useAppointments, useCustomers, useOrders, useTeam } from "@/lib/central-data";
import { ownerDashboardSummary } from "@/lib/owner-dashboard.functions";

export const Route = createFileRoute("/_authenticated/admin")({ component: MasterAdmin });

const sections = [
  { title: "1. Minha operação", description: "Seus atendimentos próprios: agenda, clientes e pedidos.", links: [
    ["Central de atendimentos", "/admin/meus-atendimentos"],
    ["Minha agenda", "/admin/minha-agenda"],
    ["Meus clientes", "/admin/meus-clientes"],
    ["Meus pedidos", "/admin/meus-pedidos"],
  ]},
  { title: "2. Rede de Profissionais LDR", description: "Cadastros, aprovação, serviços, planos, financeiro, repasses e conformidade.", links: [
    ["Central da Rede", "/admin/rede"],
    ["Profissionais", "/painel-profissional/rede-profissionais"],
    ["Serviços da rede", "/painel-profissional/rede-servicos"],
    ["Planos da rede", "/painel-profissional/rede-planos"],
    ["Financeiro da rede", "/painel-profissional/rede-profissionais-financeiro"],
    ["Repasses", "/painel-profissional/rede-profissionais-repasses"],
    ["Conformidade", "/painel-profissional/rede-profissionais-conformidade"],
    ["Conteúdo e eventos", "/painel-profissional/rede-profissionais-conteudo"],
  ]},
  { title: "3. Empresas e funcionários", description: "Empresas clientes, colaboradores, benefícios, equipe, catálogo e permissões.", links: [
    ["Central de empresas", "/admin/empresas"],
    ["Equipe LDR", "/painel-profissional/equipe"],
    ["Catálogo de serviços", "/painel-profissional/catalogo"],
    ["Gestão de acessos", "/painel-profissional/acessos"],
  ]},
  { title: "4. Financeiro e produtos", description: "Pagamentos, comissões, repasses e produtos de desenvolvimento do ecossistema.", links: [
    ["Central financeira", "/admin/financeiro"],
    ["Mentoria", "/painel-profissional/mentoria"],
    ["Sistema S8", "/painel-profissional/s8"],
    ["Treinamentos", "/painel-profissional/treinamentos"],
  ]},
] as const;

const ownerActions = [
  ["Revisar profissionais", "Aprovar perfis e acompanhar pendências de conformidade.", "/admin/rede"],
  ["Acompanhar financeiro", "Consultar pagamentos, comissões e repasses da Rede.", "/admin/financeiro"],
  ["Administrar empresas", "Gerenciar empresas, funcionários e benefícios ativos.", "/admin/empresas"],
  ["Enviar notificações", "Abrir a central global de comunicação da administração.", "/painel-profissional/notificacoes"],
] as const;

const workflow = [
  ["1", "Entrada", "Cliente, empresa ou profissional entra pelo portal correto."],
  ["2", "Compra / cadastro", "O sistema registra pedido, assinatura, serviço ou cadastro profissional."],
  ["3", "Pagamento", "Stripe confirma o pagamento e o painel atualiza o status automaticamente."],
  ["4", "Execução", "Atendimento, benefício, serviço ou agenda é liberado para o usuário correto."],
  ["5", "Financeiro", "O painel separa valor bruto, comissão LDR e valor líquido do profissional."],
  ["6", "Repasse", "Após documentação e aprovação, o repasse é processado e registrado."],
] as const;

const accessMap = [
  ["VOCÊ - Master", "Controle total do ecossistema", "/admin"],
  ["Profissional", "Somente perfil, agenda, clientes próprios, serviços e recebimentos próprios", "/painel-profissional"],
  ["Empresa", "Somente organização, funcionários, benefícios e pagamentos da empresa", "/empresa/login"],
  ["Cliente", "Somente pedidos, agenda, pagamentos e dados pessoais", "/cliente/login"],
  ["Profissional - recebimentos", "Cadastro Stripe Connect e conta bancária do próprio profissional", "/profissional-repasses"],
] as const;

function MasterAdmin() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const access = useAccess();
  if (access.isLoading) return <div className="s8-card mx-auto max-w-md text-center">Carregando painel master...</div>;
  if (!access.data?.authorized || access.data.role !== "superadmin") {
    return <div className="s8-card mx-auto max-w-xl text-center"><h1 className="font-serif text-3xl">403</h1><p className="mt-2 text-sm text-muted-foreground">Esta área é exclusiva do administrador master da LDR.</p></div>;
  }
  return pathname === "/admin" || pathname === "/admin/" ? <MasterAdminContent /> : <Outlet />;
}

function money(cents: number, currency: string) {
  try {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(cents / 100);
  } catch {
    return `${currency} ${(cents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
  }
}

function MasterAdminContent() {
  const appointments = useAppointments();
  const customers = useCustomers();
  const orders = useOrders();
  const team = useTeam();
  const fetchOwnerDashboard = useServerFn(ownerDashboardSummary);
  const ownerDashboard = useQuery({
    queryKey: ["owner-dashboard-summary"],
    queryFn: () => fetchOwnerDashboard({}),
    staleTime: 60_000,
  });
  const now = new Date();
  const todayKey = now.toLocaleDateString("pt-BR");
  const appointmentList = appointments.data ?? [];
  const todayAppointments = appointmentList.filter((item) => item.starts_at && new Date(item.starts_at).toLocaleDateString("pt-BR") === todayKey);
  const nextAppointment = appointmentList.find((item) => item.starts_at && new Date(item.starts_at).getTime() >= now.getTime());
  const operationalMetrics = [
    ["Atendimentos hoje", todayAppointments.length],
    ["Clientes visíveis", customers.data?.length ?? 0],
    ["Pedidos visíveis", orders.data?.length ?? 0],
    ["Equipe autorizada", Array.isArray(team.data) ? team.data.length : 0],
  ] as const;
  const summary = ownerDashboard.data;
  const networkMetrics = [
    ["Profissionais ativos", summary?.metrics.activeProfessionals, "/admin/rede"],
    ["Profissionais pendentes", summary?.metrics.pendingProfessionals, "/admin/rede"],
    ["Empresas ativas", summary?.metrics.activeCompanies, "/admin/empresas"],
    ["Funcionários ativos", summary?.metrics.activeEmployees, "/admin/empresas"],
    ["Assinaturas ativas", summary?.metrics.activeSubscriptions, "/admin/financeiro"],
    ["Pagamentos confirmados", summary?.metrics.paidPayments, "/admin/financeiro"],
    ["Repasses pendentes", summary?.metrics.pendingPayouts, "/painel-profissional/rede-profissionais-repasses"],
    ["Notificações pendentes", summary?.metrics.pendingNotifications, "/painel-profissional/notificacoes"],
  ] as const;

  return <div className="space-y-7">
    <section className="rounded-2xl border border-[#C7A33B]/60 bg-[#F8F3E8] p-6 shadow-sm sm:p-8">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#C7A33B]">Painel Master LDR - acesso do proprietário</p>
      <h1 className="mt-2 font-serif text-3xl text-[#0B1F3A] sm:text-4xl">Tudo começa aqui</h1>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">Use este painel como seu único ponto de entrada. Você administra sua operação, Rede de Profissionais, empresas, funcionários, clientes, pagamentos e repasses sem precisar decorar outros links.</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link to="/admin/meus-atendimentos" className="rounded-xl bg-[#0B1F3A] px-4 py-3 text-sm font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C7A33B] focus-visible:ring-offset-2">Meus atendimentos</Link>
        <Link to="/admin/rede" className="rounded-xl border border-[#C7A33B] bg-white px-4 py-3 text-sm font-bold text-[#0B1F3A]">Rede de profissionais</Link>
        <Link to="/admin/empresas" className="rounded-xl border border-[#C7A33B] bg-white px-4 py-3 text-sm font-bold text-[#0B1F3A]">Empresas e funcionários</Link>
        <Link to="/admin/financeiro" className="rounded-xl border border-[#C7A33B] bg-white px-4 py-3 text-sm font-bold text-[#0B1F3A]">Financeiro</Link>
        <Link to="/painel-profissional/rede-profissionais-repasses" className="rounded-xl border border-[#C7A33B] bg-white px-4 py-3 text-sm font-bold text-[#0B1F3A]">Repasses</Link>
      </div>
    </section>

    <section aria-labelledby="fluxo-title" className="rounded-2xl border border-[#C7A33B]/45 bg-white p-5 shadow-sm sm:p-6">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#C7A33B]">Entenda o sistema</p>
      <h2 id="fluxo-title" className="mt-1 font-serif text-2xl text-[#0B1F3A]">Fluxo da plataforma em 6 etapas</h2>
      <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {workflow.map(([step,title,description]) => <article key={step} className="rounded-2xl border border-slate-200 p-4"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0B1F3A] text-sm font-black text-white">{step}</span><h3 className="font-serif text-xl text-[#0B1F3A]">{title}</h3></div><p className="mt-3 text-sm leading-6 text-slate-600">{description}</p></article>)}
      </div>
    </section>

    <section aria-labelledby="acessos-title" className="rounded-2xl border border-[#C7A33B]/45 bg-[#F8F3E8] p-5 shadow-sm sm:p-6">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#C7A33B]">Quem entra onde</p>
      <h2 id="acessos-title" className="mt-1 font-serif text-2xl text-[#0B1F3A]">Acessos separados por perfil</h2>
      <p className="mt-2 text-sm text-slate-600">Você vê tudo. Cada outro usuário vê somente o que pertence ao próprio perfil.</p>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {accessMap.map(([label,description,to]) => <Link key={`${label}-${to}`} to={to} className="rounded-2xl border border-[#C7A33B]/35 bg-white p-4 transition hover:border-[#C7A33B] hover:shadow-sm"><h3 className="font-serif text-xl text-[#0B1F3A]">{label}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{description}</p><span className="mt-3 inline-block text-xs font-bold text-[#0B1F3A]">Abrir acesso →</span></Link>)}
      </div>
    </section>

    <section aria-labelledby="operacao-title">
      <h2 id="operacao-title" className="mb-3 font-serif text-2xl text-[#0B1F3A]">Operação de hoje</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {operationalMetrics.map(([label,value]) => <article key={label} className="rounded-2xl border border-[#C7A33B]/35 bg-white p-5 shadow-sm"><p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{label}</p><p className="mt-2 font-serif text-4xl text-[#0B1F3A]">{value}</p></article>)}
      </div>
    </section>

    <section aria-labelledby="negocio-title" className="rounded-2xl border border-[#C7A33B]/45 bg-[#F8F3E8] p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#C7A33B]">Indicadores reais</p><h2 id="negocio-title" className="mt-1 font-serif text-2xl text-[#0B1F3A] sm:text-3xl">Rede e negócio</h2></div>
        {summary?.generatedAt && <p className="text-xs text-slate-500">Atualizado em {new Date(summary.generatedAt).toLocaleString("pt-BR")}</p>}
      </div>
      {ownerDashboard.isError && <div role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">Os indicadores administrativos estão temporariamente indisponíveis. Recarregue a página para tentar novamente.</div>}
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {networkMetrics.map(([label,value,to]) => <Link key={label} to={to} aria-label={`${label}: ${value ?? "carregando"}. Abrir área relacionada.`} className="rounded-2xl border border-[#C7A33B]/35 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[#C7A33B] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C7A33B] focus-visible:ring-offset-2"><p className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">{label}</p><p className="mt-2 font-serif text-3xl text-[#0B1F3A]">{value ?? "—"}</p><span className="mt-2 inline-block text-xs font-bold text-[#0B1F3A]">Abrir →</span></Link>)}
      </div>
    </section>

    <section aria-labelledby="financeiro-title" className="rounded-2xl border border-[#C7A33B]/40 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#C7A33B]">Visão financeira acumulada</p><h2 id="financeiro-title" className="mt-1 font-serif text-2xl text-[#0B1F3A]">Pagamentos, comissões e repasses</h2></div><Link to="/admin/financeiro" className="rounded-xl bg-[#0B1F3A] px-4 py-3 text-sm font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C7A33B] focus-visible:ring-offset-2">Abrir financeiro</Link></div>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {ownerDashboard.isLoading && <p className="text-sm text-slate-500">Carregando indicadores financeiros...</p>}
        {!ownerDashboard.isLoading && !ownerDashboard.isError && (summary?.financialByCurrency.length ?? 0) === 0 && <p className="text-sm text-slate-500">Nenhum pagamento confirmado encontrado.</p>}
        {summary?.financialByCurrency.map((row) => <article key={row.currency} className="rounded-2xl border border-slate-200 p-4"><div className="flex items-center justify-between gap-3"><h3 className="font-serif text-2xl text-[#0B1F3A]">{row.currency}</h3><span className="rounded-full bg-[#F8F3E8] px-3 py-1 text-xs font-bold text-[#0B1F3A]">{row.paymentsCount} pagamentos</span></div><dl className="mt-4 grid gap-3 sm:grid-cols-2"><div><dt className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">Volume bruto</dt><dd className="mt-1 text-lg font-bold text-[#0B1F3A]">{money(row.grossCents,row.currency)}</dd></div><div><dt className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">Comissão LDR</dt><dd className="mt-1 text-lg font-bold text-[#0B1F3A]">{money(row.commissionCents,row.currency)}</dd></div><div><dt className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">Repasses pendentes</dt><dd className="mt-1 text-lg font-bold text-[#0B1F3A]">{money(row.pendingPayoutCents,row.currency)}</dd></div><div><dt className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">Repasses pagos</dt><dd className="mt-1 text-lg font-bold text-[#0B1F3A]">{money(row.paidPayoutCents,row.currency)}</dd></div></dl></article>)}
      </div>
    </section>

    <section aria-labelledby="acoes-title">
      <h2 id="acoes-title" className="mb-3 font-serif text-2xl text-[#0B1F3A]">Ações diretas do proprietário</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ownerActions.map(([title,description,to]) => <Link key={to} to={to} className="rounded-2xl border border-[#C7A33B]/35 bg-white p-5 shadow-sm transition hover:border-[#C7A33B] hover:bg-[#F8F3E8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C7A33B] focus-visible:ring-offset-2"><h3 className="font-serif text-xl text-[#0B1F3A]">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{description}</p><span className="mt-3 inline-block text-sm font-bold text-[#0B1F3A]">Abrir →</span></Link>)}
      </div>
    </section>

    <section className="rounded-2xl border border-[#C7A33B]/40 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#C7A33B]">Próximo atendimento</p><h2 className="mt-1 font-serif text-2xl text-[#0B1F3A]">{nextAppointment?.starts_at ? new Date(nextAppointment.starts_at).toLocaleString("pt-BR") : "Nenhum próximo atendimento encontrado"}</h2></div><Link to="/admin/minha-agenda" className="rounded-xl bg-[#0B1F3A] px-4 py-3 text-sm font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C7A33B] focus-visible:ring-offset-2">Ver agenda</Link></div>
      {nextAppointment && <p className="mt-3 text-sm text-slate-600">Status: {nextAppointment.status ?? "—"}</p>}
    </section>

    <section className="grid gap-5 md:grid-cols-2">
      {sections.map(section => <article key={section.title} className="rounded-2xl border border-[#C7A33B]/40 bg-white p-5 shadow-sm">
        <h2 className="font-serif text-2xl text-[#0B1F3A]">{section.title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{section.description}</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {section.links.map(([label,to]) => <Link key={to} to={to} className="rounded-xl border border-[#C7A33B]/35 bg-[#F8F3E8] px-3 py-3 text-sm font-semibold text-[#0B1F3A] transition hover:border-[#C7A33B] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C7A33B] focus-visible:ring-offset-2">{label} →</Link>)}
        </div>
      </article>)}
    </section>

    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="font-serif text-2xl text-[#0B1F3A]">Regra simples de acesso</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600"><strong className="text-[#0B1F3A]">Você entra sempre pelo /admin e vê tudo.</strong> Profissionais, empresas e clientes entram pelos próprios portais e não visualizam dados de terceiros.</p>
    </section>
  </div>;
}

import { useQuery } from "@tanstack/react-query";
import { Link, Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";

import { useAccess, useAppointments, useCustomers, useOrders } from "@/lib/central-data";
import { adminAcademyEnrollmentSummary } from "@/lib/admin-academy-enrollments.functions";
import { ownerDashboardSummary } from "@/lib/owner-dashboard.functions";

export const Route = createFileRoute("/_authenticated/admin")({ component: MasterAdmin });

const PRIMARY_AREAS = [
  ["Atendimentos", "Agenda, atendimentos de hoje, clientes e acompanhamento administrativo.", "/admin/meus-atendimentos"],
  ["Profissionais", "Aprovação, perfis, serviços, conformidade e operação da rede multidisciplinar.", "/admin/rede"],
  ["Clínica Social", "Solicitações, profissionais participantes, valores sociais e acompanhamento.", "/admin/clinica-social"],
  ["Empresas", "Planos corporativos, colaboradores, benefícios e créditos.", "/admin/empresas"],
  ["Financeiro", "Pagamentos, taxa LDR de 20%, repasses, reembolsos e conciliação.", "/admin/financeiro"],
  ["Repasses", "Valores líquidos de 80% destinados aos profissionais e status de pagamento.", "/admin/profissionais-repasses"],
] as const;

const PROFESSIONAL_TOOLS = [
  ["Profissionais", "/admin/profissionais"],
  ["Serviços", "/admin/profissionais-servicos"],
  ["Financeiro da rede", "/admin/profissionais-financeiro"],
  ["Repasses", "/admin/profissionais-repasses"],
  ["Conformidade", "/admin/profissionais-conformidade"],
  ["Conteúdo e eventos", "/admin/profissionais-conteudo"],
] as const;

const CLINIC_TOOLS = [
  ["Central de atendimentos", "/admin/meus-atendimentos"],
  ["Minha agenda", "/admin/minha-agenda"],
  ["Meus clientes", "/admin/meus-clientes"],
  ["Clínica Social", "/admin/clinica-social"],
  ["Catálogo de serviços", "/admin/catalogo"],
  ["Gestão de acessos", "/admin/acessos"],
] as const;

const SECONDARY_TOOLS = [
  ["LDR Academy", "/admin/alunos-matriculas"],
  ["Rede Acadêmica", "/admin/rede-academica"],
  ["Treinamentos", "/admin/treinamentos"],
  ["Rede Comercial", "/admin/vendedores"],
  ["Notificações", "/admin/notificacoes"],
  ["Equipe LDR", "/admin/equipe"],
] as const;

const ACCESS_MAP = [
  ["Master", "Administra a operação da LDR Essence sem acessar conteúdo clínico desnecessário.", "/admin"],
  ["Profissional", "Acessa somente perfil, serviços, agenda, clientes permitidos e recebimentos próprios.", "/painel-profissional"],
  ["Empresa", "Acessa somente sua organização, colaboradores, benefícios, créditos e informações administrativas.", "/empresa/login"],
  ["Cliente", "Acessa somente os próprios dados, pagamentos, benefícios e agendamentos.", "/cliente/login"],
] as const;

function MasterAdmin() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const access = useAccess();

  if (access.isLoading) {
    return <div className="s8-card mx-auto max-w-md text-center">Carregando Painel Master…</div>;
  }

  if (!access.data?.authorized || access.data.role !== "superadmin") {
    return (
      <div className="s8-card mx-auto max-w-xl text-center">
        <h1 className="font-serif text-3xl">403</h1>
        <p className="mt-2 text-sm text-muted-foreground">Esta área é exclusiva do administrador Master da LDR.</p>
      </div>
    );
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
  const fetchOwnerDashboard = useServerFn(ownerDashboardSummary);
  const fetchAcademySummary = useServerFn(adminAcademyEnrollmentSummary);

  const ownerDashboard = useQuery({
    queryKey: ["owner-dashboard-summary"],
    queryFn: () => fetchOwnerDashboard({}),
    staleTime: 60_000,
  });

  const academySummary = useQuery({
    queryKey: ["admin-academy-enrollment-summary"],
    queryFn: () => fetchAcademySummary({}),
    staleTime: 60_000,
  });

  const now = new Date();
  const todayKey = now.toLocaleDateString("pt-BR");
  const appointmentList = appointments.data ?? [];
  const todayAppointments = appointmentList.filter(
    (item) => item.starts_at && new Date(item.starts_at).toLocaleDateString("pt-BR") === todayKey,
  );
  const nextAppointment = appointmentList.find(
    (item) => item.starts_at && new Date(item.starts_at).getTime() >= now.getTime(),
  );
  const summary = ownerDashboard.data;

  const clinicMetrics = [
    ["Atendimentos hoje", todayAppointments.length, "/admin/meus-atendimentos"],
    ["Clientes", customers.data?.length ?? 0, "/admin/meus-clientes"],
    ["Profissionais ativos", summary?.metrics.activeProfessionals, "/admin/rede"],
    ["Profissionais pendentes", summary?.metrics.pendingProfessionals, "/admin/rede"],
    ["Empresas ativas", summary?.metrics.activeCompanies, "/admin/empresas"],
    ["Pagamentos confirmados", summary?.metrics.paidPayments, "/admin/financeiro"],
    ["Repasses pendentes", summary?.metrics.pendingPayouts, "/admin/profissionais-repasses"],
    ["Pedidos", orders.data?.length ?? 0, "/admin/financeiro"],
  ] as const;

  return (
    <div className="space-y-7">
      <section className="rounded-[1.75rem] border border-[#C7A33B]/55 bg-[#F8F3E8] p-6 shadow-sm sm:p-8">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#C7A33B]">LDR Essence · Painel Master</p>
        <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-serif text-3xl text-[#0B1F3A] sm:text-4xl">Central da clínica e da rede</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              Profissionais, atendimentos, Clínica Social, empresas e financeiro em uma única visão. A operação clínica e os dados administrativos permanecem separados por permissão.
            </p>
          </div>
          <div className="rounded-2xl border border-[#C7A33B]/45 bg-white px-5 py-4 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[.14em] text-slate-500">Regra financeira profissional</p>
            <div className="mt-1 flex items-baseline gap-3"><strong className="font-serif text-3xl text-[#0B1F3A]">20% LDR</strong><span className="text-sm font-bold text-slate-500">· 80% profissional</span></div>
            <p className="mt-1 text-xs text-slate-500">Sem mensalidade profissional.</p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link to="/admin/meus-atendimentos" className="rounded-xl bg-[#0B1F3A] px-4 py-3 text-sm font-bold text-white">Atendimentos</Link>
          <Link to="/admin/rede" className="rounded-xl border border-[#C7A33B] bg-white px-4 py-3 text-sm font-bold text-[#0B1F3A]">Profissionais</Link>
          <Link to="/admin/clinica-social" className="rounded-xl border border-[#C7A33B] bg-white px-4 py-3 text-sm font-bold text-[#0B1F3A]">Clínica Social</Link>
          <Link to="/admin/empresas" className="rounded-xl border border-[#C7A33B] bg-white px-4 py-3 text-sm font-bold text-[#0B1F3A]">Empresas</Link>
          <Link to="/admin/financeiro" className="rounded-xl border border-[#C7A33B] bg-white px-4 py-3 text-sm font-bold text-[#0B1F3A]">Financeiro</Link>
        </div>
      </section>

      <section aria-labelledby="areas-title">
        <div className="mb-4">
          <p className="text-xs font-black uppercase tracking-[.16em] text-[#C7A33B]">Operação principal</p>
          <h2 id="areas-title" className="mt-1 font-serif text-2xl text-[#0B1F3A]">O que você precisa administrar?</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PRIMARY_AREAS.map(([title, description, to]) => (
            <Link key={to} to={to} className="rounded-2xl border border-[#C7A33B]/35 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#C7A33B] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C7A33B] focus-visible:ring-offset-2">
              <h3 className="font-serif text-xl text-[#0B1F3A]">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
              <span className="mt-4 inline-block text-xs font-black uppercase tracking-[.08em] text-[#0B1F3A]">Abrir →</span>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="metrics-title" className="rounded-[1.5rem] border border-[#C7A33B]/40 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div><p className="text-xs font-black uppercase tracking-[.16em] text-[#C7A33B]">Visão geral</p><h2 id="metrics-title" className="mt-1 font-serif text-2xl text-[#0B1F3A]">Clínica e rede agora</h2></div>
          {summary?.generatedAt ? <p className="text-xs text-slate-500">Atualizado em {new Date(summary.generatedAt).toLocaleString("pt-BR")}</p> : null}
        </div>
        {ownerDashboard.isError ? <div role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">Os indicadores administrativos estão temporariamente indisponíveis.</div> : null}
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {clinicMetrics.map(([label, value, to]) => (
            <Link key={label} to={to} className="rounded-2xl border border-slate-200 bg-[#F8F3E8]/55 p-4 transition hover:border-[#C7A33B]">
              <p className="text-xs font-bold uppercase tracking-[.1em] text-slate-500">{label}</p>
              <p className="mt-2 font-serif text-3xl text-[#0B1F3A]">{value ?? "—"}</p>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="finance-title" className="rounded-[1.5rem] border border-[#C7A33B]/40 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div><p className="text-xs font-black uppercase tracking-[.16em] text-[#C7A33B]">Financeiro</p><h2 id="finance-title" className="mt-1 font-serif text-2xl text-[#0B1F3A]">Volume, taxa LDR e repasses</h2><p className="mt-2 text-sm text-slate-600">A taxa atual para novos serviços profissionais é única: 20%. Transações históricas mantêm o percentual registrado na data da compra.</p></div>
          <Link to="/admin/financeiro" className="rounded-xl bg-[#0B1F3A] px-4 py-3 text-sm font-bold text-white">Abrir financeiro</Link>
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {ownerDashboard.isLoading ? <p className="text-sm text-slate-500">Carregando indicadores financeiros…</p> : null}
          {!ownerDashboard.isLoading && !ownerDashboard.isError && (summary?.financialByCurrency.length ?? 0) === 0 ? <p className="text-sm text-slate-500">Nenhum pagamento confirmado encontrado.</p> : null}
          {summary?.financialByCurrency.map((row) => (
            <article key={row.currency} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center justify-between gap-3"><h3 className="font-serif text-2xl text-[#0B1F3A]">{row.currency}</h3><span className="rounded-full bg-[#F8F3E8] px-3 py-1 text-xs font-bold text-[#0B1F3A]">{row.paymentsCount} pagamentos</span></div>
              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                <div><dt className="text-xs font-bold uppercase tracking-[.1em] text-slate-500">Volume bruto</dt><dd className="mt-1 text-lg font-bold text-[#0B1F3A]">{money(row.grossCents, row.currency)}</dd></div>
                <div><dt className="text-xs font-bold uppercase tracking-[.1em] text-slate-500">Receita LDR</dt><dd className="mt-1 text-lg font-bold text-[#0B1F3A]">{money(row.commissionCents, row.currency)}</dd></div>
                <div><dt className="text-xs font-bold uppercase tracking-[.1em] text-slate-500">Repasses pendentes</dt><dd className="mt-1 text-lg font-bold text-[#0B1F3A]">{money(row.pendingPayoutCents, row.currency)}</dd></div>
                <div><dt className="text-xs font-bold uppercase tracking-[.1em] text-slate-500">Repasses pagos</dt><dd className="mt-1 text-lg font-bold text-[#0B1F3A]">{money(row.paidPayoutCents, row.currency)}</dd></div>
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <article className="rounded-[1.5rem] border border-[#C7A33B]/35 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[.16em] text-[#C7A33B]">Clínica</p>
          <h2 className="mt-1 font-serif text-2xl text-[#0B1F3A]">Atendimento e rede profissional</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">{CLINIC_TOOLS.map(([label, to]) => <Link key={to} to={to} className="rounded-xl border border-[#C7A33B]/30 bg-[#F8F3E8] px-3 py-3 text-sm font-semibold text-[#0B1F3A] hover:bg-white">{label} →</Link>)}</div>
        </article>
        <article className="rounded-[1.5rem] border border-[#C7A33B]/35 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[.16em] text-[#C7A33B]">Profissionais</p>
          <h2 className="mt-1 font-serif text-2xl text-[#0B1F3A]">Gestão da rede</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">{PROFESSIONAL_TOOLS.map(([label, to]) => <Link key={to} to={to} className="rounded-xl border border-[#C7A33B]/30 bg-[#F8F3E8] px-3 py-3 text-sm font-semibold text-[#0B1F3A] hover:bg-white">{label} →</Link>)}</div>
        </article>
      </section>

      <section aria-labelledby="access-title" className="rounded-[1.5rem] border border-[#C7A33B]/35 bg-[#F8F3E8] p-5 shadow-sm sm:p-6">
        <p className="text-xs font-black uppercase tracking-[.16em] text-[#C7A33B]">Privacidade e permissões</p>
        <h2 id="access-title" className="mt-1 font-serif text-2xl text-[#0B1F3A]">Cada pessoa vê somente o necessário</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {ACCESS_MAP.map(([label, description, to]) => <Link key={`${label}-${to}`} to={to} className="rounded-2xl border border-[#C7A33B]/30 bg-white p-4"><h3 className="font-serif text-lg text-[#0B1F3A]">{label}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{description}</p></Link>)}
        </div>
      </section>

      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><p className="text-xs font-black uppercase tracking-[.16em] text-[#C7A33B]">Próximo atendimento</p><h2 className="mt-1 font-serif text-2xl text-[#0B1F3A]">{nextAppointment?.starts_at ? new Date(nextAppointment.starts_at).toLocaleString("pt-BR") : "Nenhum próximo atendimento encontrado"}</h2>{nextAppointment ? <p className="mt-2 text-sm text-slate-500">Status: {nextAppointment.status ?? "—"}</p> : null}</div>
          <Link to="/admin/minha-agenda" className="rounded-xl bg-[#0B1F3A] px-4 py-3 text-sm font-bold text-white">Ver agenda</Link>
        </div>
      </section>

      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
        <details>
          <summary className="cursor-pointer font-serif text-xl font-bold text-[#0B1F3A]">Outras ferramentas do ecossistema</summary>
          <p className="mt-2 text-sm text-slate-600">Recursos existentes foram preservados, mas ficam em segundo plano para manter o Painel Master focado na clínica.</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{SECONDARY_TOOLS.map(([label, to]) => <Link key={to} to={to} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-semibold text-[#0B1F3A] hover:bg-white">{label} →</Link>)}</div>
          <div className="mt-5 rounded-xl border border-[#C7A33B]/25 bg-[#F8F3E8] p-4"><p className="text-sm font-bold text-[#0B1F3A]">LDR Essence Academy</p><p className="mt-1 text-xs text-slate-600">{academySummary.isError ? "Indicadores temporariamente indisponíveis." : `${academySummary.data?.metrics.totalStudents ?? 0} alunos · ${academySummary.data?.metrics.totalEnrollments ?? 0} matrículas`}</p></div>
        </details>
      </section>
    </div>
  );
}

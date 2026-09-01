import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";

import { useAccess, useOrders } from "@/lib/central-data";
import { ownerDashboardSummary } from "@/lib/owner-dashboard.functions";

export const Route = createFileRoute("/_authenticated/admin/financeiro")({ component: FinanceiroAdmin });

function money(cents: number, currency: string) {
  try { return new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(cents / 100); }
  catch { return `${currency} ${(cents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`; }
}

function FinanceiroAdmin() {
  const access = useAccess();
  const orders = useOrders();
  const fetchOwnerDashboard = useServerFn(ownerDashboardSummary);
  const summaryQuery = useQuery({ queryKey: ["owner-dashboard-summary", "financeiro"], queryFn: () => fetchOwnerDashboard({}), staleTime: 60_000 });

  if (access.isLoading) return <div className="s8-card mx-auto max-w-md text-center">Carregando...</div>;
  if (!access.data?.authorized || access.data.role !== "superadmin") return <div className="s8-card mx-auto max-w-xl text-center"><h1 className="font-serif text-3xl">403</h1><p className="mt-2 text-sm text-muted-foreground">Área exclusiva do administrador master.</p></div>;

  const summary = summaryQuery.data;
  return <div className="space-y-6">
    <section className="rounded-2xl border border-[#C7A33B]/60 bg-[#F8F3E8] p-6 shadow-sm sm:p-8"><p className="text-xs font-bold uppercase tracking-[0.22em] text-[#C7A33B]">Painel Master LDR</p><h1 className="mt-2 font-serif text-3xl text-[#0B1F3A] sm:text-4xl">Financeiro</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">Central financeira consolidada com dados reais já existentes. Nenhum lançamento é duplicado e nenhuma integração de pagamento é alterada.</p><div className="mt-5 flex flex-wrap gap-3"><span className="rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#0B1F3A]">Pedidos visíveis: {orders.data?.length ?? 0}</span><span className="rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#0B1F3A]">Pagamentos confirmados: {summary?.metrics.paidPayments ?? "—"}</span><span className="rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#0B1F3A]">Repasses pendentes: {summary?.metrics.pendingPayouts ?? "—"}</span><span className="rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#0B1F3A]">Assinaturas ativas: {summary?.metrics.activeSubscriptions ?? "—"}</span></div></section>

    {summaryQuery.isError && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">Os dados financeiros consolidados estão temporariamente indisponíveis. As centrais operacionais abaixo continuam acessíveis.</div>}

    <section aria-labelledby="resumo-financeiro" className="rounded-2xl border border-[#C7A33B]/40 bg-white p-5 shadow-sm sm:p-6"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#C7A33B]">Consolidado real</p><h2 id="resumo-financeiro" className="mt-1 font-serif text-2xl text-[#0B1F3A]">Pagamentos, comissão e repasses</h2></div>{summary?.generatedAt && <p className="text-xs text-slate-500">Atualizado em {new Date(summary.generatedAt).toLocaleString("pt-BR")}</p>}</div><div className="mt-5 grid gap-4 lg:grid-cols-2">{summaryQuery.isLoading && <p className="text-sm text-slate-500">Carregando resumo financeiro...</p>}{!summaryQuery.isLoading && !summaryQuery.isError && (summary?.financialByCurrency.length ?? 0) === 0 && <p className="text-sm text-slate-500">Nenhum pagamento confirmado encontrado.</p>}{summary?.financialByCurrency.map((row) => <article key={row.currency} className="rounded-2xl border border-slate-200 bg-[#F8F3E8] p-4"><div className="flex items-center justify-between gap-3"><h3 className="font-serif text-2xl text-[#0B1F3A]">{row.currency}</h3><span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#0B1F3A]">{row.paymentsCount} pagamento(s)</span></div><dl className="mt-4 grid gap-3 sm:grid-cols-2"><div><dt className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">Volume bruto</dt><dd className="mt-1 text-lg font-bold text-[#0B1F3A]">{money(row.grossCents,row.currency)}</dd></div><div><dt className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">Comissão LDR</dt><dd className="mt-1 text-lg font-bold text-[#0B1F3A]">{money(row.commissionCents,row.currency)}</dd></div><div><dt className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">Repasses pendentes</dt><dd className="mt-1 text-lg font-bold text-[#0B1F3A]">{money(row.pendingPayoutCents,row.currency)}</dd></div><div><dt className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">Repasses pagos</dt><dd className="mt-1 text-lg font-bold text-[#0B1F3A]">{money(row.paidPayoutCents,row.currency)}</dd></div></dl></article>)}</div></section>

    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Link to="/painel-profissional/rede-profissionais-financeiro" className="rounded-2xl border border-[#C7A33B]/40 bg-white p-5 shadow-sm"><h2 className="font-serif text-xl text-[#0B1F3A]">Financeiro da Rede</h2><p className="mt-2 text-sm text-slate-600">Movimentações financeiras ligadas à Rede de Profissionais.</p><span className="mt-4 inline-block text-sm font-bold text-[#0B1F3A]">Abrir →</span></Link>
      <Link to="/painel-profissional/rede-profissionais-repasses" className="rounded-2xl border border-[#C7A33B]/40 bg-white p-5 shadow-sm"><h2 className="font-serif text-xl text-[#0B1F3A]">Repasses</h2><p className="mt-2 text-sm text-slate-600">Acompanhar repasses e valores destinados aos profissionais.</p><span className="mt-4 inline-block text-sm font-bold text-[#0B1F3A]">Abrir →</span></Link>
      <Link to="/admin/meus-pedidos" className="rounded-2xl border border-[#C7A33B]/40 bg-white p-5 shadow-sm"><h2 className="font-serif text-xl text-[#0B1F3A]">Pedidos</h2><p className="mt-2 text-sm text-slate-600">Consultar pedidos e contratações vinculadas à operação.</p><span className="mt-4 inline-block text-sm font-bold text-[#0B1F3A]">Abrir →</span></Link>
    </section>
    <Link to="/admin" className="inline-flex rounded-xl border border-[#C7A33B] bg-white px-4 py-3 text-sm font-bold text-[#0B1F3A]">← Painel Master</Link>
  </div>;
}

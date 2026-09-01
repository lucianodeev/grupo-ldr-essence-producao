import { Link, createFileRoute } from "@tanstack/react-router";
import { useAccess, useOrders } from "@/lib/central-data";

export const Route = createFileRoute("/_authenticated/admin/financeiro")({ component: FinanceiroAdmin });

function FinanceiroAdmin() {
  const access = useAccess();
  const orders = useOrders();
  if (access.isLoading) return <div className="s8-card mx-auto max-w-md text-center">Carregando...</div>;
  if (!access.data?.authorized || access.data.role !== "superadmin") return <div className="s8-card mx-auto max-w-xl text-center"><h1 className="font-serif text-3xl">403</h1><p className="mt-2 text-sm text-muted-foreground">Área exclusiva do administrador master.</p></div>;

  return <div className="space-y-6">
    <section className="rounded-2xl border border-[#C7A33B]/60 bg-[#F8F3E8] p-6 shadow-sm"><p className="text-xs font-bold uppercase tracking-[0.22em] text-[#C7A33B]">Painel Master LDR</p><h1 className="mt-2 font-serif text-3xl text-[#0B1F3A]">Financeiro</h1><p className="mt-3 text-sm text-slate-600">Central de acesso aos dados financeiros já existentes, sem duplicar lançamentos nem alterar integrações de pagamento.</p><p className="mt-5 inline-flex rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#0B1F3A]">Pedidos visíveis: {orders.data?.length ?? 0}</p></section>
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Link to="/painel-profissional/rede-profissionais-financeiro" className="rounded-2xl border border-[#C7A33B]/40 bg-white p-5 shadow-sm"><h2 className="font-serif text-xl text-[#0B1F3A]">Financeiro da Rede</h2><p className="mt-2 text-sm text-slate-600">Movimentações financeiras ligadas à Rede de Profissionais.</p><span className="mt-4 inline-block text-sm font-bold text-[#0B1F3A]">Abrir →</span></Link>
      <Link to="/painel-profissional/rede-profissionais-repasses" className="rounded-2xl border border-[#C7A33B]/40 bg-white p-5 shadow-sm"><h2 className="font-serif text-xl text-[#0B1F3A]">Repasses</h2><p className="mt-2 text-sm text-slate-600">Acompanhar repasses e valores destinados aos profissionais.</p><span className="mt-4 inline-block text-sm font-bold text-[#0B1F3A]">Abrir →</span></Link>
      <Link to="/admin/meus-pedidos" className="rounded-2xl border border-[#C7A33B]/40 bg-white p-5 shadow-sm"><h2 className="font-serif text-xl text-[#0B1F3A]">Pedidos</h2><p className="mt-2 text-sm text-slate-600">Consultar pedidos e contratações vinculadas à operação.</p><span className="mt-4 inline-block text-sm font-bold text-[#0B1F3A]">Abrir →</span></Link>
    </section>
    <Link to="/admin" className="inline-flex rounded-xl border border-[#C7A33B] bg-white px-4 py-3 text-sm font-bold text-[#0B1F3A]">← Painel Master</Link>
  </div>;
}

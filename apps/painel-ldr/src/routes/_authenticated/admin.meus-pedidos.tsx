import { Link, createFileRoute } from "@tanstack/react-router";
import { useAccess, useOrders } from "@/lib/central-data";

export const Route = createFileRoute("/_authenticated/admin/meus-pedidos")({ component: MeusPedidosAdmin });

function MeusPedidosAdmin() {
  const access = useAccess();
  const orders = useOrders();
  if (access.isLoading) return <div className="s8-card mx-auto max-w-md text-center">Carregando...</div>;
  if (!access.data?.authorized || access.data.role !== "superadmin") return <div className="s8-card mx-auto max-w-xl text-center"><h1 className="font-serif text-3xl">403</h1><p className="mt-2 text-sm text-muted-foreground">Área exclusiva do administrador master.</p></div>;

  const list = orders.data ?? [];
  const recent = list.slice(0, 12);
  return <div className="space-y-6">
    <section className="rounded-2xl border border-[#C7A33B]/60 bg-[#F8F3E8] p-6 shadow-sm"><p className="text-xs font-bold uppercase tracking-[0.22em] text-[#C7A33B]">Painel Master LDR</p><h1 className="mt-2 font-serif text-3xl text-[#0B1F3A]">Meus pedidos</h1><p className="mt-3 text-sm text-slate-600">Acompanhe contratações e pedidos disponíveis para sua operação, com os mesmos dados e permissões da central atual.</p><div className="mt-5"><span className="rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#0B1F3A]">Pedidos visíveis: {list.length}</span></div></section>
    <section className="rounded-2xl border border-[#C7A33B]/40 bg-white p-5 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-serif text-2xl text-[#0B1F3A]">Pedidos recentes</h2><Link to="/painel-profissional/pedidos" className="rounded-xl bg-[#0B1F3A] px-4 py-2.5 text-sm font-bold text-white">Abrir gestão completa</Link></div>{orders.isLoading ? <p className="mt-4 text-sm text-slate-500">Carregando pedidos...</p> : recent.length === 0 ? <p className="mt-4 text-sm text-slate-500">Nenhum pedido encontrado.</p> : <div className="mt-4 grid gap-3">{recent.map((item) => <article key={item.id} className="rounded-xl border border-slate-200 bg-[#F8F3E8] p-4"><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-bold text-[#0B1F3A]">Pedido {String(item.id).slice(0,8)}</p><span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#0B1F3A]">{item.status ?? "sem status"}</span></div><p className="mt-1 text-sm text-slate-600">Criado em {item.created_at ? new Date(item.created_at).toLocaleString("pt-BR") : "—"}</p></article>)}</div>}</section>
    <div className="flex flex-wrap gap-3"><Link to="/admin/meus-atendimentos" className="rounded-xl border border-[#C7A33B] bg-white px-4 py-3 text-sm font-bold text-[#0B1F3A]">Meus atendimentos</Link><Link to="/admin" className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-[#0B1F3A]">← Painel Master</Link></div>
  </div>;
}

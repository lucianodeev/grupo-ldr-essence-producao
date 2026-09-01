import { Link, createFileRoute } from "@tanstack/react-router";
import { useAccess, useCustomers, useOrders } from "@/lib/central-data";

export const Route = createFileRoute("/_authenticated/admin/meus-pedidos")({ component: MeusPedidosAdmin });

function money(amountCents: number | null, currency: string) {
  if (amountCents == null) return "Valor não informado";
  try { return new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(amountCents / 100); }
  catch { return `${currency} ${(amountCents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`; }
}

function MeusPedidosAdmin() {
  const access = useAccess();
  const orders = useOrders();
  const customers = useCustomers();
  if (access.isLoading) return <div className="s8-card mx-auto max-w-md text-center">Carregando...</div>;
  if (!access.data?.authorized || access.data.role !== "superadmin") return <div className="s8-card mx-auto max-w-xl text-center"><h1 className="font-serif text-3xl">403</h1><p className="mt-2 text-sm text-muted-foreground">Área exclusiva do administrador master.</p></div>;

  const list = orders.data ?? [];
  const recent = list.slice(0, 24);
  const customerById = new Map((customers.data ?? []).map((item) => [item.id, item]));
  const paid = list.filter((item) => item.payment_status === "paid").length;
  const pending = list.filter((item) => item.payment_status !== "paid").length;

  return <div className="space-y-6">
    <section className="rounded-2xl border border-[#C7A33B]/60 bg-[#F8F3E8] p-6 shadow-sm sm:p-8"><p className="text-xs font-bold uppercase tracking-[0.22em] text-[#C7A33B]">Painel Master LDR</p><h1 className="mt-2 font-serif text-3xl text-[#0B1F3A] sm:text-4xl">Meus pedidos</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">Acompanhe pedidos, valores e status de pagamento usando a mesma fonte operacional já existente.</p><div className="mt-5 flex flex-wrap gap-3"><span className="rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#0B1F3A]">Pedidos visíveis: {list.length}</span><span className="rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#0B1F3A]">Pagos: {paid}</span><span className="rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#0B1F3A]">Outros status: {pending}</span></div></section>

    {orders.isError && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">Não foi possível carregar os pedidos agora.</div>}

    <section className="rounded-2xl border border-[#C7A33B]/40 bg-white p-5 shadow-sm sm:p-6"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-serif text-2xl text-[#0B1F3A]">Pedidos recentes</h2><Link to="/painel-profissional/pedidos" className="rounded-xl bg-[#0B1F3A] px-4 py-2.5 text-sm font-bold text-white">Abrir gestão completa</Link></div>{orders.isLoading ? <p className="mt-4 text-sm text-slate-500">Carregando pedidos...</p> : recent.length === 0 ? <p className="mt-4 text-sm text-slate-500">Nenhum pedido encontrado.</p> : <div className="mt-4 grid gap-3">{recent.map((item) => {
      const customer = item.customer_id ? customerById.get(item.customer_id) : undefined;
      return <article key={item.id} className="rounded-2xl border border-slate-200 bg-[#F8F3E8] p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">{item.order_number || `Pedido ${String(item.id).slice(0,8)}`}</p><h3 className="mt-1 font-serif text-xl text-[#0B1F3A]">{item.title || item.catalog_key || "Pedido"}</h3><p className="mt-1 text-sm text-slate-600">Cliente: {customer?.full_name ?? item.contact_email ?? "não vinculado"}</p></div><span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#0B1F3A]">{item.status ?? "sem status"}</span></div><div className="mt-3 grid gap-2 text-sm sm:grid-cols-3"><p><span className="font-bold text-[#0B1F3A]">Pagamento:</span> {item.payment_status ?? "—"}</p><p><span className="font-bold text-[#0B1F3A]">Valor:</span> {money(item.amount_cents, item.currency)}</p><p><span className="font-bold text-[#0B1F3A]">Criado:</span> {item.created_at ? new Date(item.created_at).toLocaleString("pt-BR") : "—"}</p></div></article>;
    })}</div>}</section>

    <div className="flex flex-wrap gap-3"><Link to="/admin/meus-atendimentos" className="rounded-xl border border-[#C7A33B] bg-white px-4 py-3 text-sm font-bold text-[#0B1F3A]">Meus atendimentos</Link><Link to="/admin/financeiro" className="rounded-xl border border-[#C7A33B] bg-white px-4 py-3 text-sm font-bold text-[#0B1F3A]">Financeiro</Link><Link to="/admin" className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-[#0B1F3A]">← Painel Master</Link></div>
  </div>;
}

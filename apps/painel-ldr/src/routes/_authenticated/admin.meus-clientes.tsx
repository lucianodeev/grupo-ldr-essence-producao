import { Link, createFileRoute } from "@tanstack/react-router";
import { useAccess, useAppointments, useCustomers, useOrders } from "@/lib/central-data";

export const Route = createFileRoute("/_authenticated/admin/meus-clientes")({ component: MeusClientesAdmin });

function MeusClientesAdmin() {
  const access = useAccess();
  const customers = useCustomers();
  const appointments = useAppointments();
  const orders = useOrders();
  if (access.isLoading) return <div className="s8-card mx-auto max-w-md text-center">Carregando...</div>;
  if (!access.data?.authorized || access.data.role !== "superadmin") return <div className="s8-card mx-auto max-w-xl text-center"><h1 className="font-serif text-3xl">403</h1><p className="mt-2 text-sm text-muted-foreground">Área exclusiva do administrador master.</p></div>;

  const list = customers.data ?? [];
  const now = Date.now();
  const appointmentCount = new Map<string, number>();
  const nextByCustomer = new Map<string, string>();
  for (const item of appointments.data ?? []) {
    if (!item.customer_id) continue;
    appointmentCount.set(item.customer_id, (appointmentCount.get(item.customer_id) ?? 0) + 1);
    if (item.starts_at && new Date(item.starts_at).getTime() >= now && !nextByCustomer.has(item.customer_id)) nextByCustomer.set(item.customer_id, item.starts_at);
  }
  const orderCount = new Map<string, number>();
  for (const item of orders.data ?? []) if (item.customer_id) orderCount.set(item.customer_id, (orderCount.get(item.customer_id) ?? 0) + 1);

  return <div className="space-y-6">
    <section className="rounded-2xl border border-[#C7A33B]/60 bg-[#F8F3E8] p-6 shadow-sm sm:p-8"><p className="text-xs font-bold uppercase tracking-[0.22em] text-[#C7A33B]">Painel Master LDR</p><h1 className="mt-2 font-serif text-3xl text-[#0B1F3A] sm:text-4xl">Meus clientes</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">Visão operacional dos clientes disponíveis para sua atuação, sem expor notas clínicas ou informações sensíveis nesta central administrativa.</p><div className="mt-5"><span className="rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#0B1F3A]">Total visível: {list.length}</span></div></section>

    {customers.isError && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">Não foi possível carregar os clientes agora.</div>}

    <section className="rounded-2xl border border-[#C7A33B]/40 bg-white p-5 shadow-sm sm:p-6"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-serif text-2xl text-[#0B1F3A]">Clientes</h2><Link to="/painel-profissional/clientes" className="rounded-xl bg-[#0B1F3A] px-4 py-2.5 text-sm font-bold text-white">Abrir gestão completa</Link></div>{customers.isLoading ? <p className="mt-4 text-sm text-slate-500">Carregando clientes...</p> : list.length === 0 ? <p className="mt-4 text-sm text-slate-500">Nenhum cliente encontrado.</p> : <div className="mt-4 grid gap-3 sm:grid-cols-2">{list.slice(0,24).map((item) => {
      const next = nextByCustomer.get(item.id);
      return <article key={item.id} className="rounded-2xl border border-slate-200 bg-[#F8F3E8] p-4"><p className="font-bold text-[#0B1F3A]">{item.full_name || "Cliente"}</p><p className="mt-1 break-all text-sm text-slate-600">{item.email || "Sem e-mail cadastrado"}</p><div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600"><p><span className="font-bold text-[#0B1F3A]">Atendimentos:</span> {appointmentCount.get(item.id) ?? 0}</p><p><span className="font-bold text-[#0B1F3A]">Pedidos:</span> {orderCount.get(item.id) ?? 0}</p></div><p className="mt-3 text-xs text-slate-600"><span className="font-bold text-[#0B1F3A]">Próximo:</span> {next ? new Date(next).toLocaleString("pt-BR") : "nenhum agendado"}</p></article>;
    })}</div>}</section>

    <div className="flex flex-wrap gap-3"><Link to="/admin/meus-atendimentos" className="rounded-xl border border-[#C7A33B] bg-white px-4 py-3 text-sm font-bold text-[#0B1F3A]">Meus atendimentos</Link><Link to="/admin" className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-[#0B1F3A]">← Painel Master</Link></div>
  </div>;
}

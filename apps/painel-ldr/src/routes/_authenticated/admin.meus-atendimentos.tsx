import { Link, createFileRoute } from "@tanstack/react-router";
import { useAccess, useAppointments, useCatalog, useCustomers, useOrders } from "@/lib/central-data";

export const Route = createFileRoute("/_authenticated/admin/meus-atendimentos")({ component: MeusAtendimentosAdmin });

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString("pt-BR") : "Horário não definido";
}

function MeusAtendimentosAdmin() {
  const access = useAccess();
  const appointments = useAppointments();
  const customers = useCustomers();
  const orders = useOrders();
  const catalog = useCatalog();

  if (access.isLoading) return <div className="s8-card mx-auto max-w-md text-center">Carregando...</div>;
  if (!access.data?.authorized || access.data.role !== "superadmin") {
    return <div className="s8-card mx-auto max-w-xl text-center"><h1 className="font-serif text-3xl">403</h1><p className="mt-2 text-sm text-muted-foreground">Área exclusiva do administrador master.</p></div>;
  }

  const now = new Date();
  const todayKey = now.toLocaleDateString("pt-BR");
  const list = appointments.data ?? [];
  const upcoming = list.filter((item) => item.starts_at && new Date(item.starts_at).getTime() >= now.getTime());
  const today = list.filter((item) => item.starts_at && new Date(item.starts_at).toLocaleDateString("pt-BR") === todayKey);
  const nextAppointment = upcoming[0];

  const customerById = new Map((customers.data ?? []).map((item) => [item.id, item]));
  const orderById = new Map((orders.data ?? []).map((item) => [item.id, item]));
  const catalogByKey = new Map((catalog.data ?? []).map((item) => [item.catalog_key, item]));

  const appointmentDetails = (appointment: (typeof list)[number]) => {
    const customer = appointment.customer_id ? customerById.get(appointment.customer_id) : undefined;
    const order = appointment.order_id ? orderById.get(appointment.order_id) : undefined;
    const service = appointment.catalog_key ? catalogByKey.get(appointment.catalog_key) : undefined;
    return { customer, order, service };
  };

  const nextDetails = nextAppointment ? appointmentDetails(nextAppointment) : null;

  return <div className="space-y-6">
    <section className="rounded-2xl border border-[#C7A33B]/60 bg-[#F8F3E8] p-6 shadow-sm sm:p-8">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#C7A33B]">Painel Master LDR</p>
      <h1 className="mt-2 font-serif text-3xl text-[#0B1F3A] sm:text-4xl">Meus atendimentos</h1>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">Sua central pessoal de operação. Agenda, cliente, serviço, pedido e pagamento são apresentados usando os dados já existentes, sem duplicar cadastros.</p>

      <div className="mt-5 rounded-2xl border border-[#C7A33B]/40 bg-white p-5 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#C7A33B]">Próximo atendimento</p>
        <h2 className="mt-1 font-serif text-2xl text-[#0B1F3A]">{nextAppointment ? formatDate(nextAppointment.starts_at) : "Nenhum próximo atendimento encontrado"}</h2>
        {nextAppointment && <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div><p className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">Cliente</p><p className="mt-1 font-semibold text-[#0B1F3A]">{nextDetails?.customer?.full_name ?? "Cliente não vinculado"}</p></div>
          <div><p className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">Serviço</p><p className="mt-1 font-semibold text-[#0B1F3A]">{nextDetails?.service?.name ?? nextAppointment.title ?? "—"}</p></div>
          <div><p className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">Pagamento</p><p className="mt-1 font-semibold text-[#0B1F3A]">{nextDetails?.order?.payment_status ?? "Sem pedido vinculado"}</p></div>
          <div><p className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">Status</p><p className="mt-1 font-semibold text-[#0B1F3A]">{nextAppointment.status ?? "—"}</p></div>
        </div>}
        {nextAppointment && <div className="mt-5 flex flex-wrap gap-3">
          {nextAppointment.meeting_url ? <a href={nextAppointment.meeting_url} target="_blank" rel="noreferrer" className="rounded-xl bg-[#0B1F3A] px-5 py-3 text-sm font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C7A33B] focus-visible:ring-offset-2">INICIAR MEU PRÓXIMO ATENDIMENTO</a> : <Link to="/painel-profissional/psicanalise" className="rounded-xl bg-[#0B1F3A] px-5 py-3 text-sm font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C7A33B] focus-visible:ring-offset-2">INICIAR MEU PRÓXIMO ATENDIMENTO</Link>}
          <Link to="/admin/minha-agenda" className="rounded-xl border border-[#C7A33B] bg-white px-5 py-3 text-sm font-bold text-[#0B1F3A]">Ver agenda completa</Link>
        </div>}
      </div>
    </section>

    <section aria-labelledby="hoje-title" className="rounded-2xl border border-[#C7A33B]/40 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#C7A33B]">Operação diária</p><h2 id="hoje-title" className="mt-1 font-serif text-2xl text-[#0B1F3A]">Agenda de hoje</h2></div><span className="rounded-full bg-[#F8F3E8] px-3 py-1 text-xs font-bold text-[#0B1F3A]">{today.length} atendimento(s)</span></div>
      <div className="mt-4 space-y-3">
        {today.length === 0 && <p className="text-sm text-slate-500">Nenhum atendimento agendado para hoje.</p>}
        {today.map((appointment) => {
          const details = appointmentDetails(appointment);
          return <article key={appointment.id} className="rounded-2xl border border-slate-200 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">{formatDate(appointment.starts_at)}</p><h3 className="mt-1 font-serif text-xl text-[#0B1F3A]">{details.customer?.full_name ?? appointment.title ?? "Atendimento"}</h3><p className="mt-1 text-sm text-slate-600">{details.service?.name ?? appointment.title} · {appointment.duration_minutes} min</p></div><span className="rounded-full bg-[#F8F3E8] px-3 py-1 text-xs font-bold text-[#0B1F3A]">{appointment.status}</span></div>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-600"><span>Pagamento: <strong>{details.order?.payment_status ?? "sem pedido vinculado"}</strong></span>{details.order?.order_number && <span>Pedido: <strong>{details.order.order_number}</strong></span>}{appointment.meeting_url && <a href={appointment.meeting_url} target="_blank" rel="noreferrer" className="font-bold text-[#0B1F3A] underline underline-offset-2">Abrir Meet</a>}</div>
          </article>;
        })}
      </div>
    </section>

    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Link to="/painel-profissional/psicanalise" className="rounded-2xl border border-[#C7A33B]/40 bg-white p-5 shadow-sm"><h2 className="font-serif text-xl text-[#0B1F3A]">Atendimento operacional</h2><p className="mt-2 text-sm text-slate-600">Registrar e acompanhar sessões na área operacional já existente.</p><span className="mt-4 inline-block text-sm font-bold text-[#0B1F3A]">Abrir →</span></Link>
      <Link to="/admin/minha-agenda" className="rounded-2xl border border-[#C7A33B]/40 bg-white p-5 shadow-sm"><h2 className="font-serif text-xl text-[#0B1F3A]">Minha agenda</h2><p className="mt-2 text-sm text-slate-600">Consultar compromissos, horários e próximos atendimentos.</p><span className="mt-4 inline-block text-sm font-bold text-[#0B1F3A]">Abrir →</span></Link>
      <Link to="/admin/meus-clientes" className="rounded-2xl border border-[#C7A33B]/40 bg-white p-5 shadow-sm"><h2 className="font-serif text-xl text-[#0B1F3A]">Meus clientes</h2><p className="mt-2 text-sm text-slate-600">Acessar clientes vinculados à sua operação.</p><span className="mt-4 inline-block text-sm font-bold text-[#0B1F3A]">Abrir →</span></Link>
      <Link to="/admin/meus-pedidos" className="rounded-2xl border border-[#C7A33B]/40 bg-white p-5 shadow-sm"><h2 className="font-serif text-xl text-[#0B1F3A]">Meus pedidos</h2><p className="mt-2 text-sm text-slate-600">Consultar contratação, pedido e situação de pagamento.</p><span className="mt-4 inline-block text-sm font-bold text-[#0B1F3A]">Abrir →</span></Link>
    </section>

    <div className="flex flex-wrap gap-3"><Link to="/admin" className="inline-flex rounded-xl border border-[#C7A33B] bg-white px-4 py-3 text-sm font-bold text-[#0B1F3A]">← Voltar ao Painel Master</Link></div>
  </div>;
}

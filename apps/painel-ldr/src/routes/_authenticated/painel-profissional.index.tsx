import { Link, createFileRoute } from "@tanstack/react-router";

import { EmptyState, PageHeader, StatCard, StatusBadge } from "@/components/central/ui";
import {
  ACTIVE_ORDER_STATUSES,
  ORDER_STATUSES,
  SERVICE_TYPES,
  formatDateTime,
  labelOf,
  toneOf,
} from "@/lib/central";
import {
  useCustomers,
  useDeliveries,
  useMentorships,
  useOrders,
  useRecentActivity,
} from "@/lib/central-data";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/painel-profissional/")({
  component: Overview,
});

const COPY = {
  pt: {
    title: "Visão geral", subtitle: "Panorama operacional do Grupo LDR Essence.", orders: "Pedidos", new: "Novos", inProgress: "Em andamento", waitingClient: "Aguardando cliente", completed: "Concluídos", cancelled: "Cancelados", clients: "Clientes", activeMentorships: "Mentorias ativas", total: "no total", pendingDeliveries: "Entregas pendentes", openOrders: "Pedidos abertos", byService: "Pedidos por tipo de serviço", noOrders: "Nenhum pedido registrado até o momento.", recent: "Atividade recente", recentEmpty: "As alterações de pedidos e entregas aparecerão aqui.", system: "sistema", before: "antes", emptyTitle: "Ainda não há pedidos na central", emptyDescription: "Cadastre o primeiro pedido para começar a acompanhar prazos, responsáveis e entregas.", goOrders: "Ir para Pedidos", latest: "Últimos pedidos",
  },
  en: {
    title: "Overview", subtitle: "Operational overview of Grupo LDR Essence.", orders: "Orders", new: "New", inProgress: "In progress", waitingClient: "Waiting for client", completed: "Completed", cancelled: "Cancelled", clients: "Clients", activeMentorships: "Active mentorships", total: "total", pendingDeliveries: "Pending deliveries", openOrders: "Open orders", byService: "Orders by service type", noOrders: "No orders have been registered yet.", recent: "Recent activity", recentEmpty: "Changes to orders and deliveries will appear here.", system: "system", before: "before", emptyTitle: "There are no orders in the operations hub yet", emptyDescription: "Create the first order to start tracking deadlines, owners and deliveries.", goOrders: "Go to Orders", latest: "Latest orders",
  },
  fr: {
    title: "Vue d’ensemble", subtitle: "Vue opérationnelle du Grupo LDR Essence.", orders: "Commandes", new: "Nouvelles", inProgress: "En cours", waitingClient: "En attente du client", completed: "Terminées", cancelled: "Annulées", clients: "Clients", activeMentorships: "Mentorats actifs", total: "au total", pendingDeliveries: "Livraisons en attente", openOrders: "Commandes ouvertes", byService: "Commandes par type de service", noOrders: "Aucune commande enregistrée pour le moment.", recent: "Activité récente", recentEmpty: "Les modifications des commandes et livraisons apparaîtront ici.", system: "système", before: "avant", emptyTitle: "Aucune commande dans la centrale pour le moment", emptyDescription: "Créez la première commande pour commencer à suivre les délais, responsables et livraisons.", goOrders: "Voir les commandes", latest: "Dernières commandes",
  },
  es: {
    title: "Visión general", subtitle: "Panorama operativo del Grupo LDR Essence.", orders: "Pedidos", new: "Nuevos", inProgress: "En curso", waitingClient: "Esperando al cliente", completed: "Completados", cancelled: "Cancelados", clients: "Clientes", activeMentorships: "Mentorías activas", total: "en total", pendingDeliveries: "Entregas pendientes", openOrders: "Pedidos abiertos", byService: "Pedidos por tipo de servicio", noOrders: "Aún no hay pedidos registrados.", recent: "Actividad reciente", recentEmpty: "Los cambios de pedidos y entregas aparecerán aquí.", system: "sistema", before: "antes", emptyTitle: "Todavía no hay pedidos en la central", emptyDescription: "Registra el primer pedido para empezar a seguir plazos, responsables y entregas.", goOrders: "Ir a Pedidos", latest: "Últimos pedidos",
  },
} as const;

const SERVICE_LABELS: Record<string, Record<"pt"|"en"|"fr"|"es", string>> = {
  psicanalise: { pt: "Psicanálise", en: "Psychoanalysis", fr: "Psychanalyse", es: "Psicoanálisis" },
  mentoria: { pt: "Mentoria", en: "Mentorship", fr: "Mentorat", es: "Mentoría" },
  sites: { pt: "Sites", en: "Websites", fr: "Sites web", es: "Sitios web" },
  marketing: { pt: "Marketing", en: "Marketing", fr: "Marketing", es: "Marketing" },
  outros: { pt: "Outros", en: "Other", fr: "Autres", es: "Otros" },
};

function Overview() {
  const { locale } = useI18n();
  const copy = COPY[locale];
  const orders = useOrders();
  const customers = useCustomers();
  const mentorships = useMentorships();
  const deliveries = useDeliveries();
  const activity = useRecentActivity();

  const list = orders.data ?? [];
  const count = (fn: (o: (typeof list)[number]) => boolean) => list.filter(fn).length;

  const byService = SERVICE_TYPES.map((s) => ({
    ...s,
    displayLabel: SERVICE_LABELS[s.value]?.[locale] ?? s.label,
    total: count((o) => o.service_type === s.value),
  })).filter((s) => s.total > 0);

  const activeMentorships = (mentorships.data ?? []).filter((m) =>
    ["agendada", "em_andamento", "aguardando_agendamento"].includes(m.status),
  ).length;
  const pendingDeliveries = (deliveries.data ?? []).filter(
    (d) => d.status !== "entregue" && d.status !== "cancelada",
  ).length;

  return (
    <div className="min-w-0">
      <PageHeader title={copy.title} subtitle={copy.subtitle} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard label={copy.orders} value={list.length} tone="info" />
        <StatCard label={copy.new} value={count((o) => o.status === "novo")} tone="info" />
        <StatCard label={copy.inProgress} value={count((o) => o.status === "em_andamento")} tone="gold" />
        <StatCard label={copy.waitingClient} value={count((o) => o.status === "aguardando_cliente")} tone="neutral" />
        <StatCard label={copy.completed} value={count((o) => o.status === "concluido")} tone="success" />
        <StatCard label={copy.cancelled} value={count((o) => o.status === "cancelado")} tone="danger" />
        <StatCard label={copy.clients} value={(customers.data ?? []).length} tone="gold" />
        <StatCard label={copy.activeMentorships} value={activeMentorships} hint={`${(mentorships.data ?? []).length} ${copy.total}`} tone="info" />
        <StatCard label={copy.pendingDeliveries} value={pendingDeliveries} tone="gold" />
        <StatCard label={copy.openOrders} value={count((o) => ACTIVE_ORDER_STATUSES.includes(o.status))} tone="info" />
      </div>

      <div className="mt-4 grid min-w-0 gap-4 lg:grid-cols-2">
        <section className="s8-card min-w-0">
          <h2 className="break-words font-serif text-xl">{copy.byService}</h2>
          {byService.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">{copy.noOrders}</p> : (
            <ul className="mt-3 space-y-2">{byService.map((s) => <li key={s.value}><div className="flex min-w-0 items-center justify-between gap-3 text-sm"><span className="min-w-0 break-words">{s.displayLabel}</span><span className="shrink-0 font-bold text-primary">{s.total}</span></div><div className="mt-1 h-2 rounded-full" style={{ background: "var(--muted)" }}><div className="h-2 rounded-full" style={{ width: `${Math.round((s.total / list.length) * 100)}%`, background: "linear-gradient(90deg, var(--wine), var(--gold))" }} /></div></li>)}</ul>
          )}
        </section>

        <section className="s8-card min-w-0">
          <h2 className="break-words font-serif text-xl">{copy.recent}</h2>
          {(activity.data ?? []).length === 0 ? <p className="mt-3 text-sm text-muted-foreground">{copy.recentEmpty}</p> : (
            <ul className="mt-3 space-y-2 text-sm">{(activity.data ?? []).map((h) => <li key={h.id} className="border-b border-border/60 pb-2 last:border-0"><div className="flex min-w-0 flex-wrap items-center gap-2"><span className="break-words font-bold">{h.field}</span>{h.new_value ? <StatusBadge tone="info">{h.new_value}</StatusBadge> : null}<span className="text-xs text-muted-foreground">{formatDateTime(h.created_at)}</span></div><p className="break-all text-xs text-muted-foreground">{h.actor_email ?? copy.system}{h.old_value ? ` • ${copy.before}: ${h.old_value}` : ""}</p></li>)}</ul>
          )}
        </section>
      </div>

      {list.length === 0 ? <div className="mt-4"><EmptyState title={copy.emptyTitle} description={copy.emptyDescription} action={<Link to="/painel-profissional/pedidos" className="rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-bold text-primary-foreground">{copy.goOrders}</Link>} /></div> : (
        <section className="mt-4 s8-card min-w-0"><h2 className="break-words font-serif text-xl">{copy.latest}</h2><ul className="mt-3 space-y-2 text-sm">{list.slice(0, 6).map((o) => <li key={o.id} className="flex min-w-0 flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-2 last:border-0"><span className="min-w-0 break-words"><span className="font-bold text-primary">{o.order_number}</span> — {o.title}</span><StatusBadge tone={toneOf(ORDER_STATUSES, o.status)}>{labelOf(ORDER_STATUSES, o.status)}</StatusBadge></li>)}</ul></section>
      )}
    </div>
  );
}

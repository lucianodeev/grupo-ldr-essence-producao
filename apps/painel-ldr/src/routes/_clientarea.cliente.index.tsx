import { Link, createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { BookOpen, CalendarDays, ClipboardList, GraduationCap, MessageCircle, PlayCircle } from "lucide-react";

import { EmptyState, PageHeader, StatCard } from "@/components/central/ui";
import { useClientOverview } from "@/lib/client-portal-data";
import { clientLearningHub } from "@/lib/learning.functions";

export const Route = createFileRoute("/_clientarea/cliente/")({ component: ClientHome });

const OPEN_ORDER = new Set(["novo", "em_analise", "em_andamento", "aguardando_cliente", "em_revisao"]);

const QUICK = [
  { to: "/cliente/biblioteca", title: "Minha Biblioteca", text: "Livros, e-books e conteúdos", icon: BookOpen, featured: true },
  { to: "/cliente/treinamentos", title: "Treinamentos", text: "Módulos, materiais e fórum", icon: GraduationCap },
  { to: "/cliente/agenda", title: "Próximos encontros", text: "Agenda e sessões", icon: CalendarDays },
  { to: "/cliente/pedidos", title: "Meus pedidos", text: "Acompanhe compras e serviços", icon: ClipboardList },
  { to: "/cliente/treinamentos", title: "Fórum e comentários", text: "Converse com a equipe", icon: MessageCircle },
] as const;

function ClientHome() {
  const { data, isLoading } = useClientOverview();
  const learningFn = useServerFn(clientLearningHub);
  const { data: learning } = useQuery({ queryKey: ["client-learning-hub"], queryFn: () => learningFn({}) });

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando…</p>;
  if (!data) return <p className="text-sm text-muted-foreground">Não foi possível carregar seus dados.</p>;

  const openOrders = data.orders.filter((o) => OPEN_ORDER.has(o.status));
  const waitingClient = data.orders.filter((o) => o.status === "aguardando_cliente");
  const pendingApproval = data.deliveries.filter((d) => d.needs_client_approval && (d.status === "entregue" || d.status === "em_revisao"));
  const progress = learning?.progress?.slice().sort((a:any,b:any)=>new Date(b.updated_at).getTime()-new Date(a.updated_at).getTime())[0];
  const nextLive = learning?.sessions?.find((s:any)=>new Date(s.starts_at)>=new Date());

  return <div className="space-y-6">
    <PageHeader title={`Olá, ${data.customer.fullName.split(" ")[0]}`} subtitle="Sua área foi organizada para você encontrar rapidamente o que precisa e continuar de onde parou." />

    {progress ? <section className="rounded-2xl border border-primary/20 bg-primary/5 p-5"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-primary">Continue de onde parou</p><h2 className="mt-1 font-serif text-2xl">{progress.product_key === "ebook_coragem_comecar" ? "A Coragem de Começar" : progress.product_key}</h2><p className="mt-1 text-sm text-muted-foreground">{progress.current_location || "Sua última leitura"} · {progress.progress_percent}% concluído</p><div className="mt-3 h-2 max-w-md overflow-hidden rounded-full bg-border"><div className="h-full bg-primary" style={{ width: `${progress.progress_percent}%` }} /></div></div><Link to="/cliente/biblioteca" className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground"><PlayCircle className="h-4 w-4"/> Continuar</Link></div></section> : null}

    <section><h2 className="mb-3 font-serif text-xl">Acessos rápidos</h2><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{QUICK.map(item=>{const Icon=item.icon;return <Link key={item.title} to={item.to} className={`rounded-2xl border p-5 transition hover:-translate-y-0.5 hover:shadow-md ${"featured" in item && item.featured ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`}><Icon className="h-6 w-6"/><h3 className="mt-3 font-bold">{item.title}</h3><p className={`mt-1 text-sm ${"featured" in item && item.featured ? "opacity-85" : "text-muted-foreground"}`}>{item.text}</p></Link>})}</div></section>

    <div className="grid gap-3 sm:grid-cols-3"><StatCard label="Pedidos em andamento" value={openOrders.length} tone="info"/><StatCard label="Aguardando você" value={waitingClient.length} tone="gold"/><StatCard label="Entregas para aprovar" value={pendingApproval.length} tone="gold"/></div>

    <section className="grid gap-4 lg:grid-cols-2"><div className="s8-card"><h2 className="font-serif text-xl">Próximo encontro</h2>{nextLive ? <div className="mt-3"><p className="font-semibold">{nextLive.title}</p><p className="text-sm text-muted-foreground">{new Date(nextLive.starts_at).toLocaleString("pt-BR")}</p>{nextLive.meeting_url?<a href={nextLive.meeting_url} target="_blank" rel="noreferrer" className="mt-3 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">Entrar no encontro</a>:null}</div> : <p className="mt-2 text-sm text-muted-foreground">Nenhum encontro ao vivo agendado no momento.</p>}</div><div className="s8-card"><h2 className="font-serif text-xl">Precisa de ajuda?</h2><p className="mt-2 text-sm text-muted-foreground">Use o WhatsApp flutuante para falar com a equipe ou acesse Fórum e comentários dentro dos seus treinamentos.</p></div></section>

    <section><h2 className="mb-2 font-serif text-xl">Pedidos recentes</h2>{data.orders.length ? <div className="grid gap-2">{data.orders.slice(0,4).map(o=><Link key={o.id} to="/cliente/pedido/$orderId" params={{orderId:o.id}} className="s8-card !p-4 block hover:bg-accent"><p className="font-semibold text-primary">{o.title}</p><p className="text-xs text-muted-foreground">{o.order_number}</p></Link>)}</div> : <EmptyState title="Nenhum pedido ainda" description="Quando houver um pedido, ele aparecerá aqui."/>}</section>
  </div>;
}

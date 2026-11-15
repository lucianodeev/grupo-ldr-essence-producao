import { useState, type FormEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { listMasterQuotes, prepareMasterQuote, approveMasterQuote } from "@/lib/enterprise-quotes.functions";
import { formatMoney } from "@/lib/central";

export function EnterpriseQuoteEditor({ contactId }: { contactId: string }) {
  const list = useServerFn(listMasterQuotes), prepare = useServerFn(prepareMasterQuote), approve = useServerFn(approveMasterQuote);
  const cache = useQueryClient();
  const [notice, setNotice] = useState("");
  const [requestId, setRequestId] = useState(() => crypto.randomUUID());
  const query = useQuery({ queryKey: ["master-quotes", contactId], queryFn: () => list({ data: { id: contactId } }), refetchInterval: 15000 });
  const mutation = useMutation({ mutationFn: prepare, onSuccess: () => { setRequestId(crypto.randomUUID()); setNotice("Rascunho preparado. Confira o valor e o âmbito antes de aprovar."); void cache.invalidateQueries({ queryKey: ["master-quotes", contactId] }); } });
  const approval = useMutation({ mutationFn: approve, onSuccess: result => { setNotice(result.notified ? "Proposta aprovada e disponibilizada na Minha Área e no suporte do cliente." : "Proposta disponível na Minha Área. O aviso no suporte não foi confirmado."); void cache.invalidateQueries({ queryKey: ["master-quotes", contactId] }); } });
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (mutation.isPending) return;
    const form = new FormData(event.currentTarget);
    const raw = String(form.get("amount") ?? "").replace(",", ".");
    if (!/^\d+(\.\d{1,2})?$/.test(raw)) { setNotice("Informe o valor total com até duas casas decimais."); return; }
    const [whole, fraction = ""] = raw.split(".");
    mutation.mutate({ data: { contactId, requestId, title: String(form.get("title")), scope: String(form.get("scope")),
      amountCents: Number(whole) * 100 + Number(fraction.padEnd(2, "0")), currency: form.get("currency") as "EUR" | "BRL",
      catalogKey: String(form.get("catalogKey")) || null, validDays: Number(form.get("validDays")) } });
  }
  const field = "mt-1 min-h-11 w-full rounded-lg border p-3";
  return <section aria-label="Propostas e pagamentos" className="mt-6 rounded-2xl border border-blue-200 p-4 sm:p-6">
    <h3 className="font-serif text-2xl font-bold">Propostas e pagamentos</h3>
    <p className="mt-2 text-sm text-slate-600">O pedido é gratuito. Prepare o orçamento e aprove para disponibilizá-lo ao cliente. A aceitação abre o Stripe; só o pagamento confirmado libera execução ou créditos.</p>
    {query.isError ? <p role="alert">Não foi possível consultar as propostas.</p> : query.isLoading ? <p>Carregando propostas…</p> : <>
      <ul className="mt-4 space-y-3">{query.data?.orders.map((order: any) => <li key={order.id} className="rounded-xl bg-slate-50 p-4">
        <p className="font-bold">{order.order_number} · {order.title}</p>
        <p className="mt-1 text-sm">Empresa: {order.metadata.organization || "Ver solicitação"} · Origem: {order.metadata.source_project || "Central Empresas LDR"}</p>
        <p className="mt-1">{formatMoney(order.amount_cents, order.currency)} · {({draft:"Rascunho",approved:"Aprovada",accepted:"Aceita"} as Record<string,string>)[order.metadata.quote_state] ?? order.metadata.quote_state} · {order.payment_status} · {order.status}</p>
        <p className="mt-2 whitespace-pre-wrap text-sm">{order.description}</p>
        <p className="mt-2 text-xs">Responsável: {order.assignee_id} · Validade: {new Date(order.metadata.quote_valid_until * 1000).toLocaleString("pt-PT")}</p>
        <p className="mt-1 text-xs">Preparada: {order.metadata.prepared_at} · Aprovada: {order.metadata.approved_at ?? "—"} · Aceita: {order.metadata.accepted_at ?? "—"}</p>
        <p className="mt-1 break-all text-xs">Stripe: {order.stripe_checkout_session_id ?? "Ainda não iniciado"}</p>
        <p className="mt-1 text-xs">Agenda: {query.data?.appointments.filter((a: any) => a.order_id === order.id).map((a: any) => `${a.status} · ${a.starts_at}`).join("; ") || "Sem agendamento"}</p>
        {order.metadata.quote_state === "draft" && order.status !== "cancelado" && <button type="button" disabled={approval.isPending || !query.data?.ready} onClick={() => { if (window.confirm(`Aprovar ${order.order_number} por ${formatMoney(order.amount_cents, order.currency)} e disponibilizar ao cliente?`)) approval.mutate({ data: { id: order.id } }); }} className="mt-3 min-h-11 rounded-lg bg-blue-900 px-4 py-2 font-bold text-white disabled:opacity-50">Aprovar proposta</button>}
      </li>)}</ul>
      {!query.data?.ready && <p role="status" className="mt-4 text-amber-900">Preparação indisponível até validar e aplicar a proteção financeira no banco de destino.</p>}
      <form onSubmit={submit} className="mt-6 grid gap-4">
        <h4 className="font-bold">Preparar novo orçamento</h4>
        <label>Título<input name="title" minLength={5} maxLength={160} required className={field} /></label>
        <label>Âmbito, entregas e condições<textarea name="scope" minLength={10} maxLength={3000} rows={4} required className={field} /></label>
        <div className="grid gap-4 sm:grid-cols-3"><label>Valor total<input name="amount" inputMode="decimal" required className={field} /></label><label>Moeda<select name="currency" className={field}><option>EUR</option><option>BRL</option></select></label><label>Validade em dias<input name="validDays" type="number" min={1} max={90} defaultValue={7} required className={field} /></label></div>
        <label>Execução ou sessões<select name="catalogKey" className={field}><option value="">Projeto / entrega, sem agendamento</option>{query.data?.services.map((item: any) => <option value={item.catalog_key} key={item.catalog_key}>{item.name} · {item.billing_model === "single_paid_session" ? 1 : item.package_sessions} sessão(ões) · {item.catalog_key}</option>)}</select></label>
        <p className="text-xs text-slate-600">O orçamento define apenas este pedido. Não modifica preços do catálogo nem assinaturas.</p>
        <button disabled={mutation.isPending || !query.data?.ready} className="min-h-12 rounded-lg bg-[#07345b] px-4 py-3 font-bold text-white disabled:opacity-50">Preparar rascunho</button>
      </form>
    </>}
    {(mutation.isError || approval.isError) && <p role="alert" className="mt-3 text-red-800">Não foi possível concluir a operação. Atualize e verifique se o rascunho já foi registrado antes de tentar novamente.</p>}
    {notice && <p role="status" className="mt-3 text-sm">{notice}</p>}
    <Link to="/painel-profissional/pedidos" className="mt-4 inline-flex min-h-11 items-center font-bold underline">Gerir estados e responsáveis nos pedidos Master</Link>
  </section>;
}

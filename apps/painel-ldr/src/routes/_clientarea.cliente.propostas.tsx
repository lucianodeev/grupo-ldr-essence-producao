import { Link, createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { listMyQuotes, acceptMyQuote } from "@/lib/enterprise-quotes.functions";
import { formatMoney } from "@/lib/central";

export const Route = createFileRoute("/_clientarea/cliente/propostas")({
  head: () => ({ meta: [{ title: "Minhas propostas — Ecossistema LDR" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: Proposals,
});
function Proposals() {
  const list = useServerFn(listMyQuotes), accept = useServerFn(acceptMyQuote);
  const [accepted, setAccepted] = useState<Record<string, boolean>>({});
  const query = useQuery({ queryKey: ["my-enterprise-quotes"], queryFn: () => list(), refetchInterval: 15000 });
  const payment = useMutation({ mutationFn: accept, onSuccess: result => { window.location.assign(result.url); } });
  return <div className="mx-auto max-w-4xl">
    <h1 className="font-serif text-3xl">Minhas propostas</h1>
    <p className="mt-3 text-sm leading-6 text-muted-foreground">Propostas aprovadas para o mesmo e-mail da sua conta. Confira o âmbito, valor, moeda e validade. Solicitar um orçamento é gratuito.</p>
    {query.isLoading ? <p role="status" className="mt-6">Carregando…</p> : query.isError ? <p role="alert" className="mt-6">Não foi possível carregar as propostas. <button className="underline" onClick={() => void query.refetch()}>Tentar novamente</button></p> : <ul className="mt-6 space-y-5">{query.data?.map((quote: any) => {
      const expired = quote.expiresAt * 1000 <= Date.now();
      const payable = !expired && quote.status !== "cancelado" && quote.paymentStatus === "pendente";
      return <li key={quote.id} className="s8-card min-w-0 space-y-4">
        <div><p className="text-xs font-bold text-muted-foreground">{quote.number}</p><h2 className="mt-2 font-serif text-2xl">{quote.title}</h2></div>
        <p className="text-xl font-bold">{formatMoney(quote.amountCents, quote.currency)}</p>
        <p className="whitespace-pre-wrap text-sm leading-7">{quote.scope}</p>
        <p className="text-sm">Validade: {new Date(quote.expiresAt * 1000).toLocaleString("pt-PT")} · Pagamento: {quote.paymentStatus} · Pedido: {quote.status}</p>
        <p className="text-sm">{quote.sessions > 0 ? `${quote.sessions} sessão(ões). Após confirmação do pagamento, solicite o horário na Minha agenda. A equipe confirma a disponibilidade.` : "Projeto ou entrega. Após confirmação do pagamento, acompanhe a execução e os materiais em Meus pedidos. Não é necessário agendar."}</p>
        {payable && <><label className="flex items-start gap-3 text-sm leading-6"><input type="checkbox" className="mt-1 h-5 w-5 shrink-0" checked={accepted[quote.id] ?? false} onChange={event => setAccepted({ ...accepted, [quote.id]: event.target.checked })} />Li e aceito o âmbito, o valor total, a moeda e as condições desta proposta.</label>
          <button disabled={!accepted[quote.id] || payment.isPending} onClick={() => payment.mutate({ data: { id: quote.id, accepted: true } })} className="min-h-12 w-full rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground disabled:opacity-50">Aceitar e continuar para pagamento</button></>}
        {expired && quote.paymentStatus === "pendente" && <p className="text-sm">Proposta expirada. Solicite uma atualização à equipe pelo suporte.</p>}
        {quote.state === "accepted" && <Link to="/cliente/pedido/$orderId" params={{ orderId: quote.id }} className="inline-flex min-h-11 items-center font-bold underline">Acompanhar pedido</Link>}
      </li>;
    })}</ul>}
    {query.data?.length === 0 && <p className="mt-6">Ainda não há propostas aprovadas para este e-mail.</p>}
    {payment.isError && <p role="alert" className="mt-4 text-red-800">Pagamento indisponível ou validade encerrada. Atualize a página e tente novamente na mesma proposta, ou fale com a equipe.</p>}
    <Link to="/falar-com-ecossistema" className="mt-6 inline-flex min-h-11 items-center font-bold underline">Falar com a equipe</Link>
  </div>;
}

import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import type { Json } from "@/integrations/supabase/types";
import { journey, useAccountIdentity } from "./data";
import { decimalToHundredths, money, statuses, type Partner } from "./model";

const panel = "rounded-2xl border border-[#ded5c4] bg-white p-5 text-[#18263b]";
const input =
  "mt-1 block w-full rounded-lg border border-slate-400 bg-white px-3 py-2 text-slate-900";
const action =
  "inline-flex min-h-11 items-center rounded-lg bg-[#10223b] px-4 py-2 font-semibold text-white disabled:opacity-50";
const categories = {
  digital: "Presença digital",
  rh: "Recursos humanos",
  mentoria: "Mentoria profissional",
};
const states: Record<string, string> = {
  ...statuses,
  received: "Recebido",
  review: "Em análise",
  proposal: "Proposta disponível",
  contracted: "Contratação confirmada",
  done: "Concluído",
  canceled: "Cancelado",
};

type Brief = {
  id: string;
  category: keyof typeof categories;
  brief: string;
  deadline: string;
  budget_cents: number | null;
  created_at: string;
};
type ClientBrief = Brief & {
  status: string;
  order_id: string | null;
  paid: boolean;
  cancelable: boolean;
};
type DirectQuote = { id: string; title: string; brief: string; status: string };
type MasterBrief = ClientBrief & {
  customer_email: string;
  partner_id: string | null;
  contact_id: string | null;
  referral_name: string | null;
  commission_bps: number;
  commission_cents: number | null;
  payment_status: string | null;
  proposals: { id: string; number: string; title: string }[];
};

function useJourneyPanel<T>(mode: string, actor: string) {
  const cache = useQueryClient();
  const key = ["feira360-journeys", mode, actor];
  const query = useQuery({
    queryKey: key,
    queryFn: () => journey<T>(mode),
    gcTime: 0,
    retry: false,
  });
  const mutation = useMutation({
    mutationFn: ({ operation, data }: { operation: string; data: Json }) =>
      journey(operation, data),
    onSuccess: () => cache.invalidateQueries({ queryKey: key }),
  });
  return { query, mutation };
}

export function GeneralBriefForm({ source }: { source: string }) {
  const actor = useAccountIdentity();
  const next = `/feira360${source ? `?ref=${encodeURIComponent(source)}` : ""}#pedido`;
  return (
    <section
      id="pedido"
      aria-labelledby="feira-brief-title"
      className={`${panel} mt-6 scroll-mt-24`}
    >
      <h2 id="feira-brief-title" className="font-serif text-2xl font-bold">
        Descreva o que precisa
      </h2>
      <p className="my-3 text-sm">
        Conte o que procura e o LDR poderá encaminhar o seu pedido a um parceiro aprovado.
      </p>
      {actor === undefined ? (
        <p role="status">A verificar sessão…</p>
      ) : actor ? (
        <BriefFields key={actor} source={source} />
      ) : (
        <Link to="/cliente/login" search={{ next }} className={action}>
          Entrar para enviar um pedido
        </Link>
      )}
    </section>
  );
}

function BriefFields({ source }: { source: string }) {
  const [requestKey, setRequestKey] = useState("");
  const [validation, setValidation] = useState("");
  const submit = useMutation({
    mutationFn: (data: Json) => journey<string>("submit", data),
  });
  function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const budget = String(data.get("budget") ?? "").trim();
    const budgetCents = budget ? decimalToHundredths(budget) : null;
    if (budget && (budgetCents === null || budgetCents > 100000000)) {
      setValidation("Indique um orçamento válido em euros.");
      return;
    }
    setValidation("");
    const key = requestKey || crypto.randomUUID();
    setRequestKey(key);
    submit.mutate({
      requestKey: key,
      category: String(data.get("category")),
      brief: String(data.get("brief")),
      deadline: String(data.get("deadline")),
      budgetCents,
      consent: data.has("consent"),
      source,
    });
  }
  if (submit.data)
    return (
      <div role="status">
        <p>
          Pedido recebido. Protocolo <strong className="break-all">{submit.data}</strong>
        </p>
        <Link to="/cliente/pedidos" className="font-semibold underline">
          Acompanhar na Minha Área
        </Link>
      </div>
    );
  return (
    <form onSubmit={send} className="grid max-w-2xl gap-4">
      <label>
        Categoria{" "}
        <select name="category" required className={input}>
          <option value="">Selecione</option>
          {Object.entries(categories).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label>
        O que precisa?{" "}
        <textarea
          name="brief"
          className={input}
          rows={4}
          minLength={20}
          maxLength={2000}
          required
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          Prazo aproximado{" "}
          <input
            name="deadline"
            className={input}
            required
            maxLength={100}
            placeholder="Por exemplo, em 30 dias"
          />
        </label>
        <label>
          Orçamento indicativo em euros{" "}
          <input name="budget" className={input} inputMode="decimal" placeholder="Opcional" />
        </label>
      </div>
      <label className="flex gap-2 text-sm">
        <input name="consent" type="checkbox" required />
        Autorizo o LDR a encaminhar a descrição, o prazo e o orçamento ao parceiro selecionado.
      </label>
      <div>
        <button className={action} disabled={submit.isPending}>
          {submit.isPending ? "A enviar…" : "Enviar pedido"}
        </button>
      </div>
      {(validation || submit.error) && <p role="alert">{validation || submit.error?.message}</p>}
    </form>
  );
}

function BriefDetails({ brief }: { brief: Brief }) {
  return (
    <>
      <h3 className="font-bold">{categories[brief.category]}</h3>
      <p className="break-all text-xs">Protocolo {brief.id}</p>
      <p className="my-2 whitespace-pre-wrap break-words">{brief.brief}</p>
      <p className="text-sm">
        Prazo {brief.deadline} · Orçamento{" "}
        {brief.budget_cents === null ? "a definir" : money(brief.budget_cents)}
      </p>
    </>
  );
}

export function ClientBriefs() {
  const actor = useAccountIdentity();
  return actor ? <ClientRequests key={actor} actor={actor} /> : null;
}

function ClientRequests({ actor }: { actor: string }) {
  const { query, mutation } = useJourneyPanel<{ briefs: ClientBrief[]; quotes: DirectQuote[] }>(
    "mine",
    actor,
  );
  return (
    <section aria-labelledby="client-feiras" className="mb-6 space-y-3">
      <h2 id="client-feiras" className="font-serif text-2xl">
        Pedidos da FEIRA 360
      </h2>
      {query.isPending && <p role="status">A carregar…</p>}
      {query.isError && <p role="alert">{query.error.message}</p>}
      {query.data && !query.data.briefs.length && !query.data.quotes.length && (
        <Link to="/feira360" hash="pedido" className="underline">
          Fazer um pedido na FEIRA 360
        </Link>
      )}
      {query.data?.briefs.map((brief) => (
        <article key={brief.id} className={panel}>
          <BriefDetails brief={brief} />
          <p className="my-2 font-semibold">{states[brief.status]}</p>
          {brief.status === "proposal" && (
            <Link to="/cliente/propostas" hash={`proposta-${brief.order_id}`} className="underline">
              Consultar proposta e pagar
            </Link>
          )}
          {brief.order_id && brief.paid && (
            <div className="flex flex-wrap gap-4">
              <Link
                to="/cliente/pedido/$orderId"
                params={{ orderId: brief.order_id }}
                className="underline"
              >
                Ver contratação
              </Link>
              <Link to="/cliente/entregas" className="underline">
                Ver entregas
              </Link>
            </div>
          )}
          {brief.cancelable && (
            <button
              className={action}
              disabled={mutation.isPending}
              onClick={() => mutation.mutate({ operation: "cancel", data: { id: brief.id } })}
            >
              Cancelar pedido
            </button>
          )}
        </article>
      ))}
      {query.data?.quotes.map((quote) => (
        <article key={quote.id} className={panel}>
          <h3 className="font-bold">{quote.title}</h3>
          <p className="break-all text-xs">Protocolo {quote.id}</p>
          <p className="my-2 whitespace-pre-wrap break-words">{quote.brief}</p>
          <p className="mb-2">{states[quote.status]}</p>
          {quote.status === "new" && (
            <button
              className={action}
              disabled={mutation.isPending}
              onClick={() =>
                mutation.mutate({ operation: "cancel_direct", data: { id: quote.id } })
              }
            >
              Cancelar pedido
            </button>
          )}
        </article>
      ))}
      {mutation.error && <p role="alert">{mutation.error.message}</p>}
    </section>
  );
}

export function PartnerBriefs({ actor, slug }: { actor: string; slug: string }) {
  const { query } = useJourneyPanel<null | {
    ref: string;
    attributed: number;
    converted: number;
    briefs: Brief[];
  }>("partner", actor);
  const [copyMessage, setCopyMessage] = useState("");
  if (query.isPending) return <p role="status">A carregar o link e os pedidos…</p>;
  if (query.isError) return <p role="alert">{query.error.message}</p>;
  if (!query.data) return null;
  const { ref, attributed, converted, briefs } = query.data;
  const shareUrl = `https://ldrecossistema.online/feira360/p/${slug}?ref=${ref}`;
  return (
    <section className={`${panel} my-4 space-y-3`}>
      <h2 className="font-serif text-2xl font-bold">O seu link de divulgação</h2>
      <label>
        Link do perfil{" "}
        <input
          className={input}
          readOnly
          value={shareUrl}
          onFocus={(event) => event.target.select()}
        />
      </label>
      <button
        className={action}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(shareUrl);
            setCopyMessage("Link copiado.");
          } catch {
            setCopyMessage("Selecione e copie o link no campo acima.");
          }
        }}
      >
        Copiar link
      </button>
      <p role="status">{copyMessage}</p>
      <p className="text-sm">
        Pedidos atribuídos · <strong>{attributed}</strong> | Contratações ·{" "}
        <strong>{converted}</strong>
      </p>
      <h2 className="font-serif text-2xl font-bold">Pedidos gerais encaminhados</h2>
      {!briefs.length && <p>Ainda não há pedidos gerais encaminhados.</p>}
      {briefs.map((brief) => (
        <article key={brief.id} className={panel}>
          <BriefDetails brief={brief} />
        </article>
      ))}
    </section>
  );
}

export function MasterBriefs({ actor, partners }: { actor: string; partners: Partner[] }) {
  const { query, mutation } = useJourneyPanel<MasterBrief[]>("master", actor);
  const approved = partners.filter((partner) => partner.status === "approved");
  return (
    <section className="my-5 space-y-3">
      <h2 className="font-serif text-2xl font-bold">Pedidos gerais da FEIRA 360</h2>
      {query.isPending && <p role="status">A carregar…</p>}
      {query.isError && <p role="alert">{query.error.message}</p>}
      {query.data?.length === 0 && <p>Ainda não há pedidos gerais.</p>}
      {query.data?.map((brief) => (
        <article key={brief.id} className={`${panel} space-y-3`}>
          <BriefDetails brief={brief} />
          <p className="break-words text-sm">
            {brief.customer_email} · {states[brief.status]} · Origem{" "}
            {brief.referral_name ?? "direta"}
          </p>
          <p className="text-sm">
            Comissão {brief.commission_bps / 100}%
            {brief.commission_cents === null ? "" : ` · Registada ${money(brief.commission_cents)}`}
          </p>
          {brief.status === "received" && (
            <button
              className={action}
              disabled={mutation.isPending}
              onClick={() => mutation.mutate({ operation: "review", data: { id: brief.id } })}
            >
              Marcar em análise
            </button>
          )}
          {["received", "review"].includes(brief.status) && (
            <form
              className="flex flex-wrap items-end gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                mutation.mutate({
                  operation: "forward",
                  data: {
                    id: brief.id,
                    partnerId: String(new FormData(event.currentTarget).get("partner")),
                  },
                });
              }}
            >
              <label>
                Parceiro aprovado{" "}
                <select className={input} name="partner" required>
                  <option value="">Selecione</option>
                  {approved.map((partner) => (
                    <option key={partner.id} value={partner.id}>
                      {partner.name}
                    </option>
                  ))}
                </select>
              </label>
              <button className={action} disabled={mutation.isPending || !approved.length}>
                Encaminhar
              </button>
            </form>
          )}
          {brief.status === "forwarded" && !brief.contact_id && (
            <button
              className={action}
              disabled={mutation.isPending}
              onClick={() =>
                mutation.mutate({ operation: "prepare_proposal", data: { id: brief.id } })
              }
            >
              Preparar proposta
            </button>
          )}
          {brief.contact_id && !brief.order_id && (
            <>
              <p className="text-sm">
                Abra o contacto da Feira, crie e aprove uma proposta em euros. Depois, atualize a
                lista e vincule a proposta ao pedido.
              </p>
              <Link
                to="/admin/contatos"
                search={{ contact: brief.contact_id }}
                className="font-semibold underline"
              >
                Abrir contacto da proposta
              </Link>
              <button className="ml-3 underline" onClick={() => void query.refetch()}>
                Atualizar propostas
              </button>
              {brief.proposals.map((proposal) => (
                <div key={proposal.id}>
                  <button
                    className={action}
                    disabled={mutation.isPending}
                    onClick={() =>
                      mutation.mutate({
                        operation: "link_proposal",
                        data: { id: brief.id, orderId: proposal.id },
                      })
                    }
                  >
                    Vincular {proposal.number} · {proposal.title}
                  </button>
                </div>
              ))}
            </>
          )}
          {brief.order_id && (
            <p className="text-sm">
              Proposta vinculada · {brief.order_id} · Pagamento {brief.payment_status}
            </p>
          )}
        </article>
      ))}
      {mutation.error && <p role="alert">{mutation.error.message}</p>}
    </section>
  );
}

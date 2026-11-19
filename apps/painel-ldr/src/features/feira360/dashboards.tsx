import type { FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import type { Json } from "@/integrations/supabase/types";
import { account, useAccountIdentity } from "./data";
import { MasterBriefs, PartnerBriefs } from "./journeys";
import {
  categories,
  decimalToHundredths,
  modalities,
  money,
  statuses,
  type MasterDashboard,
  type MasterQuote,
  type PartnerDashboard,
  type Quote,
} from "./model";
import { button, card, FeiraPage, field, Options, secondary } from "./public";

function useDashboard<T>(action: string, actor: string) {
  const queryClient = useQueryClient();
  const key = ["feira360-private", action, actor];
  const query = useQuery({
    queryKey: key,
    queryFn: () => account<T>(action),
    gcTime: 0,
    retry: false,
  });
  const mutation = useMutation({
    mutationFn: ({ action, data }: { action: string; data: Json }) => account(action, data),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: key }),
        queryClient.invalidateQueries({ queryKey: ["feira360-catalog"] }),
      ]);
    },
  });
  return { query, mutation };
}

type Actions = ReturnType<typeof useDashboard<unknown>>["mutation"];

function Feedback({ mutation }: { mutation: Actions }) {
  if (mutation.isError)
    return (
      <p role="alert" className="my-3 text-red-800">
        {mutation.error.message}
      </p>
    );
  if (mutation.isSuccess)
    return (
      <p role="status" className="my-3 text-emerald-800">
        Operação registada.
      </p>
    );
  return null;
}

export function PartnerArea() {
  const actor = useAccountIdentity();
  return (
    <FeiraPage>
      <section className="mx-auto max-w-5xl px-5 py-8">
        <h1 className="mb-5 font-serif text-4xl font-bold">Painel do Parceiro</h1>
        {actor === undefined ? (
          <p role="status">A verificar sessão…</p>
        ) : actor ? (
          <PartnerContent key={actor} actor={actor} />
        ) : (
          <>
            <p className="mb-4">
              Entre com a sua conta para candidatar o seu negócio ou acompanhar os pedidos
              encaminhados.
            </p>
            <Link to="/cliente/login" search={{ next: "/feira360/parceiro" }} className={button}>
              Entrar com Google
            </Link>
          </>
        )}
      </section>
    </FeiraPage>
  );
}

function PartnerContent({ actor }: { actor: string }) {
  const { query, mutation } = useDashboard<PartnerDashboard>("partner_dashboard", actor);
  if (query.isPending) return <p role="status">A carregar painel…</p>;
  if (query.isError) return <p role="alert">{query.error.message}</p>;
  const { partner, quotes, services } = query.data;
  return (
    <>
      {partner ? (
        <>
          <article className={card}>
            <h2 className="font-serif text-2xl font-bold">{partner.name}</h2>
            <p className="my-2">
              {statuses[partner.status]} · Plano {partner.plan === "premium" ? "Premium" : "Básico"}
            </p>
            {partner.status === "approved" && (
              <Link
                to="/feira360/p/$partner"
                params={{ partner: partner.slug }}
                className="underline"
              >
                Ver perfil público
              </Link>
            )}
          </article>
          {partner.status === "approved" && <PartnerBriefs actor={actor} slug={partner.slug} />}
          <h2 className="my-4 font-serif text-2xl font-bold">Os seus serviços</h2>
          <ul className="mb-4 grid gap-1">
            {services.map((service) => (
              <li key={service.slug}>
                {service.title} ·{" "}
                {partner.status === "pending"
                  ? "Em análise com o perfil"
                  : statuses[service.status]}
              </li>
            ))}
          </ul>
          {partner.status === "approved" && services.length < 25 && (
            <details className="mb-6">
              <summary className="mb-3 cursor-pointer font-semibold">Adicionar um serviço</summary>
              <PartnerApplication mutation={mutation} addService />
            </details>
          )}
          <h2 className="my-4 font-serif text-2xl font-bold">Oportunidades encaminhadas</h2>
          {quotes.length ? (
            <div className="grid gap-3">
              {quotes.map((quote) => (
                <article key={quote.id} className={card}>
                  <QuoteDetails quote={quote} />
                  {quote.status === "forwarded" && (
                    <button
                      className={button}
                      disabled={mutation.isPending}
                      onClick={() =>
                        mutation.mutate({ action: "acknowledge", data: { id: quote.id } })
                      }
                    >
                      Marcar em atendimento
                    </button>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <p>Nenhuma oportunidade encaminhada.</p>
          )}
        </>
      ) : (
        <PartnerApplication mutation={mutation} />
      )}
      <Feedback mutation={mutation} />
    </>
  );
}

const slugPattern = "[a-z0-9]+(-[a-z0-9]+)*";
const amountPattern = "[0-9]{1,7}([.,][0-9]{1,2})?";

function PartnerApplication({
  mutation,
  addService = false,
}: {
  mutation: Actions;
  addService?: boolean;
}) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const entries = Object.fromEntries(Array.from(values, ([key, value]) => [key, String(value)]));
    const price = decimalToHundredths(entries["price"] ?? "");
    delete entries["price"];
    mutation.mutate(
      { action: addService ? "add_service" : "apply", data: { ...entries, priceCents: price } },
      { onSuccess: () => form.reset() },
    );
  }
  return (
    <form onSubmit={submit} className={`${card} grid gap-4`}>
      {!addService && (
        <>
          <h2 className="font-serif text-2xl font-bold">Candidatura de profissional</h2>
          <p className="text-sm">
            O perfil e o primeiro serviço passam pela revisão da Área Master antes de aparecerem na
            vitrine.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label>
              Nome público
              <input name="name" className={field} required minLength={2} maxLength={100} />
            </label>
            <label>
              Endereço do perfil <span className="text-sm">(ex. estudio-design)</span>
              <input name="slug" className={field} required maxLength={64} pattern={slugPattern} />
            </label>
          </div>
          <label>
            Localidade
            <input name="locality" className={field} required minLength={2} maxLength={100} />
          </label>
          <label>
            Apresentação profissional
            <textarea
              name="bio"
              className={field}
              required
              minLength={15}
              maxLength={1600}
              rows={3}
            />
          </label>
        </>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <label>
          Nome do serviço
          <input name="title" className={field} required minLength={3} maxLength={100} />
        </label>
        <label>
          Endereço do serviço <span className="text-sm">(ex. design-de-marca)</span>
          <input
            name="serviceSlug"
            className={field}
            required
            maxLength={64}
            pattern={slugPattern}
          />
        </label>
        <label>
          Categoria
          <select className={field} name="category" required>
            <Options values={categories} placeholder="Selecione" />
          </select>
        </label>
        <label>
          Modalidade
          <select className={field} name="modality" required>
            <Options values={modalities} placeholder="Selecione" />
          </select>
        </label>
      </div>
      <label>
        Descrição do serviço
        <textarea
          name="description"
          className={field}
          required
          minLength={15}
          maxLength={2000}
          rows={3}
        />
      </label>
      <label>
        Preço inicial em euros (opcional)
        <input name="price" className={field} inputMode="decimal" pattern={amountPattern} />
      </label>
      <button className={`${button} justify-self-start`} disabled={mutation.isPending}>
        Enviar para análise
      </button>
    </form>
  );
}

function QuoteDetails({ quote }: { quote: Quote }) {
  return (
    <>
      <h3 className="font-bold">
        {quote.title} · {statuses[quote.status]}
      </h3>
      <p className="my-2 whitespace-pre-wrap break-words">{quote.brief}</p>
      <p className="mb-2 break-all text-sm">{quote.customer_email}</p>
      <p className="mb-3 break-all text-xs">
        Protocolo {quote.id} · {new Date(quote.created_at).toLocaleDateString("pt-PT")}
      </p>
      {quote.commission_cents !== null && (
        <p className="mb-2 text-sm font-semibold">
          Comissão registada {money(quote.commission_cents)}
        </p>
      )}
    </>
  );
}

export function MasterArea() {
  const actor = useAccountIdentity();
  return (
    <section className="mx-auto max-w-6xl px-5 py-8">
      <Link to="/admin" className="text-sm font-bold underline">
        Voltar à Área Master
      </Link>
      <h1 className="my-4 font-serif text-4xl font-bold">Gestão FEIRA 360</h1>
      {actor === undefined ? (
        <p role="status">A verificar sessão…</p>
      ) : actor ? (
        <MasterContent key={actor} actor={actor} />
      ) : (
        <p role="alert">Inicie sessão como Master.</p>
      )}
    </section>
  );
}

function MasterContent({ actor }: { actor: string }) {
  const { query, mutation } = useDashboard<MasterDashboard>("master_dashboard", actor);
  if (query.isPending) return <p role="status">A carregar gestão…</p>;
  if (query.isError) return <p role="alert">{query.error.message}</p>;
  const { partners, quotes, rate, audit } = query.data;

  function commission(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = String(new FormData(event.currentTarget).get("rate"));
    mutation.mutate({ action: "commission_rate", data: { bps: decimalToHundredths(value) } });
  }

  return (
    <>
      <form key={rate} onSubmit={commission} className={`${card} flex flex-wrap items-end gap-3`}>
        <label>
          Comissão para novos pedidos (%)
          <input
            className={field}
            name="rate"
            type="number"
            min="0"
            max="100"
            step=".01"
            defaultValue={rate / 100}
            required
          />
        </label>
        <button className={button} disabled={mutation.isPending}>
          Guardar taxa
        </button>
      </form>
      <div aria-live="polite">
        <Feedback mutation={mutation} />
      </div>
      <h2 className="my-4 font-serif text-2xl font-bold">Parceiros</h2>
      {!partners.length && <p>Nenhuma candidatura recebida.</p>}
      <div className="grid gap-4 lg:grid-cols-2">
        {partners.map((partner) => (
          <article key={partner.id} className={card}>
            <h3 className="font-bold">
              {partner.name} · {statuses[partner.status]}
            </h3>
            <p className="my-2 text-sm">
              {partner.locality} · /{partner.slug}
            </p>
            <p className="whitespace-pre-wrap break-words">{partner.bio}</p>
            {partner.services?.map((service) => (
              <div key={service.slug} className="my-3 border-t pt-3 text-sm">
                <strong>
                  {service.title} · {categories[service.category]} · {modalities[service.modality]}
                </strong>
                <p className="break-words">{service.description}</p>
                <p>{service.price_cents ? money(service.price_cents) : "Sob orçamento"}</p>
                {partner.status === "approved" && (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span>{statuses[service.status]}</span>
                    {(service.status === "approved"
                      ? ["suspended"]
                      : service.status === "pending"
                        ? ["approved", "rejected"]
                        : ["approved"]
                    ).map((status) => (
                      <button
                        key={status}
                        className={secondary}
                        disabled={mutation.isPending}
                        onClick={() =>
                          mutation.mutate({
                            action: "moderate_service",
                            data: { id: service.id, status },
                          })
                        }
                      >
                        {status === "approved"
                          ? "Aprovar serviço"
                          : status === "rejected"
                            ? "Recusar serviço"
                            : "Suspender serviço"}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="flex flex-wrap gap-2">
              {(partner.status === "approved"
                ? [["suspended", "Suspender"]]
                : partner.status === "pending"
                  ? [
                      ["approved", "Aprovar"],
                      ["rejected", "Recusar"],
                    ]
                  : [["approved", "Aprovar"]]
              ).map(([status, label]) => (
                <button
                  className={secondary}
                  key={status}
                  disabled={mutation.isPending}
                  onClick={() =>
                    mutation.mutate({
                      action: "moderate",
                      data: { id: partner.id, status: status ?? "" },
                    })
                  }
                >
                  {label}
                </button>
              ))}
            </div>
            {partner.status === "approved" && (
              <form
                key={`${partner.plan}:${partner.featured_until}`}
                className="mt-4 grid gap-2 border-t pt-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  const values = new FormData(event.currentTarget);
                  mutation.mutate({
                    action: "monetization",
                    data: {
                      id: partner.id,
                      plan: String(values.get("plan")),
                      featured: values.has("featured"),
                    },
                  });
                }}
              >
                <label>
                  Plano
                  <select className={field} defaultValue={partner.plan} name="plan">
                    <option value="basic">Básico</option>
                    <option value="premium">Premium</option>
                  </select>
                </label>
                <label>
                  <input type="checkbox" name="featured" /> Ativar destaque Premium durante 30 dias
                </label>
                {partner.featured_until && (
                  <p className="text-sm">
                    Destaque registado até{" "}
                    {new Date(partner.featured_until).toLocaleDateString("pt-PT")}.
                  </p>
                )}
                <button className={`${secondary} justify-self-start`} disabled={mutation.isPending}>
                  Guardar plano e destaque
                </button>
              </form>
            )}
          </article>
        ))}
      </div>
      <MasterBriefs actor={actor} partners={partners} />
      <h2 className="my-4 font-serif text-2xl font-bold">Pedidos de orçamento</h2>
      {!quotes.length && <p>Nenhum pedido recebido.</p>}
      <div className="grid gap-4 lg:grid-cols-2">
        {quotes.map((quote) => (
          <article key={quote.id} className={card}>
            <MasterOpportunity quote={quote} mutation={mutation} />
          </article>
        ))}
      </div>
      <h2 className="my-4 font-serif text-2xl font-bold">Atividade recente</h2>
      <ul className="grid gap-2">
        {audit.map((entry) => (
          <li key={entry.id} className="break-all text-sm">
            {new Date(entry.created_at).toLocaleString("pt-PT")} ·{" "}
            {auditLabels[entry.action] ?? entry.action}
            {entry.target_id ? ` · ${entry.target_id}` : ""}
          </li>
        ))}
      </ul>
    </>
  );
}

const auditLabels: Record<string, string> = {
  apply: "Candidatura recebida",
  add_service: "Novo serviço recebido",
  moderate_service: "Serviço moderado",
  quote: "Pedido recebido",
  acknowledge: "Atendimento iniciado",
  moderate: "Parceiro moderado",
  monetization: "Plano atualizado",
  commission_rate: "Taxa atualizada",
  quote_status: "Oportunidade atualizada",
};

function MasterOpportunity({ quote, mutation }: { quote: MasterQuote; mutation: Actions }) {
  const active = quote.status === "forwarded" || quote.status === "in_progress";
  return (
    <>
      <p className="mb-2 text-sm">
        {quote.partner_name} · Origem {quote.source ?? "direta"} · Comissão{" "}
        {quote.commission_bps / 100}%
      </p>
      <QuoteDetails quote={quote} />
      {quote.contract_cents !== null && <p>Valor contratado {money(quote.contract_cents)}</p>}
      <div className="flex flex-wrap gap-2">
        {quote.status === "new" && (
          <button
            className={button}
            disabled={mutation.isPending || quote.partner_status !== "approved"}
            onClick={() =>
              mutation.mutate({
                action: "quote_status",
                data: { id: quote.id, status: "forwarded" },
              })
            }
          >
            Encaminhar ao parceiro
          </button>
        )}
        {(active || quote.status === "new") && (
          <button
            className={secondary}
            disabled={mutation.isPending}
            onClick={() =>
              mutation.mutate({ action: "quote_status", data: { id: quote.id, status: "closed" } })
            }
          >
            Encerrar pedido
          </button>
        )}
      </div>
      {active && (
        <form
          className="mt-3 flex flex-wrap items-end gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            const value = String(new FormData(event.currentTarget).get("amount"));
            mutation.mutate({
              action: "quote_status",
              data: { id: quote.id, status: "won", contractCents: decimalToHundredths(value) },
            });
          }}
        >
          <label>
            Valor contratado em euros
            <input
              className={field}
              name="amount"
              inputMode="decimal"
              pattern={amountPattern}
              required
            />
          </label>
          <button className={button} disabled={mutation.isPending}>
            Registar contratação
          </button>
        </form>
      )}
    </>
  );
}

import { useState, type FormEvent, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Search, MapPin } from "lucide-react";
import { account, catalogQuery } from "./data";
import { categories, modalities, money, type Listing } from "./model";
import { supabase } from "@/integrations/supabase/client";

export const button =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#d9ab59] px-5 py-2 text-sm font-bold text-[#192131] hover:bg-[#f0c776] disabled:opacity-50";
export const secondary =
  "inline-flex min-h-11 items-center justify-center rounded-full border border-current px-5 py-2 text-sm font-semibold disabled:opacity-50";
export const field =
  "block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-[#18263b]";
export const card = "rounded-2xl border border-[#ded5c4] bg-white p-5 shadow-sm";

export function FeiraPage({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[#f8f4ed] text-[#18263b]">
      <nav aria-label="FEIRA 360" className="border-b border-white/15 bg-[#10223b] text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4">
          <Link to="/feira360" className="font-serif text-xl font-bold tracking-wide">
            FEIRA <span className="text-[#edc474]">360</span>
          </Link>
          <div className="flex flex-wrap gap-4 text-sm font-semibold">
            <Link to="/">Ecossistema LDR</Link>
            <Link to="/feira360/parceiro">Painel do Parceiro</Link>
          </div>
        </div>
      </nav>
      {children}
    </main>
  );
}

export function Options({
  values,
  placeholder,
}: {
  values: Record<string, string>;
  placeholder: string;
}) {
  return (
    <>
      <option value="">{placeholder}</option>
      {Object.entries(values).map(([key, label]) => (
        <option key={key} value={key}>
          {label}
        </option>
      ))}
    </>
  );
}

function ServiceCard({ service }: { service: Listing }) {
  return (
    <article className={card}>
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
        <span className="rounded-full bg-[#eee6d7] px-3 py-1">{categories[service.category]}</span>
        {service.featured && <span className="rounded-full bg-[#f4daa1] px-3 py-1">Destaque</span>}
      </div>
      <h3 className="mt-3 font-serif text-xl font-bold">{service.title}</h3>
      <Link
        to="/feira360/p/$partner"
        params={{ partner: service.partner_slug }}
        className="text-sm underline"
      >
        {service.partner_name}
      </Link>
      <p className="my-3 line-clamp-3 text-sm text-slate-700">{service.description}</p>
      <p className="flex flex-wrap items-center gap-1 text-xs text-slate-600">
        <MapPin size={14} /> {service.locality} · {modalities[service.modality]}
      </p>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <strong className="text-sm">
          {service.price_cents ? `Desde ${money(service.price_cents)}` : "Sob orçamento"}
        </strong>
        <Link
          className="inline-flex min-h-11 items-center gap-1 text-sm font-bold underline"
          to="/feira360/p/$partner/s/$service"
          params={{ partner: service.partner_slug, service: service.slug }}
          search={{}}
        >
          Ver serviço <ArrowUpRight size={15} />
        </Link>
      </div>
    </article>
  );
}

function Pagination({
  page,
  count,
  onPage,
}: {
  page: number;
  count: number;
  onPage: (page: number) => void;
}) {
  if (!page && count <= 24) return null;
  return (
    <div className="mt-6 flex items-center gap-3">
      <button className={secondary} disabled={!page} onClick={() => onPage(page - 1)}>
        Anterior
      </button>
      <span>Página {page + 1}</span>
      <button className={secondary} disabled={count <= 24} onClick={() => onPage(page + 1)}>
        Seguinte
      </button>
    </div>
  );
}

export function Marketplace() {
  const [filters, setFilters] = useState({
    p_query: "",
    p_category: "",
    p_locality: "",
    p_modality: "",
  });
  const [page, setPage] = useState(0);
  const listings = useQuery(catalogQuery({ ...filters, p_offset: page * 24 }));
  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    setPage(0);
    setFilters({
      p_query: String(values.get("query") ?? "").trim(),
      p_category: String(values.get("category") ?? ""),
      p_locality: String(values.get("locality") ?? "").trim(),
      p_modality: String(values.get("modality") ?? ""),
    });
  }
  return (
    <FeiraPage>
      <section className="bg-[radial-gradient(ellipse_at_top_right,#304664,#11223a_65%)] px-4 py-10 text-white sm:px-6 md:py-16">
        <div className="mx-auto max-w-6xl text-center">
          <h1 className="font-serif text-4xl font-bold text-white! sm:text-6xl">FEIRA 360</h1>
          <p className="mt-5 text-base text-white/90 sm:text-lg">
            Encontre serviços de parceiros aprovados e solicite um orçamento.
          </p>
          <Link className={`${secondary} mt-4`} to="/feira360/parceiro">
            Quero ser parceiro
          </Link>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-5 py-8">
        <form
          onSubmit={search}
          className={`${card} grid gap-3 md:grid-cols-2 lg:grid-cols-[2fr_1.2fr_1fr_1fr_auto] lg:items-end`}
        >
          <label className="text-sm font-semibold">
            Serviço ou parceiro
            <input
              className={field}
              name="query"
              maxLength={100}
              placeholder="Ex. design de marca"
            />
          </label>
          <label className="text-sm font-semibold">
            Categoria
            <select className={field} name="category">
              <Options values={categories} placeholder="Todas" />
            </select>
          </label>
          <label className="text-sm font-semibold">
            Localidade
            <input className={field} name="locality" maxLength={100} />
          </label>
          <label className="text-sm font-semibold">
            Modalidade
            <select className={field} name="modality">
              <Options values={modalities} placeholder="Todas" />
            </select>
          </label>
          <button className={button}>
            <Search size={16} /> Pesquisar
          </button>
        </form>
        <h2 className="my-6 font-serif text-2xl font-bold">Serviços disponíveis</h2>
        <Results
          loading={listings.isPending}
          error={listings.isError}
          items={listings.data?.slice(0, 24)}
        />
        <Pagination page={page} count={listings.data?.length ?? 0} onPage={setPage} />
      </section>
    </FeiraPage>
  );
}

function Results({
  loading,
  error,
  items,
}: {
  loading: boolean;
  error: boolean;
  items: Listing[] | undefined;
}) {
  if (loading) return <p role="status">A carregar serviços…</p>;
  if (error)
    return <p role="alert">Vitrine temporariamente indisponível. Tente novamente mais tarde.</p>;
  if (!items?.length) return <p role="status">Nenhum serviço disponível para esta pesquisa.</p>;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((service) => (
        <ServiceCard key={`${service.partner_slug}/${service.slug}`} service={service} />
      ))}
    </div>
  );
}

export function Detail({
  partner,
  service,
  source,
}: {
  partner: string;
  service?: string;
  source?: string;
}) {
  const [page, setPage] = useState(0);
  const result = useQuery(
    catalogQuery({ p_partner: partner, p_service: service ?? "", p_offset: page * 24 }),
  );
  const listing = result.data?.[0];
  return (
    <FeiraPage>
      <section className="mx-auto max-w-6xl px-5 py-8">
        <Link to="/feira360" className="text-sm font-bold underline">
          Voltar à vitrine
        </Link>
        {listing && (
          <header className="my-6 rounded-2xl bg-[#122640] p-8 text-white">
            <h1 className="font-serif text-4xl font-bold">
              {service ? listing.title : listing.partner_name}
            </h1>
            <p className="mt-4 max-w-3xl whitespace-pre-wrap text-white/85">
              {service ? listing.description : listing.partner_bio}
            </p>
            <p className="mt-4 text-sm">
              {listing.locality}
              {service && ` · ${modalities[listing.modality]}`}
            </p>
          </header>
        )}
        {service && listing ? (
          <>
            <p className="mb-4">
              <Link to="/feira360/p/$partner" params={{ partner }} className="underline">
                {listing.partner_name}
              </Link>
              {" · "}
              {listing.price_cents ? `Desde ${money(listing.price_cents)}` : "Sob orçamento"}
            </p>
            <QuoteForm
              key={`${partner}/${service}`}
              partner={partner}
              service={service}
              source={source ?? ""}
            />
          </>
        ) : (
          <>
            <div className="mt-5">
              <Results
                loading={result.isPending}
                error={result.isError}
                items={result.data?.slice(0, 24)}
              />
            </div>
            <Pagination page={page} count={result.data?.length ?? 0} onPage={setPage} />
          </>
        )}
      </section>
    </FeiraPage>
  );
}

function QuoteForm({
  partner,
  service,
  source,
}: {
  partner: string;
  service: string;
  source: string;
}) {
  const user = useQuery({
    queryKey: ["feira360-quote-session", partner, service],
    queryFn: async () => (await supabase.auth.getUser()).data.user?.id ?? null,
    retry: false,
  });
  const [receipt, setReceipt] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    try {
      setReceipt(
        await account<string>("quote", {
          partner,
          service,
          source,
          brief: String(values.get("brief")),
          consent: values.has("consent"),
        }),
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Falha ao enviar o pedido.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className={`${card} max-w-2xl`}>
      <h2 className="mb-3 font-serif text-2xl font-bold">Solicitar orçamento</h2>
      {receipt ? (
        <p role="status">
          Pedido recebido pela FEIRA 360. Guarde o protocolo{" "}
          <strong className="break-all">{receipt}</strong>.
        </p>
      ) : user.isPending ? (
        <p role="status">A verificar sessão…</p>
      ) : !user.data ? (
        <Link
          to="/cliente/login"
          search={{ next: `/feira360/p/${partner}/s/${service}${source ? `?ref=${source}` : ""}` }}
          className={button}
        >
          Entrar para pedir orçamento
        </Link>
      ) : (
        <form className="grid gap-4" onSubmit={submit}>
          <label className="text-sm font-semibold">
            Descreva o que precisa
            <textarea
              className={field}
              name="brief"
              required
              minLength={20}
              maxLength={2000}
              rows={5}
            />
          </label>
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" name="consent" required />
            Autorizo a FEIRA 360 a enviar a descrição e o e-mail da minha conta a este parceiro para
            responder ao pedido. Não inclua dados sensíveis na descrição.
          </label>
          <button className={`${button} justify-self-start`} disabled={busy}>
            Enviar pedido
          </button>
          {error && <p role="alert">{error}</p>}
        </form>
      )}
    </section>
  );
}

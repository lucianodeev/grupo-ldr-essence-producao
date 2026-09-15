import { Link, createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { BriefcaseBusiness, CircleDollarSign, Plus, Search, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { professionalDashboard } from "@/lib/professional-network.functions";
import { professionalServiceCatalogForMe } from "@/lib/professional-service-catalog.functions";
import { professionalServiceSave, professionalServiceSetActive } from "@/lib/professional-services.functions";

export const Route = createFileRoute("/profissional-servicos")({
  head: () => ({ meta: [{ title: "Meus Serviços — Rede LDR" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: ServicesPage,
});

type AnyRow = Record<string, any>;
type BillingUnit = "session" | "hour" | "30_min" | "project" | "vacancy" | "day" | "package" | "month" | "custom_quote";
type Draft = {
  catalogKey: string | null;
  name: string;
  description: string;
  modality: "online" | "in_person" | "both";
  durationMinutes: number;
  currency: "EUR" | "BRL";
  price: string;
  billingUnit: BillingUnit;
  city: string;
  publicLocation: string;
  quoteRequired: boolean;
  bookingEnabled: boolean;
  availableForPrivate: boolean;
  availableForCompany: boolean;
  feeComplianceStatus: "allowed" | "requires_review" | "restricted";
};

const UNIT_LABELS: Record<BillingUnit, string> = {
  session: "por sessão",
  hour: "por hora",
  "30_min": "por 30 minutos",
  project: "por projeto",
  vacancy: "por vaga",
  day: "por dia",
  package: "por pacote",
  month: "por mês",
  custom_quote: "orçamento personalizado",
};

function money(cents: number, currency: string) {
  return new Intl.NumberFormat(currency === "BRL" ? "pt-BR" : "pt-PT", { style: "currency", currency }).format((cents || 0) / 100);
}

function marketReference(service: AnyRow, market: "BR" | "EU", currency: "BRL" | "EUR") {
  const refs = (service.professional_service_price_reference ?? []) as AnyRow[];
  return refs.find((row) => row.active !== false && row.market_code === market && row.currency === currency) ?? null;
}

function referenceText(ref: AnyRow | null) {
  if (!ref) return "Sem referência cadastrada";
  if (ref.min_amount_cents == null && ref.max_amount_cents == null) return "Orçamento / definir conforme escopo";
  if (ref.min_amount_cents != null && ref.max_amount_cents != null) {
    return `${money(ref.min_amount_cents, ref.currency)} – ${money(ref.max_amount_cents, ref.currency)} ${UNIT_LABELS[ref.billing_unit as BillingUnit] ?? ""}`;
  }
  return money(ref.min_amount_cents ?? ref.max_amount_cents ?? 0, ref.currency);
}

function ServicesPage() {
  const loadDashboard = useServerFn(professionalDashboard);
  const loadCatalog = useServerFn(professionalServiceCatalogForMe);
  const save = useServerFn(professionalServiceSave);
  const toggle = useServerFn(professionalServiceSetActive);
  const [data, setData] = useState<any>(null);
  const [catalogData, setCatalogData] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [customOpen, setCustomOpen] = useState(false);

  const refresh = async () => {
    const [dashboard, catalog] = await Promise.all([loadDashboard(), loadCatalog()]);
    setData(dashboard);
    setCatalogData(catalog);
  };

  useEffect(() => {
    void supabase.auth.getSession().then(({ data: sessionData }) => {
      if (!sessionData.session) window.location.replace("/profissional/login");
      else void refresh();
    });
  }, []);

  const services = (data?.services ?? []) as AnyRow[];
  const existingCatalogKeys = useMemo(() => new Set(services.map((service) => service.catalog_key).filter(Boolean)), [services]);
  const catalog = (catalogData?.catalog ?? []) as AnyRow[];
  const currency: "EUR" | "BRL" = catalogData?.account?.preferred_currency === "BRL" || catalogData?.profile?.country_code === "BR" ? "BRL" : "EUR";
  const market: "BR" | "EU" = catalogData?.profile?.country_code === "BR" ? "BR" : "EU";
  const feePercent = Number(catalogData?.platformFeePercent ?? 20);

  const visibleCatalog = useMemo(() => {
    const term = search.trim().toLowerCase();
    return catalog.filter((service) => {
      if (existingCatalogKeys.has(service.catalog_key)) return false;
      if (!term) return true;
      return `${service.name_pt ?? ""} ${service.description_pt ?? ""}`.toLowerCase().includes(term);
    });
  }, [catalog, existingCatalogKeys, search]);

  function addSelected() {
    const chosen = catalog.filter((service) => selected.includes(service.catalog_key) && !existingCatalogKeys.has(service.catalog_key));
    if (!chosen.length) return;
    setDrafts((current) => [
      ...current,
      ...chosen.map((service): Draft => ({
        catalogKey: service.catalog_key,
        name: service.name_pt,
        description: service.description_pt ?? "",
        modality: "online",
        durationMinutes: Number(service.default_duration_minutes ?? 50),
        currency,
        price: "",
        billingUnit: (service.default_billing_unit ?? "session") as BillingUnit,
        city: catalogData?.profile?.city ?? "",
        publicLocation: "",
        quoteRequired: service.default_billing_unit === "custom_quote",
        bookingEnabled: true,
        availableForPrivate: true,
        availableForCompany: ["recursos-humanos", "consultoria-carreira", "mentoria"].includes(catalogData?.category?.slug),
        feeComplianceStatus: service.fee_compliance_status ?? "allowed",
      })),
    ]);
    setSelected([]);
  }

  function addCustom() {
    setDrafts((current) => [
      ...current,
      {
        catalogKey: null,
        name: "",
        description: "",
        modality: "online",
        durationMinutes: 50,
        currency,
        price: "",
        billingUnit: "session",
        city: catalogData?.profile?.city ?? "",
        publicLocation: "",
        quoteRequired: false,
        bookingEnabled: false,
        availableForPrivate: true,
        availableForCompany: false,
        feeComplianceStatus: "requires_review",
      },
    ]);
    setCustomOpen(false);
  }

  async function saveDraft(index: number) {
    const draft = drafts[index];
    if (!draft) return;
    const price = draft.quoteRequired ? 0 : Math.round(Number(String(draft.price).replace(",", ".")) * 100);
    if (!draft.quoteRequired && (!Number.isFinite(price) || price <= 0)) {
      toast.error("Informe um preço válido ou marque orçamento personalizado.");
      return;
    }
    if (!draft.name.trim()) {
      toast.error("Informe o nome do serviço.");
      return;
    }

    setBusy(true);
    try {
      const result = await save({
        data: {
          catalogKey: draft.catalogKey,
          name: draft.name,
          description: draft.description || null,
          modality: draft.modality,
          durationMinutes: Number(draft.durationMinutes),
          currency: draft.currency,
          priceCents: price,
          billingUnit: draft.billingUnit,
          countryCodes: [catalogData?.profile?.country_code].filter(Boolean),
          languageCodes: catalogData?.profile?.languages ?? [],
          city: draft.city || null,
          publicLocation: draft.publicLocation || null,
          bookingEnabled: draft.bookingEnabled,
          quoteRequired: draft.quoteRequired,
          availableForPrivate: draft.availableForPrivate,
          availableForCompany: draft.availableForCompany,
        },
      });
      if (result.feeComplianceStatus !== "allowed") {
        toast.success("Serviço salvo. O checkout ficará bloqueado até a validação de compliance.");
      } else if (result.approvalStatus === "pending_review") {
        toast.success("Serviço enviado para aprovação do Master.");
      } else {
        toast.success(result.bookingEnabled ? "Serviço publicado com checkout." : "Serviço salvo.");
      }
      setDrafts((current) => current.filter((_, i) => i !== index));
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível salvar.");
    } finally {
      setBusy(false);
    }
  }

  if (!data || !catalogData) return <div className="min-h-screen grid place-items-center text-sm text-muted-foreground">Carregando…</div>;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div><p className="font-serif text-xl">LDR Essence</p><p className="text-xs opacity-80">Meus Serviços</p></div>
          <Link to="/profissional-painel" className="rounded-lg border border-white/30 px-3 py-2 text-sm font-bold">Voltar ao painel</Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
        <section className="rounded-3xl border bg-card p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex items-start gap-4">
              <span className="rounded-2xl bg-primary/10 p-3 text-primary"><BriefcaseBusiness className="h-6 w-6" /></span>
              <div>
                <p className="text-xs font-black uppercase tracking-[.18em] text-primary">{catalogData.category?.name_pt ?? "Sua profissão"}</p>
                <h1 className="mt-1 font-serif text-3xl">Escolha os serviços que você oferece</h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">O catálogo mostra apenas serviços compatíveis com sua categoria profissional. Você define o próprio preço e pode atender clientes particulares, empresas ou ambos.</p>
              </div>
            </div>
            <div className="rounded-2xl border bg-muted/30 px-5 py-4">
              <p className="text-xs font-black uppercase tracking-[.12em] text-muted-foreground">Regra financeira padrão</p>
              <p className="mt-1 font-serif text-2xl text-primary">{feePercent}% LDR · {100 - feePercent}% profissional</p>
              <p className="mt-1 text-xs text-muted-foreground">Aplicada somente quando o compliance da profissão/país permitir.</p>
            </div>
          </div>
        </section>

        {catalogData.specialties?.length ? (
          <section className="rounded-3xl border bg-card p-5">
            <p className="text-xs font-black uppercase tracking-[.16em] text-primary">Especialidades compatíveis</p>
            <div className="mt-3 flex flex-wrap gap-2">{catalogData.specialties.map((item: AnyRow) => <span key={item.id} className="rounded-full border bg-muted/30 px-3 py-2 text-xs font-bold">{item.name_pt}</span>)}</div>
          </section>
        ) : null}

        <section className="rounded-3xl border bg-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><h2 className="font-serif text-2xl">Catálogo da sua profissão</h2><p className="mt-1 text-sm text-muted-foreground">Selecione um ou vários serviços. Depois configure preço, duração e modalidade de cada um.</p></div>
            <button onClick={() => setCustomOpen(true)} className="inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-black"><Plus className="h-4 w-4" /> SOLICITAR NOVO SERVIÇO</button>
          </div>
          <label className="relative mt-5 block"><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar serviço…" className="w-full rounded-2xl border bg-background py-3 pl-11 pr-4 text-sm" /></label>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {visibleCatalog.map((service) => {
              const ref = marketReference(service, market, currency);
              const checked = selected.includes(service.catalog_key);
              return <label key={service.catalog_key} className={`cursor-pointer rounded-2xl border p-4 transition ${checked ? "border-primary bg-primary/5" : "hover:border-primary/40"}`}>
                <div className="flex items-start gap-3"><input type="checkbox" checked={checked} onChange={() => setSelected((current) => checked ? current.filter((key) => key !== service.catalog_key) : [...current, service.catalog_key])} className="mt-1" /><div><h3 className="font-bold">{service.name_pt}</h3><p className="mt-1 text-xs text-muted-foreground">{UNIT_LABELS[service.default_billing_unit as BillingUnit] ?? service.default_billing_unit} · {service.default_duration_minutes ?? 50} min</p></div></div>
                <div className="mt-3 rounded-xl bg-muted/40 p-3"><p className="text-[11px] font-black uppercase tracking-[.1em] text-muted-foreground">Referência de mercado</p><p className="mt-1 text-sm font-bold text-primary">{referenceText(ref)}</p><p className="mt-1 text-[11px] text-muted-foreground">Não é preço obrigatório.</p></div>
                {service.fee_compliance_status !== "allowed" ? <div className="mt-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900">Compliance financeiro: revisão necessária antes do checkout.</div> : null}
              </label>;
            })}
          </div>
          {visibleCatalog.length === 0 ? <p className="mt-5 text-sm text-muted-foreground">Nenhum serviço disponível com este filtro ou todos já foram adicionados.</p> : null}
          <button disabled={!selected.length} onClick={addSelected} className="mt-5 rounded-xl bg-primary px-5 py-3 text-sm font-black text-primary-foreground disabled:opacity-40">CONFIGURAR {selected.length || ""} SERVIÇO{selected.length === 1 ? "" : "S"}</button>
        </section>

        {customOpen ? (
          <section className="rounded-3xl border border-dashed bg-card p-6">
            <h2 className="font-serif text-2xl">Novo serviço personalizado</h2>
            <p className="mt-2 text-sm text-muted-foreground">Serviços fora do catálogo são enviados como <strong>pending_review</strong> e só ficam públicos após aprovação do Master.</p>
            <div className="mt-4 flex gap-2"><button onClick={addCustom} className="rounded-xl bg-primary px-4 py-3 text-sm font-black text-primary-foreground">CRIAR RASCUNHO</button><button onClick={() => setCustomOpen(false)} className="rounded-xl border px-4 py-3 text-sm font-bold">CANCELAR</button></div>
          </section>
        ) : null}

        {drafts.length ? (
          <section className="rounded-3xl border bg-card p-6">
            <h2 className="font-serif text-2xl">Configurar serviços selecionados</h2>
            <div className="mt-5 space-y-5">
              {drafts.map((draft, index) => {
                const catalogRow = catalog.find((item) => item.catalog_key === draft.catalogKey);
                const ref = catalogRow ? marketReference(catalogRow, market, draft.currency) : null;
                const numericPrice = Number(String(draft.price).replace(",", "."));
                const grossCents = Number.isFinite(numericPrice) ? Math.round(numericPrice * 100) : 0;
                const ldr = Math.round(grossCents * feePercent / 100);
                return <article key={`${draft.catalogKey ?? "custom"}-${index}`} className="rounded-2xl border p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[.12em] text-primary">{draft.catalogKey ? "Serviço do catálogo" : "Serviço personalizado · revisão obrigatória"}</p><h3 className="mt-1 font-serif text-xl">{draft.name || "Novo serviço"}</h3></div><button onClick={() => setDrafts((current) => current.filter((_, i) => i !== index))} className="rounded-lg border px-3 py-2 text-xs font-bold">REMOVER</button></div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <Field label="Nome do serviço"><input value={draft.name} disabled={Boolean(draft.catalogKey)} onChange={(e) => setDrafts((current) => current.map((item, i) => i === index ? { ...item, name: e.target.value } : item))} /></Field>
                    <Field label="Modalidade"><select value={draft.modality} onChange={(e) => setDrafts((current) => current.map((item, i) => i === index ? { ...item, modality: e.target.value as Draft["modality"] } : item))}><option value="online">Online</option><option value="in_person">Presencial</option><option value="both">Online e presencial</option></select></Field>
                    <Field label="Duração (min)"><input type="number" min="5" max="480" value={draft.durationMinutes} onChange={(e) => setDrafts((current) => current.map((item, i) => i === index ? { ...item, durationMinutes: Number(e.target.value) } : item))} /></Field>
                    <Field label="Cobrança"><select value={draft.billingUnit} onChange={(e) => setDrafts((current) => current.map((item, i) => i === index ? { ...item, billingUnit: e.target.value as BillingUnit, quoteRequired: e.target.value === "custom_quote" } : item))}>{Object.entries(UNIT_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field>
                    <Field label="Moeda"><select value={draft.currency} onChange={(e) => setDrafts((current) => current.map((item, i) => i === index ? { ...item, currency: e.target.value as "EUR" | "BRL" } : item))}><option value="EUR">EUR</option><option value="BRL">BRL</option></select></Field>
                    <Field label="Seu preço"><input inputMode="decimal" value={draft.price} disabled={draft.quoteRequired} onChange={(e) => setDrafts((current) => current.map((item, i) => i === index ? { ...item, price: e.target.value } : item))} placeholder={draft.quoteRequired ? "Orçamento" : "0,00"} /></Field>
                    <Field label="Cidade"><input value={draft.city} onChange={(e) => setDrafts((current) => current.map((item, i) => i === index ? { ...item, city: e.target.value } : item))} /></Field>
                    {draft.modality !== "online" ? <Field label="Local público / região"><input value={draft.publicLocation} onChange={(e) => setDrafts((current) => current.map((item, i) => i === index ? { ...item, publicLocation: e.target.value } : item))} placeholder="Ex.: Bruxelas, Bélgica" /></Field> : null}
                  </div>
                  <Field label="Descrição"><textarea rows={3} value={draft.description} onChange={(e) => setDrafts((current) => current.map((item, i) => i === index ? { ...item, description: e.target.value } : item))} /></Field>
                  <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold"><label className="flex items-center gap-2"><input type="checkbox" checked={draft.quoteRequired} onChange={(e) => setDrafts((current) => current.map((item, i) => i === index ? { ...item, quoteRequired: e.target.checked } : item))} />Orçamento personalizado</label><label className="flex items-center gap-2"><input type="checkbox" checked={draft.availableForPrivate} onChange={(e) => setDrafts((current) => current.map((item, i) => i === index ? { ...item, availableForPrivate: e.target.checked } : item))} />Clientes particulares</label><label className="flex items-center gap-2"><input type="checkbox" checked={draft.availableForCompany} onChange={(e) => setDrafts((current) => current.map((item, i) => i === index ? { ...item, availableForCompany: e.target.checked } : item))} />Empresas</label></div>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="rounded-xl bg-muted/40 p-4"><p className="text-xs font-black uppercase tracking-[.1em] text-muted-foreground">Referência de mercado</p><p className="mt-1 font-bold text-primary">{referenceText(ref)}</p></div>
                    <div className="rounded-xl bg-primary/5 p-4"><p className="text-xs font-black uppercase tracking-[.1em] text-primary">Divisão do pagamento</p>{draft.feeComplianceStatus === "allowed" && !draft.quoteRequired && grossCents > 0 ? <p className="mt-1 text-sm"><strong>LDR:</strong> {money(ldr, draft.currency)} · <strong>Você:</strong> {money(grossCents - ldr, draft.currency)}</p> : <p className="mt-1 text-sm text-muted-foreground">{draft.feeComplianceStatus === "allowed" ? "Informe o preço para visualizar 20% / 80%." : "Checkout bloqueado até validação de compliance."}</p>}</div>
                  </div>
                  <button disabled={busy || !draft.name.trim()} onClick={() => void saveDraft(index)} className="mt-5 rounded-xl bg-primary px-5 py-3 text-sm font-black text-primary-foreground disabled:opacity-50">SALVAR SERVIÇO</button>
                </article>;
              })}
            </div>
          </section>
        ) : null}

        <section className="rounded-3xl border bg-card p-6">
          <h2 className="font-serif text-2xl">Serviços cadastrados</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {services.map((service) => <article key={service.id} className="rounded-2xl border p-5">
              <div className="flex items-start justify-between gap-3"><div><h3 className="font-bold">{service.name}</h3><p className="mt-1 text-xs text-muted-foreground">{UNIT_LABELS[service.billing_unit as BillingUnit] ?? service.billing_unit ?? "por sessão"} · {service.modality} · {service.duration_minutes} min</p></div><strong>{service.quote_required ? "ORÇAMENTO" : service.price_cents == null ? "Preço não definido" : money(service.price_cents, service.currency || "EUR")}</strong></div>
              <p className="mt-3 text-sm text-muted-foreground">{service.description}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs"><span className={`rounded-full px-2 py-1 font-bold ${service.active ? "bg-emerald-100 text-emerald-800" : "bg-muted"}`}>{service.active ? "ATIVO" : "PAUSADO"}</span><span className="rounded-full bg-muted px-2 py-1 font-bold">{service.approval_status ?? "approved"}</span><span className="rounded-full bg-muted px-2 py-1 font-bold">{service.fee_compliance_status === "allowed" ? "20% / 80% LIBERADO" : "COMPLIANCE PENDENTE"}</span><span className="rounded-full bg-muted px-2 py-1 font-bold">{service.booking_enabled ? "CHECKOUT ATIVO" : "SEM CHECKOUT"}</span></div>
              <button disabled={busy} onClick={async () => { setBusy(true); try { await toggle({ data: { id: service.id, active: !service.active } }); await refresh(); } catch (error) { toast.error(error instanceof Error ? error.message : "Erro"); } finally { setBusy(false); } }} className="mt-4 rounded-lg border px-3 py-2 text-xs font-bold">{service.active ? "PAUSAR" : "REATIVAR"}</button>
            </article>)}
          </div>
          {services.length === 0 ? <p className="mt-4 text-sm text-muted-foreground">Nenhum serviço cadastrado.</p> : null}
        </section>

        <section className="rounded-3xl border bg-primary/5 p-6 text-sm leading-6 text-muted-foreground">
          <ShieldCheck className="mr-1 inline h-4 w-4 text-primary" />
          <strong className="text-foreground"> Segurança profissional:</strong> títulos e serviços regulamentados exigem documentação quando aplicável. Serviços personalizados passam pelo Master. A referência de preço é apenas orientativa e a taxa de 20% só é ativada quando o compliance permitir.
        </section>
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: any }) {
  return <label className="mt-4 grid gap-1 text-sm font-bold"><span>{label}</span><div className="[&>input]:w-full [&>input]:rounded-xl [&>input]:border [&>input]:bg-background [&>input]:px-3 [&>input]:py-3 [&>select]:w-full [&>select]:rounded-xl [&>select]:border [&>select]:bg-background [&>select]:px-3 [&>select]:py-3 [&>textarea]:w-full [&>textarea]:rounded-xl [&>textarea]:border [&>textarea]:bg-background [&>textarea]:px-3 [&>textarea]:py-3">{children}</div></label>;
}

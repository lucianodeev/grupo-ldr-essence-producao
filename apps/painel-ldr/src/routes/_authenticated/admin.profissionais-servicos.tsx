import { Link, createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  professionalCatalogAdmin,
  professionalCatalogAdminCategoryActive,
  professionalCatalogAdminFeeCompliance,
  professionalCatalogAdminPriceReference,
  professionalCatalogAdminReview,
  professionalCatalogAdminServiceActive,
} from "@/lib/professional-catalog-admin.functions";

export const Route = createFileRoute("/_authenticated/admin/profissionais-servicos")({ component: ServiceReview });
type Row = Record<string, any>;

function money(cents: number | null | undefined, currency: string) {
  if (cents == null) return "—";
  return new Intl.NumberFormat(currency === "BRL" ? "pt-BR" : "pt-PT", { style: "currency", currency }).format(cents / 100);
}

function ServiceReview() {
  const load = useServerFn(professionalCatalogAdmin);
  const review = useServerFn(professionalCatalogAdminReview);
  const feeCompliance = useServerFn(professionalCatalogAdminFeeCompliance);
  const updateReference = useServerFn(professionalCatalogAdminPriceReference);
  const setServiceActive = useServerFn(professionalCatalogAdminServiceActive);
  const setCategoryActive = useServerFn(professionalCatalogAdminCategoryActive);
  const [data, setData] = useState<any>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [catalogSearch, setCatalogSearch] = useState("");
  const refresh = async () => setData(await load());

  useEffect(() => { void refresh(); }, []);
  if (!data) return <p className="text-sm text-muted-foreground">Carregando serviços da Rede…</p>;

  const rows = (data.services ?? []) as Row[];
  const categories = (data.categories ?? []) as Row[];
  const catalog = (data.catalog ?? []) as Row[];
  const feePercent = Number(data.platformFeePercent ?? 20);
  const filteredCatalog = catalog.filter((service) => `${service.name_pt} ${service.catalog_key}`.toLowerCase().includes(catalogSearch.toLowerCase()));

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const service of catalog) map.set(service.category_id, (map.get(service.category_id) ?? 0) + 1);
    return map;
  }, [catalog]);

  async function act(serviceId: string, action: "approve" | "reject") {
    setBusy(serviceId);
    try {
      await review({ data: { serviceId, action } });
      toast.success(action === "approve" ? "Serviço aprovado." : "Serviço rejeitado.");
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro");
    } finally {
      setBusy(null);
    }
  }

  async function setFee(serviceId: string, status: "allowed" | "requires_review" | "restricted") {
    const note = window.prompt("Motivo/observação do compliance (opcional):", "") ?? "";
    setBusy(serviceId);
    try {
      await feeCompliance({ data: { serviceId, status, note } });
      toast.success(status === "allowed" ? `Taxa ${feePercent}% liberada para este serviço.` : "Status de compliance atualizado.");
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro");
    } finally {
      setBusy(null);
    }
  }

  async function editReference(reference: Row) {
    const minCurrent = reference.min_amount_cents == null ? "" : String(reference.min_amount_cents / 100).replace(".", ",");
    const maxCurrent = reference.max_amount_cents == null ? "" : String(reference.max_amount_cents / 100).replace(".", ",");
    const minRaw = window.prompt(`Valor mínimo (${reference.currency}) — deixe vazio para orçamento:`, minCurrent);
    if (minRaw === null) return;
    const maxRaw = window.prompt(`Valor máximo (${reference.currency}) — deixe vazio para orçamento:`, maxCurrent);
    if (maxRaw === null) return;
    const toCents = (value: string) => value.trim() ? Math.round(Number(value.replace(",", ".")) * 100) : null;
    const minAmountCents = toCents(minRaw);
    const maxAmountCents = toCents(maxRaw);
    if ((minAmountCents != null && !Number.isFinite(minAmountCents)) || (maxAmountCents != null && !Number.isFinite(maxAmountCents))) {
      toast.error("Valor inválido.");
      return;
    }
    setBusy(reference.id);
    try {
      await updateReference({ data: { referenceId: reference.id, minAmountCents, maxAmountCents, notes: reference.notes ?? null } });
      toast.success("Referência atualizada.");
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro");
    } finally {
      setBusy(null);
    }
  }

  return <div className="space-y-7">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="text-xs font-black uppercase tracking-[.18em] text-primary">LDR Essence · Rede de Profissionais</p>
        <h1 className="mt-1 font-serif text-4xl">Categorias, serviços e compliance</h1>
        <p className="mt-2 max-w-4xl text-sm text-muted-foreground">Administre aprovações, referências de mercado e a liberação da regra financeira. A taxa padrão é {feePercent}% LDR / {100 - feePercent}% profissional, mas o checkout permanece bloqueado quando o compliance estiver pendente ou restrito.</p>
      </div>
      <Link to="/admin/rede" className="rounded-xl border px-4 py-2 text-sm font-bold">Voltar à Rede</Link>
    </div>

    <section className="rounded-3xl border bg-card p-6">
      <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[.16em] text-primary">Profissões</p><h2 className="mt-1 font-serif text-2xl">Categorias profissionais</h2></div><span className="rounded-full bg-muted px-3 py-2 text-xs font-bold">{categories.filter((item) => item.active).length} ativas</span></div>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{categories.map((category) => <article key={category.id} className="rounded-2xl border p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="font-bold">{category.name_pt}</h3><p className="mt-1 text-xs text-muted-foreground">{category.network_group ?? "—"} · {counts.get(category.id) ?? 0} serviços</p></div><span className={`rounded-full px-2 py-1 text-[10px] font-black ${category.active ? "bg-emerald-100 text-emerald-800" : "bg-muted"}`}>{category.active ? "ATIVA" : "INATIVA"}</span></div><div className="mt-3 flex flex-wrap gap-2 text-[11px]"><span className="rounded-full bg-muted px-2 py-1">{category.requires_license ? "EXIGE REGISTRO" : "SEM REGISTRO PADRÃO"}</span><span className="rounded-full bg-muted px-2 py-1">{category.fee_compliance_status}</span></div><button disabled={busy === category.id} onClick={async () => { setBusy(category.id); try { await setCategoryActive({ data: { categoryId: category.id, active: !category.active } }); await refresh(); } catch (error) { toast.error(error instanceof Error ? error.message : "Erro"); } finally { setBusy(null); } }} className="mt-3 rounded-lg border px-3 py-2 text-xs font-bold">{category.active ? "DESATIVAR" : "ATIVAR"}</button></article>)}</div>
    </section>

    <section className="rounded-3xl border bg-card p-6">
      <div><p className="text-xs font-black uppercase tracking-[.16em] text-primary">Fila do Master</p><h2 className="mt-1 font-serif text-2xl">Serviços escolhidos ou personalizados</h2><p className="mt-2 text-sm text-muted-foreground">Serviços personalizados e itens que exigem revisão aparecem aqui. Aprovar o serviço não libera automaticamente a taxa se o compliance continuar pendente.</p></div>
      <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[1120px] text-left text-sm"><thead><tr className="border-b"><th className="py-2">Profissional</th><th>Serviço</th><th>Origem</th><th>País</th><th>Valor</th><th>Aprovação</th><th>Compliance</th><th>Checkout</th><th>Ações</th></tr></thead><tbody>{rows.map((service: Row) => { const profile = Array.isArray(service.professional_profiles) ? service.professional_profiles[0] : service.professional_profiles; return <tr key={service.id} className="border-b align-top last:border-0"><td className="py-3"><strong>{profile?.display_name || "—"}</strong><p className="text-xs text-muted-foreground">{profile?.professional_title || ""}</p></td><td><strong>{service.name}</strong><p className="text-xs text-muted-foreground">{service.billing_unit ?? "session"} · {service.modality}</p></td><td>{service.source_type === "custom" ? "Personalizado" : "Catálogo"}</td><td>{profile?.country_code || "—"}</td><td>{service.quote_required ? "ORÇAMENTO" : money(service.price_cents, service.currency || "EUR")}</td><td><span className="rounded-full bg-muted px-2 py-1 text-xs font-bold">{service.approval_status}</span></td><td><span className={`rounded-full px-2 py-1 text-xs font-bold ${service.fee_compliance_status === "allowed" ? "bg-emerald-100 text-emerald-800" : service.fee_compliance_status === "restricted" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-900"}`}>{service.fee_compliance_status}</span></td><td>{service.booking_enabled ? "ATIVO" : "BLOQUEADO"}</td><td><div className="flex min-w-[245px] flex-wrap gap-2"><button disabled={busy === service.id} onClick={() => void act(service.id, "approve")} className="rounded-lg bg-primary px-3 py-2 text-xs font-black text-primary-foreground">APROVAR</button><button disabled={busy === service.id} onClick={() => void act(service.id, "reject")} className="rounded-lg border px-3 py-2 text-xs font-bold">REJEITAR</button><button disabled={busy === service.id} onClick={() => void setFee(service.id, "allowed")} className="rounded-lg border border-emerald-300 px-3 py-2 text-xs font-bold text-emerald-800">LIBERAR {feePercent}%</button><button disabled={busy === service.id} onClick={() => void setFee(service.id, "requires_review")} className="rounded-lg border border-amber-300 px-3 py-2 text-xs font-bold text-amber-800">REVISAR</button><button disabled={busy === service.id} onClick={() => void setFee(service.id, "restricted")} className="rounded-lg border border-red-300 px-3 py-2 text-xs font-bold text-red-800">RESTRINGIR</button></div></td></tr>; })}</tbody></table></div>
      {rows.length === 0 ? <p className="mt-4 text-sm text-muted-foreground">Nenhum serviço selecionado ainda.</p> : null}
    </section>

    <section className="rounded-3xl border bg-card p-6">
      <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[.16em] text-primary">Catálogo LDR</p><h2 className="mt-1 font-serif text-2xl">Serviços e referências de preço</h2><p className="mt-2 text-sm text-muted-foreground">As faixas são referências, não preços obrigatórios. Clique em uma referência para atualizar mínimo/máximo.</p></div><input value={catalogSearch} onChange={(event) => setCatalogSearch(event.target.value)} className="min-w-72 rounded-xl border bg-background px-4 py-3 text-sm" placeholder="Buscar serviço…" /></div>
      <div className="mt-5 grid gap-3 lg:grid-cols-2">{filteredCatalog.map((service) => { const category = categories.find((item) => item.id === service.category_id); const refs = (service.professional_service_price_reference ?? []) as Row[]; return <article key={service.id} className="rounded-2xl border p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-[11px] font-black uppercase tracking-[.12em] text-primary">{category?.name_pt ?? "Categoria"}</p><h3 className="mt-1 font-bold">{service.name_pt}</h3><p className="mt-1 text-xs text-muted-foreground">{service.default_billing_unit} · {service.default_duration_minutes ?? "—"} min · {service.fee_compliance_status}</p></div><button disabled={busy === service.id} onClick={async () => { setBusy(service.id); try { await setServiceActive({ data: { catalogServiceId: service.id, active: !service.active } }); await refresh(); } catch (error) { toast.error(error instanceof Error ? error.message : "Erro"); } finally { setBusy(null); } }} className="rounded-lg border px-3 py-2 text-xs font-bold">{service.active ? "ATIVO" : "INATIVO"}</button></div><div className="mt-3 grid gap-2 sm:grid-cols-2">{refs.map((reference) => <button key={reference.id} disabled={busy === reference.id} onClick={() => void editReference(reference)} className="rounded-xl bg-muted/40 p-3 text-left"><p className="text-[10px] font-black uppercase tracking-[.1em] text-muted-foreground">{reference.market_code} · {reference.currency}</p><p className="mt-1 text-sm font-bold text-primary">{reference.min_amount_cents == null && reference.max_amount_cents == null ? "Orçamento" : `${money(reference.min_amount_cents, reference.currency)} – ${money(reference.max_amount_cents, reference.currency)}`}</p><p className="mt-1 text-[10px] text-muted-foreground">{reference.billing_unit}</p></button>)}</div></article>; })}</div>
    </section>
  </div>;
}

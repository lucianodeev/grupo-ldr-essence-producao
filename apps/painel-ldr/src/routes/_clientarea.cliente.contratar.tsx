import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { Field, PageHeader } from "@/components/central/ui";
import { useClientContractCatalog } from "@/lib/client-portal-data";
import { formatMoney, safeUrl } from "@/lib/central";
import type { ContractItem } from "@/lib/contract-catalog";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_clientarea/cliente/contratar")({
  head: () => ({ meta: [{ title: "Contratar e agendar — Grupo LDR Essence" }, { name: "robots", content: "noindex" }] }),
  component: ClientContract,
});

const CATEGORY_BY_KEY: Record<string, string> = {
  landing_page: "Sites e tecnologia", site_one_page: "Sites e tecnologia", site_institucional_entrada: "Sites e tecnologia",
  site_empresarial_entrada: "Sites e tecnologia", catalogo_digital_entrada: "Sites e tecnologia", loja_virtual_entrada: "Sites e tecnologia",
  diagnostico_digital: "Marketing e presença digital", plano_marketing: "Marketing e presença digital", identidade_visual_entrada: "Marketing e presença digital",
  criativos_5: "Marketing e presença digital", criativos_10: "Marketing e presença digital", email_marketing_conteudo: "Marketing e presença digital",
  meta_ads_setup: "Marketing e presença digital", google_ads_setup: "Marketing e presença digital",
  manutencao_essencial: "Planos mensais", manutencao_profissional: "Planos mensais", manutencao_empresarial: "Planos mensais",
  social_inicial: "Planos mensais", social_crescimento: "Planos mensais", social_profissional: "Planos mensais", social_empresarial: "Planos mensais",
  ads_uma_plataforma: "Planos mensais", ads_meta_google: "Planos mensais",
  orientacao_profissional_eu: "Carreira e desenvolvimento", orientacao_profissional_br: "Carreira e desenvolvimento",
  plano_carreira_eu: "Carreira e desenvolvimento", plano_carreira_br: "Carreira e desenvolvimento",
  transicao_carreira_eu: "Carreira e desenvolvimento", transicao_carreira_br: "Carreira e desenvolvimento",
  carreira_internacional_eu: "Carreira e desenvolvimento", carreira_internacional_br: "Carreira e desenvolvimento",
  diagnostico_projeto: "Mentoria e estratégia",
};

function Card({ item }: { item: ContractItem }) {
  const link = safeUrl(item.paymentUrl);
  return (
    <li className="group flex h-full flex-col rounded-2xl border border-border/70 bg-background p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="inline-flex rounded-full bg-accent px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-accent-foreground">
            {item.region === "br" ? "Brasil" : item.region === "eu" ? "Europa" : CATEGORY_BY_KEY[item.catalogKey] ?? "Serviço"}
          </span>
          <h3 className="mt-3 font-serif text-lg leading-snug">{item.name}</h3>
          {item.sessions > 0 && <p className="mt-1 text-xs font-bold text-muted-foreground">{item.sessions} {item.sessions === 1 ? "sessão" : "sessões"}</p>}
        </div>
        <div className="shrink-0 text-right">
          {item.originalCents ? <p className="text-xs text-muted-foreground line-through">{formatMoney(item.originalCents, item.currency)}</p> : null}
          <p className="text-xl font-extrabold text-primary">{formatMoney(item.amountCents, item.currency)}</p>
          {item.originalCents ? <span className="text-[11px] font-bold text-primary">valor com desconto</span> : null}
        </div>
      </div>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">Pagamento seguro. Após a contratação, acompanhe os próximos passos pela sua Área do Cliente.</p>
      {link ? (
        <a className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-extrabold text-primary-foreground shadow-sm transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" href={link} target="_blank" rel="noreferrer noopener">
          Contratar agora
        </a>
      ) : <p className="mt-4 rounded-xl bg-muted p-3 text-center text-xs text-muted-foreground">Checkout temporariamente indisponível</p>}
    </li>
  );
}

function ClientContract() {
  const { t } = useI18n();
  const catalog = useClientContractCatalog();
  const [region, setRegion] = useState<"eu" | "br">("eu");
  const [search, setSearch] = useState("");
  const items = catalog.data?.items ?? [];
  const psicanalise = items.filter((i) => i.group === "psicanalise" && i.region === region);
  const mentoria = items.filter((i) => i.group === "mentoria");
  const services = items.filter((i) => i.group === "servicos");
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return services.filter((item) => {
      if (item.region && item.region !== region) return false;
      return !q || `${item.name} ${CATEGORY_BY_KEY[item.catalogKey] ?? ""}`.toLowerCase().includes(q);
    });
  }, [services, region, search]);
  const grouped = useMemo(() => {
    const map = new Map<string, ContractItem[]>();
    for (const item of filtered) {
      const category = CATEGORY_BY_KEY[item.catalogKey] ?? "Outros serviços";
      map.set(category, [...(map.get(category) ?? []), item]);
    }
    return Array.from(map.entries());
  }, [filtered]);

  if (catalog.isLoading) return <p className="text-sm text-muted-foreground">{t("state.loading")}</p>;

  return <div className="grid gap-8">
    <PageHeader title={t("contract.title")} subtitle="Escolha, pague com segurança e acompanhe tudo pelo painel." />
    <section className="rounded-3xl border border-primary/15 bg-gradient-to-br from-card via-card to-accent/25 p-5 shadow-sm sm:p-7">
      <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-primary">Grupo LDR Essence</p>
      <h2 className="mt-2 max-w-2xl font-serif text-2xl sm:text-3xl">Todos os serviços em um só lugar</h2>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">Sem redirecionamento para WhatsApp: cada serviço disponível possui acesso direto ao checkout oficial. Você escolhe com calma e mantém o acompanhamento centralizado.</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Field label="Região e moeda" htmlFor="contract-region"><select id="contract-region" className="s8-field" value={region} onChange={(e) => setRegion(e.target.value as "eu" | "br")}><option value="eu">Europa — EUR</option><option value="br">Brasil — BRL</option></select></Field>
        <Field label="Encontrar um serviço" htmlFor="service-search"><input id="service-search" className="s8-field" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Ex.: carreira, site, marketing..." /></Field>
      </div>
    </section>

    <section><p className="text-xs font-extrabold uppercase tracking-[0.14em] text-primary">Atendimento</p><h2 className="mt-1 font-serif text-2xl">{t("contract.psychoanalysis")}</h2><ul className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{psicanalise.map((i) => <Card key={i.catalogKey} item={i} />)}</ul></section>
    <section><p className="text-xs font-extrabold uppercase tracking-[0.14em] text-primary">Mentoria e estratégia</p><h2 className="mt-1 font-serif text-2xl">{t("contract.mentorship")}</h2><ul className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{mentoria.map((i) => <Card key={i.catalogKey} item={i} />)}</ul></section>

    {grouped.map(([category, categoryItems]) => <section key={category} className="rounded-3xl border border-border/70 bg-card p-5 sm:p-6"><div className="mb-4"><p className="text-xs font-extrabold uppercase tracking-[0.14em] text-primary">Soluções LDR</p><h2 className="mt-1 font-serif text-2xl">{category}</h2></div><ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{categoryItems.map((i) => <Card key={i.catalogKey} item={i} />)}</ul></section>)}
  </div>;
}

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

const WHATSAPP = "https://wa.me/32492923605";
const MASSAGE_MESSAGE = `${WHATSAPP}?text=${encodeURIComponent("Olá! Vim pelo painel da LDR RH & Estratégia e gostaria de saber mais sobre a Massagem Laboral para minha empresa/equipe.")}`;
const WELLBEING_MESSAGE = `${WHATSAPP}?text=${encodeURIComponent("Olá! Vim pelo painel da LDR RH & Estratégia e gostaria de solicitar uma proposta para a Hora de Bem-Estar LDR.")}`;

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

function CorporateWellbeing() {
  return (
    <section className="rounded-3xl border border-primary/20 bg-card p-5 shadow-sm sm:p-6">
      <div className="grid gap-6 lg:grid-cols-[1.05fr_1.95fr] lg:items-stretch">
        <figure className="group overflow-hidden rounded-2xl border border-primary/25 bg-muted shadow-sm">
          <img src="/massagem-laboral-corporativa.webp" alt="Profissional realizando Massagem Laboral nos ombros de um colaborador vestido em um escritório moderno" width={1600} height={900} loading="lazy" decoding="async" className="h-full min-h-64 w-full object-cover object-center transition duration-500 group-hover:scale-[1.02]" />
          <figcaption className="sr-only">Massagem Laboral profissional em ambiente empresarial na Bélgica.</figcaption>
        </figure>
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-primary">Bem-estar corporativo</p>
          <h2 className="mt-1 font-serif text-2xl">Massagem Laboral e Hora de Bem-Estar LDR</h2>
          <div className="mt-3 inline-flex rounded-full bg-accent px-3 py-1.5 text-xs font-extrabold text-accent-foreground">🇧🇪 Disponível atualmente somente na Bélgica</div>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">A Massagem Laboral utiliza a mesma proposta de relaxamento e bem-estar da Massagem Relaxante, adaptada à rotina de empresas, equipes, colaboradores e eventos corporativos. Os atendimentos podem ser organizados de forma escalonada para não interromper toda a operação.</p>
          <div className="mt-5 grid gap-4 xl:grid-cols-2">
            <article className="relative rounded-2xl border-2 border-primary/30 bg-background p-4 shadow-sm">
              <span className="inline-flex rounded-full bg-accent px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-accent-foreground">Um dos serviços mais procurados</span>
              <h3 className="mt-3 font-serif text-lg">Massagem Laboral</h3>
              <p className="mt-2 text-sm text-muted-foreground">Escolha o tempo por colaborador:</p>
              <ul className="mt-3 grid gap-1.5 text-sm">
                <li><strong>10 min — €25</strong> por colaborador</li>
                <li><strong>15 min — €35</strong> por colaborador</li>
                <li><strong>20 min — €50</strong> por colaborador</li>
                <li><strong>30 min — €75</strong> por colaborador</li>
                <li><strong>até 40 min — €90</strong> por colaborador</li>
              </ul>
              <p className="mt-3 text-xs font-bold text-muted-foreground">Contratação mínima: €150 por ação/deslocamento.</p>
              <p className="mt-2 text-xs text-muted-foreground">O horário de almoço costuma ser uma ótima opção. Também pode ser organizado pela manhã, à tarde, no início/final do expediente ou em eventos corporativos.</p>
              <a className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[#25D366] px-4 py-3 text-sm font-extrabold text-[#063d20] shadow-sm transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" href={MASSAGE_MESSAGE} target="_blank" rel="noreferrer noopener">Solicitar orçamento no WhatsApp</a>
            </article>
            <article className="rounded-2xl border border-border/70 bg-background p-4">
              <h3 className="font-serif text-lg">Hora de Bem-Estar LDR</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Para empresas que preferem contratar um período completo de atendimento, com organização escalonada conforme a equipe.</p>
              <ul className="mt-3 grid gap-1.5 text-sm">
                <li><strong>2 horas</strong></li>
                <li><strong>4 horas</strong></li>
                <li><strong>Meio período</strong></li>
                <li><strong>Dia de Bem-Estar Corporativo</strong></li>
              </ul>
              <p className="mt-3 text-sm font-extrabold text-primary">Valor sob proposta</p>
              <p className="mt-2 text-xs text-muted-foreground">A proposta considera duração, número de colaboradores, cidade na Bélgica e formato da ação. Não há checkout automático nesta modalidade.</p>
              <a className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[#25D366] px-4 py-3 text-sm font-extrabold text-[#063d20] shadow-sm transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" href={WELLBEING_MESSAGE} target="_blank" rel="noreferrer noopener">Solicitar proposta no WhatsApp</a>
            </article>
          </div>
        </div>
      </div>
    </section>
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
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">Os serviços com checkout mantêm contratação direta e segura. As soluções de Bem-Estar Corporativo são organizadas pelo WhatsApp porque dependem de cidade, data, quantidade de colaboradores e disponibilidade.</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Field label="Região e moeda" htmlFor="contract-region"><select id="contract-region" className="s8-field" value={region} onChange={(e) => setRegion(e.target.value as "eu" | "br")}><option value="eu">Europa — EUR</option><option value="br">Brasil — BRL</option></select></Field>
        <Field label="Encontrar um serviço" htmlFor="service-search"><input id="service-search" className="s8-field" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Ex.: carreira, site, marketing..." /></Field>
      </div>
    </section>

    <CorporateWellbeing />

    <section><p className="text-xs font-extrabold uppercase tracking-[0.14em] text-primary">Atendimento</p><h2 className="mt-1 font-serif text-2xl">{t("contract.psychoanalysis")}</h2><ul className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{psicanalise.map((i) => <Card key={i.catalogKey} item={i} />)}</ul></section>
    <section><p className="text-xs font-extrabold uppercase tracking-[0.14em] text-primary">Mentoria e estratégia</p><h2 className="mt-1 font-serif text-2xl">{t("contract.mentorship")}</h2><ul className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{mentoria.map((i) => <Card key={i.catalogKey} item={i} />)}</ul></section>

    {grouped.map(([category, categoryItems]) => <section key={category} className="rounded-3xl border border-border/70 bg-card p-5 sm:p-6"><div className="mb-4"><p className="text-xs font-extrabold uppercase tracking-[0.14em] text-primary">Soluções LDR</p><h2 className="mt-1 font-serif text-2xl">{category}</h2></div><ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{categoryItems.map((i) => <Card key={i.catalogKey} item={i} />)}</ul></section>)}
  </div>;
}

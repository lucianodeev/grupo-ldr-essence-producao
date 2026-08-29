import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { Field, PageHeader } from "@/components/central/ui";
import { useClientContractCatalog } from "@/lib/client-portal-data";
import { formatMoney, safeUrl } from "@/lib/central";
import type { ContractItem } from "@/lib/contract-catalog";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_clientarea/cliente/contratar")({
  head: () => ({
    meta: [
      { title: "Contratar e agendar — Grupo LDR Essence" },
      {
        name: "description",
        content: "Escolha sessões, pacotes e serviços profissionais do Grupo LDR Essence.",
      },
      { property: "og:title", content: "Contratar e agendar — Grupo LDR Essence" },
      {
        property: "og:description",
        content: "Sessões, mentorias e serviços personalizados de carreira e estratégia.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ClientContract,
});

const WHATSAPP_URL =
  "https://wa.me/32492923605?text=Ol%C3%A1%2C%20vim%20pela%20%C3%81rea%20do%20Cliente%20e%20quero%20saber%20mais%20sobre%20um%20servi%C3%A7o.";

const PERSONALIZED_SERVICES = [
  {
    title: "Orientação profissional",
    description:
      "Clareza de objetivos, posicionamento profissional e próximos passos para decisões de carreira.",
    tag: "Carreira",
  },
  {
    title: "Transição de carreira",
    description:
      "Planejamento para mudar de área, função ou mercado com estratégia e organização do processo.",
    tag: "Transição",
  },
  {
    title: "Carreira internacional",
    description:
      "Orientação para profissionais e estudantes que querem estruturar uma trajetória profissional internacional.",
    tag: "Internacional",
  },
  {
    title: "Currículo e posicionamento profissional",
    description:
      "Revisão estratégica de currículo, apresentação profissional e direcionamento para novas oportunidades.",
    tag: "Posicionamento",
  },
  {
    title: "Planejamento de carreira",
    description:
      "Construção de um plano prático com metas, prioridades, competências e próximos movimentos profissionais.",
    tag: "Planejamento",
  },
  {
    title: "Consultoria para empreendedores",
    description:
      "Análise de negócio, organização de ideias, posicionamento, estratégia comercial e próximos passos.",
    tag: "Negócios",
  },
  {
    title: "Consultoria de RH para empresas",
    description:
      "Apoio em recrutamento, seleção, estruturação de processos e decisões relacionadas a pessoas.",
    tag: "Empresas",
  },
  {
    title: "Diagnóstico de presença digital",
    description:
      "Leitura estratégica da presença online para identificar oportunidades de comunicação, posicionamento e vendas.",
    tag: "Estratégia",
  },
];

function payLink(item: ContractItem): string | null {
  const url = safeUrl(item.paymentUrl);
  return url;
}

function ClientContract() {
  const { t } = useI18n();
  const catalog = useClientContractCatalog();
  const [region, setRegion] = useState<"eu" | "br">("eu");

  const items = catalog.data?.items ?? [];
  const psicanalise = items.filter((i) => i.group === "psicanalise");
  const mentoria = items.filter((i) => i.group === "mentoria");

  const psicByRegion = (r: "eu" | "br") => psicanalise.filter((i) => i.region === r);

  if (catalog.isLoading)
    return <p className="text-sm text-muted-foreground">{t("state.loading")}</p>;

  const Card = ({ item }: { item: ContractItem }) => {
    const link = payLink(item);
    return (
      <li className="group rounded-2xl border border-border/70 bg-background p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-serif text-lg leading-snug">{item.name}</h3>
            <p className="mt-1 text-sm font-bold text-primary">
              {item.sessions} {item.sessions === 1 ? t("contract.session") : t("contract.sessions")}
            </p>
            {item.originalCents !== null && (
              <span className="mt-2 inline-flex rounded-full bg-accent px-2.5 py-1 text-xs font-bold text-accent-foreground">
                {t("contract.discount")}
              </span>
            )}
          </div>
          <div className="shrink-0 text-right">
            {item.originalCents ? (
              <>
                <p className="text-sm text-muted-foreground line-through">
                  {formatMoney(item.originalCents, item.currency)}
                </p>
                <p className="text-xl font-extrabold text-primary">
                  {formatMoney(item.amountCents, item.currency)}
                </p>
              </>
            ) : (
              <p className="text-xl font-extrabold text-primary">
                {formatMoney(item.amountCents, item.currency)}
              </p>
            )}
          </div>
        </div>

        {link ? (
          <a
            className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-sm transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            href={link}
            target="_blank"
            rel="noreferrer noopener"
          >
            {t("contract.buy")}
          </a>
        ) : (
          <p className="mt-3 text-xs text-muted-foreground">{t("contract.unavailable")}</p>
        )}
      </li>
    );
  };

  return (
    <div className="grid gap-8">
      <PageHeader title={t("contract.title")} subtitle={t("contract.subtitle")} />

      <section className="rounded-2xl border border-primary/10 bg-gradient-to-br from-card to-accent/20 p-5 shadow-sm">
        <div className="mb-4">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">
            Simples e seguro
          </p>
          <h2 className="mt-1 font-serif text-xl">Escolha o serviço no seu ritmo</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Nos serviços com pagamento online, você compra primeiro e agenda depois. Nos serviços personalizados, fale conosco para receber a orientação adequada antes de contratar.
          </p>
        </div>
        <ol className="grid gap-3 text-sm sm:grid-cols-2">
          <li className="flex items-start gap-3 rounded-xl bg-background/80 p-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              1
            </span>
            <span>{t("contract.step1")}</span>
          </li>
          <li className="flex items-start gap-3 rounded-xl bg-background/80 p-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              2
            </span>
            <span>{t("contract.step2")}</span>
          </li>
        </ol>
        <p className="mt-3 text-xs text-muted-foreground">{t("contract.afterPayment")}</p>
        <button
          type="button"
          onClick={() => catalog.refetch()}
          disabled={catalog.isRefetching}
          className="mt-3 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-bold transition hover:border-primary/30 hover:bg-accent disabled:opacity-60"
        >
          {t("contract.refresh")}
        </button>
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-primary">Atendimento</p>
            <h2 className="mt-1 font-serif text-2xl">{t("contract.psychoanalysis")}</h2>
          </div>
          <Field label={t("contract.region")} htmlFor="contract-region">
            <select
              id="contract-region"
              className="s8-field"
              value={region}
              onChange={(e) => setRegion(e.target.value as "eu" | "br")}
            >
              <option value="eu">Europa — EUR</option>
              <option value="br">Brasil — BRL</option>
            </select>
          </Field>
        </div>
        <ul className="grid gap-4 sm:grid-cols-3">
          {psicByRegion(region).map((i) => (
            <Card key={i.catalogKey} item={i} />
          ))}
        </ul>
      </section>

      <section>
        <div className="mb-4">
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-primary">Desenvolvimento</p>
          <h2 className="mt-1 font-serif text-2xl">{t("contract.mentorship")}</h2>
        </div>
        <ul className="grid gap-4 sm:grid-cols-3">
          {mentoria.map((i) => (
            <Card key={i.catalogKey} item={i} />
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6">
        <div className="max-w-3xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-primary">
            Carreira, negócios e RH
          </p>
          <h2 className="mt-1 font-serif text-2xl sm:text-3xl">Outros serviços personalizados</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Alguns serviços precisam de uma conversa rápida para entender objetivo, país, momento profissional ou necessidade da empresa. Por isso, eles aparecem separados dos checkouts automáticos.
          </p>
        </div>

        <ul className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {PERSONALIZED_SERVICES.map((service) => (
            <li
              key={service.title}
              className="flex h-full flex-col rounded-2xl border border-border/70 bg-background p-5 transition duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
            >
              <span className="w-fit rounded-full bg-accent px-2.5 py-1 text-xs font-bold text-accent-foreground">
                {service.tag}
              </span>
              <h3 className="mt-3 font-serif text-xl leading-tight">{service.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                {service.description}
              </p>
              <a
                href={`${WHATSAPP_URL}%20Tenho%20interesse%20em%3A%20${encodeURIComponent(service.title)}`}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl border border-primary/25 bg-primary/5 px-4 py-2.5 text-sm font-extrabold text-primary transition hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Quero saber mais
              </a>
            </li>
          ))}
        </ul>

        <div className="mt-5 rounded-2xl bg-primary p-5 text-primary-foreground sm:flex sm:items-center sm:justify-between sm:gap-6">
          <div>
            <h3 className="font-serif text-xl">Não encontrou exatamente o que procura?</h3>
            <p className="mt-1 text-sm text-primary-foreground/80">
              Conte sua necessidade e direcionamos você para o serviço mais adequado, sem obrigação de contratar.
            </p>
          </div>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-4 inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-background px-5 py-2.5 text-sm font-extrabold text-foreground shadow-sm transition hover:opacity-90 sm:mt-0"
          >
            Falar no WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
}

import { Link, createFileRoute } from "@tanstack/react-router";
import { CommercialProposalForm } from "@/components/commercial-proposal-form";
import { commerceAction, LdrCommercePage } from "@/components/ldr-commerce-page";
import { PROFESSIONAL_OFFERS } from "@/lib/ldr-professional-offers";
import {
  publicMentorshipPackages,
  type MentorshipPackage,
} from "@/lib/ldr-professional-offers.functions";

export const Route = createFileRoute("/servicos-profissionais")({
  validateSearch: (
    search: Record<string, unknown>,
  ): { pacote?: (typeof PROFESSIONAL_OFFERS)[number]["id"] } => {
    const offer = PROFESSIONAL_OFFERS.find((candidate) => candidate.id === search["pacote"]);
    return offer ? { pacote: offer.id } : {};
  },
  loader: () => publicMentorshipPackages(),
  head: () => ({
    meta: [
      { title: "Serviços profissionais | Ecossistema LDR" },
      {
        name: "description",
        content:
          "Integração de colaboradores, recrutamento, consultoria de RH, formação empresarial e mentoria profissional.",
      },
    ],
  }),
  component: Services,
});

function Services() {
  const { pacote } = Route.useSearch();
  const packages: MentorshipPackage[] = Route.useLoaderData();
  const selected =
    PROFESSIONAL_OFFERS.find((offer) => offer.id === pacote) ?? PROFESSIONAL_OFFERS[0];
  return (
    <LdrCommercePage
      section="servicos"
      title="Serviços profissionais LDR"
      intro="Contrate mentoria ou peça uma proposta para organizar a integração, o recrutamento, os processos de RH e a formação da sua equipa."
    >
      <section aria-labelledby="servicos-equipa">
        <h2 className="font-serif text-3xl sm:text-4xl" id="servicos-equipa">
          Serviços para empresas
        </h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {PROFESSIONAL_OFFERS.map((offer) => (
            <article
              className="flex flex-col rounded-2xl border border-[#cfd7cd] bg-white p-6"
              key={offer.id}
            >
              <h3 className="font-serif text-2xl">{offer.solution}</h3>
              <p className="mt-3 leading-7">{offer.description}</p>
              <p className="mt-3 text-sm leading-6">{offer.scope}</p>
              <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-5">
                <p className="text-sm font-semibold">Preço sob proposta</p>
                <Link
                  className={commerceAction}
                  to="/servicos-profissionais"
                  search={{ pacote: offer.id }}
                  hash="pedido-de-proposta"
                >
                  Pedir proposta<span className="sr-only"> de {offer.solution}</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section
        aria-labelledby="pacotes-mentoria"
        className="mt-10 rounded-2xl border border-[#cfd7cd] bg-[#e5ece3] p-6"
      >
        <h2 className="font-serif text-3xl" id="pacotes-mentoria">
          Mentoria profissional
        </h2>
        <p className="mt-3 max-w-2xl leading-7">
          Sessão individual ou pacote de acompanhamento para discutir decisões de carreira e
          organizar os próximos passos. As sessões são marcadas pela Minha Área após confirmação do
          pagamento.
        </p>
        {packages.length > 0 && (
          <ul className="mt-4 grid gap-3 sm:grid-cols-3">
            {packages.map((item) => (
              <li className="rounded-lg bg-white p-4" key={item.key}>
                <h3 className="font-semibold">{item.name}</h3>
                <p className="mt-1 text-sm">
                  {item.sessions === 1 ? "1 sessão" : `${item.sessions} sessões`}
                </p>
                <p className="mt-2 font-bold">
                  {new Intl.NumberFormat(item.currency === "BRL" ? "pt-BR" : "pt-PT", {
                    style: "currency",
                    currency: item.currency,
                  }).format(item.cents / 100)}
                </p>
              </li>
            ))}
          </ul>
        )}
        <a href="/cliente/contratar" className={`mt-5 ${commerceAction}`}>
          Consultar pacotes na Minha Área
        </a>
      </section>
      <section
        className="mt-12 scroll-mt-5"
        id="pedido-de-proposta"
        aria-labelledby="briefing-heading"
      >
        <h2 id="briefing-heading" className="mb-5 font-serif text-3xl sm:text-4xl">
          Pedir uma proposta
        </h2>
        <div className="grid items-start gap-6 lg:grid-cols-[2fr_1fr]">
          <CommercialProposalForm
            key={selected.id}
            solution={selected.solution}
            source="servicos-profissionais"
            briefingHint={selected.briefing}
          />
          <aside className="rounded-2xl border border-[#cfd7cd] p-6">
            <h3 className="font-serif text-2xl">Como contratar</h3>
            <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-6">
              <li>Envie o briefing para a equipa comercial.</li>
              <li>Consulte o âmbito, prazo e preço na Minha Área com o e-mail do pedido.</li>
              <li>Aceite a proposta e siga para pagamento no Stripe.</li>
              <li>Acompanhe o pedido e, quando aplicável, solicite os horários disponíveis.</li>
            </ol>
            <a
              href="/cliente/propostas"
              className="mt-5 inline-block font-semibold underline underline-offset-4"
            >
              Acompanhar minhas propostas
            </a>
          </aside>
        </div>
      </section>
    </LdrCommercePage>
  );
}

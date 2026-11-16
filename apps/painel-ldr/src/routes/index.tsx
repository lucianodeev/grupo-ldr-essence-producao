import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { AcademyUniversityHome } from "@/components/academy-university-home";
import { AcademyEcosystemSection } from "@/components/academy-ecosystem-section";
import { AcademyInstitutionalIntro } from "@/components/academy-institutional-intro";
import { EcosystemServiceShowcase } from "@/components/ecosystem-service-showcase";

// Desktop home actions intentionally compact; LDR ONE is the current digital subscription.
type HomeSearch = { area?: "academy" | "business" };
export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): HomeSearch => search["area"] === "academy" ? { area: "academy" } : search["area"] === "business" ? { area: "business" } : {},
  head: ({ match }) => ({
    meta: [
      { title: match.search.area === "academy" ? "LDR Academy | Conhecimento, Educação e Comunidade Acadêmica" : "Ecossistema LDR | Consultoria, Pessoas e Tecnologia" },
      { name: "description", content: match.search.area === "academy" ? "Conhecimento, educação, biblioteca, comunidade acadêmica, cursos, formações e desenvolvimento profissional conectados no ecossistema LDR Academy." : "Consultoria estratégica, recursos humanos, tecnologia, IA, formação, mentoria e bem-estar para desenvolver pessoas e empresas." },
      { property: "og:title", content: match.search.area === "academy" ? "LDR Academy | Conhecimento que conecta" : "Ecossistema LDR | Consultoria, Pessoas e Tecnologia" },
      { property: "og:description", content: "Um ecossistema acadêmico para aprender, compartilhar conhecimento, desenvolver competências e construir novas oportunidades." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PublicHome,
});

function PublicHome() {
  const { area } = Route.useSearch();
  useEffect(() => {
    if (typeof window !== "undefined" && /^portal\.ldrrhestrategia\.com$/i.test(window.location.hostname)) {
      window.location.replace("/cliente/login");
    }
  }, []);

  return <>
    <section className="bg-[#071426] px-5 py-8 text-white">
      <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-[1fr_auto_auto] md:items-center">
        <div>
          <p className="text-xs font-black uppercase tracking-[.2em] text-[#f4c76b]">Ecossistema LDR</p>
          <h2 className="mt-2 font-serif text-2xl font-bold text-white!">Acesse o mapa central e o LDR PASS.</h2>
          <p className="mt-1 text-sm text-white/70">A Academy agora referencia as entradas principais: Biblioteca, Rede Acadêmica, LDR PASS, Clínica Social, LDR RH & Estratégia e Human Room.</p>
        </div>
        <Link to="/ecossistema" className="inline-flex w-auto items-center justify-center rounded-full bg-[#f4c76b] px-4 py-2 text-center text-[11px] font-black uppercase tracking-[.10em] text-[#1f1303]">Mapa do ecossistema</Link>
        <Link to="/ldr-pass" className="inline-flex w-auto items-center justify-center rounded-full border border-white/20 px-4 py-2 text-center text-[11px] font-black uppercase tracking-[.10em] text-white hover:bg-white/10">LDR PASS</Link>
      </div>
    </section>
    {area !== "academy" && <section aria-labelledby="ldr-business-title" className="bg-[#0b1f3a] px-5 py-12 text-white">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-[#f4c76b]">LDR RH & Estratégia · Soluções empresariais</p>
        <h1 id="ldr-business-title" className="mt-3 max-w-3xl font-serif text-3xl font-bold leading-tight text-white! md:text-5xl">Consultoria, tecnologia e pessoas para desenvolver o seu negócio.</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-white/80 md:text-base">Conheça as soluções empresariais e solicite uma proposta adequada às necessidades da sua organização.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/empresas/proposta" className="rounded-full bg-[#f4c76b] px-6 py-3 text-sm font-bold text-[#1f1303]">Solicitar proposta empresarial</Link>
          <Link to="/ecossistema" className="rounded-full border border-white/30 px-6 py-3 text-sm font-bold text-white">Conhecer o ecossistema</Link>
          <Link to="/empresas/integracao-colaboradores" className="rounded-full border border-white/30 px-6 py-3 text-sm font-bold text-white">Integração de novos colaboradores</Link>
        </div>
        <h2 className="mt-10 text-xl font-bold text-white!">Serviços para empresas</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {([
            ["Consultoria estratégica", "Diagnóstico, processos e planeamento empresarial."],
            ["Consultoria de recursos humanos", "Recrutamento, integração e desenvolvimento de talentos."],
            ["Tecnologia, IA e automação", "Soluções digitais e automatização de processos."],
            ["Formação empresarial", "Capacitação e desenvolvimento de equipas."],
            ["Mentoria profissional", "Acompanhamento de profissionais e empreendedores."],
            ["Bem-estar organizacional", "Iniciativas de desenvolvimento humano no trabalho."],
          ] as const).map(([name, description]) => (
            <article key={name} className="rounded-2xl border border-white/15 bg-white/5 p-5">
              <h3 className="font-bold text-white!">{name}</h3>
              <p className="mt-2 text-sm text-white/75">{description}</p>
              <Link to="/empresas/proposta" search={{ solution: name }} className="mt-4 inline-flex min-h-11 items-center text-sm font-bold text-[#f4c76b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">Solicitar proposta →</Link>
            </article>
          ))}
        </div>
        <p className="mt-5 text-xs text-white/70">O pedido de proposta não gera cobrança. Para serviços com orçamento personalizado, o preço é confirmado antes do pagamento; agendamento de serviços pagos somente após confirmação do Stripe. O cliente acompanha a proposta e o pedido na Minha Área.</p>
      </div>
    </section>}
    <AcademyInstitutionalIntro />
    <EcosystemServiceShowcase compact />
    <AcademyEcosystemSection />
    <div className="academy-integrated-legacy">
      <AcademyUniversityHome />
    </div>
    <style>{`
      /* The institutional experience is now the single public introduction.
         Keep the mature catalogue functionality, but remove duplicated legacy promo surfaces. */
      .academy-integrated-legacy > main > section:first-child {
        display: none;
      }
      .academy-integrated-legacy > main > section:nth-of-type(3) {
        display: none;
      }
      .academy-integrated-legacy > main > section:nth-of-type(2) {
        border-top: 1px solid rgb(214 173 99 / 0.2);
      }
    `}</style>
  </>;
}

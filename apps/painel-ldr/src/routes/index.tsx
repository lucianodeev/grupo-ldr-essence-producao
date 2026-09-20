import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { AcademyUniversityHome } from "@/components/academy-university-home";
import { AcademyEcosystemSection } from "@/components/academy-ecosystem-section";
import { AcademyInstitutionalIntro } from "@/components/academy-institutional-intro";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LDR Academy | Conhecimento, Educação e Comunidade Acadêmica" },
      { name: "description", content: "Conhecimento, educação, biblioteca, comunidade acadêmica, cursos, formações e desenvolvimento profissional conectados no ecossistema LDR Academy." },
      { property: "og:title", content: "LDR Academy | Conhecimento que conecta" },
      { property: "og:description", content: "Um ecossistema acadêmico para aprender, compartilhar conhecimento, desenvolver competências e construir novas oportunidades." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PublicHome,
});

function PublicHome() {
  useEffect(() => {
    if (typeof window !== "undefined" && /^portal\.ldrrhestrategia\.com$/i.test(window.location.hostname)) {
      window.location.replace("/cliente/login");
    }
  }, []);

  return <>
    <AcademyInstitutionalIntro />
    <section className="bg-[#071426] px-5 py-8 text-white">
      <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-[1fr_auto_auto] md:items-center">
        <div>
          <p className="text-xs font-black uppercase tracking-[.2em] text-[#f4c76b]">Ecossistema LDR</p>
          <h2 className="mt-2 font-serif text-2xl font-bold">Acesse o mapa central e o LDR PASS.</h2>
          <p className="mt-1 text-sm text-white/70">A Academy agora referencia as entradas principais: Biblioteca, Rede Acadêmica, LDR PASS, Clínica Social, LDR RH & Estratégia e Human Room.</p>
        </div>
        <Link to="/ecossistema" className="rounded-full bg-[#f4c76b] px-5 py-3 text-center text-xs font-black uppercase tracking-[.14em] text-[#1f1303]">Mapa do ecossistema</Link>
        <Link to="/ldr-pass" className="rounded-full border border-white/20 px-5 py-3 text-center text-xs font-black uppercase tracking-[.14em] text-white hover:bg-white/10">LDR PASS</Link>
      </div>
    </section>
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

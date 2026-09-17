import { createFileRoute } from "@tanstack/react-router";
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

import { createFileRoute } from "@tanstack/react-router";

import { SiteHeader } from "@/components/site-header";

export const Route = createFileRoute("/formulario")({
  head: () => ({
    meta: [
      { title: "Formulário de interesse — Sistema S8 | Grupo LDR Essence" },
      {
        name: "description",
        content:
          "Página de contato para quem deseja participar da mentoria Sistema S8 da Grupo LDR Essence.",
      },
      { property: "og:title", content: "Formulário de interesse — Sistema S8" },
      {
        property: "og:description",
        content: "Manifeste interesse na mentoria Sistema S8 da Grupo LDR Essence.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Formulario,
});

function Formulario() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <section className="s8-card">
          <h1 className="font-serif text-3xl">Formulário de interesse</h1>
          <div className="s8-notice mt-4 text-sm">
            Esta página é um espaço público reservado. O formulário de captação ainda não está
            publicado — nenhum dado é coletado ou armazenado aqui.
          </div>
          <p className="mt-4 text-sm">
            Para participar da mentoria Sistema S8, fale diretamente com a equipe da LDR RH &amp;
            Estratégia. Os registros das sessões são feitos exclusivamente pelo profissional
            responsável, dentro do painel protegido.
          </p>
          <a
            href="https://wa.me/32492923605?text=Ol%C3%A1%2C%20tenho%20interesse%20na%20mentoria%20Sistema%20S8"
            target="_blank"
            rel="noreferrer noopener external"
            className="mt-6 inline-flex rounded-lg bg-primary px-5 py-3 text-sm font-bold text-primary-foreground hover:opacity-90"
          >
            Falar com a equipe no WhatsApp
          </a>
        </section>
      </main>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/film")({
  head: () => ({
    meta: [
      { title: "Luciano Conecta Film | Projeto audiovisual" },
      {
        name: "description",
        content:
          "Página oficial de captação e apresentação do projeto audiovisual Luciano Conecta Film para produtoras, parceiros e investidores culturais.",
      },
      { property: "og:title", content: "Luciano Conecta Film" },
      {
        property: "og:description",
        content:
          "Uma história sobre coragem, reconstrução e transformação em formato audiovisual.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://film.lucianoconecta.online" }],
  }),
  component: FilmLandingPage,
});

const WHATSAPP_URL = "https://wa.me/32492923605";
const MAIL_URL = "mailto:llucianouam@gmail.com?subject=Projeto%20Luciano%20Conecta%20Film";

function FilmLandingPage() {
  return (
    <main className="min-h-screen bg-[#080b16] text-white">
      <section className="relative overflow-hidden px-6 py-20 sm:px-10 lg:px-16">
        <div className="absolute inset-0 opacity-40" aria-hidden="true">
          <div className="absolute left-[-10%] top-[-20%] h-96 w-96 rounded-full bg-[#d6ad63] blur-3xl" />
          <div className="absolute bottom-[-25%] right-[-10%] h-[32rem] w-[32rem] rounded-full bg-[#2d5bff] blur-3xl" />
        </div>

        <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
          <div>
            <p className="mb-5 inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-[#f5dfad] backdrop-blur">
              Luciano Conecta Film · captação audiovisual
            </p>
            <h1 className="max-w-4xl text-4xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
              Uma história real sobre começar quando quase ninguém acreditava.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/75 sm:text-xl">
              Projeto em desenvolvimento para produtoras, parceiros culturais e
              possíveis investidores interessados em uma narrativa humana sobre
              travessia, coragem, reconstrução, empreendedorismo e pertencimento.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a
                href={WHATSAPP_URL}
                className="rounded-full bg-[#d6ad63] px-7 py-4 text-center text-sm font-bold uppercase tracking-[0.2em] text-[#080b16] transition hover:scale-[1.02]"
              >
                Falar pelo WhatsApp
              </a>
              <a
                href={MAIL_URL}
                className="rounded-full border border-white/20 px-7 py-4 text-center text-sm font-bold uppercase tracking-[0.2em] text-white transition hover:bg-white/10"
              >
                Solicitar apresentação
              </a>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl backdrop-blur">
            <div className="aspect-[4/5] rounded-[1.5rem] border border-white/10 bg-[radial-gradient(circle_at_30%_20%,rgba(214,173,99,.45),transparent_28%),linear-gradient(145deg,rgba(255,255,255,.14),rgba(255,255,255,.03))] p-8">
              <div className="flex h-full flex-col justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-[#f5dfad]">Projeto</p>
                  <h2 className="mt-4 text-4xl font-semibold">Da origem ao primeiro sim</h2>
                </div>
                <p className="text-lg leading-8 text-white/78">
                  Um filme sobre a força de transformar dor em direção, silêncio em voz
                  e uma ideia pequena em uma possibilidade maior que o próprio medo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.03] px-6 py-14 sm:px-10 lg:px-16">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-3">
          {[
            ["Formato", "Longa, série documental ou docuficção, conforme análise da produtora."],
            ["Busca", "Produtoras, coprodutores, investidores culturais e parceiros de desenvolvimento."],
            ["Tom", "Emocional, elegante, humano e internacional, sem perder a raiz brasileira."],
          ].map(([title, text]) => (
            <article key={title} className="rounded-3xl border border-white/10 bg-white/[0.05] p-6">
              <h3 className="text-xl font-semibold text-[#f5dfad]">{title}</h3>
              <p className="mt-3 leading-7 text-white/72">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="px-6 py-20 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#d6ad63]">Sinopse base</p>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-5xl">
            A jornada de alguém que decide construir caminho quando a resposta ainda não existe.
          </h2>
          <p className="mt-6 text-lg leading-8 text-white/72">
            A narrativa acompanha uma travessia marcada por origem, deslocamento,
            trabalho, tentativas, quedas, reconstruções e a decisão de transformar uma
            experiência pessoal em um produto, uma marca e uma ponte para outras pessoas.
            O projeto nasce para tocar públicos que conhecem o peso de começar do zero
            e a potência de continuar mesmo sem garantias.
          </p>
        </div>
      </section>
    </main>
  );
}

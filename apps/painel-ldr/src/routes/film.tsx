import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/film")({
  head: () => ({
    meta: [
      { title: "Luciano Conecta Film | Projeto audiovisual" },
      {
        name: "description",
        content:
          "Landing page oficial de captação do projeto audiovisual Luciano Conecta Film para produtoras, coprodutores, parceiros culturais e investidores.",
      },
      { property: "og:title", content: "Luciano Conecta Film | Projeto audiovisual" },
      {
        property: "og:description",
        content:
          "Uma história sobre origem, travessia, coragem, reconstrução e a busca pelo primeiro sim.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://film.lucianoconecta.online" }],
  }),
  component: FilmLandingPage,
});

const SUPPORT_URL = "https://suporte.ldrrhestrategia.com/falar-com-ecossistema";
const MAIL_URL = "mailto:llucianouam@gmail.com?subject=Projeto%20Luciano%20Conecta%20Film&body=Ol%C3%A1%2C%20Luciano.%20Tenho%20interesse%20em%20receber%20a%20apresenta%C3%A7%C3%A3o%20do%20projeto%20audiovisual.";

const formats = [
  {
    title: "Longa-metragem",
    text: "Uma narrativa dramática e inspiradora sobre origem, deslocamento, empreendedorismo e reconstrução pessoal.",
  },
  {
    title: "Série documental",
    text: "Episódios conectando memória, bastidores reais, criação de produto, vendas, reuniões e travessia internacional.",
  },
  {
    title: "Docuficção",
    text: "Uma abordagem híbrida, elegante e emocional, com força estética para cinema, streaming e festivais.",
  },
];

const audience = [
  "Pessoas que começaram do zero e buscam se reconhecer em uma história possível.",
  "Empreendedores, estudantes, imigrantes e profissionais em reconstrução.",
  "Produtoras que procuram narrativas humanas com apelo social, emocional e internacional.",
];

const materials = [
  "Logline e sinopse curta",
  "Sinopse expandida",
  "Universo narrativo",
  "Perfil de público",
  "Possíveis formatos",
  "Caminhos de coprodução",
];

const languages = [
  {
    label: "PT",
    title: "Uma história sobre começar quando quase ninguém acreditava.",
    text: "Projeto audiovisual em desenvolvimento para produtoras, parceiros culturais e possíveis investidores interessados em uma narrativa humana sobre coragem, origem, reconstrução e pertencimento.",
  },
  {
    label: "EN",
    title: "A story about beginning when almost no one believed yet.",
    text: "An audiovisual project in development for production companies, cultural partners and potential investors interested in a human story about courage, roots, rebuilding and belonging.",
  },
  {
    label: "FR",
    title: "Une histoire sur le fait de commencer quand presque personne n’y croyait encore.",
    text: "Un projet audiovisuel en développement pour sociétés de production, partenaires culturels et investisseurs intéressés par une histoire humaine de courage, d’origine, de reconstruction et d’appartenance.",
  },
  {
    label: "ES",
    title: "Una historia sobre empezar cuando casi nadie creía todavía.",
    text: "Un proyecto audiovisual en desarrollo para productoras, socios culturales e inversores interesados en una historia humana sobre coraje, origen, reconstrucción y pertenencia.",
  },
];

function FilmLandingPage() {
  return (
    <main className="min-h-screen bg-[#070914] text-white">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#070914]/88 px-6 py-4 backdrop-blur-xl sm:px-10 lg:px-16">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <a href="#top" className="text-sm font-black uppercase tracking-[0.34em] text-[#f5dfad]">
            Luciano Conecta Film
          </a>
          <nav className="hidden items-center gap-6 text-xs font-bold uppercase tracking-[0.22em] text-white/64 md:flex">
            <a className="transition hover:text-white" href="#projeto">Projeto</a>
            <a className="transition hover:text-white" href="#produtoras">Produtoras</a>
            <a className="transition hover:text-white" href="#contato">Contato</a>
          </nav>
          <a
            href={SUPPORT_URL}
            className="rounded-full bg-[#d6ad63] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#070914] transition hover:scale-[1.02]"
          >
            Falar com o Ecossistema
          </a>
        </div>
      </header>

      <section id="top" className="relative overflow-hidden px-6 py-20 sm:px-10 sm:py-24 lg:px-16 lg:py-28">
        <div className="absolute inset-0 opacity-50" aria-hidden="true">
          <div className="absolute left-[-12%] top-[-18%] h-[30rem] w-[30rem] rounded-full bg-[#d6ad63] blur-3xl" />
          <div className="absolute bottom-[-28%] right-[-12%] h-[38rem] w-[38rem] rounded-full bg-[#2457ff] blur-3xl" />
          <div className="absolute left-[30%] top-[20%] h-72 w-72 rounded-full bg-[#7a2cff] opacity-35 blur-3xl" />
        </div>

        <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
          <div>
            <p className="mb-5 inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-[#f5dfad] shadow-2xl backdrop-blur">
              Página oficial de captação · projeto audiovisual
            </p>
            <h1 className="max-w-5xl text-4xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
              Da origem ao primeiro sim.
            </h1>
            <p className="mt-7 max-w-2xl text-xl leading-9 text-white/78">
              Uma história sobre atravessar a escassez, transformar silêncio em direção
              e construir uma possibilidade quando quase ninguém ainda conseguia enxergar.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a
                href={SUPPORT_URL}
                className="rounded-full bg-[#d6ad63] px-7 py-4 text-center text-sm font-black uppercase tracking-[0.2em] text-[#070914] shadow-2xl transition hover:scale-[1.02]"
              >
                Falar com o projeto
              </a>
              <a
                href={MAIL_URL}
                className="rounded-full border border-white/20 px-7 py-4 text-center text-sm font-black uppercase tracking-[0.2em] text-white transition hover:bg-white/10"
              >
                Solicitar apresentação
              </a>
            </div>
            <p className="mt-5 text-sm leading-7 text-white/52">
              Para produtoras, coprodutores, parceiros culturais, investidores e curadores interessados em desenvolver uma narrativa humana, brasileira e internacional.
            </p>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-4 shadow-2xl backdrop-blur sm:p-6">
            <div className="aspect-[4/5] rounded-[1.5rem] border border-white/10 bg-[radial-gradient(circle_at_30%_20%,rgba(214,173,99,.45),transparent_30%),linear-gradient(145deg,rgba(255,255,255,.16),rgba(255,255,255,.03))] p-7 sm:p-8">
              <div className="flex h-full flex-col justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-[#f5dfad]">Logline</p>
                  <h2 className="mt-5 text-3xl font-semibold leading-tight sm:text-5xl">
                    Quando o primeiro contrato vira mais do que uma venda.
                  </h2>
                </div>
                <p className="text-lg leading-8 text-white/80">
                  Ele vira prova de existência, travessia emocional e início de uma nova identidade.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="projeto" className="border-y border-white/10 bg-white/[0.03] px-6 py-14 sm:px-10 lg:px-16">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-3">
          <InfoCard title="Essência" text="Coragem, origem, reconstrução, trabalho, pertencimento e a necessidade humana de ser reconhecido." />
          <InfoCard title="Território" text="Brasil, Europa, bastidores de criação, reuniões, divulgação, recusas, tentativas e o instante do primeiro sim." />
          <InfoCard title="Tom" text="Cinematográfico, emocional, elegante e íntimo, sem perder a potência popular de uma história real." />
        </div>
      </section>

      <section className="px-6 py-20 sm:px-10 lg:px-16">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.35em] text-[#d6ad63]">Sinopse</p>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-5xl">
              A jornada de alguém que decide construir caminho quando a resposta ainda não existe.
            </h2>
          </div>
          <div className="space-y-6 text-lg leading-9 text-white/72">
            <p>
              A narrativa acompanha uma travessia marcada por origem, deslocamento,
              trabalho, tentativas, quedas, reconstruções e a decisão de transformar
              uma experiência pessoal em produto, marca e ponte para outras pessoas.
            </p>
            <p>
              No centro da história está o processo de criar algo do zero: divulgar,
              errar, insistir, lidar com silêncio, preparar reuniões, sustentar a própria
              voz e buscar o primeiro contrato como símbolo de pertencimento e virada.
            </p>
            <p>
              O projeto nasce para tocar públicos que conhecem o peso de começar sem
              garantias e a potência de continuar mesmo quando a vida ainda parece não
              oferecer nenhuma confirmação.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#0d1020] px-6 py-20 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.35em] text-[#d6ad63]">Formatos possíveis</p>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-5xl">
              Aberto para desenvolvimento com a produtora certa.
            </h2>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {formats.map((item) => (
              <InfoCard key={item.title} title={item.title} text={item.text} />
            ))}
          </div>
        </div>
      </section>

      <section id="produtoras" className="px-6 py-20 sm:px-10 lg:px-16">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-8 sm:p-10">
            <p className="text-sm font-black uppercase tracking-[0.35em] text-[#d6ad63]">Para produtoras</p>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-5xl">
              O que buscamos agora
            </h2>
            <ul className="mt-8 space-y-4 text-lg leading-8 text-white/72">
              <li>• Produtora para avaliar linguagem, formato e potencial comercial.</li>
              <li>• Parceiros para desenvolvimento de bíblia, argumento e apresentação.</li>
              <li>• Coprodução ou mentoria criativa para transformar a história em projeto audiovisual estruturado.</li>
              <li>• Conversas com curadores, roteiristas, diretores e agentes culturais.</li>
            </ul>
          </div>

          <div className="rounded-[2rem] border border-[#d6ad63]/30 bg-[#d6ad63]/10 p-8 sm:p-10">
            <p className="text-sm font-black uppercase tracking-[0.35em] text-[#f5dfad]">Material disponível</p>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-5xl">
              Pacote de apresentação
            </h2>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {materials.map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white/78">
                  {item}
                </div>
              ))}
            </div>
            <a
              href={MAIL_URL}
              className="mt-8 inline-flex rounded-full bg-white px-6 py-4 text-sm font-black uppercase tracking-[0.2em] text-[#070914] transition hover:scale-[1.02]"
            >
              Pedir material completo
            </a>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.03] px-6 py-20 sm:px-10 lg:px-16">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.35em] text-[#d6ad63]">Público</p>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-5xl">
              Uma história íntima com leitura universal.
            </h2>
          </div>
          <div className="grid gap-4">
            {audience.map((item) => (
              <div key={item} className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 text-lg leading-8 text-white/74">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.35em] text-[#d6ad63]">Internacional</p>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-5xl">
              Mensagem preparada para quatro idiomas.
            </h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {languages.map((item) => (
              <article key={item.label} className="rounded-3xl border border-white/10 bg-white/[0.05] p-6">
                <p className="text-sm font-black text-[#d6ad63]">{item.label}</p>
                <h3 className="mt-4 text-xl font-semibold leading-7">{item.title}</h3>
                <p className="mt-4 leading-7 text-white/68">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="contato" className="px-6 pb-24 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-[#d6ad63]/30 bg-[linear-gradient(135deg,rgba(214,173,99,.18),rgba(255,255,255,.04))] p-8 shadow-2xl sm:p-12 lg:p-16">
          <div className="grid gap-10 lg:grid-cols-[1fr_.7fr] lg:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.35em] text-[#f5dfad]">Próximo passo</p>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-5xl">
                Vamos conversar sobre o caminho de desenvolvimento do projeto?
              </h2>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-white/72">
                A página foi criada para abrir diálogo com produtoras, parceiros e profissionais do audiovisual. O material completo pode ser enviado por e-mail ou apresentado em uma reunião breve.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <a
                href={SUPPORT_URL}
                className="rounded-full bg-[#d6ad63] px-7 py-4 text-center text-sm font-black uppercase tracking-[0.2em] text-[#070914] transition hover:scale-[1.02]"
              >
                Chamar no Falar com o Ecossistema
              </a>
              <a
                href={MAIL_URL}
                className="rounded-full border border-white/20 px-7 py-4 text-center text-sm font-black uppercase tracking-[0.2em] text-white transition hover:bg-white/10"
              >
                Enviar e-mail
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function InfoCard({ title, text }: { title: string; text: string }) {
  return (
    <article className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-xl backdrop-blur">
      <h3 className="text-xl font-semibold text-[#f5dfad]">{title}</h3>
      <p className="mt-3 leading-7 text-white/72">{text}</p>
    </article>
  );
}

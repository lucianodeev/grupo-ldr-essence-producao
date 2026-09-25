import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/luciano-rodrigues-almeida")({
  head: () => ({
    meta: [
      { title: "Luciano Rodrigues Almeida | Fundador da LDR Academy" },
      {
        name: "description",
        content:
          "Conheça Luciano Rodrigues Almeida, psicanalista, mentor profissional e fundador de projetos em educação, carreira, empregabilidade, saúde mental e bem-estar.",
      },
      { name: "robots", content: "index,follow" },
      { property: "og:title", content: "Luciano Rodrigues Almeida | Fundador da LDR Academy" },
      {
        property: "og:description",
        content:
          "Trajetória, projetos, links oficiais e presença pública de Luciano Rodrigues Almeida no ecossistema LDR.",
      },
      { property: "og:type", content: "profile" },
      { property: "og:url", content: "https://ldracademy.online/luciano-rodrigues-almeida" },
    ],
    links: [{ rel: "canonical", href: "https://ldracademy.online/luciano-rodrigues-almeida" }],
  }),
  component: LucianoPage,
});

const projects = [
  {
    name: "LDR Academy",
    text: "Plataforma educacional online com cursos, formações, biblioteca digital, conteúdos de carreira, desenvolvimento humano e qualificação profissional.",
    href: "https://ldracademy.online",
  },
  {
    name: "LDR RH & Estratégia",
    text: "Ecossistema voltado à carreira, empregabilidade, saúde mental, bem-estar, recrutamento, orientação profissional e soluções para empresas e instituições.",
    href: "/ecossistema",
  },
  {
    name: "Human Room",
    text: "Projeto digital voltado à escuta, participação e construção coletiva de soluções entre pessoas, universidades, empresas e organizações.",
    href: "https://ldracademy.online/human-room",
  },
  {
    name: "Grupo LDR Essence",
    text: "Iniciativa que reúne projetos em educação, carreira, saúde mental, bem-estar e desenvolvimento humano.",
    href: "/luciano",
  },
];

const areas = [
  "Psicanálise clínica online",
  "Mentoria profissional",
  "Orientação de carreira",
  "Educação online",
  "Empregabilidade",
  "Saúde mental e bem-estar",
  "Projetos acadêmicos e institucionais",
  "Desenvolvimento humano",
  "Plataformas digitais",
  "Conexão universidade–mercado",
];

const officialLinks = [
  ["LDR Academy", "https://ldracademy.online"],
  ["Ecossistema LDR", "https://ldracademy.online/ecossistema"],
  ["LDR RH & Estratégia", "https://ldracademy.online/ldr-rh-estrategia"],
  ["Human Room", "https://ldracademy.online/human-room"],
  ["Instagram LDR Academy", "https://www.instagram.com/ldracademy.online"],
  ["Instagram profissional", "https://www.instagram.com/luciano.psicanalise_"],
  ["Página atual sobre Luciano", "https://ldracademy.online/luciano"],
];

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Luciano Rodrigues Almeida",
  jobTitle: "Psicanalista, mentor profissional e fundador da LDR Academy",
  birthPlace: "Guanambi, Bahia, Brasil",
  homeLocation: "Bélgica",
  url: "https://ldracademy.online/luciano-rodrigues-almeida",
  sameAs: [
    "https://ldracademy.online",
    "https://ldracademy.online/luciano",
    "https://ldracademy.online/human-room",
    "https://www.instagram.com/ldracademy.online",
    "https://www.instagram.com/luciano.psicanalise_",
  ],
  knowsAbout: [
    "Psicanálise",
    "Educação online",
    "Carreira",
    "Empregabilidade",
    "Saúde mental",
    "Desenvolvimento humano",
  ],
};

function ExternalButton({ href, children, variant = "primary" }: { href: string; children: string; variant?: "primary" | "secondary" }) {
  const cls =
    variant === "primary"
      ? "bg-[#d6ad63] text-[#0b1428] hover:bg-[#f0cf83]"
      : "border border-white/30 text-white hover:bg-white/10";
  return (
    <a href={href} className={`inline-flex min-h-12 items-center justify-center rounded-full px-6 py-3 text-sm font-black transition ${cls}`}>
      {children}
    </a>
  );
}

function LucianoPage() {
  return (
    <main className="min-h-screen bg-[#fbf8f1] text-[#0b1428]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />

      <header className="border-b border-[#d6ad63]/25 bg-[#0b1428] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
          <Link to="/" className="font-serif text-xl font-bold tracking-wide">
            LDR ACADEMY
          </Link>
          <nav className="hidden items-center gap-5 text-sm font-semibold text-white/80 sm:flex">
            <a href="https://ldracademy.online/ecossistema" className="hover:text-white">Ecossistema</a>
            <a href="https://ldracademy.online/ldr-rh-estrategia" className="hover:text-white">LDR RH</a>
            <a href="https://ldracademy.online/human-room" className="hover:text-white">Human Room</a>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden bg-[#0b1428] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(214,173,99,.24),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(126,74,163,.25),transparent_38%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.15fr_.85fr] lg:items-center lg:py-24">
          <div>
            <p className="text-xs font-black uppercase tracking-[.25em] text-[#d6ad63]">Biografia oficial</p>
            <h1 className="mt-5 max-w-4xl font-serif text-4xl leading-tight sm:text-6xl">
              Luciano Rodrigues Almeida
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-white/82">
              Fundador da LDR Academy, psicanalista e idealizador de projetos em educação, carreira, empregabilidade e bem-estar.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <ExternalButton href="https://ldracademy.online">Conhecer LDR Academy</ExternalButton>
              <ExternalButton href="https://ldracademy.online/ecossistema" variant="secondary">Ver Ecossistema</ExternalButton>
              <ExternalButton href="https://ldracademy.online/ldr-rh-estrategia" variant="secondary">LDR RH & Estratégia</ExternalButton>
            </div>
          </div>

          <aside className="rounded-[2rem] border border-white/15 bg-white/8 p-6 shadow-2xl backdrop-blur">
            <img
              src="/media/luciano/luciano-rodrigues-almeida.jpeg"
              alt="Luciano Rodrigues Almeida, fundador da LDR Academy"
              className="aspect-[4/3] w-full rounded-[1.5rem] border border-[#d6ad63]/40 object-cover object-center shadow-xl"
              loading="eager"
              fetchPriority="high"
            />
            <div className="mt-6 grid gap-3 text-sm text-white/80">
              <p><strong className="text-white">Origem:</strong> Guanambi, Bahia</p>
              <p><strong className="text-white">Trajetória:</strong> Bahia, São Paulo e Europa</p>
              <p><strong className="text-white">Atuação:</strong> educação, psicanálise, carreira e desenvolvimento humano</p>
            </div>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-[.9fr_1.1fr]">
          <div>
            <p className="text-xs font-black uppercase tracking-[.2em] text-[#8b6a12]">Sobre Luciano</p>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl">Educação, carreira, saúde mental e impacto social.</h2>
          </div>
          <div className="space-y-5 text-base leading-8 text-[#374151]">
            <p>
              Luciano Rodrigues Almeida é psicanalista, mentor profissional e fundador de iniciativas voltadas à educação,
              saúde mental, carreira, empregabilidade e desenvolvimento humano.
            </p>
            <p>
              Nascido em Guanambi, na Bahia, construiu sua trajetória entre diferentes realidades sociais, acadêmicas e profissionais.
              Após viver muitos anos em São Paulo, ampliou sua experiência internacional e atualmente vive na Bélgica, de onde desenvolve
              projetos digitais conectando Brasil, Portugal, Europa e países de língua portuguesa.
            </p>
            <p>
              Sua atuação reúne psicanálise, recursos humanos, carreira, educação online, inclusão profissional e inovação social.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white py-14 lg:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="rounded-[2rem] border border-[#d6ad63]/25 bg-[#fbf8f1] p-6 shadow-sm sm:p-10">
            <p className="text-xs font-black uppercase tracking-[.2em] text-[#8b6a12]">Trajetória</p>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl">Da Bahia à Europa: uma trajetória de construção e superação</h2>
            <p className="mt-5 max-w-4xl text-base leading-8 text-[#374151]">
              A história de Luciano é marcada por recomeços, trabalho, estudo e adaptação. Da Bahia a São Paulo, e depois à Europa,
              sua trajetória pessoal inspira parte dos projetos que desenvolve: criar caminhos para que outras pessoas possam estudar,
              trabalhar, se reorganizar profissionalmente e encontrar novas oportunidades.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[.2em] text-[#8b6a12]">Projetos principais</p>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl">Ecossistema LDR</h2>
          </div>
          <a href="https://ldracademy.online/ecossistema" className="font-bold text-[#6d4f09] underline underline-offset-4">Ver ecossistema completo</a>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {projects.map((project) => (
            <article key={project.name} className="rounded-[1.5rem] border border-[#d6ad63]/25 bg-white p-6 shadow-sm">
              <h3 className="font-serif text-2xl">{project.name}</h3>
              <p className="mt-3 text-sm leading-7 text-[#4b5563]">{project.text}</p>
              <a href={project.href} className="mt-5 inline-flex font-black text-[#6d4f09] underline underline-offset-4">Acessar projeto</a>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[#0b1428] py-14 text-white lg:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[.9fr_1.1fr]">
          <div>
            <p className="text-xs font-black uppercase tracking-[.2em] text-[#d6ad63]">Atuação profissional</p>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl">Escuta, orientação e construção de caminhos possíveis.</h2>
            <p className="mt-5 text-base leading-8 text-white/78">
              Luciano atua com psicanálise clínica online, mentoria profissional, orientação de carreira, projetos educacionais,
              plataformas digitais e iniciativas de conexão entre pessoas, empresas e instituições de ensino.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {areas.map((area) => (
              <div key={area} className="rounded-2xl border border-white/15 bg-white/8 p-4 text-sm font-bold text-white/90">
                {area}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-2">
          <article className="rounded-[2rem] border border-[#d6ad63]/25 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-xs font-black uppercase tracking-[.2em] text-[#8b6a12]">Na mídia</p>
            <h2 className="mt-3 font-serif text-3xl">Presença pública</h2>
            <p className="mt-4 text-sm leading-7 text-[#4b5563]">
              Entrevistas, matérias e publicações sobre Luciano Rodrigues Almeida, LDR Academy e seus projetos.
            </p>
            <a
              href="https://startupvalley.news/uk/ldr-academy-entrepreneurship-education/"
              className="mt-6 block rounded-2xl border border-[#d6ad63]/40 bg-[#0b1428] p-5 font-bold text-white hover:border-[#d6ad63]"
            >
              <img
                src="/media/press/startupvalley-logo-original.png"
                alt="StartupValley"
                className="mx-auto object-contain"
                style={{ width: "230px", height: "auto", maxWidth: "100%" }}
                loading="lazy"
              />
              <span className="mt-4 block text-center">
                From Street Vendor to EdTech Founder: How Luciano Almeida Is Uniting Education and Careers
              </span>
            </a>
            <p className="mt-4 text-xs text-[#6b7280]">Em breve, novas entrevistas, matérias, podcasts, portais e publicações.</p>
          </article>

          <article className="rounded-[2rem] border border-[#d6ad63]/25 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-xs font-black uppercase tracking-[.2em] text-[#8b6a12]">Links oficiais</p>
            <h2 className="mt-3 font-serif text-3xl">Canais e projetos</h2>
            <div className="mt-6 grid gap-3">
              {officialLinks.map(([label, href]) => (
                <a key={href} href={href} className="rounded-2xl border border-[#e6dac4] p-4 text-sm font-bold text-[#0b1428] transition hover:border-[#8b6a12] hover:bg-[#fbf8f1]">
                  {label}
                </a>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="bg-[#fbf1df] px-4 py-14 sm:px-6 lg:py-20">
        <div className="mx-auto max-w-5xl rounded-[2rem] bg-[#0b1428] p-7 text-center text-white shadow-xl sm:p-10">
          <p className="text-xs font-black uppercase tracking-[.2em] text-[#d6ad63]">Contato</p>
          <h2 className="mt-3 font-serif text-3xl sm:text-4xl">Convites, entrevistas e parcerias</h2>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-white/78">
            Para convites, entrevistas, parcerias, projetos institucionais, universidades, empresas ou propostas profissionais,
            entre em contato pelos canais oficiais.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
            <ExternalButton href="https://ldracademy.online/ecossistema">Conhecer o ecossistema</ExternalButton>
            <ExternalButton href="https://ldracademy.online/ldr-rh-estrategia" variant="secondary">LDR RH & Estratégia</ExternalButton>
            <ExternalButton href="https://www.instagram.com/luciano.psicanalise_" variant="secondary">Instagram profissional</ExternalButton>
          </div>
        </div>
      </section>
    </main>
  );
}

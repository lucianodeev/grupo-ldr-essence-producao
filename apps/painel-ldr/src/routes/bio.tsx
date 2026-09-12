import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  GraduationCap,
  Library,
  LogIn,
  Newspaper,
  Sparkles,
  Stethoscope,
} from "lucide-react";

const NAVY = "#07345b";
const NAVY_DARK = "#052844";
const GOLD = "#c99b2d";
const CREAM = "#f7f2e8";

function PriceCard({
  title,
  kicker,
  description,
  price,
  secondaryPrice,
  note,
  to,
  cta,
  tone = "light",
  icon,
}: {
  title: string;
  kicker: string;
  description: string;
  price: string;
  secondaryPrice?: string;
  note?: string;
  to: string;
  cta: string;
  tone?: "light" | "navy" | "wine" | "blue";
  icon: React.ReactNode;
}) {
  const styles = {
    light: { bg: "#ffffff", fg: NAVY_DARK, muted: "#64748b", accent: GOLD, border: "rgba(7,52,91,.10)" },
    navy: { bg: NAVY_DARK, fg: "#ffffff", muted: "rgba(255,255,255,.72)", accent: "#f0c775", border: "rgba(201,155,45,.35)" },
    wine: { bg: "#5a1028", fg: "#ffffff", muted: "rgba(255,255,255,.74)", accent: "#f0c775", border: "rgba(240,199,117,.30)" },
    blue: { bg: "#0b5cab", fg: "#ffffff", muted: "rgba(255,255,255,.76)", accent: "#bfe3ff", border: "rgba(191,227,255,.28)" },
  }[tone];

  return (
    <article
      className="rounded-[24px] border p-5 shadow-sm"
      style={{ background: styles.bg, color: styles.fg, borderColor: styles.border }}
    >
      <div className="flex items-start justify-between gap-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-black/5">{icon}</span>
        <span className="text-right text-[10px] font-black uppercase tracking-[.14em]" style={{ color: styles.accent }}>
          {kicker}
        </span>
      </div>

      <h3 className="mt-4 text-xl font-black leading-tight">{title}</h3>
      <p className="mt-2 text-sm leading-6" style={{ color: styles.muted }}>{description}</p>

      <div className="mt-4 rounded-2xl border p-4" style={{ borderColor: styles.border, background: "rgba(255,255,255,.07)" }}>
        <p className="text-lg font-black leading-6">{price}</p>
        {secondaryPrice ? <p className="mt-1 text-sm font-bold" style={{ color: styles.accent }}>{secondaryPrice}</p> : null}
        {note ? <p className="mt-2 text-[11px] leading-5" style={{ color: styles.muted }}>{note}</p> : null}
      </div>

      <Link
        to={to}
        className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-center text-xs font-black"
        style={{ background: styles.accent, color: tone === "light" ? "#281605" : NAVY_DARK }}
      >
        {cta} <ArrowRight size={16} />
      </Link>
    </article>
  );
}

function BioPage() {
  return (
    <main
      className="min-h-screen px-4 py-8 sm:py-12"
      style={{
        background:
          "radial-gradient(circle at top, rgba(201,155,45,.14), transparent 30%), linear-gradient(180deg, #fbfaf7 0%, #f7f2e8 100%)",
        color: NAVY_DARK,
      }}
    >
      <div className="mx-auto w-full max-w-2xl">
        <header className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-[24px] shadow-sm" style={{ background: NAVY }} aria-hidden="true">
            <BookOpen size={40} color={GOLD} strokeWidth={1.8} />
          </div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.24em]" style={{ color: GOLD }}>
            Learn · Discover · Grow
          </p>
          <h1 className="font-serif text-4xl font-bold tracking-tight" style={{ color: NAVY }}>LDR Academy</h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-600">
            Formações, biblioteca, publicações e orientações para aprender e avançar profissionalmente.
          </p>
        </header>

        <section className="rounded-[28px] p-6 text-white shadow-lg" style={{ background: `linear-gradient(135deg, ${NAVY_DARK}, #0b4d7f)` }}>
          <div className="flex items-center gap-3">
            <Library size={25} color={GOLD} />
            <p className="text-xs font-black uppercase tracking-[.16em]" style={{ color: GOLD }}>ASSINATURA PRINCIPAL</p>
          </div>
          <h2 className="mt-3 font-serif text-3xl">Biblioteca LDR</h2>
          <p className="mt-3 text-sm leading-6 text-white/75">
            Acesso a formações, cursos, treinamentos, livros e conteúdos digitais incluídos enquanto sua assinatura estiver ativa.
          </p>
          <div className="mt-5 rounded-2xl border border-[#c99b2d]/35 bg-black/20 p-5">
            <p className="text-xs font-black uppercase tracking-[.12em]" style={{ color: "#f0c775" }}>50% OFF NO PRIMEIRO MÊS</p>
            <p className="mt-2 text-2xl font-black">🇧🇷 R$ 19,95 · 🇪🇺 € 4,95</p>
            <p className="mt-2 text-sm text-white/75">Depois: R$ 39,90/mês ou € 9,90/mês. Cancele quando quiser.</p>
          </div>
          <Link to="/cliente/biblioteca" className="mt-5 flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-black" style={{ background: GOLD, color: "#281605" }}>
            ASSINAR BIBLIOTECA <ArrowRight size={17} />
          </Link>
        </section>

        <section className="mt-7">
          <div className="mb-4 text-center">
            <p className="text-xs font-black uppercase tracking-[.16em]" style={{ color: GOLD }}>ASSINATURAS & ORIENTAÇÕES</p>
            <h2 className="mt-2 font-serif text-2xl" style={{ color: NAVY }}>Escolha como quer começar</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <PriceCard
              title="Jornal LDR"
              kicker="ASSINATURA SEMANAL"
              description="Negócios, ciência, tecnologia, mundo e entretenimento em edição digital."
              price="🇧🇷 R$ 0,90 / semana"
              secondaryPrice="🇪🇺 € 0,90 / semana"
              to="/cliente/biblioteca/jornal-ldr"
              cta="ASSINAR JORNAL"
              tone="navy"
              icon={<Newspaper size={23} color="#f0c775" />}
            />

            <PriceCard
              title="Revista LDR"
              kicker="ASSINATURA SEMANAL"
              description="Carreira, empreendedorismo, comportamento, inovação e histórias que inspiram."
              price="🇧🇷 R$ 0,90 / semana"
              secondaryPrice="🇪🇺 € 0,90 / semana"
              to="/cliente/biblioteca/revista-ldr"
              cta="ASSINAR REVISTA"
              tone="wine"
              icon={<BookOpen size={23} color="#f0c775" />}
            />

            <PriceCard
              title="Orientação Psicanalítica"
              kicker="ATENDIMENTO POR TEXTO"
              description="Orientação breve, privada e por escrito. O tempo fica pausado enquanto você aguarda a resposta."
              price="10 min · € 0,90 / R$ 5,35"
              secondaryPrice="30 min · € 1,00 / R$ 5,95 · 60 min · € 1,90 / R$ 11,30"
              note="Valores promocionais do 1º mês. Depois: € 0,90 a cada 2 minutos, com pacotes disponíveis."
              to="/cliente/orientacao-psicanalitica"
              cta="INICIAR ORIENTAÇÃO"
              tone="light"
              icon={<Stethoscope size={23} color={GOLD} />}
            />

            <PriceCard
              title="Orientação Profissional"
              kicker="CARREIRA · POR TEXTO"
              description="Currículo, entrevistas, transição profissional, posicionamento e próximos passos."
              price="10 min · € 0,90 / R$ 5,35"
              secondaryPrice="30 min · € 1,90 / R$ 11,30 · 60 min · € 3,90 / R$ 23,20"
              note="Promoção válida por 30 dias a partir da primeira compra. Serviço separado da assinatura da Biblioteca."
              to="/cliente/orientacao-profissional"
              cta="FALAR SOBRE MINHA CARREIRA"
              tone="blue"
              icon={<BriefcaseBusiness size={23} color="#bfe3ff" />}
            />
          </div>
        </section>

        <section className="mt-7 space-y-3" aria-label="Links principais da LDR Academy">
          <Link to="/" className="group flex w-full items-center gap-4 rounded-2xl p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md" style={{ background: NAVY, color: "white" }}>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10"><GraduationCap size={23} /></span>
            <span className="min-w-0 flex-1"><strong className="block text-base">Formações e cursos</strong><span className="mt-0.5 block text-xs text-white/75">Formações atuais por R$ 299,99 · € 49,90</span></span>
            <ArrowRight size={19} className="transition group-hover:translate-x-1" />
          </Link>

          <Link to="/cliente/biblioteca/cursos-gratuitos" className="group flex w-full items-center gap-4 rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md" style={{ borderColor: "rgba(7,52,91,.10)", color: NAVY }}>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ background: CREAM, color: GOLD }}><Sparkles size={23} /></span>
            <span className="min-w-0 flex-1"><strong className="block text-base">Cursos gratuitos</strong><span className="mt-0.5 block text-xs text-slate-500">Comece a aprender sem custo</span></span>
            <ArrowRight size={19} className="transition group-hover:translate-x-1" />
          </Link>

          <Link to="/cliente/login" className="group flex w-full items-center gap-4 rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md" style={{ borderColor: "rgba(7,52,91,.10)", color: NAVY }}>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ background: CREAM, color: GOLD }}><LogIn size={22} /></span>
            <span className="min-w-0 flex-1"><strong className="block text-base">Já sou aluno</strong><span className="mt-0.5 block text-xs text-slate-500">Entre para acessar sua Biblioteca</span></span>
            <ArrowRight size={19} className="transition group-hover:translate-x-1" />
          </Link>
        </section>

        <div className="mt-7 rounded-2xl border border-white/70 bg-white/70 px-5 py-4 text-center shadow-sm backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: GOLD }}>Conhecimento sem fronteiras</p>
          <p className="mt-1 text-sm font-semibold" style={{ color: NAVY }}>ldracademy.online</p>
        </div>

        <footer className="mt-6 text-center text-[11px] text-slate-400">© {new Date().getFullYear()} LDR Academy</footer>
      </div>
    </main>
  );
}

export const Route = createFileRoute("/bio")({
  head: () => ({
    meta: [
      { title: "LDR Academy | Cursos, Formações e Biblioteca Online" },
      {
        name: "description",
        content: "Acesse cursos, formações profissionais, Biblioteca LDR, Jornal LDR, Revista LDR e orientações por texto.",
      },
      { property: "og:title", content: "LDR Academy" },
      {
        property: "og:description",
        content: "Cursos, formações, assinaturas e orientações em um só lugar.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: BioPage,
});

import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, GraduationCap, Newspaper, Sparkles, LogIn, ArrowRight } from "lucide-react";

const NAVY = "#07345b";
const NAVY_DARK = "#052844";
const GOLD = "#c99b2d";
const CREAM = "#f7f2e8";

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
      <div className="mx-auto w-full max-w-md">
        <header className="mb-7 text-center">
          <div
            className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-[24px] shadow-sm"
            style={{ background: NAVY }}
            aria-hidden="true"
          >
            <BookOpen size={40} color={GOLD} strokeWidth={1.8} />
          </div>

          <p
            className="mb-2 text-xs font-bold uppercase tracking-[0.24em]"
            style={{ color: GOLD }}
          >
            Learn · Discover · Grow
          </p>
          <h1 className="font-serif text-4xl font-bold tracking-tight" style={{ color: NAVY }}>
            LDR Academy
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-600">
            Formações, cursos, livros e conhecimento para sua evolução profissional.
          </p>
        </header>

        <section className="space-y-3" aria-label="Links principais da LDR Academy">
          <Link
            to="/"
            className="group flex w-full items-center gap-4 rounded-2xl p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            style={{ background: NAVY, color: "white" }}
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
              <GraduationCap size={23} />
            </span>
            <span className="min-w-0 flex-1">
              <strong className="block text-base">Formações e cursos</strong>
              <span className="mt-0.5 block text-xs text-white/75">Conheça todos os conteúdos disponíveis</span>
            </span>
            <ArrowRight size={19} className="transition group-hover:translate-x-1" />
          </Link>

          <Link
            to="/cliente/biblioteca/cursos-gratuitos"
            className="group flex w-full items-center gap-4 rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            style={{ borderColor: "rgba(7,52,91,.10)", color: NAVY }}
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ background: CREAM, color: GOLD }}>
              <Sparkles size={23} />
            </span>
            <span className="min-w-0 flex-1">
              <strong className="block text-base">Cursos gratuitos</strong>
              <span className="mt-0.5 block text-xs text-slate-500">Comece a aprender sem custo</span>
            </span>
            <ArrowRight size={19} className="transition group-hover:translate-x-1" />
          </Link>

          <Link
            to="/cliente/biblioteca/publicacoes"
            className="group flex w-full items-center gap-4 rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            style={{ borderColor: "rgba(7,52,91,.10)", color: NAVY }}
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ background: CREAM, color: GOLD }}>
              <Newspaper size={23} />
            </span>
            <span className="min-w-0 flex-1">
              <strong className="block text-base">Jornais, revistas e ciência</strong>
              <span className="mt-0.5 block text-xs text-slate-500">Informação e conhecimento em um só lugar</span>
            </span>
            <ArrowRight size={19} className="transition group-hover:translate-x-1" />
          </Link>

          <Link
            to="/cliente/login"
            className="group flex w-full items-center gap-4 rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            style={{ borderColor: "rgba(7,52,91,.10)", color: NAVY }}
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ background: CREAM, color: GOLD }}>
              <LogIn size={22} />
            </span>
            <span className="min-w-0 flex-1">
              <strong className="block text-base">Minha Biblioteca</strong>
              <span className="mt-0.5 block text-xs text-slate-500">Entre para acessar seus conteúdos</span>
            </span>
            <ArrowRight size={19} className="transition group-hover:translate-x-1" />
          </Link>
        </section>

        <div className="mt-7 rounded-2xl border border-white/70 bg-white/70 px-5 py-4 text-center shadow-sm backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: GOLD }}>
            Conhecimento sem fronteiras
          </p>
          <p className="mt-1 text-sm font-semibold" style={{ color: NAVY }}>
            ldracademy.online
          </p>
        </div>

        <footer className="mt-6 text-center text-[11px] text-slate-400">
          © {new Date().getFullYear()} LDR Academy
        </footer>
      </div>
    </main>
  );
}

export const Route = createFileRoute("/bio")({
  head: () => ({
    meta: [
      { title: "LDR Academy | Formações, Cursos e Conhecimento" },
      {
        name: "description",
        content:
          "Acesse formações, cursos, biblioteca digital, jornais, revistas e conteúdos gratuitos da LDR Academy.",
      },
      { property: "og:title", content: "LDR Academy" },
      {
        property: "og:description",
        content: "Formações, cursos e conhecimento para sua evolução profissional.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: BioPage,
});

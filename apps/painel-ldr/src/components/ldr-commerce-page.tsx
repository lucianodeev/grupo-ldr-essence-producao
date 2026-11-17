import type { ReactNode } from "react";

export const commerceAction =
  "inline-flex min-h-11 items-center justify-center rounded-lg bg-[#122c27] px-5 py-2.5 font-semibold text-white hover:bg-[#244b41] focus-visible:outline-2 focus-visible:outline-offset-4";
export const commerceField =
  "mt-2 min-h-11 w-full rounded-lg border border-[#aebbb3] bg-white px-3 py-2 text-[#172e28]";

export function LdrCommercePage({
  section,
  title,
  intro,
  children,
}: {
  section: "loja" | "servicos";
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#f7f6f0] text-[#172e28]">
      <a href="#conteudo-comercial" className="sr-only focus:not-sr-only focus:block focus:p-3">
        Ir para o conteúdo
      </a>
      <header className="border-b border-[#cfd7cd] bg-white">
        <nav
          aria-label="Ecossistema LDR"
          className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-5 py-4 text-sm font-semibold [&_a]:py-2 [&_a[aria-current]]:underline [&_a]:underline-offset-4"
        >
          <a className="mr-auto font-serif text-xl" href="/ecossistema">
            Ecossistema LDR
          </a>
          <a href="/loja" aria-current={section === "loja" ? "page" : undefined}>
            Loja
          </a>
          <a
            href="/servicos-profissionais"
            aria-current={section === "servicos" ? "page" : undefined}
          >
            Serviços profissionais
          </a>
          <a href="/cliente/biblioteca">Biblioteca</a>
        </nav>
      </header>
      <div id="conteudo-comercial" className="bg-[#122c27] text-white">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:py-17">
          <h1 className="max-w-4xl font-serif text-4xl leading-tight sm:text-6xl">{title}</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#dce6dc] sm:text-lg">{intro}</p>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-5 py-8 sm:py-12">{children}</div>
      <footer className="border-t border-[#cfd7cd] px-5 py-7 text-sm">
        <div className="mx-auto flex max-w-6xl flex-wrap gap-5">
          <a className="underline underline-offset-4" href="/falar-com-ecossistema">
            Atendimento institucional
          </a>
          <a className="underline underline-offset-4" href="/cliente/login">
            Minha Área
          </a>
        </div>
      </footer>
    </main>
  );
}

import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
export function EnterprisePage({title,intro,children}:{title:string;intro:string;children:ReactNode}) {
  return <main className="min-h-screen bg-[#f7f6f3] text-[#12233a]">
    <a href="#enterprise-content" className="sr-only focus:not-sr-only focus:block focus:p-4">Ir para o conteúdo</a>
    <header className="border-b border-[#d8c9a9] bg-white"><nav aria-label="Central Empresas" className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-5 py-5 text-sm font-semibold">
      <Link to="/empresas" className="mr-auto font-serif text-xl">Ecossistema LDR · Empresas</Link>
      <Link to="/empresas/servicos">Serviços</Link><Link to="/empresas/academy">Academy</Link><Link to="/empresas/ldr-one">LDR ONE</Link>
      <Link to="/empresas/proposta" className="rounded-full bg-[#12233a] px-4 py-3 text-white">Solicitar proposta</Link>
    </nav></header>
    <div id="enterprise-content" className="mx-auto max-w-6xl px-5 py-12 sm:py-20"><p className="text-xs font-bold uppercase tracking-[.2em] text-[#866a3c]">Pessoas · conhecimento · organizações</p><h1 className="mt-4 max-w-4xl font-serif text-4xl font-bold leading-tight sm:text-6xl">{title}</h1><p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">{intro}</p><div className="mt-10">{children}</div></div>
    <footer className="border-t border-[#d8c9a9] px-5 py-8 text-sm text-slate-600"><div className="mx-auto flex max-w-6xl flex-wrap gap-5"><Link to="/ecossistema">Conhecer o ecossistema</Link><Link to="/falar-com-ecossistema">Atendimento institucional</Link><a href="https://ldrecossistema.online">ldrecossistema.online</a></div></footer>
  </main>;
}

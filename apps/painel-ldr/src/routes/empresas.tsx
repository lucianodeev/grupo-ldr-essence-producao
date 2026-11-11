import { Link, createFileRoute } from "@tanstack/react-router";
import { BriefcaseBusiness, GraduationCap, UsersRound, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/empresas")({
  head: () => ({ meta: [
    { title: "Central Empresas LDR | RH, recrutamento e formação" },
    { name: "description", content: "Soluções empresariais LDR em recursos humanos, recrutamento, formação e desenvolvimento de equipas." },
  ] }),
  component: CentralEmpresas,
});

const offers = [
  { title: "RH & Estratégia", description: "Consultoria, organização de processos e desenvolvimento de pessoas.", href: "/ldr-rh-estrategia", icon: BriefcaseBusiness },
  { title: "Recrutamento e seleção", description: "Conheça as soluções e solicite uma proposta adaptada à sua empresa.", href: "/falar-com-ecossistema", icon: UsersRound },
  { title: "Formação empresarial", description: "Cursos e conteúdos de desenvolvimento profissional do Ecossistema LDR.", href: "/ecossistema", icon: GraduationCap },
] as const;

function CentralEmpresas() {
  return (
    <main className="min-h-screen bg-[#f7f6f3] text-[#12233a]">
      <header className="border-b border-[#d8c9a9] bg-white">
        <nav aria-label="Navegação principal" className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-5">
          <Link to="/ecossistema" className="font-serif text-xl font-bold">Ecossistema LDR</Link>
          <Link to="/empresa/login" className="rounded-full border border-[#b29a68] px-4 py-2 text-sm font-semibold">Área da empresa</Link>
        </nav>
      </header>
      <section className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-[#866a3c]">Central Empresas LDR</p>
        <h1 className="mt-4 max-w-4xl font-serif text-4xl font-bold leading-tight sm:text-6xl">Pessoas, estratégia e desenvolvimento para a sua empresa.</h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">Explore os serviços de RH, recrutamento e formação do Ecossistema LDR. Fale com a nossa equipa para identificar a solução adequada ao seu negócio.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/falar-com-ecossistema" className="inline-flex items-center gap-2 rounded-xl bg-[#12233a] px-6 py-3 font-semibold text-white">Solicitar proposta <ArrowRight className="h-4 w-4" /></Link>
          <Link to="/ldr-rh-estrategia" className="rounded-xl border border-slate-300 px-6 py-3 font-semibold">Conhecer serviços de RH</Link>
        </div>
      </section>
      <section className="border-t border-[#e2dac9] bg-white py-16">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="font-serif text-3xl font-bold">Soluções para empresas</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {offers.map(({ title, description, href, icon: Icon }) => (
              <article key={title} className="rounded-2xl border border-[#e2dac9] p-6">
                <Icon className="h-7 w-7 text-[#866a3c]" aria-hidden="true" />
                <h3 className="mt-4 text-xl font-bold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
                <Link to={href} className="mt-6 inline-flex items-center gap-2 text-sm font-bold underline underline-offset-4">Explorar <ArrowRight className="h-4 w-4" /></Link>
              </article>
            ))}
          </div>
          <p className="mt-8 text-sm text-slate-500">Funcionalidades digitais e planos empresariais sujeitos a confirmação de disponibilidade e proposta comercial.</p>
        </div>
      </section>
    </main>
  );
}

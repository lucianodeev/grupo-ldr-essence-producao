import { Link, createFileRoute } from "@tanstack/react-router";
import { BriefcaseBusiness, Building2, FileText, ListChecks } from "lucide-react";
import { LanguageSelect } from "@/lib/i18n";

export const Route = createFileRoute("/carreira/$")({
  component: CareerSubrouteFallback,
});

type PageCopy = {
  title: string;
  eyebrow: string;
  description: string;
  icon: "company" | "jobs" | "applications" | "guide";
  primaryHref?: string;
  primaryLabel?: string;
};

const pages: Record<string, PageCopy> = {
  "/carreira/empresa": {
    eyebrow: "Área da empresa",
    title: "Publique vagas gratuitamente",
    description:
      "Cadastre sua empresa, organize oportunidades, salve rascunhos e envie vagas para análise com segurança. A publicação pública depende de validação da LDR.",
    icon: "company",
    primaryHref: "/carreira/vagas",
    primaryLabel: "Ver vagas abertas",
  },
  "/carreira/vagas": {
    eyebrow: "Vagas abertas",
    title: "Encontre oportunidades profissionais",
    description:
      "Consulte vagas, oportunidades remotas, presenciais, híbridas, internacionais e candidaturas inclusivas disponíveis no LDR Carreira.",
    icon: "jobs",
    primaryHref: "/carreira",
    primaryLabel: "Cadastrar interesse",
  },
  "/carreira/empresa/candidaturas": {
    eyebrow: "Triagem de candidaturas",
    title: "Organize candidaturas recebidas",
    description:
      "Acompanhe pessoas candidatas, status de triagem e dados administrativos do processo seletivo sem expor informações sensíveis desnecessárias.",
    icon: "applications",
    primaryHref: "/carreira/empresa",
    primaryLabel: "Voltar para área da empresa",
  },
  "/carreira/empresa/guia-triagem-responsavel": {
    eyebrow: "Guia responsável",
    title: "Triagem segura, inclusiva e documentada",
    description:
      "Boas práticas para avaliar candidaturas com critérios claros, acessibilidade, rastreabilidade e respeito à legislação aplicável.",
    icon: "guide",
    primaryHref: "/carreira/empresa/candidaturas",
    primaryLabel: "Ir para candidaturas",
  },
};

function CareerSubrouteFallback() {
  const currentPath = typeof window !== "undefined" ? window.location.pathname.replace(/\/$/, "") : "/carreira";
  const page = pages[currentPath] ?? {
    eyebrow: "LDR Carreira",
    title: "Página de carreira",
    description: "Esta área faz parte do LDR Carreira. Use os atalhos abaixo para navegar entre empresas, vagas e candidaturas.",
    icon: "jobs" as const,
    primaryHref: "/carreira",
    primaryLabel: "Voltar ao início",
  };
  const Icon = page.icon === "company" ? Building2 : page.icon === "applications" ? ListChecks : page.icon === "guide" ? FileText : BriefcaseBusiness;

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link to="/carreira" className="flex items-center gap-3 font-semibold text-[#07345b]">
            <BriefcaseBusiness aria-hidden="true" /> LDR Carreira
          </Link>
          <LanguageSelect />
        </div>
      </header>

      <section className="bg-gradient-to-br from-[#052844] via-[#07345b] to-[#0b477a] text-white">
        <div className="mx-auto max-w-6xl px-5 py-14 md:py-20">
          <span className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-bold text-[#07345b] shadow-sm">
            {page.eyebrow}
          </span>
          <div className="mt-7 flex items-start gap-4">
            <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/20">
              <Icon className="h-9 w-9 text-white" aria-hidden="true" />
            </div>
            <div>
              <h1 className="max-w-4xl text-4xl font-black tracking-tight text-white md:text-6xl">{page.title}</h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-white/90">{page.description}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#c99b2d]">Rota carregada corretamente</p>
          <p className="mt-2 text-lg font-semibold text-[#07345b]">{currentPath}</p>
          <p className="mt-4 max-w-3xl leading-7 text-slate-700">
            Esta tela foi forçada para evitar que o navegador mostre a página principal quando o caminho acessado é uma subpágina de Carreira.
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link to="/carreira" className="rounded-2xl border border-slate-200 p-4 font-semibold text-[#07345b] hover:border-[#c99b2d]">Início</Link>
            <Link to="/carreira/empresa" className="rounded-2xl border border-slate-200 p-4 font-semibold text-[#07345b] hover:border-[#c99b2d]">Empresa</Link>
            <Link to="/carreira/vagas" className="rounded-2xl border border-slate-200 p-4 font-semibold text-[#07345b] hover:border-[#c99b2d]">Vagas</Link>
            <Link to="/carreira/empresa/candidaturas" className="rounded-2xl border border-slate-200 p-4 font-semibold text-[#07345b] hover:border-[#c99b2d]">Candidaturas</Link>
          </div>

          {page.primaryHref && (
            <Link
              to={page.primaryHref}
              className="mt-8 inline-flex min-h-12 items-center justify-center rounded-xl bg-[#07345b] px-5 py-3 font-bold text-white shadow-sm hover:bg-[#052844]"
            >
              {page.primaryLabel}
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}

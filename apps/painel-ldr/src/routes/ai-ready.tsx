import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, ShieldCheck, Users, FileCheck2, Brain, ArrowRight } from "lucide-react";\nimport { AiNarrator } from "@/components/ai-ready/ai-narrator";

export const Route = createFileRoute("/ai-ready")({
  head: () => ({
    meta: [
      { title: "AI READY 2026 | LDR RH & Estratégia" },
      { name: "description", content: "Treinamento e kit empresarial para estruturar o uso responsável de inteligência artificial na sua empresa." },
    ],
  }),
  component: AiReadyPage,
});

const items = [
  "Treinamento rápido de alfabetização em IA",
  "Acesso para até 10 colaboradores",
  "Certificado individual de conclusão",
  "Modelo de Política Interna de Uso de IA",
  "Checklist de uso responsável",
  "Inventário de ferramentas de IA",
  "Guia prático para RH e lideranças",
  "Atualizações dos materiais durante 12 meses",
];

function AiReadyPage() {
  return (
    <main className="min-h-screen bg-[#f7f3e9] text-[#0b2341]">
      <section className="bg-[#071426] px-5 py-16 text-white sm:py-24">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-black uppercase tracking-[.25em] text-[#d6ad63]">AI READY 2026 · by LDR RH & Estratégia</p>
          <h1 className="mt-5 max-w-4xl font-serif text-4xl font-bold leading-tight sm:text-6xl">Sua empresa já usa Inteligência Artificial?</h1>
          <p className="mt-6 max-w-3xl text-base leading-7 text-white/80 sm:text-lg">Prepare sua equipe para utilizar ferramentas de IA com mais consciência, segurança, revisão humana e boas práticas — com treinamento e documentos prontos para implementar.</p>
          <div className="mt-7 max-w-3xl rounded-2xl border border-white/15 bg-white/10 p-4"><p className="mb-3 text-sm font-bold text-[#f4dba8]">▶ Ouça uma prévia do AI READY 2026</p><AiNarrator compact label="Ouvir apresentação" text="Bem-vindo ao AI READY 2026, da LDR RH e Estratégia. Sua equipe já utiliza inteligência artificial no trabalho? Neste treinamento, você vai aprender como usar IA com mais consciência, proteger informações da empresa, reconhecer respostas que precisam de verificação, aplicar revisão humana e criar regras claras para o uso profissional. O objetivo não é impedir a inteligência artificial. É ajudar sua empresa a utilizá-la com responsabilidade, método e supervisão." /></div>\n          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/cliente/login" search={{ redirect: "/cliente/ai-ready" } as never} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#d6ad63] px-6 font-black text-[#071426]">Preparar minha empresa <ArrowRight className="h-4 w-4"/></Link>
            <a href="#conteudo" className="inline-flex min-h-12 items-center rounded-xl border border-white/25 px-6 font-bold text-white">Ver o que está incluído</a>
          </div>
        </div>
      </section>

      <section id="conteudo" className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_.8fr]">
          <div>
            <p className="text-xs font-black uppercase tracking-[.18em] text-[#9a6c20]">Kit empresarial completo</p>
            <h2 className="mt-3 font-serif text-3xl font-bold sm:text-4xl">Do uso informal de IA a uma prática mais organizada.</h2>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">{items.map(item=><div key={item} className="flex gap-3 rounded-2xl border border-[#e3d7bd] bg-white p-4"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#9a6c20]"/><span className="text-sm font-semibold leading-6">{item}</span></div>)}</div>
          </div>
          <aside className="rounded-[28px] bg-white p-7 shadow-lg">
            <p className="text-xs font-black uppercase tracking-[.18em] text-[#9a6c20]">Oferta de lançamento</p>
            <div className="mt-4 flex items-end gap-2"><strong className="font-serif text-5xl">€49</strong><span className="pb-1 text-sm text-slate-500">por empresa</span></div>
            <p className="mt-2 text-sm text-slate-600">Brasil: R$297 · até 10 colaboradores.</p>
            <Link to="/cliente/login" search={{ redirect: "/cliente/ai-ready" } as never} className="mt-6 flex min-h-12 items-center justify-center rounded-xl bg-[#0b2341] px-5 font-black text-white">Começar agora</Link>
            <p className="mt-4 text-xs leading-5 text-slate-500">Pagamento único da oferta de lançamento. O AI READY 2026 é um programa educacional e de apoio à organização interna. Não é certificação governamental, parecer jurídico nem garantia de conformidade regulatória.</p>
          </aside>
        </div>
      </section>

      <section className="bg-white px-5 py-14">
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">
          <div className="rounded-2xl border p-6"><Brain className="h-7 w-7 text-[#9a6c20]"/><h3 className="mt-4 font-serif text-2xl font-bold">Capacitação</h3><p className="mt-2 text-sm leading-6 text-slate-600">Fundamentos, privacidade, revisão humana, erros de IA e boas práticas no trabalho.</p></div>
          <div className="rounded-2xl border p-6"><FileCheck2 className="h-7 w-7 text-[#9a6c20]"/><h3 className="mt-4 font-serif text-2xl font-bold">Documentação</h3><p className="mt-2 text-sm leading-6 text-slate-600">Modelos editáveis para ajudar RH e liderança a organizar orientações internas.</p></div>
          <div className="rounded-2xl border p-6"><Users className="h-7 w-7 text-[#9a6c20]"/><h3 className="mt-4 font-serif text-2xl font-bold">Até 10 pessoas</h3><p className="mt-2 text-sm leading-6 text-slate-600">Uma compra empresarial permite iniciar a capacitação de uma pequena equipe.</p></div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-14">
        <div className="rounded-[28px] border border-[#d8c79f] bg-[#fffaf0] p-7">
          <div className="flex items-center gap-3"><ShieldCheck className="h-7 w-7 text-[#9a6c20]"/><h2 className="font-serif text-2xl font-bold">Uso responsável, sem promessas enganosas.</h2></div>
          <p className="mt-4 text-sm leading-6 text-slate-700">O conteúdo ajuda a empresa a estruturar capacitação e documentação sobre uso de IA. A adequação jurídica depende do contexto, das ferramentas utilizadas e das obrigações aplicáveis a cada organização.</p>
        </div>
      </section>
    </main>
  );
}

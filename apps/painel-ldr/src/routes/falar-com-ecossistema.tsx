import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/falar-com-ecossistema")({
  head: () => ({
    meta: [
      { title: "Falar com o Ecossistema | LDR" },
      { name: "description", content: "Central de suporte, serviços e contato do Ecossistema LDR." },
    ],
  }),
  component: EcosystemSupport,
});

function EcosystemSupport() {
  return (
    <main className="min-h-screen bg-[#f8f1e7] px-5 py-12 text-[#25170f]">
      <section className="mx-auto max-w-3xl">
        <Link to="/ecossistema" className="text-sm font-bold text-[#8a4c18]">← Voltar ao Ecossistema</Link>
        <div className="mt-6 rounded-[32px] border border-[#d6ad63]/50 bg-white p-6 shadow-xl sm:p-9">
          <p className="text-xs font-black uppercase tracking-[.2em] text-[#9a6a20]">Central única de atendimento</p>
          <h1 className="mt-3 font-serif text-4xl font-bold sm:text-5xl">Falar com o Ecossistema</h1>
          <p className="mt-4 text-base leading-7 text-[#6f6358]">
            Quer conhecer nossos projetos, solicitar um serviço, tirar uma dúvida ou falar comigo? <strong>Venha falar comigo também.</strong>
          </p>
          <p className="mt-3 text-sm font-bold text-[#1d3158]">Prazo de resposta: até 7 dias.</p>
          <p className="mt-6 rounded-2xl border border-[#d6ad63]/40 bg-[#fffaf2] p-4 text-sm leading-6 text-[#6f6358]">
            Estamos preparando o formulário seguro desta central. Não envie dados clínicos, senhas, informações financeiras ou outros dados sensíveis.
          </p>
        </div>
      </section>
    </main>
  );
}

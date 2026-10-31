import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/aquisicao")({
  head: () => ({
    meta: [
      { title: "Aquisição estratégica | Ecossistema LDR" },
      { name: "description", content: "Oportunidade confidencial de aquisição de ativos tecnológicos do Ecossistema LDR." },
      { name: "robots", content: "noindex,follow" },
    ],
  }),
  component: AcquisitionPage,
});

function AcquisitionPage() {
  return (
    <main className="min-h-screen bg-[#f8f6f1] text-[#12243a]">
      <section className="bg-[#071426] px-5 py-20 text-white sm:py-28">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-bold uppercase tracking-[.24em] text-[#e0bb77]">Ecossistema LDR · Oportunidade estratégica</p>
          <h1 className="mt-5 max-w-4xl font-serif text-4xl font-semibold leading-tight sm:text-6xl">Aquisição de ativos tecnológicos e plataformas digitais</h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-white/80 sm:text-lg">O Ecossistema LDR está aberto a propostas de aquisição integral dos ativos tecnológicos incluídos na operação. Empresas e investidores podem solicitar uma apresentação institucional confidencial.</p>
          <a href="https://suporte.ldrrhestrategia.com/falar-com-ecossistema" className="mt-8 inline-flex min-h-12 items-center justify-center rounded-xl bg-[#e0bb77] px-6 py-3 font-bold text-[#071426] hover:bg-[#f1d49b]">Solicitar informações sobre aquisição</a>
        </div>
      </section>
      <section className="mx-auto max-w-5xl px-5 py-16">
        <h2 className="font-serif text-3xl font-semibold">Um ecossistema de soluções digitais</h2>
        <p className="mt-4 max-w-3xl leading-8 text-slate-700">A estrutura reúne módulos voltados a educação online, recrutamento, empregabilidade, gestão de profissionais, agendamento de serviços e administração de plataformas. As soluções encontram-se em diferentes fases de desenvolvimento e validação.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {["Educação e aprendizagem", "Recrutamento e carreira", "Serviços e administração"].map((item) => <div key={item} className="rounded-2xl border border-[#e3dac9] bg-white p-6 font-semibold shadow-sm">{item}</div>)}
        </div>
        <div className="mt-12 rounded-2xl border border-[#e3dac9] bg-white p-7">
          <h2 className="font-serif text-2xl font-semibold">Condições da oportunidade</h2>
          <p className="mt-3 leading-7 text-slate-700">A proposta contempla a negociação de 100% dos ativos transferíveis expressamente definidos em contrato, sujeita à análise técnica, jurídica e documental. O projeto encontra-se em estágio pré-receita, sem receita recorrente verificada. Ativos pessoais, dados de terceiros e recursos sem direitos de transferência comprovados não integram automaticamente a operação.</p>
          <p className="mt-4 text-sm text-slate-600">As condições comerciais, o perímetro de ativos e o plano de transferência serão apresentados de forma confidencial a interessados qualificados.</p>
        </div>
      </section>
      <footer className="border-t border-[#e3dac9] px-5 py-8 text-center text-sm text-slate-600">Equipe do Ecossistema LDR · <a className="underline" href="https://suporte.ldrrhestrategia.com/falar-com-ecossistema">Contato institucional</a></footer>
    </main>
  );
}

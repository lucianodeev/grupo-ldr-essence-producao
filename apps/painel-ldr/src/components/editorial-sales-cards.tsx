export function EditorialSalesCards(){
  return <section id="editorial-ldr-sales" className="bg-[#f7f3e9] px-4 py-14 sm:px-6">
    <div className="mx-auto max-w-7xl">
      <div className="mb-7 max-w-3xl">
        <p className="text-xs font-black uppercase tracking-[.2em] text-[#a77b2e]">JORNAL & REVISTA LDR</p>
        <h2 className="mt-2 font-serif text-3xl text-[#071426] sm:text-4xl">Informação e inspiração, toda semana.</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">Assinaturas editoriais independentes da Biblioteca LDR. Jornal e Revista são contratados separadamente.</p>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <a href="/cliente/biblioteca/jornal-ldr" className="rounded-[28px] bg-gradient-to-br from-[#071426] via-[#0b2341] to-[#163b67] p-7 text-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl">
          <p className="text-xs font-black uppercase tracking-[.2em] text-[#d6ad63]">📰 JORNAL LDR</p>
          <h3 className="mt-3 font-serif text-3xl text-[#fff7e7]">O mundo em movimento</h3>
          <p className="mt-3 text-sm leading-6 text-white/75">Negócios, ciência, tecnologia, mundo e entretenimento em uma edição digital.</p>
          <div className="mt-6"><p className="text-2xl font-black">R$ 0,90 / semana</p><p className="mt-1 font-black text-[#d6ad63]">€ 0,90 / semana</p></div>
          <span className="mt-6 inline-block rounded-xl bg-[#d6ad63] px-5 py-3 text-xs font-black text-[#281605]">ASSINAR JORNAL LDR</span>
        </a>
        <a href="/cliente/biblioteca/revista-ldr" className="rounded-[28px] bg-gradient-to-br from-[#4c071d] via-[#6b0d2b] to-[#2a0a15] p-7 text-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl">
          <p className="text-xs font-black uppercase tracking-[.2em] text-[#f0c775]">📖 REVISTA LDR</p>
          <h3 className="mt-3 font-serif text-3xl text-[#fff7e7]">Ideias que movem pessoas e negócios</h3>
          <p className="mt-3 text-sm leading-6 text-white/75">Carreira, empreendedorismo, comportamento, inovação e histórias que inspiram.</p>
          <div className="mt-6"><p className="text-2xl font-black">R$ 0,90 / semana</p><p className="mt-1 font-black text-[#f0c775]">€ 0,90 / semana</p></div>
          <span className="mt-6 inline-block rounded-xl bg-[#f0c775] px-5 py-3 text-xs font-black text-[#35101e]">ASSINAR REVISTA LDR</span>
        </a>
      </div>
      <p className="mt-4 text-xs text-slate-500">Biblioteca LDR, Jornal LDR e Revista LDR possuem assinaturas independentes.</p>
    </div>
  </section>;
}

from pathlib import Path

p = Path('apps/painel-ldr/src/components/library-sales-home.tsx')
s = p.read_text(encoding='utf-8')

if 'id="editorial-ldr"' in s:
    raise SystemExit(0)

section = r'''

    <section id="editorial-ldr" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-6 max-w-3xl">
        <p className="text-xs font-black uppercase tracking-[.22em] text-[#a77b2e]">JORNAL & REVISTA LDR</p>
        <h2 className="mt-2 font-serif text-3xl text-[#071426] sm:text-4xl">Informação e inspiração, toda semana.</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">Assinaturas editoriais independentes da Biblioteca LDR. Assine o Jornal ou a Revista separadamente.</p>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <a href="/cliente/biblioteca/jornal-ldr" className="group rounded-[28px] bg-gradient-to-br from-[#071426] via-[#0b2341] to-[#163b67] p-6 text-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl sm:p-8">
          <p className="text-xs font-black uppercase tracking-[.2em] text-[#d6ad63]">📰 JORNAL LDR</p>
          <h3 className="mt-3 font-serif text-3xl text-[#fff7e7]">O mundo em movimento</h3>
          <p className="mt-3 text-sm leading-6 text-white/75">Negócios, ciência, tecnologia, mundo e entretenimento em uma edição digital.</p>
          <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
            <div><p className="text-2xl font-black">R$ 0,90 <span className="text-sm font-semibold text-white/60">/ semana</span></p><p className="mt-1 text-sm font-bold text-[#d6ad63]">€ 0,90 / semana</p></div>
            <span className="rounded-xl bg-[#d6ad63] px-4 py-3 text-xs font-black text-[#281605]">ASSINAR JORNAL →</span>
          </div>
        </a>
        <a href="/cliente/biblioteca/revista-ldr" className="group rounded-[28px] bg-gradient-to-br from-[#4c071d] via-[#6b0d2b] to-[#2a0a15] p-6 text-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl sm:p-8">
          <p className="text-xs font-black uppercase tracking-[.2em] text-[#f0c775]">📖 REVISTA LDR</p>
          <h3 className="mt-3 font-serif text-3xl text-[#fff7e7]">Ideias que movem pessoas e negócios</h3>
          <p className="mt-3 text-sm leading-6 text-white/75">Carreira, empreendedorismo, comportamento, inovação e histórias que inspiram.</p>
          <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
            <div><p className="text-2xl font-black">R$ 0,90 <span className="text-sm font-semibold text-white/60">/ semana</span></p><p className="mt-1 text-sm font-bold text-[#f0c775]">€ 0,90 / semana</p></div>
            <span className="rounded-xl bg-[#f0c775] px-4 py-3 text-xs font-black text-[#35101e]">ASSINAR REVISTA →</span>
          </div>
        </a>
      </div>
      <p className="mt-4 text-xs text-slate-500">Jornal LDR, Revista LDR e Biblioteca LDR possuem assinaturas separadas. A contratação de uma não libera automaticamente as outras.</p>
    </section>
'''

idx = s.rfind('</main>')
if idx < 0:
    raise SystemExit('Closing </main> not found')
s = s[:idx] + section + s[idx:]
p.write_text(s, encoding='utf-8')

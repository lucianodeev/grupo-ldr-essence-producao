from pathlib import Path

p = Path('apps/painel-ldr/src/routes/_clientarea.cliente.biblioteca.tsx')
s = p.read_text(encoding='utf-8')
old = '''      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl bg-[#5b0824] p-4 text-white"><BookOpen className="h-5 w-5"/><p className="mt-3 text-xs font-black uppercase tracking-wide">eBooks</p></div>
        <div className="rounded-2xl bg-[#0b2341] p-4 text-white"><BookOpen className="h-5 w-5"/><p className="mt-3 text-xs font-black uppercase tracking-wide">Livros</p></div>
        <div className="rounded-2xl bg-[#d6ad63] p-4 text-[#281605]"><GraduationCap className="h-5 w-5"/><p className="mt-3 text-xs font-black uppercase tracking-wide">Treinamentos</p></div>
        <div className="rounded-2xl bg-[#35101e] p-4 text-white"><Film className="h-5 w-5"/><p className="mt-3 text-xs font-black uppercase tracking-wide">{copy.film}</p></div>
      </div>'''
new = '''      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <a href="#library-ebook_coragem_comecar" className="rounded-2xl bg-[#5b0824] p-4 text-white transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#d6ad63]"><BookOpen className="h-5 w-5"/><p className="mt-3 text-xs font-black uppercase tracking-wide">eBooks</p></a>
        <a href="#library-livro_menino_mamao" className="rounded-2xl bg-[#0b2341] p-4 text-white transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#d6ad63]"><BookOpen className="h-5 w-5"/><p className="mt-3 text-xs font-black uppercase tracking-wide">Livros</p></a>
        <a href="#library-training" className="rounded-2xl bg-[#d6ad63] p-4 text-[#281605] transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#0b2341]"><GraduationCap className="h-5 w-5"/><p className="mt-3 text-xs font-black uppercase tracking-wide">Treinamentos</p></a>
        <a href="#library-film" className="rounded-2xl bg-[#35101e] p-4 text-white transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#d6ad63]"><Film className="h-5 w-5"/><p className="mt-3 text-xs font-black uppercase tracking-wide">{copy.film}</p></a>
      </div>'''
if old not in s:
    raise SystemExit('category block not found; refusing broad edit')
s = s.replace(old, new, 1)
s = s.replace('<article key={product.key} className="group flex min-h-[350px]', '<article id={`library-${product.key}`} key={product.key} className="group scroll-mt-24 flex min-h-[350px]', 1)
s = s.replace('<article className="flex min-h-[350px] min-w-0 flex-col overflow-hidden rounded-[24px] border border-[#c9a63a]/70', '<article id="library-training" className="scroll-mt-24 flex min-h-[350px] min-w-0 flex-col overflow-hidden rounded-[24px] border border-[#c9a63a]/70', 1)
s = s.replace('<article className="flex min-h-[350px] min-w-0 flex-col overflow-hidden rounded-[24px] border border-dashed border-[#c9a63a]/70', '<article id="library-film" className="scroll-mt-24 flex min-h-[350px] min-w-0 flex-col overflow-hidden rounded-[24px] border border-dashed border-[#c9a63a]/70', 1)
p.write_text(s, encoding='utf-8')

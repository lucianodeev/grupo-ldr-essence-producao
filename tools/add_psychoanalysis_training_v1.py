from pathlib import Path

# Home: add psychoanalysis sales entry before social proof.
p=Path('apps/painel-ldr/src/routes/index.tsx')
s=p.read_text()
anchor='        <SocialProofSection locale={locale}/>'
block='''        <section className="rounded-[2rem] border border-[#c9a85d] bg-gradient-to-br from-[#2a104e] via-[#4b2077] to-[#27103f] p-6 text-white shadow-xl sm:p-8">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center"><div><p className="text-xs font-black uppercase tracking-[.18em] text-[#e2c372]">NOVA FORMAÇÃO · PSICANÁLISE</p><h2 className="mt-2 font-serif text-3xl font-bold sm:text-4xl">Formação Online em Psicanálise</h2><p className="mt-3 max-w-3xl leading-7 text-white/80">10 módulos · 6 encontros ao vivo · teoria, análise pessoal e supervisão · leituras orientadas · atividades · acesso vitalício aos conteúdos digitais.</p><div className="mt-4 flex flex-wrap gap-3 text-sm"><span className="line-through text-white/55">R$ 599,99 / € 100,56</span><strong className="text-[#f0d58e]">LANÇAMENTO R$ 299,99 / € 49,90</strong></div></div><a href="/formacao-psicanalise" className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-[#d6b86d] px-6 text-center text-sm font-black text-[#32155c]">CONHECER A FORMAÇÃO</a></div>
        </section>

'''
if block not in s:
    if anchor not in s: raise SystemExit('home anchor not found')
    s=s.replace(anchor,block+anchor,1)
    p.write_text(s)

# Library: add psychoanalysis category and compact offer without touching existing commerce.
p=Path('apps/painel-ldr/src/routes/_clientarea.cliente.biblioteca.tsx')
s=p.read_text()
s=s.replace('useState<"ebook"|"book"|"training"|"film"|null>(null)','useState<"ebook"|"book"|"training"|"psychoanalysis"|"film"|null>(null)',1)
# Insert category button before film button using stable visible label pattern.
needle='<button type="button" onClick={()=>setActiveLibraryCategory(activeLibraryCategory==="film"?null:"film")}'
idx=s.find(needle)
if idx<0: raise SystemExit('film category anchor not found')
psy='''<button type="button" onClick={()=>setActiveLibraryCategory(activeLibraryCategory==="psychoanalysis"?null:"psychoanalysis")} className="flex min-w-0 flex-col items-center justify-center rounded-2xl bg-[#5b2b86] px-2 py-3 text-white shadow-sm transition hover:-translate-y-0.5"><GraduationCap className="h-5 w-5 shrink-0"/><span className="mt-2 w-full truncate text-center text-[10px] font-black sm:text-xs">Psicanálise</span></button>\n        '''
if 'activeLibraryCategory==="psychoanalysis"' not in s:
    s=s[:idx]+psy+s[idx:]
# Insert expanded panel before film panel.
film_panel='{activeLibraryCategory==="film"?'
idx=s.find(film_panel)
if idx<0: raise SystemExit('film panel anchor not found')
panel='''{activeLibraryCategory==="psychoanalysis"?<div className="mt-4 rounded-2xl border border-[#cbb7dc] bg-[#f7f0fb] p-4 sm:p-5"><div className="flex items-start gap-3"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#5b2b86] text-white"><GraduationCap className="h-5 w-5"/></div><div className="min-w-0"><p className="font-serif text-lg font-bold text-[#32155c]">Formação Online em Psicanálise</p><p className="mt-1 text-xs leading-5 text-[#66576f]">10 módulos · 6 encontros ao vivo · teoria, análise pessoal e supervisão · atividades e leituras orientadas.</p></div></div><div className="mt-4 rounded-xl bg-white p-3"><p className="text-[10px] font-black uppercase tracking-[.12em] text-[#7b4aa3]">Lançamento · primeiro mês</p><p className="mt-1 text-xs text-muted-foreground"><span className="line-through">R$ 599,99 / € 100,56</span></p><p className="mt-1 font-black text-[#5b2b86]">R$ 299,99 · € 49,90</p><p className="mt-1 text-[11px] text-muted-foreground">Pagamento único · acesso vitalício aos conteúdos digitais.</p></div><a href="/formacao-psicanalise" className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[#5b2b86] px-4 text-sm font-black text-white">Conhecer a formação</a></div>:null}\n        '''
if 'Formação Online em Psicanálise</p>' not in s:
    s=s[:idx]+panel+s[idx:]
p.write_text(s)

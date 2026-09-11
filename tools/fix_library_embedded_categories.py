from pathlib import Path

p = Path('apps/painel-ldr/src/routes/_clientarea.cliente.biblioteca.tsx')
s = p.read_text(encoding='utf-8')

state_old = '  const [comment,setComment]=useState(""); const [productKey,setProductKey]=useState<string>("ebook_coragem_comecar");'
state_new = '  const [comment,setComment]=useState(""); const [productKey,setProductKey]=useState<string>("ebook_coragem_comecar"); const [activeLibraryCategory,setActiveLibraryCategory]=useState<"ebook"|"book"|"training"|"film"|null>(null);'
if state_old not in s:
    raise SystemExit('state anchor not found')
s = s.replace(state_old, state_new, 1)

s = s.replace('  const hasIndividualOffers=data.products.some((p)=>!p.entitled)||!trainingOffer?.entitled;\n', '', 1)

start = s.find('    <section className="rounded-[28px] border border-border/70 bg-background/90 p-4 shadow-sm sm:p-6">')
if start == -1:
    raise SystemExit('library categories section start not found')
end_marker = '\n    <section className="overflow-hidden rounded-[28px] border border-[#d7ad54]/70'
end = s.find(end_marker, start)
if end == -1:
    raise SystemExit('combo section anchor not found')

new_section = '''    <section className="rounded-[28px] border border-border/70 bg-background/90 p-4 shadow-sm sm:p-6">
      <div className="mb-4 flex items-end justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[.18em] text-[#9a6d12]">LDR Plataforma</p><h2 className="mt-1 font-serif text-2xl sm:text-3xl">{sectionTitle}</h2><p className="mt-1 max-w-2xl text-sm text-muted-foreground">{sectionSubtitle}</p></div></div>
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        <button type="button" onClick={()=>setActiveLibraryCategory(activeLibraryCategory==="ebook"?null:"ebook")} className={`min-w-0 rounded-2xl bg-[#5b0824] px-2 py-4 text-center text-white shadow-sm transition ${activeLibraryCategory==="ebook"?"ring-2 ring-[#d6ad63]":""}`}><BookOpen className="mx-auto h-6 w-6"/><p className="mt-2 whitespace-nowrap text-[10px] font-black sm:text-xs">eBooks</p></button>
        <button type="button" onClick={()=>setActiveLibraryCategory(activeLibraryCategory==="book"?null:"book")} className={`min-w-0 rounded-2xl bg-[#0b2341] px-2 py-4 text-center text-white shadow-sm transition ${activeLibraryCategory==="book"?"ring-2 ring-[#d6ad63]":""}`}><BookOpen className="mx-auto h-6 w-6"/><p className="mt-2 whitespace-nowrap text-[10px] font-black sm:text-xs">Livros</p></button>
        <button type="button" onClick={()=>setActiveLibraryCategory(activeLibraryCategory==="training"?null:"training")} className={`min-w-0 rounded-2xl bg-[#d6ad63] px-1 py-4 text-center text-[#281605] shadow-sm transition ${activeLibraryCategory==="training"?"ring-2 ring-[#0b2341]":""}`}><GraduationCap className="mx-auto h-6 w-6"/><p className="mt-2 whitespace-nowrap text-[9px] font-black sm:text-xs">Treinamentos</p></button>
        <button type="button" onClick={()=>setActiveLibraryCategory(activeLibraryCategory==="film"?null:"film")} className={`min-w-0 rounded-2xl bg-[#35101e] px-2 py-4 text-center text-white shadow-sm transition ${activeLibraryCategory==="film"?"ring-2 ring-[#d6ad63]":""}`}><Film className="mx-auto h-6 w-6"/><p className="mt-2 whitespace-nowrap text-[10px] font-black sm:text-xs">{copy.film}</p></button>
      </div>

      {activeLibraryCategory? <div className="mt-4 rounded-2xl border border-border/70 bg-background p-4 shadow-inner sm:p-5">
        {activeLibraryCategory==="ebook" && ebookProduct ? <div><div className="flex items-start gap-3"><div className="rounded-xl bg-[#5b0824] p-3 text-white"><BookOpen className="h-5 w-5"/></div><div className="min-w-0 flex-1"><p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">eBook</p><h3 className="mt-1 font-serif text-xl">A Coragem de Começar</h3>{ebookProduct.entitled?<p className="mt-1 text-xs font-bold text-emerald-700">{copy.accessState}{ebookProgress?` · ${ebookProgress.progress_percent}%`:""}</p>:<p className="mt-1 text-xs font-bold text-[#8a6816]">{copy.buyState}</p>}</div></div>{ebookProduct.entitled?<a href="/cliente/biblioteca/ebook_coragem_comecar" className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground">{copy.readerEbook}</a>:<><p className="mt-4 text-sm font-bold text-primary">{market==="BR"?money(ebookProduct.priceBrlCents,"BRL",locale):money(ebookProduct.priceEurCents,"EUR",locale)}</p><button disabled={checkout.isPending} onClick={()=>checkout.mutate({productKey:"ebook_coragem_comecar",market})} className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground"><ShoppingCart className="h-4 w-4"/>{copy.buy}</button></>}</div>:null}
        {activeLibraryCategory==="book" && bookProduct ? <div><div className="flex items-start gap-3"><div className="rounded-xl bg-[#0b2341] p-3 text-white"><BookOpen className="h-5 w-5"/></div><div className="min-w-0 flex-1"><p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Livro</p><h3 className="mt-1 font-serif text-xl">O Menino que Vendia Mamão</h3>{bookProduct.entitled?<p className="mt-1 text-xs font-bold text-emerald-700">{copy.accessState}{bookProgress?` · ${bookProgress.progress_percent}%`:""}</p>:<p className="mt-1 text-xs font-bold text-[#8a6816]">{copy.buyState}</p>}</div></div>{bookProduct.entitled?<a href="/cliente/biblioteca/livro_menino_mamao" className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground">{copy.readerBook}</a>:<><p className="mt-4 text-sm font-bold text-primary">{market==="BR"?money(bookProduct.priceBrlCents,"BRL",locale):money(bookProduct.priceEurCents,"EUR",locale)}</p><button disabled={checkout.isPending} onClick={()=>checkout.mutate({productKey:"livro_menino_mamao",market})} className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground"><ShoppingCart className="h-4 w-4"/>{copy.buy}</button></>}</div>:null}
        {activeLibraryCategory==="training" ? <div><div className="flex items-start gap-3"><div className="rounded-xl bg-[#d6ad63] p-3 text-[#281605]"><GraduationCap className="h-5 w-5"/></div><div className="min-w-0 flex-1"><p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{copy.trainingMeta}</p><h3 className="mt-1 font-serif text-xl">Do Mamão ao Negócio</h3>{trainingOffer?.entitled?<p className="mt-1 text-xs font-bold text-emerald-700">{copy.accessState} · {trainingOffer.progressPercent}%</p>:<p className="mt-1 text-xs font-bold text-[#8a6816]">{copy.buyState}</p>}</div></div>{trainingOffer?.entitled?<a href="/cliente/treinamentos/do-mamao-ao-negocio" className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground">{copy.accessTraining}</a>:<><p className="mt-4 text-sm font-bold text-primary">{trainingPrice}</p><button disabled={trainingCheckout.isPending||!trainingOffer} onClick={()=>trainingCheckout.mutate(market)} className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground"><ShoppingCart className="h-4 w-4"/>{copy.buyTraining}</button></>}</div>:null}
        {activeLibraryCategory==="film" ? <div><div className="flex items-start gap-3"><div className="rounded-xl bg-[#35101e] p-3 text-white"><Film className="h-5 w-5"/></div><div><p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{copy.film}</p><h3 className="mt-1 font-serif text-xl">{copy.filmTitle}</h3><p className="mt-1 text-xs font-bold text-[#8a6816]">{copy.filmState}</p></div></div><p className="mt-4 text-sm leading-6 text-muted-foreground">{copy.filmText}</p></div>:null}
      </div>:null}
    </section>'''

s = s[:start] + new_section + s[end:]

# Remove the duplicated lower individual product/training cards entirely; access/purchase now lives inside category expansion.
lower_start = s.find('    {hasIndividualOffers?<section className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4"')
if lower_start != -1:
    comments_anchor = '\n    <section className="rounded-[24px] border border-border/70 bg-background p-5 shadow-sm sm:p-6"><h2 className="flex items-center gap-2 font-serif text-2xl"><MessageCircle'
    lower_end = s.find(comments_anchor, lower_start)
    if lower_end == -1:
        raise SystemExit('comments anchor not found while removing duplicate lower cards')
    s = s[:lower_start] + s[lower_end:]

p.write_text(s, encoding='utf-8')

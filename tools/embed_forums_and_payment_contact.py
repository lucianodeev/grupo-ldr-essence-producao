from pathlib import Path

# Psychoanalysis public sales page: add alternative payment contact.
p=Path('apps/painel-ldr/src/components/psychoanalysis-training-page.tsx')
s=p.read_text(encoding='utf-8')
old='''  <p className="mt-3 text-xs leading-5 text-white/70">Pagamento único pelo Stripe: Brasil R$ 299,99 ou Europa € 49,90.</p>\n  <div className="mt-5 grid gap-2"><Link to="/cliente/biblioteca" search={{product:"psychoanalysis"} as any} className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-[#d6b86d] px-5 text-center text-sm font-black text-[#32155c] transition hover:brightness-105">PAGAMENTO ÚNICO PELO STRIPE</Link></div>'''
new='''  <p className="mt-3 text-xs leading-5 text-white/70">Pagamento único pelo Stripe: Brasil R$ 299,99 ou Europa € 49,90.</p>\n  <div className="mt-5 grid gap-2"><Link to="/cliente/biblioteca" search={{product:"psychoanalysis"} as any} className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-[#d6b86d] px-5 text-center text-sm font-black text-[#32155c] transition hover:brightness-105">PAGAMENTO ÚNICO PELO STRIPE</Link><a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-white/25 px-4 text-center text-xs font-bold text-white">Outras formas de pagamento: entre em contato conosco</a></div>'''
if old not in s: raise SystemExit('sales price block anchor not found')
s=s.replace(old,new,1)
p.write_text(s,encoding='utf-8')

# Psychoanalysis student experience: embed forum and add alternative payment contact on protected view.
p=Path('apps/painel-ldr/src/routes/_clientarea.cliente.treinamentos.psicanalise.tsx')
s=p.read_text(encoding='utf-8')
imp='''import { clientSaveProgress } from "@/lib/learning.functions";'''
if 'EmbeddedTrainingForum' not in s:
    s=s.replace(imp,imp+'\nimport { EmbeddedTrainingForum } from "@/components/embedded-training-forum";',1)
state=''' const [state,setState]=useState<Saved>(EMPTY);const [answer,setAnswer]=useState("");'''
if 'showForum' not in s:
    if state not in s: raise SystemExit('psycho state anchor not found')
    s=s.replace(state,state+'const [showForum,setShowForum]=useState(false);',1)
old_link='''<Link to="/cliente/treinamentos/psicanalise/forum" className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-black text-white">Fórum da formação</Link>'''
new_link='''<button type="button" onClick={()=>setShowForum(v=>!v)} className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-black text-white">{showForum?"Fechar fórum":"Fórum da formação"}</button>'''
if old_link in s:s=s.replace(old_link,new_link,1)
else: raise SystemExit('psycho forum link anchor not found')
protected='''<Link to="/formacao-psicanalise" className="rounded-2xl border border-white/25 px-5 py-3 text-sm font-black">Ver página da formação</Link></div></section>;'''
protected_new='''<Link to="/formacao-psicanalise" className="rounded-2xl border border-white/25 px-5 py-3 text-sm font-black">Ver página da formação</Link><a href="https://wa.me/32492923605?text=Ol%C3%A1%2C%20quero%20saber%20sobre%20outras%20formas%20de%20pagamento%20da%20Forma%C3%A7%C3%A3o%20em%20Psican%C3%A1lise." target="_blank" rel="noopener noreferrer" className="rounded-2xl border border-white/25 px-5 py-3 text-center text-sm font-black">Outras formas de pagamento</a></div></section>;'''
if protected not in s: raise SystemExit('psycho protected anchor not found')
s=s.replace(protected,protected_new,1)
req='''  <details className="rounded-[24px] border border-[#d9c77f] bg-[#fffaf0] p-5 shadow-sm sm:p-6"><summary className="cursor-pointer font-serif text-xl font-bold text-[#2f1457]">Requisitos para conclusão</summary>'''
idx=s.find(req)
if idx<0: raise SystemExit('psycho requirements anchor not found')
end=s.find('</details>',idx)
if end<0: raise SystemExit('psycho requirements closing not found')
end+=len('</details>')
insert='''\n  {showForum?<EmbeddedTrainingForum slug="formacao-psicanalise" title="Formação em Psicanálise" accent="#5b2b86" soft="#f8f3fb"/>:null}'''
if 'slug="formacao-psicanalise" title="Formação em Psicanálise"' not in s:
    s=s[:end]+insert+s[end:]
p.write_text(s,encoding='utf-8')

# Do Mamão: forum becomes an internal area in the training experience.
p=Path('apps/painel-ldr/src/routes/_clientarea.cliente.treinamentos.do-mamao-ao-negocio.tsx')
s=p.read_text(encoding='utf-8')
imp='''import { TrainingSlideExperience } from "@/components/training-slide-experience";'''
if 'EmbeddedTrainingForum' not in s:
    s=s.replace(imp,imp+'\nimport { EmbeddedTrainingForum } from "@/components/embedded-training-forum";',1)
s=s.replace('type Area = "inicio" | "aula" | "manual" | "projeto" | "encontros";','type Area = "inicio" | "aula" | "manual" | "projeto" | "encontros" | "forum";',1)
old='''<a href="/cliente/treinamentos/do-mamao-ao-negocio/forum" className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-[#d7ad54] px-5 py-3 font-black text-[#8a1739] sm:w-auto"><MessageCircle className="h-4 w-4"/>Fórum da comunidade</a>'''
new='''<button type="button" onClick={()=>setArea("forum")} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-[#d7ad54] px-5 py-3 font-black text-[#8a1739] sm:w-auto"><MessageCircle className="h-4 w-4"/>Fórum da comunidade</button>'''
if old not in s: raise SystemExit('do mamao forum CTA not found')
s=s.replace(old,new,1)
anchor='''      {area==="encontros"&&<section className={`rounded-3xl border p-5 ${card}`}><h2 className="font-serif text-2xl">'''
if anchor not in s: raise SystemExit('do mamao encontros anchor not found')
forum='''      {area==="forum"&&<EmbeddedTrainingForum slug="do-mamao-ao-negocio" title="Do Mamão ao Negócio" accent="#7f1235" soft="#fff7f2"/>}\n\n'''
s=s.replace(anchor,forum+anchor,1)
p.write_text(s,encoding='utf-8')

# Training hub: remove the impression of a separate forum tab; retain quick comments only.
p=Path('apps/painel-ldr/src/routes/_clientarea.cliente.treinamentos.tsx')
s=p.read_text(encoding='utf-8')
s=s.replace('Fórum e comentários','Comentários da formação')
p.write_text(s,encoding='utf-8')

# Client navigation label: forum is now inside each training.
p=Path('apps/painel-ldr/src/routes/_clientarea.cliente.tsx')
s=p.read_text(encoding='utf-8')
s=s.replace('{ to: "/cliente/treinamentos", label: "Treinamentos e Fórum", icon: GraduationCap },','{ to: "/cliente/treinamentos", label: "Treinamentos", icon: GraduationCap },')
p.write_text(s,encoding='utf-8')

print('embedded forums and payment contact patch applied')

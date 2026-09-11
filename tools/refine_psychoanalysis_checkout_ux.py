from pathlib import Path

# Internal course: keep the commercial references correct and improve mobile module navigation.
p=Path('apps/painel-ldr/src/routes/_clientarea.cliente.treinamentos.psicanalise.tsx')
s=p.read_text(encoding='utf-8')
s=s.replace('Brasil · R$ 299,99','Brasil · 12x de R$ 31,03').replace('Europa · € 49,90','Europa · € 65,34')
s=s.replace('className="rounded-[24px] border border-[#dfd3e8] bg-white p-3 shadow-sm"','className="rounded-[24px] border border-[#dfd3e8] bg-white p-3 shadow-sm lg:sticky lg:top-20 lg:self-start"',1)
s=s.replace('className="grid max-h-[72vh] gap-1 overflow-y-auto"','className="flex gap-2 overflow-x-auto pb-1 lg:grid lg:max-h-[72vh] lg:overflow-y-auto lg:overflow-x-visible"',1)
s=s.replace('className={`rounded-xl px-3 py-3 text-left ${state.module===mi?', 'className={`min-w-[220px] rounded-xl px-3 py-3 text-left lg:min-w-0 ${state.module===mi?',1)
p.write_text(s,encoding='utf-8')

# Library: remove obsolete psychoanalysis promo and keep the Hotmart-aligned reference visible.
p=Path('apps/painel-ldr/src/routes/_clientarea.cliente.biblioteca.tsx')
s=p.read_text(encoding='utf-8')
old='<div className="mt-4 rounded-xl bg-[#f7f0fb] p-3"><p className="text-xs text-muted-foreground"><span className="line-through">{market==="BR"?"R$ 599,99":"€ 100,56"}</span></p><p className="mt-1 text-lg font-black text-[#5b2b86]">{psychoOffer?(market==="BR"?money(psychoOffer.priceBrlCents,"BRL",locale):money(psychoOffer.priceEurCents,"EUR",locale)):(market==="BR"?"R$ 299,99":"€ 49,90")}</p><p className="mt-1 text-[11px] text-muted-foreground">Pagamento único · acesso vitalício aos conteúdos digitais.</p></div>'
new='<div className="mt-4 rounded-xl bg-[#f7f0fb] p-3"><p className="text-[10px] font-black uppercase tracking-[.12em] text-[#7b4aa3]">Valor da formação</p><p className="mt-2 text-lg font-black text-[#5b2b86]">🇧🇷 12x de R$ 31,03</p><p className="mt-1 text-lg font-black text-[#5b2b86]">🇪🇺 € 65,34</p><p className="mt-1 text-[11px] text-muted-foreground">Stripe e Hotmart seguem a mesma referência comercial. Acesso vitalício aos conteúdos digitais.</p></div>'
if old in s:
    s=s.replace(old,new,1)
p.write_text(s,encoding='utf-8')

# Combo Empreendedor is a separate product, but must use the same commercial price reference.
p=Path('apps/painel-ldr/src/lib/client-portal.server.ts')
s=p.read_text(encoding='utf-8')
old='const {getPublicDoMamaoTrainingOffer}=await import("@/lib/training-commerce.server"); const trainingOffer=await getPublicDoMamaoTrainingOffer(); const amountCents=market==="BR"?trainingOffer.priceBrlCents:6534; const currency=market==="BR"?"BRL":"EUR";'
new='const amountCents=market==="BR"?37236:6534; const currency=market==="BR"?"BRL":"EUR";'
if old not in s:
    raise SystemExit('combo checkout price anchor not found')
s=s.replace(old,new,1)
p.write_text(s,encoding='utf-8')

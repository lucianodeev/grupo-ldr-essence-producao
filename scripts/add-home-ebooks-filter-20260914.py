from pathlib import Path

p = Path('apps/painel-ldr/src/components/academy-university-home.tsx')
s = p.read_text(encoding='utf-8')


def replace_once(old: str, new: str, label: str) -> None:
    global s
    count = s.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected exactly 1 occurrence, found {count}')
    s = s.replace(old, new, 1)

# 1) Add eBooks as a real filter kind.
replace_once(
    'type Kind="all"|"psicanalise"|"negocios"|"carreira"|"rh"|"ia";',
    'type Kind="all"|"psicanalise"|"negocios"|"carreira"|"rh"|"ia"|"ebooks";',
    'Kind union',
)

# 2) Add translated filter label without changing any existing labels.
for old, new, label in [
    ('rh:"RH",ai:"Inteligência Artificial",courses:', 'rh:"RH",ai:"Inteligência Artificial",ebooks:"eBooks",courses:', 'PT UI'),
    ('rh:"HR",ai:"Artificial Intelligence",courses:', 'rh:"HR",ai:"Artificial Intelligence",ebooks:"eBooks",courses:', 'EN UI'),
    ('rh:"RH",ai:"Intelligence Artificielle",courses:', 'rh:"RH",ai:"Intelligence Artificielle",ebooks:"eBooks",courses:', 'FR UI'),
    ('rh:"RR. HH.",ai:"Inteligencia Artificial",courses:', 'rh:"RR. HH.",ai:"Inteligencia Artificial",ebooks:"eBooks",courses:', 'ES UI'),
]:
    replace_once(old, new, label)

# 3) Reuse the canonical eBook catalog and current merchandising rules.
anchor = ' const courses=[...CORE,...professional];\n'
if anchor not in s:
    raise SystemExit('courses anchor not found')
insert = ''' const ebookHotKeys=new Set(["ebook_estudos_caso_psicanalise","ebook_psicologia_psicanalise_terapias","ebook_comportamento_humano","ebook_ia_novos_milionarios"]);\n const ebookPremiumKeys=new Set(["ebook_estudos_caso_psicanalise","ebook_psicologia_psicanalise_terapias","ebook_corpo_trabalho_escuta","ebook_ia_novos_milionarios","ebook_imigracao_efeitos_psicologicos"]);\n const filteredEbooks=PSYCHOANALYSIS_EBOOKS.filter(e=>(`${e.title} ${e.subtitle}`).toLowerCase().includes(q.trim().toLowerCase())).sort((a,b)=>(ebookHotKeys.has(b.key)?2:ebookPremiumKeys.has(b.key)?1:0)-(ebookHotKeys.has(a.key)?2:ebookPremiumKeys.has(a.key)?1:0));\n'''
if ' const filteredEbooks=' not in s:
    s = s.replace(anchor, anchor + insert, 1)

# 4) Add the eBooks chip after AI, preserving the current horizontal filter bar.
replace_once(
    '[["all",t.all],["psicanalise",t.psy],["negocios",t.business],["carreira",t.career],["rh",t.rh],["ia",t.ai]];',
    '[["all",t.all],["psicanalise",t.psy],["negocios",t.business],["carreira",t.career],["rh",t.rh],["ia",t.ai],["ebooks",t.ebooks]];',
    'chips list',
)

# 5) When eBooks is active, show only the canonical eBook cards in the same product grid.
old_grid = '{filtered.map(c=><CourseCard key={c.id} c={c} cta={t.know} popularLabel={popularLabel}/>)}'
new_grid = '''{kind==="ebooks"?filteredEbooks.map(e=>{const hot=ebookHotKeys.has(e.key);const premium=ebookPremiumKeys.has(e.key);return <a key={e.key} href={e.publicPath} className="group flex min-h-[300px] flex-col overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"><div className="h-2" style={{background:e.color}}/><div className="flex flex-1 flex-col p-5"><div className="flex flex-wrap gap-2">{hot&&<span className="rounded-full bg-[#071426] px-2.5 py-1 text-[9px] font-black uppercase tracking-[.08em] text-white">{popularLabel}</span>}{premium&&<span className="rounded-full bg-[#d6ad63] px-2.5 py-1 text-[9px] font-black uppercase tracking-[.08em] text-[#281605]">PREMIUM</span>}</div><div className="mt-4 flex items-start justify-between gap-3"><span className="text-3xl">📖</span><span className="rounded-full bg-[#f5f0e6] px-2.5 py-1 text-[9px] font-black uppercase tracking-[.08em] text-[#7a5a22]">eBook</span></div><h3 className="mt-4 font-serif text-xl leading-tight text-[#071426]">{e.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{e.subtitle}</p><div className="mt-auto pt-5"><p className="text-sm font-black text-[#071426]">R$ {(e.priceBrlCents/100).toFixed(2).replace('.',',')} · € {(e.priceEurCents/100).toFixed(2).replace('.',',')}</p><span className="mt-3 inline-flex w-full justify-center rounded-xl bg-[#071426] px-4 py-3 text-xs font-black text-white">{locale==="pt"?"VER EBOOK":locale==="fr"?"VOIR L’EBOOK":locale==="es"?"VER EBOOK":"VIEW EBOOK"} →</span></div></div></a>}):filtered.map(c=><CourseCard key={c.id} c={c} cta={t.know} popularLabel={popularLabel}/>)}'''
replace_once(old_grid, new_grid, 'course grid')

p.write_text(s, encoding='utf-8')

# Guardrails: no unrelated commercial values are changed by this script.
final = p.read_text(encoding='utf-8')
checks = [
    '"ebooks",t.ebooks',
    'kind==="ebooks"?filteredEbooks.map',
    'PSYCHOANALYSIS_EBOOKS.filter',
    'AcademyGiveawayBanner',
    'R$ 299,99 · € 49,90',
]
for check in checks:
    if check not in final:
        raise SystemExit(f'guardrail missing: {check}')
print('eBooks filter patch applied successfully')

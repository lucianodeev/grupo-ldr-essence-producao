from pathlib import Path
import re


def sub_once(text: str, pattern: str, repl: str, label: str, flags: int = 0) -> str:
    out, n = re.subn(pattern, repl, text, count=1, flags=flags)
    if n != 1:
        raise SystemExit(f"{label}: expected 1 replacement, got {n}")
    return out


# Canonical ebook catalog: normalize only legacy STANDARD ebooks.
p = Path("apps/painel-ldr/src/lib/psychoanalysis-ebooks.catalog.ts")
s = p.read_text(encoding="utf-8")
for key in [
    "ebook_pratica_clinica_psicanalise",
    "ebook_psicanalise_no_mundo",
    "ebook_psicanalise_autismo",
]:
    s = sub_once(
        s,
        rf'(key:"{re.escape(key)}".*?priceBrlCents:)2000(, priceEurCents:)399',
        r'\g<1>1990\g<2>490',
        f"catalog {key}",
        re.S,
    )
p.write_text(s, encoding="utf-8")

# Client library metadata mirrors the real commercial rules.
p = Path("apps/painel-ldr/src/lib/client-portal.server.ts")
s = p.read_text(encoding="utf-8")
for key in [
    "ebook_pratica_clinica_psicanalise",
    "ebook_psicanalise_no_mundo",
    "ebook_psicanalise_autismo",
]:
    s = sub_once(
        s,
        rf'(key:"{re.escape(key)}".*?priceBrlCents:)2000(, priceEurCents:)399',
        r'\g<1>1990\g<2>490',
        f"client {key}",
        re.S,
    )
# Estudos de Caso keeps its existing premium rule; only stale metadata is aligned.
s = sub_once(
    s,
    r'(key:"ebook_estudos_caso_psicanalise".*?priceBrlCents:)2000(, priceEurCents:)399',
    r'\g<1>7990\g<2>1490',
    "Estudos de Caso metadata",
    re.S,
)
p.write_text(s, encoding="utf-8")

# Stripe checkout: every fixed ebook uses the same dynamic amount in BR and EUR.
p = Path("apps/painel-ldr/src/lib/fixed-brl-ebook-checkout.server.ts")
s = p.read_text(encoding="utf-8")
if 'ebook_psicanalise_autismo: "Psicanálise e Autismo"' not in s:
    anchor = '  ebook_psicanalise_no_mundo: "A Psicanálise no Mundo",\n'
    if anchor not in s:
        raise SystemExit("checkout map anchor missing")
    s = s.replace(
        anchor,
        anchor + '  ebook_psicanalise_autismo: "Psicanálise e Autismo",\n',
        1,
    )
old = '  if ((!isPremiumCases && !isCollectionOne && input.market !== "BR") || !isFixedBrlEbook(input.productKey)) {'
if old not in s:
    raise SystemExit("checkout market condition missing")
s = s.replace(old, '  if (!isFixedBrlEbook(input.productKey)) {', 1)
p.write_text(s, encoding="utf-8")

# Library popular labels: exactly three free Academy courses.
p = Path("apps/painel-ldr/src/components/academy-accessibility-controls.tsx")
s = p.read_text(encoding="utf-8")
anchor = '  "/cliente/cursos/academy/clinica-psicanalitica-sigmund-freud",\n'
if anchor not in s:
    raise SystemExit("popular free anchor missing")
if '"/cliente/cursos/academy/orientacao-trabalho-cientifico"' not in s:
    s = s.replace(
        anchor,
        anchor + '  "/cliente/cursos/academy/orientacao-trabalho-cientifico",\n',
        1,
    )
anchor2 = '  "/cliente/cursos/academy/orientacao-trabalho-cientifico",\n'
if '"/cliente/cursos/academy/modelos-documentos-psicanaliticos"' not in s:
    s = s.replace(
        anchor2,
        anchor2 + '  "/cliente/cursos/academy/modelos-documentos-psicanaliticos",\n',
        1,
    )
p.write_text(s, encoding="utf-8")

# Main sales Home.
p = Path("apps/painel-ldr/src/components/academy-university-home.tsx")
s = p.read_text(encoding="utf-8")

ebook_import = 'import { PSYCHOANALYSIS_EBOOKS } from "@/lib/psychoanalysis-ebooks.catalog";\n'
if 'import { ACADEMY_FREE_COURSES }' not in s:
    if ebook_import not in s:
        raise SystemExit("home import anchor missing")
    s = s.replace(
        ebook_import,
        ebook_import + 'import { ACADEMY_FREE_COURSES } from "@/lib/academy-free-courses.catalog";\n',
        1,
    )

old_type = 'type Course={id:string;title:string;desc:string;meta:string;price:string;href:string;kind:Exclude<Kind,"all">;icon:string;accent:string};'
new_type = 'type Course={id:string;title:string;desc:string;meta:string;price:string;href:string;kind:Exclude<Kind,"all">;icon:string;accent:string;popular?:boolean};'
if old_type in s:
    s = s.replace(old_type, new_type, 1)
elif new_type not in s:
    raise SystemExit("Course type missing")

# Match the same popular products already used by the Library when they exist in the Home catalog.
for cid in ["psy-intl", "performance", "ai"]:
    old = f'{{id:"{cid}",'
    new = f'{{id:"{cid}",popular:true,'
    if new not in s:
        if old not in s:
            raise SystemExit(f"CORE course missing {cid}")
        s = s.replace(old, new, 1)

old_prof = 'href:f.publicPath,kind,icon:f.icon,accent:themeAccent[f.theme]??"#6D3FA0"};});'
new_prof = 'href:f.publicPath,kind,icon:f.icon,accent:themeAccent[f.theme]??"#6D3FA0",popular:["aba-autismo","ciencias-felicidade","tricologia-terapia-capilar"].includes(f.slug)};});'
if old_prof in s:
    s = s.replace(old_prof, new_prof, 1)
elif new_prof not in s:
    raise SystemExit("professional formation map missing")

# Keep the three legacy free entries and add ALL current Academy free courses from the real catalog.
s = sub_once(
    s,
    r"const FREE=\[.*?\n\];",
    '''const LEGACY_FREE=[
 {title:"Organizar minha Carreira",desc:"Planejamento e próximos passos profissionais.",href:"/cliente/cursos/organizar-carreira",icon:"💼"},
 {title:"Francês para Negócios A1",desc:"Francês básico aplicado a situações profissionais.",href:"/cliente/cursos/frances-negocios-a1",icon:"🇫🇷"},
 {title:"Primeiros Socorros",desc:"Noções essenciais para situações de emergência.",href:"/cliente/cursos/primeiros-socorros",icon:"⛑️"},
] as const;''',
    "free list",
    re.S,
)

marker = ' const courses=[...CORE,...professional];\n'
if marker not in s:
    raise SystemExit("home courses marker missing")
logic = ''' const popularLabel=locale==="pt"?"MAIS PROCURADO":locale==="fr"?"LE PLUS RECHERCHÉ":locale==="es"?"MÁS BUSCADO":"MOST POPULAR";
 const freeBadge=locale==="pt"?"GRÁTIS":locale==="fr"?"GRATUIT":locale==="es"?"GRATIS":"FREE";
 const freeCourses=[
   ...LEGACY_FREE.map(x=>({...x,popular:false})),
   ...ACADEMY_FREE_COURSES.map(c=>({title:c.name[locale],desc:c.description[locale],href:`/cliente/cursos/academy/${c.slug}`,icon:"🎓",popular:["clinica-psicanalitica-sigmund-freud","orientacao-trabalho-cientifico","modelos-documentos-psicanaliticos"].includes(c.slug)})),
 ].sort((a,b)=>Number(Boolean(b.popular))-Number(Boolean(a.popular)));
'''
if ' const freeCourses=[' not in s:
    s = s.replace(marker, logic + marker, 1)

old_filtered = ' const filtered=useMemo(()=>courses.filter(c=>(kind==="all"||c.kind===kind)&&(`${c.title} ${c.desc}`).toLowerCase().includes(q.trim().toLowerCase())),[courses,kind,q]);'
new_filtered = ' const filtered=useMemo(()=>courses.filter(c=>(kind==="all"||c.kind===kind)&&(`${c.title} ${c.desc}`).toLowerCase().includes(q.trim().toLowerCase())).sort((a,b)=>Number(Boolean(b.popular))-Number(Boolean(a.popular))),[courses,kind,q]);'
if old_filtered in s:
    s = s.replace(old_filtered, new_filtered, 1)
elif new_filtered not in s:
    raise SystemExit("filtered expression missing")

old_sig = 'function CourseCard({c,cta}:{c:Course;cta:string})'
new_sig = 'function CourseCard({c,cta,popularLabel}:{c:Course;cta:string;popularLabel:string})'
if old_sig in s:
    s = s.replace(old_sig, new_sig, 1)
elif new_sig not in s:
    raise SystemExit("CourseCard signature missing")

card_anchor = '<div className="flex flex-1 flex-col p-5"><div className="flex items-start justify-between gap-3">'
card_new = '<div className="flex flex-1 flex-col p-5">{c.popular&&<span className="mb-3 w-fit rounded-full bg-[#071426] px-2.5 py-1 text-[9px] font-black uppercase tracking-[.08em] text-white">{popularLabel}</span>}<div className="flex items-start justify-between gap-3">'
if card_anchor in s:
    s = s.replace(card_anchor, card_new, 1)
elif card_new not in s:
    raise SystemExit("CourseCard body missing")

if '<CourseCard key={c.id} c={c} cta={t.know}/>' in s:
    s = s.replace(
        '<CourseCard key={c.id} c={c} cta={t.know}/>',
        '<CourseCard key={c.id} c={c} cta={t.know} popularLabel={popularLabel}/>',
        1,
    )

if '{FREE.map(x=>' in s:
    s = s.replace('{FREE.map(x=>', '{freeCourses.map(x=>', 1)

free_anchor = 'className="rounded-2xl border border-slate-200 bg-[#fbfaf6] p-5 transition hover:-translate-y-1 hover:shadow-md"><span className="text-3xl">{x.icon}</span>'
free_new = 'className="rounded-2xl border border-slate-200 bg-[#fbfaf6] p-5 transition hover:-translate-y-1 hover:shadow-md"><div className="mb-3 flex flex-wrap gap-2">{x.popular&&<span className="rounded-full bg-[#071426] px-2.5 py-1 text-[9px] font-black uppercase tracking-[.08em] text-white">{popularLabel}</span>}<span className="rounded-full bg-emerald-700 px-2.5 py-1 text-[9px] font-black uppercase tracking-[.08em] text-white">{freeBadge}</span></div><span className="block text-3xl">{x.icon}</span>'
if free_anchor in s:
    s = s.replace(free_anchor, free_new, 1)
elif free_new not in s:
    raise SystemExit("free card body missing")

# The generic eBooks card becomes navigation to the actual ebook showcase.
old_book = '<a href="/cliente/biblioteca" className="rounded-xl bg-[#071426] p-5 text-white"><span className="text-3xl">📱</span><h3 className="mt-4 font-serif text-xl">eBooks LDR</h3><p className="mt-2 text-sm text-white/70">Conteúdo digital</p></a>'
new_book = '<a href="#ebooks-home" className="rounded-xl bg-[#071426] p-5 text-white"><span className="text-3xl">📚</span><h3 className="mt-4 font-serif text-xl">{locale==="pt"?"Ver todos os eBooks":locale==="fr"?"Voir tous les eBooks":locale==="es"?"Ver todos los eBooks":"View all eBooks"}</h3><p className="mt-2 text-sm text-white/70">{locale==="pt"?"Conheça a coleção completa da LDR Essence Academy.":locale==="fr"?"Découvrez la collection complète de la LDR Essence Academy.":locale==="es"?"Conoce la colección completa de LDR Essence Academy.":"Discover the complete LDR Essence Academy collection."}</p></a>'
if old_book in s:
    s = s.replace(old_book, new_book, 1)
elif new_book not in s:
    raise SystemExit("bookstore ebook CTA missing")

# Put the subscription CTA after the product showcase when it is currently before ebooks.
sub_start = s.rfind('  <section className="bg-[#071426] text-white">')
ebook_start = s.find('  <section id="ebooks-home"')
main_end = s.rfind(' </main>;')
if sub_start != -1 and ebook_start != -1 and main_end != -1 and sub_start < ebook_start:
    subscription = s[sub_start:ebook_start]
    ebook_block = s[ebook_start:main_end]
    s = s[:sub_start] + ebook_block + "\n" + subscription + s[main_end:]

p.write_text(s, encoding="utf-8")

# Guardrails: preserve premium and Estudos rules while normalizing standards.
cat = Path("apps/painel-ldr/src/lib/psychoanalysis-ebooks.catalog.ts").read_text(encoding="utf-8")
if cat.count("priceBrlCents:1990, priceEurCents:490") < 7:
    raise SystemExit("standard prices not normalized")
if cat.count("priceBrlCents:4990, priceEurCents:990") < 4:
    raise SystemExit("premium prices changed")
if "priceBrlCents:7990, priceEurCents:1490" not in cat:
    raise SystemExit("Estudos de Caso price changed")

print("Academy storefront/pricing patch applied successfully")

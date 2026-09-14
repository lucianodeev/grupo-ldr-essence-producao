from pathlib import Path
import re

ROOT = Path('apps/painel-ldr/src')

prices = {
    'ebook_psicologia_psicanalise_terapias': (4990, 990),
    'ebook_jornalismo_era_digital': (1990, 490),
    'ebook_corpo_trabalho_escuta': (4990, 990),
    'ebook_comportamento_humano': (1990, 490),
    'ebook_estetica_bem_estar': (1990, 490),
    'ebook_tricologia_cuidado': (1990, 490),
    'ebook_ia_novos_milionarios': (4990, 990),
    'ebook_imigracao_efeitos_psicologicos': (4990, 990),
}


def replace_prices(path: Path):
    text = path.read_text()
    original = text
    for key, (brl, eur) in prices.items():
        pat = rf"(key\s*:\s*['\"]{re.escape(key)}['\"][\s\S]*?priceBrlCents\s*:\s*)\d+(\s*,\s*priceEurCents\s*:\s*)\d+"
        text, n = re.subn(pat, rf"\g<1>{brl}\g<2>{eur}", text, count=1)
        if n != 1:
            raise SystemExit(f'Price block not found exactly once for {key} in {path}')
    path.write_text(text)
    if text == original:
        raise SystemExit(f'No price changes made in {path}')

replace_prices(ROOT / 'lib/psychoanalysis-ebooks.catalog.ts')
replace_prices(ROOT / 'lib/client-portal.server.ts')

# Real Stripe checkout amounts: preserve Estudos de Caso, split Collection 1 into 4 standard + 4 premium.
checkout = ROOT / 'lib/fixed-brl-ebook-checkout.server.ts'
text = checkout.read_text()
old = '''  const isPremiumCases = input.productKey === "ebook_estudos_caso_psicanalise";\n  // Estudos de Caso possui preço promocional próprio nos dois mercados.\n  // Os demais eBooks fixos continuam interceptados somente no BRL.\n  const isCollectionOne = ['ebook_psicologia_psicanalise_terapias', 'ebook_jornalismo_era_digital', 'ebook_corpo_trabalho_escuta', 'ebook_comportamento_humano', 'ebook_estetica_bem_estar', 'ebook_tricologia_cuidado', 'ebook_ia_novos_milionarios', 'ebook_imigracao_efeitos_psicologicos'].includes(input.productKey as any);\n'''
new = '''  const isPremiumCases = input.productKey === "ebook_estudos_caso_psicanalise";\n  const premiumCollectionOne = new Set<DigitalProductKey>([\n    "ebook_psicologia_psicanalise_terapias",\n    "ebook_corpo_trabalho_escuta",\n    "ebook_ia_novos_milionarios",\n    "ebook_imigracao_efeitos_psicologicos",\n  ]);\n  const isPremiumCollectionOne = premiumCollectionOne.has(input.productKey);\n  // Estudos de Caso mantém o preço atual. A Coleção 1 é dividida em padrão e Premium.\n  const isCollectionOne = ['ebook_psicologia_psicanalise_terapias', 'ebook_jornalismo_era_digital', 'ebook_corpo_trabalho_escuta', 'ebook_comportamento_humano', 'ebook_estetica_bem_estar', 'ebook_tricologia_cuidado', 'ebook_ia_novos_milionarios', 'ebook_imigracao_efeitos_psicologicos'].includes(input.productKey as any);\n'''
if old not in text:
    raise SystemExit('Checkout premium anchor not found')
text = text.replace(old, new, 1)
old_amount = '  const amountCents = isPremiumCases ? (input.market === "BR" ? 7990 : 1490) : (input.market === "BR" ? 2000 : 399);'
new_amount = '  const amountCents = isPremiumCases ? (input.market === "BR" ? 7990 : 1490) : isPremiumCollectionOne ? (input.market === "BR" ? 4990 : 990) : (input.market === "BR" ? 1990 : 490);'
if old_amount not in text:
    raise SystemExit('Checkout amount anchor not found')
text = text.replace(old_amount, new_amount, 1)
text = text.replace('description: isPremiumCases ? "eBook Premium · compra digital pela Biblioteca / Plataforma" : "Compra digital pela Biblioteca / Plataforma",', 'description: (isPremiumCases || isPremiumCollectionOne) ? "eBook Premium · compra digital pela Biblioteca / Plataforma" : "Compra digital pela Biblioteca / Plataforma",', 1)
text = text.replace('metadata: { product_key: input.productKey, market: input.market, auth_user_id: userId, fixed_price: true, premium: isPremiumCases },', 'metadata: { product_key: input.productKey, market: input.market, auth_user_id: userId, fixed_price: true, premium: isPremiumCases || isPremiumCollectionOne },', 1)
text = text.replace('metadata: { product_key: input.productKey, market: input.market, auth_user_id: userId, stripe_price_id: null, fixed_price: true, premium: isPremiumCases },', 'metadata: { product_key: input.productKey, market: input.market, auth_user_id: userId, stripe_price_id: null, fixed_price: true, premium: isPremiumCases || isPremiumCollectionOne },', 1)
checkout.write_text(text)

# Sales home: reuse the central ebook catalog and add one complete showcase before the existing free-courses section.
home = ROOT / 'components/library-sales-home.tsx'
text = home.read_text()
import_anchor = 'import { librarySalesCardCatalog } from "@/lib/library-sales-card-i18n";\n'
if 'PSYCHOANALYSIS_EBOOKS' not in text:
    if import_anchor not in text:
        raise SystemExit('Home import anchor not found')
    text = text.replace(import_anchor, import_anchor + 'import { PSYCHOANALYSIS_EBOOKS } from "@/lib/psychoanalysis-ebooks.catalog";\n', 1)

section_anchor = '    <section id="gratuitos"'
if section_anchor not in text:
    raise SystemExit('Free section anchor not found')

showcase = '''    <section id="ebooks" className="mx-auto max-w-7xl px-4 py-14 sm:px-6">\n      <div className="max-w-3xl">\n        <p className="text-xs font-black uppercase tracking-[.18em] text-[#9b6a24]">LDR ESSENCE ACADEMY · EBOOKS</p>\n        <h2 className="mt-2 font-serif text-3xl font-bold sm:text-4xl">{locale==="pt"?"Ebooks para estudar, aplicar e ampliar conhecimentos":locale==="fr"?"Ebooks pour étudier, appliquer et approfondir vos connaissances":locale==="es"?"Ebooks para estudiar, aplicar y ampliar conocimientos":"Ebooks to study, apply and expand knowledge"}</h2>\n        <p className="mt-3 text-sm leading-6 text-slate-600">{locale==="pt"?"Psicanálise, psicologia, comportamento, bem-estar, tecnologia, jornalismo e temas contemporâneos em uma única vitrine editorial.":locale==="fr"?"Psychanalyse, psychologie, comportement, bien-être, technologie, journalisme et thèmes contemporains dans une vitrine éditoriale unique.":locale==="es"?"Psicoanálisis, psicología, comportamiento, bienestar, tecnología, periodismo y temas contemporáneos en una sola vitrina editorial.":"Psychoanalysis, psychology, behavior, wellbeing, technology, journalism and contemporary topics in one editorial showcase."}</p>\n      </div>\n      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">\n        {[...PSYCHOANALYSIS_EBOOKS].sort((a,b)=>{const hot=["ebook_estudos_caso_psicanalise","ebook_psicologia_psicanalise_terapias","ebook_comportamento_humano","ebook_ia_novos_milionarios"];const premium=["ebook_estudos_caso_psicanalise","ebook_psicologia_psicanalise_terapias","ebook_corpo_trabalho_escuta","ebook_ia_novos_milionarios","ebook_imigracao_efeitos_psicologicos"];return (hot.includes(a.key)?0:premium.includes(a.key)?1:2)-(hot.includes(b.key)?0:premium.includes(b.key)?1:2)}).map((e)=>{\n          const hot=["ebook_estudos_caso_psicanalise","ebook_psicologia_psicanalise_terapias","ebook_comportamento_humano","ebook_ia_novos_milionarios"].includes(e.key);\n          const premium=["ebook_estudos_caso_psicanalise","ebook_psicologia_psicanalise_terapias","ebook_corpo_trabalho_escuta","ebook_ia_novos_milionarios","ebook_imigracao_efeitos_psicologicos"].includes(e.key);\n          return <article key={e.key} className="flex min-h-[360px] flex-col overflow-hidden rounded-3xl border border-[#d8c8aa] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">\n            <div className="relative flex min-h-40 items-end p-5 text-white" style={{background:`linear-gradient(145deg, ${e.color}, #071426)`}}>\n              <div className="absolute left-4 top-4 flex flex-wrap gap-2">{hot?<span className="rounded-full bg-[#d6ad63] px-2.5 py-1 text-[10px] font-black uppercase tracking-[.12em] text-[#281605]">MAIS PROCURADO</span>:null}{premium?<span className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-black uppercase tracking-[.12em] text-[#071426]">PREMIUM</span>:null}</div>\n              <div><p className="text-[10px] font-black uppercase tracking-[.16em] text-white/70">LDR ESSENCE ACADEMY · EBOOK</p><h3 className="mt-2 font-serif text-xl font-bold leading-tight">{e.title}</h3></div>\n            </div>\n            <div className="flex flex-1 flex-col p-5"><p className="text-sm font-semibold text-slate-700">{e.subtitle}</p><p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">{e.description}</p><div className="mt-auto pt-5"><p className="text-lg font-black text-[#071426]">R$ {(e.priceBrlCents/100).toFixed(2).replace('.',',')} <span className="text-sm font-bold text-slate-400">· € {(e.priceEurCents/100).toFixed(2).replace('.',',')}</span></p><Link to={e.publicPath} className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[#0b2341] px-4 py-3 text-sm font-black text-white">{locale==="pt"?"VER EBOOK":locale==="fr"?"VOIR L’EBOOK":locale==="es"?"VER EBOOK":"VIEW EBOOK"}</Link></div></div>\n          </article>\n        })}\n      </div>\n    </section>\n\n'''
if 'id="ebooks"' not in text:
    text = text.replace(section_anchor, showcase + section_anchor, 1)
else:
    raise SystemExit('An ebook section already exists; manual merge required instead of duplication')
home.write_text(text)

print('Pricing, checkout, bestselling badges and sales-home ebook showcase patched successfully.')

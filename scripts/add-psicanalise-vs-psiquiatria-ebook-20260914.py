from pathlib import Path

KEY='ebook_psicanalise_vs_psiquiatria'
TITLE='Psicanálise vs. Psiquiatria'
SUBTITLE='Do diagnóstico à escuta: como duas tradições compreendem o sofrimento psíquico e podem dialogar na clínica'
CHAPTERS=['Duas formas de entrar na história da saúde mental','O que é Psiquiatria?','O que é Psicanálise?','Freud era médico: da Neurologia à Psicanálise','O que cada campo chama de sintoma?','Diagnóstico psiquiátrico','Diagnóstico e construção do caso na Psicanálise','O inconsciente entra no consultório médico?','Psiquiatras que também se tornaram psicanalistas','A Psiquiatria psicodinâmica','Medicamento e palavra precisam ser adversários?','O que um medicamento pode fazer — e o que não pode prometer','A escuta do paciente em Psiquiatria','Transferência e relação clínica','Ansiedade: duas lentes sobre um mesmo sofrimento?','Depressão: diagnóstico, história e singularidade','Quando o caso exige Psiquiatria','Quando o psicanalista encaminha para o psiquiatra','Um paciente, dois profissionais','Psicanálise e Psiquiatria no século XXI']

def rd(p): return Path(p).read_text(encoding='utf-8')
def wr(p,s): Path(p).write_text(s,encoding='utf-8')
def add_after(p,anchor,addition,label):
 s=rd(p)
 if addition.strip() in s: return
 if anchor not in s: raise SystemExit(label+' anchor missing')
 wr(p,s.replace(anchor,anchor+addition,1))
def repl(p,old,new,label,all=False):
 s=rd(p)
 if new in s: return
 if old not in s: raise SystemExit(label+' anchor missing')
 wr(p,s.replace(old,new) if all else s.replace(old,new,1))

# central catalog
p='apps/painel-ldr/src/lib/psychoanalysis-ebooks.catalog.ts'; s=rd(p)
if KEY not in s:
 entry="""  {\n    key:'ebook_psicanalise_vs_psiquiatria', slug:'psicanalise-vs-psiquiatria', publicPath:'/ebooks/psicanalise-vs-psiquiatria', readerPath:'/cliente/biblioteca/ebook_psicanalise_vs_psiquiatria', color:'#39485F',\n    title:'Psicanálise vs. Psiquiatria', subtitle:'Do diagnóstico à escuta: como duas tradições compreendem o sofrimento psíquico e podem dialogar na clínica', short:'Psicanálise vs. Psiquiatria',\n    description:'Uma análise crítica das diferenças, limites e possibilidades de diálogo entre Psicanálise e Psiquiatria, do diagnóstico e da psicofarmacologia à escuta, subjetividade e trabalho interdisciplinar.',\n    audience:'Leitores, estudantes e profissionais interessados em Psicanálise, Psiquiatria, saúde mental e cuidado interdisciplinar.',\n    priceBrlCents:1990, priceEurCents:490,\n    chapters:"""+repr(CHAPTERS)+"""\n  },\n"""
 if '\n] as const;' not in s: raise SystemExit('catalog closing marker missing')
 wr(p,s.replace('\n] as const;','\n'+entry+'\n] as const;',1))

# content server
p='apps/painel-ldr/src/lib/digital-content.server.ts'
repl(p,'"ebook_imigracao_efeitos_psicologicos";','"ebook_imigracao_efeitos_psicologicos" | "ebook_psicanalise_vs_psiquiatria";','digital reader union')
add_after(p,'  ebook_imigracao_efeitos_psicologicos: ["ebook_imigracao_efeitos_psicologicos"],\n','  ebook_psicanalise_vs_psiquiatria: ["ebook_psicanalise_vs_psiquiatria"],\n','digital aliases')

# function/route allowlists
add_after('apps/painel-ldr/src/lib/digital-content.functions.ts','  "ebook_imigracao_efeitos_psicologicos",\n','  "ebook_psicanalise_vs_psiquiatria",\n','content functions')
repl('apps/painel-ldr/src/routes/_clientarea.cliente.biblioteca.$productKey.tsx','"ebook_imigracao_efeitos_psicologicos"','"ebook_imigracao_efeitos_psicologicos","ebook_psicanalise_vs_psiquiatria"','reader route')

# client portal server
p='apps/painel-ldr/src/lib/client-portal.server.ts'
repl(p,'"ebook_imigracao_efeitos_psicologicos";','"ebook_imigracao_efeitos_psicologicos" | "ebook_psicanalise_vs_psiquiatria";','client unions',all=True)
add_after(p,'  { key:"ebook_imigracao_efeitos_psicologicos", title:\'Entre Dois Mundos\', description:\'Imigração e os Efeitos Psicológicos da Experiência Migratória\', priceBrlCents:4990, priceEurCents:990, purchaseUrl:"/ebooks/imigracao-efeitos-psicologicos" },\n','  { key:"ebook_psicanalise_vs_psiquiatria", title:\'Psicanálise vs. Psiquiatria\', description:\'Do diagnóstico à escuta: como duas tradições compreendem o sofrimento psíquico e podem dialogar na clínica\', priceBrlCents:1990, priceEurCents:490, purchaseUrl:"/ebooks/psicanalise-vs-psiquiatria" },\n','product metadata')
add_after(p,'    ebook_imigracao_efeitos_psicologicos:["ebook_imigracao_efeitos_psicologicos"],\n','    ebook_psicanalise_vs_psiquiatria:["ebook_psicanalise_vs_psiquiatria"],\n','entitlement aliases')
add_after(p,'  ebook_imigracao_efeitos_psicologicos:{title:\'Entre Dois Mundos\',brlCents:2000,eurCents:399,brlPriceEnv:"STRIPE_EBOOK_COLLECTION_PRICE_BRL",eurPriceEnv:"STRIPE_EBOOK_COLLECTION_PRICE_EUR",dynamicPrice:true},\n','  ebook_psicanalise_vs_psiquiatria:{title:\'Psicanálise vs. Psiquiatria\',brlCents:1990,eurCents:490,brlPriceEnv:"STRIPE_EBOOK_COLLECTION_PRICE_BRL",eurPriceEnv:"STRIPE_EBOOK_COLLECTION_PRICE_EUR",dynamicPrice:true},\n','checkout config')

# checkout input validator
repl('apps/painel-ldr/src/lib/client-portal.functions.ts','"ebook_imigracao_efeitos_psicologicos"; market:','"ebook_imigracao_efeitos_psicologicos" | "ebook_psicanalise_vs_psiquiatria"; market:','checkout validator')

# reader type and theme
p='apps/painel-ldr/src/components/digital-reader-v2.tsx'
repl(p,'"ebook_imigracao_efeitos_psicologicos";','"ebook_imigracao_efeitos_psicologicos" | "ebook_psicanalise_vs_psiquiatria";','reader type')
repl(p,'  ebook_imigracao_efeitos_psicologicos:{light:"bg-[#f8f6f8] text-[#332b34]",dark:"bg-[#1d171e] text-[#fbf6fb]",cardLight:"border-[#d5cbd6] bg-white",cardDark:"border-[#69586b] bg-[#291f2a]",accent:"#6A586B",soft:"#ebe3ec"}\n};','  ebook_imigracao_efeitos_psicologicos:{light:"bg-[#f8f6f8] text-[#332b34]",dark:"bg-[#1d171e] text-[#fbf6fb]",cardLight:"border-[#d5cbd6] bg-white",cardDark:"border-[#69586b] bg-[#291f2a]",accent:"#6A586B",soft:"#ebe3ec"},\n  ebook_psicanalise_vs_psiquiatria:{light:"bg-[#f5f6f8] text-[#202733]",dark:"bg-[#11161f] text-[#f5f7fa]",cardLight:"border-[#c7ccd4] bg-white",cardDark:"border-[#4c5a6d] bg-[#19212d]",accent:"#39485F",soft:"#e6e9ef"}\n};','reader theme')

# fixed price checkout; standard book so it deliberately stays outside premium sets
add_after('apps/painel-ldr/src/lib/fixed-brl-ebook-checkout.server.ts',"  ebook_imigracao_efeitos_psicologicos: 'Entre Dois Mundos',\n","  ebook_psicanalise_vs_psiquiatria: 'Psicanálise vs. Psiquiatria',\n",'fixed checkout')

# migration source file
mig=Path('apps/painel-ldr/supabase/migrations/20260914130500_add_psicanalise_vs_psiquiatria_ebook.sql')
if not mig.exists():
 mig.write_text("alter table public.digital_product_content drop constraint if exists digital_product_content_product_key_check;\nalter table public.digital_product_content add constraint digital_product_content_product_key_check check (product_key = any (array['ebook_coragem_comecar'::text,'livro_menino_mamao'::text,'ebook_pratica_clinica_psicanalise'::text,'ebook_psicanalise_no_mundo'::text,'ebook_estudos_caso_psicanalise'::text,'ebook_psicanalise_autismo'::text,'ebook_psicologia_psicanalise_terapias'::text,'ebook_jornalismo_era_digital'::text,'ebook_corpo_trabalho_escuta'::text,'ebook_comportamento_humano'::text,'ebook_estetica_bem_estar'::text,'ebook_tricologia_cuidado'::text,'ebook_ia_novos_milionarios'::text,'ebook_imigracao_efeitos_psicologicos'::text,'ebook_psicanalise_vs_psiquiatria'::text]));\n",encoding='utf-8')

for fp in ['apps/painel-ldr/src/lib/psychoanalysis-ebooks.catalog.ts','apps/painel-ldr/src/lib/digital-content.server.ts','apps/painel-ldr/src/lib/digital-content.functions.ts','apps/painel-ldr/src/routes/_clientarea.cliente.biblioteca.$productKey.tsx','apps/painel-ldr/src/lib/client-portal.server.ts','apps/painel-ldr/src/lib/client-portal.functions.ts','apps/painel-ldr/src/components/digital-reader-v2.tsx','apps/painel-ldr/src/lib/fixed-brl-ebook-checkout.server.ts']:
 if KEY not in rd(fp): raise SystemExit('guardrail missing '+fp)
print('Psicanálise vs. Psiquiatria patch applied safely; no NOVO/Popular badge added.')

from pathlib import Path

root=Path(__file__).resolve().parents[1]/"apps"/"painel-ldr"/"src"

# Home: dynamic prices for professional formations + new free courses
p=root/"components"/"academy-university-home.tsx"
s=p.read_text()
s=s.replace('price:"R$ 299,99 · € 49,90",href:f.publicPath,kind,icon:f.icon,accent:themeAccent[f.theme]??"#6D3FA0"', 'price:`R$ ${(f.priceBrlCents/100).toFixed(2).replace(".",",")} · € ${(f.priceEurCents/100).toFixed(2).replace(".",",")}`,href:f.publicPath,kind,icon:f.icon,accent:themeAccent[f.theme]??"#6D3FA0"')
anchor=' {title:"Primeiros Socorros",desc:"Noções essenciais para situações de emergência.",href:"/cliente/cursos/primeiros-socorros",icon:"⛑️"},\n'
extra=' {title:"Clínica Psicanalítica: Sigmund Freud",desc:"120h · curso gratuito sobre fundamentos da clínica freudiana.",href:"/cliente/cursos/academy/clinica-psicanalitica-sigmund-freud",icon:"🛋️"},\n {title:"Orientação do Trabalho Científico",desc:"120h · pesquisa, metodologia e escrita científica.",href:"/cliente/cursos/academy/orientacao-trabalho-cientifico",icon:"📚"},\n {title:"Modelos de Documentos Psicanalíticos",desc:"Modelos educacionais e organização da prática psicanalítica.",href:"/cliente/cursos/academy/modelos-documentos-psicanaliticos",icon:"📄"},\n'
if extra.strip() not in s and anchor in s:s=s.replace(anchor,anchor+extra)
p.write_text(s)

# Sales home free list
p=root/"components"/"library-sales-home.tsx"
s=p.read_text()
anchor='  ["Primeiros Socorros — Noções Básicas","30 aulas · 10 horas","/cliente/cursos/primeiros-socorros"],\n'
extra='  ["Clínica Psicanalítica: Sigmund Freud","120 horas · gratuito","/cliente/cursos/academy/clinica-psicanalitica-sigmund-freud"],\n  ["Orientação do Trabalho Científico","120 horas · gratuito","/cliente/cursos/academy/orientacao-trabalho-cientifico"],\n  ["Modelos de Documentos Psicanalíticos","modelos práticos · gratuito","/cliente/cursos/academy/modelos-documentos-psicanaliticos"],\n'
if extra.strip() not in s and anchor in s:s=s.replace(anchor,anchor+extra)
p.write_text(s)

# Client library: add three free cards beside the existing free cards
p=root/"routes"/"_clientarea.cliente.biblioteca.tsx"
s=p.read_text()
needle='        <a href="/cliente/cursos/primeiros-socorros"'
pos=s.find(needle)
if pos>=0 and '/cliente/cursos/academy/clinica-psicanalitica-sigmund-freud' not in s:
    end=s.find('</a>',pos)
    if end>=0:
        end+=4
        cards='''\n        <a href="/cliente/cursos/academy/clinica-psicanalitica-sigmund-freud" className="min-w-0 rounded-2xl bg-[#5b2b86] px-1 py-4 text-center text-white shadow-sm"><span className="mx-auto block text-lg">🛋️</span><p className="mt-2 text-[8px] font-black leading-tight sm:text-[10px]">Clínica Psicanalítica: Freud</p><span className="mt-2 block text-[8px] font-bold text-white/75">120h · GRATUITO</span></a>\n        <a href="/cliente/cursos/academy/orientacao-trabalho-cientifico" className="min-w-0 rounded-2xl bg-[#0F5E7A] px-1 py-4 text-center text-white shadow-sm"><span className="mx-auto block text-lg">📚</span><p className="mt-2 text-[8px] font-black leading-tight sm:text-[10px]">Orientação do Trabalho Científico</p><span className="mt-2 block text-[8px] font-bold text-white/75">120h · GRATUITO</span></a>\n        <a href="/cliente/cursos/academy/modelos-documentos-psicanaliticos" className="min-w-0 rounded-2xl bg-[#6F4E37] px-1 py-4 text-center text-white shadow-sm"><span className="mx-auto block text-lg">📄</span><p className="mt-2 text-[8px] font-black leading-tight sm:text-[10px]">Modelos de Documentos Psicanalíticos</p><span className="mt-2 block text-[8px] font-bold text-white/75">GRATUITO</span></a>'''
        s=s[:end]+cards+s[end:]
p.write_text(s)

print("LDR Academy storefront patch applied")

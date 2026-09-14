from pathlib import Path

p=Path('apps/painel-ldr/src/components/academy-university-home.tsx')
s=p.read_text()
imp='import { PSYCHOANALYSIS_EBOOKS } from "@/lib/psychoanalysis-ebooks.catalog";\n'
if imp not in s:
    anchor='import { AcademyGiveawayBanner } from "@/components/academy-giveaway-banner";\n'
    assert anchor in s
    s=s.replace(anchor, anchor+imp, 1)
marker=' </main>;\n}'
assert marker in s
if 'id="ebooks-home"' not in s:
    section=r'''
  <section id="ebooks-home" className="border-t border-[#d6ad63]/25 bg-[#f7f3e9]">
   <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
    <div className="max-w-3xl">
     <p className="text-[10px] font-black uppercase tracking-[.22em] text-[#9b6a24]">LDR ESSENCE ACADEMY · EBOOKS</p>
     <h2 className="mt-2 font-serif text-3xl font-bold text-[#071426] sm:text-4xl">{locale==="pt"?"Ebooks para estudar, aplicar e ampliar conhecimentos":locale==="fr"?"Ebooks pour étudier, appliquer et approfondir vos connaissances":locale==="es"?"Ebooks para estudiar, aplicar y ampliar conocimientos":"Ebooks to study, apply and expand knowledge"}</h2>
     <p className="mt-3 text-sm leading-6 text-slate-600">{locale==="pt"?"Todos os eBooks da Academy em uma vitrine editorial, com destaques, preços e acesso às páginas de cada obra.":locale==="fr"?"Tous les eBooks de l’Academy dans une vitrine éditoriale avec sélections, prix et accès à chaque ouvrage.":locale==="es"?"Todos los eBooks de la Academy en una vitrina editorial con destacados, precios y acceso a cada obra.":"All Academy eBooks in one editorial showcase with highlights, prices and access to each title."}</p>
    </div>
    <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
     {[...PSYCHOANALYSIS_EBOOKS].sort((a,b)=>{const hot=new Set(['ebook_estudos_caso_psicanalise','ebook_psicologia_psicanalise_terapias','ebook_comportamento_humano','ebook_ia_novos_milionarios']);const premium=new Set(['ebook_estudos_caso_psicanalise','ebook_psicologia_psicanalise_terapias','ebook_corpo_trabalho_escuta','ebook_ia_novos_milionarios','ebook_imigracao_efeitos_psicologicos']);return (hot.has(b.key)?2:premium.has(b.key)?1:0)-(hot.has(a.key)?2:premium.has(a.key)?1:0)}).map(e=>{const hot=['ebook_estudos_caso_psicanalise','ebook_psicologia_psicanalise_terapias','ebook_comportamento_humano','ebook_ia_novos_milionarios'].includes(e.key);const premium=['ebook_estudos_caso_psicanalise','ebook_psicologia_psicanalise_terapias','ebook_corpo_trabalho_escuta','ebook_ia_novos_milionarios','ebook_imigracao_efeitos_psicologicos'].includes(e.key);return <a key={e.key} href={e.publicPath} className="group flex min-h-[320px] flex-col overflow-hidden rounded-[22px] border border-[#d9cfba] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"><div className="h-2" style={{background:e.color}}/><div className="flex flex-1 flex-col p-5"><div className="flex flex-wrap gap-2">{hot&&<span className="rounded-full bg-[#071426] px-2.5 py-1 text-[9px] font-black uppercase tracking-[.08em] text-white">MAIS PROCURADO</span>}{premium&&<span className="rounded-full bg-[#d6ad63] px-2.5 py-1 text-[9px] font-black uppercase tracking-[.08em] text-[#281605]">PREMIUM</span>}</div><div className="mt-4 text-4xl">📖</div><h3 className="mt-3 font-serif text-xl leading-tight text-[#071426]">{e.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{e.subtitle}</p><div className="mt-auto pt-5"><p className="text-base font-black text-[#071426]">R$ {(e.priceBrlCents/100).toFixed(2).replace('.',',')} · € {(e.priceEurCents/100).toFixed(2).replace('.',',')}</p><span className="mt-3 inline-flex w-full justify-center rounded-xl bg-[#071426] px-4 py-3 text-xs font-black text-white">{locale==="pt"?"VER EBOOK":locale==="fr"?"VOIR L’EBOOK":locale==="es"?"VER EBOOK":"VIEW EBOOK"} →</span></div></div></a>})}
    </div>
   </div>
  </section>
'''
    s=s.replace(marker, section+marker,1)
p.write_text(s)

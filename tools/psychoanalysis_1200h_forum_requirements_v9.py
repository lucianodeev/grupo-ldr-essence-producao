from pathlib import Path
import re

ROOT=Path('apps/painel-ldr/src')

def read(rel):
    p=ROOT/rel
    return p,p.read_text(encoding='utf-8')
def write(p,s):
    p.write_text(s,encoding='utf-8')

# 1) Commerce metadata: 1,200h + make sure psychoanalysis program is published so forum resolves.
p,s=read('lib/psychoanalysis-commerce.server.ts')
if 'const TOTAL_HOURS=1200;' not in s:
    s=s.replace('const TOTAL_LESSONS=180;','const TOTAL_LESSONS=180;\nconst TOTAL_HOURS=1200;',1)
s=s.replace('description:"Formação livre em Psicanálise com 12 módulos, 180 unidades de aprendizagem e 6 encontros ao vivo."','description:"Formação livre em Psicanálise com 12 módulos, 180 unidades de aprendizagem, carga horária formativa total de 1.200 horas e 6 encontros ao vivo."')
old='''  const {data:existing}=await db.from("training_programs").select("id,slug,title,status").eq("slug",PRODUCT_SLUG).maybeSingle();\n  if(existing)return existing;'''
new='''  const {data:existing}=await db.from("training_programs").select("id,slug,title,status").eq("slug",PRODUCT_SLUG).maybeSingle();\n  if(existing){\n    if(existing.status!=="published"){\n      const {data:published}=await db.from("training_programs").update({status:"published",description:"Formação livre em Psicanálise com 12 módulos, 180 unidades de aprendizagem, carga horária formativa total de 1.200 horas e 6 encontros ao vivo."}).eq("id",existing.id).select("id,slug,title,status").single();\n      return published??{...existing,status:"published"};\n    }\n    return existing;\n  }'''
if old in s:
    s=s.replace(old,new,1)
if 'totalHours:TOTAL_HOURS' not in s:
    s=s.replace('totalModules:12,totalLessons:TOTAL_LESSONS,','totalModules:12,totalLessons:TOTAL_LESSONS,totalHours:TOTAL_HOURS,',1)
write(p,s)

# 2) Forum: tolerate an existing psychoanalysis program that was left non-published and self-heal it.
p,s=read('lib/training-forum.server.ts')
old='''async function trainingBySlug(slug:string){\n  const {data}=await supabaseAdmin.from("training_programs").select("id,slug,title,status").eq("slug",slug).eq("status","published").maybeSingle();\n  if(!data)fail("Treinamento não encontrado.");\n  return data;\n}'''
new='''async function trainingBySlug(slug:string){\n  const {data,error}=await supabaseAdmin.from("training_programs").select("id,slug,title,status").eq("slug",slug).maybeSingle();\n  if(error)fail("Não foi possível localizar a formação.");\n  if(!data)fail("Treinamento não encontrado.");\n  if(data.status!=="published"){\n    if(slug!=="formacao-psicanalise")fail("Treinamento indisponível.");\n    const {data:published,error:publishError}=await supabaseAdmin.from("training_programs").update({status:"published"}).eq("id",data.id).select("id,slug,title,status").single();\n    if(publishError||!published)fail("Não foi possível preparar o fórum da formação.");\n    return published;\n  }\n  return data;\n}'''
if old in s:
    s=s.replace(old,new,1)
write(p,s)

# 3) Public sales page: show 1,200h, clinical-social practice, requirements accordion and cautious legal framing.
p,s=read('components/psychoanalysis-training-page.tsx')
s=s.replace('12 módulos</span><span className="rounded-full bg-white/10 px-3 py-2 text-center">180 unidades de aprendizagem','12 módulos</span><span className="rounded-full bg-white/10 px-3 py-2 text-center">1.200 horas</span><span className="rounded-full bg-white/10 px-3 py-2 text-center">180 unidades de aprendizagem')
s=s.replace('[["Desde 2014","Uma trajetória construída com estudo e prática contínuos."],["+3.000 atendimentos","Experiência em clínica online com pessoas no Brasil e no exterior."],["12 módulos · 180 unidades de aprendizagem","Conteúdo organizado para avançar com clareza, sem se perder no excesso de informação."],["Acesso vitalício"','[["1.200 horas","Carga horária formativa total do percurso, incluindo estudo orientado, atividades, análise pessoal e prática supervisionada."],["+3.000 atendimentos","Experiência em clínica online com pessoas no Brasil e no exterior."],["12 módulos · 180 unidades de aprendizagem","Conteúdo organizado para avançar com clareza, sem se perder no excesso de informação."],["Acesso vitalício"')
s=s.replace('"180 unidades de aprendizagem organizadas em 12 módulos","Progresso salvo na sua conta"','"1.200 horas de carga horária formativa total","180 unidades de aprendizagem organizadas em 12 módulos","Progresso salvo na sua conta"')
requirements='''\n   <section className="rounded-[2rem] border border-[#caa85d] bg-[#fffaf0] p-6 sm:p-8"><p className="text-xs font-black uppercase tracking-[.18em] text-[#7b4aa3]">Conclusão e prática supervisionada</p><details className="mt-4 rounded-2xl border border-[#dfd3e8] bg-white p-5"><summary className="cursor-pointer font-serif text-2xl font-bold text-[#2f1457]">Ver requisitos da formação</summary><div className="mt-4 space-y-3 text-sm leading-7 text-[#66576f]"><p><strong className="text-[#2f1457]">Carga horária total:</strong> 1.200 horas, distribuídas ao longo de um percurso previsto entre 6 e 12 meses.</p><p><strong className="text-[#2f1457]">Para concluir:</strong> completar 100% do material teórico e das atividades obrigatórias; cumprir o período mínimo de 180 dias; realizar no mínimo 12 sessões de análise pessoal; e cumprir a etapa de prática clínica supervisionada vinculada à Clínica Social LDR.</p><p><strong className="text-[#2f1457]">Clínica Social LDR:</strong> na etapa clínica, alunos elegíveis poderão atender pacientes da clínica social online, com direcionamento, confidencialidade, critérios de entrada e supervisão definidos pela formação.</p><p><strong className="text-[#2f1457]">Importante:</strong> esta é uma formação livre. O certificado comprova a conclusão do percurso formativo e não equivale a graduação universitária, licença estatal ou autorização automática para exercer atividade regulada em qualquer país. O aluno deve observar as regras aplicáveis no local em que pretende atuar.</p></div></details></section>\n'''
if 'Ver requisitos da formação' not in s:
    marker='   <section className="rounded-[2rem] border border-[#ded0eb] bg-white p-6 sm:p-8"><p className="text-xs font-black uppercase tracking-[.18em] text-[#7b4aa3]">Perguntas frequentes</p>'
    if marker not in s: raise SystemExit('public FAQ anchor not found')
    s=s.replace(marker,requirements+marker,1)
# Update FAQ certificate language if present.
s=s.replace('Cumprindo integralmente o percurso, as atividades obrigatórias, o período mínimo de 180 dias e os requisitos formativos, o aluno recebe o Certificado de Conclusão da Formação em Psicanálise','Cumprindo integralmente o percurso de 1.200 horas, as atividades obrigatórias, o período mínimo de 180 dias, no mínimo 12 sessões de análise pessoal e a etapa de prática clínica supervisionada, o aluno recebe o Certificado de Conclusão da Formação em Psicanálise')
write(p,s)

# 4) Student training experience: 1,200h + open/close requirements + social clinic information.
p,s=read('routes/_clientarea.cliente.treinamentos.psicanalise.tsx')
s=s.replace('Teoria · Análise pessoal · Supervisão · 12 módulos · 180 unidades · 6 encontros ao vivo','Teoria · Análise pessoal · Supervisão · 12 módulos · 180 unidades · 1.200 horas · 6 encontros ao vivo')
req_internal='''\n  <details className="rounded-[24px] border border-[#d9c77f] bg-[#fffaf0] p-5 shadow-sm sm:p-6"><summary className="cursor-pointer font-serif text-xl font-bold text-[#2f1457]">Requisitos para conclusão</summary><div className="mt-4 grid gap-3 text-sm leading-6 text-[#64596b]"><p>✓ Completar 100% do material teórico e das atividades obrigatórias.</p><p>✓ Cumprir o período mínimo de 180 dias dentro do percurso de 6 a 12 meses.</p><p>✓ Realizar no mínimo 12 sessões de análise pessoal.</p><p>✓ Cumprir a etapa de prática clínica supervisionada vinculada à Clínica Social LDR.</p><p className="rounded-xl bg-white p-3"><strong>Clínica Social LDR:</strong> na fase clínica, alunos elegíveis serão direcionados para atendimentos online de pacientes da clínica social, conforme disponibilidade, critérios, confidencialidade e supervisão.</p><p className="text-xs text-[#85788c]">Carga horária formativa total: 1.200 horas. A conclusão e a certificação permanecem sujeitas à validação dos requisitos formativos pela equipe.</p></div></details>\n'''
if 'Requisitos para conclusão' not in s:
    marker='  <section className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">'
    if marker not in s: raise SystemExit('student grid anchor not found')
    s=s.replace(marker,req_internal+marker,1)
write(p,s)

# 5) Certificate: 1,200h and explicit formation requirements/legal disclaimer.
p,s=read('routes/_clientarea.cliente.treinamentos.psicanalise.certificado.tsx')
s=s.replace('A liberação ocorre somente depois de pelo menos 180 dias de matrícula e 100% do percurso obrigatório concluído.','A liberação acadêmica considera o período mínimo de 180 dias e 100% do percurso obrigatório. A conclusão formativa também exige no mínimo 12 sessões de análise pessoal e a etapa de prática clínica supervisionada da Clínica Social LDR, sujeitas à validação da equipe.')
s=s.replace('concluiu a <strong>Formação Online em Psicanálise</strong>, após cumprir o período mínimo formativo de 180 dias e os requisitos obrigatórios previstos no percurso.','concluiu a <strong>Formação Online em Psicanálise</strong>, com carga horária formativa total de <strong>1.200 horas</strong>, após cumprir o período mínimo formativo de 180 dias e os requisitos obrigatórios previstos no percurso.')
s=s.replace('Formação livre em Psicanálise. Referência ocupacional no Brasil: Psicanalista — Classificação Brasileira de Ocupações (CBO) 2515-50. Este certificado comprova a conclusão do percurso formativo e pode ser apresentado para fins de atuação profissional, observadas as regras e exigências aplicáveis no local de exercício. Não equivale a graduação universitária.','Formação livre em Psicanálise, com carga horária declarada de 1.200 horas. O percurso inclui formação teórica, atividades, análise pessoal e prática clínica supervisionada. Este certificado comprova a conclusão do percurso formativo; não equivale a graduação universitária, licença estatal ou autorização automática para exercer atividade regulada. O exercício profissional deve observar as regras aplicáveis no local de atuação.')
if 'Carga horária</p><p className="mt-1 font-bold text-[#2f1457]">1.200 horas' not in s:
    marker='<div className="mt-8 grid gap-4 text-left sm:grid-cols-2">'
    repl='<div className="mt-8 grid gap-4 text-left sm:grid-cols-3"><div className="rounded-2xl border border-[#dfd3e8] p-4"><p className="text-xs font-black uppercase text-[#7b4aa3]">Carga horária</p><p className="mt-1 font-bold text-[#2f1457]">1.200 horas</p></div>'
    if marker not in s: raise SystemExit('certificate meta anchor not found')
    s=s.replace(marker,repl,1)
write(p,s)

# 6) Library: comment option, product label and card typography.
p,s=read('routes/_clientarea.cliente.biblioteca.tsx')
if 'formacao_psicanalise:' not in s:
    anchor='  livro_menino_mamao: { pt:{title:"O Menino que Vendia Mamão",desc:"Livro autobiográfico sobre trabalho, recomeços, estratégia e a coragem de continuar construindo."}, en:{title:"The Boy Who Sold Papaya",desc:"An autobiographical book about work, new beginnings, strategy and the courage to keep building."}, fr:{title:"Le Garçon qui Vendait des Papayes",desc:"Un livre autobiographique sur le travail, les nouveaux départs, la stratégie et le courage de continuer à construire."}, es:{title:"El Niño que Vendía Papaya",desc:"Un libro autobiográfico sobre trabajo, nuevos comienzos, estrategia y el valor de seguir construyendo."} },\n'
    if anchor not in s: raise SystemExit('product copy anchor not found')
    extra='  formacao_psicanalise: { pt:{title:"Formação Online em Psicanálise",desc:"Formação livre com 12 módulos, 180 unidades e 1.200 horas de percurso formativo."}, en:{title:"Online Psychoanalysis Training",desc:"Free-form professional training with 12 modules, 180 learning units and a 1,200-hour pathway."}, fr:{title:"Formation en ligne en psychanalyse",desc:"Formation libre avec 12 modules, 180 unités et un parcours formatif de 1 200 heures."}, es:{title:"Formación online en psicoanálisis",desc:"Formación libre con 12 módulos, 180 unidades y un recorrido formativo de 1.200 horas."} },\n'
    s=s.replace(anchor,anchor+extra,1)
# Add comment select option immediately before the select closing tag linked to productKey.
idx=s.find('onChange={(e)=>setProductKey(e.target.value)}')
if idx<0: raise SystemExit('comment select anchor not found')
end=s.find('</select>',idx)
if end<0: raise SystemExit('comment select closing tag not found')
segment=s[idx:end]
if 'formacao_psicanalise' not in segment:
    s=s[:end]+'<option value="formacao_psicanalise">Formação Online em Psicanálise</option>'+s[end:]
# Fix psychoanalysis card label so it remains on one line on mobile.
pattern=r'(<button[^>]+activeLibraryCategory===?"psychoanalysis"[\s\S]{0,900}?<span className=")[^"]+("[^>]*>Psicanálise</span>)'
m=re.search(pattern,s)
if m:
    s=s[:m.start()]+m.group(1)+'mt-2 w-full whitespace-nowrap text-center text-[8px] font-black leading-none tracking-tight sm:text-[10px]'+m.group(2)+s[m.end():]
else:
    # Fallback for single-equals source style.
    pattern=r'(<button[^>]+activeLibraryCategory==="psychoanalysis"[\s\S]{0,900}?<span className=")[^"]+("[^>]*>Psicanálise</span>)'
    m=re.search(pattern,s)
    if m:
        s=s[:m.start()]+m.group(1)+'mt-2 w-full whitespace-nowrap text-center text-[8px] font-black leading-none tracking-tight sm:text-[10px]'+m.group(2)+s[m.end():]
    else:
        raise SystemExit('psychoanalysis label anchor not found')
write(p,s)

# Assertions: fail CI before commit if anything essential did not land.
checks={
 'lib/psychoanalysis-commerce.server.ts':['TOTAL_HOURS=1200','totalHours:TOTAL_HOURS','status:"published"'],
 'lib/training-forum.server.ts':['Não foi possível preparar o fórum da formação'],
 'components/psychoanalysis-training-page.tsx':['1.200 horas','Ver requisitos da formação','Clínica Social LDR'],
 'routes/_clientarea.cliente.treinamentos.psicanalise.tsx':['1.200 horas','Requisitos para conclusão','Clínica Social LDR'],
 'routes/_clientarea.cliente.treinamentos.psicanalise.certificado.tsx':['1.200 horas','12 sessões de análise pessoal','prática clínica supervisionada'],
 'routes/_clientarea.cliente.biblioteca.tsx':['value="formacao_psicanalise"','whitespace-nowrap','Formação Online em Psicanálise'],
}
for rel,needles in checks.items():
    text=(ROOT/rel).read_text(encoding='utf-8')
    for needle in needles:
        if needle not in text: raise SystemExit(f'missing {needle} in {rel}')
print('psychoanalysis 1200h/forum/requirements patch validated')

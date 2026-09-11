from pathlib import Path

root=Path('apps/painel-ldr/src')

# Curriculum: keep total at 180 days by moving to 12 modules x 15 units.
p=root/'content/psychoanalysis-curriculum.ts'
s=p.read_text(encoding='utf-8')
if 'Análise Pessoal e o Lugar do Analista' not in s:
    anchor='\nconst extensionTitles:Record<number,string[]>={'
    add='''\nconst addedPsychoanalysisModules:PsychoanalysisModule[]=[\n{ id:11,title:"Análise Pessoal e o Lugar do Analista",focus:"A função da análise pessoal na formação, os pontos cegos do analista, transferência, contratransferência, desejo do analista, ética e limites pessoais.",lessons:generic(11,["Por que o analista também se analisa","Autoconhecimento não é análise pessoal","Pontos cegos do analista","Transferência na própria análise","Contratransferência e implicação subjetiva","O desejo do analista","Limites pessoais e limites clínicos","Ética e responsabilidade","Afetos mobilizados pela escuta","Quando a história pessoal invade a clínica","Sustentar perguntas sem responder pelo outro","Análise pessoal e formação contínua","Preparação para a prática","Revisão do módulo","Síntese e integração"],"Compreender a análise pessoal como eixo do tripé formativo e refletir sobre a posição subjetiva de quem ocupa o lugar de analista."),deeper:[{title:"Análise Terminável e Interminável",author:"Sigmund Freud",year:"1937",note:"Texto fundamental para pensar os limites e a continuidade do trabalho analítico."},{title:"Recomendações aos Médicos que Exercem a Psicanálise",author:"Sigmund Freud",year:"1912",note:"Ajuda a refletir sobre a posição e a escuta do analista."},{title:"A Questão da Análise Leiga",author:"Sigmund Freud",year:"1926",note:"Amplia a discussão sobre formação e exercício da Psicanálise."}],activity:"Explique por que a análise pessoal é considerada parte do tripé formativo e descreva dois riscos clínicos de um analista que não reconhece seus próprios pontos cegos."},\n{ id:12,title:"Supervisão Clínica e Construção da Escuta",focus:"Supervisão, apresentação de caso, hipótese clínica, manejo, ética, confidencialidade, limites e preparação para a prática.",lessons:generic(12,["O que é supervisão clínica","Como apresentar um caso","Separar fato, hipótese e interpretação","Construção da hipótese clínica","Manejo da transferência","Escuta do discurso e repetição","Silêncio e intervenção","Impasse clínico","Limites do analista","Ética e confidencialidade","Quando encaminhar","Registro e organização do caso","Supervisão como formação contínua","Preparação para início da prática","Síntese e integração"],"Compreender a supervisão como espaço de elaboração técnica, ética e clínica na formação psicanalítica."),deeper:[{title:"Recordar, Repetir e Elaborar",author:"Sigmund Freud",year:"1914",note:"Ajuda a pensar repetição, elaboração e manejo clínico."},{title:"Observações sobre o Amor Transferencial",author:"Sigmund Freud",year:"1915",note:"Texto importante para refletir sobre manejo e limites na transferência."},{title:"Construções em Análise",author:"Sigmund Freud",year:"1937",note:"Aprofunda a reflexão sobre construção, hipótese e trabalho clínico."}],activity:"Construa uma vinheta clínica fictícia curta e diferencie: fatos relatados, hipótese de trabalho, elementos transferenciais e pontos que você levaria para supervisão."}\n];\n'''
    if anchor not in s: raise SystemExit('curriculum extension anchor not found')
    s=s.replace(anchor,add+anchor,1)

old='export const psychoanalysisModules:PsychoanalysisModule[]=basePsychoanalysisModules.map(module=>({...module,lessons:[...module.lessons,...((extensionTitles[module.id]??[]).map((title,index)=>extensionLesson(module,title,index)))]}));'
new='export const psychoanalysisModules:PsychoanalysisModule[]=[...basePsychoanalysisModules,...addedPsychoanalysisModules].map(module=>module.id<=10?({...module,lessons:[...module.lessons,...((extensionTitles[module.id]??[]).slice(0,6).map((title,index)=>extensionLesson(module,title,index)))]}):module);'
if old in s: s=s.replace(old,new,1)
p.write_text(s,encoding='utf-8')

# Sales page: one-time price only, 12 modules, firm certificate language.
p=root/'components/psychoanalysis-training-page.tsx'
s=p.read_text(encoding='utf-8')
repls={
'🇧🇷 12x de R$ 31,03':'🇧🇷 R$ 372,36',
'Brasil, 12x de R$ 31,03; Europa, € 65,34.':'Brasil, R$ 372,36; Europa, € 65,34 — pagamento único.',
'Checkout ativo pelo Stripe em pagamento único. No Brasil, a referência comercial equivale a 12x de R$ 31,03; o parcelamento será reativado quando o meio de pagamento correspondente estiver disponível.':'Pagamento único pelo Stripe: Brasil R$ 372,36 ou Europa € 65,34. Sem parcelamento nesta oferta.',
'Neste momento, o checkout ativo é o Stripe em pagamento único. A referência brasileira de 12x de R$ 31,03 permanece apenas como referência comercial até a reativação de um meio de pagamento com parcelamento.':'O checkout ativo é o Stripe em pagamento único: R$ 372,36 no Brasil ou € 65,34 na Europa.',
'10 módulos':'12 módulos',
'10 módulos para construir a base e avançar para a clínica.':'12 módulos para construir a base, aprofundar o tripé e avançar para a clínica.',
'A plataforma está preparada para certificação, mas os critérios e a comunicação final de certificado serão definidos antes da emissão. Não há promessa de diploma ou habilitação profissional automática.':'Sim. Cumprindo integralmente o percurso, as atividades obrigatórias, o período mínimo de 180 dias e os requisitos formativos, o aluno recebe o Certificado de Conclusão da Formação em Psicanálise, destinado a comprovar sua formação livre para atuação profissional conforme a legislação aplicável ao local de exercício.'
}
for a,b in repls.items(): s=s.replace(a,b)
# Add two sales modules if the data list exists and they are absent.
if 'Análise Pessoal e o Lugar do Analista' not in s:
    marker='] as const;'
    idx=s.find(marker)
    if idx!=-1 and 'salesModules' in s[:idx]:
        prefix=s[:idx].rstrip()
        if prefix.endswith(']'):
            pass
# safer targeted insertion before closing salesModules array
needle='{n:"10",title:"O Mal-Estar na Atualidade — Psicanálise Aplicada",focus:"Sofrimento contemporâneo, burnout, redes sociais, imediatismo e cultura."},'
if needle in s and 'n:"11"' not in s:
    s=s.replace(needle,needle+'\n {n:"11",title:"Análise Pessoal e o Lugar do Analista",focus:"Pontos cegos, transferência, contratransferência, desejo do analista, ética e limites pessoais."},\n {n:"12",title:"Supervisão Clínica e Construção da Escuta",focus:"Apresentação de caso, hipótese clínica, manejo, confidencialidade, limites e preparação para a prática."},',1)
p.write_text(s,encoding='utf-8')

# Student course: 12 modules, prices, requirements details, working certificate/forum links.
p=root/'routes/_clientarea.cliente.treinamentos.psicanalise.tsx'
s=p.read_text(encoding='utf-8')
s=s.replace('10 módulos, 180 unidades de aprendizagem, 6 encontros ao vivo','12 módulos, 180 unidades de aprendizagem, 6 encontros ao vivo')
s=s.replace('Teoria · Análise pessoal · Supervisão · 10 módulos · 180 unidades · 6 encontros ao vivo','Teoria · Análise pessoal · Supervisão · 12 módulos · 180 unidades · 6 encontros ao vivo')
s=s.replace('Brasil · 12x de R$ 31,03','Brasil · R$ 372,36 · pagamento único')
# Ensure certificate action is actually clickable and requirements visible.
old='<p className="mt-1 text-xs leading-5 text-[#75677e]">Somente após 180 dias de matrícula e conclusão das atividades obrigatórias. Formação livre em Psicanálise · CBO 2515-50.</p></article>'
new='<p className="mt-1 text-xs leading-5 text-[#75677e]">Somente após 180 dias de matrícula, 100% do percurso e atividades obrigatórias. Formação livre em Psicanálise · CBO 2515-50.</p><details className="mt-3 rounded-xl bg-[#f8f3fb] p-3"><summary className="cursor-pointer text-xs font-black text-[#5b2b86]">Ver requisitos</summary><ul className="mt-2 list-disc space-y-1 pl-4 text-xs leading-5 text-[#66576f]"><li>Mínimo de 180 dias desde a matrícula</li><li>100% das unidades obrigatórias concluídas</li><li>Atividades e questionários obrigatórios concluídos</li><li>Conclusão dentro de até 12 meses</li><li>Cumprimento dos eixos de análise pessoal e supervisão previstos no percurso</li></ul><Link to="/cliente/treinamentos/psicanalise/certificado" className="mt-3 inline-flex rounded-lg bg-[#5b2b86] px-3 py-2 text-xs font-black text-white">Abrir área do certificado</Link></details></article>'
if old in s: s=s.replace(old,new,1)
p.write_text(s,encoding='utf-8')

# Certificate: dynamic unit count, stronger completion statement while keeping legal precision.
p=root/'routes/_clientarea.cliente.treinamentos.psicanalise.certificado.tsx'
s=p.read_text(encoding='utf-8')
s=s.replace('Formação livre em Psicanálise. Referência ocupacional no Brasil: Psicanalista — Classificação Brasileira de Ocupações (CBO) 2515-50. Este certificado não equivale a graduação nem, isoladamente, constitui licença estatal para exercício profissional.','Formação livre em Psicanálise. Referência ocupacional no Brasil: Psicanalista — Classificação Brasileira de Ocupações (CBO) 2515-50. Este certificado comprova a conclusão do percurso formativo e pode ser apresentado para fins de atuação profissional, observadas as regras e exigências aplicáveis no local de exercício. Não equivale a graduação universitária.')
s=s.replace('{m.title} · 18 unidades de aprendizagem','{m.title} · {m.lessons.length} unidades de aprendizagem')
p.write_text(s,encoding='utf-8')

# Library: one-time price only for psychoanalysis.
p=root/'routes/_clientarea.cliente.biblioteca.tsx'
s=p.read_text(encoding='utf-8')
s=s.replace('12x de R$ 31,03','R$ 372,36 · pagamento único')
s=s.replace('R$ 372,36 · pagamento único · pagamento único','R$ 372,36 · pagamento único')
p.write_text(s,encoding='utf-8')

# Forum backend: for psychoanalysis, offer validation provisions enrollment; then refetch.
p=root/'lib/training-forum.server.ts'
s=p.read_text(encoding='utf-8')
old='const {data:enrollment}=await supabaseAdmin.from("training_enrollments").select("id").eq("training_id",training.id).eq("customer_id",ctx.customer.id).eq("active",true).maybeSingle();\n  if(!enrollment)fail("Você precisa estar matriculado para acessar o fórum.");'
new='let {data:enrollment}=await supabaseAdmin.from("training_enrollments").select("id").eq("training_id",training.id).eq("customer_id",ctx.customer.id).eq("active",true).maybeSingle();\n  if(!enrollment&&slug==="formacao-psicanalise"){const {getPsychoanalysisOffer}=await import("@/lib/psychoanalysis-commerce.server");await getPsychoanalysisOffer(userId,email);const retry=await supabaseAdmin.from("training_enrollments").select("id").eq("training_id",training.id).eq("customer_id",ctx.customer.id).eq("active",true).maybeSingle();enrollment=retry.data;}\n  if(!enrollment)fail("Você precisa estar matriculado para acessar o fórum.");'
if old in s: s=s.replace(old,new,1)
p.write_text(s,encoding='utf-8')

print('psychoanalysis v4 patch applied')
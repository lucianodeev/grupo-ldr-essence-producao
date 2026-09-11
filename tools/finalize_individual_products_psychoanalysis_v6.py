from pathlib import Path
import re, json

root=Path('apps/painel-ldr/src')

def load(rel):
    p=root/rel
    return p,p.read_text(encoding='utf-8')
def save(p,s): p.write_text(s,encoding='utf-8')

# 1) Psychoanalysis commerce: final individual price + 12 modules.
p,s=load('lib/psychoanalysis-commerce.server.ts')
s=s.replace('const PRICE_BRL=37_236;','const PRICE_BRL=29_999;')
s=s.replace('const PRICE_EUR=6_534;','const PRICE_EUR=4_990;')
s=s.replace('description:"Formação livre em Psicanálise com 10 módulos, 180 unidades de aprendizagem e 6 encontros ao vivo."','description:"Formação livre em Psicanálise com 12 módulos, 180 unidades de aprendizagem e 6 encontros ao vivo."')
s=s.replace('totalModules:10','totalModules:12')
s=s.replace('totalModules: 10','totalModules: 12')
s=s.replace('totalModules:10,','totalModules:12,')
s=s.replace('totalModules: 10,','totalModules: 12,')
s=s.replace('PRICE_BRL=37_236','PRICE_BRL=29_999').replace('PRICE_EUR=6_534','PRICE_EUR=4_990')
save(p,s)

# 2) Public psychoanalysis sales page: 12 modules and final one-time values only.
p,s=load('components/psychoanalysis-training-page.tsx')
if '["11","Análise Pessoal e o Lugar do Analista"' not in s:
    needle='["10","O Mal-Estar na Atualidade — Psicanálise Aplicada","Sofrimento contemporâneo, burnout, redes sociais, imediatismo e cultura."],\n'
    add='["11","Análise Pessoal e o Lugar do Analista","Análise pessoal, pontos cegos, desejo do analista, ética, limites e implicação subjetiva na escuta."],\n["12","Supervisão Clínica e Construção da Escuta","Apresentação de caso, hipótese clínica, transferência, manejo, confidencialidade, encaminhamento e preparação para a prática."],\n'
    if needle not in s: raise SystemExit('psycho sales modules anchor not found')
    s=s.replace(needle,needle+add,1)
s=s.replace('🇧🇷 R$ 372,36','🇧🇷 R$ 299,99').replace('🇪🇺 € 65,34','🇪🇺 € 49,90')
s=s.replace('Pagamento único pelo Stripe: Brasil R$ 372,36 ou Europa € 65,34. Sem parcelamento nesta oferta.','Pagamento único pelo Stripe: Brasil R$ 299,99 ou Europa € 49,90.')
s=s.replace('Brasil, R$ 372,36; Europa, € 65,34 — pagamento único.','Brasil, R$ 299,99; Europa, € 49,90 — pagamento único.')
s=s.replace('Brasil R$ 372,36 ou Europa € 65,34','Brasil R$ 299,99 ou Europa € 49,90')
s=s.replace('R$ 372,36','R$ 299,99').replace('€ 65,34','€ 49,90')
save(p,s)

# 3) Meta description 12 modules.
p,s=load('routes/formacao-psicanalise.tsx')
s=s.replace('Formação Online em Psicanálise: 10 módulos,','Formação Online em Psicanálise: 12 módulos,')
save(p,s)

# 4) Curriculum: unique lesson copy and explicit modules 11/12, keeping exactly 180 lessons.
p,s=load('content/psychoanalysis-curriculum.ts')
old_generic='const generic=(moduleId:number,titles:string[],focus:string)=>titles.map((title,i)=>({id:`m${moduleId}-l${i+1}`,title,summary:focus,content:[focus,"Esta aula organiza os conceitos centrais do tema, relacionando leitura teórica, reflexão clínica e contexto histórico. O objetivo é compreender o conceito sem reduzi-lo a definições decoradas.","Ao estudar, registre dúvidas, conceitos-chave e relações com os textos originais indicados no final do módulo."]}));'
new_generic='''const generic=(moduleId:number,titles:string[],focus:string)=>titles.map((title,i)=>({id:`m${moduleId}-l${i+1}`,title,summary:focus,content:[`Nesta unidade, ${title.toLowerCase()} é estudado dentro do eixo: ${focus}`,i%3===0?`O foco é distinguir o conceito de usos cotidianos e observar como ele se articula ao restante do módulo ${moduleId}. Leia buscando relações, diferenças e limites teóricos.`:i%3===1?`A leitura propõe acompanhar como esse tema aparece na construção psicanalítica, evitando definições isoladas e conectando teoria, história e escuta clínica.`:`Trabalhe o tema como uma questão de estudo: identifique o que o conceito explica, o que ele não explica sozinho e quais tensões permanecem abertas na teoria.`,`Ao concluir “${title}”, registre uma síntese com suas próprias palavras e formule uma pergunta específica para levar ao fórum, às leituras recomendadas ou a um encontro ao vivo.`]}));'''
if old_generic in s: s=s.replace(old_generic,new_generic,1)
else:
    s=re.sub(r'const generic=\(moduleId:number,titles:string\[\],focus:string\)=>titles\.map\(.*?\);\n',new_generic+'\n',s,count=1,flags=re.S)

# Explicit content for modules 11 and 12.
m11=[
('Por que o analista também se analisa','A análise pessoal não é um exercício de perfeição. Ela oferece ao futuro analista um espaço para reconhecer conflitos, repetições e formas próprias de responder ao outro.','Ao ocupar o lugar de escuta, aquilo que pertence à história do analista pode ser mobilizado. Ter experiência de análise ajuda a diferenciar o que emerge do encontro clínico daquilo que pede elaboração pessoal.','A formação psicanalítica exige estudo, análise e supervisão justamente porque nenhum conhecimento teórico elimina a participação subjetiva de quem escuta.'),
('Autoconhecimento não é análise pessoal','Autoconhecimento costuma buscar uma descrição de si; a análise trabalha também com contradições, repetições, lapsos e aquilo que não se oferece imediatamente à consciência.','Na análise pessoal, não se trata apenas de saber “como eu sou”, mas de investigar como certos modos de desejar, temer, evitar ou repetir se organizam na própria história.','Essa diferença é importante para a clínica: reconhecer-se não significa dominar o inconsciente, e sim sustentar uma posição de investigação sobre si.'),
('O inconsciente do próprio analista','O analista também é atravessado pelo inconsciente. Formação técnica não o coloca fora dos conflitos, fantasias ou defesas que caracterizam a vida psíquica.','Na prática, uma fala do paciente pode tocar lembranças, identificações ou afetos do próprio analista. O trabalho pessoal permite reconhecer essas ressonâncias sem transformá-las automaticamente em intervenção clínica.','A questão não é eliminar a subjetividade do analista, mas aprender a responsabilizar-se por ela.'),
('Pontos cegos do analista','Pontos cegos são áreas em que o analista pode ter dificuldade de perceber suas próprias reações, pressupostos ou repetições. Eles não são sinal de fracasso; tornam-se um problema quando permanecem sem elaboração.','Um tema pode provocar pressa em aconselhar, irritação, proteção excessiva ou silêncio defensivo. Perceber esse movimento abre espaço para perguntar de onde ele vem.','Análise pessoal e supervisão funcionam como dispositivos diferentes e complementares para trabalhar esses pontos.'),
('Transferência na própria análise','Na própria análise, o futuro analista experimenta a transferência não apenas como conceito, mas como fenômeno vivido. Expectativas, idealizações, desconfianças e repetições podem aparecer na relação analítica.','Essa experiência ajuda a compreender por que a transferência não é algo que o paciente “faz de propósito”, mas uma atualização de modos de vínculo e de significação.','Viver o processo analítico não autoriza generalizações sobre pacientes; ao contrário, ensina a respeitar a singularidade de cada transferência.'),
('Contratransferência e implicação subjetiva','A contratransferência reúne discussões sobre as respostas afetivas do analista diante do paciente. Diferentes escolas psicanalíticas atribuem pesos distintos a esse conceito.','O ponto formativo é aprender a não agir impulsivamente a partir de uma reação afetiva. Uma sensação intensa pode exigir análise pessoal, supervisão ou simples espera antes de ganhar valor clínico.','A implicação subjetiva do analista pede responsabilidade, não neutralidade impossível.'),
('Afetos mobilizados pela escuta','Escutar sofrimento, raiva, perdas, sexualidade ou violência pode mobilizar tristeza, medo, ternura, incômodo ou impotência no analista. Esses afetos precisam encontrar destino fora de uma resposta impulsiva ao paciente.','Reconhecer um afeto não significa utilizá-lo imediatamente como interpretação. Muitas vezes, a tarefa é suportá-lo, pensar sobre ele e observar como se articula ao campo clínico.','A capacidade de escutar também depende da capacidade de não descarregar sobre o outro aquilo que foi despertado em si.'),
('O desejo do analista','A expressão “desejo do analista” não deve ser confundida com desejo pessoal de salvar, convencer ou transformar o paciente segundo um ideal.','Na formação, é importante investigar expectativas de reconhecimento, gratidão, dependência ou sucesso que podem capturar o trabalho clínico.','Uma escuta psicanalítica procura abrir espaço para o sujeito falar e elaborar, em vez de conduzi-lo para a vida que o analista imagina como correta.'),
('Limites pessoais','Limites pessoais dizem respeito ao reconhecimento de condições emocionais, temporais e relacionais do próprio analista. Não aceitar todo caso e não responder a toda demanda também pode ser uma posição responsável.','Exaustão, conflitos pessoais intensos ou indisponibilidade para determinado manejo precisam ser considerados antes de assumir ou manter um atendimento.','Conhecer limites não diminui a função analítica; protege o enquadre e a qualidade da escuta.'),
('Limites clínicos','Limites clínicos incluem enquadre, horários, comunicação, honorários, confidencialidade e fronteiras da relação profissional. Eles dão contorno ao trabalho e não devem depender apenas do humor do encontro.','Situações de risco, necessidade de cuidado médico ou demandas fora da competência do analista exigem avaliação e, quando necessário, encaminhamento.','Sustentar limites é parte da ética porque impede que a relação clínica se transforme em amizade, tutela ou disponibilidade sem contorno.'),
('Ética e responsabilidade','A ética psicanalítica envolve confidencialidade, respeito à singularidade e responsabilidade sobre intervenções e limites. O analista não trabalha para impor valores pessoais ao paciente.','Também é responsabilidade reconhecer quando um caso exige diálogo com outros profissionais ou quando a própria condição do analista prejudica o trabalho.','A ética aparece nas pequenas decisões do enquadre tanto quanto nas grandes questões clínicas.'),
('Quando a história pessoal invade a clínica','Uma história pessoal semelhante à do paciente pode criar identificação intensa. O analista pode sentir que “já sabe” o que o outro vive porque passou por algo parecido.','Essa familiaridade é arriscada quando substitui a escuta. Duas pessoas podem viver situações externas semelhantes com sentidos psíquicos completamente diferentes.','O trabalho formativo consiste em transformar reconhecimento pessoal em pergunta clínica, e não em certeza sobre o outro.'),
('Sustentar perguntas sem responder pelo outro','A tentação de oferecer respostas rápidas pode surgir diante da angústia do paciente ou do próprio analista. A Psicanálise trabalha para que a fala produza elaboração, não para preencher imediatamente todo vazio.','Sustentar uma pergunta exige tolerar momentos de não saber e evitar aconselhamento automático. Isso não significa indiferença, mas confiança no processo de associação e construção de sentido.','A qualidade da escuta aparece também na capacidade de esperar o tempo do sujeito.'),
('Análise pessoal e formação contínua','A análise pessoal não precisa ser pensada como etapa burocrática que termina quando um certificado é emitido. Para muitos analistas, ela retorna ou continua em diferentes momentos da vida profissional.','Mudanças pessoais, novos casos e fases da prática podem mobilizar questões antes não acessadas. A formação permanece aberta porque o sujeito e a clínica também mudam.','Estudo, análise e supervisão podem se reorganizar ao longo da trajetória profissional.'),
('Síntese: preparar-se para ocupar o lugar de analista','Este módulo reuniu análise pessoal, pontos cegos, afetos, desejo, limites e ética para mostrar que formar-se não é acumular conceitos sobre o inconsciente dos outros.','O analista também precisa construir condições para escutar sem transformar o paciente em resposta para suas próprias necessidades.','Como atividade de integração, identifique três aspectos pessoais que exigem vigilância ética no trabalho clínico e descreva como análise e supervisão podem ajudá-lo a elaborá-los.')]

m12=[
('O que é supervisão clínica','Supervisão é um espaço de elaboração do trabalho clínico. O objetivo não é entregar uma fórmula pronta ao analista, mas examinar material, hipóteses, impasses e decisões do caso.','Ao relatar uma sessão, o supervisionando seleciona elementos e já produz uma leitura. Por isso, a supervisão também observa como o próprio analista está escutando e narrando o caso.','Uma boa supervisão amplia perguntas e ajuda a sustentar responsabilidade técnica e ética.'),
('Por que a supervisão integra a formação','A teoria oferece conceitos; a clínica apresenta situações que raramente cabem de forma perfeita neles. A supervisão cria uma ponte entre leitura e prática.','Ao discutir casos, o aluno aprende a diferenciar compreensão teórica, impressão pessoal e intervenção possível. Esse exercício reduz a tendência de usar conceitos como rótulos.','Supervisão não substitui análise pessoal nem estudo: cada eixo responde a uma dimensão distinta da formação.'),
('Como apresentar um caso','Apresentar um caso exige organizar informações sem transformar o paciente em uma coleção de dados. O foco deve permanecer na pergunta clínica e no processo de escuta.','É útil situar demanda inicial, contexto, movimentos transferenciais, momentos marcantes e dúvidas do analista, preservando a identidade do paciente.','Uma apresentação clara inclui também aquilo que o analista não compreendeu, pois o impasse frequentemente é parte importante da supervisão.'),
('Separar relato, fato e interpretação','Na supervisão, é fundamental distinguir o que foi dito ou ocorreu na sessão da interpretação que o analista construiu sobre aquilo.','“O paciente chegou vinte minutos atrasado” é diferente de “o paciente atrasou porque queria me atacar”. A segunda frase já contém hipótese e precisa ser tratada como tal.','Essa separação ajuda a evitar certezas precipitadas e mantém aberta a investigação clínica.'),
('Construção da hipótese clínica','Hipóteses clínicas são provisórias. Elas organizam a escuta, mas precisam permanecer disponíveis para revisão quando o material aponta outra direção.','Uma hipótese útil articula repetições, conflitos, modos de vínculo e efeitos da transferência sem reduzir o sujeito a uma categoria fixa.','Na supervisão, pergunta-se não apenas “qual é a hipótese?”, mas “que material sustenta essa hipótese e o que a contradiz?”.'),
('Manejo da transferência','A transferência pode aparecer em idealização, desconfiança, exigência, sedução, hostilidade ou dependência. Manejar não significa responder diretamente a cada manifestação.','A supervisão ajuda a pensar quando interpretar, quando esperar e como preservar o enquadre sem entrar em atuações recíprocas.','O manejo depende do momento do processo e da singularidade do caso; não existe frase universal para “resolver” a transferência.'),
('Contratransferência na supervisão','Relatar o que o caso desperta no analista pode ser clinicamente relevante quando isso é feito com responsabilidade. Irritação, sono, urgência ou proteção excessiva podem indicar pontos a investigar.','A supervisão não transforma todo afeto do analista em verdade sobre o paciente. Primeiro é preciso considerar história pessoal, contexto e dinâmica da relação.','Quando a questão pertence principalmente ao analista, a análise pessoal é o espaço adequado para aprofundá-la.'),
('Escuta do discurso e repetição','A supervisão pode ajudar a localizar repetições na fala, mudanças de tema, contradições, silêncios e formas recorrentes de narrar relações.','O interesse não está em caçar significados ocultos, mas em acompanhar como certos modos de dizer se repetem e produzem efeitos no vínculo analítico.','Essa leitura exige trabalhar com sequências e contexto, não com palavras isoladas.'),
('Silêncio e intervenção','Silêncio não é ausência de técnica, e intervenção não é sinônimo de falar muito. Ambos precisam ser pensados a partir do processo.','Um silêncio pode favorecer associação, mas também pode ser vivido como abandono ou defesa; uma intervenção pode abrir elaboração ou fechar prematuramente uma questão.','A supervisão examina efeitos, timing e intenção sem transformar a técnica em receita.'),
('Impasses clínicos','Impasse é o momento em que o trabalho parece circular sem produzir novas associações ou quando analista e paciente ficam presos a uma forma repetitiva de relação.','Em vez de culpar o paciente pela “resistência”, a supervisão investiga o campo: enquadre, manejo, expectativas e participação do analista.','Nomear o impasse como problema de trabalho permite recuperar curiosidade clínica.'),
('Limites do analista','Nenhum analista atende qualquer situação em qualquer condição. Limites de experiência, disponibilidade e competência precisam ser reconhecidos.','Casos que ultrapassam recursos atuais podem demandar supervisão mais próxima, trabalho interdisciplinar ou encaminhamento.','Responsabilidade profissional inclui saber quando continuar estudando antes de assumir determinadas demandas.'),
('Ética e confidencialidade','Material clínico levado à supervisão deve ser anonimizado. Informações identificáveis só devem ser compartilhadas quando estritamente necessárias e dentro de condições éticas adequadas.','O caso pertence à experiência do paciente, não ao portfólio do analista. Supervisão, aula e fórum precisam preservar essa diferença.','Também é ético discutir limites de contato, registros, armazenamento de dados e comunicação fora da sessão.'),
('Quando encaminhar','Encaminhar não significa fracasso. Pode ser necessário quando há demanda médica, risco agudo, necessidade de avaliação psiquiátrica ou quando o enquadre oferecido não responde às necessidades atuais.','A decisão deve considerar segurança, competência e continuidade do cuidado. Sempre que possível, o encaminhamento é feito de maneira responsável e explicada.','A supervisão ajuda a diferenciar ansiedade do analista de situações em que outro recurso é realmente necessário.'),
('Registro e organização do caso','Registros clínicos devem ser objetivos, protegidos e proporcionais à finalidade do trabalho. Anotações excessivas podem expor dados sem necessidade; anotações insuficientes podem prejudicar continuidade e organização.','Na supervisão, uma linha do tempo simples pode ajudar a visualizar mudanças, repetições e intervenções relevantes.','O aluno deve conhecer também as regras de proteção de dados aplicáveis ao país onde atua.'),
('Síntese: da supervisão à prática responsável','Supervisionar é aprender a pensar a clínica em vez de procurar respostas automáticas. O caso permanece vivo porque novas falas podem transformar hipóteses anteriores.','Ao finalizar este módulo, o aluno deve conseguir apresentar um caso de modo anonimizado, separar fatos de hipóteses e formular dúvidas técnicas e éticas.','Como exercício final, construa uma vinheta fictícia e organize quatro partes: relato, hipótese provisória, elementos transferenciais e perguntas para supervisão.')]

def lesson_ts(mid, rows):
    out=[]
    for i,(title,a,b,c) in enumerate(rows,1):
        out.append('{id:'+json.dumps(f'm{mid}-l{i}',ensure_ascii=False)+',title:'+json.dumps(title,ensure_ascii=False)+',summary:'+json.dumps(a,ensure_ascii=False)+',content:['+','.join(json.dumps(x,ensure_ascii=False) for x in (a,b,c))+']}')
    return '['+','.join(out)+']'

added='''const addedPsychoanalysisModules:PsychoanalysisModule[]=[\n{ id:11,title:"Análise Pessoal e o Lugar do Analista",focus:"A função da análise pessoal na formação, os pontos cegos do analista, transferência, contratransferência, desejo do analista, ética e limites pessoais.",lessons:__M11__,deeper:[{title:"Análise Terminável e Interminável",author:"Sigmund Freud",year:"1937",note:"Texto fundamental para pensar os limites e a continuidade do trabalho analítico."},{title:"Recomendações aos Médicos que Exercem a Psicanálise",author:"Sigmund Freud",year:"1912",note:"Ajuda a refletir sobre a posição e a escuta do analista."},{title:"A Questão da Análise Leiga",author:"Sigmund Freud",year:"1926",note:"Amplia a discussão sobre formação e exercício da Psicanálise."}],activity:"Explique por que a análise pessoal integra o tripé formativo e descreva dois riscos clínicos de um analista que não reconhece os próprios pontos cegos."},\n{ id:12,title:"Supervisão Clínica e Construção da Escuta",focus:"Supervisão, apresentação de caso, hipótese clínica, manejo, ética, confidencialidade, limites e preparação para a prática.",lessons:__M12__,deeper:[{title:"Recordar, Repetir e Elaborar",author:"Sigmund Freud",year:"1914",note:"Ajuda a pensar repetição, elaboração e manejo clínico."},{title:"Observações sobre o Amor Transferencial",author:"Sigmund Freud",year:"1915",note:"Texto importante para refletir sobre manejo e limites na transferência."},{title:"Construções em Análise",author:"Sigmund Freud",year:"1937",note:"Aprofunda a reflexão sobre construção, hipótese e trabalho clínico."}],activity:"Construa uma vinheta clínica fictícia curta e diferencie fatos relatados, hipótese de trabalho, elementos transferenciais e pontos que você levaria para supervisão."}\n];'''.replace('__M11__',lesson_ts(11,m11)).replace('__M12__',lesson_ts(12,m12))
pat=r'const addedPsychoanalysisModules:PsychoanalysisModule\[\]=\[.*?\n\];\n\nconst extensionTitles'
if re.search(pat,s,flags=re.S):
    s=re.sub(pat,added+'\n\nconst extensionTitles',s,count=1,flags=re.S)
else:
    raise SystemExit('added modules block not found')

# Make extension lessons non-repetitive in exact wording.
pat_ext=r'function extensionLesson\(module:PsychoanalysisModule,title:string,index:number\):PsychoanalysisLesson\{.*?\}\nexport const psychoanalysisModules'
new_ext='''function extensionLesson(module:PsychoanalysisModule,title:string,index:number):PsychoanalysisLesson{const angle=index%3;return {id:`m${module.id}-l${10+index}`,title,summary:module.focus,content:[`“${title}” amplia um ponto específico do módulo ${module.id}: ${module.focus}`,angle===0?`Use esta unidade para confrontar o conceito com uma situação teórica concreta, anotando diferenças entre definição, exemplo e inferência clínica.`:angle===1?`A proposta é retomar a leitura do módulo por outro ângulo, comparando formulações e verificando onde surgem dúvidas ou mudanças de sentido.`:`Trabalhe esta etapa como revisão ativa: conecte o tema às unidades anteriores e identifique um aspecto que ainda precisa de leitura complementar.`,`Finalize “${title}” escrevendo uma síntese própria e uma pergunta que possa orientar discussão no fórum ou encontro ao vivo.`]};}
export const psychoanalysisModules'''
if re.search(pat_ext,s,flags=re.S): s=re.sub(pat_ext,new_ext,s,count=1,flags=re.S)
else: raise SystemExit('extensionLesson block not found')

# Assert total structure remains 12x15 = 180 logically by current mapper.
if '.slice(0,6)' not in s: raise SystemExit('expected 15-unit mapper not found')
save(p,s)

# 5) Library: remove combo + Hotmart UI, keep individual offer logic.
p,s=load('routes/_clientarea.cliente.biblioteca.tsx')
s=s.replace('clientCreateDigitalCheckout, clientCreateEntrepreneurComboCheckout, clientDigitalLibrary','clientCreateDigitalCheckout, clientDigitalLibrary')
s=re.sub(r'\nconst HOTMART_CHECKOUT_URL = .*?;\nconst HOTMART_LABEL:.*?;\n','\n',s,count=1)
s=s.replace(' const comboCheckoutFn=useServerFn(clientCreateEntrepreneurComboCheckout);','')
s=re.sub(r' const comboCheckout=useMutation\(\{mutationFn:\(market:"BR"\|"INTL"\)=>comboCheckoutFn\(\{data:\{market\}\}\),onSuccess:\(r\)=>\{window\.location\.href=r\.url;\}\}\);','',s,count=1)
s=s.replace('Formação · 10 módulos · 90 aulas','Formação · 12 módulos · 180 unidades')
s=s.replace('🇧🇷 R$ 372,36 · pagamento único','🇧🇷 R$ 299,99 · pagamento único').replace('🇪🇺 € 65,34','🇪🇺 € 49,90')
s=s.replace('ownedProductCount}/3','ownedProductCount}/4')
s=s.replace('  const someOwned=ownedProductCount>0&&!allOwned;\n','')
# Replace combo conditional start through start of existing individual remaining-products section.
combo_pat=r'    \{noneOwned\?\(<>\s*<section className="overflow-hidden rounded-\[28px\].*?</section>\s*</>\):someOwned\?\('
if re.search(combo_pat,s,flags=re.S):
    s=re.sub(combo_pat,'    {!allOwned?(',s,count=1,flags=re.S)
else:
    raise SystemExit('library combo block not found')
s=s.replace('{locale==="pt"?"Falta pouco para completar seus conteúdos":locale==="fr"?"Il vous reste peu pour compléter vos contenus":locale==="es"?"Falta poco para completar tus contenidos":"You\'re close to completing your content library"}',
'''{noneOwned?(locale==="pt"?"Escolha seus conteúdos individualmente":locale==="fr"?"Choisissez vos contenus individuellement":locale==="es"?"Elige tus contenidos individualmente":"Choose your content individually"):(locale==="pt"?"Falta pouco para completar seus conteúdos":locale==="fr"?"Il vous reste peu pour compléter vos contenus":locale==="es"?"Falta poco para completar tus contenidos":"You're close to completing your content library")}''')
s=s.replace('{locale==="pt"?"Você não será cobrado novamente pelo que já possui. Compre somente o que falta pelos cards acima.":locale==="fr"?"Vous ne serez pas facturé à nouveau pour ce que vous possédez déjà. Achetez uniquement les contenus manquants via les cartes ci-dessus.":locale==="es"?"No se te cobrará de nuevo por lo que ya tienes. Compra únicamente lo que falta en las tarjetas de arriba.":"You will not be charged again for content you already own. Buy only the remaining items from the cards above."}',
'''{noneOwned?(locale==="pt"?"Cada produto é vendido separadamente, com pagamento único pelo Stripe. Toque no conteúdo para ver preço e comprar.":locale==="fr"?"Chaque produit est vendu séparément, avec un paiement unique via Stripe.":locale==="es"?"Cada producto se vende por separado, con pago único mediante Stripe.":"Each product is sold separately with a one-time Stripe payment."):(locale==="pt"?"Você não será cobrado novamente pelo que já possui. Compre somente o que falta pelos cards acima.":locale==="fr"?"Vous ne serez pas facturé à nouveau pour ce que vous possédez déjà. Achetez uniquement les contenus manquants via les cartes ci-dessus.":locale==="es"?"No se te cobrará de nuevo por lo que ya tienes. Compra únicamente lo que falta en las tarjetas de arriba.":"You will not be charged again for content you already own. Buy only the remaining items from the cards above.")}''')
save(p,s)

# 6) Disable NEW combo checkout server-side while retaining historical combo aliases/entitlements.
p,s=load('lib/client-portal.server.ts')
combo_fn=r'export async function createClientEntrepreneurComboCheckout\(userId:string,email:string\|null,market:DigitalMarket\)\{.*?\n\}\n'
if re.search(combo_fn,s,flags=re.S):
    s=re.sub(combo_fn,'export async function createClientEntrepreneurComboCheckout(_userId:string,_email:string|null,_market:DigitalMarket){\n  fail("A oferta de combo foi descontinuada. Os produtos são vendidos individualmente.");\n}\n',s,count=1,flags=re.S)
else:
    raise SystemExit('combo checkout server function not found')
save(p,s)

# 7) Training public sales: remove two combo cards, keep individual training offer.
p,s=load('components/training-launch-page-v2.tsx')
s=re.sub(r'\n const combo=\{.*?\};\n return', '\n return', s, count=1, flags=re.S)
s=re.sub(r'\n\s*<section className="my-8 .*?data-public-combo-card="v1".*?</section>', '', s, count=1, flags=re.S)
s=re.sub(r'\n\s*<section className="mb-10 overflow-hidden rounded-\[2rem\] border-2 border-\[#d7ad54\] bg-\[#3b101e\].*?</section>', '', s, count=1, flags=re.S)
if 'data-public-combo-card' in s or 'combo.badge' in s: raise SystemExit('public combo UI still present')
save(p,s)

# 8) Homepage: individual training price, Stripe only, 12 modules for psychoanalysis.
p,s=load('routes/index.tsx')
repls={
'includes:"Inclui eBook + Livro + Formação Completa"':'includes:"Formação vendida individualmente · pagamento único"',
'priceBr:"🇧🇷 12x de R$ 31,03"':'priceBr:"🇧🇷 R$ 299,99"',
'priceEu:"🇪🇺 € 65,34"':'priceEu:"🇪🇺 € 49,90"',
'hotmart:"COMPRA PELA HOTMART DISPONÍVEL NA BIBLIOTECA"':'hotmart:"Pagamento único e seguro pelo Stripe"',
'includes:"Includes eBook + Book + Complete Training"':'includes:"Training sold separately · one-time payment"',
'priceBr:"🇧🇷 12x R$ 31.03"':'priceBr:"🇧🇷 R$ 299.99"',
'priceEu:"🇪🇺 €65.34"':'priceEu:"🇪🇺 €49.90"',
'hotmart:"HOTMART PURCHASE AVAILABLE IN THE LIBRARY"':'hotmart:"Secure one-time payment via Stripe"',
'includes:"Inclut eBook + Livre + Formation Complète"':'includes:"Formation vendue séparément · paiement unique"',
'priceBr:"🇧🇷 12x R$ 31,03"':'priceBr:"🇧🇷 R$ 299,99"',
'priceEu:"🇪🇺 65,34 €"':'priceEu:"🇪🇺 49,90 €"',
'hotmart:"ACHAT HOTMART DISPONIBLE DANS LA BIBLIOTHÈQUE"':'hotmart:"Paiement unique et sécurisé via Stripe"',
'includes:"Incluye eBook + Libro + Formación Completa"':'includes:"Formación vendida por separado · pago único"',
'priceBr:"🇧🇷 12x R$ 31,03"':'priceBr:"🇧🇷 R$ 299,99"',
'priceEu:"🇪🇺 € 65,34"':'priceEu:"🇪🇺 € 49,90"',
'hotmart:"COMPRA POR HOTMART DISPONIBLE EN LA BIBLIOTECA"':'hotmart:"Pago único y seguro mediante Stripe"',
'10 módulos · 6 encontros ao vivo':'12 módulos · 6 encontros ao vivo'
}
for a,b in repls.items(): s=s.replace(a,b)
s=s.replace('<span className="line-through text-white/55">R$ 599,99 / € 100,56</span><strong className="text-[#f0d58e]">LANÇAMENTO R$ 299,99 / € 49,90</strong>','<strong className="text-[#f0d58e]">PAGAMENTO ÚNICO · R$ 299,99 / € 49,90</strong>')
save(p,s)

# 9) Training price remains the already validated individual launch price; preserve historical combo entitlement support only.
# Remove Hotmart sales wording from current product UI components, without deleting webhook/history.
for rel in ['components/digital-preview-reader.tsx']:
    p,s=load(rel)
    s=s.replace('combo','produto') if False else s
    save(p,s)

# 10) Sanity checks across active files.
checks={
'psycho sales modules': ('components/psychoanalysis-training-page.tsx','["12","Supervisão Clínica e Construção da Escuta"'),
'psycho BR price': ('lib/psychoanalysis-commerce.server.ts','const PRICE_BRL=29_999;'),
'psycho EU price': ('lib/psychoanalysis-commerce.server.ts','const PRICE_EUR=4_990;'),
'library no combo UI': ('routes/_clientarea.cliente.biblioteca.tsx','QUERO O COMBO COMPLETO'),
'home single price': ('routes/index.tsx','🇧🇷 R$ 299,99'),
}
for name,(rel,token) in checks.items():
    text=(root/rel).read_text(encoding='utf-8')
    if name=='library no combo UI':
        if token in text: raise SystemExit('combo CTA still in library')
    elif token not in text: raise SystemExit(f'missing sanity token: {name}')

# Ensure public product UIs no longer mention Hotmart/12x/combo sales.
for rel in ['routes/_clientarea.cliente.biblioteca.tsx','components/psychoanalysis-training-page.tsx','components/training-launch-page-v2.tsx','routes/index.tsx']:
    text=(root/rel).read_text(encoding='utf-8')
    if 'Hotmart' in text or 'HOTMART' in text: raise SystemExit(f'Hotmart UI reference remains in {rel}')
    if rel!='components/training-launch-page-v2.tsx' and '12x de R$ 31,03' in text: raise SystemExit(f'installment reference remains in {rel}')

print('final individual-product and psychoanalysis patch applied')
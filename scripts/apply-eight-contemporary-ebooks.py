from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
APP=ROOT/'apps/painel-ldr'

KEYS=[
'ebook_psicologia_psicanalise_terapias',
'ebook_jornalismo_era_digital',
'ebook_corpo_trabalho_escuta',
'ebook_comportamento_humano',
'ebook_estetica_bem_estar',
'ebook_tricologia_cuidado',
'ebook_ia_novos_milionarios',
'ebook_imigracao_efeitos_psicologicos',
]

BOOKS=[
('ebook_psicologia_psicanalise_terapias','psicologia-psicanalise-terapias-integrativas','Psicologia, Psicanálise e Terapias Integrativas','Diálogos, Diferenças e Possibilidades','#4C5B7A',[
'O nascimento das diferentes formas de compreender o ser humano','O que é Psicologia','As principais abordagens da Psicologia','O nascimento da Psicanálise','Freud e a descoberta do inconsciente','A Psicanálise depois de Freud','O que são Terapias Integrativas','Corpo, mente e subjetividade','Sintoma e sofrimento humano','Escuta e vínculo','Emoções e comportamento','O lugar da história individual','Diferentes formas de compreender ansiedade e sofrimento','Complementaridade e seus limites','O problema das promessas de cura','Ética e responsabilidade profissional','Limites de atuação','Trabalho interdisciplinar','Situações práticas comparadas','O futuro do cuidado humano']),
('ebook_jornalismo_era_digital','jornalismo-era-digital','Jornalismo na Era Digital','Informação, Sociedade e Novas Tecnologias','#315D68',[
'Por que o jornalismo existe','História do jornalismo','Notícia, informação e interesse público','Como nasce uma pauta','Apuração jornalística','Fontes jornalísticas','A entrevista','Escrita jornalística','Reportagem','Jornalismo investigativo','Jornalismo digital','Redes sociais e distribuição da informação','Jornalismo de dados','Fake news e desinformação','Fact-checking e verificação','Ética jornalística','Inteligência artificial nas redações','Algoritmos e circulação da informação','Novos modelos de negócio para jornalistas','O jornalista do futuro']),
('ebook_corpo_trabalho_escuta','corpo-trabalho-escuta','Corpo, Trabalho e Escuta','Massagem e Psicanálise no Bem-Estar do Trabalhador','#6A4E3B',[
'O trabalhador e seu corpo','Trabalho, corpo e sociedade','O corpo submetido à rotina','Tensão e sobrecarga','Estresse relacionado ao trabalho','Introdução às práticas de massagem','Massagem de bem-estar','Massagem laboral','Ambiente e experiência de cuidado','Psicanálise e trabalho','Inconsciente e vida profissional','Trabalho, identidade e reconhecimento','Sofrimento relacionado ao trabalho','Corpo e subjetividade','O que Massagem e Psicanálise podem ensinar separadamente','Duas atuações, limites bem definidos','Por que não atendo massagem em clientes de Psicanálise','Transferência, contato corporal e limites','Ética, encaminhamento e conflitos de interesse','Construindo políticas responsáveis de bem-estar']),
('ebook_comportamento_humano','comportamento-humano','Como Mudar o Comportamento Humano','Hábitos, Ambiente e Processos de Mudança','#5B4A73',[
'O que chamamos de comportamento','Natureza, ambiente e aprendizagem','Como hábitos são formados','Recompensa','Motivação','Emoções','Pensamento e ação','Ambiente','Relações sociais','Identidade','Tomada de decisão','Autocontrole','Procrastinação','Resistência à mudança','Repetição de padrões','Construção de novos hábitos','Mudanças no ambiente','Mudança sustentável','Por que algumas mudanças fracassam','Construindo um projeto pessoal de mudança']),
('ebook_estetica_bem_estar','estetica-bem-estar','Estética Aplicada ao Bem-Estar','Práticas, Experiência e Cuidado','#8A5965',[
'História da estética','Estética contemporânea','Beleza, cultura e sociedade','Imagem corporal','Autoimagem','Experiência de cuidado','Acolhimento do cliente','Ambiente','Comunicação profissional','Experiência sensorial','Rotinas de atendimento','Biossegurança','Limites profissionais','Expectativas do cliente','Promessas e resultados','Ética','Experiência premium','Fidelização responsável','Gestão de serviços de estética','O futuro da estética e do bem-estar']),
('ebook_tricologia_cuidado','tricologia-cuidado','Tricologia Capilar Aplicada ao Cuidado','Prática, Acompanhamento e Resultados','#48665A',[
'Introdução à tricologia','Anatomia do cabelo','Estrutura do fio','Couro cabeludo','Ciclo capilar','Avaliação inicial','Anamnese','Alterações do couro cabeludo','Alterações dos fios','Rotinas de cuidado','Cosméticos capilares','Procedimentos e limites','Registro fotográfico','Construção de protocolos de acompanhamento','Avaliação da evolução','Como interpretar resultados','Expectativa versus resultado','Quando encaminhar para profissional de saúde','Ética e responsabilidade','Construindo uma prática profissional de cuidado capilar']),
('ebook_ia_novos_milionarios','ia-novos-milionarios','Como a Inteligência Artificial Pode Criar Novos Milionários','Oportunidades, Negócios e Profissões na Nova Economia da IA','#273F66',[
'A nova revolução tecnológica','Como chegamos à IA generativa','O que a IA realmente consegue fazer','Automação do trabalho','Novas profissões','Profissões em transformação','O empreendedor individual aumentado por IA','Empresas operadas com equipes menores','Produtos digitais','Serviços baseados em IA','Agentes de IA','Automação empresarial','IA aplicada às vendas','IA aplicada ao marketing','IA aplicada à educação','Modelos de monetização','Como identificar oportunidades','Riscos, bolhas e falsas promessas','Construindo um negócio baseado em IA','Quem poderá capturar valor na nova economia']),
('ebook_imigracao_efeitos_psicologicos','imigracao-efeitos-psicologicos','Entre Dois Mundos','Imigração e os Efeitos Psicológicos da Experiência Migratória','#6A586B',[
'Por que partimos','A decisão de deixar o país','O último dia antes da partida','A chegada','Choque cultural','Língua e identidade','Saudade','Solidão','Família à distância','Relacionamentos depois da imigração','Trabalho e sobrevivência','Qualificação profissional e recomeço','Preconceito e exclusão','Pertencimento','Viver entre duas culturas','Construção de novas redes sociais','Adaptação','Quando voltar também é difícil','Quando procurar apoio profissional','Construindo pertencimento sem apagar as origens']),
]

OLD_UNION='"ebook_coragem_comecar" | "livro_menino_mamao" | "ebook_pratica_clinica_psicanalise" | "ebook_psicanalise_no_mundo" | "ebook_estudos_caso_psicanalise" | "ebook_psicanalise_autismo"'
NEW_UNION=OLD_UNION+' | '+' | '.join(f'"{k}"' for k in KEYS)
OLD_LIST='"ebook_coragem_comecar","livro_menino_mamao","ebook_pratica_clinica_psicanalise","ebook_psicanalise_no_mundo","ebook_estudos_caso_psicanalise","ebook_psicanalise_autismo"'
NEW_LIST=OLD_LIST+','+','.join(f'"{k}"' for k in KEYS)

def rw(path,fn):
 p=APP/path
 s=p.read_text()
 n=fn(s)
 if n==s: raise SystemExit(f'no change: {path}')
 p.write_text(n)

def rep(s,a,b,n=None):
 if a not in s: raise SystemExit(f'missing marker: {a[:80]}')
 return s.replace(a,b) if n is None else s.replace(a,b,n)

# Catalog: append only new books; existing Psicanálise e Autismo remains untouched.
def patch_catalog(s):
 marker='\n] as const;'
 if any(k in s for k in KEYS): return s
 blocks=[]
 for key,slug,title,subtitle,color,chapters in BOOKS:
  ch=', '.join(repr(x) for x in chapters)
  desc=f'Obra da Coleção Estudos Contemporâneos com 20 capítulos sobre {title.lower()}, escrita para estudo aprofundado, aplicação responsável e reflexão crítica.'
  if key=='ebook_corpo_trabalho_escuta': desc='Obra sobre corpo, trabalho, massagem de bem-estar e Psicanálise como práticas distintas, com limites profissionais explícitos e sem atendimento híbrido.'
  if key=='ebook_ia_novos_milionarios': desc='Análise crítica das oportunidades econômicas abertas pela IA, sem promessa de enriquecimento ou resultado financeiro garantido.'
  blocks.append(f'''  {{\n    key:{key!r}, slug:{slug!r}, publicPath:{('/ebooks/'+slug)!r}, readerPath:{('/cliente/biblioteca/'+key)!r}, color:{color!r},\n    title:{title!r}, subtitle:{subtitle!r}, short:{title!r},\n    description:{desc!r},\n    audience:'Leitores, estudantes e profissionais interessados em aprofundamento contemporâneo e aplicação responsável.',\n    priceBrlCents:2000, priceEurCents:399,\n    chapters:[{ch}]\n  }},\n''')
 return rep(s,marker,'\n'+''.join(blocks)+'] as const;',1)
rw(Path('src/lib/psychoanalysis-ebooks.catalog.ts'),patch_catalog)

# Reader/server allowlists.
rw(Path('src/lib/digital-content.server.ts'),lambda s: rep(rep(s,OLD_UNION,NEW_UNION), '  ebook_psicanalise_autismo: ["ebook_psicanalise_autismo"],', '  ebook_psicanalise_autismo: ["ebook_psicanalise_autismo"],\n'+''.join(f'  {k}: ["{k}"],\n' for k in KEYS)))
rw(Path('src/lib/digital-content.functions.ts'),lambda s: rep(s,'  "ebook_psicanalise_autismo",\n]);','  "ebook_psicanalise_autismo",\n'+''.join(f'  "{k}",\n' for k in KEYS)+']);'))
rw(Path('src/routes/_clientarea.cliente.biblioteca.$productKey.tsx'),lambda s: rep(s,OLD_LIST,NEW_LIST))

# Reader type + visual themes.
def patch_reader(s):
 s=rep(s,OLD_UNION,NEW_UNION)
 marker='  ebook_psicanalise_autismo:{light:"bg-[#fafaf3] text-[#303114]",dark:"bg-[#20210d] text-[#fafae9]",cardLight:"border-[#d6d7b8] bg-white",cardDark:"border-[#66682c] bg-[#2e3013]",accent:"#6B6F2A",soft:"#ececcf"}'
 themes='''  ebook_psicanalise_autismo:{light:"bg-[#fafaf3] text-[#303114]",dark:"bg-[#20210d] text-[#fafae9]",cardLight:"border-[#d6d7b8] bg-white",cardDark:"border-[#66682c] bg-[#2e3013]",accent:"#6B6F2A",soft:"#ececcf"},\n  ebook_psicologia_psicanalise_terapias:{light:"bg-[#f5f6fa] text-[#20283a]",dark:"bg-[#121621] text-[#f4f6fb]",cardLight:"border-[#c6cbd8] bg-white",cardDark:"border-[#46516c] bg-[#1a2030]",accent:"#4C5B7A",soft:"#e4e7ef"},\n  ebook_jornalismo_era_digital:{light:"bg-[#f3f8f8] text-[#183033]",dark:"bg-[#0d1c1e] text-[#eef8f8]",cardLight:"border-[#bdd0d2] bg-white",cardDark:"border-[#37676c] bg-[#12282b]",accent:"#315D68",soft:"#ddebec"},\n  ebook_corpo_trabalho_escuta:{light:"bg-[#faf7f4] text-[#33251d]",dark:"bg-[#211710] text-[#fff7f1]",cardLight:"border-[#d9c9bd] bg-white",cardDark:"border-[#735640] bg-[#302118]",accent:"#6A4E3B",soft:"#eee3db"},\n  ebook_comportamento_humano:{light:"bg-[#f8f6fb] text-[#2b2237]",dark:"bg-[#1b1522] text-[#faf6ff]",cardLight:"border-[#d0c5da] bg-white",cardDark:"border-[#624f76] bg-[#271d32]",accent:"#5B4A73",soft:"#e9e1ef"},\n  ebook_estetica_bem_estar:{light:"bg-[#fcf7f8] text-[#3c252b]",dark:"bg-[#241519] text-[#fff7f9]",cardLight:"border-[#dfc5cb] bg-white",cardDark:"border-[#875261] bg-[#321d23]",accent:"#8A5965",soft:"#f2e3e7"},\n  ebook_tricologia_cuidado:{light:"bg-[#f4f8f5] text-[#213129]",dark:"bg-[#111d17] text-[#f2faf5]",cardLight:"border-[#bfd0c6] bg-white",cardDark:"border-[#476956] bg-[#18281f]",accent:"#48665A",soft:"#dfeae4"},\n  ebook_ia_novos_milionarios:{light:"bg-[#f2f5fa] text-[#17253c]",dark:"bg-[#091321] text-[#f1f6ff]",cardLight:"border-[#bec9db] bg-white",cardDark:"border-[#34547f] bg-[#102039]",accent:"#273F66",soft:"#dce5f2"},\n  ebook_imigracao_efeitos_psicologicos:{light:"bg-[#f8f6f8] text-[#332b34]",dark:"bg-[#1d171e] text-[#fbf6fb]",cardLight:"border-[#d5cbd6] bg-white",cardDark:"border-[#69586b] bg-[#291f2a]",accent:"#6A586B",soft:"#ebe3ec"}'''
 return rep(s,marker,themes)
rw(Path('src/components/digital-reader-v2.tsx'),patch_reader)

# Client library + checkout allowlists and pricing, using existing eBook pattern (R$20 / €3.99).
def patch_client(s):
 s=rep(s,OLD_UNION,NEW_UNION)
 last='  { key:"ebook_psicanalise_autismo", title:"Psicanálise e Autismo", description:"Escuta, manejo, neurodiversidade e debate crítico com a ABA.", priceBrlCents:2000, priceEurCents:399, purchaseUrl:"/ebook-psicanalise-autismo" },'
 newitems='\n'.join(f'  {{ key:"{key}", title:{title!r}, description:{subtitle!r}, priceBrlCents:2000, priceEurCents:399, purchaseUrl:"/ebooks/{slug}" }},' for key,slug,title,subtitle,_,_ in BOOKS)
 s=rep(s,last,last+'\n'+newitems)
 alias='    ebook_psicanalise_autismo:["ebook_psicanalise_autismo"],'
 s=rep(s,alias,alias+'\n'+''.join(f'    {k}:["{k}"],\n' for k in KEYS))
 cfg='  ebook_psicanalise_autismo:{title:"Psicanálise e Autismo",brlCents:2000,eurCents:399,brlPriceEnv:"STRIPE_EBOOK_AUTISM_PRICE_BRL",eurPriceEnv:"STRIPE_EBOOK_AUTISM_PRICE_EUR",dynamicPrice:true},'
 extra='\n'.join(f'  {key}:{{title:{title!r},brlCents:2000,eurCents:399,brlPriceEnv:"STRIPE_EBOOK_COLLECTION_PRICE_BRL",eurPriceEnv:"STRIPE_EBOOK_COLLECTION_PRICE_EUR",dynamicPrice:true}},' for key,_,title,_,_,_ in BOOKS)
 return rep(s,cfg,cfg+'\n'+extra)
rw(Path('src/lib/client-portal.server.ts'),patch_client)
rw(Path('src/lib/client-portal.functions.ts'),lambda s: rep(s,OLD_UNION,NEW_UNION))

# Intercept all new collection ebooks with existing dynamic fixed-price Stripe path, avoiding new env requirements.
def patch_fixed(s):
 marker='  ebook_estudos_caso_psicanalise: "Estudos de Caso",'
 extra='\n'.join(f'  {key}: {title!r},' for key,_,title,_,_,_ in BOOKS)
 s=rep(s,marker,marker+'\n'+extra)
 s=rep(s,'  if ((!isPremiumCases && input.market !== "BR") || !isFixedBrlEbook(input.productKey)) {','  const isCollectionOne = '+repr(KEYS)+'.includes(input.productKey as any);\n  if ((!isPremiumCases && !isCollectionOne && input.market !== "BR") || !isFixedBrlEbook(input.productKey)) {')
 s=rep(s,'  const amountCents = isPremiumCases ? (input.market === "BR" ? 7990 : 1490) : 2000;','  const amountCents = isPremiumCases ? (input.market === "BR" ? 7990 : 1490) : (input.market === "BR" ? 2000 : 399);')
 return s
rw(Path('src/lib/fixed-brl-ebook-checkout.server.ts'),patch_fixed)

# Keep DB schema migration in version control. Content rows are loaded separately through the protected content table.
mig=APP/'supabase/migrations/20260914024000_add_eight_contemporary_ebooks.sql'
allowed=['ebook_coragem_comecar','livro_menino_mamao','ebook_pratica_clinica_psicanalise','ebook_psicanalise_no_mundo','ebook_estudos_caso_psicanalise','ebook_psicanalise_autismo']+KEYS
arr=','.join("'%s'::text"%x for x in allowed)
mig.write_text('alter table public.digital_product_content drop constraint if exists digital_product_content_product_key_check;\n'+'alter table public.digital_product_content add constraint digital_product_content_product_key_check check (product_key = any (array['+arr+']));\n')

print('Eight new contemporary ebooks patched without modifying existing ebook records.')

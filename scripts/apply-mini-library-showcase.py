from pathlib import Path

p = Path('apps/painel-ldr/src/components/library-sales-home-access-choice.tsx')
s = p.read_text(encoding='utf-8')

if 'id="mini-library-showcase"' in s:
    print('mini-library showcase already present')
    raise SystemExit(0)

marker = 'const tone = { violet:"border-violet-200 bg-violet-50", blue:"border-blue-200 bg-blue-50", emerald:"border-emerald-200 bg-emerald-50", gold:"border-[#d6ad63]/40 bg-[#fff9ed]" } as const;'
showcase = '''const libraryShowcase = {
  pt:{eyebrow:"POR DENTRO DA BIBLIOTECA",title:"Veja o que você encontra antes de escolher.",sub:"Uma prévia visual da experiência da Biblioteca LDR. Escolha um caminho e avance para a oferta correspondente.",more:"VER TODOS OS CONTEÚDOS",less:"MOSTRAR MENOS",cta:"Explorar",items:{psycho:["Psicanálise","Formação completa para aprofundar teoria e prática"],business:["Negócio 24h","Da ideia à primeira oferta pronta para vender"],massage:["Massoterapia","Formação completa e prática profissional"],mentor:["Mentoria","Desenvolvimento profissional e de carreira"],psychoWrite:["Orientação Psicanalítica Escrita","Orientação privada por texto"],careerWrite:["Orientação Profissional Escrita","Carreira, currículo e próximos passos"],news:["Jornal LDR","Notícias, negócios, ciência e mundo"],mag:["Revista LDR","Carreira, comportamento, inovação e histórias"],ebooks:["eBooks","Conteúdos digitais para ler no seu ritmo"],books:["Livros","Histórias, conhecimento e desenvolvimento"],brief:["Terapia Breve","Formação em Terapia Breve Psicanalítica"],lead:["Liderança","Gestão de pessoas e desenvolvimento de equipes"],rh:["RH 600h","Formação gratuita em Gestão de Pessoas e RH"],free:["Conteúdo Gratuito","Comece a aprender sem pagar"],ai:["IA","Conteúdos e ferramentas para o futuro"],film:["Filme","Conteúdo audiovisual e reflexão"]}},
  en:{eyebrow:"INSIDE THE LIBRARY",title:"See what you can access before choosing.",sub:"A visual preview of the LDR Library experience. Choose a path and continue to the corresponding offer.",more:"VIEW ALL CONTENT",less:"SHOW LESS",cta:"Explore",items:{psycho:["Psychoanalysis","Complete training in theory and clinical practice"],business:["Business in 24h","From idea to a first offer ready to sell"],massage:["Massage Therapy","Complete training and professional practice"],mentor:["Mentoring","Professional and career development"],psychoWrite:["Written Psychoanalytic Guidance","Private guidance by text"],careerWrite:["Written Career Guidance","Career, résumé and next steps"],news:["LDR Newspaper","News, business, science and world"],mag:["LDR Magazine","Career, behavior, innovation and stories"],ebooks:["eBooks","Digital content to read at your own pace"],books:["Books","Stories, knowledge and development"],brief:["Brief Therapy","Brief Psychoanalytic Therapy training"],lead:["Leadership","People management and team development"],rh:["HR 600h","Free People Management and HR training"],free:["Free Content","Start learning at no cost"],ai:["AI","Content and tools for the future"],film:["Film","Audiovisual content and reflection"]}},
  fr:{eyebrow:"À L’INTÉRIEUR DE LA BIBLIOTHÈQUE",title:"Découvrez ce que vous pouvez trouver avant de choisir.",sub:"Un aperçu visuel de l’expérience Bibliothèque LDR. Choisissez un parcours et continuez vers l’offre correspondante.",more:"VOIR TOUS LES CONTENUS",less:"AFFICHER MOINS",cta:"Découvrir",items:{psycho:["Psychanalyse","Formation complète en théorie et pratique clinique"],business:["Business en 24h","De l’idée à une première offre prête à vendre"],massage:["Massothérapie","Formation complète et pratique professionnelle"],mentor:["Mentorat","Développement professionnel et carrière"],psychoWrite:["Orientation Psychanalytique Écrite","Orientation privée par écrit"],careerWrite:["Orientation Professionnelle Écrite","Carrière, CV et prochaines étapes"],news:["Journal LDR","Actualités, business, science et monde"],mag:["Magazine LDR","Carrière, comportement, innovation et histoires"],ebooks:["eBooks","Contenus numériques à lire à votre rythme"],books:["Livres","Histoires, savoir et développement"],brief:["Thérapie Brève","Formation en Thérapie Brève Psychanalytique"],lead:["Leadership","Gestion des personnes et développement d’équipes"],rh:["RH 600h","Formation gratuite en Gestion des Personnes et RH"],free:["Contenu Gratuit","Commencez à apprendre gratuitement"],ai:["IA","Contenus et outils pour l’avenir"],film:["Film","Contenu audiovisuel et réflexion"]}},
  es:{eyebrow:"DENTRO DE LA BIBLIOTECA",title:"Mira lo que encontrarás antes de elegir.",sub:"Una vista previa visual de la experiencia de Biblioteca LDR. Elige un camino y continúa a la oferta correspondiente.",more:"VER TODOS LOS CONTENIDOS",less:"MOSTRAR MENOS",cta:"Explorar",items:{psycho:["Psicoanálisis","Formación completa en teoría y práctica clínica"],business:["Negocio 24h","De la idea a una primera oferta lista para vender"],massage:["Masoterapia","Formación completa y práctica profesional"],mentor:["Mentoría","Desarrollo profesional y de carrera"],psychoWrite:["Orientación Psicoanalítica Escrita","Orientación privada por texto"],careerWrite:["Orientación Profesional Escrita","Carrera, currículum y próximos pasos"],news:["Periódico LDR","Noticias, negocios, ciencia y mundo"],mag:["Revista LDR","Carrera, comportamiento, innovación e historias"],ebooks:["eBooks","Contenido digital para leer a tu ritmo"],books:["Libros","Historias, conocimiento y desarrollo"],brief:["Terapia Breve","Formación en Terapia Breve Psicoanalítica"],lead:["Liderazgo","Gestión de personas y desarrollo de equipos"],rh:["RRHH 600h","Formación gratuita en Gestión de Personas y RRHH"],free:["Contenido Gratuito","Empieza a aprender sin pagar"],ai:["IA","Contenidos y herramientas para el futuro"],film:["Película","Contenido audiovisual y reflexión"]}}
} as const;

'''
if marker not in s:
    raise SystemExit('tone marker not found')
s = s.replace(marker, showcase + marker, 1)

state = '  const [remaining,setRemaining]=useState<number|null>(null);'
replacement = '''  const [remaining,setRemaining]=useState<number|null>(null);
  const [showLibraryAll,setShowLibraryAll]=useState(false);
  const showcase=libraryShowcase[locale];
  const cardDefs=[
    {k:"psycho",icon:"🎓",to:"/formacao-psicanalise",tone:"from-[#5a2a83] to-[#7a3dac]"},
    {k:"business",icon:"📈",to:"/formacao-negocio-em-24-horas",tone:"from-[#a73b11] to-[#d65a1d]"},
    {k:"massage",icon:"🌿",to:"/formacao-massoterapia",tone:"from-[#0f6173] to-[#1581a0]"},
    {k:"mentor",icon:"💼",to:"/cliente/biblioteca",tone:"from-[#0a5fae] to-[#1873cf]"},
    {k:"psychoWrite",icon:"✍️",to:"/cliente/orientacao-psicanalitica",tone:"from-[#233f72] to-[#375d95]"},
    {k:"careerWrite",icon:"🧭",to:"/cliente/orientacao-profissional",tone:"from-[#075da7] to-[#1684dd]"},
    {k:"news",icon:"📰",to:"/cliente/biblioteca/jornal-ldr",tone:"from-[#071426] to-[#163b67]"},
    {k:"mag",icon:"📖",to:"/cliente/biblioteca/revista-ldr",tone:"from-[#630820] to-[#8d1236]"},
    {k:"ebooks",icon:"📚",to:"/cliente/biblioteca",tone:"from-[#6b0826] to-[#8a1037]"},
    {k:"books",icon:"📘",to:"/cliente/biblioteca",tone:"from-[#6d0d2c] to-[#981443]"},
    {k:"brief",icon:"🧠",to:"/formacao-terapia-breve-psicanalitica",tone:"from-[#12675d] to-[#1b897b]"},
    {k:"lead",icon:"👥",to:"/cliente/biblioteca",tone:"from-[#075c35] to-[#0b7a48]"},
    {k:"rh",icon:"🎯",to:"/cliente/formacoes/gestao-pessoas-rh",tone:"from-[#087255] to-[#0b9a70]"},
    {k:"free",icon:"🎁",to:"/cliente/biblioteca",tone:"from-[#b34d1c] to-[#d66a2c]"},
    {k:"ai",icon:"🤖",to:"/cliente/biblioteca",tone:"from-[#123955] to-[#205b7d]"},
    {k:"film",icon:"🎬",to:"/cliente/biblioteca",tone:"from-[#3b0817] to-[#640d27]"},
  ] as const;'''
if state not in s:
    raise SystemExit('state marker not found')
s = s.replace(state, replacement, 1)

anchor = '    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6"><h2 className="font-serif text-3xl sm:text-4xl">{t.choose}</h2>'
section = '''    <section id="mini-library-showcase" className="border-b border-[#d6ad63]/20 bg-white py-12 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center"><p className="text-xs font-black uppercase tracking-[.22em] text-[#a36d19]">{showcase.eyebrow}</p><h2 className="mt-3 font-serif text-3xl text-[#071426] sm:text-4xl">{showcase.title}</h2><p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">{showcase.sub}</p></div>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">{cardDefs.slice(0,showLibraryAll?cardDefs.length:8).map((card)=>{const item=showcase.items[card.k];return <Link key={card.k} to={card.to} className={`group relative min-h-[168px] overflow-hidden rounded-[24px] bg-gradient-to-br ${card.tone} p-5 text-white shadow-md transition duration-200 hover:-translate-y-1 hover:shadow-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#d6ad63]/40`}><span className="text-3xl" aria-hidden="true">{card.icon}</span><h3 className="mt-5 text-base font-black leading-tight sm:text-lg">{item[0]}</h3><p className="mt-2 text-xs leading-5 text-white/75 sm:text-sm">{item[1]}</p><span className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-white/95 text-lg font-black text-[#071426] shadow-sm transition group-hover:translate-x-0.5">›</span><span className="sr-only">{showcase.cta}: {item[0]}</span></Link>})}</div>
        <div className="mt-7 text-center"><button type="button" onClick={()=>setShowLibraryAll(v=>!v)} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#071426]/15 bg-[#f7f3e9] px-6 py-3 text-xs font-black uppercase tracking-[.08em] text-[#071426] transition hover:bg-[#efe7d6] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#d6ad63]/35">{showLibraryAll?showcase.less:showcase.more}<span className="ml-2">{showLibraryAll?'↑':'↓'}</span></button></div>
      </div>
    </section>

'''
if anchor not in s:
    raise SystemExit('choose section marker not found')
s = s.replace(anchor, section + anchor, 1)

p.write_text(s, encoding='utf-8')
print('mini-library showcase applied')

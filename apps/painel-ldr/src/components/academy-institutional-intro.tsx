import { ArrowRight, BookOpen, Globe2, Library, Network, ScrollText, Users } from "lucide-react";
import { useI18n } from "@/lib/i18n";

type L = "pt" | "en" | "fr" | "es";

const COPY = {
  pt: {
    eyebrow: "LDR ACADEMY",
    title: "Conhecimento que conecta. Educação que abre caminhos.",
    lead: "Um ecossistema acadêmico para aprender, compartilhar conhecimento, desenvolver competências e construir novas oportunidades.",
    body: "A LDR Academy reúne educação, comunidade acadêmica e desenvolvimento profissional em um ambiente criado para estudantes, professores, profissionais e instituições.",
    explore: "Explorar a LDR Academy", network: "Conhecer a Rede Acadêmica", login: "Já faz parte da comunidade? Entrar",
    verbs: ["APRENDER", "CONECTAR", "DESENVOLVER", "COMPARTILHAR", "CRIAR OPORTUNIDADES"],
    ecoEyebrow: "NOSSO ECOSSISTEMA", ecoTitle: "Um ecossistema de conhecimento",
    ecoText: "A aprendizagem não acontece apenas dentro de uma sala de aula. Ela também nasce das conexões, da troca de experiências, da investigação, da comunidade e das oportunidades construídas ao longo da trajetória.",
    areas: [
      ["Educação", "Cursos, formações e conteúdos para aprendizagem contínua."],
      ["Biblioteca", "Conhecimento organizado para estudo e desenvolvimento."],
      ["Rede Acadêmica", "Um espaço de conexão entre estudantes, professores, profissionais e instituições."],
      ["Desenvolvimento", "Carreira, competências, empreendedorismo e preparação para novas oportunidades."]
    ],
    community: "COMUNIDADE ACADÊMICA", communityTitle: "Conhecimento também se constrói em comunidade.",
    communityText: "A Rede Acadêmica aproxima estudantes, professores, profissionais e instituições em um ambiente dedicado à troca de conhecimento, experiências e conexões acadêmicas.",
    studies: "Estudos, pesquisa e publicações", studiesText: "Um espaço dedicado à produção, organização e compartilhamento de conhecimento sobre educação, desenvolvimento humano, trajetória acadêmica, carreira e temas relacionados ao ecossistema LDR Academy.",
    fronts: [["Estudos", "Conteúdos e análises voltados à compreensão de desafios acadêmicos, profissionais e sociais."], ["Publicações", "Materiais, artigos, revistas, eBooks e produções desenvolvidas ou disponibilizadas no ecossistema."], ["Projetos", "Iniciativas acadêmicas e educacionais desenvolvidas em colaboração com profissionais, estudantes e instituições."]],
    audiencesTitle: "Uma plataforma construída para diferentes trajetórias.",
    audiences: [["Estudantes", "Aprender, conectar-se e desenvolver sua trajetória."], ["Professores", "Compartilhar conhecimento e ampliar conexões acadêmicas."], ["Profissionais", "Continuar aprendendo e desenvolver novas competências."], ["Instituições", "Criar conexões e ampliar iniciativas de desenvolvimento acadêmico e profissional."]],
    global: "UMA COMUNIDADE SEM FRONTEIRAS", places: "Brasil • Portugal • Europa", languages: "Português • English • Français • Español"
  },
  en: {
    eyebrow: "LDR ACADEMY", title: "Knowledge that connects. Education that opens paths.", lead: "An academic ecosystem to learn, share knowledge, develop skills and build new opportunities.", body: "LDR Academy brings together education, academic community and professional development in an environment for students, educators, professionals and institutions.", explore: "Explore LDR Academy", network: "Discover the Academic Network", login: "Already part of the community? Sign in", verbs: ["LEARN", "CONNECT", "DEVELOP", "SHARE", "CREATE OPPORTUNITIES"], ecoEyebrow: "OUR ECOSYSTEM", ecoTitle: "An ecosystem of knowledge", ecoText: "Learning does not happen only in a classroom. It also grows through connections, exchange, inquiry, community and opportunities built throughout a journey.", areas: [["Education", "Courses, programs and content for continuous learning."], ["Library", "Organized knowledge for study and development."], ["Academic Network", "A space connecting students, educators, professionals and institutions."], ["Development", "Career, skills, entrepreneurship and preparation for new opportunities."]], community: "ACADEMIC COMMUNITY", communityTitle: "Knowledge is also built in community.", communityText: "The Academic Network brings students, educators, professionals and institutions together for knowledge exchange, experiences and academic connections.", studies: "Studies, research and publications", studiesText: "A space dedicated to producing, organizing and sharing knowledge about education, human development, academic journeys, careers and themes connected to the LDR Academy ecosystem.", fronts: [["Studies", "Content and analysis focused on academic, professional and social challenges."], ["Publications", "Materials, articles, magazines, eBooks and works developed or made available in the ecosystem."], ["Projects", "Academic and educational initiatives developed with professionals, students and institutions."]], audiencesTitle: "A platform built for different journeys.", audiences: [["Students", "Learn, connect and develop your journey."], ["Educators", "Share knowledge and expand academic connections."], ["Professionals", "Keep learning and develop new skills."], ["Institutions", "Build connections and expand academic and professional development initiatives."]], global: "A COMMUNITY WITHOUT BORDERS", places: "Brazil • Portugal • Europe", languages: "Português • English • Français • Español"
  },
  fr: {
    eyebrow: "LDR ACADEMY", title: "Le savoir qui relie. L’éducation qui ouvre des voies.", lead: "Un écosystème académique pour apprendre, partager les connaissances, développer des compétences et construire de nouvelles opportunités.", body: "LDR Academy réunit éducation, communauté académique et développement professionnel dans un environnement destiné aux étudiants, enseignants, professionnels et institutions.", explore: "Explorer LDR Academy", network: "Découvrir le Réseau Académique", login: "Déjà membre de la communauté ? Se connecter", verbs: ["APPRENDRE", "CONNECTER", "DÉVELOPPER", "PARTAGER", "CRÉER DES OPPORTUNITÉS"], ecoEyebrow: "NOTRE ÉCOSYSTÈME", ecoTitle: "Un écosystème de connaissances", ecoText: "L’apprentissage ne se limite pas à la salle de classe. Il naît aussi des connexions, des échanges, de la recherche, de la communauté et des opportunités construites tout au long du parcours.", areas: [["Éducation", "Cours, formations et contenus pour l’apprentissage continu."], ["Bibliothèque", "Des connaissances organisées pour l’étude et le développement."], ["Réseau Académique", "Un espace reliant étudiants, enseignants, professionnels et institutions."], ["Développement", "Carrière, compétences, entrepreneuriat et préparation aux nouvelles opportunités."]], community: "COMMUNAUTÉ ACADÉMIQUE", communityTitle: "Le savoir se construit aussi en communauté.", communityText: "Le Réseau Académique rapproche étudiants, enseignants, professionnels et institutions autour du partage des connaissances, des expériences et des connexions académiques.", studies: "Études, recherche et publications", studiesText: "Un espace consacré à la production, l’organisation et au partage des connaissances sur l’éducation, le développement humain, les parcours académiques, la carrière et les thèmes liés à l’écosystème LDR Academy.", fronts: [["Études", "Contenus et analyses consacrés aux enjeux académiques, professionnels et sociaux."], ["Publications", "Ressources, articles, revues, eBooks et productions développées ou proposées dans l’écosystème."], ["Projets", "Initiatives académiques et éducatives développées avec des professionnels, étudiants et institutions."]], audiencesTitle: "Une plateforme pensée pour différents parcours.", audiences: [["Étudiants", "Apprendre, se connecter et développer son parcours."], ["Enseignants", "Partager les connaissances et élargir les connexions académiques."], ["Professionnels", "Continuer à apprendre et développer de nouvelles compétences."], ["Institutions", "Créer des connexions et développer des initiatives académiques et professionnelles."]], global: "UNE COMMUNAUTÉ SANS FRONTIÈRES", places: "Brésil • Portugal • Europe", languages: "Português • English • Français • Español"
  },
  es: {
    eyebrow: "LDR ACADEMY", title: "Conocimiento que conecta. Educación que abre caminos.", lead: "Un ecosistema académico para aprender, compartir conocimiento, desarrollar competencias y construir nuevas oportunidades.", body: "LDR Academy reúne educación, comunidad académica y desarrollo profesional en un entorno creado para estudiantes, docentes, profesionales e instituciones.", explore: "Explorar LDR Academy", network: "Conocer la Red Académica", login: "¿Ya formas parte de la comunidad? Entrar", verbs: ["APRENDER", "CONECTAR", "DESARROLLAR", "COMPARTIR", "CREAR OPORTUNIDADES"], ecoEyebrow: "NUESTRO ECOSISTEMA", ecoTitle: "Un ecosistema de conocimiento", ecoText: "El aprendizaje no sucede únicamente dentro de un aula. También nace de las conexiones, el intercambio, la investigación, la comunidad y las oportunidades construidas a lo largo de la trayectoria.", areas: [["Educación", "Cursos, formaciones y contenidos para el aprendizaje continuo."], ["Biblioteca", "Conocimiento organizado para el estudio y el desarrollo."], ["Red Académica", "Un espacio de conexión entre estudiantes, docentes, profesionales e instituciones."], ["Desarrollo", "Carrera, competencias, emprendimiento y preparación para nuevas oportunidades."]], community: "COMUNIDAD ACADÉMICA", communityTitle: "El conocimiento también se construye en comunidad.", communityText: "La Red Académica acerca a estudiantes, docentes, profesionales e instituciones en un entorno dedicado al intercambio de conocimiento, experiencias y conexiones académicas.", studies: "Estudios, investigación y publicaciones", studiesText: "Un espacio dedicado a producir, organizar y compartir conocimiento sobre educación, desarrollo humano, trayectoria académica, carrera y temas relacionados con el ecosistema LDR Academy.", fronts: [["Estudios", "Contenidos y análisis sobre desafíos académicos, profesionales y sociales."], ["Publicaciones", "Materiales, artículos, revistas, eBooks y producciones desarrolladas o disponibles en el ecosistema."], ["Proyectos", "Iniciativas académicas y educativas desarrolladas con profesionales, estudiantes e instituciones."]], audiencesTitle: "Una plataforma construida para diferentes trayectorias.", audiences: [["Estudiantes", "Aprender, conectarse y desarrollar su trayectoria."], ["Docentes", "Compartir conocimiento y ampliar conexiones académicas."], ["Profesionales", "Seguir aprendiendo y desarrollar nuevas competencias."], ["Instituciones", "Crear conexiones y ampliar iniciativas de desarrollo académico y profesional."]], global: "UNA COMUNIDAD SIN FRONTERAS", places: "Brasil • Portugal • Europa", languages: "Português • English • Français • Español"
  }
} as const;

const AREA_ICONS = [BookOpen, Library, Network, Users] as const;
const FRONT_ICONS = [ScrollText, BookOpen, Network] as const;

export function AcademyInstitutionalIntro() {
  const { locale: raw } = useI18n();
  const locale = (raw === "en" || raw === "fr" || raw === "es" ? raw : "pt") as L;
  const t = COPY[locale];
  return <main className="bg-[#f7f3e9] text-[#071426]">
    <section className="border-b border-[#d8ccb4] bg-[#071426] text-white" aria-labelledby="academy-hero-title">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 md:py-24 lg:grid-cols-[1.25fr_.75fr] lg:px-10 lg:py-28">
        <div>
          <p className="text-xs font-black tracking-[.24em] text-[#d6b66f]">{t.eyebrow}</p>
          <h1 id="academy-hero-title" className="mt-5 max-w-4xl font-serif text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">{t.title}</h1>
          <p className="mt-7 max-w-3xl text-lg font-semibold leading-8 text-[#f3ead7] md:text-xl">{t.lead}</p>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">{t.body}</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a href="#explorar" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-sm bg-[#d6b66f] px-6 py-3 text-sm font-black text-[#071426] outline-none transition hover:bg-[#e3c985] focus-visible:ring-2 focus-visible:ring-white">{t.explore}<ArrowRight size={17}/></a>
            <a href="/cliente/rede-academica" className="inline-flex min-h-12 items-center justify-center rounded-sm border border-white/40 px-6 py-3 text-sm font-bold text-white outline-none transition hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white">{t.network}</a>
          </div>
          <a href="/cliente/login" className="mt-5 inline-block text-sm text-slate-300 underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">{t.login}</a>
        </div>
        <aside className="self-end border-l border-[#d6b66f]/45 pl-7" aria-label={t.ecoEyebrow}>
          <Globe2 className="text-[#d6b66f]" size={28}/>
          <p className="mt-6 text-xs font-black tracking-[.2em] text-[#d6b66f]">{t.global}</p>
          <p className="mt-3 font-serif text-2xl">{t.places}</p>
          <p className="mt-3 text-sm leading-6 text-slate-300">{t.languages}</p>
        </aside>
      </div>
    </section>

    <nav aria-label={t.ecoEyebrow} className="border-b border-[#d8ccb4] bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-2 px-5 sm:px-8 md:grid-cols-5 lg:px-10">{t.verbs.map((v,i)=><span key={v} className={`flex min-h-16 items-center justify-center px-3 text-center text-[10px] font-black tracking-[.14em] text-[#31445b] ${i<4?"md:border-r md:border-[#e6dece]":""}`}>{v}</span>)}</div>
    </nav>

    <section id="explorar" className="mx-auto max-w-7xl scroll-mt-20 px-5 py-16 sm:px-8 md:py-24 lg:px-10" aria-labelledby="ecosystem-title">
      <p className="text-xs font-black tracking-[.2em] text-[#8a682b]">{t.ecoEyebrow}</p>
      <div className="mt-4 grid gap-8 lg:grid-cols-2 lg:gap-16"><h2 id="ecosystem-title" className="font-serif text-3xl leading-tight md:text-5xl">{t.ecoTitle}</h2><p className="text-base leading-8 text-slate-600">{t.ecoText}</p></div>
      <div className="mt-12 grid border-y border-[#d8ccb4] md:grid-cols-2 lg:grid-cols-4">{t.areas.map(([name,desc],i)=>{const Icon=AREA_ICONS[i] ?? BookOpen; return <article key={name} className="border-b border-[#d8ccb4] py-7 md:px-6 md:odd:border-r lg:border-b-0 lg:border-r lg:first:pl-0 lg:last:border-r-0"><Icon size={22} className="text-[#8a682b]"/><h3 className="mt-5 font-serif text-xl">{name}</h3><p className="mt-3 text-sm leading-6 text-slate-600">{desc}</p></article>})}</div>
    </section>

    <section className="bg-white" aria-labelledby="community-title"><div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 md:py-20 lg:grid-cols-[.8fr_1.2fr] lg:px-10"><div><p className="text-xs font-black tracking-[.2em] text-[#8a682b]">{t.community}</p><Network className="mt-8 text-[#071426]" size={38}/></div><div><h2 id="community-title" className="font-serif text-3xl leading-tight md:text-4xl">{t.communityTitle}</h2><p className="mt-5 max-w-2xl leading-7 text-slate-600">{t.communityText}</p><a href="/cliente/rede-academica" className="mt-7 inline-flex min-h-11 items-center gap-2 border-b-2 border-[#8a682b] py-2 text-sm font-black">{t.network}<ArrowRight size={16}/></a></div></div></section>

    <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 md:py-24 lg:px-10" aria-labelledby="studies-title"><div className="grid gap-8 lg:grid-cols-2 lg:gap-16"><h2 id="studies-title" className="font-serif text-3xl md:text-4xl">{t.studies}</h2><p className="leading-7 text-slate-600">{t.studiesText}</p></div><div className="mt-10 grid gap-px bg-[#d8ccb4] border border-[#d8ccb4] md:grid-cols-3">{t.fronts.map(([name,desc],i)=>{const Icon=FRONT_ICONS[i] ?? ScrollText;return <article key={name} className="bg-[#f7f3e9] p-7"><Icon size={21} className="text-[#8a682b]"/><h3 className="mt-5 font-serif text-xl">{name}</h3><p className="mt-3 text-sm leading-6 text-slate-600">{desc}</p></article>})}</div></section>

    <section className="border-y border-[#d8ccb4] bg-[#eee7d8]" aria-labelledby="audiences-title"><div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10"><h2 id="audiences-title" className="max-w-3xl font-serif text-3xl md:text-4xl">{t.audiencesTitle}</h2><div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{t.audiences.map(([name,desc])=><article key={name}><h3 className="text-xs font-black uppercase tracking-[.14em] text-[#8a682b]">{name}</h3><p className="mt-3 text-sm leading-6 text-[#31445b]">{desc}</p></article>)}</div></div></section>
  </main>;
}

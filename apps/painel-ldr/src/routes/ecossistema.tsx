import { Link, createFileRoute } from "@tanstack/react-router";
import { PressMention } from "../components/press/PressMention";
import { LanguageSelect, useI18n } from "../lib/i18n";

type Hub = {
  name: string;
  url: string;
  tag: string;
  desc: string;
  featured?: "academy" | "pass" | "network" | "career";
  cta?: string;
};

export const Route = createFileRoute("/ecossistema")({
  head: () => ({
    meta: [
      { title: "Mapa do Ecossistema LDR" },
      { name: "description", content: "Mapa público do ecossistema LDR: Academy, LDR PASS, Biblioteca, cursos gratuitos, Rede Acadêmica, LDR Carreira, divulgação gratuita de vagas, Clínica Social, LDR RH & Estratégia e Human Room." },
    ],
  }),
  component: EcosystemMap,
});

const HUB_COPY = {
  pt: [
  {
    name: "LDR Academy",
    url: "https://ldracademy.online/",
    tag: "Entrada principal",
    featured: "academy",
    desc: "A entrada central do ecossistema LDR para cursos, formações, biblioteca digital, conteúdos gratuitos, desenvolvimento profissional e acesso às principais soluções educacionais.",
  },
  {
    name: "LDR PASS",
    url: "/ldr-pass",
    tag: "Assinatura digital",
    featured: "pass",
    desc: "Assinatura digital do ecossistema para acessar conteúdos elegíveis, trilhas, eBooks e formações online selecionadas, preservando compras antigas e assinaturas separadas.",
    cta: "Conhecer o LDR PASS",
  },
  {
    name: "Biblioteca LDR",
    url: "/cliente/biblioteca",
    tag: "Conteúdos e assinatura",
    desc: "Biblioteca digital com cursos, eBooks, publicações, materiais gratuitos, formações e conteúdos para estudo contínuo.",
    cta: "Acessar Biblioteca",
  },
  {
    name: "Cursos Gratuitos",
    url: "/cliente/biblioteca/cursos-gratuitos",
    tag: "Acesso livre",
    desc: "Cursos gratuitos para entrada no ecossistema, incluindo idiomas, carreira, primeiros socorros e conteúdos introdutórios.",
    cta: "Ver Cursos Gratuitos",
  },
  {
    name: "Recrutamento & Seleção",
    url: "/falar-com-ecossistema?assunto=Empreendedorismo%2C%20neg%C3%B3cios%20e%20novas%20oportunidades&source=recrutamento_escala",
    tag: "Para empresas",
    featured: "career",
    desc: "Divulgue vagas, acesse talentos e conte com soluções para recrutamento. Projetos de contratação em grande volume são personalizados e não estão incluídos nas assinaturas, recebendo proposta separada conforme volume, perfil das vagas e escopo do processo.",
    cta: "Falar com o Comercial",
  },
  {
    name: "Rede Acadêmica LDR",
    url: "/cliente/rede-academica",
    tag: "Comunidade acadêmica",
    featured: "network",
    desc: "Comunidade acadêmica para estudantes, professores, profissionais e instituições compartilharem conhecimento, publicações, experiências, comentários, conexões e oportunidades.",
  },
  {
    name: "LDR Carreira",
    url: "/carreira",
    tag: "Vagas e desenvolvimento",
    featured: "career",
    desc: "Área de carreira para conectar talentos, empresas e oportunidades. Inclui orientação profissional, desenvolvimento de carreira e conexão com o mercado de trabalho.",
  },
  {
    name: "Divulgação de Vaga Gratuita",
    url: "/carreira?audience=company",
    tag: "Para empresas",
    featured: "career",
    desc: "Empresas podem divulgar vagas gratuitamente e ampliar o alcance para talentos conectados ao ecossistema LDR.",
  },
  {
    name: "Clínica Social LDR",
    url: "https://ldracademy.online/clinica-social",
    tag: "Cuidado social",
    desc: "Projeto social do ecossistema LDR para ampliar acesso a cuidado, acolhimento e encaminhamento, preservando confidencialidade e responsabilidade profissional.",
  },
  {
    name: "LDR RH & Estratégia",
    url: "https://ldrrhestrategia.com/",
    tag: "Institucional",
    desc: "Portal institucional da LDR com soluções para empresas, saúde mental e bem-estar corporativo, carreira, projetos educacionais, mentoria, RH e desenvolvimento humano.",
  },
  {
    name: "Human Room",
    url: "https://www.humanroom.online/",
    tag: "Projeto público",
    desc: "Espaço global de escuta, humanidade, reflexão e histórias reais, conectado ao propósito social e humano do ecossistema LDR.",
  },
  {
    name: "Instagram LDR Academy",
    url: "https://www.instagram.com/ldracademy.online",
    tag: "Social",
    desc: "Canal oficial da LDR Academy no Instagram para acompanhar conteúdos, novidades e conexões do ecossistema.",
  },
  {
    name: "Instagram Human Room",
    url: "https://www.instagram.com/humanroom.world",
    tag: "Social",
    desc: "Canal social do Human Room para conteúdos, reflexões e comunicação pública do projeto.",
  },
] as Hub[],
  en: [
    { name:"LDR Academy", url:"https://ldracademy.online/", tag:"Main entry", featured:"academy", desc:"The central entry point to the LDR ecosystem for courses, professional programs, the digital library, free content and educational solutions." },
    { name:"LDR PASS", url:"/ldr-pass", tag:"Digital subscription", featured:"pass", desc:"The ecosystem subscription for eligible content, learning paths, eBooks and selected online programs.", cta:"Discover LDR PASS" },
    { name:"LDR Library", url:"/cliente/biblioteca", tag:"Content and subscription", desc:"Digital library with courses, eBooks, publications, free materials and programs for continuous learning.", cta:"Open Library" },
    { name:"Free Courses", url:"/cliente/biblioteca/cursos-gratuitos", tag:"Free access", desc:"Free courses including languages, career, first aid and introductory content.", cta:"View Free Courses" },
    { name:"Recruitment & Selection", url:"/falar-com-ecossistema?assunto=Empreendedorismo%2C%20neg%C3%B3cios%20e%20novas%20oportunidades&source=recrutamento_escala", tag:"For companies", featured:"career", desc:"Post jobs, reach talent and access recruitment solutions. High-volume hiring projects receive a separate proposal.", cta:"Talk to Sales" },
    { name:"LDR Academic Network", url:"/cliente/rede-academica", tag:"Academic community", featured:"network", desc:"A community for students, teachers, professionals and institutions to share knowledge, experiences and opportunities." },
    { name:"LDR Career", url:"/carreira", tag:"Jobs and development", featured:"career", desc:"Career area connecting talent, companies and opportunities, with professional development and labor-market connections." },
    { name:"Free Job Posting", url:"/carreira?audience=company", tag:"For companies", featured:"career", desc:"Companies can post jobs free of charge and reach talent connected to the LDR ecosystem." },
    { name:"LDR Social Clinic", url:"https://ldracademy.online/clinica-social", tag:"Social care", desc:"A social initiative designed to broaden access to care, support and appropriate referrals while preserving confidentiality." },
    { name:"LDR RH & Estratégia", url:"https://ldrrhestrategia.com/", tag:"Institutional", desc:"Institutional portal with solutions for companies, mental health and workplace well-being, career, education, mentoring and human development." },
    { name:"Human Room", url:"https://www.humanroom.online/", tag:"Public project", desc:"A global space for listening, humanity, reflection and real stories." },
    { name:"Instagram LDR Academy", url:"https://www.instagram.com/ldracademy.online", tag:"Social", desc:"Official LDR Academy Instagram channel for content and ecosystem updates." },
    { name:"Instagram Human Room", url:"https://www.instagram.com/humanroom.world", tag:"Social", desc:"Human Room social channel for public communication and reflections." }
  ] as Hub[],
  fr: [
    { name:"LDR Academy", url:"https://ldracademy.online/", tag:"Entrée principale", featured:"academy", desc:"L’entrée centrale de l’écosystème LDR pour les cours, formations, bibliothèque numérique, contenus gratuits et solutions éducatives." },
    { name:"LDR PASS", url:"/ldr-pass", tag:"Abonnement numérique", featured:"pass", desc:"L’abonnement de l’écosystème pour les contenus éligibles, parcours, eBooks et formations en ligne sélectionnées.", cta:"Découvrir LDR PASS" },
    { name:"Bibliothèque LDR", url:"/cliente/biblioteca", tag:"Contenus et abonnement", desc:"Bibliothèque numérique avec cours, eBooks, publications, ressources gratuites et formations.", cta:"Accéder à la bibliothèque" },
    { name:"Cours gratuits", url:"/cliente/biblioteca/cursos-gratuitos", tag:"Accès libre", desc:"Cours gratuits comprenant langues, carrière, premiers secours et contenus d’introduction.", cta:"Voir les cours gratuits" },
    { name:"Recrutement & Sélection", url:"/falar-com-ecossistema?assunto=Empreendedorismo%2C%20neg%C3%B3cios%20e%20novas%20oportunidades&source=recrutamento_escala", tag:"Pour les entreprises", featured:"career", desc:"Publiez des offres, accédez aux talents et bénéficiez de solutions de recrutement. Les projets à grand volume font l’objet d’une proposition séparée.", cta:"Parler au service commercial" },
    { name:"Réseau Académique LDR", url:"/cliente/rede-academica", tag:"Communauté académique", featured:"network", desc:"Une communauté pour partager connaissances, expériences, publications, connexions et opportunités." },
    { name:"LDR Carrière", url:"/carreira", tag:"Emplois et développement", featured:"career", desc:"Espace carrière reliant talents, entreprises et opportunités, avec développement professionnel et connexion au marché du travail." },
    { name:"Publication gratuite d’offres", url:"/carreira?audience=company", tag:"Pour les entreprises", featured:"career", desc:"Les entreprises peuvent publier gratuitement leurs offres et toucher les talents de l’écosystème LDR." },
    { name:"Clinique Sociale LDR", url:"https://ldracademy.online/clinica-social", tag:"Accompagnement social", desc:"Initiative sociale visant à élargir l’accès à l’accompagnement et à l’orientation, dans le respect de la confidentialité." },
    { name:"LDR RH & Estratégia", url:"https://ldrrhestrategia.com/", tag:"Institutionnel", desc:"Portail institutionnel proposant des solutions pour les entreprises, le bien-être, la carrière, l’éducation, le mentorat et le développement humain." },
    { name:"Human Room", url:"https://www.humanroom.online/", tag:"Projet public", desc:"Un espace mondial d’écoute, d’humanité, de réflexion et d’histoires réelles." },
    { name:"Instagram LDR Academy", url:"https://www.instagram.com/ldracademy.online", tag:"Social", desc:"Canal Instagram officiel de LDR Academy." },
    { name:"Instagram Human Room", url:"https://www.instagram.com/humanroom.world", tag:"Social", desc:"Canal social de Human Room pour la communication publique." }
  ] as Hub[],
  es: [
    { name:"LDR Academy", url:"https://ldracademy.online/", tag:"Entrada principal", featured:"academy", desc:"La entrada central del ecosistema LDR para cursos, formaciones, biblioteca digital, contenidos gratuitos y soluciones educativas." },
    { name:"LDR PASS", url:"/ldr-pass", tag:"Suscripción digital", featured:"pass", desc:"La suscripción del ecosistema para contenidos elegibles, rutas, eBooks y formaciones online seleccionadas.", cta:"Conocer LDR PASS" },
    { name:"Biblioteca LDR", url:"/cliente/biblioteca", tag:"Contenidos y suscripción", desc:"Biblioteca digital con cursos, eBooks, publicaciones, materiales gratuitos y formaciones.", cta:"Acceder a la Biblioteca" },
    { name:"Cursos gratuitos", url:"/cliente/biblioteca/cursos-gratuitos", tag:"Acceso libre", desc:"Cursos gratuitos de idiomas, carrera, primeros auxilios y contenidos introductorios.", cta:"Ver cursos gratuitos" },
    { name:"Reclutamiento y Selección", url:"/falar-com-ecossistema?assunto=Empreendedorismo%2C%20neg%C3%B3cios%20e%20novas%20oportunidades&source=recrutamento_escala", tag:"Para empresas", featured:"career", desc:"Publica vacantes, accede a talento y cuenta con soluciones de reclutamiento. Los proyectos de gran volumen reciben una propuesta separada.", cta:"Hablar con Ventas" },
    { name:"Red Académica LDR", url:"/cliente/rede-academica", tag:"Comunidad académica", featured:"network", desc:"Comunidad para compartir conocimiento, experiencias, publicaciones, conexiones y oportunidades." },
    { name:"LDR Carrera", url:"/carreira", tag:"Vacantes y desarrollo", featured:"career", desc:"Área de carrera que conecta talento, empresas y oportunidades con desarrollo profesional y conexión al mercado laboral." },
    { name:"Publicación gratuita de vacantes", url:"/carreira?audience=company", tag:"Para empresas", featured:"career", desc:"Las empresas pueden publicar vacantes gratis y llegar a talentos conectados al ecosistema LDR." },
    { name:"Clínica Social LDR", url:"https://ldracademy.online/clinica-social", tag:"Atención social", desc:"Iniciativa social para ampliar el acceso a atención, acogida y orientación preservando la confidencialidad." },
    { name:"LDR RH & Estratégia", url:"https://ldrrhestrategia.com/", tag:"Institucional", desc:"Portal institucional con soluciones para empresas, bienestar, carrera, educación, mentoría y desarrollo humano." },
    { name:"Human Room", url:"https://www.humanroom.online/", tag:"Proyecto público", desc:"Un espacio global de escucha, humanidad, reflexión e historias reales." },
    { name:"Instagram LDR Academy", url:"https://www.instagram.com/ldracademy.online", tag:"Social", desc:"Canal oficial de LDR Academy en Instagram." },
    { name:"Instagram Human Room", url:"https://www.instagram.com/humanroom.world", tag:"Social", desc:"Canal social de Human Room para comunicación pública." }
  ] as Hub[]
} as const;

const features = [
  "Cursos e formações online",
  "Biblioteca digital",
  "eBooks e publicações",
  "Cursos gratuitos",
  "Rede Acadêmica",
  "Divulgação gratuita de vagas",
  "Desenvolvimento de carreira",
  "Projetos para empresas",
  "Clínica Social",
  "Human Room",
  "LDR PASS",
];

function external(url: string) {
  return url.startsWith("http");
}

function hubClasses(hub: Hub) {
  if (hub.featured === "network") {
    return {
      card: "group rounded-[26px] border border-[#7c5cff]/35 bg-gradient-to-br from-[#351073] via-[#4b1b91] to-[#6a36c9] p-5 text-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl",
      tag: "inline-flex rounded-full bg-white/15 px-3 py-1 text-[10px] font-black uppercase tracking-[.14em] text-white ring-1 ring-white/25",
      title: "mt-4 font-serif text-2xl font-bold text-white",
      desc: "mt-2 text-sm text-white/90",
      link: "mt-4 break-all text-xs font-bold text-[#f8e28a] group-hover:underline",
    };
  }

  if (hub.featured === "pass") {
    return {
      card: "group rounded-[26px] border border-[#1d3158]/25 bg-[#071426] p-5 text-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl",
      tag: "inline-flex rounded-full bg-[#f4c76b] px-3 py-1 text-[10px] font-black uppercase tracking-[.14em] text-[#1f1303]",
      title: "mt-4 font-serif text-2xl font-bold text-white",
      desc: "mt-2 text-sm text-white/80",
      link: "mt-4 break-all text-xs font-bold text-[#f4c76b] group-hover:underline",
    };
  }

  if (hub.featured === "career") {
    return {
      card: "group rounded-[26px] border border-[#b7d2ff] bg-[#eef5ff] p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl",
      tag: "inline-flex rounded-full bg-[#1d3158] px-3 py-1 text-[10px] font-black uppercase tracking-[.14em] text-white",
      title: "mt-4 font-serif text-2xl font-bold text-[#071426]",
      desc: "mt-2 text-sm text-[#42526b]",
      link: "mt-4 break-all text-xs font-bold text-[#1d3158] group-hover:underline",
    };
  }

  return {
    card: "group rounded-[26px] border border-[#e5d1ac] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl",
    tag: "inline-flex rounded-full bg-[#f2e3c3] px-3 py-1 text-[10px] font-black uppercase tracking-[.14em] text-[#7a4d14]",
    title: "mt-4 font-serif text-2xl font-bold text-[#25170f]",
    desc: "mt-2 text-sm text-[#6f6358]",
    link: "mt-4 break-all text-xs font-bold text-[#1d3158] group-hover:underline",
  };
}

const ECOSYSTEM_COPY = {
  pt: { back:"← Voltar para LDR Academy", welcome:"Bem-vindo ao Ecossistema LDR", hello:"Olá! Tudo bem? 👋", home:"Entra, fica à vontade. Você é de casa.", intro:"Aqui você pode aprender, encontrar oportunidades, conhecer pessoas, compartilhar ideias e criar coisas novas. Não sabe por onde começar? Tudo bem. Conta pra gente o que você procura e vamos encontrar um caminho juntos.", invite:"Tem uma ideia? Conta pra gente. Quer participar? Vem com a gente. Gostou daqui? Chama seus amigos também. Vamos criar juntos.", talk:"💬 Vamos conversar", explore:"Quero explorar", library:"Entrar na Biblioteca", network:"Conhecer a Rede Acadêmica", freeJob:"Divulgar vaga gratuita", opportunities:"Oportunidades", opportunityTitle:"Empresas e candidatos conectados em uma única jornada.", international:"Na imprensa internacional", pressTitle:"O Ecossistema LDR em cobertura editorial internacional.", press:"Imprensa & Mídia", find:"O que você encontra no ecossistema", tickerLabel:"AGORA", antiRacism:"LDR Essence — Um ecossistema comprometido com o combate ao racismo e a todas as formas de discriminação, no Brasil e no mundo. Respeito, dignidade e igualdade para todas as pessoas.", newsSoon:"Brasil e mundo · empreendedorismo · economia · tecnologia · política — notícias com fonte identificada", opportunityText:"O Ecossistema LDR conecta quem oferece oportunidades a quem está procurando trabalho. A publicação básica de vagas é gratuita e candidatos podem consultar oportunidades sem precisar assinar.", company:"Sou empresa", companyText:"Divulgue sua vaga gratuitamente e conecte sua empresa a profissionais do Ecossistema LDR.", candidate:"Sou candidato", candidateText:"Encontre vagas e use o Ecossistema para desenvolver sua preparação profissional.", findJobs:"Encontrar vagas", careerNoteLabel:"LDR Academy + Carreira:", careerNote:"assinantes podem acessar recursos adicionais de desenvolvimento profissional conforme o plano contratado. A assinatura não garante contratação e não é necessária para consultar vagas abertas.", businessEyebrow:"Empreendedorismo e negócios", businessTitle:"Quer conversar sobre empreendedorismo ou negócios?", businessText1:"O Ecossistema LDR também é um espaço para novas ideias, conexões e oportunidades. Estamos desenvolvendo novos projetos e algumas iniciativas ainda não foram apresentadas publicamente.", businessText2:"Se você é empreendedor, empresa, profissional, investidor ou simplesmente tem uma boa ideia, fale comigo pelo suporte. Talvez exista uma conversa que valha a pena começar.", businessCta:"Quero conversar sobre negócios", newsBrazil:"Brasil: economistas consultados pelo Banco Central reduziram a projeção da Selic no fim de 2026 para 13,50%.", newsEntrepreneur:"Empreendedorismo: Mombak capta novo fundo para reflorestamento da Amazônia e adiciona Salesforce como compradora de créditos de carbono.", newsWorld:"Mundo e tecnologia: ações globais avançam com renovado otimismo em inteligência artificial e recuo do petróleo.", postFree:"Divulgar vaga gratuita" },
  en: { back:"← Back to LDR Academy", welcome:"Welcome to the LDR Ecosystem", hello:"Hello! How are you? 👋", home:"Come in and make yourself at home.", intro:"Here you can learn, find opportunities, meet people, share ideas and create new things. Not sure where to start? Tell us what you are looking for and we will find a path together.", invite:"Have an idea? Tell us. Want to take part? Join us. Like it here? Invite your friends too. Let's create together.", talk:"💬 Let's talk", explore:"Explore", library:"Enter the Library", network:"Discover the Academic Network", freeJob:"Post a job for free", opportunities:"Opportunities", opportunityTitle:"Companies and candidates connected in one journey.", international:"International media coverage", pressTitle:"The LDR Ecosystem in international editorial coverage.", press:"Press & Media", find:"What you can find in the ecosystem", tickerLabel:"NOW", antiRacism:"LDR Essence — An ecosystem committed to combating racism and all forms of discrimination, in Brazil and around the world. Respect, dignity and equality for everyone.", newsSoon:"Brazil and world · entrepreneurship · economy · technology · politics — news with identified sources", opportunityText:"The LDR Ecosystem connects organizations offering opportunities with people looking for work. Basic job posting is free, and candidates can browse opportunities without a subscription.", company:"I am a company", companyText:"Post your vacancy for free and connect your company with professionals in the LDR Ecosystem.", candidate:"I am a candidate", candidateText:"Find vacancies and use the Ecosystem to strengthen your professional preparation.", findJobs:"Find jobs", careerNoteLabel:"LDR Academy + Career:", careerNote:"subscribers may access additional professional-development resources according to their plan. A subscription does not guarantee employment and is not required to browse open positions.", businessEyebrow:"Entrepreneurship and business", businessTitle:"Want to talk about entrepreneurship or business?", businessText1:"The LDR Ecosystem is also a space for new ideas, connections and opportunities. We are developing new projects, and some initiatives have not yet been presented publicly.", businessText2:"If you are an entrepreneur, company, professional, investor or simply have a good idea, contact us through support. There may be a conversation worth starting.", businessCta:"Talk about business", newsBrazil:"Brazil: economists surveyed by the Central Bank lowered their end-2026 Selic forecast to 13.50%.", newsEntrepreneur:"Entrepreneurship: Mombak raises a new Amazon reforestation fund and adds Salesforce as a carbon-credit buyer.", newsWorld:"World and technology: global stocks advance on renewed AI optimism as oil prices retreat.", postFree:"Post a job for free" },
  fr: { back:"← Retour à LDR Academy", welcome:"Bienvenue dans l'écosystème LDR", hello:"Bonjour ! Comment allez-vous ? 👋", home:"Entrez, faites comme chez vous.", intro:"Ici, vous pouvez apprendre, trouver des opportunités, rencontrer des personnes, partager des idées et créer de nouvelles choses. Vous ne savez pas par où commencer ? Dites-nous ce que vous recherchez et nous trouverons un chemin ensemble.", invite:"Vous avez une idée ? Parlez-nous-en. Vous souhaitez participer ? Rejoignez-nous. Vous aimez cet espace ? Invitez aussi vos amis. Créons ensemble.", talk:"💬 Parlons-en", explore:"Explorer", library:"Accéder à la bibliothèque", network:"Découvrir le Réseau Académique", freeJob:"Publier une offre gratuitement", opportunities:"Opportunités", opportunityTitle:"Entreprises et candidats réunis dans un même parcours.", international:"Dans la presse internationale", pressTitle:"L'écosystème LDR dans la couverture éditoriale internationale.", press:"Presse & Médias", find:"Ce que vous trouverez dans l'écosystème", tickerLabel:"EN DIRECT", antiRacism:"LDR Essence — Un écosystème engagé dans la lutte contre le racisme et toutes les formes de discrimination, au Brésil et dans le monde. Respect, dignité et égalité pour toutes et tous.", newsSoon:"Brésil et monde · entrepreneuriat · économie · technologie · politique — actualités avec sources identifiées", opportunityText:"L’écosystème LDR met en relation les organisations qui proposent des opportunités et les personnes à la recherche d’un emploi. La publication de base des offres est gratuite et les candidats peuvent consulter les opportunités sans abonnement.", company:"Je suis une entreprise", companyText:"Publiez gratuitement votre offre et connectez votre entreprise aux professionnels de l’écosystème LDR.", candidate:"Je suis candidat", candidateText:"Trouvez des offres et utilisez l’écosystème pour renforcer votre préparation professionnelle.", findJobs:"Trouver des offres", careerNoteLabel:"LDR Academy + Carrière :", careerNote:"les abonnés peuvent accéder à des ressources supplémentaires de développement professionnel selon leur formule. L’abonnement ne garantit pas l’embauche et n’est pas nécessaire pour consulter les offres ouvertes.", businessEyebrow:"Entrepreneuriat et affaires", businessTitle:"Vous souhaitez parler d’entrepreneuriat ou d’affaires ?", businessText1:"L’écosystème LDR est aussi un espace pour les nouvelles idées, les connexions et les opportunités. Nous développons de nouveaux projets et certaines initiatives n’ont pas encore été présentées publiquement.", businessText2:"Si vous êtes entrepreneur, entreprise, professionnel, investisseur ou si vous avez simplement une bonne idée, contactez-nous via le support. Une conversation intéressante pourrait commencer.", businessCta:"Parler affaires", newsBrazil:"Brésil : les économistes interrogés par la Banque centrale abaissent leur prévision du taux Selic fin 2026 à 13,50 %.", newsEntrepreneur:"Entrepreneuriat : Mombak lève un nouveau fonds de reboisement de l’Amazonie et ajoute Salesforce parmi ses acheteurs de crédits carbone.", newsWorld:"Monde et technologie : les actions mondiales progressent avec le regain d’optimisme autour de l’IA et le recul du pétrole.", postFree:"Publier une offre gratuitement" },
  es: { back:"← Volver a LDR Academy", welcome:"Bienvenido al Ecosistema LDR", hello:"¡Hola! ¿Cómo estás? 👋", home:"Entra, ponte cómodo. Estás en casa.", intro:"Aquí puedes aprender, encontrar oportunidades, conocer personas, compartir ideas y crear cosas nuevas. ¿No sabes por dónde empezar? Cuéntanos qué buscas y encontraremos un camino juntos.", invite:"¿Tienes una idea? Cuéntanos. ¿Quieres participar? Únete. ¿Te gusta este espacio? Invita también a tus amigos. Creemos juntos.", talk:"💬 Hablemos", explore:"Quiero explorar", library:"Entrar en la Biblioteca", network:"Conocer la Red Académica", freeJob:"Publicar una vacante gratis", opportunities:"Oportunidades", opportunityTitle:"Empresas y candidatos conectados en un único recorrido.", international:"En la prensa internacional", pressTitle:"El Ecosistema LDR en la cobertura editorial internacional.", press:"Prensa y Medios", find:"Lo que encontrarás en el ecosistema", tickerLabel:"AHORA", antiRacism:"LDR Essence — Un ecosistema comprometido con la lucha contra el racismo y todas las formas de discriminación, en Brasil y en todo el mundo. Respeto, dignidad e igualdad para todas las personas.", newsSoon:"Brasil y mundo · emprendimiento · economía · tecnología · política — noticias con fuentes identificadas", opportunityText:"El Ecosistema LDR conecta a quienes ofrecen oportunidades con quienes buscan trabajo. La publicación básica de vacantes es gratuita y los candidatos pueden consultar oportunidades sin suscripción.", company:"Soy empresa", companyText:"Publica tu vacante gratuitamente y conecta tu empresa con profesionales del Ecosistema LDR.", candidate:"Soy candidato", candidateText:"Encuentra vacantes y utiliza el Ecosistema para fortalecer tu preparación profesional.", findJobs:"Encontrar vacantes", careerNoteLabel:"LDR Academy + Carrera:", careerNote:"los suscriptores pueden acceder a recursos adicionales de desarrollo profesional según el plan contratado. La suscripción no garantiza contratación y no es necesaria para consultar vacantes abiertas.", businessEyebrow:"Emprendimiento y negocios", businessTitle:"¿Quieres hablar sobre emprendimiento o negocios?", businessText1:"El Ecosistema LDR también es un espacio para nuevas ideas, conexiones y oportunidades. Estamos desarrollando nuevos proyectos y algunas iniciativas aún no se han presentado públicamente.", businessText2:"Si eres emprendedor, empresa, profesional, inversor o simplemente tienes una buena idea, contáctanos a través del soporte. Puede haber una conversación que valga la pena comenzar.", businessCta:"Quiero hablar de negocios", newsBrazil:"Brasil: economistas consultados por el Banco Central reducen su previsión de la tasa Selic para finales de 2026 al 13,50 %.", newsEntrepreneur:"Emprendimiento: Mombak capta un nuevo fondo de reforestación amazónica y suma a Salesforce como comprador de créditos de carbono.", newsWorld:"Mundo y tecnología: las bolsas globales avanzan por el renovado optimismo sobre la IA mientras baja el petróleo.", postFree:"Publicar una vacante gratis" }
} as const;

function EcosystemMap() {
  const { locale } = useI18n();
  const copy = ECOSYSTEM_COPY[locale] ?? ECOSYSTEM_COPY.pt;
  const hubs = HUB_COPY[locale] ?? HUB_COPY.pt;
  return (
    <main className="min-h-screen bg-[#f8f1e7] text-[#25170f]">
      <div className="border-y border-[#d6ad63]/30 bg-[#071426] text-white" aria-label={copy.tickerLabel}>
        <div className="mx-auto flex max-w-6xl items-center overflow-hidden px-5 py-2">
          <span className="mr-4 shrink-0 rounded bg-[#d6ad63] px-2 py-1 text-[10px] font-black tracking-[.16em] text-[#25170f]">{copy.tickerLabel}</span>
          <div className="min-w-0 flex-1 overflow-hidden whitespace-nowrap">
            <div className="inline-block motion-safe:animate-[ldrTicker_34s_linear_infinite] motion-reduce:whitespace-normal text-xs font-semibold tracking-wide">
              <span>{copy.antiRacism}</span><span className="mx-8 text-[#d6ad63]" aria-hidden="true">●</span><a className="hover:underline" href="https://www.reuters.com/world/americas/brazil-economists-cut-end-2026-interest-rate-forecast-1350-2026-09-21/" target="_blank" rel="noreferrer">{copy.newsBrazil} — Reuters</a><span className="mx-8 text-[#d6ad63]" aria-hidden="true">●</span><a className="hover:underline" href="https://www.reuters.com/sustainability/climate-energy/brazils-mombak-raises-new-fund-adds-salesforce-carbon-credit-buyer-2026-09-21/" target="_blank" rel="noreferrer">{copy.newsEntrepreneur} — Reuters</a><span className="mx-8 text-[#d6ad63]" aria-hidden="true">●</span><a className="hover:underline" href="https://www.reuters.com/world/china/global-markets-global-markets-2026-09-21/" target="_blank" rel="noreferrer">{copy.newsWorld} — Reuters</a>
            </div>
          </div>
        </div>
        <style>{`@keyframes ldrTicker{from{transform:translateX(100%)}to{transform:translateX(-100%)}}`}</style>
      </div>
      <section className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
        <div className="mb-4 ml-auto w-36"><LanguageSelect /></div>
        <Link to="/" className="text-sm font-bold text-[#8a4c18]">{copy.back}</Link>
        <div className="mt-7 rounded-[34px] border border-[#d6ad63]/40 bg-white p-6 shadow-xl sm:p-9">
          <p className="text-xs font-black uppercase tracking-[.2em] text-[#9a6a20]">{copy.welcome}</p>
          <h1 className="mt-3 font-serif text-4xl font-bold sm:text-5xl">{copy.hello}</h1>
          <p className="mt-3 text-xl font-bold text-[#8a4c18]">{copy.home}</p>
          <p className="mt-4 max-w-3xl text-base leading-7 text-[#6f6358]">
            {copy.intro}
          </p>
          <p className="mt-3 max-w-3xl text-sm text-[#6f6358]">{copy.invite}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link to="/falar-com-ecossistema" className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#9a6a20] px-5 py-3 text-sm font-black uppercase tracking-[.12em] text-white">{copy.talk}</Link>
            <Link to="/ldr-pass" className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#1d3158] px-5 py-3 text-sm font-black uppercase tracking-[.12em] text-white">{copy.explore}</Link>
            <Link to="/cliente/biblioteca" className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#d6ad63] px-5 py-3 text-sm font-black uppercase tracking-[.12em] text-[#7a4d14]">{copy.library}</Link>
            <Link to="/cliente/rede-academica" className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#351073] px-5 py-3 text-sm font-black uppercase tracking-[.12em] text-[#351073]">{copy.network}</Link>
            <a href="/carreira?audience=company" className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#1d3158] px-5 py-3 text-sm font-black uppercase tracking-[.12em] text-[#1d3158]">{copy.freeJob}</a>
          </div>
        </div>

        <section className="mt-8 rounded-[28px] border border-[#b7d2ff] bg-[#eef5ff] p-6 shadow-sm sm:p-8">
          <p className="text-xs font-black uppercase tracking-[.2em] text-[#1d3158]">{copy.opportunities}</p>
          <h2 className="mt-3 font-serif text-3xl font-bold text-[#071426]">{copy.opportunityTitle}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[#42526b]">{copy.opportunityText}</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <a href="/carreira/empresa/publicar" className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-[#b7d2ff] transition hover:-translate-y-0.5">
              <span className="text-2xl" aria-hidden="true">🏢</span><h3 className="mt-2 text-lg font-black text-[#07345b]">{copy.company}</h3><p className="mt-2 text-sm text-[#42526b]">{copy.companyText}</p><span className="mt-4 inline-flex min-h-12 items-center rounded-full bg-[#07345b] px-5 py-3 text-sm font-black text-white">{copy.postFree}</span>
            </a>
            <a href="/carreira/vagas" className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-[#b7d2ff] transition hover:-translate-y-0.5">
              <span className="text-2xl" aria-hidden="true">👤</span><h3 className="mt-2 text-lg font-black text-[#07345b]">{copy.candidate}</h3><p className="mt-2 text-sm text-[#42526b]">{copy.candidateText}</p><span className="mt-4 inline-flex min-h-12 items-center rounded-full bg-[#07345b] px-5 py-3 text-sm font-black text-white">{copy.findJobs}</span>
            </a>
          </div>
          <div className="mt-5 rounded-2xl bg-white/80 p-4 text-sm leading-6 text-[#42526b]"><strong className="text-[#07345b]">{copy.careerNoteLabel}</strong> {copy.careerNote}</div>
        </section>

        <section className="mt-8 rounded-[28px] border border-[#d6ad63]/50 bg-[#fffaf2] p-6 shadow-sm sm:p-8">
          <p className="text-xs font-black uppercase tracking-[.2em] text-[#9a6a20]">{copy.businessEyebrow}</p>
          <h2 className="mt-3 font-serif text-3xl font-bold text-[#25170f]">{copy.businessTitle}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[#6f6358]">{copy.businessText1}</p>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[#6f6358]">{copy.businessText2}</p>
          <Link to="/falar-com-ecossistema" search={{ assunto: "Empreendedorismo, negócios e novas oportunidades", source: "ecossistema_negocios" } as any} className="mt-5 inline-flex min-h-12 items-center justify-center rounded-full bg-[#1d3158] px-5 py-3 text-sm font-black text-white">{copy.businessCta}</Link>
        </section>

        <section className="mt-8 rounded-[28px] border border-[#d6ad63]/50 bg-white p-6 shadow-sm sm:p-8"><p className="text-xs font-black uppercase tracking-[.2em] text-[#9a6a20]">{copy.international}</p><h2 className="mt-3 mb-6 font-serif text-3xl font-bold text-[#25170f]">{copy.pressTitle}</h2><PressMention /><Link to="/imprensa" className="mt-5 inline-flex min-h-12 items-center justify-center rounded-full border border-[#1d3158] px-5 py-3 text-sm font-black text-[#1d3158]">{copy.press}</Link></section>

        <section className="mt-8 rounded-[28px] border border-[#e5d1ac] bg-white p-6 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[.2em] text-[#9a6a20]">{copy.find}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature} className="rounded-2xl bg-[#f8f1e7] px-4 py-3 text-sm font-bold text-[#25170f]">
                {feature}
              </div>
            ))}
          </div>
        </section>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {hubs.map((hub) => {
            const styles = hubClasses(hub);
            return (
              <a key={hub.name} href={hub.url} target={external(hub.url) ? "_blank" : undefined} rel={external(hub.url) ? "noreferrer" : undefined} className={styles.card}>
                <span className={styles.tag}>{hub.tag}</span>
                <h2 className={styles.title}>{hub.name}</h2>
                <p className={styles.desc}>{hub.desc}</p>
                <span className={styles.link}>{hub.cta ?? `Conhecer ${hub.name}`} →</span>
              </a>
            );
          })}
        </div>
      </section>
    </main>
  );
}

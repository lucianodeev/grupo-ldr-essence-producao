import { ArrowRight, BookOpen, BriefcaseBusiness, Compass, HeartHandshake, Monitor, Sprout } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";

// This is a directory of the existing catalogue, not a second price list.
// Availability, prices, currency and checkout remain in their current destinations.
const COPY = {
  pt: {
    eyebrow: "SERVIÇOS DO ECOSSISTEMA", title: "Um próximo passo para cada momento.",
    intro: "Para você, sua carreira ou sua empresa. Encontre a área que faz sentido e confira as opções disponíveis.",
    options: "Ver opções", quote: "Solicitar proposta", education: "Conhecer LDR ONE", all: "Ver catálogo de serviços",
    journey: "Nos atendimentos individuais: escolha o serviço, pague e aguarde a confirmação dos créditos. Depois, solicite seu horário na Minha agenda. O atendimento depende de confirmação.",
    homeTitle: "Além de aprender, encontre o apoio para colocar seus planos em prática.",
    homeText: "Atendimento individual, mentoria, carreira e soluções para empresas em um só lugar.", homeCta: "Explorar serviços",
    cards: [
      ["Atendimento individual", "Psicanálise", "Sessão online e pacotes de acompanhamento. Confira as opções e o número de sessões no catálogo."],
      ["Desenvolvimento pessoal", "Mentoria", "Uma sessão ou um percurso de encontros para trabalhar seus objetivos e próximos passos."],
      ["Vida profissional", "Carreira", "Orientação profissional, diagnóstico e transição de carreira para planejar seu caminho."],
      ["Para equipes", "Empresas e bem-estar", "RH, desenvolvimento de equipes, Massagem Laboral e Hora de Bem-Estar, com proposta conforme a necessidade."],
      ["Seu negócio online", "Presença digital", "Sites, landing pages e serviços de marketing para apresentar e desenvolver seu negócio."],
      ["Aprendizado contínuo", "Educação e LDR ONE", "Conheça os cursos, a biblioteca e os conteúdos digitais incluídos em cada plano."],
    ],
  },
  en: {
    eyebrow: "ECOSYSTEM SERVICES", title: "A next step for every stage.",
    intro: "For you, your career or your business. Find the right area and explore the available options.",
    options: "View options", quote: "Request a proposal", education: "Discover LDR ONE", all: "View service catalogue",
    journey: "For individual appointments: choose a service, pay and wait for your credits to be confirmed. Then request a time in My agenda. Appointments require confirmation.",
    homeTitle: "Go beyond learning and find support to put your plans into practice.",
    homeText: "Individual appointments, mentorship, career development and business solutions in one place.", homeCta: "Explore services",
    cards: [
      ["Individual support", "Psychoanalysis", "Online sessions and packages. Check the catalogue for available options and session counts."],
      ["Personal development", "Mentorship", "A single session or a series of meetings to work on your goals and next steps."],
      ["Professional life", "Career", "Career guidance, assessment and transitions to help plan your path."],
      ["For teams", "Business and wellbeing", "HR, team development, Workplace Massage and Wellbeing Hour, with a proposal tailored to your needs."],
      ["Your business online", "Digital presence", "Websites, landing pages and marketing services to present and develop your business."],
      ["Lifelong learning", "Education and LDR ONE", "Explore courses, the library and digital content included in each plan."],
    ],
  },
  fr: {
    eyebrow: "SERVICES DE L’ÉCOSYSTÈME", title: "Une prochaine étape à chaque moment.",
    intro: "Pour vous, votre carrière ou votre entreprise. Trouvez votre domaine et découvrez les options disponibles.",
    options: "Voir les options", quote: "Demander une proposition", education: "Découvrir LDR ONE", all: "Voir le catalogue de services",
    journey: "Pour les rendez-vous individuels : choisissez un service, payez et attendez la confirmation des crédits. Demandez ensuite un créneau dans Mon agenda. Le rendez-vous doit être confirmé.",
    homeTitle: "Au-delà de l’apprentissage, trouvez du soutien pour concrétiser vos projets.",
    homeText: "Rendez-vous individuels, mentorat, carrière et solutions pour les entreprises au même endroit.", homeCta: "Explorer les services",
    cards: [
      ["Accompagnement individuel", "Psychanalyse", "Séances en ligne et forfaits. Consultez les options et le nombre de séances dans le catalogue."],
      ["Développement personnel", "Mentorat", "Une séance ou un parcours de rencontres pour travailler vos objectifs et vos prochaines étapes."],
      ["Vie professionnelle", "Carrière", "Orientation, bilan et transition de carrière pour construire votre parcours."],
      ["Pour les équipes", "Entreprises et bien-être", "RH, développement des équipes, massage en entreprise et Heure de Bien-être, sur proposition adaptée."],
      ["Votre activité en ligne", "Présence numérique", "Sites, pages de présentation et services marketing pour présenter et développer votre activité."],
      ["Apprentissage continu", "Éducation et LDR ONE", "Découvrez les cours, la bibliothèque et les contenus numériques inclus dans chaque offre."],
    ],
  },
  es: {
    eyebrow: "SERVICIOS DEL ECOSISTEMA", title: "Un próximo paso para cada momento.",
    intro: "Para ti, tu carrera o tu empresa. Encuentra el área que necesitas y consulta las opciones disponibles.",
    options: "Ver opciones", quote: "Solicitar propuesta", education: "Conocer LDR ONE", all: "Ver catálogo de servicios",
    journey: "Para las sesiones individuales: elige el servicio, paga y espera la confirmación de los créditos. Después, solicita un horario en Mi agenda. La atención requiere confirmación.",
    homeTitle: "Además de aprender, encuentra apoyo para poner tus planes en práctica.",
    homeText: "Atención individual, mentoría, carrera y soluciones para empresas en un solo lugar.", homeCta: "Explorar servicios",
    cards: [
      ["Atención individual", "Psicoanálisis", "Sesión online y paquetes. Consulta las opciones y el número de sesiones en el catálogo."],
      ["Desarrollo personal", "Mentoría", "Una sesión o un recorrido de encuentros para trabajar tus objetivos y próximos pasos."],
      ["Vida profesional", "Carrera", "Orientación, diagnóstico y transición profesional para planificar tu camino."],
      ["Para equipos", "Empresas y bienestar", "RR. HH., desarrollo de equipos, Masaje Laboral y Hora de Bienestar, con propuesta según la necesidad."],
      ["Tu negocio online", "Presencia digital", "Sitios web, landing pages y servicios de marketing para presentar y desarrollar tu negocio."],
      ["Aprendizaje continuo", "Educación y LDR ONE", "Conoce los cursos, la biblioteca y los contenidos digitales incluidos en cada plan."],
    ],
  },
} as const;

const AREAS = [
  { id: "atendimento", icon: HeartHandshake, to: "/cliente/contratar", hash: "psicanalise", theme: "bg-[#f9eef1] text-[#752d47]" },
  { id: "mentoria", icon: Compass, to: "/cliente/contratar", hash: "mentoria", theme: "bg-[#f0ecfa] text-[#563883]" },
  { id: "carreira", icon: Sprout, to: "/cliente/contratar", hash: "career", theme: "bg-[#e8f3ed] text-[#225d45]" },
  { id: "empresas", icon: BriefcaseBusiness, to: "/empresas/servicos", theme: "bg-[#edf2f8] text-[#274b74]" },
  { id: "digital", icon: Monitor, to: "/cliente/contratar", hash: "sites", theme: "bg-[#e9f3f4] text-[#22616a]" },
  { id: "educacao", icon: BookOpen, to: "/ldr-pass", theme: "bg-[#fbf1dc] text-[#78551b]" },
] as const;

const focus = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8a4c18]";

export function EcosystemServiceShowcase({ compact = false }: { compact?: boolean }) {
  const { locale } = useI18n();
  const copy = COPY[locale] ?? COPY.pt;

  if (compact) return (
    <section aria-labelledby="service-highlight-title" className="border-y border-[#d6ad63]/30 bg-[#fffaf2] px-5 py-8">
      <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-[1fr_auto] md:items-center">
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[.18em] text-[#8a4c18]">{copy.eyebrow}</p>
          <h2 id="service-highlight-title" className="mt-2 font-serif text-2xl leading-tight text-[#071426]">{copy.homeTitle}</h2>
          <p className="mt-3 text-sm leading-6 text-[#58616b]">{copy.homeText}</p>
        </div>
        <Link to="/ecossistema" hash="servicos" className={`inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[#071426] px-6 py-3 text-center text-sm font-bold text-white ${focus}`}>
          {copy.homeCta}<ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0" />
        </Link>
      </div>
    </section>
  );

  return (
    <section id="servicos" aria-labelledby="service-showcase-title" className="mt-8 scroll-mt-24 rounded-[30px] border border-[#d6ad63]/40 bg-[#fffdf8] p-5 sm:p-8">
      <div className="max-w-3xl">
        <p className="text-xs font-black uppercase tracking-[.18em] text-[#8a4c18]">{copy.eyebrow}</p>
        <h2 id="service-showcase-title" className="mt-3 font-serif text-3xl leading-tight text-[#071426] sm:text-4xl">{copy.title}</h2>
        <p className="mt-4 text-sm leading-7 text-[#58616b] sm:text-base">{copy.intro}</p>
      </div>
      <ul className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {AREAS.map((area, index) => {
          const [label, title, description] = copy.cards[index]!;
          const Icon = area.icon;
          const action = area.id === "empresas" ? copy.quote : area.id === "educacao" ? copy.education : copy.options;
          return <li key={area.id} className="min-w-0">
            <Link to={area.to} {...("hash" in area ? { hash: area.hash } : {})} className={`flex h-full min-w-0 flex-col rounded-2xl border border-[#e7dfd1] bg-white p-5 transition-colors hover:border-[#b58b47] hover:bg-[#fffaf2] ${focus}`}>
              <span className={`mb-5 flex h-11 w-11 items-center justify-center rounded-xl ${area.theme}`}><Icon aria-hidden="true" className="h-5 w-5" /></span>
              <p className="text-xs font-bold uppercase tracking-[.12em] text-[#6b6257]">{label}</p>
              <h3 className="mt-2 break-words font-serif text-2xl font-bold leading-tight text-[#071426]">{title}</h3>
              <p className="mb-5 mt-3 text-sm leading-6 text-[#58616b]">{description}</p>
              <span className="mt-auto inline-flex min-h-11 items-center justify-between gap-3 text-sm font-bold text-[#274b74]">{action}<ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0" /></span>
            </Link>
          </li>;
        })}
      </ul>
      <div className="mt-6 grid gap-4 border-t border-[#e7dfd1] pt-5 md:grid-cols-[1fr_auto] md:items-center">
        <p className="max-w-3xl text-sm leading-6 text-[#58616b]">{copy.journey}</p>
        <Link to="/cliente/contratar" className={`inline-flex min-h-12 items-center justify-center rounded-full bg-[#071426] px-5 py-3 text-center text-sm font-bold text-white ${focus}`}>{copy.all}</Link>
      </div>
    </section>
  );
}

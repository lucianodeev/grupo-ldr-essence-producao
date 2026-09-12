import type { LibraryCardLocale } from "@/lib/library-card-i18n";

type Tone = "emerald" | "violet" | "petrol" | "gold" | "blue" | "green";

const FORMATION_TEXT: Record<LibraryCardLocale, [string,string,string][]> = {
  pt: [
    ["RH · 600H","Formação em Gestão de Pessoas e Recursos Humanos","600 horas · 100% online · leitura e atividades"],
    ["PSICANÁLISE","Formação em Psicanálise com Ênfase em Autismo e Atuação Internacional","15 módulos · 1.200 horas · 240 unidades · 6 encontros ao vivo"],
    ["🌍 INTERNACIONAL · PREMIUM","Psicanálise Internacional, Neurodiversidade e Autismo","21 módulos · 6–12 meses · 100% online · projetos e avaliação · fora da assinatura"],
    ["TERAPIA BREVE · 1.200H","Formação em Terapia Breve Psicanalítica","15 módulos · 300 aulas · 1.200 horas · 100% online · projetos e avaliação"],
    ["NEGÓCIO EM 24H","Formação Negócio em 24 Horas","9 módulos · 90 aulas · 360 horas · 100% online · projeto final avaliado"],
    ["MENTORIA E CARREIRA","Formação em Mentoria Profissional e de Carreira","3 meses · percurso estruturado · acesso digital"],
    ["LIDERANÇA","Formação em Liderança e Gestão de Pessoas","3 meses · percurso estruturado · acesso digital"],
  ],
  en: [
    ["HR · 600H","People & Human Resources Management Training","600 hours · 100% online · reading and activities"],
    ["PSYCHOANALYSIS","Psychoanalysis Training with Emphasis on Autism and International Practice","15 modules · 1,200 hours · 240 units · 6 live meetings"],
    ["🌍 INTERNATIONAL · PREMIUM","International Psychoanalysis, Neurodiversity and Autism","21 modules · 6–12 months · 100% online · projects and assessment · outside subscription"],
    ["BRIEF THERAPY · 1,200H","Psychoanalytic Brief Therapy Training","15 modules · 300 lessons · 1,200 hours · 100% online · projects and assessment"],
    ["BUSINESS IN 24H","Business in 24 Hours Training","9 modules · 90 lessons · 360 hours · 100% online · assessed final project"],
    ["MENTORING & CAREER","Professional & Career Mentoring Training","3 months · structured pathway · digital access"],
    ["LEADERSHIP","Leadership & People Management Training","3 months · structured pathway · digital access"],
  ],
  fr: [
    ["RH · 600H","Formation en Gestion des Personnes et Ressources Humaines","600 heures · 100 % en ligne · lecture et activités"],
    ["PSYCHANALYSE","Formation en Psychanalyse avec Accent sur l’Autisme et la Pratique Internationale","15 modules · 1 200 heures · 240 unités · 6 rencontres en direct"],
    ["🌍 INTERNATIONAL · PREMIUM","Psychanalyse internationale, neurodiversité et autisme","21 modules · 6–12 mois · 100% en ligne · projets et évaluation · hors abonnement"],
    ["THÉRAPIE BRÈVE · 1 200H","Formation en Thérapie Brève Psychanalytique","15 modules · 300 leçons · 1 200 heures · 100% en ligne · projets et évaluation"],
    ["ENTREPRISE EN 24H","Formation Entreprise en 24 Heures","9 modules · 90 leçons · 360 heures · 100 % en ligne · projet final évalué"],
    ["MENTORAT & CARRIÈRE","Formation en Mentorat Professionnel et de Carrière","3 mois · parcours structuré · accès numérique"],
    ["LEADERSHIP","Formation en Leadership et Gestion des Personnes","3 mois · parcours structuré · accès numérique"],
  ],
  es: [
    ["RR. HH. · 600H","Formación en Gestión de Personas y Recursos Humanos","600 horas · 100 % online · lectura y actividades"],
    ["PSICOANÁLISIS","Formación en Psicoanálisis con Énfasis en Autismo y Actuación Internacional","15 módulos · 1.200 horas · 240 unidades · 6 encuentros en vivo"],
    ["🌍 INTERNACIONAL · PREMIUM","Psicoanálisis Internacional, Neurodiversidad y Autismo","21 módulos · 6–12 meses · 100% online · proyectos y evaluación · fuera de suscripción"],
    ["TERAPIA BREVE · 1.200H","Formación en Terapia Breve Psicoanalítica","15 módulos · 300 clases · 1.200 horas · 100% online · proyectos y evaluación"],
    ["NEGOCIO EN 24H","Formación Negocio en 24 Horas","9 módulos · 90 clases · 360 horas · 100 % online · proyecto final evaluado"],
    ["MENTORÍA Y CARRERA","Formación en Mentoría Profesional y de Carrera","3 meses · recorrido estructurado · acceso digital"],
    ["LIDERAZGO","Formación en Liderazgo y Gestión de Personas","3 meses · recorrido estructurado · acceso digital"],
  ],
};

const FREE_TEXT: Record<LibraryCardLocale, [string,string][]> = {
  pt: [["Organize sua Carreira","7 aulas · leitura · sem expiração"],["Francês Básico para Negócios — A1","30 aulas · 10 horas"],["Primeiros Socorros — Noções Básicas","30 aulas · 10 horas"]],
  en: [["Organize Your Career","7 lessons · reading · no expiry"],["Basic French for Business — A1","30 lessons · 10 hours"],["First Aid — Basic Concepts","30 lessons · 10 hours"]],
  fr: [["Organisez votre Carrière","7 leçons · lecture · sans expiration"],["Français Basique des Affaires — A1","30 leçons · 10 heures"],["Premiers Secours — Notions de Base","30 leçons · 10 heures"]],
  es: [["Organiza tu Carrera","7 clases · lectura · sin caducidad"],["Francés Básico para Negocios — A1","30 clases · 10 horas"],["Primeros Auxilios — Conceptos Básicos","30 clases · 10 horas"]],
};

const FORMATION_BASE: {free?: boolean; price?: string; href: string; tone: Tone}[] = [
  { price:"R$ 299,99 · € 49,90", href:"/cliente/formacoes/gestao-pessoas-rh", tone:"emerald" },
  { price:"R$ 299,99 · € 49,90", href:"/formacao-psicanalise", tone:"violet" },
  { price:"De R$ 697 por R$ 497 · De € 119 por € 89", href:"/formacao-psicanalise-internacional", tone:"blue" },
  { price:"R$ 299,99 · € 49,90", href:"/formacao-terapia-breve-psicanalitica", tone:"petrol" },
  { price:"R$ 299,99 · € 49,90", href:"/formacao-negocio-em-24-horas", tone:"gold" },
  { price:"R$ 299,99 · € 49,90", href:"/cliente/biblioteca", tone:"blue" },
  { price:"R$ 299,99 · € 49,90", href:"/cliente/biblioteca", tone:"green" },
];

export const FREE_ROUTES = [
  "/cliente/cursos/organizar-carreira",
  "/cliente/cursos/frances-negocios-a1",
  "/cliente/cursos/primeiros-socorros",
] as const;

export function isFreeContentRoute(pathname: string) {
  return FREE_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export function librarySalesCardCatalog(locale: LibraryCardLocale) {
  return {
    formations: FORMATION_TEXT[locale].map((x,i)=>({...FORMATION_BASE[i], tag:x[0], title:x[1], desc:x[2]})),
    freeCourses: FREE_TEXT[locale].map((x,i)=>[x[0],x[1],FREE_ROUTES[i]] as const),
  };
}

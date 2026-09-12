export type LibraryCardLocale = "pt" | "en" | "fr" | "es";

const CARD_TEXT = {
  pt: {
    ebooks: "eBooks", books: "Livros", editorial: "Jornais & Revistas", editorialSub: "Todos em um só lugar",
    business: "Negócios", psycho: "Psicanálise", brief: "Terapia Breve", massage: "Massoterapia",
    writtenPsycho: "Orientação Escrita", writtenPsychoSub: "psicanalítica", writtenCareer: "Orientação Profissional", writtenCareerSub: "carreira",
    business24: "Negócio 24h", mentorship: "Mentoria", leadership: "Liderança", hr: "RH 600h", free: "Gratuito", film: "Filme (em breve)",
    undergrad: "Graduação · Em breve", live: "LIVE SEMIPRESENCIAL", prelim: "Matriz preliminar", from: "A partir de R$ 99,90/mês", interest: "TENHO INTERESSE",
    postgrad: "Em breve", register: "INSCREVER INTERESSE", startFormation: "Quero começar minha formação", loading: "Carregando biblioteca…",
  },
  en: {
    ebooks: "eBooks", books: "Books", editorial: "Newspapers & Magazines", editorialSub: "Everything in one place",
    business: "Business", psycho: "Psychoanalysis", brief: "Brief Therapy", massage: "Massage Therapy",
    writtenPsycho: "Written Guidance", writtenPsychoSub: "psychoanalytic", writtenCareer: "Career Guidance", writtenCareerSub: "career",
    business24: "Business 24h", mentorship: "Mentoring", leadership: "Leadership", hr: "HR 600h", free: "Free", film: "Film (coming soon)",
    undergrad: "Undergraduate · Coming soon", live: "LIVE HYBRID", prelim: "Preliminary curriculum", from: "From R$ 99.90/month", interest: "I'M INTERESTED",
    postgrad: "Coming soon", register: "REGISTER INTEREST", startFormation: "Start my training", loading: "Loading library…",
  },
  fr: {
    ebooks: "eBooks", books: "Livres", editorial: "Journaux & Magazines", editorialSub: "Tout au même endroit",
    business: "Affaires", psycho: "Psychanalyse", brief: "Thérapie Brève", massage: "Massothérapie",
    writtenPsycho: "Orientation Écrite", writtenPsychoSub: "psychanalytique", writtenCareer: "Orientation Professionnelle", writtenCareerSub: "carrière",
    business24: "Entreprise 24h", mentorship: "Mentorat", leadership: "Leadership", hr: "RH 600h", free: "Gratuit", film: "Film (bientôt)",
    undergrad: "Licence · Bientôt", live: "HYBRIDE EN DIRECT", prelim: "Programme préliminaire", from: "À partir de R$ 99,90/mois", interest: "JE SUIS INTÉRESSÉ",
    postgrad: "Bientôt", register: "SIGNALER MON INTÉRÊT", startFormation: "Commencer ma formation", loading: "Chargement de la bibliothèque…",
  },
  es: {
    ebooks: "eBooks", books: "Libros", editorial: "Periódicos & Revistas", editorialSub: "Todo en un solo lugar",
    business: "Negocios", psycho: "Psicoanálisis", brief: "Terapia Breve", massage: "Masoterapia",
    writtenPsycho: "Orientación Escrita", writtenPsychoSub: "psicoanalítica", writtenCareer: "Orientación Profesional", writtenCareerSub: "carrera",
    business24: "Negocio 24h", mentorship: "Mentoría", leadership: "Liderazgo", hr: "RR. HH. 600h", free: "Gratis", film: "Película (próximamente)",
    undergrad: "Grado · Próximamente", live: "HÍBRIDO EN VIVO", prelim: "Plan preliminar", from: "Desde R$ 99,90/mes", interest: "ME INTERESA",
    postgrad: "Próximamente", register: "REGISTRAR INTERÉS", startFormation: "Comenzar mi formación", loading: "Cargando biblioteca…",
  },
} as const;

const UNDERGRAD_TITLES: Record<LibraryCardLocale, Record<string, string>> = {
  pt: { "psicanalise-clinica": "Graduação em Psicanálise Clínica", psicopedagogia: "Graduação em Psicopedagogia", pedagogia: "Graduação em Pedagogia", "gestao-rh": "Graduação em Gestão de Recursos Humanos", "inteligencia-artificial": "Graduação em Inteligência Artificial", empreendedorismo: "Graduação em Empreendedorismo" },
  en: { "psicanalise-clinica": "Undergraduate Degree in Clinical Psychoanalysis", psicopedagogia: "Undergraduate Degree in Psychopedagogy", pedagogia: "Undergraduate Degree in Education", "gestao-rh": "Undergraduate Degree in Human Resources Management", "inteligencia-artificial": "Undergraduate Degree in Artificial Intelligence", empreendedorismo: "Undergraduate Degree in Entrepreneurship" },
  fr: { "psicanalise-clinica": "Licence en Psychanalyse Clinique", psicopedagogia: "Licence en Psychopédagogie", pedagogia: "Licence en Pédagogie", "gestao-rh": "Licence en Gestion des Ressources Humaines", "inteligencia-artificial": "Licence en Intelligence Artificielle", empreendedorismo: "Licence en Entrepreneuriat" },
  es: { "psicanalise-clinica": "Grado en Psicoanálisis Clínico", psicopedagogia: "Grado en Psicopedagogía", pedagogia: "Grado en Pedagogía", "gestao-rh": "Grado en Gestión de Recursos Humanos", "inteligencia-artificial": "Grado en Inteligencia Artificial", empreendedorismo: "Grado en Emprendimiento" },
};

const POSTGRAD_TITLES: Record<LibraryCardLocale, Record<string, string>> = {
  pt: {
    "ia-negocios-gestao": "Inteligência Artificial Aplicada aos Negócios e à Gestão",
    "gestao-pessoas-lideranca-rh": "Gestão Estratégica de Pessoas, Liderança e RH",
    "empreendedorismo-inovacao-negocios": "Empreendedorismo, Inovação e Gestão de Negócios",
    "carreira-mentoria-desenvolvimento": "Gestão de Carreira, Mentoria e Desenvolvimento Profissional",
    "marketing-vendas-ia": "Marketing Digital, Vendas e Inteligência Artificial",
    "negocios-internacionais-expansao": "Negócios Internacionais e Expansão de Empresas",
    "psicanalise-cultura-comportamento": "Psicanálise, Cultura e Comportamento Organizacional",
  },
  en: {
    "ia-negocios-gestao": "Artificial Intelligence Applied to Business and Management",
    "gestao-pessoas-lideranca-rh": "Strategic People Management, Leadership and HR",
    "empreendedorismo-inovacao-negocios": "Entrepreneurship, Innovation and Business Management",
    "carreira-mentoria-desenvolvimento": "Career Management, Mentoring and Professional Development",
    "marketing-vendas-ia": "Digital Marketing, Sales and Artificial Intelligence",
    "negocios-internacionais-expansao": "International Business and Company Expansion",
    "psicanalise-cultura-comportamento": "Psychoanalysis, Culture and Organizational Behavior",
  },
  fr: {
    "ia-negocios-gestao": "Intelligence Artificielle Appliquée aux Affaires et à la Gestion",
    "gestao-pessoas-lideranca-rh": "Gestion Stratégique des Personnes, Leadership et RH",
    "empreendedorismo-inovacao-negocios": "Entrepreneuriat, Innovation et Gestion d’Entreprise",
    "carreira-mentoria-desenvolvimento": "Gestion de Carrière, Mentorat et Développement Professionnel",
    "marketing-vendas-ia": "Marketing Digital, Ventes et Intelligence Artificielle",
    "negocios-internacionais-expansao": "Affaires Internationales et Expansion des Entreprises",
    "psicanalise-cultura-comportamento": "Psychanalyse, Culture et Comportement Organisationnel",
  },
  es: {
    "ia-negocios-gestao": "Inteligencia Artificial Aplicada a los Negocios y la Gestión",
    "gestao-pessoas-lideranca-rh": "Gestión Estratégica de Personas, Liderazgo y RR. HH.",
    "empreendedorismo-inovacao-negocios": "Emprendimiento, Innovación y Gestión de Negocios",
    "carreira-mentoria-desenvolvimento": "Gestión de Carrera, Mentoría y Desarrollo Profesional",
    "marketing-vendas-ia": "Marketing Digital, Ventas e Inteligencia Artificial",
    "negocios-internacionais-expansao": "Negocios Internacionales y Expansión de Empresas",
    "psicanalise-cultura-comportamento": "Psicoanálisis, Cultura y Comportamiento Organizacional",
  },
};

export function libraryCardText(locale: LibraryCardLocale) { return CARD_TEXT[locale] ?? CARD_TEXT.pt; }
export function undergraduateCardTitle(locale: LibraryCardLocale, key: string, fallback: string) { return UNDERGRAD_TITLES[locale]?.[key] ?? fallback; }
export function postgraduateCardTitle(locale: LibraryCardLocale, key: string, fallback: string) { return POSTGRAD_TITLES[locale]?.[key] ?? fallback; }

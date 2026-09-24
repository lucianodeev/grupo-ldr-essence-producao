import { Link, createFileRoute } from "@tanstack/react-router";
import { BriefcaseBusiness, Building2, GraduationCap, HeartHandshake, Map, UsersRound } from "lucide-react";
import { LanguageSelect, useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/ldr-rh-estrategia")({
  head: () => ({
    meta: [
      { title: "LDR RH & Estratégia | Grupo LDR Essence" },
      { name: "description", content: "Entrada institucional da LDR RH & Estratégia dentro do Ecossistema LDR: empresas, carreira, recrutamento, profissionais, bem-estar e acesso aos painéis existentes." },
    ],
  }),
  component: LdrRhStrategyPage,
});

const COPY = {
  pt: {
    eye: "LDR RH & ESTRATÉGIA",
    title: "Pessoas, carreira, empresas e bem-estar conectados ao mesmo ecossistema.",
    intro: "Esta página organiza as entradas já existentes da LDR RH & Estratégia. Nenhum painel, banco, login ou fluxo validado foi reconstruído.",
    map: "Mapa do Ecossistema",
    company: "Empresas",
    companyText: "Vagas, recrutamento, benefícios, colaboradores e soluções corporativas.",
    career: "Carreira",
    careerText: "Vagas, desenvolvimento profissional, orientação e conexão com oportunidades.",
    professional: "Profissionais",
    professionalText: "Cadastro, perfil, serviços, agenda, Clínica Social e painel profissional.",
    clinic: "Clínica Social",
    clinicText: "Atendimento social, solicitação de vaga e participação de profissionais aprovados.",
    academy: "LDR Academy",
    academyText: "Biblioteca, cursos, formações, Rede Acadêmica e desenvolvimento contínuo.",
    master: "Painel Master",
    masterText: "Administração separada para operação, profissionais, Clínica Social, empresas e financeiro.",
    open: "Abrir",
    preservation: "Tudo permanece ligado ao mesmo Supabase e às rotas já validadas. Esta página funciona apenas como organização institucional e de navegação.",
  },
  en: {
    eye: "LDR HR & STRATEGY",
    title: "People, careers, companies and wellbeing connected in one ecosystem.",
    intro: "This page organizes the existing LDR HR & Strategy entries. No validated panel, database, login or workflow was rebuilt.",
    map: "Ecosystem Map",
    company: "Companies",
    companyText: "Jobs, recruitment, benefits, employees and corporate solutions.",
    career: "Career",
    careerText: "Jobs, professional development, guidance and opportunity connections.",
    professional: "Professionals",
    professionalText: "Registration, profile, services, schedule, Social Clinic and professional panel.",
    clinic: "Social Clinic",
    clinicText: "Social care, requests and participation by approved professionals.",
    academy: "LDR Academy",
    academyText: "Library, courses, programs, Academic Network and continuous development.",
    master: "Master Panel",
    masterText: "Separated administration for operations, professionals, Social Clinic, companies and finance.",
    open: "Open",
    preservation: "Everything remains connected to the same Supabase project and validated routes. This page only organizes institutional navigation.",
  },
  fr: {
    eye: "LDR RH & STRATÉGIE",
    title: "Personnes, carrière, entreprises et bien-être connectés dans un même écosystème.",
    intro: "Cette page organise les accès LDR RH & Stratégie déjà existants. Aucun panneau, base, login ou flux validé n'a été reconstruit.",
    map: "Carte de l'écosystème",
    company: "Entreprises",
    companyText: "Offres, recrutement, avantages, collaborateurs et solutions d'entreprise.",
    career: "Carrière",
    careerText: "Offres, développement professionnel, orientation et opportunités.",
    professional: "Professionnels",
    professionalText: "Inscription, profil, services, agenda, Clinique Sociale et espace professionnel.",
    clinic: "Clinique Sociale",
    clinicText: "Accompagnement social, demande de place et participation des professionnels approuvés.",
    academy: "LDR Academy",
    academyText: "Bibliothèque, cours, formations, Réseau Académique et développement continu.",
    master: "Panneau Master",
    masterText: "Administration séparée des opérations, professionnels, Clinique Sociale, entreprises et finances.",
    open: "Ouvrir",
    preservation: "Tout reste connecté au même projet Supabase et aux routes déjà validées. Cette page organise uniquement la navigation institutionnelle.",
  },
  es: {
    eye: "LDR RR. HH. & ESTRATEGIA",
    title: "Personas, carrera, empresas y bienestar conectados en un mismo ecosistema.",
    intro: "Esta página organiza los accesos existentes de LDR RH & Estrategia. No se reconstruyó ningún panel, base, acceso o flujo validado.",
    map: "Mapa del Ecosistema",
    company: "Empresas",
    companyText: "Vacantes, reclutamiento, beneficios, empleados y soluciones corporativas.",
    career: "Carrera",
    careerText: "Vacantes, desarrollo profesional, orientación y conexión con oportunidades.",
    professional: "Profesionales",
    professionalText: "Registro, perfil, servicios, agenda, Clínica Social y panel profesional.",
    clinic: "Clínica Social",
    clinicText: "Atención social, solicitud de plaza y participación de profesionales aprobados.",
    academy: "LDR Academy",
    academyText: "Biblioteca, cursos, formaciones, Red Académica y desarrollo continuo.",
    master: "Panel Master",
    masterText: "Administración separada para operación, profesionales, Clínica Social, empresas y finanzas.",
    open: "Abrir",
    preservation: "Todo permanece conectado al mismo proyecto Supabase y a las rutas ya validadas. Esta página solo organiza la navegación institucional.",
  },
} as const;

function LdrRhStrategyPage() {
  const { locale } = useI18n();
  const c = COPY[locale] ?? COPY.pt;
  const cards = [
    { title: c.company, text: c.companyText, to: "/empresa/login", icon: Building2 },
    { title: c.career, text: c.careerText, to: "/carreira", icon: BriefcaseBusiness },
    { title: c.professional, text: c.professionalText, to: "/profissional/cadastro", icon: UsersRound },
    { title: c.clinic, text: c.clinicText, to: "/clinica-social", icon: HeartHandshake },
    { title: c.academy, text: c.academyText, to: "/", icon: GraduationCap },
    { title: c.master, text: c.masterText, to: "/login", icon: Map },
  ] as const;

  return (
    <main className="min-h-screen bg-[#f8f3e8] text-[#0b1f3a]">
      <header className="border-b border-[#c7a33b]/35 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
          <Link to="/ecossistema" className="font-serif text-2xl font-bold">Grupo LDR Essence</Link>
          <LanguageSelect />
        </div>
      </header>
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <Link to="/ecossistema" className="inline-flex items-center gap-2 text-sm font-black text-[#7a4d14]">← {c.map}</Link>
        <div className="mt-6 rounded-[2rem] border border-[#c7a33b]/45 bg-white p-6 shadow-sm sm:p-9">
          <p className="text-xs font-black uppercase tracking-[.2em] text-[#c7a33b]">{c.eye}</p>
          <h1 className="mt-3 max-w-4xl font-serif text-4xl font-bold leading-tight sm:text-5xl">{c.title}</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">{c.intro}</p>
        </div>
        <div className="mt-7 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cards.map(({ title, text, to, icon: Icon }) => (
            <Link key={to} to={to} className="group rounded-[1.5rem] border border-[#c7a33b]/35 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#c7a33b] hover:shadow-md">
              <Icon className="h-6 w-6 text-[#7a4d14]" />
              <h2 className="mt-4 font-serif text-2xl font-bold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
              <span className="mt-5 inline-flex text-sm font-black text-[#0b1f3a]">{c.open} →</span>
            </Link>
          ))}
        </div>
        <p className="mt-7 rounded-2xl border border-[#c7a33b]/30 bg-white p-4 text-sm leading-6 text-slate-600">{c.preservation}</p>
      </section>
    </main>
  );
}

import { createFileRoute, Link, useLocation } from "@tanstack/react-router";
import { BriefcaseBusiness, Building2, ClipboardCheck, FileText, Globe2, Search, ShieldCheck, UserRound } from "lucide-react";
import { LanguageSelect, useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/carreira")({
  head: () => ({
    meta: [
      { title: "LDR Carreira | Oportunidades e Talentos" },
      {
        name: "description",
        content:
          "Conectando profissionais e empresas em uma plataforma internacional, inclusiva e gratuita de oportunidades profissionais.",
      },
      { name: "robots", content: "index,follow" },
    ],
  }),
  component: CareerRouterGuard,
});

const copy = {
  pt: {
    brand: "LDR Carreira",
    badge: "100% gratuito para profissionais e empresas",
    heroTitle: "Oportunidades encontram talentos, onde quer que estejam.",
    heroSub:
      "Conectamos pessoas que procuram oportunidades a empresas que querem encontrar talentos — com uma experiência simples, humana, segura e inclusiva.",
    free: "Sem mensalidade",
    privacy: "Dados protegidos",
    global: "Preparado para oportunidades internacionais",
    companyTitle: "Área da empresa",
    companySub:
      "Publique vagas gratuitamente, organize o processo seletivo e informe condições reais de acessibilidade e inclusão.",
    jobsTitle: "Vagas abertas",
    jobsSub:
      "Consulte oportunidades publicadas na LDR Carreira e prepare sua candidatura com mais segurança.",
    applicationsTitle: "Candidaturas e triagem",
    applicationsSub:
      "Acompanhe candidaturas, organize etapas e use critérios responsáveis para reduzir erros no processo seletivo.",
    guideTitle: "Guia de triagem responsável",
    guideSub:
      "Orientações para uma seleção ética, inclusiva e baseada em critérios claros.",
    routeOk: "Página carregada corretamente",
    currentRoute: "Rota atual",
    candidate: "Sou profissional",
    company: "Sou empresa",
    publish: "Publicar vaga",
    seeJobs: "Ver vagas abertas",
    seeApplications: "Ver candidaturas",
    openGuide: "Abrir guia",
    back: "Voltar para LDR Carreira",
    proof: "Esta tela é diferente da página principal.",
  },
  en: {
    brand: "LDR Career",
    badge: "100% free for professionals and companies",
    heroTitle: "Opportunities meet talent, wherever they are.",
    heroSub:
      "We connect people looking for opportunities with companies looking for talent — through a simple, human, secure and inclusive experience.",
    free: "No subscription",
    privacy: "Protected data",
    global: "Ready for international opportunities",
    companyTitle: "Company area",
    companySub:
      "Post jobs for free, organize the selection process and state real accessibility and inclusion conditions.",
    jobsTitle: "Open jobs",
    jobsSub: "Browse opportunities published on LDR Career and prepare your application more safely.",
    applicationsTitle: "Applications and screening",
    applicationsSub: "Track applications, organize steps and use responsible criteria to reduce selection-process errors.",
    guideTitle: "Responsible screening guide",
    guideSub: "Guidelines for ethical, inclusive selection based on clear criteria.",
    routeOk: "Page loaded correctly",
    currentRoute: "Current route",
    candidate: "I'm a professional",
    company: "I'm a company",
    publish: "Post a job",
    seeJobs: "See open jobs",
    seeApplications: "See applications",
    openGuide: "Open guide",
    back: "Back to LDR Career",
    proof: "This screen is different from the main page.",
  },
  fr: {
    brand: "LDR Carrière",
    badge: "100 % gratuit pour les professionnels et les entreprises",
    heroTitle: "Les opportunités rencontrent les talents, où qu’ils soient.",
    heroSub:
      "Nous mettons en relation les personnes à la recherche d’opportunités et les entreprises à la recherche de talents, dans une expérience simple, humaine, sécurisée et inclusive.",
    free: "Sans abonnement",
    privacy: "Données protégées",
    global: "Prêt pour les opportunités internationales",
    companyTitle: "Espace entreprise",
    companySub:
      "Publiez gratuitement des offres, organisez le processus de sélection et indiquez les conditions réelles d’accessibilité et d’inclusion.",
    jobsTitle: "Offres ouvertes",
    jobsSub: "Consultez les opportunités publiées sur LDR Carrière et préparez votre candidature avec plus de sécurité.",
    applicationsTitle: "Candidatures et triage",
    applicationsSub: "Suivez les candidatures, organisez les étapes et utilisez des critères responsables.",
    guideTitle: "Guide de triage responsable",
    guideSub: "Orientations pour une sélection éthique, inclusive et fondée sur des critères clairs.",
    routeOk: "Page chargée correctement",
    currentRoute: "Route actuelle",
    candidate: "Je suis professionnel",
    company: "Je suis une entreprise",
    publish: "Publier une offre",
    seeJobs: "Voir les offres",
    seeApplications: "Voir les candidatures",
    openGuide: "Ouvrir le guide",
    back: "Retour à LDR Carrière",
    proof: "Cet écran est différent de la page principale.",
  },
  es: {
    brand: "LDR Carrera",
    badge: "100% gratuito para profesionales y empresas",
    heroTitle: "Las oportunidades encuentran talento, dondequiera que esté.",
    heroSub:
      "Conectamos personas que buscan oportunidades con empresas que buscan talento, mediante una experiencia sencilla, humana, segura e inclusiva.",
    free: "Sin mensualidad",
    privacy: "Datos protegidos",
    global: "Preparado para oportunidades internacionales",
    companyTitle: "Área de empresa",
    companySub:
      "Publica vacantes gratis, organiza el proceso de selección e informa condiciones reales de accesibilidad e inclusión.",
    jobsTitle: "Vacantes abiertas",
    jobsSub: "Consulta oportunidades publicadas en LDR Carrera y prepara tu candidatura con más seguridad.",
    applicationsTitle: "Candidaturas y selección",
    applicationsSub: "Acompaña candidaturas, organiza etapas y usa criterios responsables.",
    guideTitle: "Guía de selección responsable",
    guideSub: "Orientaciones para una selección ética, inclusiva y basada en criterios claros.",
    routeOk: "Página cargada correctamente",
    currentRoute: "Ruta actual",
    candidate: "Soy profesional",
    company: "Soy empresa",
    publish: "Publicar vacante",
    seeJobs: "Ver vacantes",
    seeApplications: "Ver candidaturas",
    openGuide: "Abrir guía",
    back: "Volver a LDR Carrera",
    proof: "Esta pantalla es diferente de la página principal.",
  },
} as const;

type Locale = keyof typeof copy;

function CareerRouterGuard() {
  const location = useLocation();
  const { locale } = useI18n();
  const t = copy[locale as Locale] ?? copy.pt;
  const pathname = normalizePath(location.pathname);

  if (pathname === "/carreira/empresa") {
    return <SubPage t={t} path={pathname} icon="company" title={t.companyTitle} subtitle={t.companySub} primary={t.publish} primaryTo="/carreira/empresa" secondary={t.openGuide} secondaryTo="/carreira/empresa/guia-triagem-responsavel" />;
  }
  if (pathname === "/carreira/vagas") {
    return <SubPage t={t} path={pathname} icon="jobs" title={t.jobsTitle} subtitle={t.jobsSub} primary={t.candidate} primaryTo="/carreira" secondary={t.company} secondaryTo="/carreira/empresa" />;
  }
  if (pathname === "/carreira/empresa/candidaturas") {
    return <SubPage t={t} path={pathname} icon="applications" title={t.applicationsTitle} subtitle={t.applicationsSub} primary={t.seeApplications} primaryTo="/carreira/empresa/candidaturas" secondary={t.publish} secondaryTo="/carreira/empresa" />;
  }
  if (pathname === "/carreira/empresa/guia-triagem-responsavel") {
    return <SubPage t={t} path={pathname} icon="guide" title={t.guideTitle} subtitle={t.guideSub} primary={t.openGuide} primaryTo="/carreira/empresa/guia-triagem-responsavel" secondary={t.seeApplications} secondaryTo="/carreira/empresa/candidaturas" />;
  }

  return <Landing t={t} />;
}

function normalizePath(pathname: string) {
  const cleaned = pathname.replace(/\/+$/, "");
  return cleaned || "/carreira";
}

function Header({ t }: { t: (typeof copy)[Locale] }) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link to="/carreira" className="flex items-center gap-3 font-semibold text-[#07345b]">
          <BriefcaseBusiness aria-hidden="true" /> {t.brand}
        </Link>
        <LanguageSelect />
      </div>
    </header>
  );
}

function Landing({ t }: { t: (typeof copy)[Locale] }) {
  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-900">
      <Header t={t} />
      <section className="bg-gradient-to-br from-[#031d34] via-[#07345b] to-[#0b477a] text-white">
        <div className="mx-auto max-w-6xl px-5 py-16 md:py-24">
          <span className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-bold text-[#07345b] shadow-sm">{t.badge}</span>
          <h1 className="mt-6 max-w-4xl text-4xl font-black tracking-tight text-white md:text-6xl">{t.heroTitle}</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-white/90">{t.heroSub}</p>
          <div className="mt-8 flex flex-wrap gap-3 text-sm">
            {[t.free, t.privacy, t.global].map((item) => (
              <span key={item} className="rounded-full bg-white/14 px-4 py-2 text-white">✓ {item}</span>
            ))}
          </div>
        </div>
      </section>
      <section className="mx-auto grid max-w-6xl gap-5 px-5 py-12 md:grid-cols-3">
        <ActionCard icon={<UserRound />} title={t.candidate} to="/carreira" />
        <ActionCard icon={<Building2 />} title={t.companyTitle} to="/carreira/empresa" />
        <ActionCard icon={<Search />} title={t.jobsTitle} to="/carreira/vagas" />
      </section>
    </main>
  );
}

function SubPage({
  t,
  path,
  icon,
  title,
  subtitle,
  primary,
  primaryTo,
  secondary,
  secondaryTo,
}: {
  t: (typeof copy)[Locale];
  path: string;
  icon: "company" | "jobs" | "applications" | "guide";
  title: string;
  subtitle: string;
  primary: string;
  primaryTo: string;
  secondary: string;
  secondaryTo: string;
}) {
  const Icon = icon === "company" ? Building2 : icon === "jobs" ? Search : icon === "applications" ? ClipboardCheck : FileText;
  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-900">
      <Header t={t} />
      <section className="bg-gradient-to-br from-[#031d34] via-[#07345b] to-[#0b477a] text-white">
        <div className="mx-auto max-w-6xl px-5 py-14 md:py-20">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-[#07345b] shadow-sm">
            <ShieldCheck size={18} /> {t.routeOk}
          </span>
          <h1 className="mt-6 flex max-w-4xl items-center gap-3 text-4xl font-black tracking-tight text-white md:text-6xl">
            <Icon className="h-10 w-10 shrink-0 md:h-12 md:w-12" /> {title}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-white/90">{subtitle}</p>
          <p className="mt-5 inline-flex rounded-xl bg-white/12 px-4 py-3 text-sm font-semibold text-white">
            {t.currentRoute}: {path}
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-5 py-10">
        <div className="rounded-3xl border border-[#d4b050]/45 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-black text-[#07345b]">{title}</h2>
              <p className="mt-2 max-w-2xl leading-7 text-slate-700">{t.proof}</p>
            </div>
            <Globe2 className="h-10 w-10 text-[#d4b050]" />
          </div>
          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            <LinkButton to={primaryTo}>{primary}</LinkButton>
            <LinkButton to={secondaryTo} variant="outline">{secondary}</LinkButton>
            <LinkButton to="/carreira" variant="ghost">{t.back}</LinkButton>
          </div>
        </div>
      </section>
    </main>
  );
}

function ActionCard({ icon, title, to }: { icon: React.ReactNode; title: string; to: string }) {
  return (
    <Link to={to} className="rounded-3xl border border-slate-200 bg-white p-6 text-[#07345b] shadow-sm transition hover:-translate-y-0.5 hover:border-[#d4b050]">
      <div className="mb-4 text-[#07345b]">{icon}</div>
      <strong className="text-xl">{title}</strong>
    </Link>
  );
}

function LinkButton({ to, children, variant = "solid" }: { to: string; children: React.ReactNode; variant?: "solid" | "outline" | "ghost" }) {
  const cls =
    variant === "solid"
      ? "bg-[#07345b] text-white hover:bg-[#052844]"
      : variant === "outline"
        ? "border border-[#07345b] bg-white text-[#07345b] hover:bg-slate-50"
        : "bg-[#f8fafc] text-[#07345b] hover:bg-slate-100";
  return (
    <Link to={to} className={`inline-flex min-h-12 items-center justify-center rounded-xl px-5 py-3 text-center text-sm font-black transition ${cls}`}>
      {children}
    </Link>
  );
}

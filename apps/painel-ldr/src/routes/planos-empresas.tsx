import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight, Building2, Check, LockKeyhole, SlidersHorizontal, Sparkles, UsersRound } from "lucide-react";
import { LanguageSelect, useI18n } from "@/lib/i18n";
import {
  calculateCustomCompanyPlan,
  COMPANY_PLAN_PRICING,
  COMPANY_SERVICE_KEYS,
  type CompanyPlanRegion,
  type CompanyServiceKey,
} from "@/lib/company-plan-pricing";

export const Route = createFileRoute("/planos-empresas")({
  head: () => ({
    meta: [
      { title: "Planos para Empresas — Grupo LDR Essence" },
      { name: "description", content: "Planos corporativos para benefícios, desenvolvimento e bem-estar de funcionários." },
      { property: "og:title", content: "Planos para Empresas — Grupo LDR Essence" },
      { property: "og:description", content: "Escolha um plano ou personalize os benefícios da sua empresa a partir de 51 funcionários." },
    ],
  }),
  component: CompanyPlans,
});

type Locale = "pt" | "en" | "fr" | "es";
const INTL: Record<Locale, string> = { pt: "pt-PT", en: "en-GB", fr: "fr-FR", es: "es-ES" };
const money = (cents: number, currency: string, locale: Locale) => new Intl.NumberFormat(INTL[locale], { style: "currency", currency }).format(cents / 100);

const COPY = {
  pt: {
    eyebrow: "Benefícios corporativos LDR",
    title: "Transforme cuidado e desenvolvimento em benefício para sua equipe.",
    intro: "Escolha um plano conforme o tamanho da empresa. A partir de 51 funcionários, monte o benefício diretamente na plataforma e acompanhe o valor em tempo real.",
    login: "Já sou empresa",
    essentials: "LDR Empresa Essencial",
    pro: "LDR Empresa Pro",
    custom: "LDR Empresa Personalizado",
    employees: "funcionários",
    month: "/mês",
    credits: "créditos mensais",
    panel: "Painel da Empresa e gestão de funcionários",
    services: "Psicanálise, Orientação Profissional, Carreira e Mentoria",
    privacy: "Dados de atendimento individual protegidos por confidencialidade",
    recommended: "Para empresas em crescimento",
    start: "Começar pela Área da Empresa",
    customOnly: "Personalização disponível somente a partir de 51 funcionários.",
    configure: "Personalize seu plano",
    configureText: "Defina funcionários, serviços e créditos adicionais. O valor muda automaticamente antes da contratação.",
    region: "Região de cobrança",
    europe: "Europa",
    brazil: "Brasil",
    employeeCount: "Quantidade de funcionários",
    chooseServices: "Escolha os serviços",
    extraCredits: "Créditos adicionais",
    none: "Nenhum",
    base: "Base por funcionários",
    addServices: "Serviços selecionados",
    addCredits: "Créditos adicionais",
    total: "Total mensal estimado",
    perEmployee: "Valor médio por funcionário",
    continue: "Continuar para Área da Empresa",
    checkoutNote: "O configurador calcula o plano agora. A cobrança recorrente será conectada ao checkout após validação dos novos produtos Stripe.",
    benefitTitle: "Um benefício que vai além do tradicional.",
    benefitText: "Sua empresa pode disponibilizar diferentes formas de cuidado, desenvolvimento e orientação em uma única solução.",
    flow1: "Empresa contrata",
    flow2: "Cadastra funcionários",
    flow3: "Libera benefícios",
    flow4: "Funcionário agenda",
    flow5: "Empresa acompanha apenas dados administrativos",
    confidential: "Confidencialidade preservada",
    confidentialText: "A empresa não acessa conteúdo de sessões, anotações, motivo do atendimento ou informações clínicas. Visualiza apenas dados administrativos necessários à gestão do benefício.",
    presencial: "Serviços presenciais e ações corporativas seguem disponibilidade, localização, logística e regras específicas de contratação.",
  },
  en: {
    eyebrow: "LDR corporate benefits",
    title: "Turn care and development into a benefit for your team.",
    intro: "Choose a plan based on company size. From 51 employees, build the benefit directly on the platform and see the price update in real time.",
    login: "I already have a company account",
    essentials: "LDR Company Essential",
    pro: "LDR Company Pro",
    custom: "LDR Company Custom",
    employees: "employees",
    month: "/month",
    credits: "monthly credits",
    panel: "Company dashboard and employee management",
    services: "Psychoanalysis, Career Guidance, Career and Mentoring",
    privacy: "Individual-care data protected by confidentiality",
    recommended: "For growing companies",
    start: "Start in the Company Area",
    customOnly: "Customization is available only from 51 employees.",
    configure: "Customize your plan",
    configureText: "Set employees, services and extra credits. The value updates automatically before purchase.",
    region: "Billing region",
    europe: "Europe",
    brazil: "Brazil",
    employeeCount: "Number of employees",
    chooseServices: "Choose services",
    extraCredits: "Extra credits",
    none: "None",
    base: "Employee base",
    addServices: "Selected services",
    addCredits: "Extra credits",
    total: "Estimated monthly total",
    perEmployee: "Average per employee",
    continue: "Continue to Company Area",
    checkoutNote: "The configurator calculates the plan now. Recurring billing will be connected after the new Stripe products are validated.",
    benefitTitle: "A benefit that goes beyond the traditional.",
    benefitText: "Your company can offer care, development and guidance options in one organized solution.",
    flow1: "Company subscribes",
    flow2: "Adds employees",
    flow3: "Releases benefits",
    flow4: "Employee schedules",
    flow5: "Company sees administrative data only",
    confidential: "Confidentiality preserved",
    confidentialText: "The company cannot access session content, notes, reasons for care or clinical information. It only sees the administrative data needed to manage the benefit.",
    presencial: "On-site services and corporate actions depend on availability, location, logistics and specific contracting rules.",
  },
  fr: {
    eyebrow: "Avantages entreprise LDR",
    title: "Transformez le soin et le développement en avantage pour votre équipe.",
    intro: "Choisissez un plan selon la taille de l’entreprise. À partir de 51 collaborateurs, configurez directement l’avantage sur la plateforme et voyez le prix évoluer en temps réel.",
    login: "J’ai déjà un compte entreprise",
    essentials: "LDR Entreprise Essentiel",
    pro: "LDR Entreprise Pro",
    custom: "LDR Entreprise Personnalisé",
    employees: "collaborateurs",
    month: "/mois",
    credits: "crédits mensuels",
    panel: "Portail entreprise et gestion des collaborateurs",
    services: "Psychanalyse, Orientation professionnelle, Carrière et Mentorat",
    privacy: "Données individuelles protégées par la confidentialité",
    recommended: "Pour les entreprises en croissance",
    start: "Commencer dans l’Espace Entreprise",
    customOnly: "La personnalisation est disponible uniquement à partir de 51 collaborateurs.",
    configure: "Personnalisez votre plan",
    configureText: "Définissez les collaborateurs, les services et les crédits supplémentaires. Le montant se met à jour automatiquement.",
    region: "Région de facturation",
    europe: "Europe",
    brazil: "Brésil",
    employeeCount: "Nombre de collaborateurs",
    chooseServices: "Choisissez les services",
    extraCredits: "Crédits supplémentaires",
    none: "Aucun",
    base: "Base collaborateurs",
    addServices: "Services sélectionnés",
    addCredits: "Crédits supplémentaires",
    total: "Total mensuel estimé",
    perEmployee: "Moyenne par collaborateur",
    continue: "Continuer vers l’Espace Entreprise",
    checkoutNote: "Le configurateur calcule le plan maintenant. La facturation récurrente sera connectée après validation des nouveaux produits Stripe.",
    benefitTitle: "Un avantage qui va au-delà du traditionnel.",
    benefitText: "Votre entreprise peut proposer plusieurs formes de soin, développement et orientation dans une seule solution.",
    flow1: "L’entreprise souscrit",
    flow2: "Ajoute les collaborateurs",
    flow3: "Active les avantages",
    flow4: "Le collaborateur planifie",
    flow5: "L’entreprise voit uniquement les données administratives",
    confidential: "Confidentialité préservée",
    confidentialText: "L’entreprise n’accède ni au contenu des séances, ni aux notes, ni au motif de consultation, ni aux informations cliniques. Elle ne voit que les données administratives nécessaires.",
    presencial: "Les services sur site et actions corporate dépendent de la disponibilité, du lieu, de la logistique et de règles spécifiques.",
  },
  es: {
    eyebrow: "Beneficios corporativos LDR",
    title: "Convierte el cuidado y el desarrollo en un beneficio para tu equipo.",
    intro: "Elige un plan según el tamaño de la empresa. A partir de 51 empleados, configura el beneficio directamente en la plataforma y consulta el precio en tiempo real.",
    login: "Ya soy empresa",
    essentials: "LDR Empresa Esencial",
    pro: "LDR Empresa Pro",
    custom: "LDR Empresa Personalizado",
    employees: "empleados",
    month: "/mes",
    credits: "créditos mensuales",
    panel: "Panel de Empresa y gestión de empleados",
    services: "Psicoanálisis, Orientación Profesional, Carrera y Mentoría",
    privacy: "Datos de atención individual protegidos por confidencialidad",
    recommended: "Para empresas en crecimiento",
    start: "Empezar en el Área de Empresa",
    customOnly: "La personalización está disponible únicamente a partir de 51 empleados.",
    configure: "Personaliza tu plan",
    configureText: "Define empleados, servicios y créditos adicionales. El valor cambia automáticamente antes de la compra.",
    region: "Región de facturación",
    europe: "Europa",
    brazil: "Brasil",
    employeeCount: "Cantidad de empleados",
    chooseServices: "Elige los servicios",
    extraCredits: "Créditos adicionales",
    none: "Ninguno",
    base: "Base por empleados",
    addServices: "Servicios seleccionados",
    addCredits: "Créditos adicionales",
    total: "Total mensual estimado",
    perEmployee: "Promedio por empleado",
    continue: "Continuar al Área de Empresa",
    checkoutNote: "El configurador calcula el plan ahora. El cobro recurrente se conectará tras validar los nuevos productos Stripe.",
    benefitTitle: "Un beneficio que va más allá de lo tradicional.",
    benefitText: "Tu empresa puede ofrecer distintas formas de cuidado, desarrollo y orientación en una sola solución.",
    flow1: "La empresa contrata",
    flow2: "Registra empleados",
    flow3: "Libera beneficios",
    flow4: "El empleado agenda",
    flow5: "La empresa ve solo datos administrativos",
    confidential: "Confidencialidad preservada",
    confidentialText: "La empresa no accede al contenido de sesiones, notas, motivo de atención ni información clínica. Solo ve los datos administrativos necesarios para gestionar el beneficio.",
    presencial: "Los servicios presenciales y acciones corporativas dependen de disponibilidad, ubicación, logística y reglas específicas de contratación.",
  },
} as const;

const SERVICE_LABELS: Record<CompanyServiceKey, Record<Locale, string>> = {
  psychoanalysis: { pt: "Psicanálise / atendimento individual", en: "Psychoanalysis / individual care", fr: "Psychanalyse / accompagnement individuel", es: "Psicoanálisis / atención individual" },
  career_guidance: { pt: "Orientação Profissional", en: "Career Guidance", fr: "Orientation professionnelle", es: "Orientación Profesional" },
  career: { pt: "Carreira", en: "Career", fr: "Carrière", es: "Carrera" },
  mentoring: { pt: "Mentoria", en: "Mentoring", fr: "Mentorat", es: "Mentoría" },
  workplace_massage: { pt: "Massagem Laboral", en: "Workplace Massage", fr: "Massage en entreprise", es: "Masaje Laboral" },
  wellbeing_hour: { pt: "Hora de Bem-Estar", en: "Wellbeing Hour", fr: "Heure Bien-être", es: "Hora de Bienestar" },
  talks: { pt: "Palestras", en: "Talks", fr: "Conférences", es: "Charlas" },
  training: { pt: "Treinamentos", en: "Training", fr: "Formations", es: "Capacitaciones" },
  corporate_actions: { pt: "Ações corporativas", en: "Corporate actions", fr: "Actions corporate", es: "Acciones corporativas" },
};

function CompanyPlans() {
  const { locale } = useI18n();
  const copy = COPY[locale];
  const [region, setRegion] = useState<CompanyPlanRegion>("EU");
  const [employees, setEmployees] = useState(60);
  const [services, setServices] = useState<CompanyServiceKey[]>(["psychoanalysis"]);
  const [extraCredits, setExtraCredits] = useState<0 | 5 | 10 | 25>(0);
  const pricing = COMPANY_PLAN_PRICING[region];
  const custom = useMemo(() => calculateCustomCompanyPlan({ region, employees, services, extraCredits }), [region, employees, services, extraCredits]);
  const toggle = (key: CompanyServiceKey) => setServices((current) => current.includes(key) ? current.filter((item) => item !== key) : [...current, key]);

  return <div className="min-h-screen bg-background text-foreground">
    <header className="border-b bg-card/95"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6"><Link to="/" className="font-serif text-xl font-bold">Grupo LDR Essence</Link><div className="flex items-center gap-3"><LanguageSelect/><Link to="/empresa/login" className="rounded-xl border px-4 py-2 text-sm font-black text-primary">{copy.login}</Link></div></div></header>
    <main>
      <section className="bg-primary text-primary-foreground"><div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20"><p className="text-xs font-black uppercase tracking-[.18em] text-secondary">{copy.eyebrow}</p><h1 className="mt-3 max-w-4xl font-serif text-4xl leading-tight sm:text-5xl">{copy.title}</h1><p className="mt-5 max-w-3xl text-base leading-7 opacity-85 sm:text-lg">{copy.intro}</p></div></section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6"><div className="grid gap-5 lg:grid-cols-3">
        <PlanCard title={copy.essentials} range={`1–10 ${copy.employees}`} price={money(pricing.essentials.monthlyCents, pricing.currency, locale)} credits={`${pricing.essentials.credits} ${copy.credits}`} bullets={[copy.panel, copy.services, copy.privacy]} cta={copy.start}/>
        <PlanCard title={copy.pro} range={`11–50 ${copy.employees}`} price={money(pricing.pro.monthlyCents, pricing.currency, locale)} credits={`${pricing.pro.credits} ${copy.credits}`} bullets={[copy.panel, copy.services, copy.privacy]} cta={copy.start} badge={copy.recommended}/>
        <PlanCard title={copy.custom} range={`51+ ${copy.employees}`} price={copy.configure} credits={copy.customOnly} bullets={[copy.panel, copy.chooseServices, copy.privacy]} cta={copy.configure}/>
      </div></section>

      <section className="border-y bg-muted/35"><div className="mx-auto max-w-7xl px-4 py-12 sm:px-6"><div className="grid gap-8 lg:grid-cols-[1fr_.78fr]">
        <div className="s8-card"><div className="flex items-center gap-3"><SlidersHorizontal className="h-6 w-6 text-primary"/><div><p className="text-xs font-black uppercase tracking-[.16em] text-primary">51+ {copy.employees}</p><h2 className="font-serif text-3xl">{copy.configure}</h2></div></div><p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{copy.configureText}</p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2"><div><label className="s8-label">{copy.region}</label><div className="grid grid-cols-2 gap-2"><button type="button" onClick={()=>setRegion("EU")} className={`rounded-xl border px-4 py-3 text-sm font-bold ${region==="EU"?"bg-primary text-primary-foreground":"bg-card"}`}>{copy.europe}</button><button type="button" onClick={()=>setRegion("BR")} className={`rounded-xl border px-4 py-3 text-sm font-bold ${region==="BR"?"bg-primary text-primary-foreground":"bg-card"}`}>{copy.brazil}</button></div></div><div><label className="s8-label">{copy.employeeCount}</label><input type="number" min={51} value={employees} onChange={(event)=>setEmployees(Math.max(51, Number(event.target.value)||51))} className="s8-field"/></div></div>
          <div className="mt-6"><p className="s8-label">{copy.chooseServices}</p><div className="grid gap-2 sm:grid-cols-2">{COMPANY_SERVICE_KEYS.map((key)=><button type="button" key={key} onClick={()=>toggle(key)} className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm font-bold transition ${services.includes(key)?"border-primary bg-primary/5 text-primary":"bg-card"}`}><span>{SERVICE_LABELS[key][locale]}</span>{services.includes(key)&&<Check className="h-4 w-4 shrink-0"/>}</button>)}</div></div>
          <div className="mt-6"><p className="s8-label">{copy.extraCredits}</p><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{([0,5,10,25] as const).map((qty)=><button key={qty} type="button" onClick={()=>setExtraCredits(qty)} className={`rounded-xl border px-3 py-3 text-sm font-black ${extraCredits===qty?"bg-primary text-primary-foreground":"bg-card"}`}>{qty===0?copy.none:`+${qty}`}</button>)}</div></div>
        </div>

        <aside className="s8-card h-fit lg:sticky lg:top-5"><div className="flex items-center gap-3"><Building2 className="h-6 w-6 text-primary"/><h2 className="font-serif text-2xl">{copy.custom}</h2></div><div className="mt-5 space-y-3 text-sm"><SummaryRow label={`${custom.employees} ${copy.employees}`} value={`${money(custom.employeeRateCents, custom.currency, locale)} × ${custom.employees}`}/><SummaryRow label={copy.base} value={money(custom.employeeBaseCents, custom.currency, locale)}/><SummaryRow label={copy.addServices} value={money(custom.servicesCents, custom.currency, locale)}/><SummaryRow label={copy.addCredits} value={money(custom.creditsCents, custom.currency, locale)}/></div><div className="mt-5 border-t pt-5"><p className="text-sm font-bold text-muted-foreground">{copy.total}</p><p className="mt-1 font-serif text-4xl font-bold text-primary">{money(custom.monthlyCents, custom.currency, locale)}<span className="text-sm font-sans text-muted-foreground"> {copy.month}</span></p><p className="mt-2 text-xs text-muted-foreground">{copy.perEmployee}: <strong>{money(custom.perEmployeeCents, custom.currency, locale)}</strong></p></div><Link to="/empresa/login" className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-black text-primary-foreground">{copy.continue}<ArrowRight className="h-4 w-4"/></Link><p className="mt-3 text-xs leading-5 text-muted-foreground">{copy.checkoutNote}</p></aside>
      </div></div></section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6"><div className="s8-card"><div className="grid gap-8 lg:grid-cols-[.9fr_1.1fr] lg:items-center"><div><Sparkles className="h-7 w-7 text-primary"/><h2 className="mt-3 font-serif text-3xl">{copy.benefitTitle}</h2><p className="mt-3 text-sm leading-7 text-muted-foreground">{copy.benefitText}</p></div><div className="grid gap-3 sm:grid-cols-5">{[copy.flow1,copy.flow2,copy.flow3,copy.flow4,copy.flow5].map((item,index)=><div key={item} className="rounded-2xl border bg-card p-4"><span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-xs font-black text-primary-foreground">{index+1}</span><p className="mt-3 text-sm font-bold leading-5">{item}</p></div>)}</div></div></div>
        <div className="mt-5 grid gap-5 md:grid-cols-2"><div className="s8-card"><div className="flex items-center gap-3"><LockKeyhole className="h-6 w-6 text-primary"/><h3 className="font-serif text-2xl">{copy.confidential}</h3></div><p className="mt-3 text-sm leading-7 text-muted-foreground">{copy.confidentialText}</p></div><div className="s8-card"><div className="flex items-center gap-3"><UsersRound className="h-6 w-6 text-primary"/><h3 className="font-serif text-2xl">{copy.chooseServices}</h3></div><p className="mt-3 text-sm leading-7 text-muted-foreground">{copy.presencial}</p></div></div>
      </section>
    </main>
  </div>;
}

function PlanCard({ title, range, price, credits, bullets, cta, badge }: { title:string; range:string; price:string; credits:string; bullets:string[]; cta:string; badge?:string }) {
  return <article className={`relative s8-card flex min-h-full flex-col ${badge?"border-primary shadow-lg shadow-primary/10":""}`}>{badge&&<span className="absolute -top-3 left-5 rounded-full bg-secondary px-3 py-1 text-xs font-black text-secondary-foreground">{badge}</span>}<p className="text-xs font-black uppercase tracking-[.15em] text-muted-foreground">{range}</p><h2 className="mt-2 font-serif text-3xl">{title}</h2><p className="mt-5 font-serif text-4xl font-bold text-primary">{price}</p><p className="mt-2 text-sm font-bold text-muted-foreground">{credits}</p><div className="mt-5 space-y-3">{bullets.map((item)=><p key={item} className="flex gap-2 text-sm leading-6"><Check className="mt-1 h-4 w-4 shrink-0 text-primary"/><span>{item}</span></p>)}</div><Link to="/empresa/login" className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-black text-primary-foreground">{cta}<ArrowRight className="h-4 w-4"/></Link></article>;
}

function SummaryRow({label,value}:{label:string;value:string}) { return <div className="flex items-start justify-between gap-4"><span className="text-muted-foreground">{label}</span><strong className="text-right">{value}</strong></div>; }

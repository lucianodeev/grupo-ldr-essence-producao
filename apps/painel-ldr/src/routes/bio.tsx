import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  GraduationCap,
  Library,
  LogIn,
  Newspaper,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { LanguageSelect, useI18n } from "@/lib/i18n";

const NAVY = "#07345b";
const NAVY_DARK = "#052844";
const GOLD = "#c99b2d";
const CREAM = "#f7f2e8";

const COPY = {
  pt: {
    intro: "Formações, biblioteca, publicações e orientações para aprender e avançar profissionalmente.", main: "ASSINATURA PRINCIPAL",
    libDesc: "Acesso a formações, cursos, treinamentos, livros e conteúdos digitais incluídos enquanto sua assinatura estiver ativa.", promo: "50% OFF NO PRIMEIRO MÊS", after: "Depois: R$ 39,90/mês ou € 9,90/mês. Cancele quando quiser.", subLib: "ASSINAR BIBLIOTECA",
    section: "ASSINATURAS & ORIENTAÇÕES", choose: "Escolha como quer começar", weekly: "ASSINATURA SEMANAL", textService: "ATENDIMENTO POR TEXTO", careerText: "CARREIRA · POR TEXTO",
    journalDesc: "Negócios, ciência, tecnologia, mundo e entretenimento em edição digital.", magazineDesc: "Carreira, empreendedorismo, comportamento, inovação e histórias que inspiram.",
    psychoDesc: "Orientação breve, privada e por escrito. O tempo fica pausado enquanto você aguarda a resposta.", psychoNote: "Valores promocionais do 1º mês. Depois: € 0,90 a cada 2 minutos, com pacotes disponíveis.",
    careerDesc: "Currículo, entrevistas, transição profissional, posicionamento e próximos passos.", careerNote: "Promoção válida por 30 dias a partir da primeira compra. Serviço separado da assinatura da Biblioteca.",
    subJournal: "ASSINAR JORNAL", subMagazine: "ASSINAR REVISTA", startPsycho: "INICIAR ORIENTAÇÃO", startCareer: "FALAR SOBRE MINHA CARREIRA",
    formations: "Formações e cursos", formationsSub: "Formações atuais por R$ 299,99 · € 49,90", free: "Cursos gratuitos", freeSub: "Comece a aprender sem custo", student: "Já sou aluno", studentSub: "Entre para acessar sua Biblioteca", borders: "Conhecimento sem fronteiras", linksAria: "Links principais da LDR Academy",
  },
  en: {
    intro: "Training, library, publications and guidance to help you learn and move forward professionally.", main: "MAIN SUBSCRIPTION",
    libDesc: "Access training, courses, books and included digital content while your subscription is active.", promo: "50% OFF THE FIRST MONTH", after: "Then: R$ 39.90/month or € 9.90/month. Cancel anytime.", subLib: "SUBSCRIBE TO THE LIBRARY",
    section: "SUBSCRIPTIONS & GUIDANCE", choose: "Choose how you want to start", weekly: "WEEKLY SUBSCRIPTION", textService: "GUIDANCE BY TEXT", careerText: "CAREER · BY TEXT",
    journalDesc: "Business, science, technology, world news and entertainment in a digital edition.", magazineDesc: "Career, entrepreneurship, behavior, innovation and inspiring stories.",
    psychoDesc: "Brief, private written guidance. The timer pauses while you wait for the professional's reply.", psychoNote: "Promotional first-month prices. Then: €0.90 every 2 minutes, with packages available.",
    careerDesc: "CV, interviews, career transition, positioning and next steps.", careerNote: "Promotion valid for 30 days from the first purchase. Separate from the Library subscription.",
    subJournal: "SUBSCRIBE TO NEWSPAPER", subMagazine: "SUBSCRIBE TO MAGAZINE", startPsycho: "START GUIDANCE", startCareer: "TALK ABOUT MY CAREER",
    formations: "Training and courses", formationsSub: "Current training: R$ 299.99 · € 49.90", free: "Free courses", freeSub: "Start learning at no cost", student: "I'm already a student", studentSub: "Sign in to access your Library", borders: "Knowledge without borders", linksAria: "Main LDR Academy links",
  },
  fr: {
    intro: "Formations, bibliothèque, publications et orientations pour apprendre et progresser professionnellement.", main: "ABONNEMENT PRINCIPAL",
    libDesc: "Accédez aux formations, cours, livres et contenus numériques inclus tant que votre abonnement est actif.", promo: "-50 % LE PREMIER MOIS", after: "Ensuite : R$ 39,90/mois ou 9,90 €/mois. Annulez à tout moment.", subLib: "S'ABONNER À LA BIBLIOTHÈQUE",
    section: "ABONNEMENTS & ORIENTATIONS", choose: "Choisissez comment commencer", weekly: "ABONNEMENT HEBDOMADAIRE", textService: "ORIENTATION PAR TEXTE", careerText: "CARRIÈRE · PAR TEXTE",
    journalDesc: "Économie, science, technologie, monde et divertissement dans une édition numérique.", magazineDesc: "Carrière, entrepreneuriat, comportement, innovation et histoires inspirantes.",
    psychoDesc: "Orientation brève, privée et écrite. Le compteur est mis en pause pendant l'attente de la réponse du professionnel.", psychoNote: "Tarifs promotionnels du premier mois. Ensuite : 0,90 € toutes les 2 minutes, avec forfaits disponibles.",
    careerDesc: "CV, entretiens, transition professionnelle, positionnement et prochaines étapes.", careerNote: "Promotion valable 30 jours à compter du premier achat. Service séparé de l'abonnement Bibliothèque.",
    subJournal: "S'ABONNER AU JOURNAL", subMagazine: "S'ABONNER AU MAGAZINE", startPsycho: "COMMENCER L'ORIENTATION", startCareer: "PARLER DE MA CARRIÈRE",
    formations: "Formations et cours", formationsSub: "Formations actuelles : R$ 299,99 · 49,90 €", free: "Cours gratuits", freeSub: "Commencez à apprendre gratuitement", student: "Je suis déjà élève", studentSub: "Connectez-vous pour accéder à votre Bibliothèque", borders: "Le savoir sans frontières", linksAria: "Liens principaux de LDR Academy",
  },
  es: {
    intro: "Formaciones, biblioteca, publicaciones y orientaciones para aprender y avanzar profesionalmente.", main: "SUSCRIPCIÓN PRINCIPAL",
    libDesc: "Accede a formaciones, cursos, libros y contenidos digitales incluidos mientras tu suscripción esté activa.", promo: "50% OFF EL PRIMER MES", after: "Después: R$ 39,90/mes o € 9,90/mes. Cancela cuando quieras.", subLib: "SUSCRIBIRME A LA BIBLIOTECA",
    section: "SUSCRIPCIONES Y ORIENTACIONES", choose: "Elige cómo quieres empezar", weekly: "SUSCRIPCIÓN SEMANAL", textService: "ORIENTACIÓN POR TEXTO", careerText: "CARRERA · POR TEXTO",
    journalDesc: "Negocios, ciencia, tecnología, mundo y entretenimiento en edición digital.", magazineDesc: "Carrera, emprendimiento, comportamiento, innovación e historias que inspiran.",
    psychoDesc: "Orientación breve, privada y por escrito. El tiempo se pausa mientras esperas la respuesta del profesional.", psychoNote: "Valores promocionales del primer mes. Después: €0,90 cada 2 minutos, con paquetes disponibles.",
    careerDesc: "Currículum, entrevistas, transición profesional, posicionamiento y próximos pasos.", careerNote: "Promoción válida durante 30 días desde la primera compra. Servicio separado de la suscripción de la Biblioteca.",
    subJournal: "SUSCRIBIRME AL PERIÓDICO", subMagazine: "SUSCRIBIRME A LA REVISTA", startPsycho: "INICIAR ORIENTACIÓN", startCareer: "HABLAR SOBRE MI CARRERA",
    formations: "Formaciones y cursos", formationsSub: "Formaciones actuales por R$ 299,99 · € 49,90", free: "Cursos gratuitos", freeSub: "Empieza a aprender sin costo", student: "Ya soy alumno", studentSub: "Entra para acceder a tu Biblioteca", borders: "Conocimiento sin fronteras", linksAria: "Enlaces principales de LDR Academy",
  },
} as const;

function PriceCard({ title, kicker, description, price, secondaryPrice, note, to, cta, tone = "light", icon }: { title:string;kicker:string;description:string;price:string;secondaryPrice?:string;note?:string;to:string;cta:string;tone?:"light"|"navy"|"wine"|"blue";icon:React.ReactNode; }) {
  const styles = { light:{bg:"#ffffff",fg:NAVY_DARK,muted:"#64748b",accent:GOLD,border:"rgba(7,52,91,.10)"}, navy:{bg:NAVY_DARK,fg:"#ffffff",muted:"rgba(255,255,255,.72)",accent:"#f0c775",border:"rgba(201,155,45,.35)"}, wine:{bg:"#5a1028",fg:"#ffffff",muted:"rgba(255,255,255,.74)",accent:"#f0c775",border:"rgba(240,199,117,.30)"}, blue:{bg:"#0b5cab",fg:"#ffffff",muted:"rgba(255,255,255,.76)",accent:"#bfe3ff",border:"rgba(191,227,255,.28)"} }[tone];
  return <article className="rounded-[24px] border p-5 shadow-sm" style={{background:styles.bg,color:styles.fg,borderColor:styles.border}}><div className="flex items-start justify-between gap-4"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-black/5">{icon}</span><span className="text-right text-[10px] font-black uppercase tracking-[.14em]" style={{color:styles.accent}}>{kicker}</span></div><h3 className="mt-4 text-xl font-black leading-tight">{title}</h3><p className="mt-2 text-sm leading-6" style={{color:styles.muted}}>{description}</p><div className="mt-4 rounded-2xl border p-4" style={{borderColor:styles.border,background:"rgba(255,255,255,.07)"}}><p className="text-lg font-black leading-6">{price}</p>{secondaryPrice?<p className="mt-1 text-sm font-bold" style={{color:styles.accent}}>{secondaryPrice}</p>:null}{note?<p className="mt-2 text-[11px] leading-5" style={{color:styles.muted}}>{note}</p>:null}</div><Link to={to} className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-center text-xs font-black" style={{background:styles.accent,color:tone==="light"?"#281605":NAVY_DARK}}>{cta}<ArrowRight size={16}/></Link></article>;
}

function BioPage(){
  const {locale}=useI18n(); const c=COPY[locale];
  return <main className="min-h-screen px-4 py-8 sm:py-12" style={{background:"radial-gradient(circle at top, rgba(201,155,45,.14), transparent 30%), linear-gradient(180deg, #fbfaf7 0%, #f7f2e8 100%)",color:NAVY_DARK}}><div className="mx-auto w-full max-w-2xl">
    <div className="mb-4 flex justify-end"><LanguageSelect className="rounded-lg bg-[#07345b] px-2 py-1 text-white"/></div>
    <header className="mb-7 text-center"><div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-[24px] shadow-sm" style={{background:NAVY}} aria-hidden="true"><BookOpen size={40} color={GOLD} strokeWidth={1.8}/></div><p className="mb-2 text-xs font-bold uppercase tracking-[0.24em]" style={{color:GOLD}}>Learn · Discover · Grow</p><h1 className="font-serif text-4xl font-bold tracking-tight" style={{color:NAVY}}>LDR Academy</h1><p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-600">{c.intro}</p></header>
    <section className="rounded-[28px] p-6 text-white shadow-lg" style={{background:`linear-gradient(135deg, ${NAVY_DARK}, #0b4d7f)`}}><div className="flex items-center gap-3"><Library size={25} color={GOLD}/><p className="text-xs font-black uppercase tracking-[.16em]" style={{color:GOLD}}>{c.main}</p></div><h2 className="mt-3 font-serif text-3xl">Biblioteca LDR</h2><p className="mt-3 text-sm leading-6 text-white/75">{c.libDesc}</p><div className="mt-5 rounded-2xl border border-[#c99b2d]/35 bg-black/20 p-5"><p className="text-xs font-black uppercase tracking-[.12em]" style={{color:"#f0c775"}}>{c.promo}</p><p className="mt-2 text-2xl font-black">🇧🇷 R$ 19,95 · 🇪🇺 € 4,95</p><p className="mt-2 text-sm text-white/75">{c.after}</p></div><Link to="/cliente/biblioteca" className="mt-5 flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-black" style={{background:GOLD,color:"#281605"}}>{c.subLib}<ArrowRight size={17}/></Link></section>
    <section className="mt-7"><div className="mb-4 text-center"><p className="text-xs font-black uppercase tracking-[.16em]" style={{color:GOLD}}>{c.section}</p><h2 className="mt-2 font-serif text-2xl" style={{color:NAVY}}>{c.choose}</h2></div><div className="grid gap-4 sm:grid-cols-2">
      <PriceCard title="Jornal LDR" kicker={c.weekly} description={c.journalDesc} price="🇧🇷 R$ 0,90 / semana" secondaryPrice="🇪🇺 € 0,90 / semana" to="/cliente/biblioteca/jornal-ldr" cta={c.subJournal} tone="navy" icon={<Newspaper size={23} color="#f0c775"/>}/>
      <PriceCard title="Revista LDR" kicker={c.weekly} description={c.magazineDesc} price="🇧🇷 R$ 0,90 / semana" secondaryPrice="🇪🇺 € 0,90 / semana" to="/cliente/biblioteca/revista-ldr" cta={c.subMagazine} tone="wine" icon={<BookOpen size={23} color="#f0c775"/>}/>
      <PriceCard title={locale==="en"?"Psychoanalytic Guidance":locale==="fr"?"Orientation psychanalytique":locale==="es"?"Orientación psicoanalítica":"Orientação Psicanalítica"} kicker={c.textService} description={c.psychoDesc} price="10 min · € 0,90 / R$ 5,35" secondaryPrice="30 min · € 1,00 / R$ 5,95 · 60 min · € 1,90 / R$ 11,30" note={c.psychoNote} to="/cliente/orientacao-psicanalitica" cta={c.startPsycho} tone="light" icon={<Stethoscope size={23} color={GOLD}/>}/>
      <PriceCard title={locale==="en"?"Career Guidance":locale==="fr"?"Orientation professionnelle":locale==="es"?"Orientación profesional":"Orientação Profissional"} kicker={c.careerText} description={c.careerDesc} price="10 min · € 0,90 / R$ 5,35" secondaryPrice="30 min · € 1,90 / R$ 11,30 · 60 min · € 3,90 / R$ 23,20" note={c.careerNote} to="/cliente/orientacao-profissional" cta={c.startCareer} tone="blue" icon={<BriefcaseBusiness size={23} color="#bfe3ff"/>}/>
    </div></section>
    <section className="mt-7 space-y-3" aria-label={c.linksAria}><Link to="/" className="group flex w-full items-center gap-4 rounded-2xl p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md" style={{background:NAVY,color:"white"}}><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10"><GraduationCap size={23}/></span><span className="min-w-0 flex-1"><strong className="block text-base">{c.formations}</strong><span className="mt-0.5 block text-xs text-white/75">{c.formationsSub}</span></span><ArrowRight size={19} className="transition group-hover:translate-x-1"/></Link><Link to="/cliente/biblioteca/cursos-gratuitos" className="group flex w-full items-center gap-4 rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md" style={{borderColor:"rgba(7,52,91,.10)",color:NAVY}}><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{background:CREAM,color:GOLD}}><Sparkles size={23}/></span><span className="min-w-0 flex-1"><strong className="block text-base">{c.free}</strong><span className="mt-0.5 block text-xs text-slate-500">{c.freeSub}</span></span><ArrowRight size={19} className="transition group-hover:translate-x-1"/></Link><Link to="/cliente/login" className="group flex w-full items-center gap-4 rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md" style={{borderColor:"rgba(7,52,91,.10)",color:NAVY}}><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{background:CREAM,color:GOLD}}><LogIn size={22}/></span><span className="min-w-0 flex-1"><strong className="block text-base">{c.student}</strong><span className="mt-0.5 block text-xs text-slate-500">{c.studentSub}</span></span><ArrowRight size={19} className="transition group-hover:translate-x-1"/></Link></section>
    <div className="mt-7 rounded-2xl border border-white/70 bg-white/70 px-5 py-4 text-center shadow-sm backdrop-blur"><p className="text-xs font-semibold uppercase tracking-[0.16em]" style={{color:GOLD}}>{c.borders}</p><p className="mt-1 text-sm font-semibold" style={{color:NAVY}}>ldracademy.online</p></div><footer className="mt-6 text-center text-[11px] text-slate-400">© {new Date().getFullYear()} LDR Academy</footer>
  </div></main>;
}

export const Route=createFileRoute("/bio")({head:()=>({meta:[{title:"LDR Academy | Cursos, Formações e Biblioteca Online"},{name:"description",content:"LDR Academy: cursos, formações profissionais, Biblioteca LDR, publicações e orientações por texto."},{property:"og:title",content:"LDR Academy"},{property:"og:description",content:"Cursos, formações, assinaturas e orientações em um só lugar."},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary"}]}),component:BioPage});

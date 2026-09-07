import { Link } from "@tanstack/react-router";
import { ArrowUpRight, BookOpen, BriefcaseBusiness, GraduationCap, Presentation, Sparkles } from "lucide-react";
import { LanguageSelect, useI18n } from "@/lib/i18n";

type Kind = "ebook" | "entrepreneurs" | "training" | "books" | "seller" | "sellerAcademy" | "sellerPresentation";

const SELLER = "https://lucianodeev.github.io/grupo-ldr-essence-unificado/rede-comercial-final/vendedor.html";
const SELLER_ACADEMY = "https://lucianodeev.github.io/grupo-ldr-essence-unificado/academia-vendas.html";
const SELLER_PRESENTATION = "https://lucianodeev.github.io/grupo-ldr-essence-unificado/apresentacao-vendedores.html";
const PANEL = "https://painel.ldrrhestrategia.com";

const COPY = {
  pt: {
    back:"Voltar ao início", client:"Área do Cliente", login:"Entrar como cliente", library:"Abrir biblioteca", trainings:"Abrir treinamentos",
    ebookEye:"eBook / Livro digital", ebookTitle:"A Coragem de Começar", ebookText:"Um guia direto para quem quer transformar coragem em ação e dar o primeiro passo com mais clareza.", ebookLang:"Disponível em Português, Inglês, Francês e Espanhol", prices:"Brasil R$ 9,90 · Europa € 4,90",
    entEye:"Projeto Empreendedor", entTitle:"Empreendedores", entText:"Livros, eBooks e treinamento para quem quer começar, estruturar e desenvolver o próprio negócio.",
    trEye:"Treinamento", trTitle:"Do Mamão ao Negócio", trText:"Do primeiro produto ao negócio organizado: um percurso prático para transformar uma ideia em ação comercial.",
    booksEye:"Biblioteca", booksTitle:"Livros & eBooks", booksText:"Conteúdos digitais do ecossistema LDR reunidos em um só lugar, com acesso pela Área do Cliente.",
    sellerEye:"Rede Comercial LDR", sellerTitle:"Seja um representante comercial LDR", sellerText:"Candidate-se à Rede Comercial ou acesse o portal oficial se você já é vendedor. O cadastro, login e vendas continuam no sistema já validado.", apply:"CANDIDATE-SE", already:"JÁ SOU VENDEDOR", academy:"Academia Comercial", presentation:"Apresentação da Rede",
    academyEye:"Rede Comercial LDR", academyTitle:"Academia Comercial", academyText:"Treinamentos e materiais da equipe comercial ficam no ambiente oficial já validado.", openAcademy:"ABRIR ACADEMIA",
    presentationEye:"Rede Comercial LDR", presentationTitle:"Apresentação Comercial", presentationText:"Acesse o material oficial de apresentação da Rede Comercial LDR.", openPresentation:"ABRIR APRESENTAÇÃO",
    note:"Os sistemas autenticados continuam em painel.ldrrhestrategia.com para preservar segurança, login, Stripe e dados existentes."
  },
  en: {
    back:"Back to home", client:"Client Area", login:"Client sign in", library:"Open library", trainings:"Open trainings",
    ebookEye:"eBook / Digital book", ebookTitle:"The Courage to Begin", ebookText:"A straightforward guide for turning courage into action and taking the first step with greater clarity.", ebookLang:"Available in Portuguese, English, French and Spanish", prices:"Brazil R$ 9.90 · Europe € 4.90",
    entEye:"Entrepreneur Project", entTitle:"Entrepreneurs", entText:"Books, eBooks and training for people who want to start, structure and develop their own business.",
    trEye:"Training", trTitle:"From Papaya to Business", trText:"From the first product to an organised business: a practical journey from idea to commercial action.",
    booksEye:"Library", booksTitle:"Books & eBooks", booksText:"LDR digital content gathered in one place, with access through the Client Area.",
    sellerEye:"LDR Sales Network", sellerTitle:"Become an LDR sales representative", sellerText:"Apply to the Sales Network or access the official portal if you are already a seller. Registration, login and sales remain in the validated system.", apply:"APPLY NOW", already:"I AM ALREADY A SELLER", academy:"Sales Academy", presentation:"Sales Presentation",
    academyEye:"LDR Sales Network", academyTitle:"Sales Academy", academyText:"Training and sales materials remain in the official validated environment.", openAcademy:"OPEN ACADEMY",
    presentationEye:"LDR Sales Network", presentationTitle:"Sales Presentation", presentationText:"Access the official LDR Sales Network presentation material.", openPresentation:"OPEN PRESENTATION",
    note:"Authenticated systems remain on painel.ldrrhestrategia.com to preserve security, login, Stripe and existing data."
  },
  fr: {
    back:"Retour à l'accueil", client:"Espace Client", login:"Connexion client", library:"Ouvrir la bibliothèque", trainings:"Ouvrir les formations",
    ebookEye:"eBook / Livre numérique", ebookTitle:"Le Courage de Commencer", ebookText:"Un guide direct pour transformer le courage en action et faire le premier pas avec plus de clarté.", ebookLang:"Disponible en portugais, anglais, français et espagnol", prices:"Brésil R$ 9,90 · Europe € 4,90",
    entEye:"Projet Entrepreneur", entTitle:"Entrepreneurs", entText:"Livres, eBooks et formation pour lancer, structurer et développer son activité.",
    trEye:"Formation", trTitle:"De la Papaye à l'Entreprise", trText:"Du premier produit à une activité organisée : un parcours pratique de l'idée à l'action commerciale.",
    booksEye:"Bibliothèque", booksTitle:"Livres & eBooks", booksText:"Les contenus numériques LDR réunis en un seul espace, accessibles depuis l'Espace Client.",
    sellerEye:"Réseau commercial LDR", sellerTitle:"Devenez représentant commercial LDR", sellerText:"Postulez au Réseau commercial ou accédez au portail officiel si vous êtes déjà vendeur. L'inscription, la connexion et les ventes restent dans le système validé.", apply:"POSTULER", already:"JE SUIS DÉJÀ VENDEUR", academy:"Académie commerciale", presentation:"Présentation commerciale",
    academyEye:"Réseau commercial LDR", academyTitle:"Académie commerciale", academyText:"Les formations et supports commerciaux restent dans l'environnement officiel déjà validé.", openAcademy:"OUVRIR L'ACADÉMIE",
    presentationEye:"Réseau commercial LDR", presentationTitle:"Présentation commerciale", presentationText:"Accédez au support officiel de présentation du Réseau commercial LDR.", openPresentation:"OUVRIR LA PRÉSENTATION",
    note:"Les systèmes authentifiés restent sur painel.ldrrhestrategia.com afin de préserver la sécurité, la connexion, Stripe et les données existantes."
  },
  es: {
    back:"Volver al inicio", client:"Área del Cliente", login:"Entrar como cliente", library:"Abrir biblioteca", trainings:"Abrir formaciones",
    ebookEye:"eBook / Libro digital", ebookTitle:"El Coraje de Empezar", ebookText:"Una guía directa para convertir el coraje en acción y dar el primer paso con más claridad.", ebookLang:"Disponible en portugués, inglés, francés y español", prices:"Brasil R$ 9,90 · Europa € 4,90",
    entEye:"Proyecto Emprendedor", entTitle:"Emprendedores", entText:"Libros, eBooks y formación para quien quiere empezar, estructurar y desarrollar su propio negocio.",
    trEye:"Formación", trTitle:"De la Papaya al Negocio", trText:"Del primer producto al negocio organizado: un recorrido práctico de la idea a la acción comercial.",
    booksEye:"Biblioteca", booksTitle:"Libros y eBooks", booksText:"Contenidos digitales de LDR reunidos en un solo lugar, con acceso desde el Área del Cliente.",
    sellerEye:"Red Comercial LDR", sellerTitle:"Sé representante comercial LDR", sellerText:"Postúlate a la Red Comercial o accede al portal oficial si ya eres vendedor. El registro, acceso y ventas continúan en el sistema validado.", apply:"POSTÚLATE", already:"YA SOY VENDEDOR", academy:"Academia Comercial", presentation:"Presentación Comercial",
    academyEye:"Red Comercial LDR", academyTitle:"Academia Comercial", academyText:"Las formaciones y materiales comerciales continúan en el entorno oficial ya validado.", openAcademy:"ABRIR ACADEMIA",
    presentationEye:"Red Comercial LDR", presentationTitle:"Presentación Comercial", presentationText:"Accede al material oficial de presentación de la Red Comercial LDR.", openPresentation:"ABRIR PRESENTACIÓN",
    note:"Los sistemas autenticados continúan en painel.ldrrhestrategia.com para preservar seguridad, acceso, Stripe y los datos existentes."
  }
} as const;

export function UnifiedPublicPage({ kind }: { kind: Kind }) {
  const { locale } = useI18n();
  const c = COPY[locale];

  const map = {
    ebook: [c.ebookEye, c.ebookTitle, c.ebookText],
    entrepreneurs: [c.entEye, c.entTitle, c.entText],
    training: [c.trEye, c.trTitle, c.trText],
    books: [c.booksEye, c.booksTitle, c.booksText],
    seller: [c.sellerEye, c.sellerTitle, c.sellerText],
    sellerAcademy: [c.academyEye, c.academyTitle, c.academyText],
    sellerPresentation: [c.presentationEye, c.presentationTitle, c.presentationText],
  } as const;
  const [eyebrow, title, text] = map[kind];

  return <div className="min-h-screen bg-background text-foreground">
    <header className="border-b bg-card"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6"><Link to="/" className="font-serif text-2xl text-primary">Grupo LDR Essence</Link><LanguageSelect/></div></header>
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <Link to="/" className="text-sm font-bold text-primary">← {c.back}</Link>
      <section className="mt-5 overflow-hidden rounded-[2rem] border bg-card p-6 shadow-xl shadow-primary/5 sm:p-9">
        <p className="text-xs font-black uppercase tracking-[.18em] text-primary">{eyebrow}</p>
        <h1 className="mt-2 max-w-4xl break-words font-serif text-4xl leading-tight sm:text-5xl">{title}</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">{text}</p>

        {kind === "ebook" && <><div className="mt-6 grid gap-3 sm:grid-cols-2"><div className="rounded-2xl border bg-background p-4"><p className="text-sm font-black text-primary">{c.prices}</p></div><div className="rounded-2xl border bg-background p-4"><p className="text-sm font-black text-primary">{c.ebookLang}</p></div></div><div className="mt-6 flex flex-wrap gap-3"><a href={`${PANEL}/cliente/biblioteca`} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-black text-primary-foreground"><BookOpen className="h-4 w-4"/>{c.library}</a><a href={`${PANEL}/cliente/login`} className="inline-flex min-h-11 items-center rounded-xl border px-5 py-3 text-sm font-black text-primary">{c.login}</a></div></>}

        {kind === "entrepreneurs" && <div className="mt-7 grid gap-4 sm:grid-cols-3"><Card icon={Sparkles} title={c.ebookTitle} href="/acoragemdecomecar"/><Card icon={BookOpen} title={c.booksTitle} href="/livros"/><Card icon={GraduationCap} title={c.trTitle} href="/treinamento"/></div>}
        {kind === "training" && <div className="mt-6 flex flex-wrap gap-3"><a href={`${PANEL}/cliente/treinamentos`} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-black text-primary-foreground"><GraduationCap className="h-4 w-4"/>{c.trainings}</a><a href={`${PANEL}/cliente/login`} className="inline-flex min-h-11 items-center rounded-xl border px-5 py-3 text-sm font-black text-primary">{c.login}</a></div>}
        {kind === "books" && <div className="mt-6 flex flex-wrap gap-3"><a href={`${PANEL}/cliente/biblioteca`} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-black text-primary-foreground"><BookOpen className="h-4 w-4"/>{c.library}</a><Link to="/acoragemdecomecar" className="inline-flex min-h-11 items-center rounded-xl border px-5 py-3 text-sm font-black text-primary">{c.ebookTitle}</Link></div>}
        {kind === "seller" && <><div className="mt-6 flex flex-wrap gap-3"><a href={SELLER} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-secondary px-5 py-3 text-sm font-black text-secondary-foreground">{c.apply}<ArrowUpRight className="h-4 w-4"/></a><a href={SELLER} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-xl border px-5 py-3 text-sm font-black text-primary">{c.already}<ArrowUpRight className="h-4 w-4"/></a></div><div className="mt-7 grid gap-4 sm:grid-cols-2"><Card icon={GraduationCap} title={c.academy} href="/vendedor/academia"/><Card icon={Presentation} title={c.presentation} href="/vendedor/apresentacao"/></div></>}
        {kind === "sellerAcademy" && <a href={SELLER_ACADEMY} target="_blank" rel="noreferrer" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-black text-primary-foreground">{c.openAcademy}<ArrowUpRight className="h-4 w-4"/></a>}
        {kind === "sellerPresentation" && <a href={SELLER_PRESENTATION} target="_blank" rel="noreferrer" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-black text-primary-foreground">{c.openPresentation}<ArrowUpRight className="h-4 w-4"/></a>}

        <p className="mt-8 rounded-xl bg-muted/50 p-4 text-xs leading-5 text-muted-foreground">{c.note}</p>
      </section>
    </main>
  </div>;
}

function Card({icon:Icon,title,href}:{icon:typeof BriefcaseBusiness;title:string;href:string}) {
  return <a href={href} className="group rounded-2xl border bg-background p-5 transition hover:-translate-y-1 hover:shadow-lg"><Icon className="h-6 w-6 text-primary"/><h2 className="mt-3 break-words font-serif text-2xl">{title}</h2><span className="mt-4 inline-flex items-center gap-1 text-sm font-black text-primary">Abrir <ArrowUpRight className="h-4 w-4"/></span></a>;
}

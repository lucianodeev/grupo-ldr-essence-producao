import { Link, Outlet, createFileRoute, useLocation, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { BookOpen, CalendarDays, ClipboardList, FileUp, GraduationCap, Home, Menu, MessageCircle, UserRound, X } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useClientContext } from "@/lib/client-portal-data";
import { LanguageSelect, useI18n } from "@/lib/i18n";
import { AcademyGiveawayBanner } from "@/components/academy-giveaway-banner";

export const Route = createFileRoute("/_clientarea/cliente")({ component: ClientShell });

type L="pt"|"en"|"fr"|"es";
const SHELL={
  pt:{area:"Minha Área",serviceArea:"Portal de Serviços",home:"Início",library:"Minha Biblioteca",training:"Treinamentos",agenda:"Minha agenda",orders:"Meus pedidos",sessions:"Atendimentos",contract:"Contratar e agendar",publish:"Publique na LDR Essence Academy",profile:"Meu perfil",ecosystem:"Ecossistema",entrepreneurs:"Treinamento para empreendedores",signout:"Sair",openMenu:"Abrir menu",navLabel:"Navegação da Minha Área",loading:"Carregando…",unavailable:"Acesso indisponível",blocked:"Seu acesso está temporariamente desativado. Fale com a equipe do Grupo LDR Essence.",missing:"Ainda não localizamos um cadastro de cliente vinculado a este e-mail. Use o mesmo e-mail informado na sua compra ou fale com a nossa equipe.",creatorTitle:"Tem um conteúdo para criar?",creatorText:"Publique seu eBook, livro, curso ou formação na LDR Essence Academy. Sem mensalidade. Você recebe 85% das vendas.",creatorButton:"QUERO PUBLICAR",personalTitle:"Monte sua biblioteca — Grátis",personalText:"Guarde seus PDFs em um só lugar. Seus arquivos são privados e ficam disponíveis apenas para você.",personalButton:"ADICIONAR MEUS PDFs",academicTitle:"Conecte-se. Compartilhe. Aprenda.",academicText:"Um espaço para estudantes, profissionais e pesquisadores criarem conexões, compartilharem conhecimento, participarem de desafios e ampliarem sua rede acadêmica.",academicButton:"ACESSAR REDE ACADÊMICA",homeTitle:"Explore a LDR Essence Academy",homeText:"Veja cursos, formações, livros, eBooks, revistas e publicações disponíveis na plataforma.",homeButton:"VER PÁGINA INICIAL"},
  en:{area:"My Area",serviceArea:"Services Portal",home:"Home",library:"My Library",training:"Training",agenda:"My schedule",orders:"My orders",sessions:"Appointments",contract:"Buy and schedule",publish:"Publish on LDR Essence Academy",profile:"My profile",ecosystem:"Ecosystem",entrepreneurs:"Entrepreneur training",signout:"Sign out",openMenu:"Open menu",navLabel:"My Area navigation",loading:"Loading…",unavailable:"Access unavailable",blocked:"Your access is temporarily disabled. Contact the Grupo LDR Essence team.",missing:"We could not find a client account linked to this email yet. Use the same email used for your purchase or contact our team.",creatorTitle:"Have content to create?",creatorText:"Publish your eBook, book, course or training on LDR Essence Academy. No monthly fee. You receive 85% of sales.",creatorButton:"I WANT TO PUBLISH",personalTitle:"Build your library — Free",personalText:"Keep your PDFs in one place. Your files are private and available only to you.",personalButton:"ADD MY PDFS",academicTitle:"Connect. Share. Learn.",academicText:"A space for students, professionals and researchers to build connections, share knowledge, take part in challenges and expand their academic network.",academicButton:"ACCESS ACADEMIC NETWORK",homeTitle:"Explore LDR Essence Academy",homeText:"See courses, training, books, eBooks, magazines and publications available on the platform.",homeButton:"VIEW HOME PAGE"},
  fr:{area:"Mon Espace",serviceArea:"Portail de Services",home:"Accueil",library:"Ma Bibliothèque",training:"Formations",agenda:"Mon agenda",orders:"Mes commandes",sessions:"Rendez-vous",contract:"Acheter et planifier",publish:"Publiez sur LDR Essence Academy",profile:"Mon profil",ecosystem:"Écosystème",entrepreneurs:"Formation pour entrepreneurs",signout:"Se déconnecter",openMenu:"Ouvrir le menu",navLabel:"Navigation de Mon Espace",loading:"Chargement…",unavailable:"Accès indisponible",blocked:"Votre accès est temporairement désactivé. Contactez l’équipe du Grupo LDR Essence.",missing:"Nous n’avons pas encore trouvé de compte client associé à cet e-mail. Utilisez le même e-mail que lors de votre achat ou contactez notre équipe.",creatorTitle:"Vous avez un contenu à créer ?",creatorText:"Publiez votre eBook, livre, cours ou formation sur LDR Essence Academy. Sans abonnement. Vous recevez 85 % des ventes.",creatorButton:"JE VEUX PUBLIER",personalTitle:"Créez votre bibliothèque — Gratuit",personalText:"Gardez vos PDF au même endroit. Vos fichiers sont privés et accessibles uniquement par vous.",personalButton:"AJOUTER MES PDF",academicTitle:"Connectez-vous. Partagez. Apprenez.",academicText:"Un espace pour les étudiants, professionnels et chercheurs afin de créer des connexions, partager des connaissances, participer à des défis et développer leur réseau académique.",academicButton:"ACCÉDER AU RÉSEAU ACADÉMIQUE",homeTitle:"Explorez LDR Essence Academy",homeText:"Découvrez les cours, formations, livres, eBooks, magazines et publications disponibles.",homeButton:"VOIR LA PAGE D’ACCUEIL"},
  es:{area:"Mi Área",serviceArea:"Portal de Servicios",home:"Inicio",library:"Mi Biblioteca",training:"Formaciones",agenda:"Mi agenda",orders:"Mis pedidos",sessions:"Atenciones",contract:"Comprar y agendar",publish:"Publica en LDR Essence Academy",profile:"Mi perfil",ecosystem:"Ecosistema",entrepreneurs:"Formación para emprendedores",signout:"Salir",openMenu:"Abrir menú",navLabel:"Navegación de Mi Área",loading:"Cargando…",unavailable:"Acceso no disponible",blocked:"Tu acceso está temporalmente desactivado. Contacta al equipo de Grupo LDR Essence.",missing:"Todavía no encontramos una cuenta de cliente vinculada a este correo. Usa el mismo correo de tu compra o contacta con nuestro equipo.",creatorTitle:"¿Tienes contenido para crear?",creatorText:"Publica tu eBook, libro, curso o formación en LDR Essence Academy. Sin mensualidad. Recibes el 85 % de las ventas.",creatorButton:"QUIERO PUBLICAR",personalTitle:"Crea tu biblioteca — Gratis",personalText:"Guarda tus PDF en un solo lugar. Tus archivos son privados y solo tú puedes acceder a ellos.",personalButton:"AÑADIR MIS PDF",academicTitle:"Conecta. Comparte. Aprende.",academicText:"Un espacio para estudiantes, profesionales e investigadores donde pueden crear conexiones, compartir conocimientos, participar en desafíos y ampliar su red académica.",academicButton:"ACCEDER A LA RED ACADÉMICA",homeTitle:"Explora LDR Essence Academy",homeText:"Consulta cursos, formaciones, libros, eBooks, revistas y publicaciones disponibles.",homeButton:"VER PÁGINA INICIAL"}
} as const;

function cameFromCorporateBenefits() {
  if (typeof document === "undefined") return false;
  try {
    const referrer = new URL(document.referrer);
    return /(^|\.)ldrrhestrategia\.com$/i.test(referrer.hostname) && referrer.pathname.replace(/\/$/, "") === "/beneficios-corporativos";
  } catch { return false; }
}

function isAcademyHost() {
  if (typeof window === "undefined") return false;
  return /(^|\.)ldracademy\.online$/i.test(window.location.hostname);
}

function isServicePortalHost() {
  if (typeof window === "undefined") return false;
  return /^portal\.ldrrhestrategia\.com$/i.test(window.location.hostname);
}

function ClientShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [menuOpen, setMenuOpen] = useState(false);
  const [academyHost, setAcademyHost] = useState(false);
  const [servicePortal, setServicePortal] = useState(false);
  const context = useClientContext();
  const {locale:raw}=useI18n();
  const locale=(raw==="en"||raw==="fr"||raw==="es"?raw:"pt") as L;
  const c=SHELL[locale];
  const defaultNav = [
    { to: "/cliente", label: c.home, exact: true, icon: Home },
    { to: "/cliente/biblioteca", label: c.library, icon: BookOpen, featured: true },
    { to: "/cliente/treinamentos", label: c.training, icon: GraduationCap },
    { to: "/cliente/agenda", label: c.agenda, icon: CalendarDays },
    { to: "/cliente/pedidos", label: c.orders, icon: ClipboardList },
    { to: "/cliente/contratar", label: c.contract, icon: MessageCircle },
    { to: "/cliente/perfil", label: c.profile, icon: UserRound },
  ] as const;
  const academyNav = [
    { to: "/cliente", label: c.home, exact: true, icon: Home },
    { to: "/cliente/biblioteca", label: c.library, icon: BookOpen, featured: true },
    { to: "/cliente/treinamentos", label: c.training, icon: GraduationCap },
    { to: "/cliente/publicar", label: c.publish, icon: FileUp },
    { to: "/cliente/perfil", label: c.profile, icon: UserRound },
  ] as const;
  const serviceNav = [
    { to: "/cliente", label: c.home, exact: true, icon: Home },
    { to: "/cliente/contratar", label: c.contract, icon: MessageCircle, featured: true },
    { to: "/cliente/agenda", label: c.agenda, icon: CalendarDays },
    { to: "/cliente/sessoes", label: c.sessions, icon: ClipboardList },
    { to: "/cliente/perfil", label: c.profile, icon: UserRound },
  ] as const;
  const NAV = servicePortal ? serviceNav : academyHost ? academyNav : defaultNav;

  useEffect(() => {
    if (cameFromCorporateBenefits()) {
      window.location.replace("/empresa");
      return;
    }

    const academy = isAcademyHost();
    const services = isServicePortalHost();
    setAcademyHost(academy);
    setServicePortal(services);
    if (academy && (location.pathname === "/cliente" || location.pathname === "/cliente/")) {
      window.location.replace("https://ldracademy.online/biblioteca");
    }
  }, [location.pathname]);
  useEffect(()=>{ if(typeof document!=="undefined") document.documentElement.lang=locale; },[locale]);

  async function handleSignOut() {
    await queryClient.cancelQueries(); queryClient.clear(); await supabase.auth.signOut();
    navigate({ to: "/cliente/login", replace: true });
  }

  const academicNetwork = location.pathname === "/cliente/rede-academica" || location.pathname.startsWith("/cliente/rede-academica/");
  const status = context.data?.status;
  const libraryHref = academyHost ? "/biblioteca" : "/cliente/biblioteca";
  const showLibraryActions = academyHost && location.pathname.replace(/\/+$/, "") === "/cliente/biblioteca";

  return (
    <div className="min-h-screen lg:flex" style={{ background: "var(--cream)" }}>
      {!academicNetwork && <aside className="no-print sticky top-0 z-40 text-primary-foreground lg:h-screen lg:w-72 lg:shrink-0" style={{ background: "linear-gradient(160deg, var(--wine-deep), var(--wine))" }}>
        <div className="flex items-center justify-between gap-3 px-4 py-4 lg:block">
          <div><p className="font-serif text-lg leading-tight">{academyHost ? "LDR Essence Academy" : "Grupo LDR Essence"}</p><p className="text-xs opacity-80">{servicePortal ? c.serviceArea : c.area}</p></div>
          <button type="button" className="rounded-lg border border-white/30 p-2 lg:hidden" onClick={() => setMenuOpen(v => !v)} aria-label={c.openMenu}>{menuOpen ? <X className="h-5 w-5"/> : <Menu className="h-5 w-5"/>}</button>
        </div>
        <nav className={`${menuOpen ? "block" : "hidden"} px-3 pb-4 lg:block`} aria-label={c.navLabel}>
          <ul className="space-y-1">
            {NAV.map((item) => {
              const Icon = item.icon;
              const isLibrary = item.to === "/cliente/biblioteca";
              const classes = `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${"featured" in item && item.featured ? "mb-2 bg-secondary text-secondary-foreground shadow-sm" : "hover:bg-white/10"}`;

              if (isLibrary && academyHost) {
                return <li key={item.to}><a href="/biblioteca" onClick={() => setMenuOpen(false)} className={classes}><Icon className="h-4 w-4" aria-hidden="true"/>{item.label}</a></li>;
              }

              return <li key={item.to}><Link to={item.to} activeOptions={{ exact: "exact" in item ? item.exact : false }} onClick={() => setMenuOpen(false)} className={classes} activeProps={{ className: "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold bg-white/15" }}><Icon className="h-4 w-4" aria-hidden="true"/>{item.label}</Link></li>;
            })}
          </ul>
          {!servicePortal ? <div className="mt-5 border-t border-white/20 pt-4"><p className="mb-2 text-xs font-bold uppercase tracking-wide opacity-70">{c.ecosystem}</p><a className="block rounded-lg px-3 py-2 text-sm hover:bg-white/10" href="https://ldrrhestrategia.com/" target="_blank" rel="noreferrer">Grupo LDR Essence</a></div> : null}
          <div className="mt-5 border-t border-white/20 pt-4"><LanguageSelect /><button type="button" onClick={handleSignOut} className="mt-3 w-full rounded-lg border border-white/30 px-3 py-2 text-sm font-bold">{c.signout}</button></div>
        </nav>
      </aside>}

      <div className="min-w-0 flex-1">
        <main className={academicNetwork?"mx-auto max-w-6xl":"mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8"}>
          {academicNetwork&&<div className="flex items-center justify-end gap-3 px-3 pt-2"><LanguageSelect/><button type="button" onClick={handleSignOut} className="min-h-10 rounded-xl border px-3 text-xs font-bold">{c.signout}</button></div>}
          {showLibraryActions ? <AcademyGiveawayBanner compact /> : null}
          {showLibraryActions ? <div className="mb-6 grid gap-3 lg:grid-cols-3">
            <section className="rounded-[24px] border border-[#d6ad63]/50 bg-[#071426] p-5 text-white shadow-sm">
              <p className="text-xs font-black uppercase tracking-[.18em] text-[#d6ad63]">LDR CREATORS</p><h2 className="mt-1 font-serif text-2xl">{c.creatorTitle}</h2><p className="mt-2 text-sm leading-6 text-white/75">{c.creatorText}</p>
              <Link to="/cliente/publicar" className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#d6ad63] px-5 py-3 text-sm font-black text-[#071426]">{c.creatorButton}</Link>
            </section>
            <section className="rounded-[24px] border border-emerald-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[.18em] text-emerald-700">MINHA BIBLIOTECA</p><h2 className="mt-1 font-serif text-2xl text-[#071426]">{c.personalTitle}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{c.personalText}</p>
              <Link to="/cliente/minha-biblioteca-pessoal" className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-700 px-5 py-3 text-sm font-black text-white">{c.personalButton}</Link>
            </section>
            <section className="rounded-[24px] border border-violet-200 bg-violet-50 p-5 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[.18em] text-violet-700">{locale==="pt"?"REDE ACADÊMICA":locale==="en"?"ACADEMIC NETWORK":locale==="fr"?"RÉSEAU ACADÉMIQUE":"RED ACADÉMICA"}</p><h2 className="mt-1 font-serif text-2xl text-[#071426]">{c.academicTitle}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{c.academicText}</p>
              <Link to="/cliente/rede-academica" className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-violet-700 px-5 py-3 text-sm font-black text-white transition hover:bg-violet-800">{c.academicButton}</Link>
            </section>
            <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[.18em] text-[#9a6b1f]">LDR ESSENCE ACADEMY</p><h2 className="mt-1 font-serif text-2xl text-[#071426]">{c.homeTitle}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{c.homeText}</p>
              <a href="https://ldracademy.online/" className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl border border-[#071426] px-5 py-3 text-sm font-black text-[#071426]">{c.homeButton}</a>
            </section>
          </div> : null}
          {context.isLoading ? <p className="text-sm text-muted-foreground">{c.loading}</p> : status === "ok" ? <Outlet /> : <section className="s8-card"><h1 className="font-serif text-2xl">{c.unavailable}</h1><p className="mt-2 text-sm text-muted-foreground">{status === "blocked" ? c.blocked : c.missing}</p><button type="button" onClick={handleSignOut} className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">{c.signout}</button></section>}
        </main>
      </div>

      {!servicePortal && !academicNetwork ? <div
        className="no-print fixed z-[90]"
        style={{ bottom: "calc(7.5rem + env(safe-area-inset-bottom))", right: "calc(1rem + env(safe-area-inset-right))" }}
      >
        <a
          href={libraryHref}
          aria-label={c.library}
          className="inline-flex min-h-12 items-center gap-2 rounded-full bg-emerald-700 px-5 py-3 text-sm font-black text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
        >
          <BookOpen className="h-5 w-5" aria-hidden="true" />
          {c.library}
        </a>
      </div> : null}
    </div>
  );
}

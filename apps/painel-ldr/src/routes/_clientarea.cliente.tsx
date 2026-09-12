import { Link, Outlet, createFileRoute, useLocation, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { BookOpen, CalendarDays, ClipboardList, GraduationCap, Home, Menu, MessageCircle, UserRound, X } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useClientContext } from "@/lib/client-portal-data";
import { LanguageSelect, useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_clientarea/cliente")({ component: ClientShell });

type L="pt"|"en"|"fr"|"es";
const SHELL={
  pt:{area:"Minha Área",home:"Início",library:"Minha Biblioteca",training:"Treinamentos",agenda:"Minha agenda",orders:"Meus pedidos",contract:"Contratar e agendar",profile:"Meu perfil",ecosystem:"Ecossistema",entrepreneurs:"Treinamento para empreendedores",signout:"Sair",openMenu:"Abrir menu",navLabel:"Navegação da Minha Área",loading:"Carregando…",unavailable:"Acesso indisponível",blocked:"Seu acesso está temporariamente desativado. Fale com a equipe do Grupo LDR Essence.",missing:"Ainda não localizamos um cadastro de cliente vinculado a este e-mail. Use o mesmo e-mail informado na sua compra ou fale com a nossa equipe."},
  en:{area:"My Area",home:"Home",library:"My Library",training:"Training",agenda:"My schedule",orders:"My orders",contract:"Buy and schedule",profile:"My profile",ecosystem:"Ecosystem",entrepreneurs:"Entrepreneur training",signout:"Sign out",openMenu:"Open menu",navLabel:"My Area navigation",loading:"Loading…",unavailable:"Access unavailable",blocked:"Your access is temporarily disabled. Contact the Grupo LDR Essence team.",missing:"We could not find a client account linked to this email yet. Use the same email used for your purchase or contact our team."},
  fr:{area:"Mon Espace",home:"Accueil",library:"Ma Bibliothèque",training:"Formations",agenda:"Mon agenda",orders:"Mes commandes",contract:"Acheter et planifier",profile:"Mon profil",ecosystem:"Écosystème",entrepreneurs:"Formation pour entrepreneurs",signout:"Se déconnecter",openMenu:"Ouvrir le menu",navLabel:"Navigation de Mon Espace",loading:"Chargement…",unavailable:"Accès indisponible",blocked:"Votre accès est temporairement désactivé. Contactez l’équipe du Grupo LDR Essence.",missing:"Nous n’avons pas encore trouvé de compte client associé à cet e-mail. Utilisez le même e-mail que lors de votre achat ou contactez notre équipe."},
  es:{area:"Mi Área",home:"Inicio",library:"Mi Biblioteca",training:"Formaciones",agenda:"Mi agenda",orders:"Mis pedidos",contract:"Comprar y agendar",profile:"Mi perfil",ecosystem:"Ecosistema",entrepreneurs:"Formación para emprendedores",signout:"Salir",openMenu:"Abrir menú",navLabel:"Navegación de Mi Área",loading:"Cargando…",unavailable:"Acceso no disponible",blocked:"Tu acceso está temporalmente desactivado. Contacta al equipo de Grupo LDR Essence.",missing:"Todavía no encontramos una cuenta de cliente vinculada a este correo. Usa el mismo correo de tu compra o contacta a nuestro equipo."}
} as const;

function cameFromCorporateBenefits() {
  if (typeof document === "undefined") return false;
  try {
    const referrer = new URL(document.referrer);
    return /(^|\.)ldrrhestrategia\.com$/i.test(referrer.hostname) && referrer.pathname.replace(/\/$/, "") === "/beneficios-corporativos";
  } catch { return false; }
}

function ClientShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [menuOpen, setMenuOpen] = useState(false);
  const context = useClientContext();
  const {locale:raw}=useI18n();
  const locale=(raw==="en"||raw==="fr"||raw==="es"?raw:"pt") as L;
  const c=SHELL[locale];
  const NAV = [
    { to: "/cliente", label: c.home, exact: true, icon: Home },
    { to: "/cliente/biblioteca", label: c.library, icon: BookOpen, featured: true },
    { to: "/cliente/treinamentos", label: c.training, icon: GraduationCap },
    { to: "/cliente/agenda", label: c.agenda, icon: CalendarDays },
    { to: "/cliente/pedidos", label: c.orders, icon: ClipboardList },
    { to: "/cliente/contratar", label: c.contract, icon: MessageCircle },
    { to: "/cliente/perfil", label: c.profile, icon: UserRound },
  ] as const;

  useEffect(() => {
    if (cameFromCorporateBenefits()) window.location.replace("/empresa");
  }, []);
  useEffect(()=>{ if(typeof document!=="undefined") document.documentElement.lang=locale; },[locale]);

  async function handleSignOut() {
    await queryClient.cancelQueries(); queryClient.clear(); await supabase.auth.signOut();
    navigate({ to: "/cliente/login", replace: true });
  }

  const status = context.data?.status;
  return (
    <div className="min-h-screen lg:flex" style={{ background: "var(--cream)" }}>
      <aside className="no-print sticky top-0 z-40 text-primary-foreground lg:h-screen lg:w-72 lg:shrink-0" style={{ background: "linear-gradient(160deg, var(--wine-deep), var(--wine))" }}>
        <div className="flex items-center justify-between gap-3 px-4 py-4 lg:block">
          <div><p className="font-serif text-lg leading-tight">Grupo LDR Essence</p><p className="text-xs opacity-80">{c.area}</p></div>
          <button type="button" className="rounded-lg border border-white/30 p-2 lg:hidden" onClick={() => setMenuOpen(v => !v)} aria-label={c.openMenu}>{menuOpen ? <X className="h-5 w-5"/> : <Menu className="h-5 w-5"/>}</button>
        </div>
        <nav className={`${menuOpen ? "block" : "hidden"} px-3 pb-4 lg:block`} aria-label={c.navLabel}>
          <ul className="space-y-1">
            {NAV.map((item) => { const Icon = item.icon; return <li key={item.to}><Link to={item.to} activeOptions={{ exact: "exact" in item ? item.exact : false }} onClick={() => setMenuOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${"featured" in item && item.featured ? "mb-2 bg-secondary text-secondary-foreground shadow-sm" : "hover:bg-white/10"}`} activeProps={{ className: "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold bg-white/15" }}><Icon className="h-4 w-4" aria-hidden="true"/>{item.label}</Link></li>; })}
          </ul>
          <div className="mt-5 border-t border-white/20 pt-4"><p className="mb-2 text-xs font-bold uppercase tracking-wide opacity-70">{c.ecosystem}</p><a className="block rounded-lg px-3 py-2 text-sm hover:bg-white/10" href="https://ldrrhestrategia.com/" target="_blank" rel="noreferrer">Grupo LDR Essence</a><a className="block rounded-lg px-3 py-2 text-sm hover:bg-white/10" href={`https://ldrrhestrategia.com/treinamento?lang=${locale}`} target="_blank" rel="noreferrer">{c.entrepreneurs}</a></div>
          <div className="mt-5 border-t border-white/20 pt-4"><LanguageSelect /><button type="button" onClick={handleSignOut} className="mt-3 w-full rounded-lg border border-white/30 px-3 py-2 text-sm font-bold">{c.signout}</button></div>
        </nav>
      </aside>

      <div className="min-w-0 flex-1">
        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          {context.isLoading ? <p className="text-sm text-muted-foreground">{c.loading}</p> : status === "ok" ? <Outlet /> : <section className="s8-card"><h1 className="font-serif text-2xl">{c.unavailable}</h1><p className="mt-2 text-sm text-muted-foreground">{status === "blocked" ? c.blocked : c.missing}</p><button type="button" onClick={handleSignOut} className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">{c.signout}</button></section>}
        </main>
      </div>

      <div className="fixed z-50 flex flex-col items-end gap-2" style={{ bottom: "calc(5rem + env(safe-area-inset-bottom))", right: "calc(1rem + env(safe-area-inset-right))" }}>
        <Link to="/cliente/biblioteca" className="rounded-full bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-lg">{c.library}</Link>
      </div>
    </div>
  );
}

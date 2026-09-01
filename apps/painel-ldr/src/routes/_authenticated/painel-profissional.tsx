import { useQueryClient } from "@tanstack/react-query";
import { Link, Outlet, createFileRoute, useNavigate, useRouterState } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { logAuthEvent } from "@/lib/access.functions";
import { useAccess } from "@/lib/central-data";
import { LanguageSelect, useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/painel-profissional")({ component: CentralLayout });

const PROFESSIONAL_NAV = [
  { to: "/painel-profissional", key: "nav.overview", exact: true },
  { to: "/painel-profissional/pedidos", key: "nav.orders" },
  { to: "/painel-profissional/agenda", key: "nav.agenda" },
  { to: "/painel-profissional/clientes", key: "nav.customers" },
  { to: "/painel-profissional/mentoria", key: "nav.mentorship" },
  { to: "/painel-profissional/s8", key: "nav.s8" },
  { to: "/painel-profissional/notificacoes", extra: "notifications" },
  { to: "/painel-profissional/treinamentos", extra: "training" },
  { to: "/painel-profissional/comentarios", extra: "comments" },
] as const;

const ADMIN_NAV = [
  { to: "/painel-profissional/empresas", extra: "companies" },
  { to: "/painel-profissional/rede-profissionais", extra: "network" },
  { to: "/painel-profissional/rede-servicos", extra: "networkServices" },
  { to: "/painel-profissional/rede-planos", extra: "networkPlans" },
  { to: "/painel-profissional/rede-profissionais-financeiro", extra: "networkFinance" },
  { to: "/painel-profissional/rede-profissionais-repasses", extra: "networkPayouts" },
  { to: "/painel-profissional/rede-profissionais-conformidade", extra: "networkCompliance" },
  { to: "/painel-profissional/rede-profissionais-conteudo", extra: "networkContent" },
  { to: "/painel-profissional/rede-avaliacoes", extra: "networkReviews" },
  { to: "/painel-profissional/equipe", key: "nav.team" },
  { to: "/painel-profissional/entregas", key: "nav.deliveries" },
  { to: "/painel-profissional/catalogo", key: "nav.catalog" },
  { to: "/painel-profissional/psicanalise", key: "nav.clinical" },
  { to: "/painel-profissional/acessos", key: "nav.access" },
] as const;

const ADMIN_PATHS = ADMIN_NAV.map((item) => item.to);

const COPY = {
  pt: { companies: "Empresas / Funcionários", network: "Rede de Profissionais", networkServices: "Rede · Serviços", networkPlans: "Rede · Planos", networkFinance: "Rede · Financeiro", networkPayouts: "Rede · Repasses", networkCompliance: "Rede · Conformidade", networkContent: "Rede · Treinamentos / Comunidade", networkReviews: "Rede · Avaliações", notifications: "Notificações", training: "Treinamentos / Conteúdos", comments: "Comentários / Fórum", profile: "perfil", denied: "Sua conta não possui autorização para acessar o Painel do Profissional.", adminDenied: "Esta área administrativa é exclusiva do Painel Master LDR.", master: "Painel Master LDR" },
  en: { companies: "Companies / Employees", network: "Professional Network", networkServices: "Network · Services", networkPlans: "Network · Plans", networkFinance: "Network · Finance", networkPayouts: "Network · Payouts", networkCompliance: "Network · Compliance", networkContent: "Network · Training / Community", networkReviews: "Network · Reviews", notifications: "Notifications", training: "Training / Content", comments: "Comments / Forum", profile: "role", denied: "Your account is not authorized to access the Professional Panel.", adminDenied: "This administrative area is exclusive to the LDR Master Panel.", master: "LDR Master Panel" },
  fr: { companies: "Entreprises / Collaborateurs", network: "Réseau de Professionnels", networkServices: "Réseau · Services", networkPlans: "Réseau · Plans", networkFinance: "Réseau · Finance", networkPayouts: "Réseau · Reversements", networkCompliance: "Réseau · Conformité", networkContent: "Réseau · Formations / Communauté", networkReviews: "Réseau · Avis", notifications: "Notifications", training: "Formations / Contenus", comments: "Commentaires / Forum", profile: "profil", denied: "Votre compte n’est pas autorisé à accéder au Panneau Professionnel.", adminDenied: "Cette zone administrative est réservée au Panneau Master LDR.", master: "Panneau Master LDR" },
  es: { companies: "Empresas / Empleados", network: "Red de Profesionales", networkServices: "Red · Servicios", networkPlans: "Red · Planes", networkFinance: "Red · Finanzas", networkPayouts: "Red · Pagos", networkCompliance: "Red · Cumplimiento", networkContent: "Red · Formación / Comunidad", networkReviews: "Red · Opiniones", notifications: "Notificaciones", training: "Formaciones / Contenidos", comments: "Comentarios / Foro", profile: "perfil", denied: "Tu cuenta no está autorizada para acceder al Panel Profesional.", adminDenied: "Esta área administrativa es exclusiva del Panel Master LDR.", master: "Panel Master LDR" },
} as const;

function CentralLayout() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const queryClient = useQueryClient();
  const logEvent = useServerFn(logAuthEvent);
  const access = useAccess();
  const { t, locale } = useI18n();
  const copy = COPY[locale];
  const [menuOpen, setMenuOpen] = useState(false);

  async function signOut() {
    try { await logEvent({ data: { action: "logout" } }); } catch { /* auditoria não bloqueia saída */ }
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/profissional/login", replace: true });
  }

  if (access.isLoading) return <div className="min-h-screen p-6"><div className="s8-card mx-auto max-w-md text-center">{t("state.loading")}</div></div>;

  const isSuperadmin = access.data?.authorized && access.data.role === "superadmin";
  const isProfessional = access.data?.authorized && access.data.role === "colaborador";

  if (!isSuperadmin && !isProfessional) return <div className="min-h-screen p-6"><div className="s8-card mx-auto max-w-md text-center"><h1 className="font-serif text-3xl">403</h1><p className="mt-2 text-sm text-muted-foreground">{copy.denied}</p><button type="button" onClick={signOut} className="mt-5 rounded-lg bg-primary px-5 py-3 font-bold text-primary-foreground">{t("action.signout")}</button></div></div>;

  const isAdminPath = ADMIN_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  if (isProfessional && isAdminPath) return <div className="min-h-screen p-6"><div className="s8-card mx-auto max-w-md text-center"><h1 className="font-serif text-3xl">403</h1><p className="mt-2 text-sm text-muted-foreground">{copy.adminDenied}</p><Link to="/painel-profissional" className="mt-5 inline-flex rounded-lg bg-primary px-5 py-3 font-bold text-primary-foreground">Voltar ao painel</Link></div></div>;

  const professionalItems = PROFESSIONAL_NAV.map((item) => ({ ...item, label: "key" in item ? t(item.key) : copy[item.extra] }));
  const adminItems = ADMIN_NAV.map((item) => ({ ...item, label: "key" in item ? t(item.key) : copy[item.extra] }));
  const items = isSuperadmin
    ? [{ to: "/admin", label: copy.master }, ...professionalItems, ...adminItems]
    : professionalItems;

  return <div className="min-h-screen lg:flex">
    <aside className="no-print sticky top-0 z-30 lg:h-screen lg:w-64 lg:shrink-0 lg:overflow-y-auto" style={{background:"linear-gradient(160deg, var(--wine-deep), var(--wine))",color:"var(--primary-foreground)"}}>
      <div className="flex items-center justify-between gap-3 px-4 py-4 lg:block"><div className="min-w-0"><p className="break-words font-serif text-lg leading-tight">{t("brand.name")}</p><p className="break-words text-xs opacity-80">{t("brand.panel")}</p></div><button type="button" aria-label={t("nav.menu")} className="shrink-0 rounded-lg border border-white/30 px-3 py-2 text-sm font-bold lg:hidden" aria-expanded={menuOpen} onClick={()=>setMenuOpen(v=>!v)}>☰</button></div>
      <nav className={`${menuOpen?"block":"hidden"} max-h-[calc(100vh-4rem)] overflow-y-auto px-3 pb-4 lg:block lg:max-h-none lg:overflow-visible`}>
        <ul className="space-y-1">{items.map(item=><li key={item.to}><Link to={item.to} activeOptions={{exact:"exact" in item?Boolean(item.exact):false}} onClick={()=>setMenuOpen(false)} className="block break-words rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-white/10" activeProps={{className:"block break-words rounded-lg px-3 py-2.5 text-sm font-bold bg-secondary text-secondary-foreground"}}>{item.label}</Link></li>)}</ul>
        <div className="mt-5 border-t border-white/20 pt-4"><LanguageSelect /></div>
        <div className="mt-5 border-t border-white/20 pt-4 text-xs"><p className="break-all font-bold">{access.data?.fullName ?? access.data?.email}</p><p className="mt-1 opacity-80">{copy.profile} {isSuperadmin ? "superadmin" : "profissional"}</p><button type="button" onClick={signOut} className="mt-3 w-full rounded-lg border border-white/30 px-3 py-2 text-sm font-bold">{t("action.signout")}</button></div>
      </nav>
    </aside>
    <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8"><div className="mx-auto max-w-6xl"><Outlet /></div></main>
  </div>;
}

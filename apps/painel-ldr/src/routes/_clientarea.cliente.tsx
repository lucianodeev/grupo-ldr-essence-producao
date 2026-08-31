import { Link, Outlet, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { BookOpen, CalendarDays, ClipboardList, GraduationCap, Home, Menu, MessageCircle, UserRound, X } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useClientContext } from "@/lib/client-portal-data";
import { LanguageSelect } from "@/lib/i18n";

export const Route = createFileRoute("/_clientarea/cliente")({ component: ClientShell });

const NAV = [
  { to: "/cliente", label: "Início", exact: true, icon: Home },
  { to: "/cliente/biblioteca", label: "Minha Biblioteca", icon: BookOpen, featured: true },
  { to: "/cliente/treinamentos", label: "Treinamentos e Fórum", icon: GraduationCap },
  { to: "/cliente/agenda", label: "Minha agenda", icon: CalendarDays },
  { to: "/cliente/pedidos", label: "Meus pedidos", icon: ClipboardList },
  { to: "/cliente/contratar", label: "Contratar e agendar", icon: MessageCircle },
  { to: "/cliente/perfil", label: "Meu perfil", icon: UserRound },
] as const;

const WHATSAPP_URL = "https://wa.me/32492923605?text=Ola%2C%20preciso%20de%20ajuda%20na%20Area%20do%20Cliente%20do%20Grupo%20LDR%20Essence";

function cameFromCorporateBenefits() {
  if (typeof document === "undefined") return false;
  try {
    const referrer = new URL(document.referrer);
    return (
      /(^|\.)ldrrhestrategia\.com$/i.test(referrer.hostname) &&
      referrer.pathname.replace(/\/$/, "") === "/beneficios-corporativos"
    );
  } catch {
    return false;
  }
}

function ClientShell() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [menuOpen, setMenuOpen] = useState(false);
  const context = useClientContext();

  useEffect(() => {
    if (cameFromCorporateBenefits()) {
      window.location.replace("/empresa");
    }
  }, []);

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/cliente/login", replace: true });
  }

  const status = context.data?.status;

  return (
    <div className="min-h-screen lg:flex" style={{ background: "var(--cream)" }}>
      <aside className="no-print sticky top-0 z-40 text-primary-foreground lg:h-screen lg:w-72 lg:shrink-0" style={{ background: "linear-gradient(160deg, var(--wine-deep), var(--wine))" }}>
        <div className="flex items-center justify-between gap-3 px-4 py-4 lg:block">
          <div><p className="font-serif text-lg leading-tight">Grupo LDR Essence</p><p className="text-xs opacity-80">Área do Cliente</p></div>
          <button type="button" className="rounded-lg border border-white/30 p-2 lg:hidden" onClick={() => setMenuOpen(v => !v)} aria-label="Abrir menu">{menuOpen ? <X className="h-5 w-5"/> : <Menu className="h-5 w-5"/>}</button>
        </div>
        <nav className={`${menuOpen ? "block" : "hidden"} px-3 pb-4 lg:block`} aria-label="Navegação da área do cliente">
          <ul className="space-y-1">
            {NAV.map((item) => { const Icon = item.icon; return <li key={item.to}><Link to={item.to} activeOptions={{ exact: "exact" in item ? item.exact : false }} onClick={() => setMenuOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${"featured" in item && item.featured ? "mb-2 bg-secondary text-secondary-foreground shadow-sm" : "hover:bg-white/10"}`} activeProps={{ className: "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold bg-white/15" }}><Icon className="h-4 w-4" aria-hidden="true"/>{item.label}</Link></li>; })}
          </ul>
          <div className="mt-5 border-t border-white/20 pt-4"><p className="mb-2 text-xs font-bold uppercase tracking-wide opacity-70">Ecossistema</p><a className="block rounded-lg px-3 py-2 text-sm hover:bg-white/10" href="https://ldrrhestrategia.com/" target="_blank" rel="noreferrer">Grupo LDR Essence</a><a className="block rounded-lg px-3 py-2 text-sm hover:bg-white/10" href="https://www.lucianoempreendedor.com/" target="_blank" rel="noreferrer">Para empreendedores</a></div>
          <div className="mt-5 border-t border-white/20 pt-4"><LanguageSelect /><button type="button" onClick={handleSignOut} className="mt-3 w-full rounded-lg border border-white/30 px-3 py-2 text-sm font-bold">Sair</button></div>
        </nav>
      </aside>

      <div className="min-w-0 flex-1">
        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          {context.isLoading ? <p className="text-sm text-muted-foreground">Carregando…</p> : status === "ok" ? <Outlet /> : <section className="s8-card"><h1 className="font-serif text-2xl">Acesso indisponível</h1><p className="mt-2 text-sm text-muted-foreground">{status === "blocked" ? "Seu acesso está temporariamente desativado. Fale com a equipe do Grupo LDR Essence." : "Ainda não localizamos um cadastro de cliente vinculado a este e-mail. Use o mesmo e-mail informado na sua compra ou fale com a nossa equipe."}</p><button type="button" onClick={handleSignOut} className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">Sair</button></section>}
        </main>
      </div>

      <div className="fixed bottom-5 right-4 z-50 flex flex-col items-end gap-2 sm:right-6">
        <Link to="/cliente/biblioteca" className="rounded-full bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-lg">Minha Biblioteca</Link>
        <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="rounded-full bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-lg">WhatsApp</a>
      </div>
    </div>
  );
}

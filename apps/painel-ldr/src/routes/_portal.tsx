import { Link, Outlet, createFileRoute, redirect, useRouterState } from "@tanstack/react-router";
import { CreditCard, Building2 } from "lucide-react";
import { getClientAuthState } from "@/integrations/supabase/session.functions";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_portal")({
  beforeLoad: async ({ location }) => {
    const auth = await getClientAuthState();
    if (!auth.authenticated) {
      const path = location.pathname;
      const destination = path === "/empresa" || path.startsWith("/empresa/") || path === "/assinatura-empresa"
        ? "/empresa/login"
        : path === "/funcionario" || path.startsWith("/funcionario/")
          ? "/funcionario/login"
          : "/acesso";
      throw redirect({ to: destination });
    }
  },
  component: PortalLayout,
});

function PortalLayout() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { locale } = useI18n();
  const labels = {
    pt: { company: "Painel da Empresa", plans: "Assinatura e planos" },
    en: { company: "Company Dashboard", plans: "Subscription and plans" },
    fr: { company: "Espace Entreprise", plans: "Abonnement et forfaits" },
    es: { company: "Panel de Empresa", plans: "Suscripción y planes" },
  }[locale];
  const companyArea = pathname === "/empresa" || pathname === "/assinatura-empresa";
  return <>
    {companyArea && <div className="border-b bg-card"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-end gap-2 px-4 py-2 sm:px-6">
      <Link to="/empresa" className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-black ${pathname === "/empresa" ? "bg-primary text-primary-foreground" : "border text-primary"}`}><Building2 className="h-4 w-4"/>{labels.company}</Link>
      <Link to="/assinatura-empresa" className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-black ${pathname === "/assinatura-empresa" ? "bg-primary text-primary-foreground" : "border text-primary"}`}><CreditCard className="h-4 w-4"/>{labels.plans}</Link>
    </div></div>}
    <Outlet />
  </>;
}

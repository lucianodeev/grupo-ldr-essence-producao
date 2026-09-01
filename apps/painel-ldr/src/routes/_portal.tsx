import { Outlet, createFileRoute, redirect, useRouterState } from "@tanstack/react-router";
import { CreditCard, Building2 } from "lucide-react";
import { getClientAuthState } from "@/integrations/supabase/session.functions";

export const Route = createFileRoute("/_portal")({
  beforeLoad: async () => {
    const auth = await getClientAuthState();
    if (!auth.authenticated) throw redirect({ to: "/acesso" });
  },
  component: PortalLayout,
});

function PortalLayout() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const companyArea = pathname === "/empresa" || pathname === "/assinatura-empresa";
  return <>
    {companyArea && <div className="border-b bg-card"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-end gap-2 px-4 py-2 sm:px-6">
      <a href="/empresa" className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-black ${pathname === "/empresa" ? "bg-primary text-primary-foreground" : "border text-primary"}`}><Building2 className="h-4 w-4"/>Painel da Empresa</a>
      <a href="/assinatura-empresa" className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-black ${pathname === "/assinatura-empresa" ? "bg-primary text-primary-foreground" : "border text-primary"}`}><CreditCard className="h-4 w-4"/>Assinatura e planos</a>
    </div></div>}
    <Outlet />
  </>;
}

import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { getClientAuthState } from "@/integrations/supabase/session.functions";

export const Route = createFileRoute("/_portal")({
  beforeLoad: async () => {
    const auth = await getClientAuthState();
    if (!auth.authenticated) throw redirect({ to: "/acesso" });
  },
  component: () => <Outlet />,
});

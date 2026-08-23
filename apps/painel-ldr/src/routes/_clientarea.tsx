import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

import { getClientAuthState } from "@/integrations/supabase/session.functions";

export const Route = createFileRoute("/_clientarea")({
  beforeLoad: async () => {
    const auth = await getClientAuthState();
    if (!auth.authenticated) {
      throw redirect({ to: "/cliente/login" });
    }
  },
  component: () => <Outlet />,
});

import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      const professionalArea = location.pathname === "/painel-profissional" || location.pathname.startsWith("/painel-profissional/");
      const loginPath = professionalArea ? "/profissional/login" : "/login";
      if (typeof window !== "undefined" && loginPath === "/login") {
        window.location.replace(loginPath);
        await new Promise<never>(() => {});
      }
      throw redirect({ to: loginPath });
    }
  },
  component: () => <Outlet />,
});

import { Outlet, createFileRoute, redirect, useLocation } from "@tanstack/react-router";

import { FreeContentAds } from "@/components/free-content-ads";
import { LegacyTrainingProjectPanel } from "@/components/legacy-training-project-panel";
import { getClientAuthState } from "@/integrations/supabase/session.functions";

export const Route = createFileRoute("/_clientarea")({
  beforeLoad: async () => {
    const auth = await getClientAuthState();
    if (!auth.authenticated) {
      throw redirect({ to: "/cliente/login" });
    }
  },
  component: ClientAreaLayout,
});

const PROJECT_ROUTE_MAP={
  "/cliente/treinamentos/psicanalise":"formacao-psicanalise",
  "/cliente/treinamentos/terapia-breve-psicanalitica":"formacao-terapia-breve-psicanalitica",
  "/cliente/treinamentos/massoterapia":"formacao-completa-massoterapia",
  "/cliente/treinamentos/mentoria-carreira":"formacao-mentoria-profissional-carreira",
  "/cliente/treinamentos/lideranca-gestao":"formacao-lideranca-gestao-pessoas",
} as const;

function ClientAreaLayout() {
  const location=useLocation();
  const pathname=location.pathname.replace(/\/+$/,"")||"/";
  const projectSlug=PROJECT_ROUTE_MAP[pathname as keyof typeof PROJECT_ROUTE_MAP];
  return (
    <>
      <Outlet />
      {projectSlug ? <LegacyTrainingProjectPanel slug={projectSlug}/> : null}
      <FreeContentAds placement="bottom" />
    </>
  );
}

import { Outlet, createFileRoute, redirect, useLocation } from "@tanstack/react-router";
import type { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

import { AcademyAccessibilityControls } from "@/components/academy-accessibility-controls";
import { academicLoginHref, academicReturnPath } from "@/lib/academic-login-return";
import { FreeContentAds } from "@/components/free-content-ads";
import { LegacyTrainingProjectPanel } from "@/components/legacy-training-project-panel";
import { supabase } from "@/integrations/supabase/client";
import { getClientAuthState } from "@/integrations/supabase/session.functions";

async function syncSession(session: Session) {
  const response = await fetch("/api/auth/session-sync", {
    method: "POST",
    credentials: "include",
    cache: "no-store",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    }),
  });
  return response.ok;
}

export const Route = createFileRoute("/_clientarea")({
  head: () => ({ meta: [{ name: "robots", content: "noindex,nofollow" }] }),
  beforeLoad: async ({ location }) => {
    if (typeof window === "undefined") return;

    const auth = await getClientAuthState();
    if (auth.authenticated) return;

    const { data } = await supabase.auth.getSession();
    if (data.session && (await syncSession(data.session))) return;

    const next = academicReturnPath(location.href);
    throw redirect({ to: "/cliente/login", search: next ? { next } : {} });
  },
  component: ClientAreaLayout,
});

const PROJECT_ROUTE_MAP={
  "/cliente/treinamentos/psicanalise":"formacao-psicanalise",
  "/cliente/treinamentos/terapia-breve-psicanalitica":"formacao-terapia-breve-psicanalitica",
  "/cliente/treinamentos/massoterapia":"formacao-completa-massoterapia",
  "/cliente/treinamentos/mentoria-carreira":"formacao-mentoria-profissional-carreira",
  "/cliente/treinamentos/lideranca-gestao":"formacao-lideranca-gestao-pessoas",
  "/cliente/treinamentos/psicanalise-internacional":"psicanalise-internacional-neurodiversidade-autismo",
  "/cliente/formacoes/gestao-pessoas-rh":"formacao-gratuita-gestao-pessoas-rh",
} as const;

function isProductRoute(pathname:string){
  if(pathname==="/cliente/rede-academica"||pathname.startsWith("/cliente/rede-academica/"))return true;
  if(pathname.startsWith("/cliente/treinamentos/"))return true;
  if(pathname.startsWith("/cliente/cursos/"))return true;
  if(pathname.startsWith("/cliente/formacoes/"))return true;
  if(pathname.startsWith("/cliente/psicanalista-alta-performance"))return true;
  if(pathname==="/cliente/biblioteca/curso-gratuito-carreira")return true;
  return false;
}

function ClientAreaLayout() {
  const location=useLocation();
  const pathname=location.pathname.replace(/\/+$/,"")||"/";
  const projectSlug=PROJECT_ROUTE_MAP[pathname as keyof typeof PROJECT_ROUTE_MAP];
  const showProductAccessibility=isProductRoute(pathname);
  const [ready,setReady]=useState(false);
  const [failed,setFailed]=useState(false);

  useEffect(()=>{
    let active=true;
    const prepare=async()=>{
      try{
        const serverAuth=await getClientAuthState();
        if(!active)return;
        if(serverAuth.authenticated){setReady(true);return;}

        const {data}=await supabase.auth.getSession();
        if(!active)return;
        if(!data.session){window.location.replace(academicLoginHref(window.location.pathname+window.location.search+window.location.hash));return;}

        const ok=await syncSession(data.session);
        if(!active)return;
        if(!ok){setFailed(true);return;}

        const verified=await getClientAuthState();
        if(!active)return;
        if(!verified.authenticated){setFailed(true);return;}
        setReady(true);
      }catch{
        if(active)setFailed(true);
      }
    };
    void prepare();
    return()=>{active=false};
  },[]);

  if(failed){
    return <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6"><section className="s8-card"><p className="font-semibold">Não foi possível validar sua sessão.</p><button type="button" onClick={()=>window.location.replace(academicLoginHref(window.location.pathname+window.location.search+window.location.hash))} className="mt-4 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground">Entrar novamente</button></section></main>;
  }

  if(!ready){
    return <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6"><section className="s8-card">Validando acesso…</section></main>;
  }

  return (
    <div className="academy-accessibility-shell">
      <AcademyAccessibilityControls key={pathname} visible={showProductAccessibility} inline />
      <Outlet />
      {projectSlug ? <LegacyTrainingProjectPanel slug={projectSlug}/> : null}
      <FreeContentAds placement="bottom" />
    </div>
  );
}

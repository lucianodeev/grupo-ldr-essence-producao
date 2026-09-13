import { Outlet, createFileRoute, redirect, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/app-header";
import { NotificationCenter } from "@/components/notification-center";
import { supabase } from "@/integrations/supabase/client";
import { LegacyTrainingProjectPanel } from "@/components/legacy-training-project-panel";
import type { LegacyProjectSlug } from "@/lib/legacy-training-projects.server";

async function getClientAuthState() {
  const response = await fetch("/api/auth/session", { credentials: "include" });
  return response.ok;
}

async function syncSession(session: { access_token: string; refresh_token: string }) {
  const response = await fetch("/api/auth/session-sync", {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ accessToken: session.access_token, refreshToken: session.refresh_token }),
  });
  return response.ok;
}

export const Route = createFileRoute("/_clientarea")({
  beforeLoad: async () => {
    // A browser session can be valid before its SSR cookie has been repaired.
    // Do not redirect during SSR in that case: the client gate below syncs the
    // browser session first. Protected serverFns remain independently guarded.
    if (typeof window === "undefined") return;

    const auth = await getClientAuthState();
    if (auth.authenticated) return;

    const { data } = await supabase.auth.getSession();
    if (data.session && (await syncSession(data.session))) return;

    throw redirect({ to: "/cliente/login" });
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

function ClientAreaLayout() {
  const location=useLocation();
  const pathname=location.pathname.replace(/\/+$/,"")||"/";
  const projectSlug=PROJECT_ROUTE_MAP[pathname as keyof typeof PROJECT_ROUTE_MAP] as LegacyProjectSlug|undefined;
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
        if(data.session&&await syncSession(data.session)){setReady(true);return;}
      }catch(error){console.warn("client session preparation failed",error);}
      if(active)setFailed(true);
    };
    void prepare();
    return()=>{active=false};
  },[]);

  if(failed)return <div className="min-h-screen bg-background"><AppHeader/><main className="mx-auto max-w-xl px-4 py-16 text-center"><h1 className="font-serif text-3xl text-[#0b2341]">Sua sessão precisa ser atualizada</h1><p className="mt-3 text-sm text-muted-foreground">Entre novamente para continuar acessando seus conteúdos.</p><a href="/cliente/login" className="mt-6 inline-flex rounded-xl bg-[#0b2341] px-5 py-3 text-sm font-black text-white">ENTRAR NOVAMENTE</a></main></div>;
  if(!ready)return <div className="min-h-screen bg-background"><AppHeader/><main className="mx-auto max-w-5xl px-4 py-12"><p className="text-sm text-muted-foreground">Preparando sua área…</p></main></div>;

  return <div className="min-h-screen bg-background"><AppHeader/><NotificationCenter/><main className="mx-auto max-w-[1440px] px-3 py-5 sm:px-5"><Outlet/>{projectSlug?<LegacyTrainingProjectPanel slug={projectSlug}/>:null}</main></div>;
}

import { Link, createFileRoute } from "@tanstack/react-router";
import type { Session } from "@supabase/supabase-js";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { LanguageSelect, useI18n } from "@/lib/i18n";
import { professionalDashboard } from "@/lib/professional-network.functions";

export const Route=createFileRoute("/profissional/login")({head:()=>({meta:[{title:"Área do Profissional — Rede LDR"},{name:"description",content:"Acesse ou crie sua área profissional na Rede LDR para configurar perfil, plano, agenda e recursos da plataforma."},{name:"robots",content:"noindex"}]}),component:ProfessionalLogin});
const COPY={pt:{title:"Área do Profissional",signupTitle:"Cadastro Profissional",sub:"Crie seu perfil, escolha o plano e gerencie sua atuação na Rede LDR.",signupSub:"Crie seu acesso com Google e continue no cadastro profissional já validado da Rede LDR.",google:"Entrar com Google",signupGoogle:"Criar cadastro com Google",opening:"Abrindo…",back:"Conhecer a Rede LDR",error:"Não foi possível entrar."},en:{title:"Professional Area",signupTitle:"Professional Registration",sub:"Create your profile, choose a plan and manage your work in the LDR Network.",signupSub:"Create your access with Google and continue through the validated professional onboarding flow.",google:"Continue with Google",signupGoogle:"Register with Google",opening:"Opening…",back:"Explore the LDR Network",error:"Could not sign in."},fr:{title:"Espace Professionnel",signupTitle:"Inscription Professionnelle",sub:"Créez votre profil, choisissez votre plan et gérez votre activité dans le Réseau LDR.",signupSub:"Créez votre accès avec Google puis continuez dans le parcours d'inscription professionnelle déjà validé.",google:"Continuer avec Google",signupGoogle:"S'inscrire avec Google",opening:"Ouverture…",back:"Découvrir le Réseau LDR",error:"Connexion impossible."},es:{title:"Área Profesional",signupTitle:"Registro Profesional",sub:"Crea tu perfil, elige tu plan y gestiona tu actividad en la Red LDR.",signupSub:"Crea tu acceso con Google y continúa en el registro profesional ya validado de la Red LDR.",google:"Continuar con Google",signupGoogle:"Registrarme con Google",opening:"Abriendo…",back:"Conocer la Red LDR",error:"No fue posible entrar."}} as const;

function oauthReturnUrl() {
  if (typeof window === "undefined") return "/api/auth/callback";
  return `https://ldr-ecossistema-validacao.onrender.com/api/auth/callback`;
}

async function syncBrowserSession(session:Session){
  const response=await fetch("/api/auth/session-sync",{method:"POST",credentials:"include",cache:"no-store",headers:{"content-type":"application/json"},body:JSON.stringify({access_token:session.access_token,refresh_token:session.refresh_token})});
  return response.ok;
}

function ProfessionalLogin(){
  const {locale}=useI18n();
  const c=COPY[locale];
  const signupMode=useMemo(()=>typeof window!=="undefined"&&new URLSearchParams(window.location.search).get("mode")==="cadastro",[]);
  const [busy,setBusy]=useState(false);
  const redirecting=useRef(false);
  const sellerRef=useMemo(()=>{
    if(typeof window==="undefined")return "";
    const queryRef=new URLSearchParams(window.location.search).get("seller_ref")||"";
    if(queryRef)return queryRef;
    try{return sessionStorage.getItem("ldr_seller_referral")||""}catch{return ""}
  },[]);
  useEffect(()=>{if(sellerRef){try{sessionStorage.setItem("ldr_seller_referral",sellerRef)}catch{}}},[sellerRef]);
  const load=useServerFn(professionalDashboard);

  const redirectAuthenticated=useCallback(async(session:Session)=>{
    if(redirecting.current)return;
    redirecting.current=true;
    setBusy(true);
    const synced=await syncBrowserSession(session).catch(()=>false);
    if(!synced){redirecting.current=false;setBusy(false);toast.error(c.error);return}
    try{
      const dashboard=await load();
      const profile=dashboard?.profile;
      const isActiveApproved=profile?.profile_status==="active"&&profile?.compliance_status==="approved";
      window.location.replace((isActiveApproved?"/profissional-painel":"/profissional-onboarding")+(sellerRef?`?seller_ref=${encodeURIComponent(sellerRef)}`:""));
    }catch{
      window.location.replace("/profissional-onboarding"+(sellerRef?`?seller_ref=${encodeURIComponent(sellerRef)}`:""));
    }
  },[c.error,load,sellerRef]);

  useEffect(()=>{
    let active=true;
    void supabase.auth.getSession().then(({data})=>{if(active&&data.session)void redirectAuthenticated(data.session)});
    const {data}=supabase.auth.onAuthStateChange((event,session)=>{
      if(active&&session&&(event==="SIGNED_IN"||event==="INITIAL_SESSION"||event==="TOKEN_REFRESHED"))void redirectAuthenticated(session);
    });
    return()=>{active=false;data.subscription.unsubscribe()};
  },[redirectAuthenticated]);

  async function signIn(){
    setBusy(true);
    document.cookie="ldr_portal_oauth=professional; Max-Age=600; Path=/; SameSite=Lax; Secure";
    const {data,error}=await supabase.auth.signInWithOAuth({provider:"google",options:{redirectTo:oauthReturnUrl(),skipBrowserRedirect:true}});
    if(error||!data.url){document.cookie="ldr_portal_oauth=; Max-Age=0; Path=/; SameSite=Lax; Secure";setBusy(false);toast.error(c.error);return}
    window.location.assign(data.url);
  }

  return <div className="min-h-screen bg-background"><header className="bg-primary text-primary-foreground"><div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-5 sm:px-6"><div><p className="font-serif text-2xl">Grupo LDR Essence</p><p className="text-xs opacity-80">Rede de Profissionais LDR</p></div><LanguageSelect/></div></header><main className="mx-auto max-w-md px-4 py-12 sm:px-6"><section className="rounded-3xl border bg-card p-7 shadow-sm"><h1 className="font-serif text-3xl">{signupMode?c.signupTitle:c.title}</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">{signupMode?c.signupSub:c.sub}</p><button onClick={signIn} disabled={busy} className="mt-6 min-h-11 w-full rounded-xl border bg-background px-4 py-3 font-black text-primary">{busy?c.opening:(signupMode?c.signupGoogle:c.google)}</button><Link to="/para-profissionais" className="mt-4 block text-center text-sm font-bold underline">{c.back}</Link></section></main></div>
}

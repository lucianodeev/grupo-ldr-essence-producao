import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { createFileRoute, Link } from "@tanstack/react-router";
import { BookHeart, HeartHandshake, MessageCircle, Network, ShieldCheck, Users } from "lucide-react";

export const Route=createFileRoute("/rede-academica")({component:AcademicNetworkLanding,head:()=>({meta:[{title:"Rede Acadêmica LDR | LDR Essence Academy"},{name:"description",content:"Rede social acadêmica gratuita com diário privado, comunidades, debates e networking."}]})});

const FEATURES=[
  [BookHeart,"Meu Diário","Um espaço privado e gratuito para registrar pensamentos, aprendizados e reflexões."],
  [MessageCircle,"Feed Acadêmico","Compartilhe reflexões, perguntas, debates, estudos e indicações."],
  [Users,"Comunidades","Participe de grupos por área: Psicanálise, RH, IA, Carreira, Educação e muito mais."],
  [Network,"Networking acadêmico","Conecte-se com pessoas que compartilham interesses de estudo e atuação."],
  [HeartHandshake,"Acolher","Uma reação simples para valorizar a troca sem transformar a rede em competição."],
  [ShieldCheck,"Privacidade e anonimato","Publique com seu nome ou anonimamente. Seu Diário continua privado."],
] as const;

const COPY={
 pt:{title:"REDE ACADÊMICA GRATUITA",desc:"Crie sua conta gratuitamente e participe.",create:"CRIAR CONTA GRÁTIS",enter:"ENTRAR NA REDE"},
 en:{title:"FREE ACADEMIC NETWORK",desc:"Create your free account and join the community.",create:"CREATE FREE ACCOUNT",enter:"ENTER THE NETWORK"},
 fr:{title:"RÉSEAU ACADÉMIQUE GRATUIT",desc:"Créez votre compte gratuitement et rejoignez la communauté.",create:"CRÉER UN COMPTE GRATUIT",enter:"ENTRER DANS LE RÉSEAU"},
 es:{title:"RED ACADÉMICA GRATUITA",desc:"Crea tu cuenta gratis y participa en la comunidad.",create:"CREAR CUENTA GRATIS",enter:"ENTRAR EN LA RED"}
};
function AcademicNetworkLanding(){const {locale}=useI18n();const copy=COPY[locale];const [authenticated,setAuthenticated]=useState(false);useEffect(()=>{const {data}=supabase.auth.onAuthStateChange((_event,session)=>setAuthenticated(Boolean(session)));return()=>data.subscription.unsubscribe()},[]);return <main className="min-h-screen bg-[#f7f4ed] text-[#071426] dark:bg-background dark:text-foreground">
  <section className="border-b border-[#d8cba9] bg-gradient-to-br from-[#071426] via-[#102a4a] to-[#193b62] text-white"><div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24"><p className="text-xs font-black tracking-[.25em] text-[#e7c979]">LDR ESSENCE ACADEMY</p><h1 className="mt-4 max-w-4xl font-serif text-4xl leading-tight sm:text-6xl">{copy.title}</h1><p className="mt-6 max-w-2xl text-base leading-7 text-slate-200">{copy.desc}</p><div className="mt-8 flex flex-wrap gap-3"><Link to="/cliente/rede-academica" className="rounded-xl bg-[#e6c873] px-5 py-3 text-sm font-black text-[#071426]">{authenticated?copy.enter:copy.create}</Link></div><div className="mt-5 flex flex-wrap gap-2 text-[10px] font-black tracking-[.08em]"><span className="rounded-full bg-white/10 px-3 py-1.5">{copy.title}</span><span className="rounded-full bg-white/10 px-3 py-1.5">CONTA GRÁTIS</span><span className="rounded-full bg-white/10 px-3 py-1.5">SEM CARTÃO</span></div></div></section>
  <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6"><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{FEATURES.map(([Icon,title,desc])=><article key={title} className="rounded-[24px] border border-[#d8cba9] bg-white p-6 shadow-sm dark:bg-card"><Icon className="h-7 w-7"/><h2 className="mt-4 font-serif text-2xl">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-600 dark:text-muted-foreground">{desc}</p></article>)}</div></section>
  <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6"><div className="rounded-[30px] border border-[#d8cba9] bg-white p-7 text-center shadow-sm dark:bg-card sm:p-10"><p className="text-xs font-black tracking-[.18em] text-[#9a772c]">PARTICIPE GRATUITAMENTE</p><h2 className="mt-3 font-serif text-3xl">A Rede Acadêmica é gratuita.</h2><p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">Crie sua conta gratuitamente e participe. Publique, compartilhe conhecimento, participe de discussões e conecte-se com a comunidade acadêmica.</p><Link to="/cliente/rede-academica" className="mt-6 inline-flex rounded-xl bg-[#071426] px-5 py-3 text-sm font-black text-white">{authenticated?copy.enter:copy.create}</Link></div></section>
</main>}

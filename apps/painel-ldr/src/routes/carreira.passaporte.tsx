import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LanguageSelect, useI18n } from "@/lib/i18n";

type Evidence={id:string;competency_key:string;evidence_type:string;validity_status:string;created_at:string;evidence:Record<string,unknown>};
type App={id:string;created_at:string;status:string;career_jobs?:{title?:string}|null;career_selection_journeys?:{id:string}|null};
type Pool={id:string;source_application_id:string|null;active:boolean;consented_at:string};

export const Route=createFileRoute("/carreira/passaporte")({component:Passport});

const copy={
 pt:{title:"Passaporte Profissional",sub:"Suas competências e evidências, reunidas com transparência.",login:"Entre na sua conta para acessar seu passaporte.",empty:"Seu passaporte será construído conforme você participa das jornadas.",skills:"Competências demonstradas",history:"Histórico de jornadas",pool:"Banco de talentos",poolOn:"Você está disponível para novas oportunidades compatíveis.",poolOff:"Você decide se quer ficar disponível para novas oportunidades.",join:"Quero ficar disponível",leave:"Sair do banco de talentos",privacy:"A participação é voluntária. A LDR não envia candidatura automaticamente.",back:"Ver vagas"},
 en:{title:"Professional Passport",sub:"Your competencies and evidence, gathered transparently.",login:"Sign in to access your passport.",empty:"Your passport will grow as you participate in selection journeys.",skills:"Demonstrated competencies",history:"Journey history",pool:"Talent pool",poolOn:"You are available for new compatible opportunities.",poolOff:"You decide whether to be available for new opportunities.",join:"Make me available",leave:"Leave talent pool",privacy:"Participation is voluntary. LDR never applies to jobs automatically.",back:"View jobs"},
 fr:{title:"Passeport Professionnel",sub:"Vos compétences et preuves, réunies en toute transparence.",login:"Connectez-vous pour accéder à votre passeport.",empty:"Votre passeport évoluera au fil de vos parcours.",skills:"Compétences démontrées",history:"Historique des parcours",pool:"Viviers de talents",poolOn:"Vous êtes disponible pour de nouvelles opportunités compatibles.",poolOff:"Vous décidez si vous souhaitez être disponible.",join:"Me rendre disponible",leave:"Quitter le vivier",privacy:"La participation est volontaire. LDR ne postule jamais automatiquement.",back:"Voir les offres"},
 es:{title:"Pasaporte Profesional",sub:"Tus competencias y evidencias, reunidas con transparencia.",login:"Inicia sesión para acceder a tu pasaporte.",empty:"Tu pasaporte crecerá a medida que participes en procesos.",skills:"Competencias demostradas",history:"Historial de procesos",pool:"Banco de talentos",poolOn:"Estás disponible para nuevas oportunidades compatibles.",poolOff:"Tú decides si quieres estar disponible.",join:"Quiero estar disponible",leave:"Salir del banco de talentos",privacy:"La participación es voluntaria. LDR nunca postula automáticamente.",back:"Ver vacantes"}
} as const;

function Passport(){
 const { locale } = useI18n(); const t=copy[locale as keyof typeof copy]??copy.pt;
 const [uid,setUid]=useState<string|null>(null),[apps,setApps]=useState<App[]>([]),[evidence,setEvidence]=useState<Evidence[]>([]),[pool,setPool]=useState<Pool[]>([]),[busy,setBusy]=useState(false),[loaded,setLoaded]=useState(false);
 async function load(){
  const {data:{user}}=await supabase.auth.getUser(); setUid(user?.id??null);
  if(!user){setLoaded(true);return}
  const {data:a}=await supabase.from("career_applications" as never).select("id,created_at,status,career_jobs(title),career_selection_journeys(id)").eq("candidate_user_id",user.id).order("created_at",{ascending:false}) as any;
  const rows=(a??[]) as App[]; setApps(rows);
  const journeyIds=rows.map(x=>x.career_selection_journeys?.id).filter(Boolean) as string[];
  if(journeyIds.length){const {data:e}=await supabase.from("career_candidate_evidence" as never).select("id,competency_key,evidence_type,validity_status,created_at,evidence").in("journey_id",journeyIds) as any;setEvidence((e??[]) as Evidence[])}
  const {data:p}=await supabase.from("career_talent_pool" as never).select("id,source_application_id,active,consented_at").eq("candidate_user_id",user.id) as any;setPool((p??[]) as Pool[]);setLoaded(true);
 }
 useEffect(()=>{void load()},[]);
 const active=pool.some(x=>x.active);
 const competencies=useMemo(()=>Array.from(new Map(evidence.filter(x=>x.validity_status==="current").map(x=>[x.competency_key,x])).values()),[evidence]);
 async function toggle(){
  if(!uid)return; setBusy(true);
  if(active){await supabase.from("career_talent_pool" as never).update({active:false,updated_at:new Date().toISOString()} as never).eq("candidate_user_id",uid)}
  else {const existing=pool[0]; if(existing) await supabase.from("career_talent_pool" as never).update({active:true,consented_at:new Date().toISOString(),updated_at:new Date().toISOString()} as never).eq("id",existing.id); else await supabase.from("career_talent_pool" as never).insert({candidate_user_id:uid,source_application_id:apps[0]?.id??null,active:true,consented_at:new Date().toISOString()} as never)}
  await load();setBusy(false);
 }
 return <main className="min-h-screen bg-[#f7f5ef] text-[#071426]"><div className="mx-auto max-w-5xl px-4 py-8 sm:px-6"><div className="flex items-center justify-between gap-4"><Link to="/carreira/vagas" className="text-sm font-bold">← {t.back}</Link><LanguageSelect/></div><header className="mt-8 rounded-3xl bg-[#071426] p-6 text-white sm:p-10"><p className="text-xs font-black uppercase tracking-[.18em] text-[#d7bd77]">LDR Carreira</p><h1 className="mt-3 text-3xl font-black sm:text-5xl">{t.title}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200 sm:text-base">{t.sub}</p></header>
 {!loaded?<p className="py-10">...</p>:!uid?<section className="mt-6 rounded-2xl bg-white p-6 shadow-sm"><p>{t.login}</p><Link to="/cliente/login" className="mt-4 inline-flex rounded-xl bg-[#071426] px-4 py-3 text-sm font-black text-white">Login</Link></section>:<>
 <section className="mt-6 grid gap-5 md:grid-cols-2"><div className="rounded-2xl bg-white p-6 shadow-sm"><h2 className="text-xl font-black">{t.skills}</h2>{competencies.length?<div className="mt-4 flex flex-wrap gap-2">{competencies.map(e=><span key={e.id} className="rounded-full bg-[#f5f0e6] px-3 py-2 text-sm font-bold">{e.competency_key.replaceAll("_"," ")}</span>)}</div>:<p className="mt-3 text-sm text-slate-600">{t.empty}</p>}</div>
 <div className="rounded-2xl bg-white p-6 shadow-sm"><h2 className="text-xl font-black">{t.pool}</h2><p className="mt-3 text-sm leading-6 text-slate-600">{active?t.poolOn:t.poolOff}</p><button disabled={busy} onClick={()=>void toggle()} className="mt-4 min-h-12 w-full rounded-xl bg-[#071426] px-4 py-3 text-sm font-black text-white disabled:opacity-50">{active?t.leave:t.join}</button><p className="mt-3 text-xs leading-5 text-slate-500">{t.privacy}</p></div></section>
 <section className="mt-5 rounded-2xl bg-white p-6 shadow-sm"><h2 className="text-xl font-black">{t.history}</h2><div className="mt-4 grid gap-3">{apps.length?apps.map(a=><div key={a.id} className="rounded-xl border border-slate-200 p-4"><p className="font-black">{a.career_jobs?.title??"LDR Carreira"}</p><p className="mt-1 text-xs text-slate-500">{new Date(a.created_at).toLocaleDateString(locale === "pt" ? "pt-BR" : locale === "en" ? "en-US" : locale === "fr" ? "fr-FR" : "es-ES")} · {a.status}</p></div>):<p className="text-sm text-slate-600">{t.empty}</p>}</div></section></>}
 </div></main>
}
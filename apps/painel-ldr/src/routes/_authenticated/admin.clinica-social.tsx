import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { socialClinicAdmin, socialClinicAdminConfig, socialClinicAdminStatus } from "@/lib/social-clinic.functions";

export const Route=createFileRoute("/_authenticated/admin/clinica-social")({component:AdminSocialClinic});
type Tab="overview"|"patients"|"professionals"|"appointments"|"settings";
const TABS:[Tab,string][]=[["overview","VISÃO GERAL"],["patients","PACIENTES"],["professionals","PROFISSIONAIS"],["appointments","ATENDIMENTOS"],["settings","CONFIGURAÇÕES"]];

function AdminSocialClinic(){
 const load=useServerFn(socialClinicAdmin),save=useServerFn(socialClinicAdminConfig),statusFn=useServerFn(socialClinicAdminStatus);
 const[data,setData]=useState<any>(null),[busy,setBusy]=useState(false),[tab,setTab]=useState<Tab>("overview");
 const refresh=async()=>setData(await load()); useEffect(()=>{void refresh()},[]);
 const patients=useMemo(()=>(data?.applications||[]).filter((x:any)=>x.application_kind==="patient"),[data]);
 const pros=useMemo(()=>(data?.applications||[]).filter((x:any)=>x.application_kind==="professional"),[data]);
 async function setStatus(row:any,status:string){setBusy(true);try{await statusFn({data:{protocol:row.protocol,kind:row.application_kind,status}});toast.success("Status atualizado");await refresh()}catch(e:any){toast.error(e?.message||"Erro")}finally{setBusy(false)}}
 async function saveConfig(e:any){e.preventDefault();const f=new FormData(e.currentTarget);setBusy(true);try{await save({data:{brlCents:Math.round(Number(f.get("brl"))*100),eurCents:Math.round(Number(f.get("eur"))*100),socialPct:20,directPct:20,ldrPct:20}});toast.success("Valores sociais atualizados");await refresh()}catch(e:any){toast.error(e?.message||"Erro")}finally{setBusy(false)}}
 if(!data)return <p className="text-sm text-muted-foreground">Carregando Clínica Social…</p>;
 const metrics=[["SOLICITAÇÕES NOVAS",patients.filter((x:any)=>x.status==="new").length],["EM ANÁLISE",patients.filter((x:any)=>x.status==="under_review").length],["AGENDADOS",patients.filter((x:any)=>x.status==="scheduled").length],["PACIENTES ATIVOS",patients.filter((x:any)=>x.status==="active").length],["PROFISSIONAIS ATIVOS",pros.filter((x:any)=>x.status==="approved"||x.status==="active").length],["ATENDIMENTOS DO MÊS","—"]];
 return <div className="space-y-6"><div><p className="text-xs font-black uppercase tracking-[.18em] text-primary">LDR ESSENCE</p><h1 className="mt-1 font-serif text-4xl">Clínica Social</h1><p className="mt-2 text-sm text-muted-foreground">Psicanálise social integrada à rede multidisciplinar, com privacidade e gestão administrativa.</p></div>
 <nav className="flex gap-2 overflow-x-auto pb-1" aria-label="Áreas da Clínica Social">{TABS.map(([id,label])=><button key={id} onClick={()=>setTab(id)} className={`min-h-11 whitespace-nowrap rounded-full px-4 py-2 text-xs font-black ${tab===id?"bg-primary text-primary-foreground":"border bg-card"}`}>{label}</button>)}</nav>
 {tab==="overview"&&<section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{metrics.map(([l,v])=><article key={String(l)} className="rounded-2xl border bg-card p-5"><p className="text-xs font-black text-muted-foreground">{l}</p><p className="mt-2 text-3xl font-black text-primary">{v}</p></article>)}</section>}
 {tab==="patients"&&<Queue title="Fila de pacientes" rows={patients} busy={busy} onStatus={setStatus}/>}
 {tab==="professionals"&&<Queue title="Profissionais da Clínica Social" rows={pros} busy={busy} onStatus={setStatus}/>}
 {tab==="appointments"&&<section className="rounded-2xl border bg-card p-6"><h2 className="font-serif text-2xl">Atendimentos</h2><p className="mt-2 text-sm text-muted-foreground">Atribuição manual assistida por filtros será conectada aos agendamentos existentes sem expor conteúdo clínico.</p></section>}
 {tab==="settings"&&<form onSubmit={saveConfig} className="rounded-2xl border bg-card p-6"><h2 className="font-serif text-2xl">Valores e taxa</h2><div className="mt-5 grid gap-4 sm:grid-cols-2"><Cfg n="brl" l="Sessão social Brasil (R$)" v={(data.pricing.brlCents/100).toFixed(2)}/><Cfg n="eur" l="Sessão social Europa (€)" v={(data.pricing.eurCents/100).toFixed(2)}/></div><div className="mt-5 rounded-2xl bg-primary/5 p-5"><p className="text-xs font-black text-primary">TAXA GLOBAL DA PLATAFORMA</p><p className="mt-1 text-3xl font-black">20%</p><p className="mt-2 text-sm text-muted-foreground">Aplicada a todos os serviços profissionais pagos pela plataforma. O profissional recebe 80%.</p></div><button disabled={busy} className="mt-5 min-h-11 rounded-xl bg-primary px-5 py-3 font-black text-primary-foreground">SALVAR VALORES SOCIAIS</button></form>}
 </div>;
}
function Cfg({n,l,v}:any){return <label className="grid gap-1 text-sm font-bold">{l}<input name={n} defaultValue={v} type="number" min="1" step="0.01" className="rounded-xl border bg-background p-3"/></label>}
function Queue({title,rows,busy,onStatus}:any){return <section className="rounded-2xl border bg-card p-5"><h2 className="font-serif text-2xl">{title}</h2><div className="mt-4 space-y-3">{rows.length===0?<p className="text-sm text-muted-foreground">Nenhuma solicitação até o momento.</p>:rows.map((r:any)=><article key={r.protocol} className="rounded-xl border p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><strong>{r.full_name}</strong><p className="text-xs text-muted-foreground">{r.protocol} · {r.country} · {r.language||r.languages||"—"}</p></div><span className="rounded-full bg-muted px-3 py-1 text-xs font-bold">{r.status}</span></div><div className="mt-3 flex flex-wrap gap-2">{["under_review","contacted","scheduled","active","closed"].map(s=><button key={s} disabled={busy} onClick={()=>onStatus(r,s)} className="min-h-10 rounded-lg border px-3 py-2 text-xs font-bold">{s}</button>)}</div></article>)}</div></section>}

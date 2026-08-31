import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { Building2, CreditCard, Gift, UsersRound } from "lucide-react";
import { toast } from "sonner";
import { professionalOrganizations } from "@/lib/organization-admin.functions";

export const Route = createFileRoute("/_authenticated/painel-profissional/empresas")({ component: CompaniesPage });
type AnyRow = Record<string, any>;

function CompaniesPage() {
  const loadOrganizations = useServerFn(professionalOrganizations);
  const [data,setData]=useState<any>(null); const [loading,setLoading]=useState(true); const [selected,setSelected]=useState<string>("");
  useEffect(()=>{void (async()=>{try{const result=await loadOrganizations();setData(result);setSelected(result.organizations?.[0]?.id??"");}catch(e){toast.error(e instanceof Error?e.message:"Não foi possível carregar empresas.");}finally{setLoading(false);}})();},[]);
  const org = useMemo(()=>data?.organizations?.find((o:AnyRow)=>o.id===selected)??null,[data,selected]);
  const members=(data?.members??[]).filter((m:AnyRow)=>m.organization_id===selected);
  const purchases=(data?.purchases??[]).filter((p:AnyRow)=>p.organization_id===selected);
  const benefits=(data?.benefits??[]).filter((b:AnyRow)=>b.organization_id===selected);
  const names=new Map((data?.catalog??[]).map((s:AnyRow)=>[s.catalog_key,s.name]));
  if(loading)return <section className="s8-card text-center">Carregando empresas…</section>;
  return <div className="space-y-6"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Corporativo</p><h1 className="font-serif text-3xl">Empresas e funcionários</h1><p className="mt-2 text-sm text-muted-foreground">Visão operacional das empresas, beneficiários, compras e créditos liberados.</p></div>
    <section className="grid gap-4 sm:grid-cols-4"><Metric icon={Building2} label="Empresas" value={data?.organizations?.length??0}/><Metric icon={UsersRound} label="Funcionários" value={data?.members?.length??0}/><Metric icon={CreditCard} label="Compras" value={data?.purchases?.length??0}/><Metric icon={Gift} label="Benefícios" value={data?.benefits?.length??0}/></section>
    {(data?.organizations??[]).length===0?<section className="s8-card"><p className="text-sm text-muted-foreground">Nenhuma empresa cadastrada ainda.</p></section>:<><section className="s8-card"><label className="s8-label" htmlFor="org-select">Empresa</label><select id="org-select" className="s8-field max-w-xl" value={selected} onChange={e=>setSelected(e.target.value)}>{data.organizations.map((o:AnyRow)=><option key={o.id} value={o.id}>{o.name}</option>)}</select>{org&&<div className="mt-4 grid gap-2 text-sm sm:grid-cols-2"><p><strong>E-mail:</strong> {org.billing_email}</p><p><strong>País:</strong> {org.country||"—"}</p><p><strong>Telefone:</strong> {org.phone||"—"}</p><p><strong>Status:</strong> {org.active?"ativa":"inativa"}</p></div>}</section>
    <section className="grid gap-6 lg:grid-cols-2"><div className="s8-card"><h2 className="font-serif text-2xl">Funcionários ({members.length})</h2><div className="mt-4 space-y-2">{members.length===0?<p className="text-sm text-muted-foreground">Nenhum funcionário.</p>:members.map((m:AnyRow)=><div key={m.id} className="rounded-xl border bg-card p-3"><div className="flex flex-wrap justify-between gap-2"><div className="min-w-0"><p className="break-words font-bold">{m.full_name}</p><p className="break-all text-xs text-muted-foreground">{m.email}{m.department?` · ${m.department}`:""}</p></div><span className="rounded-full bg-muted px-2 py-1 text-xs font-bold">{m.portal_active?"ativo":"inativo"}</span></div></div>)}</div></div>
    <div className="s8-card"><h2 className="font-serif text-2xl">Compras ({purchases.length})</h2><div className="mt-4 space-y-2">{purchases.length===0?<p className="text-sm text-muted-foreground">Nenhuma compra.</p>:purchases.map((p:AnyRow)=><div key={p.id} className="rounded-xl border bg-card p-3"><p className="break-words text-sm font-bold">{String(names.get(p.catalog_key)??p.catalog_key)}</p><p className="mt-1 text-xs text-muted-foreground">{p.quantity} funcionário(s) · {new Date(p.created_at).toLocaleDateString("pt-BR")}</p><span className="mt-2 inline-block rounded-full bg-muted px-2 py-1 text-xs font-bold">{p.status}</span></div>)}</div></div></section>
    <section className="s8-card"><h2 className="font-serif text-2xl">Benefícios e créditos</h2><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{benefits.length===0?<p className="text-sm text-muted-foreground">Nenhum benefício liberado.</p>:benefits.map((b:AnyRow)=>{const member=members.find((m:AnyRow)=>m.id===b.member_id);return <div key={b.id} className="rounded-xl border bg-card p-3"><p className="font-bold">{member?.full_name??"Funcionário"}</p><p className="mt-1 break-words text-xs text-muted-foreground">{String(names.get(b.catalog_key)??b.catalog_key)}</p><p className="mt-2 text-sm"><strong>{Math.max(Number(b.credits_granted)-Number(b.credits_used),0)}</strong> de {b.credits_granted} crédito(s)</p><span className="mt-2 inline-block rounded-full bg-muted px-2 py-1 text-xs font-bold">{b.status}</span></div>})}</div></section></>}
  </div>;
}
function Metric({icon:Icon,label,value}:{icon:any;label:string;value:number}){return <div className="s8-card flex items-center gap-3"><span className="rounded-xl bg-primary/10 p-2.5 text-primary"><Icon className="h-5 w-5"/></span><div><p className="text-xl font-bold">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div></div>}

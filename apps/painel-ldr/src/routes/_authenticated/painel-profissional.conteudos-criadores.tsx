import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import {
  adminCreatorFileUrl,
  adminCreatorProducts,
  adminUpdateCreatorProduct,
} from "@/lib/creator-marketplace.functions";

export const Route = createFileRoute("/_authenticated/painel-profissional/conteudos-criadores")({ component: CreatorContentAdmin });

const STATUSES = [
  ["submitted", "Enviado"],
  ["under_review", "Em análise"],
  ["changes_requested", "Ajustes solicitados"],
  ["approved", "Aprovado"],
  ["preparing", "Em preparação"],
  ["published", "Publicado"],
  ["rejected", "Recusado"],
  ["suspended", "Suspenso"],
] as const;

function CreatorContentAdmin() {
  const listFn = useServerFn(adminCreatorProducts);
  const updateFn = useServerFn(adminUpdateCreatorProduct);
  const fileFn = useServerFn(adminCreatorFileUrl);
  const { data = [], isLoading, refetch } = useQuery({ queryKey: ["admin-creator-products"], queryFn: () => listFn({}) });
  const [filter, setFilter] = useState("all");
  const update = useMutation({
    mutationFn: updateFn,
    onSuccess: async () => { toast.success("Submissão atualizada."); await refetch(); },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Não foi possível atualizar."),
  });

  async function openFile(submissionId: string, path: string) {
    try {
      const result = await fileFn({ data: { submissionId, path } });
      window.open(result.url, "_blank", "noopener,noreferrer");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível abrir o arquivo.");
    }
  }

  const rows = filter === "all" ? data : data.filter((item:any) => item.status === filter);

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando conteúdos de criadores…</p>;

  return <div className="space-y-6">
    <header>
      <p className="text-xs font-black uppercase tracking-[.18em] text-[#a77b2e]">LDR ESSENCE ACADEMY · MASTER</p>
      <h1 className="mt-1 font-serif text-3xl">Conteúdos de Criadores</h1>
      <p className="mt-2 text-sm text-muted-foreground">Analise, aprove e acompanhe produtos enviados para publicação. Regra atual: 85% criador / 15% LDR.</p>
    </header>

    <div className="flex flex-wrap gap-2">{[["all","Todos"],...STATUSES].map(([value,label])=><button key={value} onClick={()=>setFilter(value)} className={`rounded-full px-3 py-2 text-xs font-bold ${filter===value?"bg-primary text-primary-foreground":"border bg-white"}`}>{label}</button>)}</div>

    {rows.length===0?<div className="s8-card"><p className="text-sm text-muted-foreground">Nenhuma submissão neste status.</p></div>:<div className="grid gap-4">{rows.map((item:any)=><SubmissionCard key={item.id} item={item} update={update} openFile={openFile}/>)}</div>}
  </div>;
}

function SubmissionCard({item,update,openFile}:{item:any;update:any;openFile:(submissionId:string,path:string)=>void}){
  const [status,setStatus]=useState(item.status);
  const [notes,setNotes]=useState(item.admin_notes??"");
  const [price,setPrice]=useState(item.suggested_price_cents==null?"":String(item.suggested_price_cents/100));
  const files=Array.isArray(item.files)?item.files:[];
  return <article className="rounded-2xl border bg-white p-5 shadow-sm">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2"><h2 className="font-serif text-2xl">{item.title}</h2><span className="rounded-full bg-[#f8f3e7] px-3 py-1 text-xs font-black">{STATUSES.find(x=>x[0]===item.status)?.[1]??item.status}</span></div>
        <p className="mt-1 text-sm text-muted-foreground">{item.creator_name} · {item.email} · {item.country||"—"}</p>
        <p className="mt-1 text-xs text-muted-foreground">{item.product_type} · {item.category} · enviado em {new Date(item.created_at).toLocaleString("pt-BR")}</p>
        <p className="mt-4 whitespace-pre-wrap text-sm leading-6">{item.description}</p>
        {item.target_audience?<p className="mt-3 text-sm"><strong>Público:</strong> {item.target_audience}</p>:null}
        {item.bio?<p className="mt-2 text-sm"><strong>Bio:</strong> {item.bio}</p>:null}
        <div className="mt-4 flex flex-wrap gap-2">{files.map((file:any)=><button key={file.path} onClick={()=>openFile(item.id,file.path)} className="rounded-lg border px-3 py-2 text-xs font-bold">Abrir {file.name}</button>)}</div>
      </div>
      <div className="w-full shrink-0 rounded-2xl bg-muted/35 p-4 lg:w-80">
        <p className="text-xs font-black uppercase tracking-wide">Financeiro</p>
        <div className="mt-2 grid grid-cols-2 gap-2 text-xs"><Box label="Criador" value="85%"/><Box label="LDR" value="15%"/><Box label="Vendido" value={money(item.gross_sales_cents,item.currency)}/><Box label="Devido" value={money(item.creator_due_cents,item.currency)}/></div>
        <label className="mt-4 block text-xs font-bold">Preço sugerido / aprovado<input value={price} onChange={e=>setPrice(e.target.value)} inputMode="decimal" className="mt-1 w-full rounded-lg border bg-white px-3 py-2"/></label>
        <label className="mt-3 block text-xs font-bold">Status<select value={status} onChange={e=>setStatus(e.target.value)} className="mt-1 w-full rounded-lg border bg-white px-3 py-2">{STATUSES.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
        <label className="mt-3 block text-xs font-bold">Observações / ajustes<textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={4} className="mt-1 w-full rounded-lg border bg-white px-3 py-2"/></label>
        <button disabled={update.isPending} onClick={()=>update.mutate({data:{id:item.id,status,adminNotes:notes,suggestedPriceCents:price.trim()?Math.round(Number(price.replace(",","."))*100):null}})} className="mt-3 w-full rounded-lg bg-primary px-4 py-3 text-sm font-black text-primary-foreground disabled:opacity-60">SALVAR ANÁLISE</button>
      </div>
    </div>
  </article>
}

function Box({label,value}:{label:string;value:string}){return <div className="rounded-xl bg-white p-3"><p className="text-muted-foreground">{label}</p><p className="mt-1 font-black">{value}</p></div>}
function money(cents:number,currency:string){return new Intl.NumberFormat("pt-BR",{style:"currency",currency:currency||"EUR"}).format((cents||0)/100)}

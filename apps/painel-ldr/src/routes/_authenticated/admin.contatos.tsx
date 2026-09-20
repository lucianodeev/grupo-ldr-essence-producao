import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { listEcosystemContacts, updateEcosystemContact } from "@/lib/ecosystem-support.functions";

export const Route = createFileRoute("/_authenticated/admin/contatos")({ component: ContactsAdmin });
const statuses = ["novo","em_atendimento","aguardando_cliente","respondido","resolvido"] as const;
const labels: Record<string,string> = {novo:"Novo",em_atendimento:"Em atendimento",aguardando_cliente:"Aguardando cliente",respondido:"Respondido",resolvido:"Resolvido"};

function ContactsAdmin() {
 const fetcher=useServerFn(listEcosystemContacts), updater=useServerFn(updateEcosystemContact), qc=useQueryClient();
 const q=useQuery({queryKey:["ecosystem-contacts"],queryFn:()=>fetcher({}),refetchInterval:60000});
 async function change(id:string,status:typeof statuses[number]) { await updater({data:{id,status}}); await qc.invalidateQueries({queryKey:["ecosystem-contacts"]}); }
 return <div className="space-y-5">
  <div><p className="text-xs font-black uppercase tracking-[.16em] text-[#C7A33B]">Ecossistema LDR</p><h1 className="mt-1 font-serif text-3xl text-[#0B1F3A]">Contatos do Ecossistema</h1><p className="mt-2 text-sm text-slate-600">Solicitações de serviços, suporte e mensagens. Prazo de primeira resposta: até 7 dias.</p></div>
  {q.isLoading?<p>Carregando…</p>:null}{q.isError?<p role="alert">Não foi possível carregar os contatos.</p>:null}
  <div className="grid gap-4">{q.data?.map((x:any)=>{const due=new Date(x.response_due_at); const overdue=due.getTime()<Date.now()&&!["respondido","resolvido"].includes(x.status); return <article key={x.id} className="rounded-2xl border bg-white p-5 shadow-sm">
   <div className="flex flex-wrap justify-between gap-3"><div><p className="text-xs font-black text-[#9a6a20]">{x.protocol}</p><h2 className="font-serif text-xl text-[#0B1F3A]">{x.subject}{x.wants_luciano?" · Quer falar com Luciano":""}</h2></div><span className={overdue?"font-bold text-red-700":"text-sm font-bold text-slate-600"}>{overdue?"Prazo ultrapassado":`Responder até ${due.toLocaleDateString("pt-BR")}`}</span></div>
   <p className="mt-3 text-sm"><strong>{x.name}</strong> · {x.email}{x.phone?` · ${x.phone}`:""}</p><p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{x.message}</p><p className="mt-3 text-xs text-slate-500">{x.source_project} · {new Date(x.created_at).toLocaleString("pt-BR")}</p>
   <select value={x.status} onChange={e=>change(x.id,e.target.value as any)} className="mt-4 rounded-xl border px-3 py-2 text-sm">{statuses.map(s=><option key={s} value={s}>{labels[s]}</option>)}</select>
  </article>})}</div>
 </div>;
}

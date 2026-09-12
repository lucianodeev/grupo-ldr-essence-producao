import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { FileCheck2, Send, RefreshCw, CheckCircle2, Clock3 } from "lucide-react";
import { useState } from "react";
import { clientLegacyTrainingProject, clientSubmitLegacyTrainingProject } from "@/lib/legacy-training-projects.functions";

type LegacyProjectSlug="formacao-psicanalise"|"formacao-terapia-breve-psicanalitica"|"formacao-completa-massoterapia"|"formacao-mentoria-profissional-carreira"|"formacao-lideranca-gestao-pessoas";

function statusText(status?:string|null){
  if(status==="approved")return "Aprovado";
  if(status==="changes_requested")return "Ajustes solicitados";
  if(status==="in_review")return "Em avaliação";
  if(status==="submitted")return "Enviado · aguardando avaliação";
  return "Ainda não enviado";
}

export function LegacyTrainingProjectPanel({slug}:{slug:LegacyProjectSlug}){
  const load=useServerFn(clientLegacyTrainingProject);const submitFn=useServerFn(clientSubmitLegacyTrainingProject);const qc=useQueryClient();
  const {data,isLoading,error}=useQuery({queryKey:["legacy-training-project",slug],queryFn:()=>load({data:{slug}})});
  const [title,setTitle]=useState("");const [projectText,setProjectText]=useState("");const [projectUrl,setProjectUrl]=useState("");
  const submit=useMutation({mutationFn:()=>submitFn({data:{slug,title,projectText:projectText||null,projectUrl:projectUrl||null}}),onSuccess:async()=>{setTitle("");setProjectText("");setProjectUrl("");await qc.invalidateQueries({queryKey:["legacy-training-project",slug]});}});
  if(isLoading)return <section className="mx-auto mt-5 max-w-6xl rounded-[24px] border border-border bg-card p-5 text-sm text-muted-foreground">Carregando projeto e avaliação…</section>;
  if(error||!data)return null;
  const p=data.project;const canSubmit=data.eligible&&(!p||p.status==="changes_requested");
  return <section className="mx-auto mt-5 max-w-6xl rounded-[26px] border border-primary/20 bg-card p-5 shadow-sm sm:p-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-black uppercase tracking-[.15em] text-primary">Projeto e avaliação</p><h2 className="mt-1 flex items-center gap-2 font-serif text-2xl"><FileCheck2 className="h-5 w-5"/> Projeto final</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">Envie seu projeto por texto ou link. A equipe LDR recebe a entrega no painel administrativo, avalia e devolve o feedback diretamente nesta área.</p></div><div className="rounded-2xl bg-accent/50 px-4 py-3 text-sm"><p className="font-bold">{statusText(p?.status)}</p><p className="mt-1 text-xs text-muted-foreground">Progresso registrado: {Math.round(Number(data.progressPercent||0))}%{data.owner?" · acesso owner":""}</p></div></div>
    {p?.feedback?<div className="mt-5 rounded-2xl border border-primary/20 bg-primary/5 p-4"><p className="text-xs font-black uppercase tracking-[.12em] text-primary">Feedback da avaliação</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6">{p.feedback}</p>{p.reviewed_at?<p className="mt-2 text-xs text-muted-foreground">Avaliado em {new Date(p.reviewed_at).toLocaleDateString("pt-BR")}</p>:null}</div>:null}
    {p?.status==="approved"?<div className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700"><CheckCircle2 className="h-4 w-4"/> Projeto aprovado.</div>:null}
    {(p?.status==="submitted"||p?.status==="in_review")?<div className="mt-5 inline-flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800"><Clock3 className="h-4 w-4"/> Seu projeto está com a equipe para avaliação.</div>:null}
    {!data.eligible?<div className="mt-5 rounded-2xl border border-border bg-accent/30 p-4 text-sm text-muted-foreground">A entrega do projeto final será liberada quando o progresso registrado chegar a 100%.</div>:null}
    {canSubmit?<div className="mt-5 grid gap-3"><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Título do projeto" className="rounded-xl border border-border bg-background p-3 text-sm"/><textarea value={projectText} onChange={e=>setProjectText(e.target.value)} rows={7} placeholder="Descreva seu projeto, decisões, aplicação prática, resultados e conclusão…" className="rounded-xl border border-border bg-background p-3 text-sm"/><input value={projectUrl} onChange={e=>setProjectUrl(e.target.value)} placeholder="Link complementar (opcional)" className="rounded-xl border border-border bg-background p-3 text-sm"/><button onClick={()=>submit.mutate()} disabled={submit.isPending||!title.trim()||(!projectText.trim()&&!projectUrl.trim())} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-black text-primary-foreground disabled:opacity-50">{p?.status==="changes_requested"?<RefreshCw className="h-4 w-4"/>:<Send className="h-4 w-4"/>}{p?.status==="changes_requested"?"REENVIAR PROJETO":"ENVIAR PROJETO"}</button>{submit.error?<p className="text-sm font-semibold text-destructive">{submit.error instanceof Error?submit.error.message:"Não foi possível enviar o projeto."}</p>:null}</div>:null}
  </section>;
}

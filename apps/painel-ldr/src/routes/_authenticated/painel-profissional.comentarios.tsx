import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { MessageCircle, Send, Trash2 } from "lucide-react";
import { useState } from "react";
import { professionalDeleteLibraryComment, professionalLearningHub, professionalReplyLibraryComment, professionalSetClientCommentDelete } from "@/lib/learning.functions";

export const Route = createFileRoute("/_authenticated/painel-profissional/comentarios")({ component: ProfessionalComments });

function ProfessionalComments() {
  const load = useServerFn(professionalLearningHub);
  const replyFn = useServerFn(professionalReplyLibraryComment);
  const deleteFn = useServerFn(professionalDeleteLibraryComment);
  const setClientDeleteFn = useServerFn(professionalSetClientCommentDelete);
  const qc = useQueryClient();
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [body, setBody] = useState("");
  const { data, isLoading } = useQuery({ queryKey: ["professional-learning-hub"], queryFn: () => load({}) });
  const refresh = () => qc.invalidateQueries({ queryKey: ["professional-learning-hub"] });
  const reply = useMutation({ mutationFn: () => replyFn({ data: { commentId: replyTo!, body } }), onSuccess: async () => { setBody(""); setReplyTo(null); await refresh(); } });
  const remove = useMutation({ mutationFn: (commentId: string) => deleteFn({ data: { commentId } }), onSuccess: refresh });
  const permission = useMutation({ mutationFn: (enabled: boolean) => setClientDeleteFn({ data: { enabled } }), onSuccess: refresh });
  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando comentários…</p>;
  const comments = data?.comments ?? [];
  const clientComments = comments.filter((c:any)=>c.author_kind === "client");
  const clientCanDelete = Boolean(data?.clientCanDeleteComments);

  return <div className="space-y-5">
    <section className="s8-card"><p className="text-xs font-bold uppercase tracking-[.16em] text-primary">Relacionamento</p><h1 className="mt-1 flex items-center gap-2 font-serif text-3xl"><MessageCircle className="h-7 w-7"/> Comentários / Fórum</h1><p className="mt-2 text-sm text-muted-foreground">Responda, modere e controle a exclusão de comentários da biblioteca e dos treinamentos.</p></section>

    <section className="s8-card"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-bold text-primary">Exclusão pelo cliente</p><p className="mt-1 text-sm text-muted-foreground">O profissional sempre pode excluir comentários. O cliente só pode excluir comentários próprios quando esta opção estiver ativa.</p></div><label className="inline-flex cursor-pointer items-center gap-3"><input type="checkbox" checked={clientCanDelete} disabled={permission.isPending} onChange={e=>permission.mutate(e.target.checked)} className="h-5 w-5"/><span className={`rounded-full px-3 py-1 text-xs font-bold ${clientCanDelete ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"}`}>{clientCanDelete ? "Ativado" : "Desativado"}</span></label></div></section>

    <section className="space-y-3">{clientComments.length ? clientComments.map((c:any)=>{const customer = c.customers as any; const replies = comments.filter((r:any)=>r.parent_id===c.id); return <article key={c.id} className="s8-card"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-bold text-primary">{customer?.full_name || c.author_label || "Cliente"}</p><p className="text-xs text-muted-foreground">{customer?.email || ""} · {c.training_id ? "Treinamento" : c.product_key || "Biblioteca"}</p></div><div className="flex items-center gap-2"><span className={`rounded-full px-3 py-1 text-xs font-bold ${c.status === "answered" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"}`}>{c.status === "answered" ? "Respondido" : "Aguardando resposta"}</span><button type="button" disabled={remove.isPending} onClick={()=>{if(window.confirm("Excluir este comentário e as respostas vinculadas?")) remove.mutate(c.id)}} className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2 py-1 text-xs font-bold text-red-700 hover:bg-red-50 disabled:opacity-50"><Trash2 className="h-3.5 w-3.5"/> Excluir</button></div></div><p className="mt-3 whitespace-pre-wrap text-sm">{c.body}</p>{replies.map((r:any)=><div key={r.id} className="mt-3 rounded-xl bg-accent/60 p-3 text-sm"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-xs font-bold text-primary">{r.author_label || "Equipe LDR Essence"}</p><p className="mt-1 whitespace-pre-wrap">{r.body}</p></div><button type="button" disabled={remove.isPending} onClick={()=>{if(window.confirm("Excluir esta resposta?")) remove.mutate(r.id)}} className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-red-200 px-2 py-1 text-xs font-bold text-red-700 hover:bg-red-50 disabled:opacity-50"><Trash2 className="h-3.5 w-3.5"/> Excluir</button></div></div>)}{replyTo===c.id?<div className="mt-4"><textarea value={body} onChange={e=>setBody(e.target.value)} className="min-h-24 w-full rounded-lg border border-border bg-background p-3 text-sm" placeholder="Escreva sua resposta…"/><div className="mt-2 flex gap-2"><button disabled={!body.trim() || reply.isPending} onClick={()=>reply.mutate()} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"><Send className="h-4 w-4"/> Responder</button><button onClick={()=>{setReplyTo(null);setBody("")}} className="rounded-lg border border-border px-4 py-2 text-sm font-bold">Cancelar</button></div></div>:<button onClick={()=>{setReplyTo(c.id);setBody("")}} className="mt-4 rounded-lg border border-primary px-4 py-2 text-sm font-bold text-primary">Responder comentário</button>}</article>}) : <div className="s8-card text-sm text-muted-foreground">Nenhum comentário aguardando atendimento.</div>}</section>
  </div>;
}

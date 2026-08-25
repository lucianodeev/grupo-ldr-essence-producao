import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CalendarDays, MessageCircle, BookOpen, Megaphone, ExternalLink } from "lucide-react";
import { useState } from "react";
import { clientAddLibraryComment, clientLearningHub } from "@/lib/learning.functions";

export const Route = createFileRoute("/_clientarea/cliente/treinamentos")({ component: ClientTrainings });

function ClientTrainings() {
  const load = useServerFn(clientLearningHub);
  const addComment = useServerFn(clientAddLibraryComment);
  const qc = useQueryClient();
  const [message, setMessage] = useState("");
  const [trainingId, setTrainingId] = useState<string | null>(null);
  const { data, isLoading } = useQuery({ queryKey: ["client-learning-hub"], queryFn: () => load({}) });
  const commentMutation = useMutation({ mutationFn: () => addComment({ data: { body: message, trainingId } }), onSuccess: async () => { setMessage(""); await qc.invalidateQueries({ queryKey: ["client-learning-hub"] }); } });

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando treinamentos…</p>;
  if (!data) return <div className="s8-card">Não foi possível carregar seus treinamentos.</div>;

  const active = data.trainings.map((e: any) => e.training_programs).filter(Boolean);
  if (!active.length) return <section className="s8-card"><h1 className="font-serif text-3xl">Meus treinamentos</h1><p className="mt-2 text-sm text-muted-foreground">Você ainda não possui treinamentos. Quando um treinamento for liberado para sua conta, ele aparecerá aqui com módulos, materiais, encontros e fórum.</p></section>;

  return <div className="space-y-6">
    <section className="s8-card"><p className="text-xs font-bold uppercase tracking-[.18em] text-primary">Sua jornada</p><h1 className="mt-1 font-serif text-3xl">Meus treinamentos</h1><p className="mt-2 text-sm text-muted-foreground">Conteúdo, materiais, encontros ao vivo e conversas em um só lugar.</p></section>
    {active.map((training: any) => {
      const modules = data.modules.filter((x: any) => x.training_id === training.id);
      const materials = data.materials.filter((x: any) => x.training_id === training.id);
      const sessions = data.sessions.filter((x: any) => x.training_id === training.id);
      const announcements = data.announcements.filter((x: any) => x.training_id === training.id);
      const comments = data.comments.filter((x: any) => x.training_id === training.id);
      return <section key={training.id} className="s8-card space-y-5">
        <div><h2 className="font-serif text-2xl text-primary">{training.title}</h2><p className="mt-1 text-sm text-muted-foreground">{training.description || "Seu treinamento está disponível."}</p></div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div><h3 className="mb-2 flex items-center gap-2 font-bold"><BookOpen className="h-4 w-4"/> Módulos e materiais</h3>{modules.length ? <div className="space-y-3">{modules.map((m: any) => <div key={m.id} className="rounded-xl border border-border p-4"><p className="font-semibold">{m.title}</p>{m.description ? <p className="mt-1 text-sm text-muted-foreground">{m.description}</p>:null}<div className="mt-3 space-y-2">{materials.filter((x:any)=>x.module_id===m.id).map((mat:any)=><div key={mat.id} className="rounded-lg bg-accent/50 p-3 text-sm"><p className="font-semibold">{mat.title}</p>{mat.url?<a className="mt-1 inline-flex items-center gap-1 text-primary underline" href={mat.url} target="_blank" rel="noreferrer">Abrir material <ExternalLink className="h-3 w-3"/></a>:null}{mat.body?<p className="mt-1 whitespace-pre-wrap">{mat.body}</p>:null}</div>)}</div></div>)}</div>:<p className="text-sm text-muted-foreground">Os módulos serão publicados aqui.</p>}</div>
          <div><h3 className="mb-2 flex items-center gap-2 font-bold"><CalendarDays className="h-4 w-4"/> Próximos encontros</h3>{sessions.length?<div className="space-y-2">{sessions.map((s:any)=><div key={s.id} className="rounded-xl border border-border p-4"><p className="font-semibold">{s.title}</p><p className="text-sm text-muted-foreground">{new Date(s.starts_at).toLocaleString("pt-BR")}</p>{s.meeting_url?<a href={s.meeting_url} target="_blank" rel="noreferrer" className="mt-2 inline-flex rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground">Entrar no encontro</a>:null}</div>)}</div>:<p className="text-sm text-muted-foreground">Nenhum encontro agendado no momento.</p>}</div>
        </div>
        <div><h3 className="mb-2 flex items-center gap-2 font-bold"><Megaphone className="h-4 w-4"/> Avisos</h3>{announcements.length?<div className="space-y-2">{announcements.map((a:any)=><div key={a.id} className="rounded-xl bg-accent/50 p-4"><p className="font-semibold">{a.title}</p><p className="mt-1 text-sm whitespace-pre-wrap">{a.body}</p></div>)}</div>:<p className="text-sm text-muted-foreground">Nenhum aviso novo.</p>}</div>
        <div><h3 className="mb-2 flex items-center gap-2 font-bold"><MessageCircle className="h-4 w-4"/> Fórum e comentários</h3><div className="space-y-2">{comments.map((c:any)=><div key={c.id} className={`rounded-xl border p-3 text-sm ${c.author_kind === "professional" ? "bg-accent/70" : "bg-background"}`}><p className="text-xs font-bold text-primary">{c.author_label || (c.author_kind === "professional" ? "Equipe LDR Essence" : "Cliente")}</p><p className="mt-1 whitespace-pre-wrap">{c.body}</p></div>)}</div><div className="mt-3 flex flex-col gap-2 sm:flex-row"><textarea value={trainingId===training.id?message:""} onFocus={()=>setTrainingId(training.id)} onChange={e=>{setTrainingId(training.id);setMessage(e.target.value)}} className="min-h-20 flex-1 rounded-lg border border-border bg-background p-3 text-sm" placeholder="Escreva uma dúvida ou comentário…"/><button disabled={!message.trim() || trainingId!==training.id || commentMutation.isPending} onClick={()=>commentMutation.mutate()} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-50">Publicar</button></div></div>
      </section>;
    })}
  </div>;
}

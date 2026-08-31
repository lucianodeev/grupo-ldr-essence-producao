import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { Bell, Mail, MessageSquareText, Send, UsersRound } from "lucide-react";
import { toast } from "sonner";
import { professionalNotificationTargets, professionalSendNotification } from "@/lib/notification-center.functions";

export const Route = createFileRoute("/_authenticated/painel-profissional/notificacoes")({ component: NotificationCenter });

type Audience = "client"|"employee"|"professional"|"company";
type AnyRow = Record<string, any>;

const LABELS: Record<Audience,string> = { client:"Clientes", employee:"Funcionários", professional:"Profissionais", company:"Empresas" };

function NotificationCenter() {
  const loadFn = useServerFn(professionalNotificationTargets);
  const sendFn = useServerFn(professionalSendNotification);
  const [data,setData]=useState<any>(null);
  const [loading,setLoading]=useState(true);
  const [audience,setAudience]=useState<Audience>("client");
  const [selected,setSelected]=useState<string[]>([]);
  const [channels,setChannels]=useState<Array<"in_app"|"email"|"sms">>(["in_app","email"]);
  const [eventType,setEventType]=useState<any>("manual");
  const [subject,setSubject]=useState("");
  const [body,setBody]=useState("");
  const [busy,setBusy]=useState(false);

  async function load(){setLoading(true);try{setData(await loadFn());}catch{toast.error("Não foi possível carregar o centro de notificações.");}finally{setLoading(false);}}
  useEffect(()=>{void load();},[]);
  useEffect(()=>setSelected([]),[audience]);

  const rows = useMemo(()=> audience==="client"?(data?.customers??[]):audience==="employee"?(data?.employees??[]):audience==="professional"?(data?.professionals??[]):(data?.organizations??[]),[data,audience]);
  const label=(r:AnyRow)=>r.full_name??r.name??r.email??r.billing_email??"Cadastro";
  const contact=(r:AnyRow)=>[r.email??r.billing_email,r.phone].filter(Boolean).join(" · ") || "Sem e-mail/telefone";
  const toggleChannel=(c:"in_app"|"email"|"sms")=>setChannels(v=>v.includes(c)?v.filter(x=>x!==c):[...v,c]);

  if(loading)return <section className="s8-card text-center">Carregando notificações…</section>;

  return <div className="space-y-6">
    <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Relacionamento</p><h1 className="font-serif text-3xl">Central de notificações</h1><p className="mt-2 max-w-3xl text-sm text-muted-foreground">Envie avisos para clientes, funcionários, empresas e profissionais. Avisos dentro do painel já funcionam. E-mail e SMS ficam na fila até a conexão de um provedor de envio.</p></div>

    <section className="grid gap-4 lg:grid-cols-[.9fr_1.1fr]">
      <div className="s8-card min-w-0"><div className="flex items-center gap-3"><UsersRound className="h-5 w-5 text-primary"/><h2 className="font-serif text-2xl">Destinatários</h2></div>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">{(Object.keys(LABELS) as Audience[]).map(a=><button key={a} type="button" onClick={()=>setAudience(a)} className={`rounded-xl border px-3 py-2 text-sm font-bold ${audience===a?"bg-primary text-primary-foreground":"bg-card"}`}>{LABELS[a]}</button>)}</div>
        <div className="mt-4 flex items-center justify-between gap-3"><p className="text-sm font-bold">{selected.length} selecionado(s)</p><button type="button" className="text-xs font-bold text-primary underline" onClick={()=>setSelected(selected.length===rows.length?[]:rows.map((r:AnyRow)=>r.id))}>{selected.length===rows.length&&rows.length?"Limpar":"Selecionar todos"}</button></div>
        <div className="mt-2 max-h-[28rem] space-y-2 overflow-auto rounded-xl border p-2">{rows.length===0?<p className="p-4 text-sm text-muted-foreground">Nenhum cadastro disponível.</p>:rows.map((r:AnyRow)=><label key={r.id} className="flex cursor-pointer items-start gap-3 rounded-lg p-2 hover:bg-muted/60"><input className="mt-1" type="checkbox" checked={selected.includes(r.id)} onChange={e=>setSelected(v=>e.target.checked?[...v,r.id]:v.filter(id=>id!==r.id))}/><span className="min-w-0"><span className="block break-words text-sm font-bold">{label(r)}</span><span className="block break-all text-xs text-muted-foreground">{contact(r)}</span></span></label>)}</div>
      </div>

      <div className="s8-card min-w-0"><div className="flex items-center gap-3"><Bell className="h-5 w-5 text-primary"/><h2 className="font-serif text-2xl">Criar aviso</h2></div>
        <label className="s8-label mt-4">Motivo</label><select className="s8-field" value={eventType} onChange={e=>setEventType(e.target.value)}><option value="manual">Aviso geral</option><option value="appointment">Agendamento</option><option value="credit_reminder">Lembrar crédito disponível</option><option value="no_credit_offer">Oferta sem crédito disponível</option><option value="birthday">Aniversário</option><option value="vacation">Férias</option><option value="day_off">Folga</option></select>
        <label className="s8-label mt-4">Canais</label><div className="grid gap-2 sm:grid-cols-3"><Channel active={channels.includes("in_app")} onClick={()=>toggleChannel("in_app")} icon={Bell} label="No painel"/><Channel active={channels.includes("email")} onClick={()=>toggleChannel("email")} icon={Mail} label="E-mail"/><Channel active={channels.includes("sms")} onClick={()=>toggleChannel("sms")} icon={MessageSquareText} label="SMS"/></div>
        <label className="s8-label mt-4">Assunto</label><input className="s8-field" value={subject} onChange={e=>setSubject(e.target.value)} placeholder="Opcional para avisos dentro do painel"/>
        <label className="s8-label mt-4">Mensagem</label><textarea className="s8-field min-h-36" value={body} onChange={e=>setBody(e.target.value)} placeholder="Escreva uma mensagem clara e acolhedora."/>
        <button type="button" disabled={busy||!selected.length||!body.trim()||!channels.length} onClick={async()=>{setBusy(true);try{const result=await sendFn({data:{audienceType:audience,targetIds:selected,channels,eventType,subject,body}});toast.success(result.providerPending?`Aviso criado. ${result.providerPending} envio(s) aguardam provedor de e-mail/SMS.`:"Aviso enviado no painel.");setBody("");setSubject("");await load();}catch(e){toast.error(e instanceof Error?e.message:"Não foi possível criar o aviso.");}finally{setBusy(false);}}} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-bold text-primary-foreground disabled:opacity-50"><Send className="h-4 w-4"/>{busy?"Criando…":"Enviar / colocar na fila"}</button>
      </div>
    </section>

    <section className="s8-card"><h2 className="font-serif text-2xl">Histórico recente</h2><div className="mt-4 space-y-2">{(data?.recent??[]).length===0?<p className="text-sm text-muted-foreground">Nenhum aviso criado ainda.</p>:(data.recent as AnyRow[]).slice(0,30).map(n=><div key={n.id} className="flex flex-wrap items-start justify-between gap-3 rounded-xl border bg-card p-3"><div className="min-w-0"><p className="break-words text-sm font-bold">{n.subject||n.event_type}</p><p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{n.body}</p></div><div className="text-right text-xs"><span className="rounded-full bg-muted px-2 py-1 font-bold">{n.channel} · {n.status}</span><p className="mt-2 text-muted-foreground">{new Date(n.created_at).toLocaleString("pt-BR")}</p></div></div>)}</div></section>
  </div>;
}

function Channel({active,onClick,icon:Icon,label}:{active:boolean;onClick:()=>void;icon:any;label:string}){return <button type="button" onClick={onClick} className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-bold ${active?"border-primary bg-primary/10 text-primary":"bg-card"}`}><Icon className="h-4 w-4"/>{label}</button>}

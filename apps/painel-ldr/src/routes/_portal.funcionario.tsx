import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Building2, Gift, LogOut } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { LanguageSelect } from "@/lib/i18n";
import { employeeContext, employeeRequestBenefit } from "@/lib/organization-portal.functions";

export const Route = createFileRoute("/_portal/funcionario")({ component: EmployeePortal });

type AnyRow = Record<string, any>;

function EmployeePortal() {
  const navigate = useNavigate();
  const getContext = useServerFn(employeeContext);
  const requestBenefit = useServerFn(employeeRequestBenefit);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try { setData(await getContext()); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Não foi possível carregar seus benefícios."); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);

  async function signOut() { await supabase.auth.signOut(); navigate({ to: "/funcionario/login", replace: true }); }

  if (loading) return <div className="min-h-screen p-6"><div className="s8-card mx-auto max-w-md text-center">Carregando benefícios…</div></div>;

  return <div className="min-h-screen" style={{ background: "var(--cream)" }}>
    <header className="text-primary-foreground" style={{ background: "linear-gradient(135deg, var(--wine-deep), var(--wine))" }}><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6"><div><p className="font-serif text-xl sm:text-2xl">Grupo LDR Essence</p><p className="text-xs opacity-80">Área do Funcionário</p></div><div className="flex items-center gap-3"><LanguageSelect/><button type="button" onClick={signOut} className="flex items-center gap-2 rounded-lg border border-white/30 px-3 py-2 text-sm font-bold"><LogOut className="h-4 w-4"/>Sair</button></div></div></header>
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {data?.status === "unlinked" ? <Message title="Acesso ainda não vinculado" text="Não localizamos seu e-mail na lista de funcionários de uma empresa. Peça ao responsável da empresa para cadastrar exatamente o e-mail desta conta Google."/> : data?.status === "blocked" ? <Message title="Benefício temporariamente inativo" text="Seu cadastro existe, mas a empresa desativou o acesso aos benefícios. Fale com o responsável da sua empresa."/> : <>
        <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Seus benefícios</p><h1 className="mt-1 font-serif text-3xl sm:text-4xl">Olá, {data?.member?.full_name}</h1><p className="mt-2 text-sm text-muted-foreground">Aqui aparecem somente os serviços que sua empresa comprou e atribuiu a você.</p></div>{data?.organization?.name && <span className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-2 text-xs font-bold text-primary"><Building2 className="h-4 w-4"/>{data.organization.name}</span>}</div>
        <section className="mt-7 grid gap-4 sm:grid-cols-2">{(data?.benefits ?? []).length === 0 ? <div className="s8-card sm:col-span-2"><Gift className="h-6 w-6 text-primary"/><h2 className="mt-3 font-serif text-2xl">Nenhum benefício liberado ainda</h2><p className="mt-2 text-sm text-muted-foreground">Quando sua empresa concluir uma compra e selecionar você como beneficiário, o serviço aparecerá aqui automaticamente.</p></div> : (data.benefits as AnyRow[]).map((benefit) => {
          const remaining = Math.max(Number(benefit.credits_granted) - Number(benefit.credits_used), 0);
          const assigned = benefit.status === "assigned";
          return <article key={benefit.id} className="s8-card min-w-0"><div className="flex items-start justify-between gap-3"><span className="rounded-2xl bg-primary/10 p-3 text-primary"><Gift className="h-5 w-5"/></span><span className="rounded-full bg-muted px-2.5 py-1 text-xs font-bold">{benefit.status === "assigned" ? "Disponível" : benefit.status === "requested" ? "Solicitado" : benefit.status === "used" ? "Utilizado" : benefit.status}</span></div><h2 className="mt-4 break-words font-serif text-2xl">{benefit.service?.name ?? "Benefício"}</h2><div className="mt-3 rounded-xl bg-primary/5 p-3"><p className="text-sm"><strong>{remaining}</strong> de {benefit.credits_granted} crédito(s) disponível(is)</p></div>{assigned && remaining > 0 ? <button type="button" disabled={busyId===benefit.id} onClick={async()=>{setBusyId(benefit.id);try{await requestBenefit({data:{benefitId:benefit.id}});toast.success("Solicitação enviada. A equipe poderá seguir com o agendamento.");await load();}catch(e){toast.error(e instanceof Error?e.message:"Não foi possível solicitar.");}finally{setBusyId(null);}}} className="mt-4 w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground disabled:opacity-60">{busyId===benefit.id?"Enviando…":"Usar / solicitar benefício"}</button> : <p className="mt-4 text-xs text-muted-foreground">{benefit.status === "requested" ? "Sua solicitação já foi registrada e está aguardando organização do atendimento." : "Este benefício não possui crédito disponível para nova solicitação."}</p>}</article>;
        })}</section>
      </>}
    </main>
  </div>;
}

function Message({ title, text }: { title: string; text: string }) { return <section className="s8-card mx-auto max-w-2xl text-center"><h1 className="font-serif text-3xl">{title}</h1><p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">{text}</p></section>; }

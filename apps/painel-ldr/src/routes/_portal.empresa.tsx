import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { Building2, CheckCircle2, CreditCard, LogOut, Plus, UsersRound } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { LanguageSelect } from "@/lib/i18n";
import { organizationAddMember, organizationCheckout, organizationContext, organizationCreate, organizationDashboard, organizationSetMemberActive } from "@/lib/organization-portal.functions";

export const Route = createFileRoute("/_portal/empresa")({ component: CompanyPortal });

type AnyRow = Record<string, any>;

function money(cents: number, currency: string) {
  return new Intl.NumberFormat(currency === "BRL" ? "pt-BR" : "pt-PT", { style: "currency", currency }).format(cents / 100);
}

function CompanyPortal() {
  const navigate = useNavigate();
  const getContext = useServerFn(organizationContext);
  const createOrg = useServerFn(organizationCreate);
  const getDashboard = useServerFn(organizationDashboard);
  const addMember = useServerFn(organizationAddMember);
  const setMemberActive = useServerFn(organizationSetMemberActive);
  const startCheckout = useServerFn(organizationCheckout);
  const [loading, setLoading] = useState(true);
  const [context, setContext] = useState<any>(null);
  const [dashboard, setDashboard] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [selectedService, setSelectedService] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  async function load() {
    setLoading(true);
    try {
      const ctx = await getContext();
      setContext(ctx);
      if (ctx.organization) {
        const data = await getDashboard();
        setDashboard(data);
        setSelectedService((current) => current || data.services?.[0]?.catalog_key || "");
      } else setDashboard(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível carregar a empresa.");
    } finally { setLoading(false); }
  }

  useEffect(() => { void load(); }, []);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/empresa/login", replace: true });
  }

  const activeMembers = (dashboard?.members ?? []).filter((m: AnyRow) => m.portal_active);
  const service = (dashboard?.services ?? []).find((s: AnyRow) => s.catalog_key === selectedService);
  const totalCents = service ? Number(service.amount_cents) * selectedMembers.length : 0;
  const eligibleCount = activeMembers.length;
  const canCheckout = Boolean(service && selectedMembers.length >= Number(service.min_quantity) && selectedMembers.length <= Number(service.max_quantity));
  const assignedCount = (dashboard?.benefits ?? []).filter((b: AnyRow) => b.status !== "revoked").length;
  const paidPurchases = (dashboard?.purchases ?? []).filter((p: AnyRow) => p.status === "paid").length;

  if (loading) return <div className="min-h-screen p-6"><div className="s8-card mx-auto max-w-md text-center">Carregando área da empresa…</div></div>;

  return <div className="min-h-screen" style={{ background: "var(--cream)" }}>
    <header className="sticky top-0 z-30 text-primary-foreground shadow-sm" style={{ background: "linear-gradient(135deg, var(--wine-deep), var(--wine))" }}>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div><p className="font-serif text-xl sm:text-2xl">Grupo LDR Essence</p><p className="text-xs opacity-80">Área da Empresa</p></div>
        <div className="flex items-center gap-3"><LanguageSelect /><button type="button" onClick={signOut} className="flex items-center gap-2 rounded-lg border border-white/30 px-3 py-2 text-sm font-bold"><LogOut className="h-4 w-4"/>Sair</button></div>
      </div>
    </header>

    <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
      {!context?.organization ? <CompanySetup busy={busy} setBusy={setBusy} createOrg={createOrg} reload={load} /> : <>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Portal corporativo</p><h1 className="mt-1 font-serif text-3xl sm:text-4xl">{dashboard?.organization?.name}</h1><p className="mt-2 max-w-2xl text-sm text-muted-foreground">Gerencie quem recebe o benefício, escolha o serviço e faça o pagamento centralizado pela empresa.</p></div><span className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-800">Empresa ativa</span></div>

        <section className="grid gap-4 sm:grid-cols-3">
          <Metric icon={UsersRound} label="Funcionários ativos" value={eligibleCount} />
          <Metric icon={CheckCircle2} label="Benefícios liberados" value={assignedCount} />
          <Metric icon={CreditCard} label="Compras pagas" value={paidPurchases} />
        </section>

        <div className="mt-7 grid gap-6 lg:grid-cols-[1.05fr_.95fr]">
          <section className="s8-card min-w-0"><div className="flex items-center gap-3"><UsersRound className="h-5 w-5 text-primary"/><div><h2 className="font-serif text-2xl">Funcionários</h2><p className="text-sm text-muted-foreground">Cadastre quem poderá receber os benefícios.</p></div></div><AddMemberForm busy={busy} setBusy={setBusy} addMember={addMember} reload={load}/><div className="mt-5 space-y-2">{(dashboard?.members ?? []).length === 0 ? <p className="rounded-xl border border-dashed p-5 text-sm text-muted-foreground">Nenhum funcionário cadastrado.</p> : (dashboard.members as AnyRow[]).map((m) => <div key={m.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-3"><div className="min-w-0"><p className="break-words font-bold">{m.full_name}</p><p className="break-all text-xs text-muted-foreground">{m.email}{m.department ? ` · ${m.department}` : ""}</p></div><button type="button" disabled={busy} onClick={async()=>{setBusy(true);try{await setMemberActive({data:{memberId:m.id,active:!m.portal_active}});await load();}catch(e){toast.error(e instanceof Error?e.message:"Não foi possível atualizar.");}finally{setBusy(false);}}} className={`rounded-full px-3 py-1.5 text-xs font-bold ${m.portal_active?"bg-emerald-100 text-emerald-800":"bg-muted text-muted-foreground"}`}>{m.portal_active?"Benefício ativo":"Inativo"}</button></div>)}</div></section>

          <section className="s8-card min-w-0"><div className="flex items-center gap-3"><Building2 className="h-5 w-5 text-primary"/><div><h2 className="font-serif text-2xl">Contratar para a equipe</h2><p className="text-sm text-muted-foreground">A empresa paga e escolhe exatamente quem receberá o benefício.</p></div></div>
            <label className="s8-label mt-5" htmlFor="corporate-service">Serviço</label><select id="corporate-service" className="s8-field" value={selectedService} onChange={(e)=>{setSelectedService(e.target.value);setSelectedMembers([]);}}><option value="">Escolha um serviço</option>{(dashboard?.services ?? []).map((s:AnyRow)=><option key={s.catalog_key} value={s.catalog_key}>{s.name} — {money(Number(s.amount_cents),s.currency)}</option>)}</select>
            {service && <div className="mt-3 rounded-xl bg-primary/5 p-3 text-sm"><p><strong>{money(Number(service.amount_cents),service.currency)}</strong> por {service.unit_label}.</p><p className="mt-1 text-xs text-muted-foreground">Seleção permitida: {service.min_quantity} a {service.max_quantity}. O total é calculado automaticamente.</p>{String(service.catalog_key).startsWith("massagem_laboral") && <p className="mt-2 text-xs font-semibold">Disponível na Bélgica, Portugal e Brasil; outros países conforme demanda e agendamento. Viagem e disponibilidade final são confirmadas conforme local.</p>}</div>}
            <div className="mt-5"><div className="flex items-center justify-between gap-3"><p className="text-sm font-bold">Quem vai receber?</p><button type="button" className="text-xs font-bold text-primary underline" onClick={()=>setSelectedMembers(selectedMembers.length===activeMembers.length?[]:activeMembers.map((m:AnyRow)=>m.id))}>{selectedMembers.length===activeMembers.length&&activeMembers.length?"Limpar":"Selecionar todos"}</button></div><div className="mt-2 max-h-64 space-y-2 overflow-auto rounded-xl border p-2">{activeMembers.length===0?<p className="p-3 text-sm text-muted-foreground">Cadastre funcionários ativos primeiro.</p>:activeMembers.map((m:AnyRow)=><label key={m.id} className="flex cursor-pointer items-center gap-3 rounded-lg p-2 hover:bg-muted/60"><input type="checkbox" checked={selectedMembers.includes(m.id)} onChange={(e)=>setSelectedMembers(v=>e.target.checked?[...v,m.id]:v.filter(id=>id!==m.id))}/><span className="min-w-0"><span className="block break-words text-sm font-semibold">{m.full_name}</span><span className="block break-all text-xs text-muted-foreground">{m.email}</span></span></label>)}</div></div>
            <div className="mt-5 rounded-2xl border bg-card p-4"><div className="flex items-center justify-between gap-3"><span className="text-sm text-muted-foreground">{selectedMembers.length} funcionário(s)</span><strong className="text-xl">{service ? money(totalCents,service.currency) : "—"}</strong></div><button type="button" disabled={busy||!canCheckout} onClick={async()=>{if(!service)return;setBusy(true);try{const result=await startCheckout({data:{catalogKey:service.catalog_key,memberIds:selectedMembers}});window.location.assign(result.url);}catch(e){toast.error(e instanceof Error?e.message:"Não foi possível abrir o pagamento.");setBusy(false);}}} className="mt-4 w-full rounded-xl bg-primary px-4 py-3 font-bold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50">{busy?"Preparando pagamento…":"Pagar pela empresa"}</button>{service&&!canCheckout&&selectedMembers.length>0&&<p className="mt-2 text-xs text-destructive">Para este serviço selecione no mínimo {service.min_quantity} funcionário(s).</p>}</div>
          </section>
        </div>

        <section className="s8-card mt-7"><h2 className="font-serif text-2xl">Compras e benefícios</h2><p className="mt-1 text-sm text-muted-foreground">Após a confirmação da Stripe, os créditos são liberados automaticamente para os funcionários selecionados.</p><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{(dashboard?.purchases??[]).length===0?<p className="text-sm text-muted-foreground">Nenhuma compra corporativa ainda.</p>:(dashboard.purchases as AnyRow[]).map(p=><div key={p.id} className="rounded-xl border bg-card p-3"><p className="text-sm font-bold">{(dashboard.services as AnyRow[]).find(s=>s.catalog_key===p.catalog_key)?.name??p.catalog_key}</p><p className="mt-1 text-xs text-muted-foreground">{p.quantity} funcionário(s) · {new Date(p.created_at).toLocaleDateString("pt-BR")}</p><span className="mt-2 inline-block rounded-full bg-muted px-2 py-1 text-xs font-bold">{p.status}</span></div>)}</div></section>
      </>}
    </main>
  </div>;
}

function Metric({ icon: Icon, label, value }: { icon: any; label: string; value: number }) { return <div className="s8-card flex items-center gap-4"><span className="rounded-2xl bg-primary/10 p-3 text-primary"><Icon className="h-5 w-5"/></span><div><p className="text-2xl font-bold">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div></div>; }

function CompanySetup({ busy, setBusy, createOrg, reload }: any) {
  const [form,setForm]=useState({name:"",country:"",phone:"",taxId:""});
  return <section className="s8-card mx-auto max-w-2xl"><h1 className="font-serif text-3xl">Configurar empresa</h1><p className="mt-2 text-sm text-muted-foreground">Este cadastro cria a área responsável pelos funcionários e pagamentos dos benefícios.</p><form className="mt-5 grid gap-3 sm:grid-cols-2" onSubmit={async(e)=>{e.preventDefault();setBusy(true);try{await createOrg({data:{name:form.name,country:form.country||null,phone:form.phone||null,taxId:form.taxId||null}});toast.success("Empresa configurada.");await reload();}catch(err){toast.error(err instanceof Error?err.message:"Não foi possível criar a empresa.");}finally{setBusy(false);}}}><div className="sm:col-span-2"><label className="s8-label">Nome da empresa</label><input required className="s8-field" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></div><div><label className="s8-label">País</label><input className="s8-field" value={form.country} onChange={e=>setForm({...form,country:e.target.value})}/></div><div><label className="s8-label">Telefone</label><input className="s8-field" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></div><div className="sm:col-span-2"><label className="s8-label">NIF / CNPJ / identificação fiscal</label><input className="s8-field" value={form.taxId} onChange={e=>setForm({...form,taxId:e.target.value})}/></div><button disabled={busy} className="sm:col-span-2 mt-2 rounded-xl bg-primary px-4 py-3 font-bold text-primary-foreground disabled:opacity-60">{busy?"Salvando…":"Criar área da empresa"}</button></form></section>;
}

function AddMemberForm({ busy, setBusy, addMember, reload }: any) {
  const [open,setOpen]=useState(false); const [form,setForm]=useState({fullName:"",email:"",department:"",employeeCode:""});
  if(!open)return <button type="button" onClick={()=>setOpen(true)} className="mt-5 flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold text-primary"><Plus className="h-4 w-4"/>Cadastrar funcionário</button>;
  return <form className="mt-5 rounded-xl border bg-card p-3" onSubmit={async(e)=>{e.preventDefault();setBusy(true);try{await addMember({data:{fullName:form.fullName,email:form.email,department:form.department||null,employeeCode:form.employeeCode||null}});setForm({fullName:"",email:"",department:"",employeeCode:""});setOpen(false);toast.success("Funcionário cadastrado.");await reload();}catch(err){toast.error(err instanceof Error?err.message:"Não foi possível cadastrar.");}finally{setBusy(false);}}}><div className="grid gap-3 sm:grid-cols-2"><input required placeholder="Nome completo" className="s8-field" value={form.fullName} onChange={e=>setForm({...form,fullName:e.target.value})}/><input required type="email" placeholder="E-mail" className="s8-field" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/><input placeholder="Departamento" className="s8-field" value={form.department} onChange={e=>setForm({...form,department:e.target.value})}/><input placeholder="Matrícula/código" className="s8-field" value={form.employeeCode} onChange={e=>setForm({...form,employeeCode:e.target.value})}/></div><div className="mt-3 flex gap-2"><button disabled={busy} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">Salvar</button><button type="button" onClick={()=>setOpen(false)} className="rounded-lg border px-4 py-2 text-sm font-bold">Cancelar</button></div></form>;
}

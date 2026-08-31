import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { Building2, CheckCircle2, CreditCard, Gift, UsersRound } from "lucide-react";
import { toast } from "sonner";
import { professionalCompleteOrganizationBenefit, professionalOrganizations } from "@/lib/organization-admin.functions";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/painel-profissional/empresas")({ component: CompaniesPage });
type AnyRow = Record<string, any>;
type Locale = "pt" | "en" | "fr" | "es";

const COPY = {
  pt: {
    loading:"Carregando empresas…", loadError:"Não foi possível carregar empresas.", eyebrow:"Corporativo", title:"Empresas e funcionários", intro:"Visão operacional das empresas, beneficiários, compras e créditos liberados.",
    companies:"Empresas", employees:"Funcionários", purchases:"Compras", benefits:"Benefícios", noneCompanies:"Nenhuma empresa cadastrada ainda.", company:"Empresa", email:"E-mail", country:"País", phone:"Telefone", status:"Status", active:"ativa", inactive:"inativa",
    noneEmployee:"Nenhum funcionário.", activeEmployee:"ativo", inactiveEmployee:"inativo", nonePurchase:"Nenhuma compra.", employeeCount:"funcionário(s)", credits:"crédito(s)", creditsAndBenefits:"Benefícios e créditos", noneBenefit:"Nenhum benefício liberado.", employee:"Funcionário",
    assigned:"Disponível", requested:"Solicitado", used:"Utilizado", revoked:"Revogado", paid:"Pago", pending:"Pendente", cancelled:"Cancelado", refunded:"Reembolsado", failed:"Falhou",
    complete:"Concluir atendimento", completing:"Concluindo…", completed:"Atendimento concluído e crédito atualizado.", completeError:"Não foi possível concluir este atendimento.", remaining:"restante(s) de", usedLabel:"utilizado(s)",
  },
  en: {
    loading:"Loading companies…", loadError:"Could not load companies.", eyebrow:"Corporate", title:"Companies and employees", intro:"Operational view of companies, beneficiaries, purchases and released credits.",
    companies:"Companies", employees:"Employees", purchases:"Purchases", benefits:"Benefits", noneCompanies:"No companies registered yet.", company:"Company", email:"Email", country:"Country", phone:"Phone", status:"Status", active:"active", inactive:"inactive",
    noneEmployee:"No employees.", activeEmployee:"active", inactiveEmployee:"inactive", nonePurchase:"No purchases.", employeeCount:"employee(s)", credits:"credit(s)", creditsAndBenefits:"Benefits and credits", noneBenefit:"No benefits released.", employee:"Employee",
    assigned:"Available", requested:"Requested", used:"Used", revoked:"Revoked", paid:"Paid", pending:"Pending", cancelled:"Cancelled", refunded:"Refunded", failed:"Failed",
    complete:"Complete service", completing:"Completing…", completed:"Service completed and credit updated.", completeError:"Could not complete this service.", remaining:"remaining of", usedLabel:"used",
  },
  fr: {
    loading:"Chargement des entreprises…", loadError:"Impossible de charger les entreprises.", eyebrow:"Entreprise", title:"Entreprises et collaborateurs", intro:"Vue opérationnelle des entreprises, bénéficiaires, achats et crédits attribués.",
    companies:"Entreprises", employees:"Collaborateurs", purchases:"Achats", benefits:"Avantages", noneCompanies:"Aucune entreprise enregistrée pour le moment.", company:"Entreprise", email:"E-mail", country:"Pays", phone:"Téléphone", status:"Statut", active:"active", inactive:"inactive",
    noneEmployee:"Aucun collaborateur.", activeEmployee:"actif", inactiveEmployee:"inactif", nonePurchase:"Aucun achat.", employeeCount:"collaborateur(s)", credits:"crédit(s)", creditsAndBenefits:"Avantages et crédits", noneBenefit:"Aucun avantage attribué.", employee:"Collaborateur",
    assigned:"Disponible", requested:"Demandé", used:"Utilisé", revoked:"Révoqué", paid:"Payé", pending:"En attente", cancelled:"Annulé", refunded:"Remboursé", failed:"Échec",
    complete:"Terminer la prestation", completing:"Finalisation…", completed:"Prestation terminée et crédit mis à jour.", completeError:"Impossible de terminer cette prestation.", remaining:"restant(s) sur", usedLabel:"utilisé(s)",
  },
  es: {
    loading:"Cargando empresas…", loadError:"No fue posible cargar las empresas.", eyebrow:"Corporativo", title:"Empresas y empleados", intro:"Vista operativa de empresas, beneficiarios, compras y créditos liberados.",
    companies:"Empresas", employees:"Empleados", purchases:"Compras", benefits:"Beneficios", noneCompanies:"Aún no hay empresas registradas.", company:"Empresa", email:"Correo", country:"País", phone:"Teléfono", status:"Estado", active:"activa", inactive:"inactiva",
    noneEmployee:"No hay empleados.", activeEmployee:"activo", inactiveEmployee:"inactivo", nonePurchase:"No hay compras.", employeeCount:"empleado(s)", credits:"crédito(s)", creditsAndBenefits:"Beneficios y créditos", noneBenefit:"No hay beneficios liberados.", employee:"Empleado",
    assigned:"Disponible", requested:"Solicitado", used:"Utilizado", revoked:"Revocado", paid:"Pagado", pending:"Pendiente", cancelled:"Cancelado", refunded:"Reembolsado", failed:"Falló",
    complete:"Completar atención", completing:"Completando…", completed:"Atención completada y crédito actualizado.", completeError:"No fue posible completar esta atención.", remaining:"restante(s) de", usedLabel:"utilizado(s)",
  },
} as const;

const SERVICE_NAMES: Record<string, Record<Locale, string>> = {
  massagem_laboral_10_eu:{pt:"Massagem Laboral — 10 min",en:"Workplace Massage — 10 min",fr:"Massage en entreprise — 10 min",es:"Masaje Laboral — 10 min"},
  massagem_laboral_15_eu:{pt:"Massagem Laboral — 15 min",en:"Workplace Massage — 15 min",fr:"Massage en entreprise — 15 min",es:"Masaje Laboral — 15 min"},
  massagem_laboral_20_eu:{pt:"Massagem Laboral — 20 min",en:"Workplace Massage — 20 min",fr:"Massage en entreprise — 20 min",es:"Masaje Laboral — 20 min"},
  massagem_laboral_30_eu:{pt:"Massagem Laboral — 30 min",en:"Workplace Massage — 30 min",fr:"Massage en entreprise — 30 min",es:"Masaje Laboral — 30 min"},
  massagem_laboral_40_eu:{pt:"Massagem Laboral — até 40 min",en:"Workplace Massage — up to 40 min",fr:"Massage en entreprise — jusqu’à 40 min",es:"Masaje Laboral — hasta 40 min"},
  orientacao_profissional_eu:{pt:"Orientação profissional",en:"Career guidance",fr:"Orientation professionnelle",es:"Orientación profesional"}, orientacao_profissional_br:{pt:"Orientação profissional",en:"Career guidance",fr:"Orientation professionnelle",es:"Orientación profesional"},
  plano_carreira_eu:{pt:"Diagnóstico de Carreira + Plano Profissional",en:"Career Assessment + Professional Plan",fr:"Diagnostic de carrière + Plan professionnel",es:"Diagnóstico de carrera + Plan profesional"}, plano_carreira_br:{pt:"Diagnóstico de Carreira + Plano Profissional",en:"Career Assessment + Professional Plan",fr:"Diagnostic de carrière + Plan professionnel",es:"Diagnóstico de carrera + Plan profesional"},
  transicao_carreira_eu:{pt:"Transição de carreira",en:"Career transition",fr:"Transition de carrière",es:"Transición de carrera"}, transicao_carreira_br:{pt:"Transição de carreira",en:"Career transition",fr:"Transition de carrière",es:"Transición de carrera"},
  carreira_internacional_eu:{pt:"Carreira Internacional",en:"International Career",fr:"Carrière internationale",es:"Carrera internacional"}, carreira_internacional_br:{pt:"Carreira Internacional",en:"International Career",fr:"Carrière internationale",es:"Carrera internacional"},
  mentoria_sessao:{pt:"Sessão Individual de Mentoria",en:"Individual Mentorship Session",fr:"Séance individuelle de mentorat",es:"Sesión individual de mentoría"}, mentoria_4:{pt:"Mentoria — 4 sessões",en:"Mentorship — 4 sessions",fr:"Mentorat — 4 séances",es:"Mentoría — 4 sesiones"}, mentoria_8:{pt:"Mentoria — 8 sessões",en:"Mentorship — 8 sessions",fr:"Mentorat — 8 séances",es:"Mentoría — 8 sesiones"},
  psicanalise_clinica_eu:{pt:"Psicanálise Clínica — Sessão Online",en:"Clinical Psychoanalysis — Online Session",fr:"Psychanalyse clinique — Séance en ligne",es:"Psicoanálisis clínico — Sesión online"}, psicanalise_clinica_br:{pt:"Psicanálise Clínica — Sessão Online",en:"Clinical Psychoanalysis — Online Session",fr:"Psychanalyse clinique — Séance en ligne",es:"Psicoanálisis clínico — Sesión online"},
};

const DATE_LOCALE: Record<Locale,string>={pt:"pt-BR",en:"en-GB",fr:"fr-FR",es:"es-ES"};

function CompaniesPage() {
  const { locale } = useI18n();
  const copy = COPY[locale];
  const loadOrganizations = useServerFn(professionalOrganizations);
  const completeBenefit = useServerFn(professionalCompleteOrganizationBenefit);
  const [data,setData]=useState<any>(null);
  const [loading,setLoading]=useState(true);
  const [selected,setSelected]=useState<string>("");
  const [busyId,setBusyId]=useState<string|null>(null);

  async function load(preserve=true){
    try{
      const result=await loadOrganizations();
      setData(result);
      setSelected(current=>preserve&&current&&result.organizations?.some((o:AnyRow)=>o.id===current)?current:(result.organizations?.[0]?.id??""));
    }catch(e){toast.error(e instanceof Error?e.message:copy.loadError);}finally{setLoading(false);}
  }
  useEffect(()=>{void load(false);},[]);

  const org = useMemo(()=>data?.organizations?.find((o:AnyRow)=>o.id===selected)??null,[data,selected]);
  const members=(data?.members??[]).filter((m:AnyRow)=>m.organization_id===selected);
  const purchases=(data?.purchases??[]).filter((p:AnyRow)=>p.organization_id===selected);
  const benefits=(data?.benefits??[]).filter((b:AnyRow)=>b.organization_id===selected);
  const dbNames=new Map((data?.catalog??[]).map((s:AnyRow)=>[s.catalog_key,s.name]));
  const serviceName=(key:string)=>SERVICE_NAMES[key]?.[locale]??String(dbNames.get(key)??key);
  const statusLabel=(status:string)=>(copy as any)[status]??status;

  if(loading)return <section className="s8-card text-center">{copy.loading}</section>;
  return <div className="min-w-0 space-y-6">
    <div className="min-w-0"><p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">{copy.eyebrow}</p><h1 className="break-words font-serif text-3xl">{copy.title}</h1><p className="mt-2 max-w-3xl break-words text-sm leading-6 text-muted-foreground">{copy.intro}</p></div>
    <section className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric icon={Building2} label={copy.companies} value={data?.organizations?.length??0}/><Metric icon={UsersRound} label={copy.employees} value={data?.members?.length??0}/><Metric icon={CreditCard} label={copy.purchases} value={data?.purchases?.length??0}/><Metric icon={Gift} label={copy.benefits} value={data?.benefits?.length??0}/></section>
    {(data?.organizations??[]).length===0?<section className="s8-card"><p className="text-sm text-muted-foreground">{copy.noneCompanies}</p></section>:<>
      <section className="s8-card min-w-0"><label className="s8-label" htmlFor="org-select">{copy.company}</label><select id="org-select" className="s8-field max-w-xl" value={selected} onChange={e=>setSelected(e.target.value)}>{data.organizations.map((o:AnyRow)=><option key={o.id} value={o.id}>{o.name}</option>)}</select>{org&&<div className="mt-4 grid min-w-0 gap-2 text-sm sm:grid-cols-2"><p className="break-all"><strong>{copy.email}:</strong> {org.billing_email}</p><p className="break-words"><strong>{copy.country}:</strong> {org.country||"—"}</p><p className="break-all"><strong>{copy.phone}:</strong> {org.phone||"—"}</p><p><strong>{copy.status}:</strong> {org.active?copy.active:copy.inactive}</p></div>}</section>
      <section className="grid min-w-0 gap-6 lg:grid-cols-2">
        <div className="s8-card min-w-0"><h2 className="break-words font-serif text-2xl">{copy.employees} ({members.length})</h2><div className="mt-4 space-y-2">{members.length===0?<p className="text-sm text-muted-foreground">{copy.noneEmployee}</p>:members.map((m:AnyRow)=><div key={m.id} className="rounded-xl border bg-card p-3"><div className="flex min-w-0 flex-wrap justify-between gap-2"><div className="min-w-0 flex-1"><p className="break-words font-bold">{m.full_name}</p><p className="break-all text-xs text-muted-foreground">{m.email}{m.department?` · ${m.department}`:""}</p></div><span className="h-fit shrink-0 rounded-full bg-muted px-2 py-1 text-xs font-bold">{m.portal_active?copy.activeEmployee:copy.inactiveEmployee}</span></div></div>)}</div></div>
        <div className="s8-card min-w-0"><h2 className="break-words font-serif text-2xl">{copy.purchases} ({purchases.length})</h2><div className="mt-4 space-y-2">{purchases.length===0?<p className="text-sm text-muted-foreground">{copy.nonePurchase}</p>:purchases.map((p:AnyRow)=><div key={p.id} className="rounded-xl border bg-card p-3"><p className="break-words text-sm font-bold">{serviceName(p.catalog_key)}</p><p className="mt-1 break-words text-xs text-muted-foreground">{p.quantity} {copy.employeeCount} · {new Date(p.created_at).toLocaleDateString(DATE_LOCALE[locale])}</p><span className="mt-2 inline-block rounded-full bg-muted px-2 py-1 text-xs font-bold">{statusLabel(p.status)}</span></div>)}</div></div>
      </section>
      <section className="s8-card min-w-0"><h2 className="break-words font-serif text-2xl">{copy.creditsAndBenefits}</h2><div className="mt-4 grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-3">{benefits.length===0?<p className="text-sm text-muted-foreground">{copy.noneBenefit}</p>:benefits.map((b:AnyRow)=>{const member=members.find((m:AnyRow)=>m.id===b.member_id);const remaining=Math.max(Number(b.credits_granted)-Number(b.credits_used),0);return <div key={b.id} className="min-w-0 rounded-xl border bg-card p-3"><div className="flex min-w-0 items-start justify-between gap-2"><div className="min-w-0"><p className="break-words font-bold">{member?.full_name??copy.employee}</p><p className="mt-1 break-words text-xs text-muted-foreground">{serviceName(b.catalog_key)}</p></div><span className="h-fit shrink-0 rounded-full bg-muted px-2 py-1 text-xs font-bold">{statusLabel(b.status)}</span></div><p className="mt-3 text-sm"><strong>{remaining}</strong> {copy.remaining} {b.credits_granted} {copy.credits}</p><p className="mt-1 text-xs text-muted-foreground">{b.credits_used} {copy.usedLabel}</p>{b.status==="requested"&&<button type="button" disabled={busyId===b.id} onClick={async()=>{setBusyId(b.id);try{await completeBenefit({data:{benefitId:b.id}});toast.success(copy.completed);await load();}catch(e){toast.error(e instanceof Error?e.message:copy.completeError);}finally{setBusyId(null);}}} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2.5 text-center text-sm font-bold text-primary-foreground disabled:opacity-60"><CheckCircle2 className="h-4 w-4"/>{busyId===b.id?copy.completing:copy.complete}</button>}</div>})}</div></section>
    </>}
  </div>;
}
function Metric({icon:Icon,label,value}:{icon:any;label:string;value:number}){return <div className="s8-card flex min-w-0 items-center gap-3"><span className="shrink-0 rounded-xl bg-primary/10 p-2.5 text-primary"><Icon className="h-5 w-5"/></span><div className="min-w-0"><p className="text-xl font-bold">{value}</p><p className="break-words text-xs text-muted-foreground">{label}</p></div></div>}

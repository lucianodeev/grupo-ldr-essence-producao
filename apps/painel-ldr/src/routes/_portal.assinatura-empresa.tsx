import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, CreditCard, RefreshCw, ShieldCheck, Sparkles, UsersRound, XCircle } from "lucide-react";
import { toast } from "sonner";
import { LanguageSelect, useI18n } from "@/lib/i18n";
import {
  calculateCustomCompanyPlan,
  COMPANY_PLAN_PRICING,
  COMPANY_SERVICE_KEYS,
  type CompanyPlanRegion,
  type CompanyServiceKey,
} from "@/lib/company-plan-pricing";
import {
  companySubscriptionCancel,
  companySubscriptionCheckout,
  companySubscriptionContext,
  companySubscriptionResume,
} from "@/lib/company-subscription.functions";

export const Route = createFileRoute("/_portal/assinatura-empresa")({
  head: () => ({ meta: [{ title: "Assinatura da Empresa — Grupo LDR Essence" }, { name: "robots", content: "noindex" }] }),
  component: CompanySubscriptionPage,
});

type Locale = "pt" | "en" | "fr" | "es";
const INTL: Record<Locale, string> = { pt: "pt-PT", en: "en-GB", fr: "fr-FR", es: "es-ES" };
const money = (cents: number, currency: string, locale: Locale) => new Intl.NumberFormat(INTL[locale], { style: "currency", currency }).format(cents / 100);

const COPY = {
  pt: {
    back: "Voltar ao Painel da Empresa", title: "Assinatura da empresa", intro: "Escolha um plano mensal. A renovação é automática, como em serviços de streaming: a empresa mantém o benefício ativo até decidir cancelar.",
    current: "Seu plano atual", active: "Ativa", pending: "Aguardando pagamento", pastDue: "Pagamento pendente", canceled: "Cancelada", other: "Em processamento",
    renews: "Próxima renovação", ends: "Acesso até", cancelRenewal: "Cancelar renovação", keepRenewal: "Manter assinatura", cancelling: "Atualizando…", auto: "Renovação automática mensal", noCommitment: "Cancelamento programado para o fim do período pago", secure: "Pagamento seguro pela Stripe",
    choose: "Escolha seu plano", essential: "LDR Empresa Essencial", pro: "LDR Empresa Pro", custom: "LDR Empresa Personalizado", employees: "funcionários", month: "/mês", subscribe: "Assinar agora", renew: "Renovar assinatura", processing: "Abrindo checkout…",
    customTitle: "Personalize para 51+ funcionários", region: "Região de cobrança", employeeCount: "Quantidade de funcionários", services: "Serviços incluídos", credits: "Créditos extras", total: "Total mensal", configure: "Assinar plano personalizado",
    noCompany: "Configure sua empresa primeiro para contratar uma assinatura.", goCompany: "Ir para Área da Empresa", success: "Assinatura iniciada. A confirmação pode levar alguns segundos.", cancelCheckout: "Pagamento não concluído.", error: "Não foi possível processar a assinatura.", cancelOk: "A renovação automática foi cancelada para o fim do período atual.", resumeOk: "Renovação automática reativada.", currentPlan: "Plano atual — gerencie abaixo antes de contratar outro." },
  en: {
    back: "Back to Company Area", title: "Company subscription", intro: "Choose a monthly plan. Renewal is automatic, like a streaming service: benefits remain active until the company decides to cancel.", current: "Current plan", active: "Active", pending: "Awaiting payment", pastDue: "Payment pending", canceled: "Canceled", other: "Processing", renews: "Next renewal", ends: "Access until", cancelRenewal: "Cancel renewal", keepRenewal: "Keep subscription", cancelling: "Updating…", auto: "Automatic monthly renewal", noCommitment: "Cancellation takes effect at the end of the paid period", secure: "Secure Stripe payment", choose: "Choose your plan", essential: "LDR Company Essential", pro: "LDR Company Pro", custom: "LDR Company Custom", employees: "employees", month: "/month", subscribe: "Subscribe now", renew: "Renew subscription", processing: "Opening checkout…", customTitle: "Customize for 51+ employees", region: "Billing region", employeeCount: "Number of employees", services: "Included services", credits: "Extra credits", total: "Monthly total", configure: "Subscribe to custom plan", noCompany: "Set up your company first to subscribe.", goCompany: "Go to Company Area", success: "Subscription started. Confirmation may take a few seconds.", cancelCheckout: "Payment was not completed.", error: "Could not process the subscription.", cancelOk: "Automatic renewal will stop at the end of the current paid period.", resumeOk: "Automatic renewal restored.", currentPlan: "Current plan — manage it below before subscribing to another." },
  fr: {
    back: "Retour à l’Espace Entreprise", title: "Abonnement entreprise", intro: "Choisissez un plan mensuel. Le renouvellement est automatique, comme un service de streaming, jusqu’à résiliation.", current: "Plan actuel", active: "Actif", pending: "Paiement en attente", pastDue: "Paiement en retard", canceled: "Résilié", other: "En traitement", renews: "Prochain renouvellement", ends: "Accès jusqu’au", cancelRenewal: "Annuler le renouvellement", keepRenewal: "Maintenir l’abonnement", cancelling: "Mise à jour…", auto: "Renouvellement mensuel automatique", noCommitment: "La résiliation prend effet à la fin de la période payée", secure: "Paiement sécurisé Stripe", choose: "Choisissez votre plan", essential: "LDR Entreprise Essentiel", pro: "LDR Entreprise Pro", custom: "LDR Entreprise Personnalisé", employees: "collaborateurs", month: "/mois", subscribe: "S’abonner", renew: "Renouveler", processing: "Ouverture du paiement…", customTitle: "Personnalisez pour 51+ collaborateurs", region: "Région de facturation", employeeCount: "Nombre de collaborateurs", services: "Services inclus", credits: "Crédits supplémentaires", total: "Total mensuel", configure: "Souscrire au plan personnalisé", noCompany: "Configurez d’abord votre entreprise.", goCompany: "Aller à l’Espace Entreprise", success: "Abonnement lancé. La confirmation peut prendre quelques secondes.", cancelCheckout: "Paiement non finalisé.", error: "Impossible de traiter l’abonnement.", cancelOk: "Le renouvellement automatique s’arrêtera à la fin de la période payée.", resumeOk: "Renouvellement automatique réactivé.", currentPlan: "Plan actuel — gérez-le ci-dessous avant d’en souscrire un autre." },
  es: {
    back: "Volver al Área de Empresa", title: "Suscripción de empresa", intro: "Elige un plan mensual. La renovación es automática, como un servicio de streaming, hasta que la empresa decida cancelar.", current: "Plan actual", active: "Activa", pending: "Esperando pago", pastDue: "Pago pendiente", canceled: "Cancelada", other: "En proceso", renews: "Próxima renovación", ends: "Acceso hasta", cancelRenewal: "Cancelar renovación", keepRenewal: "Mantener suscripción", cancelling: "Actualizando…", auto: "Renovación mensual automática", noCommitment: "La cancelación se aplica al final del periodo pagado", secure: "Pago seguro con Stripe", choose: "Elige tu plan", essential: "LDR Empresa Esencial", pro: "LDR Empresa Pro", custom: "LDR Empresa Personalizado", employees: "empleados", month: "/mes", subscribe: "Suscribirse ahora", renew: "Renovar suscripción", processing: "Abriendo pago…", customTitle: "Personaliza para 51+ empleados", region: "Región de cobro", employeeCount: "Cantidad de empleados", services: "Servicios incluidos", credits: "Créditos extra", total: "Total mensual", configure: "Suscribirse al plan personalizado", noCompany: "Configura primero tu empresa.", goCompany: "Ir al Área de Empresa", success: "Suscripción iniciada. La confirmación puede tardar unos segundos.", cancelCheckout: "Pago no completado.", error: "No fue posible procesar la suscripción.", cancelOk: "La renovación automática se cancelará al final del periodo pagado.", resumeOk: "Renovación automática reactivada.", currentPlan: "Plan actual — gestiónalo abajo antes de contratar otro." },
} as const;

const SERVICE_LABELS: Record<CompanyServiceKey, Record<Locale, string>> = {
  psychoanalysis: { pt: "Psicanálise / atendimento individual", en: "Psychoanalysis / individual care", fr: "Psychanalyse / accompagnement individuel", es: "Psicoanálisis / atención individual" },
  career_guidance: { pt: "Orientação Profissional", en: "Career Guidance", fr: "Orientation professionnelle", es: "Orientación Profesional" },
  career: { pt: "Carreira", en: "Career", fr: "Carrière", es: "Carrera" },
  mentoring: { pt: "Mentoria", en: "Mentoring", fr: "Mentorat", es: "Mentoría" },
  workplace_massage: { pt: "Massagem Laboral", en: "Workplace Massage", fr: "Massage en entreprise", es: "Masaje Laboral" },
  wellbeing_hour: { pt: "Hora de Bem-Estar", en: "Wellbeing Hour", fr: "Heure Bien-être", es: "Hora de Bienestar" },
  talks: { pt: "Palestras", en: "Talks", fr: "Conférences", es: "Charlas" },
  training: { pt: "Treinamentos", en: "Training", fr: "Formations", es: "Capacitaciones" },
  corporate_actions: { pt: "Ações corporativas", en: "Corporate actions", fr: "Actions corporate", es: "Acciones corporativas" },
};

function CompanySubscriptionPage() {
  const { locale } = useI18n();
  const copy = COPY[locale];
  const getContext = useServerFn(companySubscriptionContext);
  const checkout = useServerFn(companySubscriptionCheckout);
  const cancelSubscription = useServerFn(companySubscriptionCancel);
  const resumeSubscription = useServerFn(companySubscriptionResume);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [region, setRegion] = useState<CompanyPlanRegion>("EU");
  const [employees, setEmployees] = useState(60);
  const [services, setServices] = useState<CompanyServiceKey[]>(["psychoanalysis"]);
  const [extraCredits, setExtraCredits] = useState<0 | 5 | 10 | 25>(0);
  const pricing = COMPANY_PLAN_PRICING[region];
  const custom = useMemo(() => calculateCustomCompanyPlan({ region, employees, services, extraCredits }), [region, employees, services, extraCredits]);

  async function load() {
    setLoading(true);
    try { setData(await getContext()); } catch { toast.error(copy.error); }
    finally { setLoading(false); }
  }
  useEffect(() => {
    void load();
    const params = new URLSearchParams(window.location.search);
    if (params.get("subscription") === "success") toast.success(copy.success);
    if (params.get("subscription") === "cancel") toast.message(copy.cancelCheckout);
  }, []);

  const subscription = data?.subscription;
  const live = subscription && ["pending", "active", "past_due", "unpaid", "paused", "incomplete"].includes(subscription.status);
  const label = subscription?.plan_code === "essential" ? copy.essential : subscription?.plan_code === "pro" ? copy.pro : copy.custom;
  const statusLabel = subscription?.status === "active" ? copy.active : subscription?.status === "pending" ? copy.pending : subscription?.status === "past_due" ? copy.pastDue : subscription?.status === "canceled" ? copy.canceled : copy.other;

  async function start(planCode: "essential" | "pro" | "custom", count: number, selectedServices: CompanyServiceKey[] = [], credits: 0 | 5 | 10 | 25 = 0) {
    setBusy(true);
    try {
      const result = await checkout({ data: { planCode, region, employees: count, services: selectedServices, extraCredits: credits } });
      window.location.assign(result.url);
    } catch { toast.error(live ? copy.currentPlan : copy.error); setBusy(false); }
  }

  if (loading) return <div className="min-h-screen p-6"><div className="s8-card mx-auto max-w-md text-center">Carregando…</div></div>;
  if (!data?.organization) return <div className="min-h-screen bg-background p-6"><section className="s8-card mx-auto max-w-xl text-center"><h1 className="font-serif text-3xl">{copy.title}</h1><p className="mt-3 text-muted-foreground">{copy.noCompany}</p><Link to="/empresa" className="mt-5 inline-flex rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground">{copy.goCompany}</Link></section></div>;

  return <div className="min-h-screen bg-background text-foreground">
    <header className="border-b bg-card/95"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6"><Link to="/empresa" className="inline-flex items-center gap-2 text-sm font-black text-primary"><ArrowLeft className="h-4 w-4"/>{copy.back}</Link><LanguageSelect/></div></header>
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <section className="rounded-[2rem] bg-primary p-7 text-primary-foreground sm:p-9"><div className="flex flex-wrap items-start justify-between gap-6"><div className="max-w-3xl"><p className="text-xs font-black uppercase tracking-[.18em] text-secondary">LDR RH & Estratégia</p><h1 className="mt-3 font-serif text-4xl sm:text-5xl">{copy.title}</h1><p className="mt-4 max-w-2xl leading-7 opacity-90">{copy.intro}</p></div><div className="grid gap-2 text-sm"><span className="flex items-center gap-2"><RefreshCw className="h-4 w-4 text-secondary"/>{copy.auto}</span><span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-secondary"/>{copy.noCommitment}</span><span className="flex items-center gap-2"><CreditCard className="h-4 w-4 text-secondary"/>{copy.secure}</span></div></div></section>

      {subscription && <section className="s8-card mt-6"><div className="flex flex-wrap items-start justify-between gap-5"><div><p className="text-xs font-black uppercase tracking-[.16em] text-primary">{copy.current}</p><h2 className="mt-2 font-serif text-3xl">{label}</h2><p className="mt-2 text-sm text-muted-foreground">{subscription.employee_count} {copy.employees} · {money(Number(subscription.monthly_amount_cents), subscription.currency, locale)} {copy.month}</p></div><span className={`rounded-full px-3 py-1.5 text-xs font-black ${subscription.status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"}`}>{statusLabel}</span></div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-xl border p-4"><p className="text-xs text-muted-foreground">{subscription.cancel_at_period_end ? copy.ends : copy.renews}</p><p className="mt-1 font-bold">{subscription.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString(INTL[locale]) : "—"}</p></div><div className="rounded-xl border p-4"><p className="text-xs text-muted-foreground">{copy.auto}</p><p className="mt-1 font-bold">{subscription.cancel_at_period_end ? "Não" : "Sim"}</p></div><div className="rounded-xl border p-4"><p className="text-xs text-muted-foreground">Stripe</p><p className="mt-1 font-bold">{subscription.stripe_subscription_id ? "Conectada" : copy.pending}</p></div></div>
        {subscription.stripe_subscription_id && subscription.status !== "canceled" && <div className="mt-5 flex flex-wrap gap-3">{subscription.cancel_at_period_end ? <button disabled={busy} onClick={async()=>{setBusy(true);try{await resumeSubscription();toast.success(copy.resumeOk);await load();}catch{toast.error(copy.error);}finally{setBusy(false);}}} className="rounded-xl bg-primary px-5 py-3 text-sm font-black text-primary-foreground">{busy?copy.cancelling:copy.keepRenewal}</button> : <button disabled={busy} onClick={async()=>{setBusy(true);try{await cancelSubscription();toast.success(copy.cancelOk);await load();}catch{toast.error(copy.error);}finally{setBusy(false);}}} className="rounded-xl border border-destructive/30 px-5 py-3 text-sm font-black text-destructive"><XCircle className="mr-2 inline h-4 w-4"/>{busy?copy.cancelling:copy.cancelRenewal}</button>}</div>}
      </section>}

      <section className="mt-8"><div className="mb-4"><p className="text-xs font-black uppercase tracking-[.16em] text-primary">{copy.choose}</p><h2 className="mt-1 font-serif text-3xl">{copy.choose}</h2></div><div className="grid gap-5 lg:grid-cols-3">
        <PlanCard title={copy.essential} range={`1–10 ${copy.employees}`} price={money(pricing.essentials.monthlyCents, pricing.currency, locale)} month={copy.month} disabled={Boolean(live)||busy} button={subscription?.status === "canceled" ? copy.renew : copy.subscribe} onClick={()=>start("essential", Math.min(Math.max(employees,1),10))}/>
        <PlanCard title={copy.pro} range={`11–50 ${copy.employees}`} price={money(pricing.pro.monthlyCents, pricing.currency, locale)} month={copy.month} featured disabled={Boolean(live)||busy} button={subscription?.status === "canceled" ? copy.renew : copy.subscribe} onClick={()=>start("pro", Math.min(Math.max(employees,11),50))}/>
        <div className="rounded-2xl border bg-card p-6"><Sparkles className="h-7 w-7 text-primary"/><h3 className="mt-4 font-serif text-2xl">{copy.custom}</h3><p className="mt-2 text-sm text-muted-foreground">51+ {copy.employees}</p><p className="mt-5 text-sm font-bold text-primary">{copy.customTitle}</p></div>
      </div></section>

      <section className="s8-card mt-6"><h2 className="font-serif text-2xl">{copy.customTitle}</h2><div className="mt-5 grid gap-5 lg:grid-cols-2"><div><label className="s8-label">{copy.region}</label><select className="s8-field" value={region} onChange={e=>setRegion(e.target.value as CompanyPlanRegion)}><option value="EU">Europa — EUR</option><option value="BR">Brasil — BRL</option></select><label className="s8-label mt-4">{copy.employeeCount}</label><input type="number" min={51} className="s8-field" value={employees} onChange={e=>setEmployees(Math.max(51, Number(e.target.value)||51))}/><label className="s8-label mt-4">{copy.credits}</label><select className="s8-field" value={extraCredits} onChange={e=>setExtraCredits(Number(e.target.value) as 0|5|10|25)}><option value={0}>0</option><option value={5}>5</option><option value={10}>10</option><option value={25}>25</option></select></div><div><p className="s8-label">{copy.services}</p><div className="grid gap-2 sm:grid-cols-2">{COMPANY_SERVICE_KEYS.map(key=><label key={key} className="flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm"><input type="checkbox" checked={services.includes(key)} onChange={e=>setServices(current=>e.target.checked?[...current,key]:current.filter(x=>x!==key))}/><span>{SERVICE_LABELS[key][locale]}</span></label>)}</div></div></div><div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-primary/5 p-5"><div><p className="text-sm text-muted-foreground">{copy.total}</p><p className="text-3xl font-black text-primary">{money(custom.monthlyCents, custom.currency, locale)} <span className="text-sm font-bold text-muted-foreground">{copy.month}</span></p></div><button disabled={Boolean(live)||busy} onClick={()=>start("custom", employees, services, extraCredits)} className="rounded-xl bg-primary px-6 py-3 font-black text-primary-foreground disabled:opacity-50">{busy?copy.processing:copy.configure}</button></div></section>
    </main>
  </div>;
}

function PlanCard({title,range,price,month,button,onClick,disabled,featured}:{title:string;range:string;price:string;month:string;button:string;onClick:()=>void;disabled:boolean;featured?:boolean}) {
  return <div className={`rounded-2xl border bg-card p-6 ${featured?"ring-2 ring-primary/20":""}`}><div className="flex items-start justify-between gap-3"><UsersRound className="h-7 w-7 text-primary"/>{featured&&<span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-black text-primary">PRO</span>}</div><h3 className="mt-4 font-serif text-2xl">{title}</h3><p className="mt-2 text-sm text-muted-foreground">{range}</p><p className="mt-5 text-3xl font-black">{price}<span className="text-sm font-semibold text-muted-foreground"> {month}</span></p><div className="mt-5 space-y-2 text-sm"><p className="flex gap-2"><Check className="h-4 w-4 text-primary"/>Painel da Empresa</p><p className="flex gap-2"><Check className="h-4 w-4 text-primary"/>Gestão de funcionários</p><p className="flex gap-2"><Check className="h-4 w-4 text-primary"/>Renovação mensal automática</p></div><button disabled={disabled} onClick={onClick} className="mt-6 w-full rounded-xl bg-primary px-4 py-3 font-black text-primary-foreground disabled:opacity-50">{button}</button></div>;
}

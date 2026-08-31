import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Building2, CheckCircle2, CreditCard, LogOut, Plus, UsersRound } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { LanguageSelect, useI18n } from "@/lib/i18n";
import { organizationAddMember, organizationCheckout, organizationContext, organizationCreate, organizationDashboard, organizationSetMemberActive } from "@/lib/organization-portal.functions";

export const Route = createFileRoute("/_portal/empresa")({ component: CompanyPortal });

type AnyRow = Record<string, any>;

type Locale = "pt" | "en" | "fr" | "es";

const COPY = {
  pt: {
    area: "Área da Empresa", signOut: "Sair", loading: "Carregando área da empresa…", loadError: "Não foi possível carregar a empresa.",
    portal: "Portal corporativo", intro: "Gerencie quem recebe o benefício, escolha o serviço e faça o pagamento centralizado pela empresa.", activeCompany: "Empresa ativa",
    activeEmployees: "Funcionários ativos", releasedBenefits: "Benefícios liberados", paidPurchases: "Compras pagas",
    employees: "Funcionários", employeesHint: "Cadastre quem poderá receber os benefícios.", noneEmployees: "Nenhum funcionário cadastrado.", activeBenefit: "Benefício ativo", inactive: "Inativo", updateError: "Não foi possível atualizar.",
    hire: "Contratar para a equipe", hireHint: "A empresa paga e escolhe exatamente quem receberá o benefício.", service: "Serviço", chooseService: "Escolha um serviço", perEmployee: "por colaborador", allowed: "Seleção permitida", automaticTotal: "O total é calculado automaticamente.",
    massageAvailability: "Disponível na Bélgica, Portugal e Brasil; outros países conforme demanda e agendamento. Viagem, valores finais e disponibilidade são confirmados conforme o local.",
    recipients: "Quem vai receber?", clear: "Limpar", selectAll: "Selecionar todos", addActiveFirst: "Cadastre funcionários ativos primeiro.", employeesCount: "funcionário(s)", preparing: "Preparando pagamento…", payCompany: "Pagar pela empresa", minimumSelect: "Para este serviço selecione no mínimo", checkoutError: "Não foi possível abrir o pagamento.",
    purchases: "Compras e benefícios", purchaseHint: "Após a confirmação da Stripe, os créditos são liberados automaticamente para os funcionários selecionados.", noPurchase: "Nenhuma compra corporativa ainda.",
    setupTitle: "Configurar empresa", setupText: "Este cadastro cria a área responsável pelos funcionários e pagamentos dos benefícios.", companyName: "Nome da empresa", country: "País", phone: "Telefone", tax: "NIF / CNPJ / identificação fiscal", saving: "Salvando…", createArea: "Criar área da empresa", created: "Empresa configurada.", createError: "Não foi possível criar a empresa.",
    addEmployee: "Cadastrar funcionário", fullName: "Nome completo", email: "E-mail", department: "Departamento", employeeCode: "Matrícula/código", save: "Salvar", cancel: "Cancelar", employeeCreated: "Funcionário cadastrado.", employeeError: "Não foi possível cadastrar.",
    paid: "Pago", pending: "Pendente", failed: "Falhou", cancelled: "Cancelado",
  },
  en: {
    area: "Company Area", signOut: "Sign out", loading: "Loading company area…", loadError: "Could not load the company.",
    portal: "Corporate portal", intro: "Manage who receives each benefit, choose the service and centralize payment through the company.", activeCompany: "Active company",
    activeEmployees: "Active employees", releasedBenefits: "Benefits released", paidPurchases: "Paid purchases",
    employees: "Employees", employeesHint: "Register the people who can receive benefits.", noneEmployees: "No employees registered.", activeBenefit: "Benefit active", inactive: "Inactive", updateError: "Could not update.",
    hire: "Purchase for the team", hireHint: "The company pays and chooses exactly who will receive the benefit.", service: "Service", chooseService: "Choose a service", perEmployee: "per employee", allowed: "Allowed selection", automaticTotal: "The total is calculated automatically.",
    massageAvailability: "Available in Belgium, Portugal and Brazil; other countries according to demand and scheduling. Travel, final pricing and availability are confirmed for the location.",
    recipients: "Who will receive it?", clear: "Clear", selectAll: "Select all", addActiveFirst: "Add active employees first.", employeesCount: "employee(s)", preparing: "Preparing payment…", payCompany: "Pay as company", minimumSelect: "For this service select at least", checkoutError: "Could not open payment.",
    purchases: "Purchases and benefits", purchaseHint: "After Stripe confirms payment, credits are automatically released to the selected employees.", noPurchase: "No corporate purchases yet.",
    setupTitle: "Set up company", setupText: "This registration creates the area responsible for employees and benefit payments.", companyName: "Company name", country: "Country", phone: "Phone", tax: "VAT / tax ID", saving: "Saving…", createArea: "Create company area", created: "Company configured.", createError: "Could not create the company.",
    addEmployee: "Add employee", fullName: "Full name", email: "Email", department: "Department", employeeCode: "Employee ID/code", save: "Save", cancel: "Cancel", employeeCreated: "Employee added.", employeeError: "Could not add employee.",
    paid: "Paid", pending: "Pending", failed: "Failed", cancelled: "Cancelled",
  },
  fr: {
    area: "Espace Entreprise", signOut: "Se déconnecter", loading: "Chargement de l’espace entreprise…", loadError: "Impossible de charger l’entreprise.",
    portal: "Portail entreprise", intro: "Gérez les bénéficiaires, choisissez le service et centralisez le paiement par l’entreprise.", activeCompany: "Entreprise active",
    activeEmployees: "Collaborateurs actifs", releasedBenefits: "Avantages attribués", paidPurchases: "Achats payés",
    employees: "Collaborateurs", employeesHint: "Enregistrez les personnes qui pourront recevoir les avantages.", noneEmployees: "Aucun collaborateur enregistré.", activeBenefit: "Avantage actif", inactive: "Inactif", updateError: "Impossible de mettre à jour.",
    hire: "Souscrire pour l’équipe", hireHint: "L’entreprise paie et choisit exactement qui recevra l’avantage.", service: "Service", chooseService: "Choisissez un service", perEmployee: "par collaborateur", allowed: "Sélection autorisée", automaticTotal: "Le total est calculé automatiquement.",
    massageAvailability: "Disponible en Belgique, au Portugal et au Brésil ; autres pays selon la demande et la planification. Le déplacement, le prix final et la disponibilité sont confirmés selon le lieu.",
    recipients: "Qui va en bénéficier ?", clear: "Effacer", selectAll: "Tout sélectionner", addActiveFirst: "Ajoutez d’abord des collaborateurs actifs.", employeesCount: "collaborateur(s)", preparing: "Préparation du paiement…", payCompany: "Payer par l’entreprise", minimumSelect: "Pour ce service, sélectionnez au minimum", checkoutError: "Impossible d’ouvrir le paiement.",
    purchases: "Achats et avantages", purchaseHint: "Après confirmation du paiement Stripe, les crédits sont automatiquement attribués aux collaborateurs sélectionnés.", noPurchase: "Aucun achat entreprise pour le moment.",
    setupTitle: "Configurer l’entreprise", setupText: "Cette inscription crée l’espace responsable des collaborateurs et du paiement des avantages.", companyName: "Nom de l’entreprise", country: "Pays", phone: "Téléphone", tax: "TVA / identifiant fiscal", saving: "Enregistrement…", createArea: "Créer l’espace entreprise", created: "Entreprise configurée.", createError: "Impossible de créer l’entreprise.",
    addEmployee: "Ajouter un collaborateur", fullName: "Nom complet", email: "E-mail", department: "Département", employeeCode: "Matricule/code", save: "Enregistrer", cancel: "Annuler", employeeCreated: "Collaborateur ajouté.", employeeError: "Impossible d’ajouter le collaborateur.",
    paid: "Payé", pending: "En attente", failed: "Échec", cancelled: "Annulé",
  },
  es: {
    area: "Área de Empresa", signOut: "Salir", loading: "Cargando área de empresa…", loadError: "No fue posible cargar la empresa.",
    portal: "Portal corporativo", intro: "Gestiona quién recibe cada beneficio, elige el servicio y centraliza el pago a través de la empresa.", activeCompany: "Empresa activa",
    activeEmployees: "Empleados activos", releasedBenefits: "Beneficios liberados", paidPurchases: "Compras pagadas",
    employees: "Empleados", employeesHint: "Registra a quienes podrán recibir los beneficios.", noneEmployees: "No hay empleados registrados.", activeBenefit: "Beneficio activo", inactive: "Inactivo", updateError: "No fue posible actualizar.",
    hire: "Contratar para el equipo", hireHint: "La empresa paga y elige exactamente quién recibirá el beneficio.", service: "Servicio", chooseService: "Elige un servicio", perEmployee: "por empleado", allowed: "Selección permitida", automaticTotal: "El total se calcula automáticamente.",
    massageAvailability: "Disponible en Bélgica, Portugal y Brasil; otros países según demanda y agenda. El desplazamiento, los valores finales y la disponibilidad se confirman según el lugar.",
    recipients: "¿Quién lo recibirá?", clear: "Limpiar", selectAll: "Seleccionar todos", addActiveFirst: "Registra primero empleados activos.", employeesCount: "empleado(s)", preparing: "Preparando pago…", payCompany: "Pagar por la empresa", minimumSelect: "Para este servicio selecciona al menos", checkoutError: "No fue posible abrir el pago.",
    purchases: "Compras y beneficios", purchaseHint: "Después de la confirmación de Stripe, los créditos se liberan automáticamente para los empleados seleccionados.", noPurchase: "Aún no hay compras corporativas.",
    setupTitle: "Configurar empresa", setupText: "Este registro crea el área responsable de empleados y pagos de beneficios.", companyName: "Nombre de la empresa", country: "País", phone: "Teléfono", tax: "NIF / CNPJ / identificación fiscal", saving: "Guardando…", createArea: "Crear área de empresa", created: "Empresa configurada.", createError: "No fue posible crear la empresa.",
    addEmployee: "Registrar empleado", fullName: "Nombre completo", email: "Correo electrónico", department: "Departamento", employeeCode: "Matrícula/código", save: "Guardar", cancel: "Cancelar", employeeCreated: "Empleado registrado.", employeeError: "No fue posible registrar al empleado.",
    paid: "Pagado", pending: "Pendiente", failed: "Falló", cancelled: "Cancelado",
  },
} as const;

type Copy = (typeof COPY)[keyof typeof COPY];

const SERVICE_NAMES: Record<string, Record<Locale, string>> = {
  massagem_laboral_10_eu: { pt: "Massagem Laboral — 10 min por colaborador", en: "Workplace Massage — 10 min per employee", fr: "Massage en entreprise — 10 min par collaborateur", es: "Masaje Laboral — 10 min por empleado" },
  massagem_laboral_15_eu: { pt: "Massagem Laboral — 15 min por colaborador", en: "Workplace Massage — 15 min per employee", fr: "Massage en entreprise — 15 min par collaborateur", es: "Masaje Laboral — 15 min por empleado" },
  massagem_laboral_20_eu: { pt: "Massagem Laboral — 20 min por colaborador", en: "Workplace Massage — 20 min per employee", fr: "Massage en entreprise — 20 min par collaborateur", es: "Masaje Laboral — 20 min por empleado" },
  massagem_laboral_30_eu: { pt: "Massagem Laboral — 30 min por colaborador", en: "Workplace Massage — 30 min per employee", fr: "Massage en entreprise — 30 min par collaborateur", es: "Masaje Laboral — 30 min por empleado" },
  massagem_laboral_40_eu: { pt: "Massagem Laboral — até 40 min por colaborador", en: "Workplace Massage — up to 40 min per employee", fr: "Massage en entreprise — jusqu’à 40 min par collaborateur", es: "Masaje Laboral — hasta 40 min por empleado" },
  orientacao_profissional_eu: { pt: "Orientação profissional", en: "Career guidance", fr: "Orientation professionnelle", es: "Orientación profesional" },
  orientacao_profissional_br: { pt: "Orientação profissional", en: "Career guidance", fr: "Orientation professionnelle", es: "Orientación profesional" },
  plano_carreira_eu: { pt: "Diagnóstico de Carreira + Plano Profissional", en: "Career Assessment + Professional Plan", fr: "Diagnostic de carrière + Plan professionnel", es: "Diagnóstico de carrera + Plan profesional" },
  plano_carreira_br: { pt: "Diagnóstico de Carreira + Plano Profissional", en: "Career Assessment + Professional Plan", fr: "Diagnostic de carrière + Plan professionnel", es: "Diagnóstico de carrera + Plan profesional" },
  transicao_carreira_eu: { pt: "Transição de carreira", en: "Career transition", fr: "Transition de carrière", es: "Transición de carrera" },
  transicao_carreira_br: { pt: "Transição de carreira", en: "Career transition", fr: "Transition de carrière", es: "Transición de carrera" },
  carreira_internacional_eu: { pt: "Carreira Internacional", en: "International Career", fr: "Carrière internationale", es: "Carrera internacional" },
  carreira_internacional_br: { pt: "Carreira Internacional", en: "International Career", fr: "Carrière internationale", es: "Carrera internacional" },
  mentoria_sessao: { pt: "Sessão Individual de Mentoria", en: "Individual Mentorship Session", fr: "Séance individuelle de mentorat", es: "Sesión individual de mentoría" },
  mentoria_4: { pt: "Mentoria — 4 sessões", en: "Mentorship — 4 sessions", fr: "Mentorat — 4 séances", es: "Mentoría — 4 sesiones" },
  mentoria_8: { pt: "Mentoria — 8 sessões", en: "Mentorship — 8 sessions", fr: "Mentorat — 8 séances", es: "Mentoría — 8 sesiones" },
  psicanalise_clinica_eu: { pt: "Psicanálise Clínica — Sessão Online", en: "Clinical Psychoanalysis — Online Session", fr: "Psychanalyse clinique — Séance en ligne", es: "Psicoanálisis clínico — Sesión online" },
  psicanalise_clinica_br: { pt: "Psicanálise Clínica — Sessão Online", en: "Clinical Psychoanalysis — Online Session", fr: "Psychanalyse clinique — Séance en ligne", es: "Psicoanálisis clínico — Sesión online" },
};

const INTL_FORMAT: Record<Locale, string> = { pt: "pt-PT", en: "en-GB", fr: "fr-FR", es: "es-ES" };

function money(cents: number, currency: string, locale: Locale) {
  return new Intl.NumberFormat(INTL_FORMAT[locale], { style: "currency", currency }).format(cents / 100);
}

function CompanyPortal() {
  const { locale } = useI18n();
  const copy = COPY[locale];
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
    } catch { toast.error(copy.loadError); }
    finally { setLoading(false); }
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
  const serviceName = (row: AnyRow) => SERVICE_NAMES[row.catalog_key]?.[locale] ?? row.name ?? row.catalog_key;
  const purchaseStatus = (status: string) => status === "paid" ? copy.paid : status === "pending" ? copy.pending : status === "failed" ? copy.failed : status === "cancelled" ? copy.cancelled : status;

  if (loading) return <div className="min-h-screen p-6"><div className="s8-card mx-auto max-w-md text-center">{copy.loading}</div></div>;

  return <div className="min-h-screen" style={{ background: "var(--cream)" }}>
    <header className="sticky top-0 z-30 text-primary-foreground shadow-sm" style={{ background: "linear-gradient(135deg, var(--wine-deep), var(--wine))" }}>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div><p className="font-serif text-xl sm:text-2xl">Grupo LDR Essence</p><p className="text-xs opacity-80">{copy.area}</p></div>
        <div className="flex items-center gap-3"><LanguageSelect /><button type="button" onClick={signOut} className="flex items-center gap-2 rounded-lg border border-white/30 px-3 py-2 text-sm font-bold"><LogOut className="h-4 w-4"/>{copy.signOut}</button></div>
      </div>
    </header>

    <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
      {!context?.organization ? <CompanySetup copy={copy} busy={busy} setBusy={setBusy} createOrg={createOrg} reload={load} /> : <>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">{copy.portal}</p><h1 className="mt-1 break-words font-serif text-3xl sm:text-4xl">{dashboard?.organization?.name}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{copy.intro}</p></div><span className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-800">{copy.activeCompany}</span></div>

        <section className="grid gap-4 sm:grid-cols-3">
          <Metric icon={UsersRound} label={copy.activeEmployees} value={eligibleCount} />
          <Metric icon={CheckCircle2} label={copy.releasedBenefits} value={assignedCount} />
          <Metric icon={CreditCard} label={copy.paidPurchases} value={paidPurchases} />
        </section>

        <div className="mt-7 grid gap-6 lg:grid-cols-[1.05fr_.95fr]">
          <section className="s8-card min-w-0"><div className="flex items-center gap-3"><UsersRound className="h-5 w-5 text-primary"/><div><h2 className="font-serif text-2xl">{copy.employees}</h2><p className="text-sm text-muted-foreground">{copy.employeesHint}</p></div></div><AddMemberForm copy={copy} busy={busy} setBusy={setBusy} addMember={addMember} reload={load}/><div className="mt-5 space-y-2">{(dashboard?.members ?? []).length === 0 ? <p className="rounded-xl border border-dashed p-5 text-sm text-muted-foreground">{copy.noneEmployees}</p> : (dashboard.members as AnyRow[]).map((m) => <div key={m.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-3"><div className="min-w-0"><p className="break-words font-bold">{m.full_name}</p><p className="break-all text-xs text-muted-foreground">{m.email}{m.department ? ` · ${m.department}` : ""}</p></div><button type="button" disabled={busy} onClick={async()=>{setBusy(true);try{await setMemberActive({data:{memberId:m.id,active:!m.portal_active}});await load();}catch{toast.error(copy.updateError);}finally{setBusy(false);}}} className={`rounded-full px-3 py-1.5 text-xs font-bold ${m.portal_active?"bg-emerald-100 text-emerald-800":"bg-muted text-muted-foreground"}`}>{m.portal_active?copy.activeBenefit:copy.inactive}</button></div>)}</div></section>

          <section className="s8-card min-w-0"><div className="flex items-center gap-3"><Building2 className="h-5 w-5 text-primary"/><div><h2 className="font-serif text-2xl">{copy.hire}</h2><p className="text-sm text-muted-foreground">{copy.hireHint}</p></div></div>
            <label className="s8-label mt-5" htmlFor="corporate-service">{copy.service}</label><select id="corporate-service" className="s8-field" value={selectedService} onChange={(e)=>{setSelectedService(e.target.value);setSelectedMembers([]);}}><option value="">{copy.chooseService}</option>{(dashboard?.services ?? []).map((s:AnyRow)=><option key={s.catalog_key} value={s.catalog_key}>{serviceName(s)} — {money(Number(s.amount_cents),s.currency,locale)}</option>)}</select>
            {service && <div className="mt-3 rounded-xl bg-primary/5 p-3 text-sm"><p><strong>{money(Number(service.amount_cents),service.currency,locale)}</strong> {copy.perEmployee}.</p><p className="mt-1 text-xs text-muted-foreground">{copy.allowed}: {service.min_quantity}–{service.max_quantity}. {copy.automaticTotal}</p>{String(service.catalog_key).startsWith("massagem_laboral") && <p className="mt-2 text-xs font-semibold leading-5">{copy.massageAvailability}</p>}</div>}
            <div className="mt-5"><div className="flex items-center justify-between gap-3"><p className="text-sm font-bold">{copy.recipients}</p><button type="button" className="text-xs font-bold text-primary underline" onClick={()=>setSelectedMembers(selectedMembers.length===activeMembers.length?[]:activeMembers.map((m:AnyRow)=>m.id))}>{selectedMembers.length===activeMembers.length&&activeMembers.length?copy.clear:copy.selectAll}</button></div><div className="mt-2 max-h-64 space-y-2 overflow-auto rounded-xl border p-2">{activeMembers.length===0?<p className="p-3 text-sm text-muted-foreground">{copy.addActiveFirst}</p>:activeMembers.map((m:AnyRow)=><label key={m.id} className="flex cursor-pointer items-center gap-3 rounded-lg p-2 hover:bg-muted/60"><input type="checkbox" checked={selectedMembers.includes(m.id)} onChange={(e)=>setSelectedMembers(v=>e.target.checked?[...v,m.id]:v.filter(id=>id!==m.id))}/><span className="min-w-0"><span className="block break-words text-sm font-semibold">{m.full_name}</span><span className="block break-all text-xs text-muted-foreground">{m.email}</span></span></label>)}</div></div>
            <div className="mt-5 rounded-2xl border bg-card p-4"><div className="flex flex-wrap items-center justify-between gap-3"><span className="text-sm text-muted-foreground">{selectedMembers.length} {copy.employeesCount}</span><strong className="whitespace-nowrap text-xl">{service ? money(totalCents,service.currency,locale) : "—"}</strong></div><button type="button" disabled={busy||!canCheckout} onClick={async()=>{if(!service)return;setBusy(true);try{const result=await startCheckout({data:{catalogKey:service.catalog_key,memberIds:selectedMembers}});window.location.assign(result.url);}catch{toast.error(copy.checkoutError);setBusy(false);}}} className="mt-4 w-full rounded-xl bg-primary px-4 py-3 text-center font-bold leading-snug text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50">{busy?copy.preparing:copy.payCompany}</button>{service&&!canCheckout&&selectedMembers.length>0&&<p className="mt-2 text-xs text-destructive">{copy.minimumSelect} {service.min_quantity}.</p>}</div>
          </section>
        </div>

        <section className="s8-card mt-7"><h2 className="font-serif text-2xl">{copy.purchases}</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">{copy.purchaseHint}</p><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{(dashboard?.purchases??[]).length===0?<p className="text-sm text-muted-foreground">{copy.noPurchase}</p>:(dashboard.purchases as AnyRow[]).map(p=>{const srv=(dashboard.services as AnyRow[]).find(s=>s.catalog_key===p.catalog_key);return <div key={p.id} className="rounded-xl border bg-card p-3"><p className="break-words text-sm font-bold">{srv?serviceName(srv):p.catalog_key}</p><p className="mt-1 text-xs text-muted-foreground">{p.quantity} {copy.employeesCount} · {new Date(p.created_at).toLocaleDateString(INTL_FORMAT[locale])}</p><span className="mt-2 inline-block rounded-full bg-muted px-2 py-1 text-xs font-bold">{purchaseStatus(p.status)}</span></div>})}</div></section>
      </>}
    </main>
  </div>;
}

function Metric({ icon: Icon, label, value }: { icon: any; label: string; value: number }) { return <div className="s8-card flex min-w-0 items-center gap-4"><span className="rounded-2xl bg-primary/10 p-3 text-primary"><Icon className="h-5 w-5"/></span><div className="min-w-0"><p className="text-2xl font-bold">{value}</p><p className="break-words text-xs text-muted-foreground">{label}</p></div></div>; }

function CompanySetup({ copy, busy, setBusy, createOrg, reload }: { copy: Copy; busy: boolean; setBusy: (value: boolean) => void; createOrg: any; reload: () => Promise<void> }) {
  const [form,setForm]=useState({name:"",country:"",phone:"",taxId:""});
  return <section className="s8-card mx-auto max-w-2xl"><h1 className="font-serif text-3xl">{copy.setupTitle}</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">{copy.setupText}</p><form className="mt-5 grid gap-3 sm:grid-cols-2" onSubmit={async(e)=>{e.preventDefault();setBusy(true);try{await createOrg({data:{name:form.name,country:form.country||null,phone:form.phone||null,taxId:form.taxId||null}});toast.success(copy.created);await reload();}catch{toast.error(copy.createError);}finally{setBusy(false);}}}><div className="sm:col-span-2"><label className="s8-label">{copy.companyName}</label><input required className="s8-field" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></div><div><label className="s8-label">{copy.country}</label><input className="s8-field" value={form.country} onChange={e=>setForm({...form,country:e.target.value})}/></div><div><label className="s8-label">{copy.phone}</label><input className="s8-field" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></div><div className="sm:col-span-2"><label className="s8-label">{copy.tax}</label><input className="s8-field" value={form.taxId} onChange={e=>setForm({...form,taxId:e.target.value})}/></div><button disabled={busy} className="sm:col-span-2 mt-2 rounded-xl bg-primary px-4 py-3 font-bold text-primary-foreground disabled:opacity-60">{busy?copy.saving:copy.createArea}</button></form></section>;
}

function AddMemberForm({ copy, busy, setBusy, addMember, reload }: { copy: Copy; busy: boolean; setBusy: (value: boolean) => void; addMember: any; reload: () => Promise<void> }) {
  const [open,setOpen]=useState(false); const [form,setForm]=useState({fullName:"",email:"",department:"",employeeCode:""});
  if(!open)return <button type="button" onClick={()=>setOpen(true)} className="mt-5 flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold text-primary"><Plus className="h-4 w-4"/>{copy.addEmployee}</button>;
  return <form className="mt-5 rounded-xl border bg-card p-3" onSubmit={async(e)=>{e.preventDefault();setBusy(true);try{await addMember({data:{fullName:form.fullName,email:form.email,department:form.department||null,employeeCode:form.employeeCode||null}});setForm({fullName:"",email:"",department:"",employeeCode:""});setOpen(false);toast.success(copy.employeeCreated);await reload();}catch{toast.error(copy.employeeError);}finally{setBusy(false);}}}><div className="grid gap-3 sm:grid-cols-2"><input required placeholder={copy.fullName} className="s8-field" value={form.fullName} onChange={e=>setForm({...form,fullName:e.target.value})}/><input required type="email" placeholder={copy.email} className="s8-field" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/><input placeholder={copy.department} className="s8-field" value={form.department} onChange={e=>setForm({...form,department:e.target.value})}/><input placeholder={copy.employeeCode} className="s8-field" value={form.employeeCode} onChange={e=>setForm({...form,employeeCode:e.target.value})}/></div><div className="mt-3 flex flex-wrap gap-2"><button disabled={busy} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">{copy.save}</button><button type="button" onClick={()=>setOpen(false)} className="rounded-lg border px-4 py-2 text-sm font-bold">{copy.cancel}</button></div></form>;
}

import { useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BriefcaseBusiness, Building2, CheckCircle2, Filter, Search, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { LanguageSelect, useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/carreira")({
  head: () => ({ meta: [
    { title: "LDR Carreira | Oportunidades e Talentos" },
    { name: "description", content: "Conectando profissionais e empresas em uma plataforma internacional, inclusiva e gratuita de oportunidades profissionais." },
    { name: "robots", content: "index,follow" },
  ] }),
  component: CareerEntryPage,
});

type Audience = "candidate" | "company";
type FormState = {
  name:string;
  email:string;
  phone:string;
  country:string;
  city:string;
  professionalArea:string;
  opportunityType:string;
  companyName:string;
  companySector:string;
  hiringStatus:string;
  estimatedOpenings:string;
  pcdOpen:boolean;
  accessibilityResources:string;
  interviewSupport:boolean;
  signLanguage:boolean;
  profileApplication:boolean;
  consent:boolean;
};

const empty:FormState={
  name:"",
  email:"",
  phone:"",
  country:"",
  city:"",
  professionalArea:"",
  opportunityType:"employment",
  companyName:"",
  companySector:"",
  hiringStatus:"planning",
  estimatedOpenings:"undefined",
  pcdOpen:false,
  accessibilityResources:"",
  interviewSupport:false,
  signLanguage:false,
  profileApplication:true,
  consent:false,
};

const copy={
pt:{badge:"100% gratuito para profissionais e empresas",title:"Oportunidades encontram talentos, onde quer que estejam.",sub:"Conectamos pessoas que procuram oportunidades a empresas que querem encontrar talentos — com uma experiência simples, humana, segura e inclusiva.",candidate:"Sou profissional",company:"Sou empresa",candidateText:"Cadastre seu interesse e prepare uma candidatura pelo perfil, com dados organizados para reduzir erros, recusas por falta de informação e retrabalho.",companyText:"Publique vagas gratuitamente e informe condições reais de acessibilidade, apoio no processo seletivo e abertura para PcD.",name:"Nome",email:"E-mail",phone:"Telefone (opcional)",country:"País",city:"Cidade (opcional)",area:"Área profissional",opp:"Oportunidade desejada",companyName:"Nome da empresa",sector:"Setor (opcional)",hiring:"Está contratando?",openings:"Quantidade estimada de vagas",pcdOpen:"Vaga aberta para PcD / candidatura inclusiva",accessibilityResources:"Recursos de acessibilidade ou adaptações necessárias/disponíveis",interviewSupport:"Preciso/ofereço apoio no processo seletivo",signLanguage:"Preciso/ofereço língua de sinais ou apoio de comunicação",profileApplication:"Usar candidatura pelo perfil para reduzir erros",filtersTitle:"Filtros inclusivos previstos",filters:"PcD, acessibilidade disponível, apoio em entrevista, remoto/híbrido/presencial e candidatura pelo perfil.",warning:"A empresa deve informar apenas condições reais e seguir a legislação aplicável do país da vaga.",consent:"Autorizo o uso destes dados para contato sobre o LDR Carreira. Posso solicitar correção ou exclusão dos meus dados.",send:"Cadastrar interesse",sending:"Enviando…",success:"Cadastro realizado com sucesso. Recebemos suas informações para conectar você às oportunidades do LDR Carreira.",error:"Não foi possível enviar agora. Confira os dados e tente novamente.",free:"Sem mensalidade",privacy:"Dados protegidos",global:"Preparado para oportunidades internacionais",yes:"Sim",no:"Não",planning:"Planejando",employment:"Emprego",internship:"Estágio",trainee:"Trainee",freelance:"Freelance",temporary:"Temporário",other:"Outro",placeholderCandidate:"Ex.: apoio de comunicação, entrevista online, leitor de tela, acessibilidade física, horário adaptado...",placeholderCompany:"Ex.: entrevista online acessível, língua de sinais sob solicitação, local acessível, adaptação razoável..."},
en:{badge:"100% free for professionals and companies",title:"Opportunities meet talent, wherever they are.",sub:"We connect people looking for opportunities with companies looking for talent — through a simple, human, secure and inclusive experience.",candidate:"I'm a professional",company:"I'm a company",candidateText:"Register your interest and prepare a profile-based application, with organized data to reduce errors, missing information and rework.",companyText:"Post jobs for free and state real accessibility conditions, selection-process support and openness to disabled candidates.",name:"Name",email:"Email",phone:"Phone (optional)",country:"Country",city:"City (optional)",area:"Professional area",opp:"Opportunity type",companyName:"Company name",sector:"Sector (optional)",hiring:"Are you hiring?",openings:"Estimated openings",pcdOpen:"Open to disabled candidates / inclusive application",accessibilityResources:"Accessibility resources or accommodations needed/available",interviewSupport:"I need/offer support during the selection process",signLanguage:"I need/offer sign language or communication support",profileApplication:"Use profile-based application to reduce errors",filtersTitle:"Planned inclusive filters",filters:"Disabled candidates, accessibility available, interview support, remote/hybrid/on-site and profile-based application.",warning:"Companies must state only real conditions and follow the applicable law in the job country.",consent:"I authorize the use of this data to contact me about LDR Carreira. I can request correction or deletion.",send:"Register interest",sending:"Sending…",success:"Registration completed. We received your information to connect you with LDR Carreira opportunities.",error:"Unable to submit now. Check the information and try again.",free:"No subscription",privacy:"Protected data",global:"Ready for international opportunities",yes:"Yes",no:"No",planning:"Planning",employment:"Employment",internship:"Internship",trainee:"Trainee",freelance:"Freelance",temporary:"Temporary",other:"Other",placeholderCandidate:"E.g. communication support, online interview, screen reader, physical accessibility, adapted schedule...",placeholderCompany:"E.g. accessible online interview, sign language on request, accessible workplace, reasonable accommodation..."},
fr:{badge:"100 % gratuit pour les professionnels et les entreprises",title:"Les opportunités rencontrent les talents, où qu’ils soient.",sub:"Nous mettons en relation les personnes à la recherche d'opportunités et les entreprises à la recherche de talents, dans une expérience simple, humaine, sécurisée et inclusive.",candidate:"Je suis professionnel",company:"Je suis une entreprise",candidateText:"Enregistrez votre intérêt et préparez une candidature à partir du profil, avec des données organisées pour réduire les erreurs et les informations manquantes.",companyText:"Publiez gratuitement des offres et indiquez les conditions réelles d’accessibilité, le soutien au processus de sélection et l’ouverture aux personnes en situation de handicap.",name:"Nom",email:"E-mail",phone:"Téléphone (facultatif)",country:"Pays",city:"Ville (facultatif)",area:"Domaine professionnel",opp:"Type d'opportunité",companyName:"Nom de l'entreprise",sector:"Secteur (facultatif)",hiring:"Recrutez-vous ?",openings:"Nombre estimé de postes",pcdOpen:"Ouvert aux personnes en situation de handicap / candidature inclusive",accessibilityResources:"Ressources d’accessibilité ou aménagements nécessaires/disponibles",interviewSupport:"J’ai besoin/propose un soutien au processus de sélection",signLanguage:"J’ai besoin/propose une langue des signes ou un soutien à la communication",profileApplication:"Utiliser la candidature par profil pour réduire les erreurs",filtersTitle:"Filtres inclusifs prévus",filters:"Handicap, accessibilité disponible, soutien à l’entretien, télétravail/hybride/présentiel et candidature par profil.",warning:"L’entreprise doit indiquer uniquement des conditions réelles et respecter la législation applicable dans le pays de l’offre.",consent:"J'autorise l'utilisation de ces données pour me contacter au sujet de LDR Carreira. Je peux demander leur correction ou suppression.",send:"Enregistrer mon intérêt",sending:"Envoi…",success:"Inscription réussie. Nous avons reçu vos informations pour vous connecter aux opportunités de LDR Carreira.",error:"Impossible d'envoyer maintenant. Vérifiez les informations et réessayez.",free:"Sans abonnement",privacy:"Données protégées",global:"Prêt pour les opportunités internationales",yes:"Oui",no:"Non",planning:"En préparation",employment:"Emploi",internship:"Stage",trainee:"Trainee",freelance:"Freelance",temporary:"Temporaire",other:"Autre",placeholderCandidate:"Ex. soutien à la communication, entretien en ligne, lecteur d’écran, accessibilité physique, horaire adapté...",placeholderCompany:"Ex. entretien en ligne accessible, langue des signes sur demande, lieu accessible, aménagement raisonnable..."},
es:{badge:"100% gratuito para profesionales y empresas",title:"Las oportunidades encuentran talento, dondequiera que esté.",sub:"Conectamos personas que buscan oportunidades con empresas que buscan talento, mediante una experiencia sencilla, humana, segura e inclusiva.",candidate:"Soy profesional",company:"Soy empresa",candidateText:"Registra tu interés y prepara una candidatura desde el perfil, con datos organizados para reducir errores, información faltante y retrabajo.",companyText:"Publica vacantes gratis e informa condiciones reales de accesibilidad, apoyo en el proceso de selección y apertura a personas con discapacidad.",name:"Nombre",email:"Correo electrónico",phone:"Teléfono (opcional)",country:"País",city:"Ciudad (opcional)",area:"Área profesional",opp:"Tipo de oportunidad",companyName:"Nombre de la empresa",sector:"Sector (opcional)",hiring:"¿Está contratando?",openings:"Cantidad estimada de vacantes",pcdOpen:"Vacante abierta a personas con discapacidad / candidatura inclusiva",accessibilityResources:"Recursos de accesibilidad o ajustes necesarios/disponibles",interviewSupport:"Necesito/ofrezco apoyo en el proceso de selección",signLanguage:"Necesito/ofrezco lengua de señas o apoyo de comunicación",profileApplication:"Usar candidatura desde el perfil para reducir errores",filtersTitle:"Filtros inclusivos previstos",filters:"Discapacidad, accesibilidad disponible, apoyo en entrevista, remoto/híbrido/presencial y candidatura desde el perfil.",warning:"La empresa debe informar solo condiciones reales y cumplir la legislación aplicable del país de la vacante.",consent:"Autorizo el uso de estos datos para contactarme sobre LDR Carreira. Puedo solicitar su corrección o eliminación.",send:"Registrar interés",sending:"Enviando…",success:"Registro completado. Recibimos tu información para conectarte con oportunidades de LDR Carreira.",error:"No fue posible enviar ahora. Revisa los datos e inténtalo de nuevo.",free:"Sin mensualidad",privacy:"Datos protegidos",global:"Preparado para oportunidades internacionales",yes:"Sí",no:"No",planning:"Planificando",employment:"Empleo",internship:"Prácticas",trainee:"Trainee",freelance:"Freelance",temporary:"Temporal",other:"Otro",placeholderCandidate:"Ej.: apoyo de comunicación, entrevista online, lector de pantalla, accesibilidad física, horario adaptado...",placeholderCompany:"Ej.: entrevista online accesible, lengua de señas bajo solicitud, lugar accesible, ajuste razonable..."}}

function CareerEntryPage(){
  const {locale}=useI18n();
  const t=copy[locale];
  const[audience,setAudience]=useState<Audience>("candidate");
  const[form,setForm]=useState(empty);
  const[status,setStatus]=useState<"idle"|"sending"|"success"|"error">("idle");
  const opportunityOptions=useMemo(()=>[["employment",t.employment],["internship",t.internship],["trainee",t.trainee],["freelance",t.freelance],["temporary",t.temporary],["other",t.other]], [t]);
  const set=(key:keyof FormState,value:string|boolean)=>setForm(v=>({...v,[key]:value}));

  async function submit(e:FormEvent){
    e.preventDefault();
    setStatus("sending");
    const email=form.email.trim().toLowerCase();
    const accessibilitySummary=[
      form.pcdOpen?"PcD/inclusive=yes":"PcD/inclusive=no",
      form.interviewSupport?"selection_support=yes":"selection_support=no",
      form.signLanguage?"sign_language_or_communication_support=yes":"sign_language_or_communication_support=no",
      form.profileApplication?"profile_application=yes":"profile_application=no",
      form.accessibilityResources.trim()?`accessibility_notes=${form.accessibilityResources.trim()}`:"accessibility_notes=not_informed",
    ].join(" | ");
    const payload=audience==="candidate"?{
      audience_type:"candidate",
      name:form.name.trim(),
      email,
      phone:form.phone.trim()||null,
      country:form.country.trim(),
      city:form.city.trim()||null,
      professional_area:[form.professionalArea.trim(),accessibilitySummary].filter(Boolean).join(" — "),
      opportunity_type:form.opportunityType,
      company_name:null,
      company_sector:null,
      hiring_status:null,
      estimated_openings:null,
      consent:form.consent,
    }:{
      audience_type:"company",
      name:form.name.trim(),
      email,
      phone:form.phone.trim()||null,
      country:form.country.trim(),
      city:form.city.trim()||null,
      professional_area:null,
      opportunity_type:null,
      company_name:form.companyName.trim(),
      company_sector:[form.companySector.trim(),accessibilitySummary].filter(Boolean).join(" — ")||null,
      hiring_status:form.hiringStatus,
      estimated_openings:form.estimatedOpenings,
      consent:form.consent,
    };
    const{error}=await supabase.from("career_interest_leads" as never).insert(payload as never);
    if(error){
      console.error("[LDR Carreira] lead submission failed",error.code);
      setStatus("error");
      return;
    }
    setStatus("success");
    setForm(empty);
  }

  const input="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#c99b2d] focus:ring-2 focus:ring-[#c99b2d]/30";
  const card=(active:boolean)=>`rounded-2xl border p-5 text-left transition focus:outline-none focus:ring-2 focus:ring-[#c99b2d] ${active?"border-[#c99b2d] bg-[#fffaf0]":"border-slate-200 bg-white hover:border-slate-300"}`;

  return <main className="min-h-screen bg-[#f8fafc] text-slate-900">
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3 font-semibold text-[#07345b]"><BriefcaseBusiness aria-hidden="true"/> LDR Carreira</div>
        <LanguageSelect/>
      </div>
    </header>

    <section className="bg-gradient-to-br from-[#052844] via-[#07345b] to-[#0b477a] text-white">
      <div className="mx-auto max-w-6xl px-5 py-16 md:py-24">
        <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold">{t.badge}</span>
        <h1 className="mt-6 max-w-4xl text-4xl font-bold tracking-tight md:text-6xl">{t.title}</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-white/85">{t.sub}</p>
        <div className="mt-8 flex flex-wrap gap-3 text-sm" aria-label="Diferenciais">
          <span className="rounded-full bg-white/10 px-4 py-2">✓ {t.free}</span>
          <span className="rounded-full bg-white/10 px-4 py-2">✓ {t.privacy}</span>
          <span className="rounded-full bg-white/10 px-4 py-2">✓ {t.global}</span>
        </div>
      </div>
    </section>

    <section className="mx-auto grid max-w-6xl gap-8 px-5 py-12 lg:grid-cols-[.85fr_1.15fr]">
      <div>
        <h2 className="text-2xl font-bold text-[#07345b]">LDR Carreira</h2>
        <p className="mt-3 leading-7 text-slate-700">{audience==="candidate"?t.candidateText:t.companyText}</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2" role="group" aria-label="Tipo de cadastro">
          <button type="button" onClick={()=>{setAudience("candidate");setStatus("idle")}} className={card(audience==="candidate")} aria-pressed={audience==="candidate"}>
            <UserRound className="mb-3 text-[#07345b]" aria-hidden="true"/><strong>{t.candidate}</strong>
          </button>
          <button type="button" onClick={()=>{setAudience("company");setStatus("idle")}} className={card(audience==="company")} aria-pressed={audience==="company"}>
            <Building2 className="mb-3 text-[#07345b]" aria-hidden="true"/><strong>{t.company}</strong>
          </button>
        </div>
        <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
          <ShieldCheck className="text-[#07345b]" aria-hidden="true"/>
          <p className="mt-2 text-sm leading-6 text-slate-700">{t.privacy}</p>
        </div>
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
          <Sparkles className="mb-2" aria-hidden="true"/>
          {t.warning}
        </div>
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-6 text-slate-700">
          <Filter className="mb-2 text-[#07345b]" aria-hidden="true"/>
          <strong className="block text-[#07345b]">{t.filtersTitle}</strong>
          {t.filters}
        </div>
      </div>

      <form onSubmit={submit} className="rounded-3xl bg-white p-6 shadow-sm md:p-8" aria-describedby="career-form-status">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t.name}><input required minLength={2} maxLength={120} value={form.name} onChange={e=>set("name",e.target.value)} className={input}/></Field>
          <Field label={t.email}><input required type="email" maxLength={254} value={form.email} onChange={e=>set("email",e.target.value)} className={input}/></Field>
          <Field label={t.phone}><input inputMode="tel" maxLength={40} value={form.phone} onChange={e=>set("phone",e.target.value)} className={input}/></Field>
          <Field label={t.country}><input required minLength={2} maxLength={100} value={form.country} onChange={e=>set("country",e.target.value)} className={input}/></Field>
          <Field label={t.city}><input maxLength={120} value={form.city} onChange={e=>set("city",e.target.value)} className={input}/></Field>
          {audience==="candidate"?<>
            <Field label={t.area}><input required maxLength={160} value={form.professionalArea} onChange={e=>set("professionalArea",e.target.value)} className={input}/></Field>
            <Field label={t.opp}><select value={form.opportunityType} onChange={e=>set("opportunityType",e.target.value)} className={input}>{opportunityOptions.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></Field>
          </>:<>
            <Field label={t.companyName}><input required maxLength={180} value={form.companyName} onChange={e=>set("companyName",e.target.value)} className={input}/></Field>
            <Field label={t.sector}><input maxLength={160} value={form.companySector} onChange={e=>set("companySector",e.target.value)} className={input}/></Field>
            <Field label={t.hiring}><select value={form.hiringStatus} onChange={e=>set("hiringStatus",e.target.value)} className={input}><option value="yes">{t.yes}</option><option value="no">{t.no}</option><option value="planning">{t.planning}</option></select></Field>
            <Field label={t.openings}><select value={form.estimatedOpenings} onChange={e=>set("estimatedOpenings",e.target.value)} className={input}><option value="undefined">—</option><option value="1">1</option><option value="2-5">2–5</option><option value="6-10">6–10</option><option value="11+">11+</option></select></Field>
          </>}
        </div>

        <fieldset className="mt-6 rounded-2xl border border-slate-200 p-4">
          <legend className="px-2 text-sm font-semibold text-[#07345b]">{t.filtersTitle}</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <Check label={t.pcdOpen} checked={form.pcdOpen} onChange={v=>set("pcdOpen",v)}/>
            <Check label={t.interviewSupport} checked={form.interviewSupport} onChange={v=>set("interviewSupport",v)}/>
            <Check label={t.signLanguage} checked={form.signLanguage} onChange={v=>set("signLanguage",v)}/>
            <Check label={t.profileApplication} checked={form.profileApplication} onChange={v=>set("profileApplication",v)}/>
          </div>
          <Field label={t.accessibilityResources} className="mt-4">
            <textarea maxLength={700} rows={4} value={form.accessibilityResources} onChange={e=>set("accessibilityResources",e.target.value)} placeholder={audience==="candidate"?t.placeholderCandidate:t.placeholderCompany} className={input}/>
          </Field>
        </fieldset>

        <label className="mt-6 flex cursor-pointer items-start gap-3 text-sm leading-6 text-slate-700">
          <input required type="checkbox" checked={form.consent} onChange={e=>set("consent",e.target.checked)} className="mt-1 h-5 w-5 rounded border-slate-400 focus:ring-2 focus:ring-[#c99b2d]"/>
          <span>{t.consent}</span>
        </label>
        <button disabled={status==="sending"} className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#07345b] px-5 py-3 font-semibold text-white transition hover:bg-[#052844] focus:outline-none focus:ring-2 focus:ring-[#c99b2d] focus:ring-offset-2 disabled:opacity-60">
          {status==="sending"?t.sending:<><Search size={18} aria-hidden="true"/>{t.send}</>}
        </button>
        <div id="career-form-status" aria-live="polite">
          {status==="success"&&<p role="status" className="mt-4 flex gap-2 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800"><CheckCircle2 className="shrink-0" size={20} aria-hidden="true"/>{t.success}</p>}
          {status==="error"&&<p role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-800">{t.error}</p>}
        </div>
      </form>
    </section>
  </main>;
}

function Field({label,children,className=""}:{label:string;children:ReactNode;className?:string}){
  return <label className={`block text-sm font-medium text-slate-700 ${className}`}><span className="mb-2 block">{label}</span>{children}</label>;
}

function Check({label,checked,onChange}:{label:string;checked:boolean;onChange:(value:boolean)=>void}){
  return <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-700">
    <input type="checkbox" checked={checked} onChange={e=>onChange(e.target.checked)} className="mt-1 h-5 w-5 rounded border-slate-400 focus:ring-2 focus:ring-[#c99b2d]"/>
    <span>{label}</span>
  </label>;
}

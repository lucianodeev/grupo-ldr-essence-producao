from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
APP = ROOT / "apps/painel-ldr"
SRC = APP / "src"


def write(rel: str, content: str):
    p = ROOT / rel
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(content.strip() + "\n", encoding="utf-8")


def replace_once(path: Path, old: str, new: str):
    text = path.read_text(encoding="utf-8")
    if new in text:
        return
    if old not in text:
        raise SystemExit(f"Patch anchor not found in {path}: {old[:100]!r}")
    path.write_text(text.replace(old, new, 1), encoding="utf-8")


write("apps/painel-ldr/src/lib/social-clinic.server.ts", r'''
import { randomUUID } from "node:crypto";
import { getRequest } from "@tanstack/react-start/server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { resolveAccess, writeAudit } from "@/lib/access.server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type Client = SupabaseClient<Database>;
const db = supabaseAdmin as unknown as { from: (table: string) => any };
const LUCIANO_SLUG = "luciano-rodrigues-almeida";
const SOCIAL_PRODUCT_KEY = "social_clinic_psychoanalysis_session";
const BRL_FALLBACK = 3000;
const EUR_FALLBACK = 2000;

function fail(message: string): never { throw new Error(message); }
function clean(value: unknown, max = 300) { return String(value ?? "").trim().slice(0, max); }
function origin() {
  const req = getRequest();
  return process.env["CLIENT_PANEL_URL"]?.replace(/\/$/, "") || (req ? new URL(req.url).origin : "https://painel.ldrrhestrategia.com");
}
async function configNumber(key: string, fallback: number) {
  const { data } = await db.from("platform_financial_config").select("numeric_value").eq("config_key", key).eq("active", true).maybeSingle();
  const n = Number(data?.numeric_value);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}
async function configText(key: string) {
  const { data } = await db.from("platform_financial_config").select("text_value").eq("config_key", key).eq("active", true).maybeSingle();
  return data?.text_value ? String(data.text_value) : null;
}

async function stripeRequest(path: string, init?: RequestInit) {
  const secret = process.env["STRIPE_SECRET_KEY"];
  if (!secret) return null;
  const res = await fetch(`https://api.stripe.com${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${secret}`, ...(init?.headers || {}) },
  });
  const payload = await res.json() as any;
  if (!res.ok) throw new Error(payload?.error?.message || "Falha ao configurar Stripe da Clínica Social.");
  return payload;
}

async function ensureSocialClinicStripeCatalog() {
  try {
    const products = await stripeRequest("/v1/products?active=true&limit=100");
    if (!products) return null;
    let product = (products.data ?? []).find((item: any) => item?.metadata?.ldr_key === SOCIAL_PRODUCT_KEY);
    if (!product) {
      const body = new URLSearchParams();
      body.set("name", "Clínica Social LDR de Psicanálise — Sessão");
      body.set("description", "Sessão individual da Clínica Social LDR de Psicanálise.");
      body.set("metadata[ldr_key]", SOCIAL_PRODUCT_KEY);
      body.set("metadata[service]", "clinica_social_psicanalise");
      product = await stripeRequest("/v1/products", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", "Idempotency-Key": "ldr-social-clinic-product-v1" },
        body,
      });
    }
    const prices = await stripeRequest(`/v1/prices?active=true&limit=100&product=${encodeURIComponent(product.id)}`);
    const find = (currency: string, amount: number) => (prices?.data ?? []).find((p: any) => p.currency === currency && Number(p.unit_amount) === amount && p.type === "one_time");
    const ensurePrice = async (currency: "brl"|"eur", amount: number) => {
      const existing = find(currency, amount);
      if (existing) return existing;
      const body = new URLSearchParams();
      body.set("product", product.id);
      body.set("currency", currency);
      body.set("unit_amount", String(amount));
      body.set("metadata[ldr_key]", `${SOCIAL_PRODUCT_KEY}_${currency}`);
      return stripeRequest("/v1/prices", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", "Idempotency-Key": `ldr-social-clinic-${currency}-${amount}-v1` },
        body,
      });
    };
    const [brl, eur] = await Promise.all([ensurePrice("brl", BRL_FALLBACK), ensurePrice("eur", EUR_FALLBACK)]);
    return { productId: product.id, brlPriceId: brl?.id ?? null, eurPriceId: eur?.id ?? null };
  } catch (error) {
    console.error("[social-clinic] Stripe catalog provisioning failed", error);
    return null;
  }
}

export async function getSocialClinicLanding() {
  const [{ data: profile }, brlCents, eurCents, stripe] = await Promise.all([
    db.from("professional_profiles")
      .select("id,professional_account_id,slug,display_name,professional_title,profile_headline,city,country_code,languages,online_enabled,in_person_enabled,photo_url,about,experience_summary,specialties,profile_verified")
      .eq("slug", LUCIANO_SLUG).eq("is_public", true).eq("profile_status", "active").eq("compliance_status", "approved").maybeSingle(),
    configNumber("social_clinic_brl_cents", BRL_FALLBACK),
    configNumber("social_clinic_eur_cents", EUR_FALLBACK),
    ensureSocialClinicStripeCatalog(),
  ]);
  let availability: any[] = [];
  let reviews: any[] = [];
  if (profile?.id) {
    const [{ data: slots }, { data: reviewRows }] = await Promise.all([
      db.from("professional_availability").select("weekday,start_time,end_time,timezone,modality").eq("professional_profile_id", profile.id).eq("active", true).order("weekday").order("start_time"),
      db.from("professional_reviews").select("rating,body,created_at").eq("professional_profile_id", profile.id).eq("status", "published").order("created_at", { ascending: false }).limit(6),
    ]);
    availability = slots ?? [];
    reviews = reviewRows ?? [];
  }
  return {
    profile,
    availability,
    reviews,
    pricing: { brlCents: Math.round(brlCents), eurCents: Math.round(eurCents) },
    commissions: {
      social: await configNumber("commission_social_clinic", 0.07),
      professionalDirect: await configNumber("commission_professional_direct", 0.10),
      ldrGenerated: await configNumber("commission_ldr_generated", 0.15),
    },
    stripe,
  };
}

type PatientInput = {
  fullName: string; birthDate?: string; email: string; phone: string; country: string; city?: string;
  language?: string; modality?: "online"|"in_person"; availability?: string; previousAnalysis?: boolean;
  reason?: string; acceptsSocialValue: boolean; contactConsent: boolean; privacyConsent: boolean; website?: string;
};

export async function submitSocialClinicPatient(input: PatientInput) {
  if (clean(input.website, 100)) return { ok: true as const, protocol: "CSLDR-RECEBIDO" };
  const fullName = clean(input.fullName, 120);
  const email = clean(input.email, 180).toLowerCase();
  const phone = clean(input.phone, 50);
  const country = clean(input.country, 80);
  if (fullName.length < 3 || !email.includes("@") || phone.length < 6 || !country) fail("Preencha nome, e-mail, telefone e país.");
  if (!input.acceptsSocialValue || !input.contactConsent || !input.privacyConsent) fail("É necessário aceitar o valor social, o contato e a política de privacidade.");
  const year = new Date().getUTCFullYear();
  const protocol = `CSLDR-${year}-${randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase()}`;
  const now = new Date().toISOString();
  const details = {
    protocol, source: "social_clinic", status: "new", full_name: fullName, birth_date: clean(input.birthDate, 20) || null,
    email, phone, country, city: clean(input.city, 100) || null, language: clean(input.language, 20) || "pt",
    modality: input.modality || "online", availability: clean(input.availability, 300) || null,
    previous_analysis: Boolean(input.previousAnalysis), reason: clean(input.reason, 1000) || null,
    accepts_social_value: true, contact_consent: true, privacy_consent: true, consented_at: now,
  };
  const { error } = await db.from("audit_logs").insert({ action: "social_clinic.application_submitted", target: protocol, details, actor_email: email });
  if (error) throw error;
  const { data: existing } = await db.from("customers").select("id,source").eq("email", email).maybeSingle();
  if (existing?.id) {
    await db.from("customers").update({ full_name: fullName, phone, source: "social_clinic" }).eq("id", existing.id);
  } else {
    await db.from("customers").insert({ full_name: fullName, email, phone, source: "social_clinic" });
  }
  return { ok: true as const, protocol };
}

type ProfessionalInput = {
  fullName: string; email: string; phone: string; country: string; city?: string; languages?: string;
  education: string; experience?: string; modalities?: string; availability?: string; maxPatients?: number;
  profileSlug?: string; acceptsCommission: boolean; privacyConsent: boolean; website?: string;
};
export async function submitSocialClinicProfessional(input: ProfessionalInput) {
  if (clean(input.website, 100)) return { ok: true as const, protocol: "CSPRO-RECEBIDO" };
  const fullName = clean(input.fullName, 120);
  const email = clean(input.email, 180).toLowerCase();
  if (fullName.length < 3 || !email.includes("@") || !clean(input.phone, 50) || !clean(input.country, 80) || !clean(input.education, 500)) fail("Preencha os dados profissionais obrigatórios.");
  if (!input.acceptsCommission || !input.privacyConsent) fail("É necessário aceitar a comissão social de 7% e a política de privacidade.");
  const protocol = `CSPRO-${new Date().getUTCFullYear()}-${randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase()}`;
  const details = {
    protocol, status: "new", full_name: fullName, email, phone: clean(input.phone, 50), country: clean(input.country, 80), city: clean(input.city, 100) || null,
    languages: clean(input.languages, 200) || null, education: clean(input.education, 800), experience: clean(input.experience, 1200) || null,
    modalities: clean(input.modalities, 100) || null, availability: clean(input.availability, 500) || null,
    max_patients: Math.max(1, Math.min(50, Number(input.maxPatients || 5))), profile_slug: clean(input.profileSlug, 100) || null,
    accepts_social_commission: true, commission_rate: 0.07, privacy_consent: true, consented_at: new Date().toISOString(),
  };
  const { error } = await db.from("audit_logs").insert({ action: "social_clinic.professional_application_submitted", target: protocol, details, actor_email: email });
  if (error) throw error;
  return { ok: true as const, protocol };
}

async function requireSuperadmin(supabase: Client, userId: string) {
  const access = await resolveAccess(supabase, userId);
  if (!access.authorized || access.role !== "superadmin") fail("Acesso negado.");
  return access;
}

export async function getSocialClinicAdmin(supabase: Client, userId: string) {
  await requireSuperadmin(supabase, userId);
  const { data: events } = await db.from("audit_logs").select("id,action,target,actor_email,details,created_at").like("action", "social_clinic.%").order("created_at", { ascending: false }).limit(1000);
  const latest = new Map<string, any>();
  const applications = new Map<string, any>();
  for (const event of (events ?? []).slice().reverse()) {
    if (!event.target) continue;
    if (event.action.endsWith("application_submitted")) applications.set(event.target, { ...event.details, protocol: event.target, submitted_at: event.created_at, application_kind: event.action.includes("professional_") ? "professional" : "patient" });
    if (event.action === "social_clinic.application_status_changed" || event.action === "social_clinic.professional_status_changed") latest.set(event.target, event.details);
  }
  const rows = [...applications.values()].map((item) => ({ ...item, ...(latest.get(item.protocol) || {}) })).sort((a,b) => String(b.submitted_at).localeCompare(String(a.submitted_at)));
  const landing = await getSocialClinicLanding();
  return { applications: rows, pricing: landing.pricing, commissions: landing.commissions, stripe: landing.stripe };
}

export async function updateSocialClinicStatus(supabase: Client, userId: string, input: { protocol: string; kind: "patient"|"professional"; status: string; note?: string }) {
  const actor = await requireSuperadmin(supabase, userId);
  const protocol = clean(input.protocol, 80);
  const status = clean(input.status, 50);
  if (!protocol || !["new","under_review","contacted","awaiting_schedule","scheduled","active","approved","rejected","paused","suspended","inactive","closed"].includes(status)) fail("Status inválido.");
  await writeAudit({ actorId: userId, actorEmail: actor.email, action: input.kind === "professional" ? "social_clinic.professional_status_changed" : "social_clinic.application_status_changed", target: protocol, details: { status, note: clean(input.note, 500) || null, updated_at: new Date().toISOString() } });
  return { ok: true as const };
}

export async function updateSocialClinicConfig(supabase: Client, userId: string, input: { brlCents: number; eurCents: number; socialPct: number; directPct: number; ldrPct: number }) {
  const actor = await requireSuperadmin(supabase, userId);
  const entries = [
    ["social_clinic_brl_cents", Math.round(Number(input.brlCents))], ["social_clinic_eur_cents", Math.round(Number(input.eurCents))],
    ["commission_social_clinic", Number(input.socialPct) / 100], ["commission_professional_direct", Number(input.directPct) / 100], ["commission_ldr_generated", Number(input.ldrPct) / 100],
  ] as const;
  if (entries.some(([,v]) => !Number.isFinite(v) || v < 0)) fail("Configuração financeira inválida.");
  if (input.brlCents < 100 || input.eurCents < 100 || input.socialPct > 50 || input.directPct > 50 || input.ldrPct > 50) fail("Valores fora do limite permitido.");
  for (const [config_key, numeric_value] of entries) {
    const { data: existing } = await db.from("platform_financial_config").select("config_key").eq("config_key", config_key).maybeSingle();
    if (existing) await db.from("platform_financial_config").update({ numeric_value, text_value: config_key.includes("commission") ? `${numeric_value * 100}%` : String(numeric_value), active: true }).eq("config_key", config_key);
    else await db.from("platform_financial_config").insert({ config_key, numeric_value, text_value: config_key.includes("commission") ? `${numeric_value * 100}%` : String(numeric_value), active: true });
  }
  await writeAudit({ actorId: userId, actorEmail: actor.email, action: "social_clinic.financial_config_updated", target: "social_clinic", details: { brl_cents: input.brlCents, eur_cents: input.eurCents, social_pct: input.socialPct, direct_pct: input.directPct, ldr_pct: input.ldrPct } });
  return { ok: true as const };
}
''')

write("apps/painel-ldr/src/lib/social-clinic.functions.ts", r'''
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const socialClinicLanding = createServerFn({ method: "GET" }).handler(async () => {
  const { getSocialClinicLanding } = await import("@/lib/social-clinic.server");
  return getSocialClinicLanding();
});

export const socialClinicApply = createServerFn({ method: "POST" }).inputValidator((data: any) => data).handler(async ({ data }) => {
  const { submitSocialClinicPatient } = await import("@/lib/social-clinic.server");
  return submitSocialClinicPatient(data);
});

export const socialClinicProfessionalApply = createServerFn({ method: "POST" }).inputValidator((data: any) => data).handler(async ({ data }) => {
  const { submitSocialClinicProfessional } = await import("@/lib/social-clinic.server");
  return submitSocialClinicProfessional(data);
});

export const socialClinicAdmin = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { getSocialClinicAdmin } = await import("@/lib/social-clinic.server");
  return getSocialClinicAdmin(context.supabase, context.userId);
});

export const socialClinicAdminStatus = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data: any) => data).handler(async ({ context, data }) => {
  const { updateSocialClinicStatus } = await import("@/lib/social-clinic.server");
  return updateSocialClinicStatus(context.supabase, context.userId, data);
});

export const socialClinicAdminConfig = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data: any) => data).handler(async ({ context, data }) => {
  const { updateSocialClinicConfig } = await import("@/lib/social-clinic.server");
  return updateSocialClinicConfig(context.supabase, context.userId, data);
});
''')

write("apps/painel-ldr/src/routes/clinica-social.tsx", r'''
import { Link, createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { type FormEvent, useState } from "react";
import { ArrowRight, BadgeCheck, CalendarDays, CheckCircle2, HeartHandshake, ShieldCheck, UsersRound } from "lucide-react";
import { LanguageSelect, useI18n } from "@/lib/i18n";
import { socialClinicApply, socialClinicLanding } from "@/lib/social-clinic.functions";

export const Route = createFileRoute("/clinica-social")({
  loader: () => socialClinicLanding(),
  head: () => ({ meta: [
    { title: "Clínica Social LDR de Psicanálise" },
    { name: "description", content: "Atendimento psicanalítico com valor social: R$ 30 no Brasil e € 20 na Europa, mediante cadastro e disponibilidade." },
  ]}),
  component: SocialClinicPage,
});

const WINE="#5b0824", NAVY="#0b1428", GOLD="#c9a63a", CREAM="#fbf8f1";
const copy:any = {
  pt:{eyebrow:"CLÍNICA SOCIAL LDR DE PSICANÁLISE",title:"Um espaço de escuta com valor social",sub:"A Clínica Social LDR amplia o acesso à Psicanálise com atendimentos individuais, organização profissional e confidencialidade.",apply:"QUERO ME CADASTRAR",area:"ENTRAR NA MINHA ÁREA",what:"O que é a Clínica Social?",whatText:"Uma iniciativa do ecossistema LDR para adultos que desejam iniciar ou continuar um processo de análise com um valor social. O cadastro é uma solicitação e o atendimento depende da disponibilidade de agenda.",how:"Como funciona",professional:"Quem realiza os atendimentos",form:"Solicitar atendimento",formation:"Conheça também a Formação em Psicanálise LDR",formationText:"A Clínica Social integra o ecossistema de Psicanálise da LDR. Conheça a formação estruturada em estudo teórico, atividades, análise pessoal e desenvolvimento progressivo da prática clínica.",formationCta:"CONHECER A FORMAÇÃO",emergency:"A Clínica Social LDR não é um serviço de emergência. Em situações de risco imediato, emergência médica ou psiquiátrica, procure os serviços de emergência da sua região.",submit:"ENVIAR SOLICITAÇÃO",provider:"QUERO ATENDER NA CLÍNICA SOCIAL"},
  en:{eyebrow:"LDR SOCIAL PSYCHOANALYSIS CLINIC",title:"A listening space at a social rate",sub:"The LDR Social Clinic expands access to psychoanalysis with individual sessions, professional organization and confidentiality.",apply:"APPLY FOR CARE",area:"MY AREA",what:"What is the Social Clinic?",whatText:"An LDR initiative for adults who want to begin or continue psychoanalysis at a social rate. Registration is a request and care depends on availability.",how:"How it works",professional:"Who provides care",form:"Request care",formation:"Discover the LDR Psychoanalysis Training",formationText:"The Social Clinic is part of LDR's psychoanalysis ecosystem, alongside a structured training pathway.",formationCta:"VIEW TRAINING",emergency:"The LDR Social Clinic is not an emergency service. In immediate risk or a medical/psychiatric emergency, contact your local emergency services.",submit:"SEND REQUEST",provider:"I WANT TO JOIN THE SOCIAL CLINIC"},
  fr:{eyebrow:"CLINIQUE SOCIALE LDR DE PSYCHANALYSE",title:"Un espace d'écoute à tarif social",sub:"La Clinique Sociale LDR élargit l'accès à la psychanalyse avec des séances individuelles, une organisation professionnelle et la confidentialité.",apply:"DEMANDER UN ACCOMPAGNEMENT",area:"MON ESPACE",what:"Qu'est-ce que la Clinique Sociale ?",whatText:"Une initiative LDR pour les adultes qui souhaitent commencer ou poursuivre une analyse à tarif social. L'inscription est une demande et dépend des disponibilités.",how:"Comment ça marche",professional:"Qui assure les séances",form:"Demander un accompagnement",formation:"Découvrez aussi la Formation en Psychanalyse LDR",formationText:"La Clinique Sociale fait partie de l'écosystème de psychanalyse LDR, avec une formation structurée.",formationCta:"DÉCOUVRIR LA FORMATION",emergency:"La Clinique Sociale LDR n'est pas un service d'urgence. En cas de risque immédiat ou d'urgence médicale/psychiatrique, contactez les services d'urgence de votre région.",submit:"ENVOYER LA DEMANDE",provider:"JE VEUX REJOINDRE LA CLINIQUE SOCIALE"},
  es:{eyebrow:"CLÍNICA SOCIAL LDR DE PSICOANÁLISIS",title:"Un espacio de escucha con valor social",sub:"La Clínica Social LDR amplía el acceso al psicoanálisis con sesiones individuales, organización profesional y confidencialidad.",apply:"QUIERO REGISTRARME",area:"MI ÁREA",what:"¿Qué es la Clínica Social?",whatText:"Una iniciativa LDR para adultos que desean iniciar o continuar un proceso de análisis con valor social. El registro es una solicitud y depende de disponibilidad.",how:"Cómo funciona",professional:"Quién realiza las sesiones",form:"Solicitar atención",formation:"Conoce también la Formación en Psicoanálisis LDR",formationText:"La Clínica Social forma parte del ecosistema de psicoanálisis LDR, junto con una formación estructurada.",formationCta:"CONOCER LA FORMACIÓN",emergency:"La Clínica Social LDR no es un servicio de emergencia. Ante un riesgo inmediato o emergencia médica/psiquiátrica, busca los servicios de emergencia de tu región.",submit:"ENVIAR SOLICITUD",provider:"QUIERO ATENDER EN LA CLÍNICA SOCIAL"}
};
function money(cents:number,currency:"BRL"|"EUR"){return new Intl.NumberFormat(currency==="BRL"?"pt-BR":"pt-PT",{style:"currency",currency}).format(cents/100)}

function SocialClinicPage(){
  const {locale}=useI18n(); const c=copy[locale]||copy.pt; const data:any=Route.useLoaderData(); const apply=useServerFn(socialClinicApply);
  const [busy,setBusy]=useState(false),[done,setDone]=useState(""),[error,setError]=useState("");
  const profile=data?.profile;
  async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);setError("");const fd=new FormData(e.currentTarget);try{const r:any=await apply({data:{fullName:fd.get("fullName"),birthDate:fd.get("birthDate"),email:fd.get("email"),phone:fd.get("phone"),country:fd.get("country"),city:fd.get("city"),language:fd.get("language"),modality:fd.get("modality"),availability:fd.get("availability"),previousAnalysis:fd.get("previousAnalysis")==="yes",reason:fd.get("reason"),acceptsSocialValue:fd.get("acceptsSocialValue")==="on",contactConsent:fd.get("contactConsent")==="on",privacyConsent:fd.get("privacyConsent")==="on",website:fd.get("website")}});setDone(r.protocol);(e.target as HTMLFormElement).reset()}catch(err:any){setError(err?.message||"Não foi possível enviar.")}finally{setBusy(false)}}
  return <div className="min-h-screen" style={{background:CREAM,color:NAVY}}>
    <header className="border-b bg-white"><div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4"><Link to="/" className="font-serif text-xl font-bold">Grupo LDR Essence</Link><LanguageSelect/></div></header>
    <main>
      <section className="relative overflow-hidden" style={{background:`linear-gradient(135deg,${NAVY},${WINE})`,color:"white"}}><div className="mx-auto max-w-6xl px-4 py-16 sm:py-24"><p className="text-xs font-black tracking-[.22em]" style={{color:GOLD}}>{c.eyebrow}</p><h1 className="mt-4 max-w-4xl font-serif text-4xl leading-tight sm:text-6xl">{c.title}</h1><p className="mt-5 max-w-3xl text-lg text-white/80">{c.sub}</p><div className="mt-8 flex flex-wrap gap-3"><a href="#cadastro" className="rounded-full px-6 py-3 text-sm font-black" style={{background:GOLD,color:NAVY}}>{c.apply}</a><Link to="/cliente/login" className="rounded-full border border-white/40 px-6 py-3 text-sm font-black">{c.area}</Link></div></div></section>
      <section className="mx-auto grid max-w-6xl gap-5 px-4 py-10 sm:grid-cols-2"><div className="rounded-3xl bg-white p-7 shadow-sm"><HeartHandshake style={{color:WINE}}/><h2 className="mt-4 font-serif text-2xl">{c.what}</h2><p className="mt-3 leading-7 text-slate-600">{c.whatText}</p></div><div className="rounded-3xl p-7 text-white" style={{background:NAVY}}><h2 className="font-serif text-2xl">Valor por sessão</h2><div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-white/10 p-4"><div className="text-sm">🇧🇷 Brasil</div><div className="mt-1 text-2xl font-black">{money(data.pricing.brlCents,"BRL")}</div></div><div className="rounded-2xl bg-white/10 p-4"><div className="text-sm">🇪🇺 Europa</div><div className="mt-1 text-2xl font-black">{money(data.pricing.eurCents,"EUR")}</div></div></div><p className="mt-4 text-sm text-white/70">Cadastro → análise → contato → confirmação de vaga → agendamento → pagamento.</p></div></section>
      <section className="mx-auto max-w-6xl px-4 py-8"><h2 className="font-serif text-3xl">{c.how}</h2><div className="mt-6 grid gap-4 sm:grid-cols-4">{[["1","Cadastro"],["2","Análise e contato"],["3","Agendamento"],["4","Pagamento e sessão"]].map(([n,t])=><div key={n} className="rounded-2xl border bg-white p-5"><div className="font-black" style={{color:GOLD}}>{n}</div><div className="mt-2 font-bold">{t}</div></div>)}</div></section>
      <section className="mx-auto max-w-6xl px-4 py-10"><div className="rounded-[2rem] border bg-white p-7 sm:p-9"><p className="text-xs font-black tracking-[.18em]" style={{color:WINE}}>{c.professional}</p><div className="mt-5 grid gap-6 sm:grid-cols-[180px_1fr] sm:items-center">{profile?.photo_url?<img src={profile.photo_url} alt={profile.display_name} className="h-44 w-44 rounded-3xl object-cover"/>:<div className="flex h-44 w-44 items-center justify-center rounded-3xl bg-slate-100"><UsersRound className="h-12 w-12"/></div>}<div><div className="flex items-center gap-2"><h3 className="font-serif text-3xl">{profile?.display_name||"Luciano Rodrigues Almeida"}</h3>{profile?.profile_verified&&<BadgeCheck style={{color:GOLD}}/>}</div><p className="mt-1 font-bold" style={{color:WINE}}>{profile?.professional_title||"Psicanalista"}</p><p className="mt-4 max-w-3xl leading-7 text-slate-600">{profile?.about||profile?.experience_summary||"Atendimento psicanalítico online a adultos, com escuta individual e confidencial."}</p><p className="mt-3 text-sm font-bold">Mais de 3.000 atendimentos realizados.</p><div className="mt-5 flex flex-wrap gap-3"><Link to="/profissional/$slug" params={{slug:"luciano-rodrigues-almeida"}} className="rounded-full px-5 py-2.5 text-sm font-black text-white" style={{background:WINE}}>VER PERFIL E AGENDA</Link><a href="#cadastro" className="rounded-full border px-5 py-2.5 text-sm font-black">{c.apply}</a></div></div></div></div></section>
      <section id="cadastro" className="mx-auto max-w-4xl px-4 py-12"><div className="rounded-[2rem] bg-white p-6 shadow-lg sm:p-9"><div className="flex items-center gap-3"><CalendarDays style={{color:WINE}}/><h2 className="font-serif text-3xl">{c.form}</h2></div><p className="mt-3 text-slate-600">O cadastro não garante atendimento imediato. A equipe LDR entra em contato conforme disponibilidade.</p>{done?<div className="mt-6 rounded-2xl bg-emerald-50 p-5 text-emerald-900"><CheckCircle2 className="mb-2"/>Cadastro recebido. Protocolo: <b>{done}</b></div>:<form onSubmit={submit} className="mt-7 grid gap-4 sm:grid-cols-2"><input name="website" tabIndex={-1} autoComplete="off" className="hidden"/><Field name="fullName" label="Nome completo" required/><Field name="birthDate" label="Data de nascimento" type="date"/><Field name="email" label="E-mail" type="email" required/><Field name="phone" label="WhatsApp / telefone" required/><Field name="country" label="País" required/><Field name="city" label="Cidade"/><Field name="language" label="Idioma preferencial" placeholder="Português, Français..."/><label className="grid gap-1 text-sm font-bold">Modalidade<select name="modality" className="rounded-xl border p-3"><option value="online">Online</option><option value="in_person">Presencial, quando disponível</option></select></label><label className="sm:col-span-2 grid gap-1 text-sm font-bold">Disponibilidade<textarea name="availability" className="min-h-20 rounded-xl border p-3" placeholder="Dias e períodos preferidos"/></label><label className="sm:col-span-2 grid gap-1 text-sm font-bold">Motivo da procura (opcional)<textarea name="reason" className="min-h-24 rounded-xl border p-3" placeholder="Compartilhe somente o que considerar necessário."/></label><label className="flex gap-2 sm:col-span-2"><input type="checkbox" name="previousAnalysis" value="yes"/>Já realizou análise anteriormente</label><Check name="acceptsSocialValue" text="Aceito o valor social informado por sessão."/><Check name="contactConsent" text="Autorizo a equipe LDR a entrar em contato."/><Check name="privacyConsent" text="Li e aceito o tratamento dos dados para esta solicitação, conforme a política de privacidade."/><div className="sm:col-span-2">{error&&<p className="mb-3 text-sm font-bold text-red-700">{error}</p>}<button disabled={busy} className="w-full rounded-full px-6 py-3.5 font-black text-white disabled:opacity-60" style={{background:WINE}}>{busy?"ENVIANDO...":c.submit}</button></div></form>}</div></section>
      <section className="mx-auto max-w-6xl px-4 py-10"><div className="rounded-[2rem] border p-7 sm:flex sm:items-center sm:justify-between" style={{borderColor:GOLD}}><div><h2 className="font-serif text-2xl">{c.formation}</h2><p className="mt-2 max-w-3xl text-slate-600">{c.formationText}</p></div><Link to="/formacao-psicanalise" className="mt-5 inline-flex shrink-0 items-center gap-2 rounded-full px-5 py-3 text-sm font-black sm:mt-0" style={{background:GOLD,color:NAVY}}>{c.formationCta}<ArrowRight className="h-4 w-4"/></Link></div></section>
      <section className="mx-auto max-w-6xl px-4 pb-12"><div className="rounded-2xl bg-amber-50 p-5 text-sm leading-6 text-amber-950"><ShieldCheck className="mb-2"/>{c.emergency}</div><div className="mt-5 text-center"><Link to="/clinica-social/profissionais" className="text-sm font-black underline underline-offset-4">{c.provider}</Link></div></section>
    </main></div>
}
function Field({name,label,type="text",required=false,placeholder=""}:any){return <label className="grid gap-1 text-sm font-bold">{label}<input name={name} type={type} required={required} placeholder={placeholder} className="rounded-xl border p-3 font-normal"/></label>}
function Check({name,text}:any){return <label className="flex gap-2 text-sm sm:col-span-2"><input type="checkbox" name={name} required/><span>{text}</span></label>}
''')

write("apps/painel-ldr/src/routes/clinica-social.profissionais.tsx", r'''
import { Link, createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { type FormEvent, useState } from "react";
import { socialClinicProfessionalApply } from "@/lib/social-clinic.functions";

export const Route=createFileRoute("/clinica-social/profissionais")({component:ProfessionalSocialApplication,head:()=>({meta:[{title:"Profissionais — Clínica Social LDR"}]})});
const WINE="#5b0824",NAVY="#0b1428",GOLD="#c9a63a";
function ProfessionalSocialApplication(){const apply=useServerFn(socialClinicProfessionalApply);const[busy,setBusy]=useState(false),[done,setDone]=useState(""),[error,setError]=useState("");async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);setError("");const f=new FormData(e.currentTarget);try{const r:any=await apply({data:{fullName:f.get("fullName"),email:f.get("email"),phone:f.get("phone"),country:f.get("country"),city:f.get("city"),languages:f.get("languages"),education:f.get("education"),experience:f.get("experience"),modalities:f.get("modalities"),availability:f.get("availability"),maxPatients:Number(f.get("maxPatients")||5),profileSlug:f.get("profileSlug"),acceptsCommission:f.get("acceptsCommission")==="on",privacyConsent:f.get("privacyConsent")==="on",website:f.get("website")}});setDone(r.protocol)}catch(err:any){setError(err?.message||"Não foi possível enviar.")}finally{setBusy(false)}}return <main className="min-h-screen bg-[#fbf8f1] px-4 py-10 text-[#0b1428]"><div className="mx-auto max-w-3xl"><Link to="/clinica-social" className="text-sm font-black">← Clínica Social</Link><div className="mt-6 rounded-[2rem] bg-white p-7 shadow-lg"><p className="text-xs font-black tracking-[.18em]" style={{color:GOLD}}>REDE DE PROFISSIONAIS LDR</p><h1 className="mt-3 font-serif text-4xl">Quero atender na Clínica Social</h1><p className="mt-4 leading-7 text-slate-600">A participação depende de análise e aprovação manual do proprietário/Master. A comissão da LDR para atendimentos da Clínica Social é de <b>7%</b>. A aprovação não garante encaminhamento de pacientes.</p>{done?<div className="mt-6 rounded-2xl bg-emerald-50 p-5"><b>Candidatura recebida.</b><br/>Protocolo: {done}</div>:<form onSubmit={submit} className="mt-7 grid gap-4 sm:grid-cols-2"><input name="website" className="hidden" tabIndex={-1}/><F n="fullName" l="Nome completo" r/><F n="email" l="E-mail" t="email" r/><F n="phone" l="WhatsApp / telefone" r/><F n="country" l="País" r/><F n="city" l="Cidade"/><F n="languages" l="Idiomas" p="pt, fr, en..."/><label className="sm:col-span-2 grid gap-1 text-sm font-bold">Formação<textarea name="education" required className="min-h-20 rounded-xl border p-3 font-normal"/></label><label className="sm:col-span-2 grid gap-1 text-sm font-bold">Experiência<textarea name="experience" className="min-h-20 rounded-xl border p-3 font-normal"/></label><F n="modalities" l="Modalidades" p="Online, presencial"/><F n="availability" l="Disponibilidade semanal"/><F n="maxPatients" l="Máximo de pacientes sociais" t="number" p="5"/><F n="profileSlug" l="Slug do perfil LDR (se já possui)"/><label className="flex gap-2 sm:col-span-2"><input type="checkbox" name="acceptsCommission" required/>Aceito a comissão de 7% por atendimento da Clínica Social.</label><label className="flex gap-2 sm:col-span-2"><input type="checkbox" name="privacyConsent" required/>Aceito o tratamento dos dados para análise desta candidatura.</label>{error&&<p className="sm:col-span-2 text-sm font-bold text-red-700">{error}</p>}<button disabled={busy} className="sm:col-span-2 rounded-full px-6 py-3.5 font-black text-white" style={{background:WINE}}>{busy?"ENVIANDO...":"ENVIAR CANDIDATURA"}</button></form>}</div><div className="mt-5 rounded-2xl p-5 text-white" style={{background:NAVY}}>Já faz parte da Rede LDR? Informe seu perfil na candidatura. Ainda não possui perfil? <Link to="/para-profissionais" className="font-black underline">Conheça a Rede LDR</Link>.</div></div></main>}
function F({n,l,t="text",r=false,p=""}:any){return <label className="grid gap-1 text-sm font-bold">{l}<input name={n} type={t} required={r} placeholder={p} className="rounded-xl border p-3 font-normal"/></label>}
''')

write("apps/painel-ldr/src/routes/_authenticated/admin.clinica-social.tsx", r'''
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { socialClinicAdmin, socialClinicAdminConfig, socialClinicAdminStatus } from "@/lib/social-clinic.functions";

export const Route=createFileRoute("/_authenticated/admin/clinica-social")({component:AdminSocialClinic});
function AdminSocialClinic(){const load=useServerFn(socialClinicAdmin),save=useServerFn(socialClinicAdminConfig),statusFn=useServerFn(socialClinicAdminStatus);const[data,setData]=useState<any>(null),[busy,setBusy]=useState(false);const refresh=async()=>setData(await load());useEffect(()=>{void refresh()},[]);if(!data)return <div className="p-6">Carregando Clínica Social…</div>;const patients=(data.applications||[]).filter((x:any)=>x.application_kind==="patient"),pros=(data.applications||[]).filter((x:any)=>x.application_kind==="professional");async function setStatus(row:any,status:string){setBusy(true);try{await statusFn({data:{protocol:row.protocol,kind:row.application_kind,status}});toast.success("Status atualizado");await refresh()}catch(e:any){toast.error(e?.message||"Erro") }finally{setBusy(false)}}async function saveConfig(e:any){e.preventDefault();const f=new FormData(e.currentTarget);setBusy(true);try{await save({data:{brlCents:Math.round(Number(f.get("brl"))*100),eurCents:Math.round(Number(f.get("eur"))*100),socialPct:Number(f.get("social")),directPct:Number(f.get("direct")),ldrPct:Number(f.get("ldr"))}});toast.success("Configuração salva");await refresh()}catch(e:any){toast.error(e?.message||"Erro") }finally{setBusy(false)}}return <div className="space-y-6 p-4 sm:p-6"><div><h1 className="font-serif text-3xl">Clínica Social</h1><p className="mt-1 text-sm text-muted-foreground">Pacientes, candidaturas profissionais e regras financeiras.</p></div><form onSubmit={saveConfig} className="grid gap-3 rounded-2xl border bg-card p-5 sm:grid-cols-5"><Cfg n="brl" l="Sessão BR (R$)" v={(data.pricing.brlCents/100).toFixed(2)}/><Cfg n="eur" l="Sessão EU (€)" v={(data.pricing.eurCents/100).toFixed(2)}/><Cfg n="social" l="Clínica Social %" v={String(data.commissions.social*100)}/><Cfg n="direct" l="Cliente próprio %" v={String(data.commissions.professionalDirect*100)}/><Cfg n="ldr" l="Cliente LDR %" v={String(data.commissions.ldrGenerated*100)}/><button disabled={busy} className="sm:col-span-5 rounded-xl bg-primary px-4 py-3 font-bold text-primary-foreground">Salvar regras financeiras</button><p className="sm:col-span-5 text-xs text-muted-foreground">Stripe: {data.stripe?.productId?`produto ${data.stripe.productId} · BR ${data.stripe.brlPriceId} · EU ${data.stripe.eurPriceId}`:"catálogo será provisionado automaticamente quando a chave Stripe estiver disponível"}</p></form><Queue title="Solicitações de pacientes" rows={patients} busy={busy} onStatus={setStatus}/><Queue title="Candidaturas de profissionais" rows={pros} busy={busy} onStatus={setStatus}/></div>}
function Cfg({n,l,v}:any){return <label className="grid gap-1 text-xs font-bold">{l}<input name={n} defaultValue={v} type="number" step="0.01" className="rounded-xl border bg-background p-3 text-sm"/></label>}
function Queue({title,rows,busy,onStatus}:any){return <section className="rounded-2xl border bg-card p-5"><h2 className="font-serif text-xl">{title}</h2><div className="mt-4 space-y-3">{rows.length===0?<p className="text-sm text-muted-foreground">Nenhum cadastro até o momento.</p>:rows.map((r:any)=><div key={r.protocol} className="rounded-xl border p-4"><div className="flex flex-wrap justify-between gap-2"><div><b>{r.full_name}</b><div className="text-xs text-muted-foreground">{r.protocol} · {r.email} · {r.country}</div></div><span className="rounded-full bg-muted px-3 py-1 text-xs font-bold">{r.status||"new"}</span></div><div className="mt-3 flex flex-wrap gap-2">{["under_review","contacted",r.application_kind==="professional"?"approved":"scheduled","active","rejected","closed"].map((s)=><button type="button" disabled={busy} key={s} onClick={()=>onStatus(r,s)} className="rounded-lg border px-3 py-1.5 text-xs font-bold">{s}</button>)}</div></div>)}</div></section>}
''')

# Source-aware commission engine for existing marketplace checkout.
network = SRC / "lib/professional-network.server.ts"
replace_once(network,
'''async function getCommissionRate() {
  const { data } = await db.from("platform_financial_config").select("numeric_value").eq("config_key", "platform_commission_rate").eq("active", true).maybeSingle();
  const rate = Number(data?.numeric_value ?? 0.10);
  return Number.isFinite(rate) && rate >= 0 && rate < 1 ? rate : 0.10;
}''',
'''type ClientSource = "social_clinic" | "professional_direct" | "ldr_generated";
async function getCommissionRate(source: ClientSource = "ldr_generated") {
  const key = source === "social_clinic" ? "commission_social_clinic" : source === "professional_direct" ? "commission_professional_direct" : "commission_ldr_generated";
  const fallback = source === "social_clinic" ? 0.07 : source === "professional_direct" ? 0.10 : 0.15;
  const { data } = await db.from("platform_financial_config").select("numeric_value").eq("config_key", key).eq("active", true).maybeSingle();
  const rate = Number(data?.numeric_value ?? fallback);
  return Number.isFinite(rate) && rate >= 0 && rate < 1 ? rate : fallback;
}''')
replace_once(network,
'''export async function createMarketplaceBookingCheckout(input: { profileSlug: string; serviceId: string; startAt: string; customerName: string; customerEmail: string; timezone: string; modality: "online"|"in_person" }) {''',
'''export async function createMarketplaceBookingCheckout(input: { profileSlug: string; serviceId: string; startAt: string; customerName: string; customerEmail: string; timezone: string; modality: "online"|"in_person"; clientSource?: ClientSource }) {''')
replace_once(network,
'''  const gross = moneyInt(service.price_cents);
  const rate = await getCommissionRate();''',
'''  const gross = moneyInt(service.price_cents);
  const clientSource: ClientSource = input.clientSource === "social_clinic" || input.clientSource === "professional_direct" ? input.clientSource : "ldr_generated";
  const rate = await getCommissionRate(clientSource);''')
replace_once(network,
'''  params.set("metadata[professional_account_id]", profile.professional_account_id);
  params.set("payment_intent_data[metadata][checkout_kind]", "marketplace_booking");''',
'''  params.set("metadata[professional_account_id]", profile.professional_account_id);
  params.set("metadata[client_source]", clientSource);
  params.set("metadata[commission_rate]", String(rate));
  params.set("payment_intent_data[metadata][checkout_kind]", "marketplace_booking");''')
replace_once(network,
'''  params.set("payment_intent_data[metadata][professional_account_id]", profile.professional_account_id);''',
'''  params.set("payment_intent_data[metadata][professional_account_id]", profile.professional_account_id);
  params.set("payment_intent_data[metadata][client_source]", clientSource);
  params.set("payment_intent_data[metadata][commission_rate]", String(rate));''')
replace_once(network,
'''  await db.from("marketplace_payments").update({ stripe_checkout_session_id: session.id }).eq("id", payment.id);
  return { url: session.url };''',
'''  await db.from("marketplace_payments").update({ stripe_checkout_session_id: session.id }).eq("id", payment.id);
  await db.from("audit_logs").insert({ action: "professional_network.booking_source", target: booking.id, actor_email: mail, details: { client_source: clientSource, commission_rate: rate, platform_fee_cents: platformFee, professional_account_id: profile.professional_account_id } });
  return { url: session.url };''')

functions = SRC / "lib/professional-network.functions.ts"
replace_once(functions,
'''export const marketplaceBookingCheckout = createServerFn({ method: "POST" }).inputValidator((data: { profileSlug: string; serviceId: string; startAt: string; customerName: string; customerEmail: string; timezone: string; modality: "online"|"in_person" }) => data).handler(async ({ data }) => {''',
'''export const marketplaceBookingCheckout = createServerFn({ method: "POST" }).inputValidator((data: { profileSlug: string; serviceId: string; startAt: string; customerName: string; customerEmail: string; timezone: string; modality: "online"|"in_person"; clientSource?: "social_clinic"|"professional_direct"|"ldr_generated" }) => data).handler(async ({ data }) => {''')

# Evolve /profissionais into a hub without removing map, filters or directory.
prof = SRC / "routes/profissionais.tsx"
replace_once(prof,
'''const NAVY = "#0b1428";''',
'''const HUB_COPY = {
  pt: { title: "Profissionais LDR", sub: "Encontre atendimento, conheça nossa Clínica Social ou faça parte da Rede LDR.", clinic: "Clínica Social de Psicanálise", clinicText: "Atendimento psicanalítico com valor social: R$ 30 no Brasil e € 20 na Europa.", find: "Encontrar um profissional", join: "Sou profissional" },
  en: { title: "LDR Professionals", sub: "Find care, discover our Social Clinic or join the LDR Network.", clinic: "Social Psychoanalysis Clinic", clinicText: "Psychoanalysis at a social rate: R$30 in Brazil and €20 in Europe.", find: "Find a professional", join: "I am a professional" },
  fr: { title: "Professionnels LDR", sub: "Trouvez un accompagnement, découvrez notre Clinique Sociale ou rejoignez le Réseau LDR.", clinic: "Clinique Sociale de Psychanalyse", clinicText: "Psychanalyse à tarif social : 30 R$ au Brésil et 20 € en Europe.", find: "Trouver un professionnel", join: "Je suis professionnel" },
  es: { title: "Profesionales LDR", sub: "Encuentra atención, conoce nuestra Clínica Social o forma parte de la Red LDR.", clinic: "Clínica Social de Psicoanálisis", clinicText: "Psicoanálisis con valor social: R$30 en Brasil y €20 en Europa.", find: "Encontrar un profesional", join: "Soy profesional" },
} as const;

const NAVY = "#0b1428";''')
replace_once(prof,
'''  const c = COPY[locale];
  const data = Route.useLoaderData() as any;''',
'''  const c = COPY[locale];
  const hub = HUB_COPY[locale];
  const data = Route.useLoaderData() as any;''')
replace_once(prof,
'''        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">''',
'''        <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
          <div className="rounded-[2rem] p-6 text-white sm:p-8" style={{ background: NAVY }}>
            <p className="text-xs font-black uppercase tracking-[.2em]" style={{ color: GOLD }}>{hub.title}</p>
            <h2 className="mt-2 max-w-3xl font-serif text-3xl sm:text-4xl">{hub.sub}</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <Link to="/clinica-social" className="rounded-2xl bg-white p-5 text-left transition hover:-translate-y-0.5" style={{ color: NAVY }}>
                <HeartHandshake className="h-6 w-6" style={{ color: GOLD }}/><div className="mt-3 font-black">{hub.clinic}</div><p className="mt-2 text-sm" style={{ color: MUTED }}>{hub.clinicText}</p>
              </Link>
              <a href="#diretorio-profissionais" className="rounded-2xl border border-white/25 p-5 transition hover:bg-white/10"><Search className="h-6 w-6" style={{ color: GOLD }}/><div className="mt-3 font-black">{hub.find}</div><p className="mt-2 text-sm text-white/70">Mapa, filtros, especialidades, idiomas e disponibilidade.</p></a>
              <Link to="/para-profissionais" className="rounded-2xl border border-white/25 p-5 transition hover:bg-white/10"><UserRound className="h-6 w-6" style={{ color: GOLD }}/><div className="mt-3 font-black">{hub.join}</div><p className="mt-2 text-sm text-white/70">Crie seu perfil na Rede LDR ou solicite participação na Clínica Social.</p></Link>
            </div>
          </div>
        </section>

        <section id="diretorio-profissionais" className="mx-auto max-w-7xl px-4 py-8 sm:px-6">''')
replace_once(prof,
'''  UserRound,
  X,''',
'''  UserRound,
  HeartHandshake,
  X,''')

print("Social Clinic implementation applied.")

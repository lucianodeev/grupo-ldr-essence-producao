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

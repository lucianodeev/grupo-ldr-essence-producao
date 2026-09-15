import { supabaseAdmin } from "@/integrations/supabase/client.server";

const db = supabaseAdmin as unknown as { from: (table: string) => any };

function fail(message: string): never {
  throw new Error(message);
}

const FORBIDDEN = [
  /cura\s+garantida/i,
  /resultado\s+garantido/i,
  /100\s*%\s*(?:de\s*)?(?:efic[aá]cia|resultado)/i,
  /elimina\s+(?:a\s+)?ansiedade/i,
  /cura\s+(?:a\s+)?depress[aã]o/i,
  /cura\s+(?:o\s+)?trauma/i,
  /resultado\s+em\s+\d+\s+sesso/i,
  /melhor\s+profissional/i,
  /n[uú]mero\s*1/i,
  /clientes\s+garantidos/i,
  /faturamento\s+garantido/i,
  /renda\s+garantida/i,
];

const BILLING_UNITS = new Set([
  "session",
  "hour",
  "30_min",
  "project",
  "vacancy",
  "day",
  "package",
  "month",
  "custom_quote",
]);

function validateClaims(...texts: (string | null | undefined)[]) {
  const value = texts.filter(Boolean).join(" ");
  if (FORBIDDEN.some((rule) => rule.test(value))) {
    fail("O texto contém promessa absoluta, sensacionalista ou incompatível com as diretrizes da Rede LDR.");
  }
}

async function context(userId: string) {
  const { data: account } = await db
    .from("professional_accounts")
    .select("id,status")
    .eq("auth_user_id", userId)
    .maybeSingle();
  if (!account) fail("Área profissional não encontrada.");

  const { data: profile } = await db
    .from("professional_profiles")
    .select("id,compliance_status,profile_status,is_public,country_code,category_id,documents_verified,profile_verified")
    .eq("professional_account_id", account.id)
    .maybeSingle();
  if (!profile) fail("Complete seu perfil primeiro.");
  return { account, profile };
}

type SaveInput = {
  id?: string | null;
  catalogKey?: string | null;
  name: string;
  description?: string | null;
  modality: "online" | "in_person" | "both";
  durationMinutes: number;
  currency: "EUR" | "BRL";
  priceCents: number;
  billingUnit?: "session" | "hour" | "30_min" | "project" | "vacancy" | "day" | "package" | "month" | "custom_quote";
  countryCodes?: string[];
  languageCodes?: string[];
  city?: string | null;
  publicLocation?: string | null;
  bookingEnabled?: boolean;
  quoteRequired?: boolean;
  availableForPrivate?: boolean;
  availableForCompany?: boolean;
};

export async function saveProfessionalService(userId: string, input: SaveInput) {
  const { profile } = await context(userId);

  let catalog: any = null;
  if (input.catalogKey) {
    const { data } = await db
      .from("professional_service_catalog")
      .select("catalog_key,category_id,name_pt,description_pt,default_duration_minutes,default_billing_unit,allowed_modalities,requires_license,requires_admin_review,fee_compliance_status")
      .eq("catalog_key", input.catalogKey)
      .eq("category_id", profile.category_id)
      .eq("active", true)
      .maybeSingle();
    if (!data) fail("Este serviço não pertence à sua categoria profissional ou não está disponível.");
    catalog = data;
  }

  const name = (catalog?.name_pt || input.name || "").trim();
  const description = input.description?.trim() || catalog?.description_pt || null;
  validateClaims(name, description);
  if (name.length < 3) fail("Informe o nome do serviço.");

  const duration = Math.round(Number(input.durationMinutes || catalog?.default_duration_minutes || 50));
  if (duration < 5 || duration > 480) fail("Duração inválida.");

  const billingUnit = input.billingUnit || catalog?.default_billing_unit || "session";
  if (!BILLING_UNITS.has(billingUnit)) fail("Unidade de cobrança inválida.");

  const price = Math.round(Number(input.priceCents));
  const quoteRequired = Boolean(input.quoteRequired || billingUnit === "custom_quote");
  if ((!quoteRequired && !Number.isFinite(price)) || price < 0) fail("Preço inválido.");

  if (catalog?.allowed_modalities?.length && !catalog.allowed_modalities.includes(input.modality)) {
    fail("Esta modalidade não está disponível para o serviço selecionado.");
  }
  if (input.modality === "in_person" && !input.publicLocation?.trim()) {
    fail("Para atendimento presencial, informe cidade/região ou local público de atendimento.");
  }

  if (catalog?.requires_license && !profile.documents_verified) {
    fail("Este serviço exige documentação profissional verificada antes da publicação.");
  }

  const feeComplianceStatus = catalog?.fee_compliance_status || "allowed";
  const sourceType = catalog ? "ldr_catalog" : "custom";
  const requiresAdminReview = catalog ? Boolean(catalog.requires_admin_review) : true;
  const approvalStatus = requiresAdminReview ? "pending_review" : "approved";

  const profileReady =
    profile.compliance_status === "approved" &&
    profile.profile_status === "active" &&
    profile.is_public;
  const checkoutAllowed =
    profileReady &&
    approvalStatus === "approved" &&
    feeComplianceStatus === "allowed" &&
    !quoteRequired &&
    price > 0;
  const bookingEnabled = Boolean(input.bookingEnabled) && checkoutAllowed;

  const countryCodes = (input.countryCodes?.length ? input.countryCodes : [profile.country_code])
    .map((value) => String(value).trim().toUpperCase())
    .filter(Boolean);
  const languageCodes = (input.languageCodes ?? []).map((value) => String(value).trim().toLowerCase()).filter(Boolean);

  const payload = {
    professional_catalog_key: catalog?.catalog_key ?? null,
    source_type: sourceType,
    name,
    description,
    modality: input.modality,
    duration_minutes: duration,
    billing_unit: billingUnit,
    currency: input.currency,
    price_cents: quoteRequired ? 0 : price,
    country_codes: countryCodes,
    language_codes: languageCodes,
    city: input.city?.trim() || null,
    public_location: input.publicLocation?.trim() || null,
    quote_required: quoteRequired,
    available_for_private: input.availableForPrivate ?? true,
    available_for_company: input.availableForCompany ?? false,
    requires_admin_review: requiresAdminReview,
    approval_status: approvalStatus,
    fee_compliance_status: feeComplianceStatus,
    fee_compliance_note:
      feeComplianceStatus === "allowed"
        ? null
        : "Checkout percentual bloqueado até validação ética/legal por país e profissão.",
    booking_enabled: bookingEnabled,
    active: true,
    updated_at: new Date().toISOString(),
  };

  if (input.id) {
    const { error } = await db
      .from("professional_services")
      .update(payload)
      .eq("id", input.id)
      .eq("professional_profile_id", profile.id);
    if (error) throw error;
    return { ok: true as const, id: input.id, bookingEnabled, approvalStatus, feeComplianceStatus };
  }

  const { data, error } = await db
    .from("professional_services")
    .insert({ professional_profile_id: profile.id, ...payload, sort_order: 100 })
    .select("id")
    .single();
  if (error?.code === "23505" && catalog?.catalog_key) fail("Este serviço já está cadastrado no seu perfil.");
  if (error || !data) fail("Não foi possível criar o serviço.");

  return { ok: true as const, id: data.id, bookingEnabled, approvalStatus, feeComplianceStatus };
}

export async function setProfessionalServiceActive(userId: string, input: { id: string; active: boolean }) {
  const { profile } = await context(userId);
  const patch: Record<string, unknown> = {
    active: Boolean(input.active),
    updated_at: new Date().toISOString(),
  };
  if (!input.active) patch.booking_enabled = false;
  const { error } = await db
    .from("professional_services")
    .update(patch)
    .eq("id", input.id)
    .eq("professional_profile_id", profile.id);
  if (error) throw error;
  return { ok: true as const };
}

import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { resolveAccess, writeAudit } from "@/lib/access.server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type Client = SupabaseClient<Database>;
const db = supabaseAdmin as unknown as { from: (table: string) => any };

function fail(message: string): never {
  throw new Error(message);
}

async function requireSuper(supabase: Client, userId: string) {
  const access = await resolveAccess(supabase, userId);
  if (!access.authorized || access.role !== "superadmin") fail("Acesso negado.");
  return access;
}

export async function getPendingCatalogServices(supabase: Client, userId: string) {
  await requireSuper(supabase, userId);
  const [{ data: services }, { data: categories }, { data: catalog }, { data: config }] = await Promise.all([
    db
      .from("professional_services")
      .select("id,professional_profile_id,catalog_key,source_type,name,modality,duration_minutes,billing_unit,currency,price_cents,quote_required,public_location,approval_status,requires_admin_review,fee_compliance_status,fee_compliance_note,booking_enabled,active,created_at,professional_profiles(display_name,professional_title,country_code,compliance_status,profile_status,is_public,professional_account_id,category_id)")
      .in("source_type", ["ldr_catalog", "custom"])
      .order("created_at", { ascending: false })
      .limit(500),
    db
      .from("professional_categories")
      .select("id,slug,name_pt,active,sort_order,network_group,regulated_by_default,requires_admin_review,requires_license,requires_documents,fee_compliance_status")
      .order("sort_order"),
    db
      .from("professional_service_catalog")
      .select("id,catalog_key,category_id,name_pt,default_billing_unit,default_duration_minutes,requires_license,requires_admin_review,fee_compliance_status,active,sort_order,professional_service_price_reference(id,market_code,currency,min_amount_cents,max_amount_cents,billing_unit,source_label,source_url,source_date,notes,active)")
      .order("sort_order"),
    db
      .from("platform_financial_config")
      .select("numeric_value,text_value")
      .eq("config_key", "platform_fee_percent")
      .eq("active", true)
      .maybeSingle(),
  ]);
  return {
    services: services ?? [],
    categories: categories ?? [],
    catalog: catalog ?? [],
    platformFeePercent: Number(config?.numeric_value ?? 20),
  };
}

export async function reviewCatalogService(
  supabase: Client,
  userId: string,
  input: { serviceId: string; action: "approve" | "reject" },
) {
  const actor = await requireSuper(supabase, userId);
  const { data: service } = await db
    .from("professional_services")
    .select("id,source_type,price_cents,quote_required,approval_status,fee_compliance_status,professional_profiles(professional_account_id,compliance_status,profile_status,is_public)")
    .eq("id", input.serviceId)
    .in("source_type", ["ldr_catalog", "custom"])
    .maybeSingle();
  if (!service) fail("Serviço não encontrado.");

  if (input.action === "reject") {
    await db
      .from("professional_services")
      .update({ approval_status: "rejected", booking_enabled: false, active: false, updated_at: new Date().toISOString() })
      .eq("id", service.id);
  } else {
    const profile = Array.isArray(service.professional_profiles) ? service.professional_profiles[0] : service.professional_profiles;
    const profileReady = profile?.compliance_status === "approved" && profile?.profile_status === "active" && Boolean(profile?.is_public);
    const feeReady = service.fee_compliance_status === "allowed";
    const checkoutReady = profileReady && feeReady && Number(service.price_cents) > 0 && !service.quote_required;
    await db
      .from("professional_services")
      .update({
        approval_status: "approved",
        requires_admin_review: false,
        active: true,
        booking_enabled: Boolean(checkoutReady),
        updated_at: new Date().toISOString(),
      })
      .eq("id", service.id);
  }

  await writeAudit({
    actorId: userId,
    actorEmail: actor.email,
    action: `professional_network.service_${input.action}`,
    target: service.id,
  });
  return { ok: true as const };
}

export async function setProfessionalServiceFeeCompliance(
  supabase: Client,
  userId: string,
  input: { serviceId: string; status: "allowed" | "requires_review" | "restricted"; note?: string | null },
) {
  const actor = await requireSuper(supabase, userId);
  const { data: service } = await db
    .from("professional_services")
    .select("id,price_cents,quote_required,approval_status,professional_profiles(compliance_status,profile_status,is_public)")
    .eq("id", input.serviceId)
    .maybeSingle();
  if (!service) fail("Serviço não encontrado.");

  const profile = Array.isArray(service.professional_profiles) ? service.professional_profiles[0] : service.professional_profiles;
  const profileReady = profile?.compliance_status === "approved" && profile?.profile_status === "active" && Boolean(profile?.is_public);
  const bookingEnabled =
    input.status === "allowed" &&
    service.approval_status === "approved" &&
    profileReady &&
    Number(service.price_cents) > 0 &&
    !service.quote_required;

  await db
    .from("professional_services")
    .update({
      fee_compliance_status: input.status,
      fee_compliance_note: input.note?.trim() || null,
      booking_enabled: bookingEnabled,
      updated_at: new Date().toISOString(),
    })
    .eq("id", service.id);

  await writeAudit({
    actorId: userId,
    actorEmail: actor.email,
    action: "professional_network.fee_compliance_changed",
    target: service.id,
    details: { status: input.status, note: input.note?.trim() || null },
  });
  return { ok: true as const, bookingEnabled };
}

export async function updateProfessionalPriceReference(
  supabase: Client,
  userId: string,
  input: { referenceId: string; minAmountCents?: number | null; maxAmountCents?: number | null; notes?: string | null },
) {
  const actor = await requireSuper(supabase, userId);
  const min = input.minAmountCents == null ? null : Math.round(Number(input.minAmountCents));
  const max = input.maxAmountCents == null ? null : Math.round(Number(input.maxAmountCents));
  if ((min != null && min < 0) || (max != null && max < 0) || (min != null && max != null && min > max)) {
    fail("Faixa de preço inválida.");
  }
  const { error } = await db
    .from("professional_service_price_reference")
    .update({ min_amount_cents: min, max_amount_cents: max, notes: input.notes?.trim() || null, updated_at: new Date().toISOString() })
    .eq("id", input.referenceId);
  if (error) throw error;
  await writeAudit({
    actorId: userId,
    actorEmail: actor.email,
    action: "professional_network.price_reference_updated",
    target: input.referenceId,
    details: { min, max },
  });
  return { ok: true as const };
}

export async function setProfessionalCatalogServiceActive(
  supabase: Client,
  userId: string,
  input: { catalogServiceId: string; active: boolean },
) {
  const actor = await requireSuper(supabase, userId);
  const { error } = await db
    .from("professional_service_catalog")
    .update({ active: Boolean(input.active), updated_at: new Date().toISOString() })
    .eq("id", input.catalogServiceId);
  if (error) throw error;
  await writeAudit({
    actorId: userId,
    actorEmail: actor.email,
    action: "professional_network.catalog_service_active_changed",
    target: input.catalogServiceId,
    details: { active: Boolean(input.active) },
  });
  return { ok: true as const };
}

export async function setProfessionalCategoryActive(
  supabase: Client,
  userId: string,
  input: { categoryId: string; active: boolean },
) {
  const actor = await requireSuper(supabase, userId);
  const { error } = await db
    .from("professional_categories")
    .update({ active: Boolean(input.active), updated_at: new Date().toISOString() })
    .eq("id", input.categoryId);
  if (error) throw error;
  await writeAudit({
    actorId: userId,
    actorEmail: actor.email,
    action: "professional_network.category_active_changed",
    target: input.categoryId,
    details: { active: Boolean(input.active) },
  });
  return { ok: true as const };
}

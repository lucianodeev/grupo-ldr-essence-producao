import { supabaseAdmin } from "@/integrations/supabase/client.server";

const db = supabaseAdmin as unknown as { from: (table: string) => any };

function fail(message: string): never {
  throw new Error(message);
}

export async function getProfessionalServiceCatalog(userId: string) {
  const { data: account } = await db
    .from("professional_accounts")
    .select("id,preferred_currency,country_code")
    .eq("auth_user_id", userId)
    .maybeSingle();
  if (!account) fail("Área profissional não encontrada.");

  const { data: profile } = await db
    .from("professional_profiles")
    .select("id,category_id,country_code,city,languages,professional_title,compliance_status,profile_status,is_public,documents_verified,profile_verified")
    .eq("professional_account_id", account.id)
    .maybeSingle();
  if (!profile) fail("Complete seu perfil antes de escolher serviços.");

  const [
    { data: category },
    { data: catalog },
    { data: mappings },
    { data: config },
    { data: existingServices },
  ] = await Promise.all([
    db
      .from("professional_categories")
      .select("id,slug,name_pt,name_en,name_fr,name_es,network_group,regulated_by_default,requires_admin_review,requires_license,requires_documents,fee_compliance_status")
      .eq("id", profile.category_id)
      .maybeSingle(),
    db
      .from("professional_service_catalog")
      .select("id,catalog_key,name_pt,name_en,name_fr,name_es,description_pt,default_duration_minutes,default_billing_unit,allowed_modalities,requires_license,requires_admin_review,fee_compliance_status,sort_order,professional_service_price_reference(id,market_code,currency,min_amount_cents,max_amount_cents,billing_unit,source_label,source_url,source_date,notes,active)")
      .eq("category_id", profile.category_id)
      .eq("active", true)
      .order("sort_order"),
    db
      .from("professional_category_specialties")
      .select("specialty_id,professional_specialties(id,specialty_key,name_pt,name_en,name_fr,name_es,sort_order,active)")
      .eq("category_id", profile.category_id)
      .eq("active", true),
    db
      .from("platform_financial_config")
      .select("numeric_value")
      .eq("config_key", "platform_fee_percent")
      .eq("active", true)
      .maybeSingle(),
    db
      .from("professional_services")
      .select("professional_catalog_key")
      .eq("professional_profile_id", profile.id)
      .not("professional_catalog_key", "is", null),
  ]);

  const specialties = (mappings ?? [])
    .map((row: any) => Array.isArray(row.professional_specialties) ? row.professional_specialties[0] : row.professional_specialties)
    .filter((row: any) => row?.active !== false)
    .sort((a: any, b: any) => Number(a?.sort_order ?? 100) - Number(b?.sort_order ?? 100));

  const existingCatalogKeys = new Set(
    (existingServices ?? [])
      .map((row: any) => row?.professional_catalog_key)
      .filter(Boolean),
  );
  const availableCatalog = (catalog ?? []).filter(
    (service: any) => !existingCatalogKeys.has(service.catalog_key),
  );

  return {
    account,
    profile,
    category,
    catalog: availableCatalog,
    specialties,
    platformFeePercent: Number(config?.numeric_value ?? 20),
  };
}

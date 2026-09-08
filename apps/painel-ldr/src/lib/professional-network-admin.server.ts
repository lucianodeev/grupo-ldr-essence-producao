import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { resolveAccess, writeAudit } from "@/lib/access.server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type Client = SupabaseClient<Database>;
const db = supabaseAdmin as unknown as { from: (table: string) => any };
function fail(m: string): never {
  throw new Error(m);
}
async function requireInternal(supabase: Client, userId: string, superOnly = false) {
  const a = await resolveAccess(supabase, userId);
  if (!a.authorized || (superOnly && a.role !== "superadmin")) fail("Acesso negado.");
  return a;
}

export async function getProfessionalNetworkAdmin(supabase: Client, userId: string) {
  await requireInternal(supabase, userId, true);
  const [
    { data: profiles },
    { data: accounts },
    { data: subs },
    { data: plans },
    { data: payments },
    { data: payouts },
    { data: rules },
    { data: categories },
    { data: config },
    { data: events },
    authUsers,
  ] = await Promise.all([
    db
      .from("professional_profiles")
      .select(
        "id,professional_account_id,slug,display_name,professional_title,profile_headline,category_id,city,country_code,languages,online_enabled,in_person_enabled,about,specialties,identity_verified,documents_verified,profile_verified,compliance_status,profile_status,is_public,view_count,created_at,updated_at",
      )
      .order("created_at", { ascending: false }),
    db
      .from("professional_accounts")
      .select(
        "id,auth_user_id,status,onboarding_step,onboarding_completed,country_code,preferred_currency,connect_status,payout_method_status,engagement_model,custom_commission_rate,managed_by_admin,created_at",
      ),
    db
      .from("professional_subscriptions")
      .select(
        "id,professional_account_id,plan_id,status,current_period_start,current_period_end,cancel_at_period_end,created_at",
      )
      .order("created_at", { ascending: false }),
    db.from("subscription_plans").select("*").order("market").order("sort_order"),
    db
      .from("marketplace_payments")
      .select(
        "id,professional_account_id,status,gross_amount_cents,platform_fee_cents,payment_fee_cents,refund_amount_cents,adjustment_cents,provider_net_cents,currency,paid_at,created_at",
      )
      .order("created_at", { ascending: false })
      .limit(500),
    db.from("payouts").select("*").order("period_end", { ascending: false }).limit(300),
    db
      .from("professional_country_rules")
      .select(
        "id,country_code,category_id,requires_registration,requires_manual_review,registration_label,required_documents,allowed_modalities,advertising_restrictions,fiscal_requirements,legal_notice,active,reviewed_at",
      ),
    db
      .from("professional_categories")
      .select("id,slug,name_pt,regulated_by_default,requires_admin_review,active,sort_order")
      .order("sort_order"),
    db.from("platform_financial_config").select("*").eq("active", true),
    db.from("professional_events").select("*").order("starts_at", { ascending: false }).limit(100),
    supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
  ]);
  const emailByUserId = new Map(
    (authUsers.data?.users ?? []).map((user: any) => [user.id, user.email ?? null]),
  );
  const accountBy = new Map(
    (accounts ?? []).map((a: any) => [
      a.id,
      { ...a, email: emailByUserId.get(a.auth_user_id) ?? null },
    ]),
  );
  const subBy = new Map<string, any>();
  for (const s of subs ?? []) {
    if (!subBy.has(s.professional_account_id)) subBy.set(s.professional_account_id, s);
  }
  return {
    profiles: (profiles ?? []).map((p: any) => ({
      ...p,
      account: accountBy.get(p.professional_account_id) ?? null,
      subscription: subBy.get(p.professional_account_id) ?? null,
    })),
    plans: plans ?? [],
    payments: payments ?? [],
    payouts: payouts ?? [],
    rules: rules ?? [],
    categories: categories ?? [],
    config: config ?? [],
    events: events ?? [],
  };
}

export async function reviewProfessional(
  supabase: Client,
  userId: string,
  input: {
    profileId: string;
    action: "approve" | "pause" | "suspend" | "request_documents";
    identityVerified?: boolean;
    documentsVerified?: boolean;
    profileVerified?: boolean;
  },
) {
  const actor = await requireInternal(supabase, userId, true);
  const { data: p } = await db
    .from("professional_profiles")
    .select("id,slug,professional_account_id,category_id,country_code")
    .eq("id", input.profileId)
    .maybeSingle();
  if (!p) fail("Perfil não encontrado.");
  if (input.action === "approve") {
    const { data: rule } = await db
      .from("professional_country_rules")
      .select("requires_registration,requires_manual_review,required_documents")
      .eq("country_code", p.country_code)
      .eq("category_id", p.category_id)
      .eq("active", true)
      .maybeSingle();
    if (!rule)
      fail("Regra de conformidade ainda não configurada e ativa para esta categoria e país.");
    const { data: account } = await db
      .from("professional_accounts")
      .select("engagement_model")
      .eq("id", p.professional_account_id)
      .maybeSingle();
    if (
      p.slug !== "luciano-rodrigues-almeida" &&
      (account?.engagement_model ?? "subscription") === "subscription"
    ) {
      const { data: activeSub } = await db
        .from("professional_subscriptions")
        .select("id")
        .eq("professional_account_id", p.professional_account_id)
        .eq("status", "active")
        .limit(1);
      if (!(activeSub ?? []).length)
        fail("A assinatura precisa estar ativa antes da aprovação do perfil.");
    }
    if (rule.requires_registration) {
      const { data: cred } = await db
        .from("professional_credentials")
        .select("id")
        .eq("professional_account_id", p.professional_account_id)
        .eq("category_id", p.category_id)
        .eq("country_code", p.country_code)
        .eq("status", "verified")
        .eq("meets_title_requirement", true)
        .limit(1);
      if (!(cred ?? []).length) fail("Registro profissional obrigatório ainda não validado.");
    }
    await db
      .from("professional_profiles")
      .update({
        compliance_status: "approved",
        profile_status: "active",
        is_public: true,
        identity_verified: Boolean(input.identityVerified),
        documents_verified: Boolean(input.documentsVerified),
        profile_verified: Boolean(input.profileVerified),
        reviewed_at: new Date().toISOString(),
        reviewed_by: userId,
      })
      .eq("id", p.id);
    await db
      .from("professional_accounts")
      .update({ status: "active", updated_at: new Date().toISOString() })
      .eq("id", p.professional_account_id);
  } else if (input.action === "request_documents") {
    await db
      .from("professional_profiles")
      .update({
        compliance_status: "needs_review",
        profile_status: "review",
        is_public: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", p.id);
    await db
      .from("professional_accounts")
      .update({ status: "documents_pending", updated_at: new Date().toISOString() })
      .eq("id", p.professional_account_id);
  } else {
    const suspended = input.action === "suspend";
    await db
      .from("professional_profiles")
      .update({
        profile_status: suspended ? "suspended" : "paused",
        is_public: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", p.id);
    await db
      .from("professional_accounts")
      .update({ status: suspended ? "suspended" : "paused", updated_at: new Date().toISOString() })
      .eq("id", p.professional_account_id);
  }
  await writeAudit({
    actorId: userId,
    actorEmail: actor.email,
    action: `professional_network.${input.action}`,
    target: p.id,
  });
  return { ok: true as const };
}

type EngagementModel = "subscription" | "commission" | "exempt";
type AdminProfessionalInput = {
  profileId?: string;
  email?: string;
  displayName: string;
  professionalTitle: string;
  slug?: string;
  categoryId: string;
  countryCode: string;
  city?: string;
  languages?: string[];
  onlineEnabled?: boolean;
  inPersonEnabled?: boolean;
  engagementModel: EngagementModel;
  commissionPercent?: number | null;
  publish?: boolean;
};

function cleanSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

async function authUserByEmail(email: string) {
  for (let page = 1; page <= 10; page++) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    const user = data.users.find((candidate) => candidate.email?.trim().toLowerCase() === email);
    if (user) return user;
    if (data.users.length < 1000) break;
  }
  return null;
}

export async function upsertProfessionalByAdmin(
  supabase: Client,
  userId: string,
  input: AdminProfessionalInput,
) {
  const actor = await requireInternal(supabase, userId, true);
  const displayName = input.displayName?.trim();
  const professionalTitle = input.professionalTitle?.trim();
  const categoryId = input.categoryId?.trim();
  const countryCode = input.countryCode?.trim().toUpperCase();
  const engagementModel = input.engagementModel;
  if (displayName.length < 2 || professionalTitle.length < 2)
    fail("Informe nome e título profissional.");
  if (!categoryId) fail("Selecione a área de atuação.");
  if (!/^[A-Z]{2}$/.test(countryCode)) fail("Informe o país com o código de duas letras.");
  if (!(["subscription", "commission", "exempt"] as string[]).includes(engagementModel))
    fail("Modelo comercial inválido.");
  const commissionPercent = Number(input.commissionPercent);
  if (
    engagementModel === "commission" &&
    (!Number.isFinite(commissionPercent) || commissionPercent < 10 || commissionPercent > 20)
  )
    fail("A comissão deve estar entre 10% e 20%.");
  const { data: category } = await db
    .from("professional_categories")
    .select("id")
    .eq("id", categoryId)
    .eq("active", true)
    .maybeSingle();
  if (!category) fail("Área de atuação inválida ou inativa.");

  let accountId: string;
  let profileId = input.profileId?.trim() || null;
  let authUserId: string;
  if (profileId) {
    const { data: profile } = await db
      .from("professional_profiles")
      .select("id,professional_account_id")
      .eq("id", profileId)
      .maybeSingle();
    if (!profile) fail("Profissional não encontrado.");
    accountId = profile.professional_account_id;
    const { data: account } = await db
      .from("professional_accounts")
      .select("auth_user_id")
      .eq("id", accountId)
      .maybeSingle();
    if (!account) fail("Conta profissional não encontrada.");
    authUserId = account.auth_user_id;
  } else {
    const email = input.email?.trim().toLowerCase() || "";
    if (!email.includes("@")) fail("Informe um e-mail válido para o novo profissional.");
    let authUser = await authUserByEmail(email);
    if (!authUser) {
      const invited = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        data: { full_name: displayName, account_kind: "profissional" },
        redirectTo: "https://painel.ldrrhestrategia.com/profissional/login",
      });
      if (invited.error || !invited.data.user)
        throw invited.error ?? new Error("Não foi possível criar o acesso profissional.");
      authUser = invited.data.user;
    }
    authUserId = authUser.id;
    const { data: existingAccount } = await db
      .from("professional_accounts")
      .select("id")
      .eq("auth_user_id", authUserId)
      .maybeSingle();
    if (existingAccount) {
      const { data: existingProfile } = await db
        .from("professional_profiles")
        .select("id")
        .eq("professional_account_id", existingAccount.id)
        .maybeSingle();
      if (existingProfile)
        fail("Este e-mail já possui um perfil profissional. Use a opção EDITAR.");
      accountId = existingAccount.id;
    } else {
      const { data: created, error } = await db
        .from("professional_accounts")
        .insert({
          auth_user_id: authUserId,
          status: "incomplete",
          onboarding_step: 7,
          onboarding_completed: true,
          country_code: countryCode,
          preferred_currency: countryCode === "BR" ? "BRL" : "EUR",
        })
        .select("id")
        .single();
      if (error || !created)
        throw error ?? new Error("Não foi possível criar a conta profissional.");
      accountId = created.id;
    }
  }

  const now = new Date().toISOString();
  const { error: accountError } = await db
    .from("professional_accounts")
    .update({
      status: input.publish ? "active" : "documents_pending",
      onboarding_step: 7,
      onboarding_completed: true,
      country_code: countryCode,
      preferred_currency: countryCode === "BR" ? "BRL" : "EUR",
      engagement_model: engagementModel,
      custom_commission_rate: engagementModel === "commission" ? commissionPercent / 100 : null,
      managed_by_admin: true,
      updated_at: now,
    })
    .eq("id", accountId);
  if (accountError) throw accountError;

  const slug = cleanSlug(input.slug?.trim() || displayName);
  if (!slug) fail("Não foi possível gerar o endereço público do perfil.");
  const profilePayload = {
    professional_account_id: accountId,
    slug,
    display_name: displayName,
    professional_title: professionalTitle,
    category_id: categoryId,
    city: input.city?.trim() || null,
    country_code: countryCode,
    languages: [
      ...new Set(
        (input.languages?.length ? input.languages : ["pt"])
          .map((language) => language.trim().toLowerCase())
          .filter(Boolean),
      ),
    ],
    online_enabled: Boolean(input.onlineEnabled),
    in_person_enabled: Boolean(input.inPersonEnabled),
    compliance_status: input.publish ? "approved" : "needs_review",
    profile_status: input.publish ? "active" : "review",
    is_public: Boolean(input.publish),
    reviewed_at: input.publish ? now : null,
    reviewed_by: input.publish ? userId : null,
    updated_at: now,
  };
  if (profileId) {
    const { error } = await db
      .from("professional_profiles")
      .update(profilePayload)
      .eq("id", profileId);
    if (error?.code === "23505") fail("Este endereço público já está em uso.");
    if (error) throw error;
  } else {
    const { data: created, error } = await db
      .from("professional_profiles")
      .insert(profilePayload)
      .select("id")
      .single();
    if (error?.code === "23505") fail("Este endereço público já está em uso.");
    if (error || !created) throw error ?? new Error("Não foi possível cadastrar o perfil.");
    profileId = created.id;
  }
  await writeAudit({
    actorId: userId,
    actorEmail: actor.email,
    action: input.profileId
      ? "professional_network.admin_updated"
      : "professional_network.admin_created",
    target: profileId,
    details: {
      authUserId,
      engagementModel,
      commissionPercent: engagementModel === "commission" ? commissionPercent : null,
      published: Boolean(input.publish),
    },
  });
  return { ok: true as const, profileId };
}

export async function updateNetworkFinancialConfig(
  supabase: Client,
  userId: string,
  input: {
    commissionPercent?: number;
    payoutFrequencyDays?: number;
    plans?: Array<{ id: string; amountCents: number }>;
  },
) {
  const actor = await requireInternal(supabase, userId, true);
  if (input.commissionPercent != null) {
    const pct = Number(input.commissionPercent);
    if (!Number.isFinite(pct) || pct < 0 || pct > 50) fail("Comissão deve estar entre 0% e 50%.");
    await db
      .from("platform_financial_config")
      .update({
        numeric_value: pct / 100,
        text_value: `${pct}%`,
        updated_at: new Date().toISOString(),
        updated_by: userId,
      })
      .eq("config_key", "platform_commission_rate");
  }
  if (input.payoutFrequencyDays != null) {
    const d = Math.round(Number(input.payoutFrequencyDays));
    if (d < 1 || d > 90) fail("Periodicidade inválida.");
    await db
      .from("platform_financial_config")
      .update({
        numeric_value: d,
        text_value: d === 30 ? "monthly" : `${d} days`,
        updated_at: new Date().toISOString(),
        updated_by: userId,
      })
      .eq("config_key", "payout_frequency_days");
  }
  for (const p of input.plans ?? []) {
    const amount = Math.round(Number(p.amountCents));
    if (amount <= 0) fail("Valor de plano inválido.");
    await db
      .from("subscription_plans")
      .update({ amount_cents: amount, updated_at: new Date().toISOString() })
      .eq("id", p.id);
  }
  await writeAudit({
    actorId: userId,
    actorEmail: actor.email,
    action: "professional_network.financial_config_updated",
    details: {
      commissionPercent: input.commissionPercent,
      payoutFrequencyDays: input.payoutFrequencyDays,
      plans: input.plans?.length ?? 0,
    },
  });
  return { ok: true as const };
}

export async function prepareProfessionalPayout(
  supabase: Client,
  userId: string,
  input: {
    professionalAccountId: string;
    periodStart: string;
    periodEnd: string;
    currency: "EUR" | "BRL";
    scheduledFor?: string | null;
  },
) {
  const actor = await requireInternal(supabase, userId, true);
  const { data: payments } = await db
    .from("marketplace_payments")
    .select(
      "gross_amount_cents,platform_fee_cents,payment_fee_cents,refund_amount_cents,adjustment_cents,provider_net_cents,paid_at,status",
    )
    .eq("professional_account_id", input.professionalAccountId)
    .eq("currency", input.currency)
    .in("status", ["paid", "partially_refunded"])
    .gte("paid_at", `${input.periodStart}T00:00:00Z`)
    .lte("paid_at", `${input.periodEnd}T23:59:59Z`);
  const rows = payments ?? [];
  const sum = (k: string) => rows.reduce((s: number, x: any) => s + Number(x[k] ?? 0), 0);
  const payload = {
    professional_account_id: input.professionalAccountId,
    period_start: input.periodStart,
    period_end: input.periodEnd,
    currency: input.currency,
    gross_cents: sum("gross_amount_cents"),
    platform_fee_cents: sum("platform_fee_cents"),
    payment_fee_cents: sum("payment_fee_cents"),
    refund_cents: sum("refund_amount_cents"),
    adjustment_cents: sum("adjustment_cents"),
    net_cents: sum("provider_net_cents"),
    status: "awaiting_documentation",
    scheduled_for: input.scheduledFor || null,
    updated_at: new Date().toISOString(),
  };
  const { error } = await db
    .from("payouts")
    .upsert(payload, { onConflict: "professional_account_id,period_start,period_end,currency" });
  if (error) throw error;
  await writeAudit({
    actorId: userId,
    actorEmail: actor.email,
    action: "professional_network.payout_prepared",
    target: input.professionalAccountId,
    details: {
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      currency: input.currency,
    },
  });
  return { ok: true as const };
}

import { getRequest } from "@tanstack/react-start/server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const db = supabaseAdmin as unknown as { from: (table: string) => any };
const PLATFORM = "Rede de Profissionais LDR";

function fail(message: string): never { throw new Error(message); }
function normEmail(value: string | null | undefined) { return value?.trim().toLowerCase() ?? null; }
function moneyInt(value: unknown) { const n = Number(value); return Number.isFinite(n) ? Math.round(n) : 0; }
function origin() {
  const req = getRequest();
  return process.env["CLIENT_PANEL_URL"]?.replace(/\/$/, "") || (req ? new URL(req.url).origin : "https://painel.ldrrhestrategia.com");
}

async function getCommissionRate() {
  const { data } = await db.from("platform_financial_config").select("numeric_value").eq("config_key", "platform_commission_rate").eq("active", true).maybeSingle();
  const rate = Number(data?.numeric_value ?? 0.10);
  return Number.isFinite(rate) && rate >= 0 && rate < 1 ? rate : 0.10;
}

async function ensureAccount(userId: string, email: string | null) {
  const { data: existing } = await db.from("professional_accounts").select("*").eq("auth_user_id", userId).maybeSingle();
  if (existing) return existing;
  const { data, error } = await db.from("professional_accounts").insert({ auth_user_id: userId, status: "incomplete", onboarding_step: 1 }).select("*").single();
  if (error || !data) fail("Não foi possível criar sua área profissional.");
  await db.from("audit_logs").insert({ actor_id: userId, actor_email: normEmail(email), action: "professional_network.account_created", target: data.id, details: {} });
  return data;
}

export async function getNetworkLanding() {
  const [{ data: categories }, { data: plans }, { data: profiles }, { data: events }, { data: config }] = await Promise.all([
    db.from("professional_categories").select("id,slug,name_pt,name_en,name_fr,name_es,active,sort_order").eq("active", true).order("sort_order"),
    db.from("subscription_plans").select("id,market,plan_code,name,currency,amount_cents,interval,benefits,active,sort_order").eq("active", true).order("market").order("sort_order"),
    db.from("professional_profiles").select("id,slug,display_name,professional_title,category_id,city,country_code,languages,online_enabled,in_person_enabled,public_region,photo_url,about,specialties,identity_verified,documents_verified,profile_verified,view_count").eq("is_public", true).eq("profile_status", "active").eq("compliance_status", "approved").order("display_name"),
    db.from("professional_events").select("id,event_type,title,description,instructor,starts_at,ends_at,timezone,published").eq("published", true).gte("starts_at", new Date().toISOString()).order("starts_at").limit(8),
    db.from("platform_financial_config").select("config_key,numeric_value,text_value").eq("active", true),
  ]);
  return { categories: categories ?? [], plans: plans ?? [], profiles: profiles ?? [], events: events ?? [], config: config ?? [] };
}

export async function getPublicProfessional(slug: string) {
  const { data: profile } = await db.from("professional_profiles").select("id,slug,display_name,professional_title,category_id,city,country_code,languages,online_enabled,in_person_enabled,public_region,photo_url,about,experience_summary,education_summary,specialties,identity_verified,documents_verified,profile_verified,view_count").eq("slug", slug).eq("is_public", true).eq("profile_status", "active").eq("compliance_status", "approved").maybeSingle();
  if (!profile) return null;
  const [{ data: category }, { data: services }, { data: availability }, { data: reviews }] = await Promise.all([
    db.from("professional_categories").select("slug,name_pt,name_en,name_fr,name_es").eq("id", profile.category_id).maybeSingle(),
    db.from("professional_services").select("id,name,description,modality,duration_minutes,currency,price_cents,city,public_location,booking_enabled,active,sort_order").eq("professional_profile_id", profile.id).eq("active", true).order("sort_order"),
    db.from("professional_availability").select("id,professional_service_id,weekday,start_time,end_time,timezone,slot_interval_minutes,buffer_minutes,modality,location_label,effective_from,effective_until").eq("professional_profile_id", profile.id).eq("active", true),
    db.from("professional_reviews").select("id,rating,body,created_at").eq("professional_profile_id", profile.id).eq("status", "published").order("created_at", { ascending: false }).limit(12),
  ]);
  void db.from("professional_profiles").update({ view_count: Number(profile.view_count ?? 0) + 1 }).eq("id", profile.id);
  return { profile, category, services: services ?? [], availability: availability ?? [], reviews: reviews ?? [] };
}

export async function getProfessionalDashboard(userId: string, email: string | null) {
  const account = await ensureAccount(userId, email);
  const { data: profile } = await db.from("professional_profiles").select("*").eq("professional_account_id", account.id).maybeSingle();
  const [{ data: subscription }, { data: plans }, { data: bookings }, { data: payments }, { data: balances }, { data: payouts }, { data: documents }, { data: events }, { data: community }, { data: services }, { data: availability }, { data: categories }, { data: config }] = await Promise.all([
    db.from("professional_subscriptions").select("*,subscription_plans(name,market,plan_code,currency,amount_cents,benefits)").eq("professional_account_id", account.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    db.from("subscription_plans").select("id,market,plan_code,name,currency,amount_cents,interval,benefits").eq("active", true).order("market").order("sort_order"),
    profile ? db.from("marketplace_bookings").select("id,customer_name,service_provider_type,modality,starts_at,ends_at,status,gross_amount_cents,currency,professional_services(name)").eq("professional_profile_id", profile.id).order("starts_at", { ascending: false }).limit(50) : Promise.resolve({ data: [] }),
    db.from("marketplace_payments").select("id,status,gross_amount_cents,platform_fee_cents,payment_fee_cents,refund_amount_cents,adjustment_cents,provider_net_cents,currency,paid_at,created_at").eq("professional_account_id", account.id).order("created_at", { ascending: false }).limit(100),
    db.from("provider_balances").select("*").eq("professional_account_id", account.id),
    db.from("payouts").select("*").eq("professional_account_id", account.id).order("period_end", { ascending: false }).limit(24),
    db.from("payout_documents").select("id,payout_id,document_type,original_filename,period_start,period_end,declared_amount_cents,currency,status,uploaded_at,rejection_reason").eq("professional_account_id", account.id).order("uploaded_at", { ascending: false }).limit(50),
    db.from("professional_events").select("id,event_type,title,description,instructor,starts_at,ends_at,timezone,meeting_url,published").eq("published", true).gte("starts_at", new Date().toISOString()).order("starts_at").limit(12),
    db.from("community_posts").select("id,post_type,title,body,locale,published_at,created_at").eq("published", true).order("published_at", { ascending: false }).limit(20),
    profile ? db.from("professional_services").select("*").eq("professional_profile_id", profile.id).order("sort_order") : Promise.resolve({ data: [] }),
    profile ? db.from("professional_availability").select("*").eq("professional_profile_id", profile.id).order("weekday").order("start_time") : Promise.resolve({ data: [] }),
    db.from("professional_categories").select("id,slug,name_pt,name_en,name_fr,name_es,regulated_by_default,requires_admin_review").eq("active", true).order("sort_order"),
    db.from("platform_financial_config").select("config_key,numeric_value,text_value,json_value").eq("active", true),
  ]);
  return { account, profile, subscription: subscription ?? null, plans: plans ?? [], bookings: bookings ?? [], payments: payments ?? [], balances: balances ?? [], payouts: payouts ?? [], documents: documents ?? [], events: events ?? [], community: community ?? [], services: services ?? [], availability: availability ?? [], categories: categories ?? [], config: config ?? [] };
}

export async function saveProfessionalOnboarding(userId: string, email: string | null, input: { step: number; countryCode?: string; currency?: "EUR"|"BRL"; displayName?: string; slug?: string; professionalTitle?: string; categoryId?: string; city?: string; languages?: string[]; onlineEnabled?: boolean; inPersonEnabled?: boolean; about?: string; experienceSummary?: string; educationSummary?: string; specialties?: string[] }) {
  const account = await ensureAccount(userId, email);
  const step = Math.max(1, Math.min(7, Number(input.step || 1)));
  const accountPatch: Record<string, unknown> = { onboarding_step: step, updated_at: new Date().toISOString() };
  if (input.countryCode) accountPatch.country_code = input.countryCode.toUpperCase();
  if (input.currency) accountPatch.preferred_currency = input.currency;
  if (step >= 7) { accountPatch.onboarding_completed = true; accountPatch.status = "subscription_pending"; }
  await db.from("professional_accounts").update(accountPatch).eq("id", account.id);

  if (input.displayName && input.professionalTitle && input.categoryId) {
    const slug = (input.slug || input.displayName).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 80);
    const payload = {
      professional_account_id: account.id, slug, display_name: input.displayName.trim(), professional_title: input.professionalTitle.trim(), category_id: input.categoryId,
      city: input.city?.trim() || null, country_code: (input.countryCode || account.country_code || "BE").toUpperCase(), languages: input.languages?.length ? input.languages : ["pt"],
      online_enabled: Boolean(input.onlineEnabled), in_person_enabled: Boolean(input.inPersonEnabled), about: input.about?.trim() || null,
      experience_summary: input.experienceSummary?.trim() || null, education_summary: input.educationSummary?.trim() || null, specialties: input.specialties ?? [],
      compliance_status: "needs_review", profile_status: "review", is_public: false, updated_at: new Date().toISOString(),
    };
    const { data: current } = await db.from("professional_profiles").select("id").eq("professional_account_id", account.id).maybeSingle();
    if (current) await db.from("professional_profiles").update(payload).eq("id", current.id);
    else {
      const { error } = await db.from("professional_profiles").insert(payload);
      if (error?.code === "23505") fail("Este endereço público já está em uso. Ajuste o nome/slug.");
      if (error) throw error;
    }
  }
  return getProfessionalDashboard(userId, email);
}

export async function addProfessionalAvailability(userId: string, email: string | null, input: { serviceId?: string | null; weekday: number; startTime: string; endTime: string; timezone: string; intervalMinutes?: number; bufferMinutes?: number; modality?: "online"|"in_person"|"both"; locationLabel?: string | null }) {
  const account = await ensureAccount(userId, email);
  const { data: profile } = await db.from("professional_profiles").select("id").eq("professional_account_id", account.id).maybeSingle();
  if (!profile) fail("Complete seu perfil antes de configurar a agenda.");
  if (input.serviceId) {
    const { data: service } = await db.from("professional_services").select("id").eq("id", input.serviceId).eq("professional_profile_id", profile.id).maybeSingle();
    if (!service) fail("Serviço inválido.");
  }
  const { error } = await db.from("professional_availability").insert({ professional_profile_id: profile.id, professional_service_id: input.serviceId || null, weekday: input.weekday, start_time: input.startTime, end_time: input.endTime, timezone: input.timezone || "Europe/Brussels", slot_interval_minutes: input.intervalMinutes || 30, buffer_minutes: input.bufferMinutes || 0, modality: input.modality || "both", location_label: input.locationLabel?.trim() || null });
  if (error) throw error;
  return { ok: true as const };
}

export async function createProfessionalSubscriptionCheckout(userId: string, email: string | null, planId: string) {
  const account = await ensureAccount(userId, email);
  const mail = normEmail(email);
  if (!mail) fail("Sua conta precisa ter um e-mail válido.");
  const { data: existingSubscription } = await db.from("professional_subscriptions")
    .select("id,status,current_period_end,cancel_at_period_end")
    .eq("professional_account_id", account.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (existingSubscription) {
    const end = existingSubscription.current_period_end ? new Date(existingSubscription.current_period_end).getTime() : 0;
    if (!end || end > Date.now()) {
      fail(existingSubscription.cancel_at_period_end
        ? "Você já possui uma assinatura ativa até o fim do ciclo pago. Reative a renovação em Minha Assinatura se quiser continuar no próximo mês."
        : "Você já possui uma assinatura mensal ativa. Gerencie sua assinatura atual em Minha Assinatura.");
    }
  }
  const { data: plan } = await db.from("subscription_plans").select("id,market,plan_code,name,currency,amount_cents,interval,active").eq("id", planId).eq("active", true).maybeSingle();
  if (!plan) fail("Plano indisponível.");
  const secret = process.env["STRIPE_SECRET_KEY"];
  if (!secret) fail("Assinatura indisponível no momento.");
  const { data: pending, error: pendingError } = await db.from("professional_subscriptions").insert({ professional_account_id: account.id, plan_id: plan.id, status: "pending" }).select("id").single();
  if (pendingError || !pending) fail("Não foi possível preparar sua assinatura.");
  const params = new URLSearchParams();
  params.set("mode", "subscription");
  params.set("line_items[0][price_data][currency]", String(plan.currency).toLowerCase());
  params.set("line_items[0][price_data][unit_amount]", String(plan.amount_cents));
  params.set("line_items[0][price_data][recurring][interval]", String(plan.interval));
  params.set("line_items[0][price_data][product_data][name]", `${PLATFORM} — ${plan.name}`);
  params.set("line_items[0][quantity]", "1");
  params.set("customer_email", mail);
  params.set("success_url", `${origin()}/profissional-painel?subscription=success&session_id={CHECKOUT_SESSION_ID}`);
  params.set("cancel_url", `${origin()}/profissional-painel?subscription=cancel`);
  params.set("client_reference_id", userId);
  params.set("metadata[checkout_kind]", "professional_subscription");
  params.set("metadata[professional_account_id]", account.id);
  params.set("metadata[professional_subscription_id]", pending.id);
  params.set("metadata[plan_id]", plan.id);
  params.set("subscription_data[metadata][checkout_kind]", "professional_subscription");
  params.set("subscription_data[metadata][professional_account_id]", account.id);
  params.set("subscription_data[metadata][professional_subscription_id]", pending.id);
  params.set("subscription_data[metadata][plan_id]", plan.id);
  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", { method: "POST", headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/x-www-form-urlencoded", "Idempotency-Key": `pro-sub-${pending.id}` }, body: params });
  const session = await response.json() as { id?: string; url?: string; error?: { message?: string } };
  if (!response.ok || !session.id || !session.url) { await db.from("professional_subscriptions").delete().eq("id", pending.id); fail(session.error?.message || "Não foi possível abrir a assinatura."); }
  await db.from("professional_subscriptions").update({ stripe_checkout_session_id: session.id }).eq("id", pending.id);
  return { url: session.url };
}

function localSlotParts(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: timezone, weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(date);
  const map = Object.fromEntries(parts.map(p => [p.type, p.value]));
  const dayMap: Record<string, number> = { Sun:0, Mon:1, Tue:2, Wed:3, Thu:4, Fri:5, Sat:6 };
  return { weekday: dayMap[map.weekday] ?? -1, time: `${map.hour}:${map.minute}:00` };
}

export async function createMarketplaceBookingCheckout(input: { profileSlug: string; serviceId: string; startAt: string; customerName: string; customerEmail: string; timezone: string; modality: "online"|"in_person" }) {
  const name = input.customerName.trim();
  const mail = normEmail(input.customerEmail);
  if (name.length < 2 || !mail?.includes("@")) fail("Informe nome e e-mail válidos.");
  const start = new Date(input.startAt);
  if (!Number.isFinite(start.getTime()) || start.getTime() < Date.now() + 5 * 60_000) fail("Horário inválido ou já muito próximo.");
  const { data: profile } = await db.from("professional_profiles").select("id,professional_account_id,display_name,country_code").eq("slug", input.profileSlug).eq("is_public", true).eq("profile_status", "active").eq("compliance_status", "approved").maybeSingle();
  if (!profile) fail("Profissional indisponível.");
  const { data: service } = await db.from("professional_services").select("id,name,modality,duration_minutes,currency,price_cents,booking_enabled,public_location").eq("id", input.serviceId).eq("professional_profile_id", profile.id).eq("active", true).eq("booking_enabled", true).maybeSingle();
  if (!service || !service.currency || service.price_cents == null) fail("Este serviço ainda não está disponível para checkout.");
  if (service.modality !== "both" && service.modality !== input.modality) fail("Modalidade indisponível para este serviço.");
  const { data: rules } = await db.from("professional_availability").select("weekday,start_time,end_time,timezone,modality,effective_from,effective_until").eq("professional_profile_id", profile.id).eq("active", true).or(`professional_service_id.eq.${service.id},professional_service_id.is.null`);
  const matching = (rules ?? []).some((r: any) => {
    if (r.modality && r.modality !== "both" && r.modality !== input.modality) return false;
    const lp = localSlotParts(start, r.timezone || input.timezone || "Europe/Brussels");
    return Number(r.weekday) === lp.weekday && String(lp.time) >= String(r.start_time) && String(lp.time) < String(r.end_time);
  });
  if (!matching) fail("Este horário não está dentro da disponibilidade publicada.");
  const end = new Date(start.getTime() + Number(service.duration_minutes) * 60_000);
  const { data: blocked } = await db.from("professional_unavailability").select("id").eq("professional_profile_id", profile.id).lt("starts_at", end.toISOString()).gt("ends_at", start.toISOString()).limit(1);
  if ((blocked ?? []).length) fail("Este horário está indisponível.");
  const gross = moneyInt(service.price_cents);
  const rate = await getCommissionRate();
  const platformFee = Math.round(gross * rate);
  const providerNet = gross - platformFee;
  const { data: booking, error: bookingError } = await db.from("marketplace_bookings").insert({ professional_profile_id: profile.id, professional_service_id: service.id, customer_name: name, customer_email: mail, modality: input.modality, starts_at: start.toISOString(), ends_at: end.toISOString(), timezone: input.timezone || "Europe/Brussels", gross_amount_cents: gross, currency: service.currency, provider_label: profile.display_name, service_provider_type: "network_professional", checkout_expires_at: new Date(Date.now() + 30 * 60_000).toISOString() }).select("id").single();
  if (bookingError?.code === "23505") fail("Esse horário acabou de ser reservado. Escolha outro.");
  if (bookingError || !booking) fail("Não foi possível reservar o horário.");
  const { data: payment, error: paymentError } = await db.from("marketplace_payments").insert({ booking_id: booking.id, professional_account_id: profile.professional_account_id, status: "pending", gross_amount_cents: gross, platform_fee_cents: platformFee, provider_net_cents: providerNet, platform_fee_rate: rate, currency: service.currency }).select("id").single();
  if (paymentError || !payment) { await db.from("marketplace_bookings").delete().eq("id", booking.id); fail("Não foi possível preparar o pagamento."); }
  const secret = process.env["STRIPE_SECRET_KEY"];
  if (!secret) fail("Checkout indisponível.");
  const params = new URLSearchParams();
  params.set("mode", "payment");
  params.set("line_items[0][price_data][currency]", String(service.currency).toLowerCase());
  params.set("line_items[0][price_data][unit_amount]", String(gross));
  params.set("line_items[0][price_data][product_data][name]", `${service.name} — ${profile.display_name}`);
  params.set("line_items[0][quantity]", "1");
  params.set("customer_email", mail);
  params.set("success_url", `${origin()}/profissional/${input.profileSlug}?booking=success`);
  params.set("cancel_url", `${origin()}/profissional/${input.profileSlug}?booking=cancel`);
  params.set("expires_at", String(Math.floor(Date.now() / 1000) + 30 * 60));
  params.set("metadata[checkout_kind]", "marketplace_booking");
  params.set("metadata[booking_id]", booking.id);
  params.set("metadata[payment_id]", payment.id);
  params.set("metadata[professional_account_id]", profile.professional_account_id);
  params.set("payment_intent_data[metadata][checkout_kind]", "marketplace_booking");
  params.set("payment_intent_data[metadata][booking_id]", booking.id);
  params.set("payment_intent_data[metadata][payment_id]", payment.id);
  params.set("payment_intent_data[metadata][professional_account_id]", profile.professional_account_id);
  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", { method: "POST", headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/x-www-form-urlencoded", "Idempotency-Key": `booking-${booking.id}` }, body: params });
  const session = await response.json() as { id?: string; url?: string; error?: { message?: string } };
  if (!response.ok || !session.id || !session.url) { await db.from("marketplace_bookings").update({ status: "cancelled_client" }).eq("id", booking.id); fail(session.error?.message || "Não foi possível abrir o checkout."); }
  await db.from("marketplace_payments").update({ stripe_checkout_session_id: session.id }).eq("id", payment.id);
  return { url: session.url };
}

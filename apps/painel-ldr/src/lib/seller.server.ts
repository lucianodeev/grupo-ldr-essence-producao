import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { Database } from "@/integrations/supabase/types";
import { resolveAccess } from "@/lib/access.server";

type Client = SupabaseClient<Database>;
const db = supabaseAdmin as unknown as { from: (table: string) => any };

const RATES: Record<string, number> = {
  digital: 20,
  training: 15,
  mentoring: 15,
  career: 15,
  wellbeing: 10,
  marketing: 15,
  recruitment: 10,
  business: 7.5,
  service: 10,
};

function fail(message: string): never { throw new Error(message); }
async function requireAdmin(supabase: Client, userId: string) {
  const access = await resolveAccess(supabase, userId);
  if (!access.authorized || access.role !== "superadmin") fail("Acesso negado.");
}

export async function getSellerDashboard(userId: string) {
  const { data: account } = await db.from("seller_accounts").select("*").eq("user_id", userId).maybeSingle();
  if (!account || account.status !== "active") fail("Conta de vendedor não encontrada ou ainda não aprovada.");
  const [{ data: sales }, { data: payouts }] = await Promise.all([
    db.from("seller_sales").select("*").eq("seller_user_id", userId).order("sold_at", { ascending: false }),
    db.from("seller_payouts").select("*").eq("seller_user_id", userId).order("created_at", { ascending: false }),
  ]);
  const rows = sales ?? [];
  const totals = rows.reduce((acc: any, row: any) => {
    const cur = row.currency || "EUR";
    acc[cur] ??= { sales: 0, pending: 0, available: 0, paid: 0 };
    acc[cur].sales += Number(row.amount_cents || 0);
    if (["pending","confirmed"].includes(row.status)) acc[cur].pending += Number(row.commission_cents || 0);
    if (row.status === "available") acc[cur].available += Number(row.commission_cents || 0);
    if (row.status === "paid") acc[cur].paid += Number(row.commission_cents || 0);
    return acc;
  }, {});
  return { account, sales: rows, payouts: payouts ?? [], totals, rates: RATES };
}

export async function registerSellerSale(userId: string, input: any) {
  const { data: account } = await db.from("seller_accounts").select("user_id,status").eq("user_id", userId).maybeSingle();
  if (!account || account.status !== "active") fail("Vendedor não autorizado.");
  const rate = RATES[input.productCategory] ?? RATES.service;
  const amountCents = Math.round(Number(input.amount) * 100);
  const commissionCents = Math.round(amountCents * rate / 100);
  const { data, error } = await db.from("seller_sales").insert({
    seller_user_id: userId,
    customer_name: input.customerName.trim(),
    customer_email: input.customerEmail?.trim() || null,
    customer_phone: input.customerPhone?.trim() || null,
    product_name: input.productName.trim(),
    product_category: input.productCategory,
    amount_cents: amountCents,
    currency: input.currency,
    commission_rate: rate,
    commission_cents: commissionCents,
    payment_reference: input.paymentReference?.trim() || null,
    notes: input.notes?.trim() || null,
    status: "pending",
  }).select("*").single();
  if (error) fail(error.message);
  return data;
}

export async function getSellerAdminDashboard(supabase: Client, userId: string) {
  await requireAdmin(supabase, userId);
  const [{ data: applications }, { data: sellers }, { data: sales }, { data: payouts }] = await Promise.all([
    db.from("seller_applications").select("*").order("created_at", { ascending: false }),
    db.from("seller_accounts").select("*").order("created_at", { ascending: false }),
    db.from("seller_sales").select("*").order("sold_at", { ascending: false }).limit(300),
    db.from("seller_payouts").select("*").order("created_at", { ascending: false }).limit(200),
  ]);
  return { applications: applications ?? [], sellers: sellers ?? [], sales: sales ?? [], payouts: payouts ?? [], rates: RATES };
}

export async function reviewSellerApplication(supabase: Client, userId: string, applicationId: string, action: "approve"|"reject") {
  await requireAdmin(supabase, userId);
  const { data: application } = await db.from("seller_applications").select("*").eq("id", applicationId).maybeSingle();
  if (!application) fail("Candidatura não encontrada.");
  if (action === "reject") {
    await db.from("seller_applications").update({ status: "rejected", reviewed_at: new Date().toISOString(), reviewed_by: userId }).eq("id", applicationId);
    return { ok: true };
  }
  const { data: existing } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  let authUser = existing.users.find((u) => u.email?.toLowerCase() === String(application.email).toLowerCase());
  if (!authUser) {
    const created = await supabaseAdmin.auth.admin.createUser({ email: String(application.email).toLowerCase(), email_confirm: true, user_metadata: { full_name: application.full_name } });
    if (created.error || !created.data.user) fail(created.error?.message || "Não foi possível criar o acesso.");
    authUser = created.data.user;
  }
  const base = String(application.full_name || "LDR").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 10) || "LDR";
  const referral = `LDR-${base}-${String(authUser.id).slice(0,4).toUpperCase()}`;
  const { error: accountError } = await db.from("seller_accounts").upsert({
    user_id: authUser.id,
    application_id: application.id,
    full_name: application.full_name,
    email: String(application.email).toLowerCase(),
    phone: application.phone,
    country: application.country,
    preferred_currency: application.preferred_currency,
    referral_code: referral,
    status: "active",
  }, { onConflict: "user_id" });
  if (accountError) fail(accountError.message);
  await db.from("seller_applications").update({ status: "approved", reviewed_at: new Date().toISOString(), reviewed_by: userId }).eq("id", applicationId);
  return { ok: true, email: application.email, referralCode: referral };
}

export async function setSellerSaleStatus(supabase: Client, userId: string, saleId: string, status: string) {
  await requireAdmin(supabase, userId);
  const patch: any = { status, updated_at: new Date().toISOString() };
  if (["confirmed","available"].includes(status)) patch.confirmed_at = new Date().toISOString();
  const { error } = await db.from("seller_sales").update(patch).eq("id", saleId);
  if (error) fail(error.message);
  return { ok: true };
}

export async function createManualSellerPayout(supabase: Client, userId: string, input: any) {
  await requireAdmin(supabase, userId);
  const { data: available } = await db.from("seller_sales").select("id,commission_cents").eq("seller_user_id", input.sellerUserId).eq("currency", input.currency).eq("status", "available");
  const amount = (available ?? []).reduce((sum: number, row: any) => sum + Number(row.commission_cents || 0), 0);
  if (amount <= 0) fail("Não há comissão disponível nessa moeda.");
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0,10);
  const end = now.toISOString().slice(0,10);
  const { error } = await db.from("seller_payouts").insert({ seller_user_id: input.sellerUserId, period_start: start, period_end: end, currency: input.currency, amount_cents: amount, status: "paid", payment_method: "manual_transfer", payment_reference: input.paymentReference, paid_at: now.toISOString() });
  if (error) fail(error.message);
  const ids = (available ?? []).map((r: any) => r.id);
  if (ids.length) await db.from("seller_sales").update({ status: "paid", updated_at: now.toISOString() }).in("id", ids);
  return { ok: true, amountCents: amount };
}

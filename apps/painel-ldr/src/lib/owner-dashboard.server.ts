import type { SupabaseClient } from "@supabase/supabase-js";

import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { Database } from "@/integrations/supabase/types";
import { resolveAccess } from "@/lib/access.server";

type Client = SupabaseClient<Database>;
type Row = Record<string, unknown>;

const db = supabaseAdmin as unknown as { from: (table: string) => any };
const PAGE_SIZE = 500;
const MAX_PAGES = 100;
const PAID_PAYMENT_STATUSES = ["paid", "partially_refunded"];
const PENDING_PAYOUT_STATUSES = [
  "awaiting_documentation",
  "documentation_received",
  "in_review",
  "approved_for_payout",
  "adjustment_required",
  "processing",
];

function fail(): never {
  throw new Error("Não foi possível carregar os indicadores do painel master.");
}

async function requireSuperadmin(supabase: Client, userId: string) {
  const access = await resolveAccess(supabase, userId);
  if (!access.authorized || access.role !== "superadmin") {
    throw new Error("Acesso negado.");
  }
}

async function exactCount(query: any): Promise<number> {
  const { count, error } = await query;
  if (error) fail();
  return Number(count ?? 0);
}

async function loadPaidPayments(): Promise<Row[]> {
  const rows: Row[] = [];
  for (let page = 0; page < MAX_PAGES; page += 1) {
    const from = page * PAGE_SIZE;
    const { data, error } = await db
      .from("marketplace_payments")
      .select("id,status,currency,gross_amount_cents,platform_fee_cents,provider_net_cents")
      .in("status", PAID_PAYMENT_STATUSES)
      .order("id", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);
    if (error) fail();
    const pageRows = (data ?? []) as Row[];
    rows.push(...pageRows);
    if (pageRows.length < PAGE_SIZE) return rows;
  }
  fail();
}

async function loadPayouts(): Promise<Row[]> {
  const rows: Row[] = [];
  for (let page = 0; page < MAX_PAGES; page += 1) {
    const from = page * PAGE_SIZE;
    const { data, error } = await db
      .from("payouts")
      .select("id,status,currency,net_cents")
      .order("id", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);
    if (error) fail();
    const pageRows = (data ?? []) as Row[];
    rows.push(...pageRows);
    if (pageRows.length < PAGE_SIZE) return rows;
  }
  fail();
}

function cents(value: unknown): number {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) ? Math.round(amount) : 0;
}

export async function getOwnerDashboardSummary(supabase: Client, userId: string) {
  await requireSuperadmin(supabase, userId);
  const now = new Date().toISOString();

  const [
    activeProfessionals,
    pendingProfessionals,
    activeCompanies,
    activeEmployees,
    activeSubscriptions,
    pendingNotifications,
    payments,
    payouts,
  ] = await Promise.all([
    exactCount(
      db
        .from("professional_profiles")
        .select("id", { count: "exact", head: true })
        .eq("profile_status", "active")
        .eq("compliance_status", "approved")
        .eq("is_public", true),
    ),
    exactCount(
      db
        .from("professional_profiles")
        .select("id", { count: "exact", head: true })
        .eq("compliance_status", "needs_review"),
    ),
    exactCount(db.from("organizations").select("id", { count: "exact", head: true }).eq("active", true)),
    exactCount(
      db.from("organization_members").select("id", { count: "exact", head: true }).eq("portal_active", true),
    ),
    exactCount(
      db
        .from("professional_subscriptions")
        .select("id", { count: "exact", head: true })
        .eq("status", "active")
        .or(`current_period_end.is.null,current_period_end.gt.${now}`),
    ),
    exactCount(
      db
        .from("notification_outbox")
        .select("id", { count: "exact", head: true })
        .eq("status", "provider_pending"),
    ),
    loadPaidPayments(),
    loadPayouts(),
  ]);

  const financial = new Map<
    string,
    {
      currency: string;
      paymentsCount: number;
      grossCents: number;
      commissionCents: number;
      providerNetCents: number;
      pendingPayoutCents: number;
      paidPayoutCents: number;
    }
  >();

  const rowFor = (currencyValue: unknown) => {
    const currency = String(currencyValue || "BRL").toUpperCase();
    const current = financial.get(currency) ?? {
      currency,
      paymentsCount: 0,
      grossCents: 0,
      commissionCents: 0,
      providerNetCents: 0,
      pendingPayoutCents: 0,
      paidPayoutCents: 0,
    };
    financial.set(currency, current);
    return current;
  };

  for (const payment of payments) {
    const row = rowFor(payment.currency);
    row.paymentsCount += 1;
    row.grossCents += cents(payment.gross_amount_cents);
    row.commissionCents += cents(payment.platform_fee_cents);
    row.providerNetCents += cents(payment.provider_net_cents);
  }

  for (const payout of payouts) {
    const row = rowFor(payout.currency);
    const amount = cents(payout.net_cents);
    if (payout.status === "paid") row.paidPayoutCents += amount;
    else if (PENDING_PAYOUT_STATUSES.includes(String(payout.status))) row.pendingPayoutCents += amount;
  }

  return {
    generatedAt: now,
    metrics: {
      activeProfessionals,
      pendingProfessionals,
      activeCompanies,
      activeEmployees,
      activeSubscriptions,
      paidPayments: payments.length,
      pendingPayouts: payouts.filter((row) => PENDING_PAYOUT_STATUSES.includes(String(row.status))).length,
      pendingNotifications,
    },
    financialByCurrency: [...financial.values()].sort((a, b) => a.currency.localeCompare(b.currency)),
  };
}

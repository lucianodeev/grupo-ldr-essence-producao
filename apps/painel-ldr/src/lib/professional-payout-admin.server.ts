import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { resolveAccess, writeAudit } from "@/lib/access.server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type Client = SupabaseClient<Database>;
const db = supabaseAdmin as unknown as { from: (table: string) => any; rpc: (fn: string, args?: Record<string, unknown>) => any };
const BUCKET = "professional-private-documents";
function fail(message: string): never { throw new Error(message); }

async function requireSuperadmin(supabase: Client, userId: string) {
  const access = await resolveAccess(supabase, userId);
  if (!access.authorized || access.role !== "superadmin") fail("Acesso negado.");
  return access;
}

function stripeSecret() {
  const secret = process.env["STRIPE_SECRET_KEY"];
  if (!secret) fail("Stripe Connect indisponível no momento.");
  return secret;
}

async function stripeGet(path: string) {
  const response = await fetch(`https://api.stripe.com${path}`, {
    headers: { Authorization: `Bearer ${stripeSecret()}` },
  });
  const payload = await response.json() as any;
  if (!response.ok) fail(payload?.error?.message || "Não foi possível consultar o Stripe.");
  return payload;
}

async function stripeTransfer(input: { payoutId: string; professionalAccountId: string; destination: string; amount: number; currency: string }) {
  const params = new URLSearchParams();
  params.set("amount", String(input.amount));
  params.set("currency", input.currency.toLowerCase());
  params.set("destination", input.destination);
  params.set("transfer_group", `ldr-payout-${input.payoutId}`);
  params.set("metadata[payout_id]", input.payoutId);
  params.set("metadata[professional_account_id]", input.professionalAccountId);
  params.set("metadata[platform]", "Rede de Profissionais LDR");
  const response = await fetch("https://api.stripe.com/v1/transfers", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${stripeSecret()}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "Idempotency-Key": `ldr-professional-payout-${input.payoutId}`,
    },
    body: params,
  });
  const payload = await response.json() as any;
  if (!response.ok || !payload?.id) fail(payload?.error?.message || "Não foi possível enviar o repasse pelo Stripe Connect.");
  return payload;
}

export async function getProfessionalPayoutAdmin(supabase: Client, userId: string) {
  await requireSuperadmin(supabase, userId);
  const [{ data: payouts }, { data: documents }, { data: profiles }, { data: balances }] = await Promise.all([
    db.from("payouts").select("id,professional_account_id,period_start,period_end,currency,gross_cents,platform_fee_cents,payment_fee_cents,refund_cents,adjustment_cents,net_cents,status,scheduled_for,paid_at,payment_reference,payment_method,created_at,updated_at").order("period_end", { ascending: false }).limit(300),
    db.from("payout_documents").select("id,payout_id,professional_account_id,document_type,original_filename,period_start,period_end,declared_amount_cents,currency,status,rejection_reason,uploaded_at,reviewed_at,mime_type").order("uploaded_at", { ascending: false }).limit(500),
    db.from("professional_profiles").select("professional_account_id,display_name,professional_title,country_code,slug"),
    db.from("provider_balances").select("professional_account_id,currency,available_cents,pending_cents,updated_at"),
  ]);
  const profileBy = new Map((profiles ?? []).map((p: any) => [p.professional_account_id, p]));
  return {
    payouts: (payouts ?? []).map((p: any) => ({ ...p, professional: profileBy.get(p.professional_account_id) ?? null })),
    documents: documents ?? [],
    balances: balances ?? [],
  };
}

export async function reviewPayoutDocument(supabase: Client, userId: string, input: { documentId: string; decision: "approve" | "reject"; rejectionReason?: string | null }) {
  const actor = await requireSuperadmin(supabase, userId);
  const { data: doc } = await db.from("payout_documents").select("id,payout_id,status").eq("id", input.documentId).maybeSingle();
  if (!doc) fail("Documento não encontrado.");
  const approved = input.decision === "approve";
  const reason = input.rejectionReason?.trim() || null;
  if (!approved && !reason) fail("Informe o motivo da rejeição.");
  const { error } = await db.from("payout_documents").update({
    status: approved ? "approved" : "rejected",
    rejection_reason: approved ? null : reason,
    reviewed_at: new Date().toISOString(),
    reviewed_by: userId,
  }).eq("id", doc.id);
  if (error) throw error;

  if (approved) {
    const { data: docs } = await db.from("payout_documents").select("status").eq("payout_id", doc.payout_id);
    const statuses = (docs ?? []).map((d: any) => d.status);
    if (statuses.length && statuses.every((s: string) => s === "approved")) {
      await db.from("payouts").update({ status: "approved_for_payout", updated_at: new Date().toISOString() }).eq("id", doc.payout_id).neq("status", "paid");
    } else {
      await db.from("payouts").update({ status: "in_review", updated_at: new Date().toISOString() }).eq("id", doc.payout_id).neq("status", "paid");
    }
  } else {
    await db.from("payouts").update({ status: "adjustment_required", updated_at: new Date().toISOString() }).eq("id", doc.payout_id).neq("status", "paid");
  }
  await writeAudit({ actorId: userId, actorEmail: actor.email, action: approved ? "professional_network.payout_document_approved" : "professional_network.payout_document_rejected", target: doc.id, details: { payoutId: doc.payout_id, reason } });
  return { ok: true as const };
}

export async function getPayoutDocumentSignedUrl(supabase: Client, userId: string, documentId: string) {
  await requireSuperadmin(supabase, userId);
  const { data: doc } = await db.from("payout_documents").select("storage_path,original_filename").eq("id", documentId).maybeSingle();
  if (!doc?.storage_path) fail("Documento indisponível.");
  const { data, error } = await supabaseAdmin.storage.from(BUCKET).createSignedUrl(doc.storage_path, 300, { download: doc.original_filename || true });
  if (error || !data?.signedUrl) fail("Não foi possível abrir o documento.");
  return { url: data.signedUrl };
}

export async function setPayoutProcessing(supabase: Client, userId: string, payoutId: string) {
  const actor = await requireSuperadmin(supabase, userId);
  const { data: payout } = await db.from("payouts")
    .select("id,professional_account_id,status,net_cents,currency,payment_reference,payment_method")
    .eq("id", payoutId)
    .maybeSingle();
  if (!payout) fail("Repasse não encontrado.");
  if (payout.status === "paid") return { ok: true as const, alreadyPaid: true };

  let transferId = String(payout.payment_reference || "");
  if (payout.status === "processing" && transferId.startsWith("tr_")) {
    const { data, error } = await db.rpc("finalize_professional_payout", {
      p_payout_id: payout.id,
      p_actor_id: userId,
      p_payment_reference: transferId,
      p_payment_method: "stripe_connect",
    });
    if (error) fail(error.message || "A transferência foi criada no Stripe, mas a baixa do repasse ainda precisa ser concluída.");
    return data ?? { ok: true as const, transferId };
  }

  if (payout.status !== "approved_for_payout") fail("O repasse precisa estar aprovado antes de processar.");
  const amount = Math.round(Number(payout.net_cents || 0));
  if (!Number.isFinite(amount) || amount <= 0) fail("O valor líquido do repasse precisa ser maior que zero.");

  const { data: account } = await db.from("professional_accounts")
    .select("id,stripe_connected_account_id,connect_status,payout_method_status")
    .eq("id", payout.professional_account_id)
    .maybeSingle();
  if (!account?.stripe_connected_account_id) fail("O profissional ainda não configurou a conta Stripe Connect.");

  const stripeAccount = await stripeGet(`/v1/accounts/${encodeURIComponent(account.stripe_connected_account_id)}`);
  const transfersStatus = stripeAccount?.capabilities?.transfers;
  if (transfersStatus !== "active") fail("A conta Stripe Connect do profissional ainda não está habilitada para receber transferências.");
  if (!stripeAccount?.details_submitted) fail("O profissional ainda precisa concluir os dados obrigatórios no Stripe.");

  const transfer = await stripeTransfer({
    payoutId: payout.id,
    professionalAccountId: payout.professional_account_id,
    destination: account.stripe_connected_account_id,
    amount,
    currency: payout.currency,
  });
  transferId = transfer.id;

  const { error: processingError } = await db.from("payouts").update({
    status: "processing",
    payment_reference: transferId,
    payment_method: "stripe_connect",
    updated_at: new Date().toISOString(),
  }).eq("id", payout.id).eq("status", "approved_for_payout");
  if (processingError) throw processingError;

  const { data, error } = await db.rpc("finalize_professional_payout", {
    p_payout_id: payout.id,
    p_actor_id: userId,
    p_payment_reference: transferId,
    p_payment_method: "stripe_connect",
  });
  if (error) {
    await writeAudit({ actorId: userId, actorEmail: actor.email, action: "professional_network.payout_transfer_created_finalize_pending", target: payout.id, details: { transferId, amount, currency: payout.currency } });
    fail(error.message || "A transferência foi criada no Stripe, mas a baixa do repasse ainda precisa ser concluída.");
  }
  await writeAudit({ actorId: userId, actorEmail: actor.email, action: "professional_network.payout_paid_stripe_connect", target: payout.id, details: { transferId, amount, currency: payout.currency, destination: account.stripe_connected_account_id } });
  return data ?? { ok: true as const, transferId };
}

export async function markProfessionalPayoutPaid(supabase: Client, userId: string, input: { payoutId: string; paymentReference: string; paymentMethod?: string | null }) {
  await requireSuperadmin(supabase, userId);
  const reference = input.paymentReference.trim();
  if (!reference) fail("Informe a referência do pagamento.");
  const { data, error } = await db.rpc("finalize_professional_payout", {
    p_payout_id: input.payoutId,
    p_actor_id: userId,
    p_payment_reference: reference,
    p_payment_method: input.paymentMethod?.trim() || "manual",
  });
  if (error) fail(error.message || "Não foi possível concluir o repasse.");
  return data ?? { ok: true };
}

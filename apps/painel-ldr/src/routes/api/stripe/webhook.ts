import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";

const MAX_BODY = 256 * 1024;
const TOLERANCE_SECONDS = 300;

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

function verifyStripeSignature(raw: string, header: string, secret: string): boolean {
  const parts = header.split(",").map((part) => part.trim());
  const timestamp = parts.find((p) => p.startsWith("t="))?.slice(2);
  const signatures = parts.filter((p) => p.startsWith("v1=")).map((p) => p.slice(3));
  if (!timestamp || !signatures.length) return false;

  const ts = Number(timestamp);
  if (!Number.isFinite(ts) || Math.abs(Math.floor(Date.now() / 1000) - ts) > TOLERANCE_SECONDS) return false;

  const expected = createHmac("sha256", secret).update(`${timestamp}.${raw}`).digest("hex");
  const a = Buffer.from(expected);
  return signatures.some((signature) => {
    const b = Buffer.from(signature);
    return a.length === b.length && timingSafeEqual(a, b);
  });
}

type StripeObject = {
  id?: string;
  payment_status?: string;
  status?: string;
  amount_total?: number;
  amount?: number;
  amount_refunded?: number;
  currency?: string;
  metadata?: Record<string, string>;
  customer?: string | { id?: string } | null;
  subscription?: string | { id?: string } | null;
  parent?: { subscription_details?: { subscription?: string | { id?: string } | null } } | null;
  payment_intent?: string | { id?: string } | null;
  current_period_start?: number;
  current_period_end?: number;
  cancel_at_period_end?: boolean;
};

type StripeEvent = {
  id: string;
  type: string;
  created?: number;
  data?: { object?: StripeObject };
};

async function database() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin as unknown as { from: (table: string) => any };
}

function stripeId(value: string | { id?: string } | null | undefined) {
  return typeof value === "string" ? value : value?.id ?? null;
}
function isoFromUnix(value?: number) {
  return value && Number.isFinite(value) ? new Date(value * 1000).toISOString() : null;
}

async function markEvent(eventId: string, eventType: string) {
  const db = await database();
  const { data, error } = await db.from("stripe_webhook_events").insert({ event_id: eventId, event_type: eventType }).select("event_id").maybeSingle();
  if (!error && data) return "new" as const;
  if (error?.code === "23505") return "duplicate" as const;
  if (error?.code === "PGRST205") {
    console.warn("Stripe webhook event table unavailable; using order metadata idempotency.");
    return "metadata_fallback" as const;
  }
  throw error ?? new Error("Falha ao registrar evento Stripe.");
}

async function orderAlreadyProcessedEvent(orderId: string, eventId: string) {
  const db = await database();
  const { data, error } = await db.from("orders").select("metadata").eq("id", orderId).maybeSingle();
  if (error) throw error;
  const metadata = data?.metadata as Record<string, unknown> | null | undefined;
  return metadata?.["stripe_event_id"] === eventId;
}

async function updateOrder(orderId: string, patch: Record<string, unknown>) {
  const db = await database();
  const { error } = await db.from("orders").update(patch).eq("id", orderId);
  if (error) throw error;
}

async function completeOrganizationPurchase(metadata: Record<string, string>) {
  const purchaseId = metadata["purchase_id"];
  const orderId = metadata["order_id"];
  if (!purchaseId || !orderId) return;
  const db = await database();
  const { data: purchase, error: purchaseError } = await db.from("organization_purchases").select("id,organization_id,order_id,catalog_key,status").eq("id", purchaseId).eq("order_id", orderId).maybeSingle();
  if (purchaseError) throw purchaseError;
  if (!purchase || purchase.status === "paid") return;
  const [{ data: selected, error: selectedError }, { data: service, error: serviceError }] = await Promise.all([
    db.from("organization_purchase_members").select("member_id").eq("purchase_id", purchase.id),
    db.from("service_catalog").select("package_sessions").eq("catalog_key", purchase.catalog_key).maybeSingle(),
  ]);
  if (selectedError) throw selectedError;
  if (serviceError) throw serviceError;
  const credits = Math.max(Number(service?.package_sessions ?? 0), 1);
  const rows = (selected ?? []).map((row: { member_id: string }) => ({ organization_id: purchase.organization_id, member_id: row.member_id, catalog_key: purchase.catalog_key, purchase_id: purchase.id, credits_granted: credits, credits_used: 0, status: "assigned" }));
  if (rows.length) {
    const { error } = await db.from("organization_benefit_allocations").upsert(rows, { onConflict: "purchase_id,member_id", ignoreDuplicates: true });
    if (error) throw error;
  }
  const { error } = await db.from("organization_purchases").update({ status: "paid" }).eq("id", purchase.id);
  if (error) throw error;
}

async function setOrganizationPurchaseStatus(metadata: Record<string, string>, status: "cancelled" | "refunded") {
  const purchaseId = metadata["purchase_id"];
  if (!purchaseId) return;
  const db = await database();
  const { error } = await db.from("organization_purchases").update({ status }).eq("id", purchaseId);
  if (error) throw error;
  if (status === "refunded") {
    const { error: revokeError } = await db.from("organization_benefit_allocations").update({ status: "revoked" }).eq("purchase_id", purchaseId).eq("credits_used", 0);
    if (revokeError) throw revokeError;
  }
}

async function setProfessionalSubscription(metadata: Record<string, string>, object: StripeObject, eventType: string) {
  const rowId = metadata["professional_subscription_id"];
  const accountId = metadata["professional_account_id"];
  if (!rowId && !accountId && !object.id) return false;
  const db = await database();
  const rawStatus = eventType === "customer.subscription.deleted" ? "canceled" : String(object.status ?? (eventType === "checkout.session.completed" ? "active" : "pending"));
  const allowed = new Set(["pending","active","past_due","canceled","unpaid","paused","incomplete"]);
  const status = rawStatus === "trialing" ? "active" : allowed.has(rawStatus) ? rawStatus : "incomplete";
  const subscriptionId = eventType.startsWith("customer.subscription") ? object.id ?? null : stripeId(object.subscription) ?? stripeId(object.parent?.subscription_details?.subscription);
  let query = db.from("professional_subscriptions").update({
    status,
    stripe_checkout_session_id: eventType === "checkout.session.completed" ? object.id ?? null : undefined,
    stripe_subscription_id: subscriptionId ?? undefined,
    current_period_start: isoFromUnix(object.current_period_start),
    current_period_end: isoFromUnix(object.current_period_end),
    cancel_at_period_end: Boolean(object.cancel_at_period_end),
    updated_at: new Date().toISOString(),
  });
  if (rowId) query = query.eq("id", rowId);
  else if (subscriptionId) query = query.eq("stripe_subscription_id", subscriptionId);
  else return false;
  const { error } = await query;
  if (error) throw error;

  let resolvedAccountId = accountId;
  if (!resolvedAccountId && subscriptionId) {
    const { data } = await db.from("professional_subscriptions").select("professional_account_id").eq("stripe_subscription_id", subscriptionId).maybeSingle();
    resolvedAccountId = data?.professional_account_id;
  }
  if (resolvedAccountId) {
    if (status === "active") {
      const { data: profile } = await db.from("professional_profiles").select("compliance_status,profile_status").eq("professional_account_id", resolvedAccountId).maybeSingle();
      const nextStatus = profile?.compliance_status === "approved" ? "active" : "under_review";
      await db.from("professional_accounts").update({ status: nextStatus, updated_at: new Date().toISOString() }).eq("id", resolvedAccountId);
    } else if (status === "canceled" || status === "unpaid") {
      await db.from("professional_accounts").update({ status: "subscription_pending", updated_at: new Date().toISOString() }).eq("id", resolvedAccountId);
      await db.from("professional_profiles").update({ is_public: false, profile_status: "paused", updated_at: new Date().toISOString() }).eq("professional_account_id", resolvedAccountId);
    }
  }
  return true;
}

async function setCompanySubscription(metadata: Record<string, string>, object: StripeObject, eventType: string) {
  const rowId = metadata["company_subscription_id"];
  const subscriptionId = eventType.startsWith("customer.subscription") ? object.id ?? null : stripeId(object.subscription);
  if (!rowId && !subscriptionId) return false;

  let rawStatus = String(object.status ?? "pending");
  if (eventType === "checkout.session.completed") rawStatus = object.payment_status === "paid" || object.payment_status === "no_payment_required" ? "active" : "pending";
  if (eventType === "invoice.payment_succeeded") rawStatus = "active";
  if (eventType === "checkout.session.expired" || eventType === "customer.subscription.deleted") rawStatus = "canceled";
  if (eventType === "invoice.payment_failed") rawStatus = "past_due";
  const allowed = new Set(["pending", "active", "past_due", "canceled", "unpaid", "paused", "incomplete"]);
  // A tabela atual não oferece período de teste; se a Stripe enviar trialing, os benefícios seguem ativos.
  const status = rawStatus === "trialing" ? "active" : allowed.has(rawStatus) ? rawStatus : "incomplete";
  const patch: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
  if (eventType === "checkout.session.completed" || eventType === "checkout.session.expired") patch.stripe_checkout_session_id = object.id ?? null;
  if (subscriptionId) patch.stripe_subscription_id = subscriptionId;
  const customerId = stripeId(object.customer);
  if (customerId) patch.stripe_customer_id = customerId;
  const periodStart = isoFromUnix(object.current_period_start);
  const periodEnd = isoFromUnix(object.current_period_end);
  if (periodStart) patch.current_period_start = periodStart;
  if (periodEnd) patch.current_period_end = periodEnd;
  if (typeof object.cancel_at_period_end === "boolean") patch.cancel_at_period_end = object.cancel_at_period_end;

  const db = await database();
  let query = db.from("company_subscriptions").update(patch);
  if (rowId) query = query.eq("id", rowId);
  else if (subscriptionId) query = query.eq("stripe_subscription_id", subscriptionId);
  else return false;
  const { error } = await query;
  if (error) throw error;
  return true;
}

async function balanceCredit(accountId: string, currency: string, gross: number, platformFee: number, net: number) {
  const db = await database();
  const { data: row } = await db.from("provider_balances").select("available_cents,pending_cents,lifetime_gross_cents,lifetime_platform_fee_cents,lifetime_refunds_cents").eq("professional_account_id", accountId).eq("currency", currency).maybeSingle();
  const payload = {
    professional_account_id: accountId,
    currency,
    available_cents: Number(row?.available_cents ?? 0) + net,
    pending_cents: Number(row?.pending_cents ?? 0),
    lifetime_gross_cents: Number(row?.lifetime_gross_cents ?? 0) + gross,
    lifetime_platform_fee_cents: Number(row?.lifetime_platform_fee_cents ?? 0) + platformFee,
    lifetime_refunds_cents: Number(row?.lifetime_refunds_cents ?? 0),
    updated_at: new Date().toISOString(),
  };
  const { error } = await db.from("provider_balances").upsert(payload, { onConflict: "professional_account_id,currency" });
  if (error) throw error;
}

async function completeMarketplaceBooking(metadata: Record<string, string>, object: StripeObject, eventId: string) {
  const bookingId = metadata["booking_id"];
  const paymentId = metadata["payment_id"];
  const accountId = metadata["professional_account_id"];
  if (!bookingId || !paymentId || !accountId) return false;
  const db = await database();
  const { data: payment, error: paymentError } = await db.from("marketplace_payments").select("id,status,gross_amount_cents,platform_fee_cents,payment_fee_cents,refund_amount_cents,adjustment_cents,provider_net_cents,currency").eq("id", paymentId).eq("booking_id", bookingId).maybeSingle();
  if (paymentError) throw paymentError;
  if (!payment || payment.status === "paid") return true;
  const gross = Number(payment.gross_amount_cents ?? 0);
  const platformFee = Number(payment.platform_fee_cents ?? 0);
  const net = Number(payment.provider_net_cents ?? Math.max(gross - platformFee, 0));
  const { error: payUpdate } = await db.from("marketplace_payments").update({ status: "paid", stripe_checkout_session_id: object.id ?? null, stripe_payment_intent_id: stripeId(object.payment_intent), paid_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", payment.id);
  if (payUpdate) throw payUpdate;
  const { error: bookingUpdate } = await db.from("marketplace_bookings").update({ status: "confirmed", confirmed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", bookingId);
  if (bookingUpdate) throw bookingUpdate;
  const ledgerRows = [
    { professional_account_id: accountId, booking_id: bookingId, payment_id: payment.id, entry_type: "gross_sale", amount_cents: gross, currency: payment.currency, stripe_event_id: eventId, idempotency_key: `${eventId}:gross`, description: "Valor bruto do atendimento" },
    { professional_account_id: accountId, booking_id: bookingId, payment_id: payment.id, entry_type: "platform_fee", amount_cents: -platformFee, currency: payment.currency, stripe_event_id: eventId, idempotency_key: `${eventId}:platform_fee`, description: "Comissão da plataforma" },
    { professional_account_id: accountId, booking_id: bookingId, payment_id: payment.id, entry_type: "provider_credit", amount_cents: net, currency: payment.currency, stripe_event_id: eventId, idempotency_key: `${eventId}:provider_credit`, description: "Crédito líquido previsto do profissional" },
  ];
  const { error: ledgerError } = await db.from("marketplace_ledger").upsert(ledgerRows, { onConflict: "idempotency_key", ignoreDuplicates: true });
  if (ledgerError) throw ledgerError;
  await balanceCredit(accountId, payment.currency, gross, platformFee, net);
  return true;
}

async function cancelMarketplaceBooking(metadata: Record<string, string>, paymentIntentId?: string | null) {
  const bookingId = metadata["booking_id"];
  const paymentId = metadata["payment_id"];
  const db = await database();
  if (bookingId) await db.from("marketplace_bookings").update({ status: "cancelled_client", updated_at: new Date().toISOString() }).eq("id", bookingId).eq("status", "awaiting_payment");
  if (paymentId) await db.from("marketplace_payments").update({ status: "failed", stripe_payment_intent_id: paymentIntentId ?? undefined, updated_at: new Date().toISOString() }).eq("id", paymentId).eq("status", "pending");
  return Boolean(bookingId || paymentId);
}

async function refundMarketplacePayment(object: StripeObject, eventId: string) {
  const db = await database();
  const metadata = object.metadata ?? {};
  let payment: any = null;
  if (metadata["payment_id"]) {
    const { data } = await db.from("marketplace_payments").select("*").eq("id", metadata["payment_id"]).maybeSingle();
    payment = data;
  }
  const pi = stripeId(object.payment_intent);
  if (!payment && pi) {
    const { data } = await db.from("marketplace_payments").select("*").eq("stripe_payment_intent_id", pi).maybeSingle();
    payment = data;
  }
  if (!payment) return false;
  const amountRefunded = Math.max(Number(object.amount_refunded ?? object.amount ?? 0), 0);
  const oldRefund = Number(payment.refund_amount_cents ?? 0);
  const delta = Math.max(amountRefunded - oldRefund, 0);
  if (!delta) return true;
  const gross = Number(payment.gross_amount_cents ?? 0);
  const full = amountRefunded >= gross;
  const newNet = Math.max(Number(payment.provider_net_cents ?? 0) - delta, 0);
  await db.from("marketplace_payments").update({ status: full ? "refunded" : "partially_refunded", refund_amount_cents: amountRefunded, provider_net_cents: newNet, stripe_charge_id: object.id ?? payment.stripe_charge_id, updated_at: new Date().toISOString() }).eq("id", payment.id);
  if (payment.booking_id) await db.from("marketplace_bookings").update({ status: full ? "refunded" : "partially_refunded", updated_at: new Date().toISOString() }).eq("id", payment.booking_id);
  const { error: ledgerError } = await db.from("marketplace_ledger").upsert({ professional_account_id: payment.professional_account_id, booking_id: payment.booking_id, payment_id: payment.id, entry_type: "refund", amount_cents: -delta, currency: payment.currency, stripe_event_id: eventId, idempotency_key: `${eventId}:refund`, description: "Reembolso do atendimento" }, { onConflict: "idempotency_key", ignoreDuplicates: true });
  if (ledgerError) throw ledgerError;
  const { data: balance } = await db.from("provider_balances").select("available_cents,pending_cents,lifetime_gross_cents,lifetime_platform_fee_cents,lifetime_refunds_cents").eq("professional_account_id", payment.professional_account_id).eq("currency", payment.currency).maybeSingle();
  if (balance) await db.from("provider_balances").update({ available_cents: Number(balance.available_cents ?? 0) - delta, lifetime_refunds_cents: Number(balance.lifetime_refunds_cents ?? 0) + delta, updated_at: new Date().toISOString() }).eq("professional_account_id", payment.professional_account_id).eq("currency", payment.currency);
  return true;
}

export const Route = createFileRoute("/api/stripe/webhook")({
  server: {
    handlers: {
      GET: async () => json(405, { ok: false }),
      POST: async ({ request }) => {
        const secret = process.env["STRIPE_WEBHOOK_SECRET"];
        if (!secret) return json(503, { ok: false, error: "Webhook não configurado." });
        const len = Number(request.headers.get("content-length") ?? "0");
        if (Number.isFinite(len) && len > MAX_BODY) return json(413, { ok: false });
        const signature = request.headers.get("stripe-signature") ?? "";
        const raw = await request.text();
        if (new TextEncoder().encode(raw).length > MAX_BODY) return json(413, { ok: false });
        if (!verifyStripeSignature(raw, signature, secret)) return json(400, { ok: false });
        let event: StripeEvent;
        try { event = JSON.parse(raw) as StripeEvent; } catch { return json(400, { ok: false }); }
        if (!event.id || !event.type) return json(400, { ok: false });

        try {
          const eventMark = await markEvent(event.id, event.type);
          if (eventMark === "duplicate") return json(200, { received: true, duplicate: true });
          const object = event.data?.object ?? {};
          const metadata = object.metadata ?? {};
          const orderId = metadata["order_id"];

          // Mantém intacto o fluxo já validado de pedidos e benefícios corporativos.
          if (orderId) {
            if (eventMark === "metadata_fallback" && (await orderAlreadyProcessedEvent(orderId, event.id))) return json(200, { received: true, duplicate: true });
            if (event.type === "checkout.session.completed") {
              if (object.payment_status !== "paid") return json(200, { received: true });
              await updateOrder(orderId, { payment_status: "pago", status: "concluido", stripe_checkout_session_id: object.id ?? null, metadata: { ...metadata, stripe_event_id: event.id, paid_at: new Date().toISOString() } });
              await completeOrganizationPurchase(metadata);
            } else if (event.type === "checkout.session.expired") {
              await updateOrder(orderId, { payment_status: "falhou", status: "cancelado", metadata: { ...metadata, stripe_event_id: event.id, expired: true } });
              await setOrganizationPurchaseStatus(metadata, "cancelled");
            } else if (event.type === "payment_intent.payment_failed") {
              await updateOrder(orderId, { payment_status: "falhou", metadata: { ...metadata, stripe_event_id: event.id, payment_failed: true } });
            } else if (event.type === "charge.refunded") {
              await updateOrder(orderId, { payment_status: "reembolsado", status: "cancelado", metadata: { ...metadata, stripe_event_id: event.id, refunded: true } });
              await setOrganizationPurchaseStatus(metadata, "refunded");
            }
          }

          // Empresas LDR: assinatura mensal recorrente, renovação, falha e cancelamento.
          if (metadata["checkout_kind"] === "company_subscription" && (event.type === "checkout.session.completed" || event.type === "checkout.session.expired")) {
            await setCompanySubscription(metadata, object, event.type);
          } else if (
            event.type === "customer.subscription.created" ||
            event.type === "customer.subscription.updated" ||
            event.type === "customer.subscription.deleted" ||
            event.type === "invoice.payment_succeeded" ||
            event.type === "invoice.payment_failed"
          ) {
            await setCompanySubscription(metadata, object, event.type);
          }

          // Rede de Profissionais LDR: assinatura mensal.
          if (metadata["checkout_kind"] === "professional_subscription" && event.type === "checkout.session.completed") {
            await setProfessionalSubscription(metadata, object, event.type);
          } else if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
            await setProfessionalSubscription(metadata, object, event.type);
          }

          // Rede de Profissionais LDR: atendimento marketplace.
          if (metadata["checkout_kind"] === "marketplace_booking") {
            if (event.type === "checkout.session.completed") {
              if (object.payment_status === "paid") await completeMarketplaceBooking(metadata, object, event.id);
            } else if (event.type === "checkout.session.expired" || event.type === "payment_intent.payment_failed") {
              await cancelMarketplaceBooking(metadata, stripeId(object.payment_intent));
            }
          }
          if (event.type === "charge.refunded") await refundMarketplacePayment(object, event.id);

          return json(200, { received: true });
        } catch (error) {
          try { const db = await database(); await db.from("stripe_webhook_events").delete().eq("event_id", event.id); } catch { /* best effort */ }
          console.error("Stripe webhook processing failed", error);
          return json(503, { received: false });
        }
      },
    },
  },
});

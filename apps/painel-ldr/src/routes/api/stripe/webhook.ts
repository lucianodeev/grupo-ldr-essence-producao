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
  if (!Number.isFinite(ts) || Math.abs(Math.floor(Date.now() / 1000) - ts) > TOLERANCE_SECONDS) {
    return false;
  }

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
  amount_total?: number;
  amount?: number;
  currency?: string;
  metadata?: Record<string, string>;
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

async function markEvent(eventId: string, eventType: string) {
  const db = await database();
  const { data, error } = await db
    .from("stripe_webhook_events")
    .insert({ event_id: eventId, event_type: eventType })
    .select("event_id")
    .maybeSingle();
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
  const { data: purchase, error: purchaseError } = await db
    .from("organization_purchases")
    .select("id,organization_id,order_id,catalog_key,status")
    .eq("id", purchaseId)
    .eq("order_id", orderId)
    .maybeSingle();
  if (purchaseError) throw purchaseError;
  if (!purchase || purchase.status === "paid") return;

  const [{ data: selected, error: selectedError }, { data: service, error: serviceError }] = await Promise.all([
    db.from("organization_purchase_members").select("member_id").eq("purchase_id", purchase.id),
    db.from("service_catalog").select("package_sessions").eq("catalog_key", purchase.catalog_key).maybeSingle(),
  ]);
  if (selectedError) throw selectedError;
  if (serviceError) throw serviceError;

  const credits = Math.max(Number(service?.package_sessions ?? 0), 1);
  const rows = (selected ?? []).map((row: { member_id: string }) => ({
    organization_id: purchase.organization_id,
    member_id: row.member_id,
    catalog_key: purchase.catalog_key,
    purchase_id: purchase.id,
    credits_granted: credits,
    credits_used: 0,
    status: "assigned",
  }));

  if (rows.length) {
    const { error: allocationError } = await db
      .from("organization_benefit_allocations")
      .upsert(rows, { onConflict: "purchase_id,member_id", ignoreDuplicates: true });
    if (allocationError) throw allocationError;
  }

  const { error: purchaseUpdateError } = await db
    .from("organization_purchases")
    .update({ status: "paid" })
    .eq("id", purchase.id);
  if (purchaseUpdateError) throw purchaseUpdateError;
}

async function setOrganizationPurchaseStatus(metadata: Record<string, string>, status: "cancelled" | "refunded") {
  const purchaseId = metadata["purchase_id"];
  if (!purchaseId) return;
  const db = await database();
  const { error } = await db.from("organization_purchases").update({ status }).eq("id", purchaseId);
  if (error) throw error;
  if (status === "refunded") {
    const { error: revokeError } = await db
      .from("organization_benefit_allocations")
      .update({ status: "revoked" })
      .eq("purchase_id", purchaseId)
      .eq("credits_used", 0);
    if (revokeError) throw revokeError;
  }
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
        try {
          event = JSON.parse(raw) as StripeEvent;
        } catch {
          return json(400, { ok: false });
        }
        if (!event.id || !event.type) return json(400, { ok: false });

        try {
          const eventMark = await markEvent(event.id, event.type);
          if (eventMark === "duplicate") return json(200, { received: true, duplicate: true });

          const object = event.data?.object ?? {};
          const metadata = object.metadata ?? {};
          const orderId = metadata["order_id"];

          if (orderId) {
            if (eventMark === "metadata_fallback" && (await orderAlreadyProcessedEvent(orderId, event.id))) {
              return json(200, { received: true, duplicate: true });
            }

            if (event.type === "checkout.session.completed") {
              if (object.payment_status !== "paid") return json(200, { received: true });
              await updateOrder(orderId, {
                payment_status: "pago",
                status: "concluido",
                stripe_checkout_session_id: object.id ?? null,
                metadata: { ...metadata, stripe_event_id: event.id, paid_at: new Date().toISOString() },
              });
              await completeOrganizationPurchase(metadata);
            } else if (event.type === "checkout.session.expired") {
              await updateOrder(orderId, {
                payment_status: "falhou",
                status: "cancelado",
                metadata: { ...metadata, stripe_event_id: event.id, expired: true },
              });
              await setOrganizationPurchaseStatus(metadata, "cancelled");
            } else if (event.type === "payment_intent.payment_failed") {
              await updateOrder(orderId, {
                payment_status: "falhou",
                metadata: { ...metadata, stripe_event_id: event.id, payment_failed: true },
              });
            } else if (event.type === "charge.refunded") {
              await updateOrder(orderId, {
                payment_status: "reembolsado",
                status: "cancelado",
                metadata: { ...metadata, stripe_event_id: event.id, refunded: true },
              });
              await setOrganizationPurchaseStatus(metadata, "refunded");
            }
          }

          return json(200, { received: true });
        } catch (error) {
          try {
            const db = await database();
            await db.from("stripe_webhook_events").delete().eq("event_id", event.id);
          } catch {
            /* best effort */
          }
          console.error("Stripe webhook processing failed", error);
          return json(503, { received: false });
        }
      },
    },
  },
});

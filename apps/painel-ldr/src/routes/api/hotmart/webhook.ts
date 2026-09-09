import { createFileRoute } from "@tanstack/react-router";

const MAX_BODY = 256 * 1024;

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

type HotmartEvent = {
  id?: string;
  event?: string;
  version?: string;
  creation_date?: number;
  data?: {
    buyer?: { name?: string; email?: string };
    product?: { id?: number | string; name?: string };
    purchase?: {
      transaction?: string;
      status?: string;
      price?: { value?: number; currency_value?: string; currency_code?: string };
      approved_date?: number;
    };
  };
};

async function db() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin as unknown as { from: (table: string) => any };
}

function normEmail(value?: string) {
  const email = value?.trim().toLowerCase() ?? "";
  return email.includes("@") ? email : null;
}

function basicName(email: string, fallback?: string) {
  if (fallback?.trim()) return fallback.trim();
  const local = email.split("@")[0] ?? email;
  return local.replace(/[._+-]+/g, " ").trim().replace(/\b\p{L}/gu, (x) => x.toUpperCase()) || email;
}

async function findOrCreateCustomer(email: string, name?: string) {
  const database = await db();
  const { data: existing, error: existingError } = await database
    .from("customers")
    .select("id,email,full_name")
    .ilike("email", email)
    .maybeSingle();
  if (existingError) throw existingError;
  if (existing) return existing;

  const { data: created, error: createError } = await database
    .from("customers")
    .insert({
      full_name: basicName(email, name),
      email,
      portal_active: true,
      source: "hotmart",
    })
    .select("id,email,full_name")
    .maybeSingle();
  if (createError) throw createError;
  if (!created) throw new Error("Falha ao criar cliente Hotmart.");
  return created;
}

async function findHotmartOrder(transaction: string) {
  const database = await db();
  const { data, error } = await database
    .from("orders")
    .select("id,metadata,payment_status,status,customer_id")
    .eq("catalog_key", "combo_empreendedor")
    .contains("metadata", { hotmart_transaction: transaction })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

function purchaseAmountCents(event: HotmartEvent) {
  const value = Number(event.data?.purchase?.price?.value ?? 0);
  return Number.isFinite(value) && value > 0 ? Math.round(value * 100) : 29999;
}

function purchaseCurrency(event: HotmartEvent) {
  const raw = event.data?.purchase?.price?.currency_value ?? event.data?.purchase?.price?.currency_code ?? "BRL";
  return String(raw).toUpperCase();
}

async function approve(event: HotmartEvent, email: string, transaction: string) {
  const database = await db();
  const customer = await findOrCreateCustomer(email, event.data?.buyer?.name);
  const existing = await findHotmartOrder(transaction);
  const metadata = {
    ...(existing?.metadata ?? {}),
    product_key: "combo_empreendedor",
    bundle: "ebook_coragem_comecar,livro_menino_mamao,do_mamao_ao_negocio",
    payment_provider: "hotmart",
    hotmart_transaction: transaction,
    hotmart_event_id: event.id ?? null,
    hotmart_event: event.event ?? null,
    hotmart_product_id: event.data?.product?.id ?? null,
    hotmart_product_name: event.data?.product?.name ?? null,
    paid_at: new Date().toISOString(),
  };

  if (existing) {
    const { error } = await database.from("orders").update({
      customer_id: customer.id,
      contact_email: email,
      payment_status: "pago",
      status: "concluido",
      metadata,
    }).eq("id", existing.id);
    if (error) throw error;
    return;
  }

  const { error } = await database.from("orders").insert({
    order_number: "",
    customer_id: customer.id,
    contact_email: email,
    service_type: "produto_digital",
    title: "A Coragem de Começar — Formação Completa",
    quantity: 1,
    amount_cents: purchaseAmountCents(event),
    currency: purchaseCurrency(event),
    payment_status: "pago",
    status: "concluido",
    priority: "media",
    catalog_key: "combo_empreendedor",
    metadata,
  });
  if (error) throw error;
}

async function revoke(event: HotmartEvent, transaction: string) {
  const database = await db();
  const existing = await findHotmartOrder(transaction);
  if (!existing) return;
  const eventName = event.event ?? "";
  const paymentStatus = eventName === "PURCHASE_REFUNDED" || eventName === "PURCHASE_CHARGEBACK" ? "reembolsado" : "falhou";
  const metadata = {
    ...(existing.metadata ?? {}),
    hotmart_event_id: event.id ?? null,
    hotmart_event: eventName,
    access_revoked_at: new Date().toISOString(),
  };
  const { error } = await database.from("orders").update({ payment_status: paymentStatus, status: "cancelado", metadata }).eq("id", existing.id);
  if (error) throw error;
}

export const Route = createFileRoute("/api/hotmart/webhook")({
  server: {
    handlers: {
      GET: async () => json(200, { ok: true, provider: "hotmart" }),
      POST: async ({ request }) => {
        const secret = process.env["HOTMART_HOTTOK"]?.trim();
        if (!secret) return json(503, { received: false, error: "HOTMART_HOTTOK não configurado." });

        const len = Number(request.headers.get("content-length") ?? "0");
        if (Number.isFinite(len) && len > MAX_BODY) return json(413, { received: false });

        const hottok = request.headers.get("x-hotmart-hottok")?.trim() ?? "";
        if (!hottok || hottok !== secret) return json(401, { received: false });

        const raw = await request.text();
        if (new TextEncoder().encode(raw).length > MAX_BODY) return json(413, { received: false });

        let event: HotmartEvent;
        try { event = JSON.parse(raw) as HotmartEvent; } catch { return json(400, { received: false }); }

        const eventName = String(event.event ?? "");
        const email = normEmail(event.data?.buyer?.email);
        const transaction = String(event.data?.purchase?.transaction ?? "").trim();
        if (!eventName || !transaction) return json(400, { received: false });

        try {
          if (eventName === "PURCHASE_APPROVED" || eventName === "PURCHASE_COMPLETE") {
            if (!email) return json(400, { received: false, error: "buyer.email ausente" });
            await approve(event, email, transaction);
          } else if (eventName === "PURCHASE_REFUNDED" || eventName === "PURCHASE_CHARGEBACK" || eventName === "PURCHASE_CANCELED" || eventName === "PURCHASE_CANCELLED") {
            await revoke(event, transaction);
          }
          return json(200, { received: true });
        } catch (error) {
          console.error("Hotmart webhook processing failed", error);
          return json(503, { received: false });
        }
      },
    },
  },
});

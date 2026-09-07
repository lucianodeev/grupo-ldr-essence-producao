import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const MAX_BODY = 16 * 1024;
const ALLOWED_ORIGINS = new Set([
  "https://lucianodeev.github.io",
  "https://painel.ldrrhestrategia.com",
]);

const bodySchema = z.object({
  token: z.string().uuid(),
  catalog_key: z.string().min(1).max(120),
  customer_name: z.string().trim().min(2).max(200),
  customer_email: z.string().trim().email().max(200),
  customer_phone: z.string().trim().max(60).optional().nullable(),
  quantity: z.number().int().min(1).max(100).optional().default(1),
}).strip();

type Prepared = {
  sale_id: string;
  seller_id: string;
  catalog_key: string;
  name: string;
  currency: "EUR" | "BRL";
  amount_cents: number;
  unit_amount_cents: number;
  quantity: number;
  commission_rate: number;
  commission_cents: number;
  billing_mode: "payment" | "subscription";
  stripe_payment_link_id?: string | null;
  stripe_price_id?: string | null;
  source_metadata?: Record<string, unknown> | null;
};

type StripePrice = { id?: string; unit_amount?: number; currency?: string; recurring?: unknown; error?: { message?: string } };
type StripeSession = { id?: string; url?: string; expires_at?: number; error?: { message?: string } };

function cors(origin: string) {
  const allowed = ALLOWED_ORIGINS.has(origin) ? origin : "https://lucianodeev.github.io";
  return {
    "content-type": "application/json",
    "cache-control": "no-store",
    "access-control-allow-origin": allowed,
    "access-control-allow-headers": "content-type",
    "access-control-allow-methods": "POST, OPTIONS",
    "vary": "Origin",
  };
}
function json(status: number, body: Record<string, unknown>, origin = "") {
  return new Response(JSON.stringify(body), { status, headers: cors(origin) });
}
async function stripeJson(path: string, secret: string) {
  const response = await fetch(`https://api.stripe.com${path}`, { headers: { Authorization: `Bearer ${secret}` } });
  const data = (await response.json()) as Record<string, unknown> & { error?: { message?: string } };
  if (!response.ok) throw new Error(data.error?.message || "Falha ao consultar Stripe.");
  return data;
}
function putMetadata(params: URLSearchParams, prefix: string, meta: Record<string, string>) {
  for (const [key, value] of Object.entries(meta)) params.set(`${prefix}[${key}]`, value);
}

export const Route = createFileRoute("/api/seller-checkout")({
  server: {
    handlers: {
      OPTIONS: async ({ request }) => new Response(null, { status: 204, headers: cors(request.headers.get("origin") ?? "") }),
      POST: async ({ request }) => {
        const origin = request.headers.get("origin") ?? "";
        if (origin && !ALLOWED_ORIGINS.has(origin)) return json(403, { ok: false, error: "Origem não permitida." }, origin);
        const contentType = request.headers.get("content-type") ?? "";
        if (!contentType.toLowerCase().includes("application/json")) return json(415, { ok: false, error: "Formato não suportado." }, origin);
        const declaredLength = Number(request.headers.get("content-length") ?? "0");
        if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY) return json(413, { ok: false, error: "Payload muito grande." }, origin);
        const raw = await request.text();
        if (new TextEncoder().encode(raw).length > MAX_BODY) return json(413, { ok: false, error: "Payload muito grande." }, origin);
        let parsedJson: unknown;
        try { parsedJson = JSON.parse(raw); } catch { return json(400, { ok: false, error: "Payload inválido." }, origin); }
        const parsed = bodySchema.safeParse(parsedJson);
        if (!parsed.success) return json(400, { ok: false, error: "Dados da venda inválidos." }, origin);

        const secret = process.env["STRIPE_SECRET_KEY"];
        if (!secret) return json(503, { ok: false, error: "Pagamento temporariamente indisponível." }, origin);
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const db = supabaseAdmin as any;
        let saleId: string | null = null;
        try {
          const { data, error } = await db.rpc("ldr_seller_checkout_prepare", {
            p_token: parsed.data.token,
            p_catalog_key: parsed.data.catalog_key,
            p_customer_name: parsed.data.customer_name,
            p_customer_email: parsed.data.customer_email,
            p_customer_phone: parsed.data.customer_phone || null,
            p_quantity: parsed.data.quantity,
          });
          if (error) throw new Error(error.message || "Não foi possível preparar a venda.");
          const prepared = data as Prepared;
          saleId = prepared.sale_id;
          if (!prepared?.sale_id || !prepared?.seller_id) throw new Error("Venda inválida.");

          let priceId = prepared.stripe_price_id || null;
          let stripePrice: StripePrice | null = null;
          if (priceId) {
            stripePrice = (await stripeJson(`/v1/prices/${encodeURIComponent(priceId)}`, secret)) as StripePrice;
          } else if (prepared.stripe_payment_link_id) {
            const lineItems = await stripeJson(`/v1/payment_links/${encodeURIComponent(prepared.stripe_payment_link_id)}/line_items?limit=1&expand[]=data.price`, secret) as { data?: Array<{ price?: StripePrice }> };
            stripePrice = lineItems.data?.[0]?.price ?? null;
            priceId = stripePrice?.id ?? null;
          }
          if (!priceId || !stripePrice) throw new Error("Preço Stripe não configurado para este produto.");
          const actualAmount = Number(stripePrice.unit_amount ?? -1);
          const actualCurrency = String(stripePrice.currency || "").toUpperCase();
          if (actualAmount !== Number(prepared.unit_amount_cents) || actualCurrency !== prepared.currency) {
            throw new Error("O preço oficial não corresponde ao Stripe. Venda bloqueada por segurança.");
          }

          const mode = prepared.billing_mode === "subscription" || Boolean(stripePrice.recurring) ? "subscription" : "payment";
          const metadata: Record<string, string> = {
            source: "seller_portal",
            ldr_sale_id: prepared.sale_id,
            ldr_seller_id: prepared.seller_id,
            ldr_catalog_key: prepared.catalog_key,
          };
          const sourceMetadata = prepared.source_metadata ?? {};
          if (typeof sourceMetadata["training_slug"] === "string") {
            metadata["training_slug"] = String(sourceMetadata["training_slug"]);
            metadata["product_key"] = "do-mamao-ao-negocio";
            metadata["region"] = prepared.currency === "BRL" ? "BR" : "EU";
          }

          const params = new URLSearchParams();
          params.set("mode", mode);
          // Seller checkout intentionally uses card-only immediate confirmation so the existing production webhook set is sufficient.
          // This avoids delayed-payment methods that would require additional async webhook events.
          params.append("payment_method_types[]", "card");
          metadata["seller_commission_scope"] = "initial_checkout";
          params.set("line_items[0][price]", priceId);
          params.set("line_items[0][quantity]", String(prepared.quantity || 1));
          params.set("customer_email", parsed.data.customer_email.toLowerCase());
          params.set("client_reference_id", prepared.sale_id);
          params.set("success_url", "https://ldrrhestrategia.com/?pagamento=sucesso");
          params.set("cancel_url", "https://ldrrhestrategia.com/?pagamento=cancelado");
          putMetadata(params, "metadata", metadata);
          if (mode === "payment") putMetadata(params, "payment_intent_data[metadata]", metadata);
          else putMetadata(params, "subscription_data[metadata]", metadata);

          const checkoutResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${secret}`,
              "Content-Type": "application/x-www-form-urlencoded",
              "Idempotency-Key": `ldr-seller-checkout-${prepared.sale_id}`,
            },
            body: params,
          });
          const session = (await checkoutResponse.json()) as StripeSession;
          if (!checkoutResponse.ok || !session.id || !session.url) throw new Error(session.error?.message || "Não foi possível criar o Checkout Stripe.");

          const { data: attached, error: attachError } = await db.rpc("ldr_seller_checkout_attach", {
            p_token: parsed.data.token,
            p_sale_id: prepared.sale_id,
            p_checkout_session_id: session.id,
            p_checkout_url: session.url,
            p_stripe_price_id: priceId,
            p_expires_at: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : null,
          });
          if (attachError || !attached) throw new Error(attachError?.message || "Não foi possível vincular o pagamento à venda.");

          return json(200, {
            ok: true,
            sale_id: prepared.sale_id,
            session_id: session.id,
            url: session.url,
            name: prepared.name,
            currency: prepared.currency,
            amount_cents: prepared.amount_cents,
            commission_rate: prepared.commission_rate,
            commission_cents: prepared.commission_cents,
            expires_at: session.expires_at ?? null,
          }, origin);
        } catch (error) {
          if (saleId) {
            try {
              await db.from("ldr_simple_sales").delete().eq("id", saleId).eq("sale_source", "stripe_checkout").eq("payment_status", "payment_pending").is("stripe_checkout_session_id", null);
            } catch { /* best-effort cleanup */ }
          }
          console.error("Seller checkout failed", error);
          return json(400, { ok: false, error: error instanceof Error ? error.message : "Não foi possível gerar o pagamento." }, origin);
        }
      },
    },
  },
});

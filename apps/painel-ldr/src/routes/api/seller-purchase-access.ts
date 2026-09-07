import { createFileRoute } from "@tanstack/react-router";

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

type StripeSession = {
  id?: string;
  payment_status?: string;
  amount_total?: number;
  currency?: string;
  metadata?: Record<string, string>;
  payment_intent?: string | { id?: string } | null;
  subscription?: string | { id?: string } | null;
};

function stripeId(value: string | { id?: string } | null | undefined) {
  return typeof value === "string" ? value : value?.id ?? null;
}

function safeTarget(value: unknown) {
  const target = typeof value === "string" ? value : "/cliente";
  const allowed = [
    "/cliente",
    "/cliente/biblioteca",
    "/cliente/treinamentos",
    "/cliente/mentoria",
    "/empresa",
    "/funcionario",
    "/painel-profissional",
  ];
  return allowed.includes(target) ? target : "/cliente";
}

export const Route = createFileRoute("/api/seller-purchase-access")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const sessionId = url.searchParams.get("session_id")?.trim() ?? "";
        if (!sessionId.startsWith("cs_")) return json(400, { ok: false, error: "Sessão inválida." });

        const secret = process.env["STRIPE_SECRET_KEY"];
        if (!secret) return json(503, { ok: false, error: "Pagamento temporariamente indisponível." });

        const stripeResponse = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, {
          headers: { Authorization: `Bearer ${secret}` },
        });
        const session = (await stripeResponse.json()) as StripeSession;
        if (!stripeResponse.ok || session.id !== sessionId) return json(400, { ok: false, error: "Não foi possível validar o pagamento." });
        if (session.payment_status !== "paid") return json(202, { ok: true, status: "pending" });

        const metadata = session.metadata ?? {};
        if (metadata["source"] !== "seller_portal") return json(403, { ok: false, error: "Compra não pertence ao fluxo de vendedores." });
        const saleId = metadata["ldr_sale_id"];
        if (!saleId) return json(400, { ok: false, error: "Venda não identificada." });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const db = supabaseAdmin as any;
        const { data: sale, error: saleError } = await db.from("ldr_simple_sales")
          .select("id,payment_status,amount_cents,currency,stripe_checkout_session_id")
          .eq("id", saleId)
          .eq("sale_source", "stripe_checkout")
          .maybeSingle();
        if (saleError || !sale) return json(404, { ok: false, error: "Venda não encontrada." });
        if (sale.stripe_checkout_session_id && sale.stripe_checkout_session_id !== sessionId) return json(409, { ok: false, error: "Sessão divergente." });
        if (Number(session.amount_total ?? -1) !== Number(sale.amount_cents) || String(session.currency || "").toUpperCase() !== String(sale.currency || "").toUpperCase()) {
          return json(409, { ok: false, error: "Valor ou moeda divergente." });
        }

        if (sale.payment_status !== "paid") {
          const syntheticEventId = `verified_return:${sessionId}`;
          const { error } = await db.rpc("ldr_seller_stripe_apply_service", {
            p_event_id: syntheticEventId,
            p_event_type: "checkout.session.verified_return",
            p_sale_id: sale.id,
            p_payment_status: "paid",
            p_amount_cents: session.amount_total ?? null,
            p_currency: session.currency ? String(session.currency).toUpperCase() : null,
            p_checkout_session_id: sessionId,
            p_payment_intent_id: stripeId(session.payment_intent),
            p_subscription_id: stripeId(session.subscription),
            p_refund_amount_cents: 0,
            p_summary: { id: sessionId, payment_status: session.payment_status, source: "verified_return" },
          });
          if (error) return json(503, { ok: false, error: "Pagamento confirmado, mas a venda ainda está sendo sincronizada." });
        }

        const { data: provisioned, error: provisionError } = await db.rpc("ldr_seller_purchase_provision_service", { p_sale_id: sale.id });
        if (provisionError || !provisioned) return json(503, { ok: false, error: "Pagamento confirmado, mas o acesso ainda está sendo preparado." });

        const result = provisioned as Record<string, unknown>;
        const customerId = String(result["customer_id"] ?? "");
        const customerEmail = String(result["customer_email"] ?? "").toLowerCase();
        const customerName = String(result["customer_name"] ?? customerEmail);
        const target = safeTarget(result["target_path"]);

        let activationRequired = true;
        let activationSent = false;
        if (customerId) {
          const { data: customer } = await db.from("customers").select("auth_user_id").eq("id", customerId).maybeSingle();
          activationRequired = !customer?.auth_user_id;
        }

        if (activationRequired && customerEmail.includes("@")) {
          const { data: staff } = await db.from("profiles").select("id").ilike("email", customerEmail).maybeSingle();
          if (!staff) {
            const { error: createError } = await supabaseAdmin.auth.admin.createUser({
              email: customerEmail,
              email_confirm: true,
              password: crypto.randomUUID() + crypto.randomUUID(),
              user_metadata: { full_name: customerName, account_kind: "cliente" },
            });
            if (!createError) {
              const origin = "https://painel.ldrrhestrategia.com";
              const { error: resetError } = await supabaseAdmin.auth.resetPasswordForEmail(customerEmail, {
                redirectTo: `${origin}/cliente/definir-senha`,
              });
              activationSent = !resetError;
            }
          }
        }

        return json(200, {
          ok: true,
          status: "ready",
          target,
          activation_required: activationRequired,
          activation_sent: activationSent,
          email: customerEmail,
        });
      },
    },
  },
});

import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

function maskEmail(value: string) {
  const [local, domain] = value.split("@");
  if (!local || !domain) return "";
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}${"*".repeat(Math.max(2, local.length - visible.length))}@${domain}`;
}

export const Route = createFileRoute("/api/seller-referral")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const parsed = z.string().uuid().safeParse(url.searchParams.get("ref"));
        if (!parsed.success) return json(400, { ok: false, error: "Link inválido." });
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const db = supabaseAdmin as any;
        const { data, error } = await db.rpc("ldr_seller_referral_get_service", { p_ref: parsed.data });
        if (error || !data) return json(404, { ok: false, error: "Link não encontrado." });
        if (!["created", "checkout_created"].includes(String(data.status))) {
          return json(410, { ok: false, status: data.status, error: data.status === "paid" ? "Este link já foi utilizado." : "Este link expirou ou não está mais disponível." });
        }
        return json(200, {
          ok: true,
          id: data.id,
          name: data.name,
          portal_kind: data.portal_kind,
          plan_code: data.plan_code,
          market: data.market,
          customer_name: data.customer_name,
          email_hint: maskEmail(String(data.customer_email || "")),
          amount_cents: data.variable_price ? null : Number(data.amount_cents || 0),
          currency: data.currency,
          variable_price: Boolean(data.variable_price),
          commission_rate: Number(data.commission_rate || 0),
          expires_at: data.expires_at,
        });
      },
    },
  },
});

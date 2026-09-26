import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { resolveClient } from "@/lib/client-portal.server";

/** Read-only LDR ONE entitlement; never grants access from checkout redirects or pending invoices. */
export async function getLdrOneEntitlement(userId: string, email: string | null) {
  const resolved = await resolveClient(userId, email);
  if (resolved.status !== "ok") return { active: false, audience: null, seats: 0 } as const;
  const db = supabaseAdmin as any;
  const { data, error } = await db.from("ldr_pass_subscriptions")
    .select("id,ldr_one_offer,ldr_one_seats,status,current_period_end,stripe_subscription_id")
    .eq("customer_id", resolved.customer.id)
    .in("status", ["active", "trialing"])
    .not("ldr_one_offer", "is", null)
    .order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (error) throw new Error("Não foi possível validar o acesso LDR ONE.");
  const notExpired = data && (!data.current_period_end || new Date(data.current_period_end).getTime() > Date.now());
  const active = Boolean(notExpired && data.stripe_subscription_id && ["individual", "business"].includes(data.ldr_one_offer));
  return {
    active,
    audience: active ? data.ldr_one_offer as "individual" | "business" : null,
    seats: active ? Number(data.ldr_one_seats || 1) : 0,
  };
}

import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { resolveClient } from "@/lib/client-portal.server";

type StripeSubscription = {
  id?: string;
  status?: string;
  customer?: string;
  latest_invoice?: { status?: string } | string | null;
  current_period_end?: number;
  items?: { data?: Array<{ price?: { id?: string }; quantity?: number }> };
};
import { LDR_ONE_EUR } from "@/lib/ldr-one.catalog";

/**
 * Fail-closed verification: local webhook status alone cannot grant LDR ONE.
 * Stripe must confirm an active, paid subscription for the exact configured price.
 * Business seats are for the purchaser only until seat assignments are implemented.
 */
export async function getLdrOneEntitlement(userId: string, email: string | null) {
  const denied = { active: false, audience: null, seats: 0 } as const;
  const resolved = await resolveClient(userId, email);
  if (resolved.status !== "ok") return denied;
  const db = supabaseAdmin as any;
  const { data, error } = await db.from("ldr_pass_subscriptions")
    .select("id,ldr_one_offer,ldr_one_seats,status,current_period_end,stripe_subscription_id,stripe_customer_id")
    .eq("customer_id", resolved.customer.id)
    .eq("status", "active")
    .not("ldr_one_offer", "is", null)
    .order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (error) throw new Error("Não foi possível validar o acesso LDR ONE.");
  if (!data?.stripe_subscription_id || !data?.stripe_customer_id ||
      !["individual", "business"].includes(data.ldr_one_offer)) return denied;
  if (data.current_period_end && new Date(data.current_period_end).getTime() <= Date.now()) return denied;
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) return denied;
  const url = new URL("https://api.stripe.com/v1/subscriptions/" + encodeURIComponent(data.stripe_subscription_id));
  url.searchParams.set("expand[]", "latest_invoice");
  let subscription: StripeSubscription;
  try {
    const response = await fetch(url, { headers: { Authorization: `Bearer ${secret}` } });
    if (!response.ok) return denied;
    subscription = await response.json() as StripeSubscription;
  } catch {
    return denied;
  }
  if (subscription.id !== data.stripe_subscription_id ||
      subscription.customer !== data.stripe_customer_id ||
      subscription.status !== "active" ||
      !subscription.latest_invoice || typeof subscription.latest_invoice === "string" ||
      subscription.latest_invoice.status !== "paid" ||
      (subscription.current_period_end && subscription.current_period_end * 1000 <= Date.now())) return denied;
  const audience = data.ldr_one_offer as "individual" | "business";
  const allowedPrices: readonly string[] = audience === "individual"
    ? [LDR_ONE_EUR.individual.monthly.priceId, LDR_ONE_EUR.individual.annual.priceId]
    : [LDR_ONE_EUR.business.monthly.priceId, LDR_ONE_EUR.business.annual.priceId];
  const line = subscription.items?.data?.find(item => item.price?.id && allowedPrices.includes(item.price.id));
  const expectedSeats = Number(data.ldr_one_seats);
  if (!line || !Number.isSafeInteger(expectedSeats) ||
      line.quantity !== expectedSeats ||
      (audience === "individual" && expectedSeats !== 1) ||
      (audience === "business" && (expectedSeats < 5 || expectedSeats > 10000))) return denied;
  return { active: true, audience, seats: expectedSeats };
}

import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { canAccessLdrOneBusinessSeat } from "@/lib/ldr-one-business-seat-policy";
import { LDR_ONE_READER_APPROVED } from "@/lib/ldr-one-reader-catalog";

/** Fail closed until the reviewed allocation schema is installed and verified. */
export async function hasLdrOneBusinessReaderAccess(authUserId: string, productKey: string): Promise<boolean> {
  if (process.env["LDR_ONE_BUSINESS_READER_ENABLED"] !== "true" || !LDR_ONE_READER_APPROVED.has(productKey))
    return false;
  if (!authUserId) return false;
  const db = supabaseAdmin as any;
  const { data: allocations, error } = await db.from("ldr_one_seat_allocations")
    .select("subscription_id,auth_user_id,revoked_at")
    .eq("auth_user_id", authUserId)
    .is("revoked_at", null);
  if (error) throw new Error("Não foi possível verificar a vaga empresarial.");
  if (!allocations?.length) return false;
  const ids = [...new Set(allocations.map((a: { subscription_id: string }) => a.subscription_id))];
  const { data: subscriptions, error: subscriptionError } = await db.from("ldr_pass_subscriptions")
    .select("id,status,stripe_subscription_id,current_period_end,ldr_one_offer,ldr_one_seats")
    .in("id", ids);
  if (subscriptionError) throw new Error("Não foi possível validar a assinatura empresarial.");
  const byId = new Map((subscriptions ?? []).map((s: { id: string }) => [s.id, s]));
  const now = Date.now();
  return allocations.some((seat: { subscription_id: string; auth_user_id: string; revoked_at: string | null }) => {
    const subscription = byId.get(seat.subscription_id);
    return Boolean(subscription && canAccessLdrOneBusinessSeat(
      subscription as Parameters<typeof canAccessLdrOneBusinessSeat>[0],
      seat, seat.subscription_id, authUserId, now,
    ));
  });
}

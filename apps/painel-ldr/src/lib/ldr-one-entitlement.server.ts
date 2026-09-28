import { supabaseAdmin } from "@/integrations/supabase/client.server";

const db = supabaseAdmin as any;

// Paid digital catalog entitlement: free content remains independently accessible.
export async function hasActiveLdrOne(customerId: string) {
  const { data, error } = await db
    .from("ldr_pass_subscriptions")
    .select("id,status")
    .eq("customer_id", customerId)
    .in("status", ["active", "trialing"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    console.warn("LDR ONE entitlement lookup skipped", error);
    return false;
  }
  return Boolean(data?.id);
}

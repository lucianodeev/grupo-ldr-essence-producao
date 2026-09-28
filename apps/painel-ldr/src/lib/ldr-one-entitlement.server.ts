import { supabaseAdmin } from "@/integrations/supabase/client.server";

const db = supabaseAdmin as any;

// Paid digital catalog entitlement: free content remains independently accessible.
export async function hasActiveLdrOne(customerId: string) {
  const { data: direct, error } = await db
    .from("ldr_pass_subscriptions")
    .select("id,status,current_period_end")
    .eq("customer_id", customerId)
    .in("status", ["active", "trialing"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    console.warn("LDR ONE entitlement lookup skipped", error);
    return false;
  }
  if (direct?.id && (!direct.current_period_end || new Date(direct.current_period_end).getTime() > Date.now())) return true;

  // Business seat: an authenticated employee can receive the same digital
  // entitlement through an active seat assigned by the organization.
  const { data: customer } = await db.from("customers").select("auth_user_id,email").eq("id", customerId).maybeSingle();
  if (!customer?.auth_user_id && !customer?.email) return false;
  let memberQuery = db.from("organization_members").select("id").eq("portal_active", true);
  memberQuery = customer.auth_user_id
    ? memberQuery.eq("auth_user_id", customer.auth_user_id)
    : memberQuery.ilike("email", String(customer.email));
  const { data: member } = await memberQuery.limit(1).maybeSingle();
  if (!member?.id) return false;
  const { data: seat } = await db
    .from("ldr_one_seat_assignments")
    .select("id,subscription_id,ldr_pass_subscriptions!inner(status,current_period_end,plan)")
    .eq("member_id", member.id)
    .is("revoked_at", null)
    .eq("ldr_pass_subscriptions.plan", "business")
    .in("ldr_pass_subscriptions.status", ["active", "trialing"])
    .limit(1)
    .maybeSingle();
  const subscription = seat?.ldr_pass_subscriptions as any;
  return Boolean(seat?.id && (!subscription?.current_period_end || new Date(subscription.current_period_end).getTime() > Date.now()));
}

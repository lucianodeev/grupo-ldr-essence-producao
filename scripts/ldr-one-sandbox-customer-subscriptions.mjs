// Read-only customer-scoped subscription view. Never returns Stripe identifiers or another customer's rows.
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export async function getSandboxCustomerSubscriptions({db,identity}){
 if(!identity?.verified||!uuid.test(identity.userId??"")||!uuid.test(identity.customerId??""))throw Error("Authenticated customer required");
 const result=await db.query(
  "SELECT id,plan,billing_cycle,seats,status,created_at,updated_at FROM public.ldr_one_sandbox_subscriptions WHERE user_id=$1 AND customer_id=$2 ORDER BY created_at DESC LIMIT 25",
  [identity.userId,identity.customerId]);
 return result.rows.map(row=>({id:row.id,plan:row.plan,billingCycle:row.billing_cycle,seats:row.seats,status:row.status,createdAt:row.created_at,updatedAt:row.updated_at}));
}

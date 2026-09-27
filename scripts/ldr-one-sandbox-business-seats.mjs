// Atomic seat allocation for an authenticated company administrator.
// Caller MUST verify company administrator authorization in trusted middleware.
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export async function assignSandboxBusinessSeat({db,identity,subscriptionId,memberUserId,verifyMember}){
 if(!identity?.verified||identity.businessAdmin!==true||!uuid.test(identity.customerId??"")||
    !uuid.test(identity.userId??"")||!uuid.test(subscriptionId??"")||!uuid.test(memberUserId??"")||typeof verifyMember!=="function")
  throw Error("Verified business administrator and valid IDs required");
 // Membership MUST be resolved by trusted server-side directory, not browser input.
 if(await verifyMember({customerId:identity.customerId,userId:memberUserId})!==true)throw Error("Member is not verified for this company");
 await db.query("BEGIN");
 try{
  const result=await db.query(
   "SELECT id,seats,status FROM public.ldr_one_sandbox_subscriptions WHERE id=$1 AND customer_id=$2 AND plan='business' AND user_id=$3 FOR UPDATE",
   [subscriptionId,identity.customerId,identity.userId]);
  const sub=result.rows[0];
  if(!sub||!["active","trialing"].includes(sub.status))throw Error("Business subscription not active or not owned");
  const existing=await db.query(
   "SELECT 1 FROM public.ldr_one_sandbox_seat_assignments WHERE subscription_id=$1 AND user_id=$2",
   [subscriptionId,memberUserId]);
  if(existing.rowCount){await db.query("COMMIT");return {assigned:true,existing:true};}
  const count=await db.query("SELECT count(*)::integer AS used FROM public.ldr_one_sandbox_seat_assignments WHERE subscription_id=$1",[subscriptionId]);
  if(Number(count.rows[0]?.used)>=Number(sub.seats))throw Error("No business seats available");
  await db.query("INSERT INTO public.ldr_one_sandbox_seat_assignments(subscription_id,user_id) VALUES($1,$2)",[subscriptionId,memberUserId]);
  await db.query("COMMIT");
  return {assigned:true,existing:false};
 }catch(error){await db.query("ROLLBACK");throw error;}
}

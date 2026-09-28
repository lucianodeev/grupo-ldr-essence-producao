// Revoke only a verified company's own business seat. All operations are server-only.
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export async function revokeSandboxBusinessSeat({db,identity,subscriptionId,memberUserId}){
 if(!identity?.verified||identity.businessAdmin!==true||
    !uuid.test(identity.customerId??"")||!uuid.test(identity.userId??"")||
    !uuid.test(subscriptionId??"")||!uuid.test(memberUserId??""))
  throw Error("Verified company administrator required");
 await db.query("BEGIN");
 try{
  const owned=await db.query(
   "SELECT id FROM public.ldr_one_sandbox_subscriptions WHERE id=$1 AND customer_id=$2 AND user_id=$3 AND plan='business' FOR UPDATE",
   [subscriptionId,identity.customerId,identity.userId]);
  if(owned.rowCount!==1)throw Error("Business subscription ownership required");
  const deleted=await db.query(
   "DELETE FROM public.ldr_one_sandbox_seat_assignments WHERE subscription_id=$1 AND user_id=$2 RETURNING user_id",
   [subscriptionId,memberUserId]);
  await db.query("COMMIT");
  return {revoked:deleted.rowCount===1};
 }catch(error){await db.query("ROLLBACK");throw error;}
}

// Read-only seat roster. Caller must be a verified company administrator.
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export async function listSandboxBusinessSeats({db,identity,subscriptionId}){
 if(!identity?.verified||identity.businessAdmin!==true||
    !uuid.test(identity.userId??"")||!uuid.test(identity.customerId??"")||
    !uuid.test(subscriptionId??""))throw Error("Verified business administrator required");
 const result=await db.query(
  `SELECT a.user_id,a.assigned_at,s.seats
   FROM public.ldr_one_sandbox_subscriptions s
   LEFT JOIN public.ldr_one_sandbox_seat_assignments a ON a.subscription_id=s.id
   WHERE s.id=$1 AND s.customer_id=$2 AND s.user_id=$3 AND s.plan='business'
   ORDER BY a.assigned_at ASC NULLS LAST LIMIT 10001`,
  [subscriptionId,identity.customerId,identity.userId]);
 if(result.rows.length===0)throw Error("Business subscription not found");
 const seats=result.rows[0].seats;
 return {capacity:seats,used:result.rows.filter(row=>row.user_id!==null).length,
  members:result.rows.filter(row=>row.user_id!==null).map(row=>({userId:row.user_id,assignedAt:row.assigned_at}))};
}

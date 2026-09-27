// Server-only entitlement gate. No access from pending checkout or payment redirect.
// The caller MUST supply identity resolved by trusted authentication middleware.
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export async function checkSandboxEntitlement({db,identity}){
 if(identity?.verified!==true||!uuid.test(identity.userId??"")||!uuid.test(identity.customerId??""))throw Error("Authenticated identity required");
 if(!db||typeof db.query!=="function")throw Error("Private sandbox database required");
 const result=await db.query(
  `SELECT s.id,s.plan,s.status,s.seats,
    CASE WHEN s.plan='individual' THEN s.user_id=$1
         ELSE EXISTS(SELECT 1 FROM public.ldr_one_sandbox_seat_assignments a
                     WHERE a.subscription_id=s.id AND a.user_id=$1) END AS seat_authorized
   FROM public.ldr_one_sandbox_subscriptions s
   WHERE s.customer_id=$2 AND s.status IN ('active','trialing')
   ORDER BY s.created_at DESC LIMIT 25`,[identity.userId,identity.customerId]);
 const match=result.rows.find(row=>row.seat_authorized===true&&["individual","business"].includes(row.plan)&&["active","trialing"].includes(row.status));
 return {allowed:!!match,plan:match?.plan??null,subscriptionId:match?.id??null};
}

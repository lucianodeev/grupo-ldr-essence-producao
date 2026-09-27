// Dedicated sandbox-only customer directory. No production Supabase access.
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function createSandboxCustomerResolver({db,env}){
 if(env?.RENDER_SERVICE_ID!=="srv-das6drvavr4c7397dflg"||!db||typeof db.query!=="function")
  throw Error("Private sandbox customer directory unavailable");
 return async ({userId})=>{
  if(!uuid.test(userId??""))return null;
  const result=await db.query(
   "SELECT customer_id FROM public.ldr_one_sandbox_customer_members WHERE user_id=$1 AND verified=true LIMIT 2",
   [userId]
  );
  if(result.rows.length!==1||!uuid.test(result.rows[0]?.customer_id??""))return null;
  return {verified:true,customerId:result.rows[0].customer_id};
 };
}

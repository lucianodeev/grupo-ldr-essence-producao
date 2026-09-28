// Framework-neutral wiring: real verified sandbox JWT + trusted sandbox customer directory.
// This is deliberately not mounted on public routes until isolated auth is configured.
import {authenticateSandboxSupabase} from "./ldr-one-sandbox-supabase-auth.mjs";
import {handleSandboxSubscriptionStatus} from "./ldr-one-sandbox-status-api.mjs";
export async function handleVerifiedSandboxStatus({request,env,db,resolveCustomer,fetcher=fetch}){
 if(env?.RENDER_SERVICE_ID!=="srv-das6drvavr4c7397dflg"||env?.LDR_ONE_SANDBOX_AUTH_ENABLED!=="true"||env?.LDR_ONE_SANDBOX_STATUS_API_ENABLED!=="true")
  return {status:503,body:{error:"Verified sandbox status disabled"}};
 if(typeof resolveCustomer!=="function"||!db||typeof db.query!=="function")return {status:503,body:{error:"Trusted sandbox dependencies unavailable"}};
 return handleSandboxSubscriptionStatus({request,env,db,authenticate:req=>authenticateSandboxSupabase({request:req,env,fetcher,resolveCustomer})});
}

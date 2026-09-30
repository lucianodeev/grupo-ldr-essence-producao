import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
function emailOf(claims:Record<string,unknown>|undefined){return typeof claims?.email==="string"?claims.email:null;}
export const aiReadyAccess=createServerFn({method:"GET"}).middleware([requireSupabaseAuth]).handler(async({context})=>{const m=await import("@/lib/ai-ready.server");return m.getAiReadyAccess(context.userId,emailOf(context.claims));});
export const aiReadyCheckout=createServerFn({method:"POST"}).middleware([requireSupabaseAuth]).inputValidator((data:{market:"BR"|"INTL"})=>data).handler(async({context,data})=>{const m=await import("@/lib/ai-ready.server");return m.createAiReadyCheckout(context.userId,emailOf(context.claims),data.market);});

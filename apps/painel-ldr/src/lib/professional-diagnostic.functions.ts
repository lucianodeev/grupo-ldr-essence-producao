import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
function emailOf(claims:Record<string,unknown>|undefined){return typeof claims?.email==="string"?claims.email:null;}
export const professionalDiagnosticAccess=createServerFn({method:"GET"}).middleware([requireSupabaseAuth]).handler(async({context})=>{const m=await import("@/lib/professional-diagnostic.server");return m.getProfessionalDiagnosticAccess(context.userId,emailOf(context.claims));});
export const professionalDiagnosticCheckout=createServerFn({method:"POST"}).middleware([requireSupabaseAuth]).inputValidator((data:{market:"BR"|"INTL"})=>data).handler(async({context,data})=>{const m=await import("@/lib/professional-diagnostic.server");return m.createProfessionalDiagnosticCheckout(context.userId,emailOf(context.claims),data.market);});

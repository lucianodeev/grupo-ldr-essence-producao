import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
function emailOf(claims:Record<string,unknown>):string|null{const value=claims["email"];return typeof value==="string"?value:null;}
export const clientPsychoanalysisOffer=createServerFn({method:"GET"}).middleware([requireSupabaseAuth]).handler(async({context})=>{const {getPsychoanalysisOffer}=await import("@/lib/psychoanalysis-commerce.server");return getPsychoanalysisOffer(context.userId,emailOf(context.claims));});
export const clientCreatePsychoanalysisCheckout=createServerFn({method:"POST"}).middleware([requireSupabaseAuth]).inputValidator((data:{market:"BR"|"INTL"})=>data).handler(async({context,data})=>{const {createPsychoanalysisCheckout}=await import("@/lib/psychoanalysis-commerce.server");return createPsychoanalysisCheckout(context.userId,emailOf(context.claims),data.market);});

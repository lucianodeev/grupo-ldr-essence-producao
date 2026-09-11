import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
function emailOf(claims:Record<string,unknown>):string|null{const value=claims["email"];return typeof value==="string"?value:null;}
export const clientLeadershipOffer=createServerFn({method:"GET"}).middleware([requireSupabaseAuth]).handler(async({context})=>{const {getLeadershipOffer}=await import("@/lib/leadership-commerce.server");return getLeadershipOffer(context.userId,emailOf(context.claims));});
export const clientCreateLeadershipCheckout=createServerFn({method:"POST"}).middleware([requireSupabaseAuth]).inputValidator((data:{market:"BR"|"INTL"})=>data).handler(async({context,data})=>{const {createLeadershipCheckout}=await import("@/lib/leadership-commerce.server");return createLeadershipCheckout(context.userId,emailOf(context.claims),data.market);});

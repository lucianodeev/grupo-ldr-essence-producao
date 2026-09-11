import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
function emailOf(claims:Record<string,unknown>):string|null{const value=claims["email"];return typeof value==="string"?value:null;}
export const clientBriefTherapyOffer=createServerFn({method:"GET"}).middleware([requireSupabaseAuth]).handler(async({context})=>{const {getBriefTherapyOffer}=await import("@/lib/brief-therapy-commerce.server");return getBriefTherapyOffer(context.userId,emailOf(context.claims));});
export const clientCreateBriefTherapyCheckout=createServerFn({method:"POST"}).middleware([requireSupabaseAuth]).inputValidator((data:{market:"BR"|"INTL"})=>data).handler(async({context,data})=>{const {createBriefTherapyCheckout}=await import("@/lib/brief-therapy-commerce.server");return createBriefTherapyCheckout(context.userId,emailOf(context.claims),data.market);});

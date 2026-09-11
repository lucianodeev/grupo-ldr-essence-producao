import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
function emailOf(claims:Record<string,unknown>):string|null{const value=claims["email"];return typeof value==="string"?value:null;}
export const clientMassotherapyOffer=createServerFn({method:"GET"}).middleware([requireSupabaseAuth]).handler(async({context})=>{const {getMassotherapyOffer}=await import("@/lib/massotherapy-commerce.server");return getMassotherapyOffer(context.userId,emailOf(context.claims));});
export const clientCreateMassotherapyCheckout=createServerFn({method:"POST"}).middleware([requireSupabaseAuth]).inputValidator((data:{market:"BR"|"INTL"})=>data).handler(async({context,data})=>{const {createMassotherapyCheckout}=await import("@/lib/massotherapy-commerce.server");return createMassotherapyCheckout(context.userId,emailOf(context.claims),data.market);});

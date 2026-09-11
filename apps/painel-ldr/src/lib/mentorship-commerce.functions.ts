import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
function emailOf(claims:Record<string,unknown>):string|null{const value=claims["email"];return typeof value==="string"?value:null;}
export const clientMentorshipOffer=createServerFn({method:"GET"}).middleware([requireSupabaseAuth]).handler(async({context})=>{const {getMentorshipOffer}=await import("@/lib/mentorship-commerce.server");return getMentorshipOffer(context.userId,emailOf(context.claims));});
export const clientCreateMentorshipCheckout=createServerFn({method:"POST"}).middleware([requireSupabaseAuth]).inputValidator((data:{market:"BR"|"INTL"})=>data).handler(async({context,data})=>{const {createMentorshipCheckout}=await import("@/lib/mentorship-commerce.server");return createMentorshipCheckout(context.userId,emailOf(context.claims),data.market);});

import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
function emailOf(c:Record<string,unknown>){return typeof c.email==="string"?c.email:null;}
export const clientFreeHrFormation=createServerFn({method:"GET"}).middleware([requireSupabaseAuth]).handler(async({context})=>{const {getFreeHrFormation}=await import("@/lib/free-hr-formation.server");return getFreeHrFormation(context.userId,emailOf(context.claims));});
export const clientEnrollFreeHrFormation=createServerFn({method:"POST"}).middleware([requireSupabaseAuth]).handler(async({context})=>{const {enrollFreeHrFormation}=await import("@/lib/free-hr-formation.server");return enrollFreeHrFormation(context.userId,emailOf(context.claims));});

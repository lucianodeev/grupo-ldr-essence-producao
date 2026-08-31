import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
export const professionalPlanTools=createServerFn({method:"GET"}).middleware([requireSupabaseAuth]).handler(async({context})=>{const {getProfessionalPlanTools}=await import("@/lib/professional-plan-tools.server");return getProfessionalPlanTools(context.userId)});

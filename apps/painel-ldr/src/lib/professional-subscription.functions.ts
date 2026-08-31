import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
export const professionalMySubscription=createServerFn({method:"GET"}).middleware([requireSupabaseAuth]).handler(async({context})=>{const {getMyProfessionalSubscription}=await import("@/lib/professional-subscription.server");return getMyProfessionalSubscription(context.userId)});
export const professionalCancelSubscription=createServerFn({method:"POST"}).middleware([requireSupabaseAuth]).handler(async({context})=>{const {cancelMyProfessionalSubscription}=await import("@/lib/professional-subscription.server");return cancelMyProfessionalSubscription(context.userId)});

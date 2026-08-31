import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
export const professionalReviewAdminList=createServerFn({method:"GET"}).middleware([requireSupabaseAuth]).handler(async({context})=>{const {getReviewAdmin}=await import("@/lib/professional-review-admin.server");return getReviewAdmin(context.supabase,context.userId)});
export const professionalReviewModerate=createServerFn({method:"POST"}).middleware([requireSupabaseAuth]).inputValidator((data:{id:string;status:"published"|"rejected";note?:string})=>data).handler(async({context,data})=>{const {moderateReview}=await import("@/lib/professional-review-admin.server");return moderateReview(context.supabase,context.userId,data)});

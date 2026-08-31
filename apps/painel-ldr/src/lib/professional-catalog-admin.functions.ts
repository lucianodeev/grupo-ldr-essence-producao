import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
export const professionalCatalogAdmin=createServerFn({method:"GET"}).middleware([requireSupabaseAuth]).handler(async({context})=>{const {getPendingCatalogServices}=await import("@/lib/professional-catalog-admin.server");return getPendingCatalogServices(context.supabase,context.userId)});
export const professionalCatalogAdminReview=createServerFn({method:"POST"}).middleware([requireSupabaseAuth]).inputValidator((data:{serviceId:string;action:"approve"|"reject"})=>data).handler(async({context,data})=>{const {reviewCatalogService}=await import("@/lib/professional-catalog-admin.server");return reviewCatalogService(context.supabase,context.userId,data)});

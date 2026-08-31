import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const professionalCatalogServices=createServerFn({method:"GET"}).middleware([requireSupabaseAuth]).handler(async({context})=>{const {getCatalogServicesForProfessional}=await import("@/lib/professional-catalog-services.server");return getCatalogServicesForProfessional(context.userId)});
export const professionalCatalogServiceAdd=createServerFn({method:"POST"}).middleware([requireSupabaseAuth]).inputValidator((data:{catalogKey:string;durationMinutes:number;modality:"online"|"in_person"|"both";publicLocation?:string|null})=>data).handler(async({context,data})=>{const {addCatalogServiceForProfessional}=await import("@/lib/professional-catalog-services.server");return addCatalogServiceForProfessional(context.userId,data)});

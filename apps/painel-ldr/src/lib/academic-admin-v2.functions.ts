import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
const auth=[requireSupabaseAuth] as const;
export const academicAdminV2Snapshot=createServerFn({method:"GET"}).middleware(auth).handler(async({context})=>(await import("@/lib/academic-admin-v2.server")).academicAdminV2Snapshot(context.userId));
export const academicModerateV2=createServerFn({method:"POST"}).middleware(auth).inputValidator((data:{kind:"article"|"mediaPost";id:string;action:"hide"|"restore"})=>data).handler(async({context,data})=>(await import("@/lib/academic-admin-v2.server")).moderateAcademicV2(context.userId,data));

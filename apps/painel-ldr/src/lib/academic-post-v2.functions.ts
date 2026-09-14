import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
const auth=[requireSupabaseAuth] as const;
export const academicPostDetail=createServerFn({method:"GET"}).middleware(auth).inputValidator((data:{id:string})=>data).handler(async({context,data})=>(await import("@/lib/academic-post-v2.server")).academicPostDetail(context.userId,data.id));

import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
const auth=[requireSupabaseAuth] as const;
export const academicEditorialProfile=createServerFn({method:"GET"}).middleware(auth).inputValidator((data:{username:string})=>data).handler(async({context,data})=>(await import("@/lib/academic-editorial-v3-detail.server")).editorialProfile(context.userId,data.username));
export const academicEditorialArticle=createServerFn({method:"GET"}).middleware(auth).inputValidator((data:{slug:string})=>data).handler(async({data})=>(await import("@/lib/academic-editorial-v3-detail.server")).editorialArticle(data.slug));

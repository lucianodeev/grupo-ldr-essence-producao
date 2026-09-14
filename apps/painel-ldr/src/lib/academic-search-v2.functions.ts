import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
const auth=[requireSupabaseAuth] as const;
export const academicUnifiedSearch=createServerFn({method:"GET"}).middleware(auth).inputValidator((data:{q:string})=>data).handler(async({context,data})=>(await import("@/lib/academic-search-v2.server")).academicSearch(context.userId,data.q));

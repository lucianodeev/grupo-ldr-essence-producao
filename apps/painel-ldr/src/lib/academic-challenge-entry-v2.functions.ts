import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
const auth=[requireSupabaseAuth] as const;
export const academicChallengeEntryOptions=createServerFn({method:"GET"}).middleware(auth).inputValidator((data:{slug:string})=>data).handler(async({context,data})=>(await import("@/lib/academic-challenge-entry-v2.server")).challengeEntryOptions(context.userId,data.slug));

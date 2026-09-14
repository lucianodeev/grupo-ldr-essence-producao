import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
const auth=[requireSupabaseAuth] as const;
export const academicSavedContent=createServerFn({method:"GET"}).middleware(auth).handler(async({context})=>(await import("@/lib/academic-saved-v2.server")).savedAcademicContent(context.userId));

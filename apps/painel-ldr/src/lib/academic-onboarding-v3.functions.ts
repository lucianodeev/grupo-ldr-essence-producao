import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
const auth=[requireSupabaseAuth] as const;
export const academicOnboardingState=createServerFn({method:"GET"}).middleware(auth).handler(async({context})=>(await import("@/lib/academic-onboarding-v3.server")).academicOnboarding(context.userId));
export const academicSaveOnboarding=createServerFn({method:"POST"}).middleware(auth).inputValidator((data:{interests:string[]})=>data).handler(async({context,data})=>(await import("@/lib/academic-onboarding-v3.server")).saveAcademicOnboarding(context.userId,data.interests));

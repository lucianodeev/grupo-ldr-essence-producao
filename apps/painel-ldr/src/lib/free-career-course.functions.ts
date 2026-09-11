import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
function emailOf(claims:Record<string,unknown>):string|null{const value=claims["email"];return typeof value==="string"?value:null;}
export const clientFreeCareerCourse=createServerFn({method:"GET"}).middleware([requireSupabaseAuth]).handler(async({context})=>{const {getFreeCareerCourse}=await import("@/lib/free-career-course.server");return getFreeCareerCourse(context.userId,emailOf(context.claims));});
export const clientEnrollFreeCareerCourse=createServerFn({method:"POST"}).middleware([requireSupabaseAuth]).handler(async({context})=>{const {enrollFreeCareerCourse}=await import("@/lib/free-career-course.server");return enrollFreeCareerCourse(context.userId,emailOf(context.claims));});

import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const auth=[requireSupabaseAuth] as const;
export const academicSocialProfile=createServerFn({method:"GET"}).middleware(auth).inputValidator((data:{username:string})=>data).handler(async({context,data})=>(await import("@/lib/academic-social-v2.server")).socialProfileByUsername(context.userId,data.username));
export const academicUpdateSocialProfile=createServerFn({method:"POST"}).middleware(auth).inputValidator((data:{username?:string;bio?:string;profession?:string;country?:string;city?:string;interests?:string[];courses?:string[];showName?:boolean;showLocation?:boolean})=>data).handler(async({context,data})=>(await import("@/lib/academic-social-v2.server")).updateSocialProfile(context.userId,data));
export const academicToggleFollow=createServerFn({method:"POST"}).middleware(auth).inputValidator((data:{targetProfileId:string})=>data).handler(async({context,data})=>(await import("@/lib/academic-social-v2.server")).toggleFollow(context.userId,data.targetProfileId));
export const academicNotifications=createServerFn({method:"GET"}).middleware(auth).handler(async({context})=>(await import("@/lib/academic-social-v2.server")).notificationsFor(context.userId));
export const academicMarkNotificationRead=createServerFn({method:"POST"}).middleware(auth).inputValidator((data:{id:string})=>data).handler(async({context,data})=>(await import("@/lib/academic-notifications-v2.server")).markAcademicNotificationRead(context.userId,data.id));

import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
const auth=[requireSupabaseAuth] as const;
type Purpose="avatars"|"posts"|"articles";
export const academicPrepareImageUpload=createServerFn({method:"POST"}).middleware(auth).inputValidator((data:{fileName:string;contentType:string;size:number;purpose:Purpose})=>data).handler(async({context,data})=>(await import("@/lib/academic-media-v2.server")).prepareAcademicImageUpload(context.userId,data));
export const academicFinalizeAvatar=createServerFn({method:"POST"}).middleware(auth).inputValidator((data:{path:string})=>data).handler(async({context,data})=>(await import("@/lib/academic-media-v2.server")).finalizeAcademicAvatar(context.userId,data.path));
export const academicFinalizePostMedia=createServerFn({method:"POST"}).middleware(auth).inputValidator((data:{postId:string;path:string;altText?:string;fileName?:string})=>data).handler(async({context,data})=>(await import("@/lib/academic-media-v2.server")).finalizeAcademicPostMedia(context.userId,data));
export const academicFinalizePostImage=academicFinalizePostMedia;

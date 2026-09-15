import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
const auth=[requireSupabaseAuth] as const;

export const academicEditorialSnapshot=createServerFn({method:"GET"}).middleware(auth).inputValidator((data?:{limit?:number;country?:string|null;followingOnly?:boolean;savedOnly?:boolean})=>data??{}).handler(async({context,data})=>(await import("@/lib/academic-editorial-v3.server")).editorialSnapshot(context.userId,data));
export const academicToggleEditorialSupport=createServerFn({method:"POST"}).middleware(auth).inputValidator((data:{postId:string})=>data).handler(async({context,data})=>(await import("@/lib/academic-editorial-v3.server")).toggleEditorialSupport(context.userId,data.postId));
export const academicToggleEditorialSave=createServerFn({method:"POST"}).middleware(auth).inputValidator((data:{postId:string})=>data).handler(async({context,data})=>(await import("@/lib/academic-editorial-v3.server")).toggleEditorialSave(context.userId,data.postId));
export const academicToggleEditorialFollow=createServerFn({method:"POST"}).middleware(auth).inputValidator((data:{profileId:string})=>data).handler(async({context,data})=>(await import("@/lib/academic-editorial-v3.server")).toggleEditorialFollow(context.userId,data.profileId));
export const academicAddEditorialComment=createServerFn({method:"POST"}).middleware(auth).inputValidator((data:{postId:string;body:string})=>data).handler(async({context,data})=>(await import("@/lib/academic-editorial-v3.server")).addEditorialUserComment(context.userId,data.postId,data.body));
export const academicEditorialAdminSnapshot=createServerFn({method:"GET"}).middleware(auth).handler(async({context})=>(await import("@/lib/academic-editorial-v3.server")).editorialAdminSnapshot(context.userId));
export const academicUpdateEditorialSettings=createServerFn({method:"POST"}).middleware(auth).inputValidator((data:{mode:"automatic"|"manual";manualMaxPercent:number})=>data).handler(async({context,data})=>(await import("@/lib/academic-editorial-v3.server")).updateEditorialSettings(context.userId,data));

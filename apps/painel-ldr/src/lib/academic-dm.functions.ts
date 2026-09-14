import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
const auth=[requireSupabaseAuth] as const;
export const academicDmList=createServerFn({method:"GET"}).middleware(auth).handler(async({context})=>(await import("@/lib/academic-dm.server")).academicConversationList(context.userId));
export const academicDmMessages=createServerFn({method:"GET"}).middleware(auth).inputValidator((data:{conversationId:string})=>data).handler(async({context,data})=>(await import("@/lib/academic-dm.server")).academicConversationMessages(context.userId,data.conversationId));
export const academicDmOpen=createServerFn({method:"POST"}).middleware(auth).inputValidator((data:{targetProfileId:string})=>data).handler(async({context,data})=>(await import("@/lib/academic-dm.server")).openAcademicConversation(context.userId,data.targetProfileId));
export const academicDmSend=createServerFn({method:"POST"}).middleware(auth).inputValidator((data:{conversationId:string;body?:string;sharedPostId?:string|null})=>data).handler(async({context,data})=>(await import("@/lib/academic-dm.server")).sendAcademicMessage(context.userId,data));
export const academicDmSendPost=createServerFn({method:"POST"}).middleware(auth).inputValidator((data:{postId:string;targetProfileId:string})=>data).handler(async({context,data})=>(await import("@/lib/academic-dm.server")).sendAcademicPostToProfile(context.userId,data));

import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

function emailOf(claims:Record<string,unknown>):string|null{const v=claims["email"];return typeof v==="string"?v:null}

export const clientTrainingForum=createServerFn({method:"GET"}).middleware([requireSupabaseAuth]).inputValidator((data:{slug:string})=>data).handler(async({context,data})=>{
  const {getClientTrainingForum}=await import("@/lib/training-forum.server");
  return getClientTrainingForum(context.userId,emailOf(context.claims),data.slug);
});

export const clientCreateForumTopic=createServerFn({method:"POST"}).middleware([requireSupabaseAuth]).inputValidator((data:{slug:string;title:string;body:string})=>data).handler(async({context,data})=>{
  const {createClientForumTopic}=await import("@/lib/training-forum.server");
  return createClientForumTopic(context.userId,emailOf(context.claims),data);
});

export const clientCreateForumReply=createServerFn({method:"POST"}).middleware([requireSupabaseAuth]).inputValidator((data:{slug:string;topicId:string;body:string})=>data).handler(async({context,data})=>{
  const {createClientForumReply}=await import("@/lib/training-forum.server");
  return createClientForumReply(context.userId,emailOf(context.claims),data);
});

export const adminTrainingForum=createServerFn({method:"GET"}).middleware([requireSupabaseAuth]).inputValidator((data:{slug:string})=>data).handler(async({context,data})=>{
  const {getAdminTrainingForum}=await import("@/lib/training-forum.server");
  return getAdminTrainingForum(context.userId,data.slug);
});

export const adminForumReply=createServerFn({method:"POST"}).middleware([requireSupabaseAuth]).inputValidator((data:{topicId:string;body:string})=>data).handler(async({context,data})=>{
  const {adminReplyForumTopic}=await import("@/lib/training-forum.server");
  return adminReplyForumTopic(context.userId,data);
});

export const adminForumModerateTopic=createServerFn({method:"POST"}).middleware([requireSupabaseAuth]).inputValidator((data:{topicId:string;status:"open"|"closed"|"hidden";pinned:boolean})=>data).handler(async({context,data})=>{
  const {adminModerateForumTopic}=await import("@/lib/training-forum.server");
  return adminModerateForumTopic(context.userId,data);
});

export const adminForumModeratePost=createServerFn({method:"POST"}).middleware([requireSupabaseAuth]).inputValidator((data:{postId:string;status:"visible"|"hidden"})=>data).handler(async({context,data})=>{
  const {adminModerateForumPost}=await import("@/lib/training-forum.server");
  return adminModerateForumPost(context.userId,data);
});

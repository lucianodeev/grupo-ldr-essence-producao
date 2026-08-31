import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const enhancedPublicProfessional=createServerFn({method:"GET"}).inputValidator((data:{slug:string})=>data).handler(async({data})=>{const {getEnhancedPublicProfessional}=await import("@/lib/professional-social.server");return getEnhancedPublicProfessional(data.slug)});

export const professionalSaveMediaIdentity=createServerFn({method:"POST"}).middleware([requireSupabaseAuth]).inputValidator((data:{photoUrl?:string|null;introVideoUrl?:string|null;profileHeadline?:string|null;lgbtqSelfIdentified?:boolean|null;showLgbtqBadge?:boolean})=>data).handler(async({context,data})=>{const {saveProfessionalMediaAndIdentity}=await import("@/lib/professional-social.server");return saveProfessionalMediaAndIdentity(context.userId,data)});

export const professionalConversationList=createServerFn({method:"GET"}).middleware([requireSupabaseAuth]).handler(async({context})=>{const {listProfessionalConversations}=await import("@/lib/professional-social.server");return listProfessionalConversations(context.userId)});

export const professionalMessageThread=createServerFn({method:"GET"}).middleware([requireSupabaseAuth]).inputValidator((data:{profileSlug?:string;conversationId?:string})=>data).handler(async({context,data})=>{const {getProfessionalMessages}=await import("@/lib/professional-social.server");return getProfessionalMessages(context.userId,data)});

export const professionalMessageSend=createServerFn({method:"POST"}).middleware([requireSupabaseAuth]).inputValidator((data:{profileSlug?:string;conversationId?:string;body:string})=>data).handler(async({context,data})=>{const {sendProfessionalMessage}=await import("@/lib/professional-social.server");return sendProfessionalMessage(context.userId,data)});

export const professionalReviewCreate=createServerFn({method:"POST"}).middleware([requireSupabaseAuth]).inputValidator((data:{profileSlug:string;rating:number;body:string})=>data).handler(async({context,data})=>{const {createVerifiedProfessionalReview}=await import("@/lib/professional-social.server");return createVerifiedProfessionalReview(context.userId,data)});

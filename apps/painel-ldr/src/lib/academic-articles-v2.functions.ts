import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
const auth=[requireSupabaseAuth] as const;
export const academicCreateArticle=createServerFn({method:"POST"}).middleware(auth).inputValidator((data:{title:string;summary?:string;body:string;category?:string;communityId?:string|null;keywords?:string[];references?:string;locationLabel?:string;locationCity?:string;locationCountry?:string})=>data).handler(async({context,data})=>(await import("@/lib/academic-articles-v2.server")).createArticle(context.userId,data));
export const academicArticleBySlug=createServerFn({method:"GET"}).middleware(auth).inputValidator((data:{slug:string})=>data).handler(async({context,data})=>(await import("@/lib/academic-articles-v2.server")).articleBySlug(context.userId,data.slug));
export const academicToggleArticleSupport=createServerFn({method:"POST"}).middleware(auth).inputValidator((data:{articleId:string})=>data).handler(async({context,data})=>(await import("@/lib/academic-articles-v2.server")).toggleSupport(context.userId,data.articleId));
export const academicToggleArticleSave=createServerFn({method:"POST"}).middleware(auth).inputValidator((data:{articleId:string})=>data).handler(async({context,data})=>(await import("@/lib/academic-articles-v2.server")).toggleSave(context.userId,data.articleId));

import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { LegacyProjectSlug } from "@/lib/legacy-training-projects.server";

function emailOf(claims:Record<string,unknown>):string|null{const value=claims["email"];return typeof value==="string"?value:null;}

export const clientLegacyTrainingProject=createServerFn({method:"GET"})
  .middleware([requireSupabaseAuth])
  .inputValidator((data:{slug:LegacyProjectSlug})=>data)
  .handler(async({context,data})=>{
    const {getLegacyTrainingProjectContext}=await import("@/lib/legacy-training-projects.server");
    return getLegacyTrainingProjectContext(context.userId,emailOf(context.claims),data.slug);
  });

export const clientSubmitLegacyTrainingProject=createServerFn({method:"POST"})
  .middleware([requireSupabaseAuth])
  .inputValidator((data:{slug:LegacyProjectSlug;title:string;projectText?:string|null;projectUrl?:string|null})=>data)
  .handler(async({context,data})=>{
    const {submitLegacyTrainingProject}=await import("@/lib/legacy-training-projects.server");
    return submitLegacyTrainingProject(context.userId,emailOf(context.claims),data);
  });

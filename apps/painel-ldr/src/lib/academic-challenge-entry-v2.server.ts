import { supabaseAdmin } from "@/integrations/supabase/client.server";
const db=supabaseAdmin as any;
function fail(m:string):never{throw new Error(m)}
export async function challengeEntryOptions(userId:string,slug:string){
  const {data:challenge}=await db.from("academic_challenges").select("id,slug,title,theme,description,rules,starts_at,ends_at,status,category,eligible_roles,community_weight,jury_weight").eq("slug",slug).in("status",["published","closed"]).maybeSingle();if(!challenge)fail("Desafio não encontrado.");
  const [{data:posts},{data:articles},{data:existing}]=await Promise.all([
    db.from("academic_posts").select("id,body,post_type,created_at").eq("user_id",userId).eq("status","active").in("post_type",["reflection","study","debate","question","recommendation"]).order("created_at",{ascending:false}).limit(50),
    db.from("academic_articles").select("id,slug,title,summary,created_at").eq("user_id",userId).eq("status","active").order("created_at",{ascending:false}).limit(50),
    db.from("academic_challenge_entries").select("id,entry_type,post_id,article_id,status,badge,final_score").eq("challenge_id",challenge.id).eq("user_id",userId).order("created_at",{ascending:false})
  ]);
  return {challenge,posts:posts??[],articles:articles??[],entries:existing??[]};
}

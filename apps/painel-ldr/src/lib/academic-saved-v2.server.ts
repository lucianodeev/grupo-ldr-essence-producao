import { supabaseAdmin } from "@/integrations/supabase/client.server";
const db=supabaseAdmin as any;
export async function savedAcademicContent(userId:string){
 const [{data:postSaves},{data:articleSaves}]=await Promise.all([db.from("academic_saved_posts").select("post_id,created_at").eq("user_id",userId).order("created_at",{ascending:false}).limit(100),db.from("academic_saved_articles").select("article_id,created_at").eq("user_id",userId).order("created_at",{ascending:false}).limit(100)]);
 const postIds=(postSaves??[]).map((x:any)=>x.post_id),articleIds=(articleSaves??[]).map((x:any)=>x.article_id);
 const [{data:posts},{data:articles}]=await Promise.all([postIds.length?db.from("academic_posts").select("id,body,post_type,anonymous,created_at,status").in("id",postIds).eq("status","active"):{data:[]},articleIds.length?db.from("academic_articles").select("id,slug,title,summary,category,created_at,status").in("id",articleIds).eq("status","active"):{data:[]}]);
 const postMap=new Map((posts??[]).map((x:any)=>[x.id,x])),articleMap=new Map((articles??[]).map((x:any)=>[x.id,x]));
 return {posts:(postSaves??[]).map((s:any)=>postMap.get(s.post_id)).filter(Boolean),articles:(articleSaves??[]).map((s:any)=>articleMap.get(s.article_id)).filter(Boolean)};
}

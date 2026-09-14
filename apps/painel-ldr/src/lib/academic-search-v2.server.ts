import { supabaseAdmin } from "@/integrations/supabase/client.server";
const db=supabaseAdmin as any;
function clean(v:unknown,n:number){return String(v??"").trim().slice(0,n).replace(/[%(),]/g," ")}
export async function academicSearch(userId:string,raw:string){
 const q=clean(raw,80);if(q.length<2)return {query:q,posts:[],articles:[],profiles:[],communities:[],topics:[]};const term=`%${q}%`;
 const [{data:posts},{data:articles},{data:profiles},{data:communities},{data:topics}]=await Promise.all([
  db.from("academic_posts").select("id,body,post_type,anonymous,created_at").eq("status","active").ilike("body",term).order("created_at",{ascending:false}).limit(20),
  db.from("academic_articles").select("id,slug,title,summary,category,created_at").eq("status","active").or(`title.ilike.${term},summary.ilike.${term},category.ilike.${term}`).order("created_at",{ascending:false}).limit(20),
  db.from("academic_profiles").select("id,user_id,username,bio,profession,country,city,display_role,show_location").not("username","is",null).or(`username.ilike.${term},bio.ilike.${term},profession.ilike.${term}`).limit(20),
  db.from("academic_communities").select("id,slug,name,description").eq("active",true).or(`name.ilike.${term},description.ilike.${term}`).limit(20),
  db.from("academic_topics").select("id,slug,label").or(`slug.ilike.${term},label.ilike.${term}`).limit(20)
 ]);
 const safeProfiles=(profiles??[]).map((p:any)=>({id:p.id,username:p.username,bio:p.bio,profession:p.profession,role:p.display_role,country:p.show_location?p.country:"",city:p.show_location?p.city:""}));
 return {query:q,posts:(posts??[]).map((p:any)=>({id:p.id,body:p.body,post_type:p.post_type,created_at:p.created_at,authorLabel:p.anonymous?"Membro anônimo":null})),articles:articles??[],profiles:safeProfiles,communities:communities??[],topics:topics??[]};
}

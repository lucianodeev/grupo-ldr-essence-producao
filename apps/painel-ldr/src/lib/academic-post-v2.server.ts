import { supabaseAdmin } from "@/integrations/supabase/client.server";
const db=supabaseAdmin as any;
function fail(m:string):never{throw new Error(m)}
async function author(uid:string,anonymous:boolean){if(anonymous)return {profileId:null,username:null,avatarUrl:null,name:"Membro anônimo",role:"member",profession:"",anonymous:true};const [{data:b},{data:a}]=await Promise.all([db.from("profiles").select("full_name").eq("id",uid).maybeSingle(),db.from("academic_profiles").select("id,username,avatar_path,display_role,profession,show_name").eq("user_id",uid).maybeSingle()]);let avatarUrl=null;if(a?.avatar_path){const {data}=await db.storage.from("academic-network").createSignedUrl(a.avatar_path,3600);avatarUrl=data?.signedUrl??null}return {profileId:a?.id??null,username:a?.username??null,avatarUrl,name:a?.show_name===false?"Membro LDR":b?.full_name||"Membro LDR",role:a?.display_role??"member",profession:a?.profession??"",anonymous:false}}
async function signed(paths:string[]){const u=[...new Set(paths.filter(Boolean))];if(!u.length)return new Map<string,string>();const {data}=await db.storage.from("academic-network").createSignedUrls(u,3600);return new Map((data??[]).map((x:any,i:number)=>[u[i],x.signedUrl]).filter((x:any)=>x[1]))}
export async function academicPostDetail(userId:string,id:string){
 const {data:p}=await db.from("academic_posts").select("id,user_id,community_id,body,post_type,anonymous,status,is_pinned,location_label,location_city,location_country,created_at,updated_at").eq("id",id).eq("status","active").maybeSingle();if(!p)fail("Publicação não encontrada.");
 const [{data:comments},{data:media},{data:links},{count:supportCount},{data:mine},{data:saved},{data:community}]=await Promise.all([
  db.from("academic_comments").select("id,user_id,body,anonymous,created_at,updated_at").eq("post_id",id).eq("status","active").order("created_at"),
  db.from("academic_post_media").select("id,storage_path,alt_text,mime_type,sort_order").eq("post_id",id).order("sort_order"),
  db.from("academic_post_topics").select("topic_id").eq("post_id",id),
  db.from("academic_reactions").select("post_id",{count:"exact",head:true}).eq("post_id",id).eq("reaction_type","support"),
  db.from("academic_reactions").select("post_id").eq("post_id",id).eq("user_id",userId).eq("reaction_type","support").maybeSingle(),
  db.from("academic_saved_posts").select("post_id").eq("post_id",id).eq("user_id",userId).maybeSingle(),
  p.community_id?db.from("academic_communities").select("id,name,slug").eq("id",p.community_id).maybeSingle():Promise.resolve({data:null})
 ]);
 const topicIds=(links??[]).map((x:any)=>x.topic_id);const {data:topics}=topicIds.length?await db.from("academic_topics").select("id,slug,label").in("id",topicIds):{data:[]};const urls=await signed((media??[]).map((x:any)=>x.storage_path));
 const safeComments=[];for(const c of comments??[])safeComments.push({id:c.id,body:c.body,created_at:c.created_at,updated_at:c.updated_at,own:c.user_id===userId,author:await author(c.user_id,c.anonymous)});
 return {id:p.id,body:p.body,post_type:p.post_type,is_pinned:p.is_pinned,location_label:p.location_label,location_city:p.location_city,location_country:p.location_country,created_at:p.created_at,updated_at:p.updated_at,own:p.user_id===userId,author:await author(p.user_id,p.anonymous),community:community??null,comments:safeComments,media:(media??[]).map((m:any)=>({id:m.id,url:urls.get(m.storage_path)??null,altText:m.alt_text,mimeType:m.mime_type})),topics:topics??[],supportCount:supportCount??0,supported:Boolean(mine),saved:Boolean(saved)};
}

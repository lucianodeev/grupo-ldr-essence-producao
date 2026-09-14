import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { resolveAccess } from "@/lib/access.server";

const db=supabaseAdmin as any;
function fail(message:string):never{throw new Error(message)}
async function requireAdmin(userId:string){const a=await resolveAccess(db,userId);if(!(a.authorized&&a.role==="superadmin"))fail("Acesso negado.")}

export async function academicAdminV2Snapshot(userId:string){
  await requireAdmin(userId);
  const [{data:articles},{data:media},{data:reports},{data:profiles}]=await Promise.all([
    db.from("academic_articles").select("id,user_id,slug,title,summary,category,status,is_pinned,created_at,updated_at").order("created_at",{ascending:false}).limit(150),
    db.from("academic_post_media").select("id,post_id,owner_user_id,storage_path,alt_text,mime_type,created_at").order("created_at",{ascending:false}).limit(150),
    db.from("academic_reports").select("id,post_id,comment_id,article_id,reason,details,status,created_at").order("created_at",{ascending:false}).limit(200),
    db.from("academic_profiles").select("id,user_id,username,profession,display_role,profile_visibility,avatar_path,created_at").order("created_at",{ascending:false}).limit(250)
  ]);
  const userIds=[...new Set([...(articles??[]).map((x:any)=>x.user_id),...(profiles??[]).map((x:any)=>x.user_id)])];
  const {data:base}=userIds.length?await db.from("profiles").select("id,full_name").in("id",userIds):{data:[]};
  const names=new Map((base??[]).map((x:any)=>[x.id,x.full_name]));
  const postIds=[...new Set((media??[]).map((x:any)=>x.post_id))];
  const {data:posts}=postIds.length?await db.from("academic_posts").select("id,status,post_type,anonymous,body").in("id",postIds):{data:[]};
  const postMap=new Map((posts??[]).map((x:any)=>[x.id,x]));
  return {
    articles:(articles??[]).map((x:any)=>({...x,user_id:undefined,authorName:names.get(x.user_id)||"Membro LDR"})),
    media:(media??[]).map((x:any)=>({...x,owner_user_id:undefined,post:postMap.get(x.post_id)??null})),
    reports:reports??[],
    profiles:(profiles??[]).map((x:any)=>({...x,user_id:undefined,name:names.get(x.user_id)||"Membro LDR"}))
  };
}

export async function moderateAcademicV2(userId:string,input:{kind:"article"|"mediaPost";id:string;action:"hide"|"restore"}){
  await requireAdmin(userId);
  if(!["hide","restore"].includes(input.action))fail("Ação inválida.");
  const status=input.action==="hide"?"hidden":"active";
  if(input.kind==="article"){
    const {data,error}=await db.from("academic_articles").update({status,updated_at:new Date().toISOString()}).eq("id",input.id).select("id").maybeSingle();
    if(error||!data)fail("Artigo não encontrado.");
  }else{
    const {data:media}=await db.from("academic_post_media").select("post_id").eq("id",input.id).maybeSingle();
    if(!media?.post_id)fail("Imagem não encontrada.");
    const {data,error}=await db.from("academic_posts").update({status,updated_at:new Date().toISOString()}).eq("id",media.post_id).select("id").maybeSingle();
    if(error||!data)fail("Publicação da imagem não encontrada.");
  }
  return {ok:true};
}

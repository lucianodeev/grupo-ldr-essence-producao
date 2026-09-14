import { supabaseAdmin } from "@/integrations/supabase/client.server";
const db=supabaseAdmin as any;
function clean(v:unknown,max:number){return String(v??"").trim().slice(0,max)}
function fail(m:string):never{throw new Error(m)}

export async function editorialProfile(userId:string,usernameRaw:string){
  const username=clean(usernameRaw,40).toLowerCase();
  const {data:p}=await db.from("academic_editorial_profiles").select("id,username,display_name,avatar_url,country,city,language,profession,specialty,bio,interests,active").eq("username",username).eq("active",true).maybeSingle();if(!p)fail("Perfil editorial não encontrado.");
  const [{data:posts},{data:articles},{data:follow},{count:followers}]=await Promise.all([
    db.from("academic_editorial_posts").select("id,body,post_type,language,location_label,topics,media_url,media_alt,published_at").eq("profile_id",p.id).eq("status","active").order("published_at",{ascending:false}).limit(40),
    db.from("academic_editorial_articles").select("id,title,slug,summary,language,keywords,published_at").eq("profile_id",p.id).eq("status","active").order("published_at",{ascending:false}).limit(40),
    db.from("academic_editorial_follows").select("editorial_profile_id").eq("editorial_profile_id",p.id).eq("user_id",userId).maybeSingle(),
    db.from("academic_editorial_follows").select("user_id",{count:"exact",head:true}).eq("editorial_profile_id",p.id)
  ]);
  return {profile:{...p,editorial:true,followed:Boolean(follow),followers:followers??0,following:0,postCount:(posts??[]).length,articleCount:(articles??[]).length},posts:posts??[],articles:articles??[]};
}

export async function editorialArticle(slugRaw:string){
  const slug=clean(slugRaw,120).toLowerCase();const {data:a}=await db.from("academic_editorial_articles").select("id,profile_id,title,slug,summary,body,language,keywords,published_at").eq("slug",slug).eq("status","active").maybeSingle();if(!a)fail("Artigo editorial não encontrado.");const {data:p}=await db.from("academic_editorial_profiles").select("id,username,display_name,country,city,language,profession,specialty,bio,active").eq("id",a.profile_id).eq("active",true).maybeSingle();if(!p)fail("Autor editorial indisponível.");return {...a,editorial:true,profile:p};
}

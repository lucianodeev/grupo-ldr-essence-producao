import { supabaseAdmin } from "@/integrations/supabase/client.server";

const db=supabaseAdmin as any;
function fail(message:string):never{throw new Error(message)}
function clean(v:unknown,max:number){return String(v??"").trim().slice(0,max)}
function usernameOf(v:string){return v.toLowerCase().replace(/^@/,"").replace(/[^a-z0-9._]/g,"").replace(/^[._]+|[._]+$/g,"").slice(0,30)}
async function customerId(userId:string){const {data}=await db.from("customers").select("id").eq("auth_user_id",userId).maybeSingle();return data?.id??null}
async function queue(targetUserId:string,actor:string,subject:string,body:string,metadata:Record<string,unknown>={}){if(!targetUserId||targetUserId===actor)return;const target=await customerId(targetUserId);if(!target)return;await db.from("notification_outbox").insert({audience_type:"client",target_id:target,channel:"in_app",event_type:"manual",subject,body,metadata:{source:"academic_network",...metadata},created_by:actor,status:"pending"})}
async function baseName(userId:string){const {data}=await db.from("profiles").select("full_name").eq("id",userId).maybeSingle();return data?.full_name||"Membro LDR"}

export async function updateSocialProfile(userId:string,input:{username?:string;bio?:string;profession?:string;country?:string;city?:string;interests?:string[];courses?:string[];showName?:boolean;showLocation?:boolean}){
  const username=usernameOf(clean(input.username,30));if(username&&username.length<3)fail("O @username precisa ter ao menos 3 caracteres.");
  if(username){const {data:used}=await db.from("academic_profiles").select("user_id").ilike("username",username).neq("user_id",userId).maybeSingle();if(used)fail("Este @username já está em uso.")}
  const patch:any={bio:clean(input.bio,1200),profession:clean(input.profession,120),country:clean(input.country,80),city:clean(input.city,80),interests:(input.interests??[]).map(x=>clean(x,80)).filter(Boolean).slice(0,12),courses:(input.courses??[]).map(x=>clean(x,120)).filter(Boolean).slice(0,20),show_name:Boolean(input.showName),show_location:Boolean(input.showLocation),updated_at:new Date().toISOString()};
  if(username)patch.username=username;
  const {data,error}=await db.from("academic_profiles").update(patch).eq("user_id",userId).select("id,username").maybeSingle();if(error||!data)fail("Não foi possível atualizar o perfil.");return data;
}

export async function toggleFollow(userId:string,targetProfileId:string){
  const {data:target}=await db.from("academic_profiles").select("user_id,profile_visibility").eq("id",targetProfileId).maybeSingle();if(!target?.user_id||target.user_id===userId)fail("Perfil inválido.");
  const {data:existing}=await db.from("academic_follows").select("status").eq("follower_user_id",userId).eq("followed_user_id",target.user_id).maybeSingle();
  if(existing){await db.from("academic_follows").delete().eq("follower_user_id",userId).eq("followed_user_id",target.user_id);return {following:false,status:null}}
  const status=target.profile_visibility==="private"?"pending":"accepted";const {error}=await db.from("academic_follows").insert({follower_user_id:userId,followed_user_id:target.user_id,status});if(error)fail("Não foi possível seguir este perfil.");
  if(status==="accepted")await queue(target.user_id,userId,"Novo seguidor","Uma pessoa começou a seguir seu perfil acadêmico.",{kind:"follow",profileId:targetProfileId});
  return {following:status==="accepted",status};
}

export async function socialProfileByUsername(viewerUserId:string,rawUsername:string){
  const username=usernameOf(rawUsername);if(!username)fail("Perfil não encontrado.");
  const {data:p}=await db.from("academic_profiles").select("id,user_id,username,bio,profession,country,city,interests,courses,display_role,show_name,show_location,profile_visibility").ilike("username",username).maybeSingle();if(!p)fail("Perfil não encontrado.");
  const own=p.user_id===viewerUserId;
  const [{count:followers},{count:following},{count:postCount},{count:articleCount},{data:followRow},{data:posts},{data:articles}]=await Promise.all([
    db.from("academic_follows").select("followed_user_id",{count:"exact",head:true}).eq("followed_user_id",p.user_id).eq("status","accepted"),
    db.from("academic_follows").select("follower_user_id",{count:"exact",head:true}).eq("follower_user_id",p.user_id).eq("status","accepted"),
    db.from("academic_posts").select("id",{count:"exact",head:true}).eq("user_id",p.user_id).eq("status","active"),
    db.from("academic_articles").select("id",{count:"exact",head:true}).eq("user_id",p.user_id).eq("status","active"),
    db.from("academic_follows").select("status").eq("follower_user_id",viewerUserId).eq("followed_user_id",p.user_id).maybeSingle(),
    db.from("academic_posts").select("id,body,post_type,created_at,location_label,share_slug").eq("user_id",p.user_id).eq("status","active").eq("anonymous",false).order("created_at",{ascending:false}).limit(24),
    db.from("academic_articles").select("id,slug,title,summary,category,created_at").eq("user_id",p.user_id).eq("status","active").order("created_at",{ascending:false}).limit(24)
  ]);
  return {profile:{id:p.id,username:p.username,name:p.show_name===false?"Membro LDR":await baseName(p.user_id),bio:p.bio,profession:p.profession,role:p.display_role,country:p.show_location?p.country:"",city:p.show_location?p.city:"",interests:p.interests??[],courses:p.courses??[],own,followed:followRow?.status==="accepted",followStatus:followRow?.status??null,followers:followers??0,following:following??0,postCount:postCount??0,articleCount:articleCount??0},posts:posts??[],articles:articles??[]};
}

export async function notificationsFor(userId:string){const cid=await customerId(userId);if(!cid)return [];const {data}=await db.from("notification_outbox").select("id,subject,body,status,metadata,created_at").eq("audience_type","client").eq("target_id",cid).eq("channel","in_app").order("created_at",{ascending:false}).limit(100);return data??[]}

import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { resolveAccess } from "@/lib/access.server";

const db=supabaseAdmin as any;
function clean(v:unknown,max:number){return String(v??"").trim().slice(0,max)}
function fail(m:string):never{throw new Error(m)}
async function requireAdmin(userId:string){const a=await resolveAccess(db,userId);if(!(a.authorized&&a.role==="superadmin"))fail("Acesso administrativo necessário.")}

export async function editorialSnapshot(userId:string,input?:{limit?:number;country?:string|null;followingOnly?:boolean;savedOnly?:boolean}){
  try{
    const limit=Math.min(30,Math.max(3,Number(input?.limit??12)));
    const since24=new Date(Date.now()-86400000).toISOString(),since7=new Date(Date.now()-7*86400000).toISOString();
    const [{data:settings},{count:real24},{data:real7Rows},{data:follows},{data:saved},{data:reacted}]=await Promise.all([
      db.from("academic_editorial_settings").select("*").eq("id",true).maybeSingle(),
      db.from("academic_posts").select("id",{count:"exact",head:true}).eq("status","active").gte("created_at",since24),
      db.from("academic_posts").select("id,user_id").eq("status","active").gte("created_at",since7).limit(2000),
      db.from("academic_editorial_follows").select("editorial_profile_id").eq("user_id",userId),
      db.from("academic_saved_editorial_posts").select("post_id").eq("user_id",userId).order("created_at",{ascending:false}),
      db.from("academic_editorial_reactions").select("post_id").eq("user_id",userId).eq("reaction_type","support")
    ]);
    const real7=(real7Rows??[]).length;const activeUsers=new Set((real7Rows??[]).map((x:any)=>x.user_id)).size;
    const automatic=real7<20?(settings?.low_activity_percent??35):real7<120?(settings?.medium_activity_percent??20):(settings?.high_activity_percent??8);
    const editorialPercent=settings?.mode==="manual"?Math.min(Number(settings?.manual_max_percent??30),automatic||40):automatic;
    const followedIds=new Set<string>((follows??[]).map((x:any)=>String(x.editorial_profile_id??"")).filter(Boolean));
    let pq=db.from("academic_editorial_profiles").select("id,username,display_name,avatar_url,country,city,language,profession,specialty,bio,interests,active").eq("active",true);
    if(input?.country&&!input?.savedOnly)pq=pq.eq("country",clean(input.country,50));
    const {data:profiles}=await pq.order("display_name").limit(100);
    const profileMap=new Map((profiles??[]).map((p:any)=>[p.id,p]));
    let q=db.from("academic_editorial_posts").select("id,profile_id,body,post_type,language,location_label,topics,media_url,media_alt,published_at").eq("status","active").order("published_at",{ascending:false}).limit(100);
    if(!input?.savedOnly&&input?.followingOnly&&followedIds.size)q=q.in("profile_id",[...followedIds]);
    else if(!input?.savedOnly&&input?.followingOnly&&!followedIds.size)return {posts:[],profiles:profiles??[],articles:[],suggestions:(profiles??[]).slice(0,6),stats:{editorialPercent,real24:real24??0,real7,activeUsers},settings,followedIds:[...followedIds]};
    if(!input?.savedOnly&&input?.country&&profiles?.length)q=q.in("profile_id",profiles.map((p:any)=>p.id));
    if(input?.savedOnly)q=q.in("id",(saved??[]).slice(0,limit).map((s:any)=>s.post_id).concat("00000000-0000-0000-0000-000000000000"));
    const {data:rawPosts}=await q;
    const target=input?.savedOnly?limit:Math.min(limit,Math.max(2,Math.ceil(limit*editorialPercent/100)));
    const picked:any[]=[];let last:string|null=null;for(const p of rawPosts??[]){if(!profileMap.has(p.profile_id)||(!input?.savedOnly&&p.profile_id===last))continue;picked.push(p);last=p.profile_id;if(picked.length>=target)break;}
    const ids=picked.map((p:any)=>p.id);
    const [{data:editorComments},{data:userComments},{data:reactionRows},{data:articles}]=await Promise.all([
      ids.length?db.from("academic_editorial_comments").select("id,post_id,profile_id,body,language,published_at").in("post_id",ids).eq("status","active").order("published_at"):{data:[]},
      ids.length?db.from("academic_editorial_user_comments").select("id,post_id,user_id,body,created_at").in("post_id",ids).eq("status","active").order("created_at"):{data:[]},
      ids.length?db.from("academic_editorial_reactions").select("post_id").in("post_id",ids).eq("reaction_type","support"):{data:[]},
      db.from("academic_editorial_articles").select("id,profile_id,title,slug,summary,language,keywords,published_at").eq("status","active").order("published_at",{ascending:false}).limit(8)
    ]);
    const realCommentUserIds=[...new Set((userComments??[]).map((x:any)=>x.user_id))];
    const {data:realNames}=realCommentUserIds.length?await db.from("profiles").select("id,full_name").in("id",realCommentUserIds):{data:[]};
    const nameMap=new Map((realNames??[]).map((x:any)=>[x.id,x.full_name||"Membro LDR"]));
    const commentsBy=new Map<string,any[]>();
    for(const c of editorComments??[]){const a=commentsBy.get(c.post_id)??[];a.push({...c,own:false,editorial:true,author:profileMap.get(c.profile_id)});commentsBy.set(c.post_id,a)}
    for(const c of userComments??[]){const a=commentsBy.get(c.post_id)??[];a.push({...c,own:c.user_id===userId,editorial:false,author:{display_name:nameMap.get(c.user_id)||"Membro LDR"}});commentsBy.set(c.post_id,a)}
    const counts=new Map<string,number>();for(const r of reactionRows??[])counts.set(r.post_id,(counts.get(r.post_id)??0)+1);
    const savedSet=new Set((saved??[]).map((x:any)=>x.post_id)),reactedSet=new Set((reacted??[]).map((x:any)=>x.post_id));
    const safePosts=picked.map((p:any)=>({...p,editorial:true,profile:profileMap.get(p.profile_id),comments:commentsBy.get(p.id)??[],supportCount:counts.get(p.id)??0,supported:reactedSet.has(p.id),saved:savedSet.has(p.id),followed:followedIds.has(p.profile_id)}));
    const safeArticles=(articles??[]).map((a:any)=>({...a,editorial:true,profile:profileMap.get(a.profile_id)})).filter((a:any)=>a.profile);
    const suggestions=(profiles??[]).filter((p:any)=>!followedIds.has(p.id)).slice(0,6).map((p:any)=>({...p,editorial:true}));
    return {posts:safePosts,profiles:profiles??[],articles:safeArticles,suggestions,stats:{editorialPercent,real24:real24??0,real7,activeUsers},settings,followedIds:[...followedIds]};
  }catch(error){console.warn("academic editorial v3 unavailable",error);return {posts:[],profiles:[],articles:[],suggestions:[],stats:{editorialPercent:0,real24:0,real7:0,activeUsers:0},settings:null,followedIds:[]};}
}

export async function toggleEditorialSupport(userId:string,postId:string){
 const {data,error:readError}=await db.from("academic_editorial_reactions").select("post_id").eq("post_id",postId).eq("user_id",userId).maybeSingle();
 if(readError)fail("Não foi possível verificar o acolhimento.");
 const {error}=data?await db.from("academic_editorial_reactions").delete().eq("post_id",postId).eq("user_id",userId):await db.from("academic_editorial_reactions").insert({post_id:postId,user_id:userId,reaction_type:"support"});
 if(error)fail("Não foi possível atualizar o acolhimento.");
 return {supported:!data};
}
export async function toggleEditorialSave(userId:string,postId:string){
 const {data,error:readError}=await db.from("academic_saved_editorial_posts").select("post_id").eq("post_id",postId).eq("user_id",userId).maybeSingle();
 if(readError)fail("Não foi possível verificar os salvos.");
 const {error}=data?await db.from("academic_saved_editorial_posts").delete().eq("post_id",postId).eq("user_id",userId):await db.from("academic_saved_editorial_posts").insert({post_id:postId,user_id:userId});
 if(error)fail("Não foi possível atualizar os salvos.");
 return {saved:!data};
}
export async function toggleEditorialFollow(userId:string,profileId:string){const {data}=await db.from("academic_editorial_follows").select("editorial_profile_id").eq("editorial_profile_id",profileId).eq("user_id",userId).maybeSingle();if(data){await db.from("academic_editorial_follows").delete().eq("editorial_profile_id",profileId).eq("user_id",userId);return {following:false}}const {error}=await db.from("academic_editorial_follows").insert({editorial_profile_id:profileId,user_id:userId});if(error)fail("Não foi possível seguir este perfil.");return {following:true}}
export async function addEditorialUserComment(userId:string,postId:string,bodyRaw:string){const body=clean(bodyRaw,4000);if(!body)fail("Escreva um comentário.");const since=new Date(Date.now()-15000).toISOString();const {count}=await db.from("academic_editorial_user_comments").select("id",{count:"exact",head:true}).eq("user_id",userId).gte("created_at",since);if((count??0)>0)fail("Aguarde alguns segundos antes de comentar novamente.");const {data,error}=await db.from("academic_editorial_user_comments").insert({post_id:postId,user_id:userId,body}).select("id").single();if(error)fail("Não foi possível comentar.");return data}

export async function updateEditorialUserComment(userId:string,commentId:string,bodyRaw:string){if(!userId)fail("Autenticação obrigatória.");const body=clean(bodyRaw,4000);if(!body)fail("Escreva um comentário.");const {data,error}=await db.from("academic_editorial_user_comments").update({body,updated_at:new Date().toISOString()}).eq("id",commentId).eq("user_id",userId).eq("status","active").select("id").maybeSingle();if(error||!data)fail("Não foi possível editar este comentário.");return data}
export async function deleteEditorialUserComment(userId:string,commentId:string){if(!userId)fail("Autenticação obrigatória.");const {data,error}=await db.from("academic_editorial_user_comments").update({status:"hidden",updated_at:new Date().toISOString()}).eq("id",commentId).eq("user_id",userId).eq("status","active").select("id").maybeSingle();if(error||!data)fail("Não foi possível excluir este comentário.");return data}

export async function editorialAdminSnapshot(userId:string){await requireAdmin(userId);const [{data:settings},{count:profiles},{count:posts},{count:articles},{count:comments}]=await Promise.all([db.from("academic_editorial_settings").select("*").eq("id",true).maybeSingle(),db.from("academic_editorial_profiles").select("id",{count:"exact",head:true}),db.from("academic_editorial_posts").select("id",{count:"exact",head:true}),db.from("academic_editorial_articles").select("id",{count:"exact",head:true}),db.from("academic_editorial_comments").select("id",{count:"exact",head:true})]);const publicView=await editorialSnapshot(userId,{limit:3});return {settings,counts:{profiles:profiles??0,posts:posts??0,articles:articles??0,comments:comments??0},stats:publicView.stats}}
export async function updateEditorialSettings(userId:string,input:{mode:"automatic"|"manual";manualMaxPercent:number}){await requireAdmin(userId);const allowed=new Set([5,10,20,30,40]);const pct=allowed.has(Number(input.manualMaxPercent))?Number(input.manualMaxPercent):30;const mode=input.mode==="manual"?"manual":"automatic";const {data,error}=await db.from("academic_editorial_settings").update({mode,manual_max_percent:pct,updated_at:new Date().toISOString()}).eq("id",true).select("*").single();if(error)fail("Não foi possível atualizar a distribuição editorial.");return data}

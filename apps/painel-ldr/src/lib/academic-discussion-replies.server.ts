import { supabaseAdmin } from "@/integrations/supabase/client.server";

const db = supabaseAdmin as any;

function fail(message:string):never{ throw new Error(message); }
function clean(value:unknown,max:number){ return String(value??"").trim().slice(0,max); }
function mentionedUsernames(body:string){ return [...new Set([...body.matchAll(/(^|\s)@([a-zA-Z0-9._]{3,30})\b/g)].map(m=>m[2]).filter((name):name is string=>Boolean(name)).map(name=>name.toLowerCase()))].slice(0,20); }

async function rateLimit(userId:string){
  const since=new Date(Date.now()-8000).toISOString();
  const {count,error}=await db.from("academic_comments").select("id",{count:"exact",head:true}).eq("user_id",userId).gte("created_at",since);
  if(error)fail("Não foi possível validar o comentário.");
  if((count??0)>0)fail("Aguarde 8 segundos antes de publicar novamente.");
}

async function requireAcademicAccess(userId:string){
  if(!userId)fail("Autenticação obrigatória.");
}

async function queueNotification(targetUserId:string,createdBy:string,subject:string,body:string,metadata:Record<string,unknown>){
  if(!targetUserId||targetUserId===createdBy)return;
  const {data:customer}=await db.from("customers").select("id").eq("auth_user_id",targetUserId).maybeSingle();
  if(!customer?.id)return;
  await db.from("notification_outbox").insert({audience_type:"client",target_id:customer.id,channel:"in_app",event_type:"manual",subject,body,metadata:{source:"academic_network",target_auth_user_id:targetUserId,...metadata},created_by:createdBy,status:"pending"});
}

async function createMentions(userId:string,body:string,commentId:string,anonymous:boolean){
  if(anonymous)return;
  const names=mentionedUsernames(body);if(!names.length)return;
  const {data:profiles}=await db.from("academic_profiles").select("user_id,username").in("username",names);
  for(const profile of profiles??[]){
    if(profile.user_id===userId)continue;
    await db.from("academic_mentions").insert({actor_user_id:userId,mentioned_user_id:profile.user_id,comment_id:commentId});
    await queueNotification(profile.user_id,userId,"Você foi mencionado","Uma resposta mencionou seu @username na Rede Acadêmica.",{kind:"mention",commentId});
  }
}

export async function createAcademicThreadedComment(userId:string,input:{postId:string;body:string;anonymous:boolean;parentCommentId?:string|null}){
  if(!input.parentCommentId){
    const canonical=await import("@/lib/academic-network.server");
    return canonical.createAcademicComment(userId,{postId:input.postId,body:input.body,anonymous:input.anonymous});
  }
  await requireAcademicAccess(userId);
  await rateLimit(userId);
  const body=clean(input.body,6000);if(!body)fail("Resposta vazia.");
  const {data:post,error:postError}=await db.from("academic_posts").select("id,status").eq("id",input.postId).eq("status","active").maybeSingle();
  if(postError||!post)fail("Publicação não encontrada.");
  const {data:parent,error:parentError}=await db.from("academic_comments").select("id,post_id,user_id,status").eq("id",input.parentCommentId).eq("status","active").maybeSingle();
  if(parentError||!parent||parent.post_id!==input.postId)fail("Comentário de origem inválido.");
  const {data,error}=await db.from("academic_comments").insert({post_id:input.postId,user_id:userId,body,anonymous:Boolean(input.anonymous),parent_comment_id:parent.id}).select("id,parent_comment_id").single();
  if(error||!data)fail("Não foi possível responder ao comentário.");
  await queueNotification(parent.user_id,userId,"Nova resposta na Rede Acadêmica","Seu comentário recebeu uma resposta.",{kind:"comment_reply",postId:input.postId,commentId:data.id,parentCommentId:parent.id});
  await createMentions(userId,body,data.id,Boolean(input.anonymous));
  return data;
}

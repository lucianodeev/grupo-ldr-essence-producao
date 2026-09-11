import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { resolveClient } from "@/lib/client-portal.server";

function fail(message:string):never{throw new Error(message)}

async function trainingBySlug(slug:string){
  const {data}=await supabaseAdmin.from("training_programs").select("id,slug,title,status").eq("slug",slug).eq("status","published").maybeSingle();
  if(!data)fail("Treinamento não encontrado.");
  return data;
}

async function requireEnrolledClient(userId:string,email:string|null,slug:string){
  const ctx=await resolveClient(userId,email);
  if(ctx.status!=="ok")fail("Acesso negado.");
  if(slug==="formacao-psicanalise"){
    const {getPsychoanalysisOffer}=await import("@/lib/psychoanalysis-commerce.server");
    const offer=await getPsychoanalysisOffer(userId,email);
    if(!offer.entitled)fail("Você precisa estar matriculado para acessar o fórum.");
  }
  const training=await trainingBySlug(slug);
  const {data:enrollment}=await supabaseAdmin.from("training_enrollments").select("id").eq("training_id",training.id).eq("customer_id",ctx.customer.id).eq("active",true).maybeSingle();
  if(!enrollment)fail("Você precisa estar matriculado para acessar o fórum.");
  return {customer:ctx.customer,training};
}

async function requireStaff(userId:string){
  const {data:role}=await supabaseAdmin.from("user_roles").select("role").eq("user_id",userId).maybeSingle();
  if(!role||role.role!=="superadmin")fail("Acesso administrativo não autorizado.");
  const {data:profile}=await supabaseAdmin.from("profiles").select("full_name,email").eq("id",userId).maybeSingle();
  return {label:profile?.full_name??profile?.email??"Equipe LDR Essence"};
}

export async function getClientTrainingForum(userId:string,email:string|null,slug:string){
  const {training}=await requireEnrolledClient(userId,email,slug);
  const {data:topics,error:topicError}=await supabaseAdmin.from("training_forum_topics").select("id,training_id,module_id,author_user_id,author_label,title,body,status,pinned,created_at,updated_at").eq("training_id",training.id).neq("status","hidden").order("pinned",{ascending:false}).order("created_at",{ascending:false});
  if(topicError)fail("Não foi possível carregar o fórum.");
  const ids=(topics??[]).map((x:any)=>x.id);
  let posts:any[]=[];
  if(ids.length){
    const {data,error}=await supabaseAdmin.from("training_forum_posts").select("id,topic_id,author_user_id,author_label,body,status,created_at,updated_at").in("topic_id",ids).eq("status","visible").order("created_at",{ascending:true});
    if(error)fail("Não foi possível carregar as respostas.");
    posts=data??[];
  }
  return {training,topics:topics??[],posts,currentUserId:userId};
}

export async function createClientForumTopic(userId:string,email:string|null,input:{slug:string;title:string;body:string}){
  const {customer,training}=await requireEnrolledClient(userId,email,input.slug);
  const title=input.title.trim(),body=input.body.trim();
  if(title.length<5||title.length>160)fail("O título deve ter entre 5 e 160 caracteres.");
  if(body.length<5||body.length>4000)fail("A mensagem deve ter entre 5 e 4.000 caracteres.");
  const {error}=await supabaseAdmin.from("training_forum_topics").insert({training_id:training.id,author_user_id:userId,author_label:customer.fullName,title,body,status:"open",pinned:false});
  if(error)fail("Não foi possível publicar o tópico.");
  return {ok:true as const};
}

export async function createClientForumReply(userId:string,email:string|null,input:{slug:string;topicId:string;body:string}){
  const {customer,training}=await requireEnrolledClient(userId,email,input.slug);
  const body=input.body.trim();
  if(!body||body.length>4000)fail("Resposta inválida.");
  const {data:topic}=await supabaseAdmin.from("training_forum_topics").select("id,status,training_id").eq("id",input.topicId).eq("training_id",training.id).maybeSingle();
  if(!topic||topic.status!=="open")fail("Este tópico não aceita novas respostas.");
  const {error}=await supabaseAdmin.from("training_forum_posts").insert({topic_id:topic.id,author_user_id:userId,author_label:customer.fullName,body,status:"visible"});
  if(error)fail("Não foi possível publicar a resposta.");
  return {ok:true as const};
}

export async function getAdminTrainingForum(userId:string,slug:string){
  await requireStaff(userId);
  const training=await trainingBySlug(slug);
  const {data:topics}=await supabaseAdmin.from("training_forum_topics").select("id,training_id,author_user_id,author_label,title,body,status,pinned,created_at,updated_at").eq("training_id",training.id).order("pinned",{ascending:false}).order("created_at",{ascending:false});
  const ids=(topics??[]).map((x:any)=>x.id);
  let posts:any[]=[];
  if(ids.length){const {data}=await supabaseAdmin.from("training_forum_posts").select("id,topic_id,author_user_id,author_label,body,status,created_at,updated_at").in("topic_id",ids).order("created_at",{ascending:true});posts=data??[];}
  return {training,topics:topics??[],posts};
}

export async function adminReplyForumTopic(userId:string,input:{topicId:string;body:string}){
  const staff=await requireStaff(userId);const body=input.body.trim();if(!body||body.length>4000)fail("Resposta inválida.");
  const {data:topic}=await supabaseAdmin.from("training_forum_topics").select("id,status").eq("id",input.topicId).maybeSingle();if(!topic||topic.status==="hidden")fail("Tópico indisponível.");
  const {error}=await supabaseAdmin.from("training_forum_posts").insert({topic_id:topic.id,author_user_id:userId,author_label:staff.label,body,status:"visible"});if(error)fail("Não foi possível responder.");
  return {ok:true as const};
}

export async function adminModerateForumTopic(userId:string,input:{topicId:string;status:"open"|"closed"|"hidden";pinned:boolean}){
  await requireStaff(userId);const {error}=await supabaseAdmin.from("training_forum_topics").update({status:input.status,pinned:input.pinned,updated_at:new Date().toISOString()}).eq("id",input.topicId);if(error)fail("Não foi possível moderar o tópico.");return {ok:true as const};
}

export async function adminModerateForumPost(userId:string,input:{postId:string;status:"visible"|"hidden"}){
  await requireStaff(userId);const {error}=await supabaseAdmin.from("training_forum_posts").update({status:input.status,updated_at:new Date().toISOString()}).eq("id",input.postId);if(error)fail("Não foi possível moderar a resposta.");return {ok:true as const};
}

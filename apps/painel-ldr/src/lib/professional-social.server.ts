import { supabaseAdmin } from "@/integrations/supabase/client.server";

const db = supabaseAdmin as unknown as { from: (table: string) => any };
function fail(message:string):never{throw new Error(message)}

export async function getEnhancedPublicProfessional(slug:string){
  const {data:profile}=await db.from("professional_profiles").select("id,professional_account_id,slug,display_name,professional_title,profile_headline,category_id,city,country_code,languages,online_enabled,in_person_enabled,public_region,photo_url,intro_video_url,about,experience_summary,education_summary,specialties,identity_verified,documents_verified,profile_verified,view_count,lgbtq_self_identified,show_lgbtq_badge,operating_countries,open_to_international_projects,open_to_partnerships,international_positioning,show_passport_badge").eq("slug",slug).eq("is_public",true).eq("profile_status","active").eq("compliance_status","approved").maybeSingle();
  if(!profile)return null;
  const [{data:category},{data:services},{data:availability},{data:reviews}]=await Promise.all([
    db.from("professional_categories").select("slug,name_pt,name_en,name_fr,name_es").eq("id",profile.category_id).maybeSingle(),
    db.from("professional_services").select("id,name,description,modality,duration_minutes,currency,price_cents,city,public_location,booking_enabled,active,sort_order").eq("professional_profile_id",profile.id).eq("active",true).eq("approval_status","approved").order("sort_order"),
    db.from("professional_availability").select("id,professional_service_id,weekday,start_time,end_time,timezone,slot_interval_minutes,buffer_minutes,modality,location_label,effective_from,effective_until").eq("professional_profile_id",profile.id).eq("active",true),
    db.from("professional_reviews").select("id,rating,body,professional_reply,replied_at,verified_booking,created_at").eq("professional_profile_id",profile.id).eq("status","published").order("created_at",{ascending:false}).limit(20),
  ]);
  void db.from("professional_profiles").update({view_count:Number(profile.view_count??0)+1}).eq("id",profile.id);
  const passportItems={identity:Boolean(profile.identity_verified),documents:Boolean(profile.documents_verified),photo:Boolean(profile.photo_url),video:Boolean(profile.intro_video_url),languages:Array.isArray(profile.languages)&&profile.languages.length>0,services:(services??[]).length>0,availability:(availability??[]).length>0,international:Array.isArray(profile.operating_countries)&&profile.operating_countries.length>0};
  const passportScore=Math.round((Object.values(passportItems).filter(Boolean).length/Object.keys(passportItems).length)*100);
  return {profile:{...profile,lgbtq_public:Boolean(profile.lgbtq_self_identified&&profile.show_lgbtq_badge)},category,services:services??[],availability:availability??[],reviews:reviews??[],passport:{score:passportScore,items:passportItems,label:"Passaporte Profissional LDR",disclaimer:"Indicador de completude e verificações da plataforma. Não é licença, certificação oficial ou autorização profissional."}};
}

export async function saveProfessionalMediaAndIdentity(userId:string,input:{photoUrl?:string|null;introVideoUrl?:string|null;profileHeadline?:string|null;lgbtqSelfIdentified?:boolean|null;showLgbtqBadge?:boolean;operatingCountries?:string[];openToInternationalProjects?:boolean;openToPartnerships?:boolean;internationalPositioning?:string|null;showPassportBadge?:boolean}){
  const {data:account}=await db.from("professional_accounts").select("id").eq("auth_user_id",userId).maybeSingle();
  if(!account)fail("Perfil profissional não encontrado.");
  const patch:Record<string,unknown>={updated_at:new Date().toISOString()};
  if(input.photoUrl!==undefined){const v=input.photoUrl?.trim()||null;if(v&&!(v.startsWith("https://")||v.startsWith("data:image/")))fail("Use uma imagem válida.");patch.photo_url=v}
  if(input.introVideoUrl!==undefined){const v=input.introVideoUrl?.trim()||null;if(v&&!v.startsWith("https://"))fail("Use um link HTTPS para o vídeo de apresentação.");patch.intro_video_url=v}
  if(input.profileHeadline!==undefined)patch.profile_headline=input.profileHeadline?.trim().slice(0,140)||null;
  if(input.lgbtqSelfIdentified!==undefined)patch.lgbtq_self_identified=input.lgbtqSelfIdentified;
  if(input.showLgbtqBadge!==undefined)patch.show_lgbtq_badge=Boolean(input.showLgbtqBadge&&input.lgbtqSelfIdentified===true);
  if(input.operatingCountries!==undefined)patch.operating_countries=[...new Set(input.operatingCountries.map(x=>x.trim().toUpperCase()).filter(Boolean))].slice(0,20);
  if(input.openToInternationalProjects!==undefined)patch.open_to_international_projects=Boolean(input.openToInternationalProjects);
  if(input.openToPartnerships!==undefined)patch.open_to_partnerships=Boolean(input.openToPartnerships);
  if(input.internationalPositioning!==undefined)patch.international_positioning=input.internationalPositioning?.trim().slice(0,500)||null;
  if(input.showPassportBadge!==undefined)patch.show_passport_badge=Boolean(input.showPassportBadge);
  const {error}=await db.from("professional_profiles").update(patch).eq("professional_account_id",account.id);if(error)throw error;
  return {ok:true as const};
}

async function resolveConversation(userId:string,profileSlug?:string,conversationId?:string){
  if(conversationId){
    const {data:c}=await db.from("professional_conversations").select("id,professional_profile_id,professional_account_id,customer_auth_user_id,status,professional_profiles(display_name,slug,photo_url),professional_accounts(auth_user_id)").eq("id",conversationId).maybeSingle();
    if(!c)fail("Conversa não encontrada.");
    const owner=(c as any).professional_accounts?.auth_user_id===userId;
    if(c.customer_auth_user_id!==userId&&!owner)fail("Acesso não autorizado.");
    return c;
  }
  if(!profileSlug)fail("Profissional não informado.");
  const {data:p}=await db.from("professional_profiles").select("id,professional_account_id,display_name,slug,photo_url").eq("slug",profileSlug).eq("is_public",true).eq("profile_status","active").maybeSingle();
  if(!p)fail("Profissional indisponível.");
  const {data:pa}=await db.from("professional_accounts").select("auth_user_id").eq("id",p.professional_account_id).maybeSingle();
  if(pa?.auth_user_id===userId)fail("Use sua caixa de mensagens para responder clientes.");
  const {data:existing}=await db.from("professional_conversations").select("*").eq("professional_profile_id",p.id).eq("customer_auth_user_id",userId).maybeSingle();
  if(existing)return existing;
  const {data:created,error}=await db.from("professional_conversations").insert({professional_profile_id:p.id,professional_account_id:p.professional_account_id,customer_auth_user_id:userId}).select("*").single();if(error||!created)throw error??new Error("Não foi possível abrir a conversa.");return created;
}

export async function getProfessionalMessages(userId:string,input:{profileSlug?:string;conversationId?:string}){
  const current=await resolveConversation(userId,input.profileSlug,input.conversationId);
  const {data:messages}=await db.from("professional_messages").select("id,conversation_id,sender_auth_user_id,body,read_at,created_at").eq("conversation_id",current.id).order("created_at");
  await db.from("professional_messages").update({read_at:new Date().toISOString()}).eq("conversation_id",current.id).neq("sender_auth_user_id",userId).is("read_at",null);
  return {conversation:current,messages:messages??[]};
}

export async function listProfessionalConversations(userId:string){
  const {data:account}=await db.from("professional_accounts").select("id").eq("auth_user_id",userId).maybeSingle();
  let q=db.from("professional_conversations").select("id,professional_profile_id,professional_account_id,customer_auth_user_id,status,last_message_at,created_at,professional_profiles(display_name,slug,photo_url)").order("last_message_at",{ascending:false,nullsFirst:false});
  q=account?q.or(`customer_auth_user_id.eq.${userId},professional_account_id.eq.${account.id}`):q.eq("customer_auth_user_id",userId);
  const {data,error}=await q;if(error)throw error;return data??[];
}

export async function sendProfessionalMessage(userId:string,input:{conversationId?:string;profileSlug?:string;body:string}){
  const body=input.body.trim();if(!body||body.length>3000)fail("A mensagem deve ter entre 1 e 3000 caracteres.");
  const c=await resolveConversation(userId,input.profileSlug,input.conversationId);if(c.status!=="active")fail("Esta conversa não está disponível.");
  const {error}=await db.from("professional_messages").insert({conversation_id:c.id,sender_auth_user_id:userId,body});if(error)throw error;
  await db.from("professional_conversations").update({last_message_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq("id",c.id);return {ok:true as const,conversationId:c.id};
}

export async function createVerifiedProfessionalReview(userId:string,input:{profileSlug:string;rating:number;body:string}){
  const rating=Math.max(1,Math.min(5,Math.round(input.rating)));const body=input.body.trim();if(body.length<3||body.length>1500)fail("Escreva um comentário entre 3 e 1500 caracteres.");
  const {data:p}=await db.from("professional_profiles").select("id").eq("slug",input.profileSlug).maybeSingle();if(!p)fail("Profissional não encontrado.");
  const {data:booking}=await db.from("marketplace_bookings").select("id").eq("professional_profile_id",p.id).eq("customer_auth_user_id",userId).in("status",["confirmed","completed"]).lte("starts_at",new Date().toISOString()).order("starts_at",{ascending:false}).limit(1).maybeSingle();
  if(!booking)fail("Avaliações ficam disponíveis para clientes autenticados após um atendimento realizado.");
  const {data:old}=await db.from("professional_reviews").select("id").eq("booking_id",booking.id).maybeSingle();if(old)fail("Este atendimento já possui uma avaliação.");
  const {error}=await db.from("professional_reviews").insert({booking_id:booking.id,professional_profile_id:p.id,customer_auth_user_id:userId,rating,body,status:"pending",verified_booking:true});if(error)throw error;return {ok:true as const,message:"Avaliação enviada para moderação."};
}

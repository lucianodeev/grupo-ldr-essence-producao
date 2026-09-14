from pathlib import Path

p = Path("apps/painel-ldr/src/lib/academic-dm.server.ts")

p.write_text(r'''import { supabaseAdmin } from "@/integrations/supabase/client.server";

const db = supabaseAdmin;

type AcademicProfileRow = { id:string; user_id:string; username:string|null; avatar_path:string|null; show_name:boolean };
type CoreProfileRow = { full_name:string|null };
type ConnectionRow = { requester_user_id:string; receiver_user_id:string };
type ConversationRow = { id:string; user_one_id:string; user_two_id:string; updated_at:string; created_at:string };
type MessageRow = { id:string; conversation_id:string; sender_user_id:string; body:string; shared_post_id:string|null; read_at:string|null; created_at:string };
type SharedPostRow = { id:string; user_id:string; body:string; post_type:string; anonymous:boolean; status:string; created_at:string };
type MediaRow = { post_id:string; storage_path:string; mime_type:string; sort_order:number };
type IdRow = { id:string };
type CreatedMessageRow = { id:string; created_at:string };
type CustomerRow = { id:string };
type PublicAcademicProfile = { profileId:string|null; userId:string; username:string|null; name:string; avatarUrl:string|null };

function fail(message:string):never{throw new Error(message)}
function clean(value:unknown,max:number){return String(value??"").trim().slice(0,max)}
function one<T>(value:unknown):T|null{return value==null?null:value as T}
function many<T>(value:unknown):T[]{return Array.isArray(value)?value as T[]:[]}

async function academicProfileById(profileId:string){
 const {data}=await db.from("academic_profiles").select("id,user_id,username,avatar_path,show_name").eq("id",profileId).maybeSingle();
 return one<AcademicProfileRow>(data);
}
async function academicProfileForUser(userId:string):Promise<PublicAcademicProfile>{
 const {data:academicData}=await db.from("academic_profiles").select("id,user_id,username,avatar_path,show_name").eq("user_id",userId).maybeSingle();
 const {data:profileData}=await db.from("profiles").select("full_name").eq("id",userId).maybeSingle();
 const academic=one<AcademicProfileRow>(academicData);const profile=one<CoreProfileRow>(profileData);
 let avatarUrl:string|null=null;
 if(academic?.avatar_path){const {data:signed}=await db.storage.from("academic-network").createSignedUrl(academic.avatar_path,3600);avatarUrl=signed?.signedUrl??null}
 return {profileId:academic?.id??null,userId,username:academic?.username??null,name:academic?.show_name===false?"Membro LDR":profile?.full_name||"Membro LDR",avatarUrl};
}
async function accepted(userId:string,otherUserId:string){
 const {data}=await db.from("academic_connections").select("id").eq("status","accepted").or(`and(requester_user_id.eq.${userId},receiver_user_id.eq.${otherUserId}),and(requester_user_id.eq.${otherUserId},receiver_user_id.eq.${userId})`).maybeSingle();
 return Boolean(data);
}
async function requireParticipant(userId:string,conversationId:string){
 const {data}=await db.from("academic_conversations").select("id,user_one_id,user_two_id,updated_at,created_at").eq("id",conversationId).maybeSingle();
 const conversation=one<ConversationRow>(data);
 if(!conversation||(conversation.user_one_id!==userId&&conversation.user_two_id!==userId))fail("Conversa não encontrada.");
 return conversation;
}
async function notify(targetUserId:string,createdBy:string,subject:string,body:string,metadata:Record<string,unknown>){
 if(targetUserId===createdBy)return;
 const {data}=await db.from("customers").select("id").eq("auth_user_id",targetUserId).maybeSingle();const customer=one<CustomerRow>(data);
 if(customer?.id)await db.from("notification_outbox").insert({audience_type:"client",target_id:customer.id,channel:"in_app",event_type:"manual",subject,body,metadata:{source:"academic_network",target_auth_user_id:targetUserId,...metadata},status:"pending"});
}

export async function openAcademicConversation(userId:string,targetProfileId:string){
 const target=await academicProfileById(targetProfileId);if(!target?.user_id||target.user_id===userId)fail("Perfil inválido.");if(!(await accepted(userId,target.user_id)))fail("A conversa privada está disponível entre conexões aceitas.");
 const pair=[userId,target.user_id].sort();
 const {data:existingData}=await db.from("academic_conversations").select("id").or(`and(user_one_id.eq.${pair[0]},user_two_id.eq.${pair[1]}),and(user_one_id.eq.${pair[1]},user_two_id.eq.${pair[0]})`).maybeSingle();
 let conversation=one<IdRow>(existingData);
 if(!conversation){const inserted=await db.from("academic_conversations").insert({user_one_id:pair[0]!,user_two_id:pair[1]!}).select("id").single();if(inserted.error){const retry=await db.from("academic_conversations").select("id").or(`and(user_one_id.eq.${pair[0]},user_two_id.eq.${pair[1]}),and(user_one_id.eq.${pair[1]},user_two_id.eq.${pair[0]})`).maybeSingle();conversation=one<IdRow>(retry.data)}else conversation=one<IdRow>(inserted.data)}
 if(!conversation?.id)fail("Não foi possível abrir a conversa.");return conversation;
}

export async function academicConversationList(userId:string){
 const {data:conversationData}=await db.from("academic_conversations").select("id,user_one_id,user_two_id,updated_at,created_at").or(`user_one_id.eq.${userId},user_two_id.eq.${userId}`).order("updated_at",{ascending:false}).order("created_at",{ascending:false}).limit(100);
 const rows=many<ConversationRow>(conversationData);const ids=rows.map(row=>row.id);const otherIds=[...new Set(rows.map(row=>row.user_one_id===userId?row.user_two_id:row.user_one_id).filter(Boolean))];
 const profileEntries=await Promise.all(otherIds.map(async id=>[id,await academicProfileForUser(id)] as const));const profileMap=new Map(profileEntries);
 const messageResult=ids.length?await db.from("academic_messages").select("id,conversation_id,sender_user_id,body,shared_post_id,read_at,created_at").in("conversation_id",ids).order("created_at",{ascending:false}).limit(500):{data:[] as unknown[]};
 const messages=many<MessageRow>(messageResult.data);const latest=new Map<string,MessageRow>(),unread=new Map<string,number>();
 for(const message of messages){if(!latest.has(message.conversation_id))latest.set(message.conversation_id,message);if(message.sender_user_id!==userId&&!message.read_at)unread.set(message.conversation_id,(unread.get(message.conversation_id)??0)+1)}
 const items=rows.map(conversation=>{const other=conversation.user_one_id===userId?conversation.user_two_id:conversation.user_one_id;return {...conversation,other:profileMap.get(other),latest:latest.get(conversation.id)??null,unread:unread.get(conversation.id)??0}});
 const {data:connectionData}=await db.from("academic_connections").select("requester_user_id,receiver_user_id").eq("status","accepted").or(`requester_user_id.eq.${userId},receiver_user_id.eq.${userId}`);const connections=many<ConnectionRow>(connectionData);
 const contactIds=[...new Set(connections.map(connection=>connection.requester_user_id===userId?connection.receiver_user_id:connection.requester_user_id).filter(Boolean))];const contacts=await Promise.all(contactIds.map(id=>academicProfileForUser(id)));
 return {conversations:items,contacts:contacts.filter(profile=>profile.profileId)};
}

export async function academicConversationMessages(userId:string,conversationId:string){
 const conversation=await requireParticipant(userId,conversationId);
 await db.from("academic_messages").update({read_at:new Date().toISOString()}).eq("conversation_id",conversationId).neq("sender_user_id",userId).is("read_at",null);
 const {data:messageData}=await db.from("academic_messages").select("id,conversation_id,sender_user_id,body,shared_post_id,read_at,created_at").eq("conversation_id",conversationId).order("created_at",{ascending:true}).limit(300);const messages=many<MessageRow>(messageData);
 const sharedIds=[...new Set(messages.map(message=>message.shared_post_id??"").filter(Boolean))];
 const postResult=sharedIds.length?await db.from("academic_posts").select("id,user_id,body,post_type,anonymous,status,created_at").in("id",sharedIds).eq("status","active"):{data:[] as unknown[]};const posts=many<SharedPostRow>(postResult.data);
 const postAuthors=new Map<string,string>();await Promise.all(posts.map(async post=>{if(post.anonymous){postAuthors.set(post.id,"Membro anônimo");return}const profile=await academicProfileForUser(post.user_id);postAuthors.set(post.id,profile.name)}));
 const mediaResult=sharedIds.length?await db.from("academic_post_media").select("post_id,storage_path,mime_type,sort_order").in("post_id",sharedIds).like("mime_type","image/%").order("sort_order"):{data:[] as unknown[]};const media=many<MediaRow>(mediaResult.data);
 const firstImage=new Map<string,string>();for(const item of media)if(item.storage_path&&!firstImage.has(item.post_id))firstImage.set(item.post_id,item.storage_path);
 const paths=[...firstImage.values()];const signed=new Map<string,string>();if(paths.length){const {data:urls}=await db.storage.from("academic-network").createSignedUrls(paths,3600);(urls??[]).forEach((item,index)=>{const path=paths[index];if(path&&item?.signedUrl)signed.set(path,item.signedUrl)})}
 const postMap=new Map(posts.map(post=>{const path=firstImage.get(post.id);return [post.id,{...post,user_id:undefined,authorName:postAuthors.get(post.id)??null,imageUrl:path?signed.get(path)??null:null}] as const}));
 return {conversation,messages:messages.map(message=>({...message,sender_user_id:undefined,own:message.sender_user_id===userId,sharedPost:message.shared_post_id?postMap.get(message.shared_post_id)??null:null}))};
}

export async function sendAcademicMessage(userId:string,input:{conversationId:string;body?:string;sharedPostId?:string|null}){
 const conversation=await requireParticipant(userId,input.conversationId);const body=clean(input.body,4000);let sharedPostId=clean(input.sharedPostId,80)||null;if(!body&&!sharedPostId)fail("Escreva uma mensagem.");
 if(sharedPostId){const {data}=await db.from("academic_posts").select("id").eq("id",sharedPostId).eq("status","active").maybeSingle();const post=one<IdRow>(data);if(!post)fail("Publicação não encontrada.");sharedPostId=post.id}
 const inserted=await db.from("academic_messages").insert({conversation_id:input.conversationId,sender_user_id:userId,body,shared_post_id:sharedPostId}).select("id,created_at").single();const created=one<CreatedMessageRow>(inserted.data);if(inserted.error||!created)fail("Não foi possível enviar a mensagem.");
 const now=created.created_at??new Date().toISOString();await db.from("academic_conversations").update({updated_at:now}).eq("id",input.conversationId);const target=conversation.user_one_id===userId?conversation.user_two_id:conversation.user_one_id;
 await notify(target,userId,"Nova mensagem privada",sharedPostId?"Uma conexão enviou uma publicação por mensagem.":body.slice(0,120),{kind:"academic_dm",conversation_id:input.conversationId,post_id:sharedPostId});return created;
}

export async function sendAcademicPostToProfile(userId:string,input:{postId:string;targetProfileId:string}){const conversation=await openAcademicConversation(userId,input.targetProfileId);await sendAcademicMessage(userId,{conversationId:conversation.id,sharedPostId:input.postId});return conversation}
''')

print("Replaced Academic DM implementation with strict query-boundary typing; behavior preserved")

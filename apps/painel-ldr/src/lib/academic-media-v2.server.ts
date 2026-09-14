import { randomUUID } from "node:crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const db=supabaseAdmin as any;
const BUCKET="academic-network";
const IMAGE_MAX=5*1024*1024;
const POST_MAX=10*1024*1024;
const IMAGE_ALLOWED=new Set(["image/jpeg","image/png","image/webp"]);
const POST_ALLOWED=new Set(["image/jpeg","image/png","image/webp","application/pdf"]);
type Purpose="avatars"|"posts"|"articles";
function fail(m:string):never{throw new Error(m)}
function safeName(v:string){return String(v||"arquivo").split(/[\\/]/).pop()!.normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-zA-Z0-9._-]+/g,"-").replace(/-+/g,"-").slice(0,100)||"arquivo"}
function mimeFromBytes(bytes:Uint8Array){if(bytes.length>=3&&bytes[0]===0xff&&bytes[1]===0xd8&&bytes[2]===0xff)return "image/jpeg";if(bytes.length>=8&&bytes[0]===0x89&&bytes[1]===0x50&&bytes[2]===0x4e&&bytes[3]===0x47&&bytes[4]===0x0d&&bytes[5]===0x0a&&bytes[6]===0x1a&&bytes[7]===0x0a)return "image/png";if(bytes.length>=12&&String.fromCharCode(...bytes.slice(0,4))==="RIFF"&&String.fromCharCode(...bytes.slice(8,12))==="WEBP")return "image/webp";if(bytes.length>=5&&String.fromCharCode(...bytes.slice(0,5))==="%PDF-")return "application/pdf";return null}
async function verifyOwnedFile(userId:string,path:string,purpose:Purpose){if(!path.startsWith(`${userId}/${purpose}/`))fail("Arquivo inválido.");const {data,error}=await db.storage.from(BUCKET).download(path);if(error||!data)fail("Arquivo não encontrado.");const max=purpose==="posts"?POST_MAX:IMAGE_MAX;if(data.size<=0||data.size>max)fail(`O arquivo deve ter no máximo ${max/1024/1024} MB.`);const bytes=new Uint8Array(await data.arrayBuffer());const real=mimeFromBytes(bytes.slice(0,16));const allowed=purpose==="posts"?POST_ALLOWED:IMAGE_ALLOWED;if(!real||!allowed.has(real))fail("Formato de arquivo inválido.");return {mime:real,size:data.size}}
async function ensureAcademicProfile(userId:string){const {data:existing,error}=await db.from("academic_profiles").select("id").eq("user_id",userId).maybeSingle();if(error)fail("Não foi possível carregar o perfil acadêmico.");if(existing)return existing;const {data,error:insertError}=await db.from("academic_profiles").insert({user_id:userId}).select("id").single();if(insertError||!data)fail("Não foi possível criar o perfil acadêmico.");return data}

export async function prepareAcademicImageUpload(userId:string,input:{fileName:string;contentType:string;size:number;purpose:Purpose}){
  const type=String(input.contentType||"").toLowerCase();const allowed=input.purpose==="posts"?POST_ALLOWED:IMAGE_ALLOWED;const max=input.purpose==="posts"?POST_MAX:IMAGE_MAX;if(!allowed.has(type))fail(input.purpose==="posts"?"Envie JPG, JPEG, PNG, WEBP ou PDF.":"Envie JPG, JPEG, PNG ou WEBP.");if(!Number.isFinite(input.size)||input.size<=0||input.size>max)fail(`O arquivo deve ter no máximo ${max/1024/1024} MB.`);if(!["avatars","posts","articles"].includes(input.purpose))fail("Destino inválido.");const path=`${userId}/${input.purpose}/${randomUUID()}-${safeName(input.fileName)}`;const {data,error}=await db.storage.from(BUCKET).createSignedUploadUrl(path);if(error||!data?.token)fail("Não foi possível preparar o upload.");return {bucket:BUCKET,path,token:data.token}
}

export async function finalizeAcademicAvatar(userId:string,path:string){const verified=await verifyOwnedFile(userId,path,"avatars");if(!IMAGE_ALLOWED.has(verified.mime))fail("Avatar precisa ser uma imagem.");await ensureAcademicProfile(userId);const {data,error}=await db.from("academic_profiles").update({avatar_path:path,updated_at:new Date().toISOString()}).eq("user_id",userId).select("id,avatar_path").maybeSingle();if(error||!data)fail("Não foi possível atualizar a foto do perfil.");const signed=await db.storage.from(BUCKET).createSignedUrl(path,3600);return {...data,avatarUrl:signed.data?.signedUrl??null}}

export async function finalizeAcademicPostMedia(userId:string,input:{postId:string;path:string;altText?:string;fileName?:string}){const verified=await verifyOwnedFile(userId,input.path,"posts");const {data:post}=await db.from("academic_posts").select("id").eq("id",input.postId).eq("user_id",userId).eq("status","active").maybeSingle();if(!post)fail("Publicação não encontrada.");const {data,error}=await db.from("academic_post_media").insert({post_id:input.postId,owner_user_id:userId,storage_path:input.path,mime_type:verified.mime,alt_text:String(input.altText??"").trim().slice(0,300),file_name:safeName(input.fileName||input.path.split("/").pop()||"arquivo"),sort_order:0}).select("id").single();if(error)fail("Não foi possível vincular o arquivo à publicação.");return data}
export const finalizeAcademicPostImage=finalizeAcademicPostMedia;

export async function signedAcademicImage(path:string|null){if(!path)return null;const {data}=await db.storage.from(BUCKET).createSignedUrl(path,3600);return data?.signedUrl??null}

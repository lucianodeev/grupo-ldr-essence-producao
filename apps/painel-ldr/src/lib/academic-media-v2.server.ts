import { randomUUID } from "node:crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const db=supabaseAdmin as any;
const BUCKET="academic-network";
const MAX=5*1024*1024;
const ALLOWED=new Set(["image/jpeg","image/png","image/webp"]);
type Purpose="avatars"|"posts"|"articles";
function fail(m:string):never{throw new Error(m)}
function safeName(v:string){return String(v||"imagem").split(/[\\/]/).pop()!.normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-zA-Z0-9._-]+/g,"-").replace(/-+/g,"-").slice(0,100)||"imagem"}
function mimeFromBytes(bytes:Uint8Array){if(bytes.length>=3&&bytes[0]===0xff&&bytes[1]===0xd8&&bytes[2]===0xff)return "image/jpeg";if(bytes.length>=8&&bytes[0]===0x89&&bytes[1]===0x50&&bytes[2]===0x4e&&bytes[3]===0x47&&bytes[4]===0x0d&&bytes[5]===0x0a&&bytes[6]===0x1a&&bytes[7]===0x0a)return "image/png";if(bytes.length>=12&&String.fromCharCode(...bytes.slice(0,4))==="RIFF"&&String.fromCharCode(...bytes.slice(8,12))==="WEBP")return "image/webp";return null}
async function verifyOwnedImage(userId:string,path:string,purpose:Purpose){if(!path.startsWith(`${userId}/${purpose}/`))fail("Arquivo inválido.");const {data,error}=await db.storage.from(BUCKET).download(path);if(error||!data)fail("Imagem não encontrada.");if(data.size<=0||data.size>MAX)fail("A imagem deve ter no máximo 5 MB.");const bytes=new Uint8Array(await data.arrayBuffer());const real=mimeFromBytes(bytes.slice(0,16));if(!real||!ALLOWED.has(real))fail("O arquivo enviado não é uma imagem válida.");return {mime:real,size:data.size}}

export async function prepareAcademicImageUpload(userId:string,input:{fileName:string;contentType:string;size:number;purpose:Purpose}){
  const type=String(input.contentType||"").toLowerCase();if(!ALLOWED.has(type))fail("Envie JPG, JPEG, PNG ou WEBP.");if(!Number.isFinite(input.size)||input.size<=0||input.size>MAX)fail("A imagem deve ter no máximo 5 MB.");if(!["avatars","posts","articles"].includes(input.purpose))fail("Destino inválido.");const path=`${userId}/${input.purpose}/${randomUUID()}-${safeName(input.fileName)}`;const {data,error}=await db.storage.from(BUCKET).createSignedUploadUrl(path);if(error||!data?.token)fail("Não foi possível preparar o upload.");return {bucket:BUCKET,path,token:data.token}
}

export async function finalizeAcademicAvatar(userId:string,path:string){await verifyOwnedImage(userId,path,"avatars");const {data,error}=await db.from("academic_profiles").update({avatar_path:path,updated_at:new Date().toISOString()}).eq("user_id",userId).select("id,avatar_path").maybeSingle();if(error||!data)fail("Perfil acadêmico não encontrado.");const signed=await db.storage.from(BUCKET).createSignedUrl(path,3600);return {...data,avatarUrl:signed.data?.signedUrl??null}}

export async function finalizeAcademicPostImage(userId:string,input:{postId:string;path:string;altText?:string}){const verified=await verifyOwnedImage(userId,input.path,"posts");const {data:post}=await db.from("academic_posts").select("id").eq("id",input.postId).eq("user_id",userId).eq("status","active").maybeSingle();if(!post)fail("Publicação não encontrada.");const {data,error}=await db.from("academic_post_media").insert({post_id:input.postId,owner_user_id:userId,storage_path:input.path,mime_type:verified.mime,alt_text:String(input.altText??"").trim().slice(0,300),sort_order:0}).select("id").single();if(error)fail("Não foi possível vincular a imagem à publicação.");return data}

export async function signedAcademicImage(path:string|null){if(!path)return null;const {data}=await db.storage.from(BUCKET).createSignedUrl(path,3600);return data?.signedUrl??null}

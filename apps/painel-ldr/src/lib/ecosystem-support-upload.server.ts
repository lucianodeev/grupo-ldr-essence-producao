import { createHash, randomUUID } from "crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const db=supabaseAdmin as unknown as {from:(table:string)=>any;storage:any};
export const SUPPORT_BUCKET="ecosystem-support-private";
export const MAX_SUPPORT_FILES=5;
export const MAX_SUPPORT_FILE_SIZE=10*1024*1024;
export const SUPPORT_MIME_TYPES=new Set([
 "application/pdf","application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document",
 "application/vnd.ms-excel","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
 "application/vnd.ms-powerpoint","application/vnd.openxmlformats-officedocument.presentationml.presentation",
 "text/plain","text/csv","image/jpeg","image/png"
]);
function clean(v:unknown,max=500){return typeof v==="string"?v.trim().replace(/\u0000/g,"").slice(0,max):""}
function safeName(v:string){return (v.split(/[\\/]/).pop()||"arquivo").normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-zA-Z0-9._-]+/g,"-").slice(0,120)||"arquivo"}
export function validateSupportFile(input:{fileName:string;contentType:string;size:number}){
 const contentType=clean(input.contentType,160).toLowerCase(),fileName=safeName(input.fileName),size=Number(input.size);
 if(!SUPPORT_MIME_TYPES.has(contentType)) throw new Error("Formato de arquivo não permitido.");
 if(!Number.isFinite(size)||size<=0||size>MAX_SUPPORT_FILE_SIZE) throw new Error("Cada arquivo deve ter no máximo 10 MB.");
 return {contentType,fileName,size};
}
function tokenHash(v:string){return createHash("sha256").update(v).digest("hex")}
async function authorizedContact(protocol:string,uploadToken:string){const {data,error}=await db.from("ecosystem_contacts").select("id,protocol,upload_token_hash,upload_token_expires_at").eq("protocol",protocol).maybeSingle();if(error||!data||!uploadToken||data.upload_token_hash!==tokenHash(uploadToken)||!data.upload_token_expires_at||new Date(data.upload_token_expires_at).getTime()<Date.now())throw new Error("Autorização de anexo inválida ou expirada.");return data}
export async function preparePublicSupportUpload(input:{protocol:string;uploadToken:string;fileName:string;contentType:string;size:number}){
 const f=validateSupportFile(input); const protocol=clean(input.protocol,40);
 if(!/^LDR-[A-Z0-9]{6,20}$/.test(protocol)) throw new Error("Protocolo inválido.");
 const contact=await authorizedContact(protocol,clean(input.uploadToken,200));
 const {count}=await db.from("ecosystem_contact_attachments").select("id",{count:"exact",head:true}).eq("contact_id",contact.id).eq("direction","inbound");
 if((count||0)>=MAX_SUPPORT_FILES) throw new Error("Limite de 5 arquivos por solicitação.");
 const path=`inbound/${contact.id}/${randomUUID()}-${f.fileName}`;
 const {data,error}=await db.storage.from(SUPPORT_BUCKET).createSignedUploadUrl(path);
 if(error||!data?.token) throw new Error("Não foi possível preparar o envio.");
 return {contactId:contact.id,path,token:data.token,bucket:SUPPORT_BUCKET,...f};
}
export async function finalizePublicSupportUpload(input:{protocol:string;uploadToken:string;path:string;fileName:string;contentType:string;size:number}){
 const f=validateSupportFile(input); const protocol=clean(input.protocol,40),path=clean(input.path,700);
 const contact=await authorizedContact(protocol,clean(input.uploadToken,200));
 if(!path.startsWith(`inbound/${contact.id}/`)) throw new Error("Arquivo inválido.");
 const name=path.split("/").pop(); const {data:objects,error:oe}=await db.storage.from(SUPPORT_BUCKET).list(`inbound/${contact.id}`,{search:name,limit:10});
 const object=objects?.find((o:any)=>o.name===name); if(oe||!object) throw new Error("Upload não confirmado.");
 const actualSize=Number(object.metadata?.size??f.size),actualType=String(object.metadata?.mimetype??object.metadata?.contentType??f.contentType).toLowerCase(); validateSupportFile({fileName:f.fileName,contentType:actualType,size:actualSize});
 const {count}=await db.from("ecosystem_contact_attachments").select("id",{count:"exact",head:true}).eq("contact_id",contact.id).eq("direction","inbound"); if((count||0)>=MAX_SUPPORT_FILES){await db.storage.from(SUPPORT_BUCKET).remove([path]);throw new Error("Limite de 5 arquivos por solicitação.");}
 const {data:msg}=await db.from("ecosystem_contact_messages").select("id").eq("contact_id",contact.id).eq("direction","inbound").order("created_at",{ascending:true}).limit(1).maybeSingle();
 const {error}=await db.from("ecosystem_contact_attachments").insert({contact_id:contact.id,message_id:msg?.id??null,direction:"inbound",original_name:f.fileName,storage_path:path,mime_type:actualType,size_bytes:actualSize});
 if(error){await db.storage.from(SUPPORT_BUCKET).remove([path]);throw error;} return {ok:true};
}

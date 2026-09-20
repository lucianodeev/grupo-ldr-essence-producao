import { randomUUID } from "crypto";
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
export async function preparePublicSupportUpload(input:{protocol:string;fileName:string;contentType:string;size:number}){
 const f=validateSupportFile(input); const protocol=clean(input.protocol,40);
 if(!/^LDR-[A-Z0-9]{6,20}$/.test(protocol)) throw new Error("Protocolo inválido.");
 const {data:contact,error:ce}=await db.from("ecosystem_contacts").select("id,protocol").eq("protocol",protocol).maybeSingle();
 if(ce||!contact) throw new Error("Protocolo não encontrado.");
 const {count}=await db.from("ecosystem_contact_attachments").select("id",{count:"exact",head:true}).eq("contact_id",contact.id).eq("direction","inbound");
 if((count||0)>=MAX_SUPPORT_FILES) throw new Error("Limite de 5 arquivos por solicitação.");
 const path=`inbound/${contact.id}/${randomUUID()}-${f.fileName}`;
 const {data,error}=await db.storage.from(SUPPORT_BUCKET).createSignedUploadUrl(path);
 if(error||!data?.token) throw new Error("Não foi possível preparar o envio.");
 return {contactId:contact.id,path,token:data.token,bucket:SUPPORT_BUCKET,...f};
}
export async function finalizePublicSupportUpload(input:{protocol:string;path:string;fileName:string;contentType:string;size:number}){
 const f=validateSupportFile(input); const protocol=clean(input.protocol,40),path=clean(input.path,700);
 const {data:contact}=await db.from("ecosystem_contacts").select("id").eq("protocol",protocol).maybeSingle();
 if(!contact||!path.startsWith(`inbound/${contact.id}/`)) throw new Error("Arquivo inválido.");
 const {data:objects,error:oe}=await db.storage.from(SUPPORT_BUCKET).list(`inbound/${contact.id}`,{search:path.split("/").pop(),limit:10});
 if(oe||!objects?.some((o:any)=>path.endsWith("/"+o.name))) throw new Error("Upload não confirmado.");
 const {error}=await db.from("ecosystem_contact_attachments").insert({contact_id:contact.id,direction:"inbound",original_name:f.fileName,storage_path:path,mime_type:f.contentType,size_bytes:f.size});
 if(error) throw error; return {ok:true};
}

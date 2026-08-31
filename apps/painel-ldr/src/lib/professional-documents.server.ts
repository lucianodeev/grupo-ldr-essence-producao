import { randomUUID } from "crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const db=supabaseAdmin as unknown as {from:(table:string)=>any};
const BUCKET="professional-private-documents";
const MIME=new Set(["application/pdf","image/jpeg","image/png"]);
function fail(m:string):never{throw new Error(m)}
function safeName(name:string){const clean=name.normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-zA-Z0-9._-]+/g,"-").replace(/^-+|-+$/g,"");return clean.slice(-120)||"documento"}
async function accountFor(userId:string){const {data}=await db.from("professional_accounts").select("id").eq("auth_user_id",userId).maybeSingle();if(!data)fail("Área profissional não encontrada.");return data}

export async function prepareProfessionalDocumentUpload(userId:string,input:{documentType:string;fileName:string;mimeType:string;purpose:"professional"|"payout";payoutId?:string|null}){
 const account=await accountFor(userId);if(!MIME.has(input.mimeType))fail("Envie PDF, JPG ou PNG.");if(!input.documentType.trim())fail("Informe o tipo do documento.");
 if(input.purpose==="payout"){if(!input.payoutId)fail("Selecione o repasse referente ao documento.");const {data:payout}=await db.from("payouts").select("id").eq("id",input.payoutId).eq("professional_account_id",account.id).maybeSingle();if(!payout)fail("Repasse inválido.")}
 const path=`${account.id}/${input.purpose}/${randomUUID()}-${safeName(input.fileName)}`;
 const {data,error}=await supabaseAdmin.storage.from(BUCKET).createSignedUploadUrl(path,{upsert:false});
 if(error||!data)fail("Não foi possível preparar o envio seguro.");
 return {bucket:BUCKET,path,token:data.token,signedUrl:data.signedUrl};
}

export async function finalizeProfessionalDocumentUpload(userId:string,input:{documentType:string;fileName:string;mimeType:string;purpose:"professional"|"payout";path:string;payoutId?:string|null;countryCode?:string|null;periodStart?:string|null;periodEnd?:string|null;declaredAmountCents?:number|null;currency?:"EUR"|"BRL"|null}){
 const account=await accountFor(userId);if(!input.path.startsWith(`${account.id}/`))fail("Documento inválido.");if(!MIME.has(input.mimeType))fail("Formato inválido.");
 const parts=input.path.split("/");const file=parts.pop()||"";const folder=parts.join("/");const {data:list,error:listError}=await supabaseAdmin.storage.from(BUCKET).list(folder,{limit:100,search:file});if(listError||!(list??[]).some(x=>x.name===file))fail("O arquivo ainda não foi recebido.");
 if(input.purpose==="payout"){
  if(!input.payoutId)fail("Repasse obrigatório.");const {data:payout}=await db.from("payouts").select("id,period_start,period_end,currency,net_cents").eq("id",input.payoutId).eq("professional_account_id",account.id).maybeSingle();if(!payout)fail("Repasse inválido.");
  const {error}=await db.from("payout_documents").insert({payout_id:payout.id,professional_account_id:account.id,document_type:input.documentType.trim(),storage_path:input.path,original_filename:input.fileName,mime_type:input.mimeType,period_start:input.periodStart||payout.period_start,period_end:input.periodEnd||payout.period_end,declared_amount_cents:input.declaredAmountCents??payout.net_cents,currency:input.currency||payout.currency,status:"received"});
  if(error)throw error;await db.from("payouts").update({status:"documentation_received",updated_at:new Date().toISOString()}).eq("id",payout.id);
 } else {
  const {error}=await db.from("professional_documents").insert({professional_account_id:account.id,document_type:input.documentType.trim(),country_code:input.countryCode||null,storage_path:input.path,original_filename:input.fileName,mime_type:input.mimeType,status:"pending"});if(error)throw error;
 }
 return {ok:true as const};
}

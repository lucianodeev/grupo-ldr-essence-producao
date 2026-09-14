import { supabaseAdmin } from "@/integrations/supabase/client.server";
const db=supabaseAdmin as any;
function fail(m:string):never{throw new Error(m)}
async function customerId(userId:string){const {data}=await db.from("customers").select("id").eq("auth_user_id",userId).maybeSingle();return data?.id??null}
export async function markAcademicNotificationRead(userId:string,id:string){const cid=await customerId(userId);if(!cid)fail("Notificação inválida.");const {data}=await db.from("notification_outbox").update({status:"read",updated_at:new Date().toISOString()}).eq("id",id).eq("target_id",cid).eq("audience_type","client").eq("channel","in_app").select("id").maybeSingle();if(!data)fail("Notificação não encontrada.");return data}

import { supabaseAdmin } from "@/integrations/supabase/client.server";
const db=supabaseAdmin as any;
function fail(m:string):never{throw new Error(m)}
async function customerId(userId:string){const {data}=await db.from("customers").select("id").eq("auth_user_id",userId).maybeSingle();return data?.id??null}
export async function markAcademicNotificationRead(userId:string,id:string){const cid=await customerId(userId);if(!cid)fail("Notificação inválida.");const {data:owned}=await db.from("notification_outbox").select("id").eq("id",id).eq("target_id",cid).eq("audience_type","client").eq("channel","in_app").maybeSingle();if(!owned)fail("Notificação não encontrada.");const {data,error}=await db.from("academic_notification_reads").upsert({notification_id:id,user_id:userId,read_at:new Date().toISOString()},{onConflict:"notification_id,user_id"}).select("notification_id,read_at").single();if(error)fail("Não foi possível marcar como lida.");return data}

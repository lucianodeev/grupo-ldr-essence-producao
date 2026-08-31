import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { resolveAccess, writeAudit } from "@/lib/access.server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
type Client=SupabaseClient<Database>;const db=supabaseAdmin as unknown as {from:(table:string)=>any};
function fail(m:string):never{throw new Error(m)}
async function requireSuperadmin(s:Client,userId:string){const a=await resolveAccess(s,userId);if(!a.authorized||a.role!=="superadmin")fail("Acesso negado.");return a}
export async function getReviewAdmin(s:Client,userId:string){await requireSuperadmin(s,userId);const {data,error}=await db.from("professional_reviews").select("id,rating,body,status,verified_booking,created_at,moderation_note,professional_reply,professional_profiles(display_name,slug)").order("created_at",{ascending:false}).limit(200);if(error)throw error;return data??[]}
export async function moderateReview(s:Client,userId:string,input:{id:string;status:"published"|"rejected";note?:string}){const actor=await requireSuperadmin(s,userId);const {data,error}=await db.from("professional_reviews").update({status:input.status,moderated_at:new Date().toISOString(),moderation_note:input.note?.trim()||null}).eq("id",input.id).select("id").maybeSingle();if(error||!data)fail("Avaliação não encontrada.");await writeAudit({actorId:userId,actorEmail:actor.email,action:"professional_network.review_moderated",target:input.id,details:{status:input.status}});return {ok:true as const}}

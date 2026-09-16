import { supabaseAdmin } from "@/integrations/supabase/client.server";

const db = supabaseAdmin as any;

export async function deleteOwnedAcademicComment(userId:string,id:string){
  const commentId=String(id??"").trim();
  if(!commentId)throw new Error("Comentário inválido.");
  const {data,error}=await db.from("academic_comments")
    .update({status:"deleted",updated_at:new Date().toISOString()})
    .eq("id",commentId)
    .eq("user_id",userId)
    .eq("status","active")
    .select("id")
    .maybeSingle();
  if(error)throw new Error("Não foi possível excluir o comentário.");
  if(!data)throw new Error("Comentário não encontrado ou você não tem permissão para excluí-lo.");
  return {ok:true,id:data.id};
}

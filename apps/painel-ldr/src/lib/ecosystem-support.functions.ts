import { createServerFn } from "@tanstack/react-start";
import { getSupabaseServerClient } from "@/integrations/supabase/server";

async function requireMaster() {
 const supabase=await getSupabaseServerClient();
 const { data: { user } }=await supabase.auth.getUser();
 if(!user) throw new Error("Unauthorized");
 const {data:role}=await supabase.from("user_roles").select("role").eq("user_id",user.id).eq("role","superadmin").maybeSingle();
 if(!role) throw new Error("Forbidden");
 return supabase;
}
export const listEcosystemContacts=createServerFn({method:"GET"}).handler(async()=>{
 const db=await requireMaster(); const {data,error}=await (db as any).from("ecosystem_contacts").select("*").order("created_at",{ascending:false}).limit(200); if(error) throw error; return data??[];
});
export const updateEcosystemContact=createServerFn({method:"POST"}).inputValidator((d:{id:string;status:string;priority:string})=>d).handler(async({data})=>{
 const db=await requireMaster(); const patch:any={status:data.status,priority:data.priority,updated_at:new Date().toISOString()}; if(data.status==="respondido") patch.first_response_at=new Date().toISOString(); if(data.status==="resolvido") patch.resolved_at=new Date().toISOString();
 const {error}=await (db as any).from("ecosystem_contacts").update(patch).eq("id",data.id); if(error) throw error; return {ok:true};
});
export const prepareEcosystemSupportUpload=createServerFn({method:"POST"}).inputValidator((d:{protocol:string;fileName:string;contentType:string;size:number})=>d).handler(async({data})=>{
 const {preparePublicSupportUpload}=await import("@/lib/ecosystem-support-upload.server"); return preparePublicSupportUpload(data);
});
export const finalizeEcosystemSupportUpload=createServerFn({method:"POST"}).inputValidator((d:{protocol:string;path:string;fileName:string;contentType:string;size:number})=>d).handler(async({data})=>{
 const {finalizePublicSupportUpload}=await import("@/lib/ecosystem-support-upload.server"); return finalizePublicSupportUpload(data);
});

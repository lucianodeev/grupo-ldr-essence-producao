import { createServerFn } from "@tanstack/react-start";

async function requireMaster() {
 const { resolveRequestAuth }=await import("@/integrations/supabase/request-auth.server");
 const auth=await resolveRequestAuth();
 if(!auth.authenticated) throw new Error("Unauthorized");
 const supabase=auth.supabase;
 const {data:role}=await supabase.from("user_roles").select("role").eq("user_id",auth.userId).eq("role","superadmin").maybeSingle();
 if(!role) throw new Error("Forbidden");
 return supabase;
}
export const listEcosystemContacts=createServerFn({method:"GET"}).handler(async()=>{
 const db=await requireMaster(); const {data,error}=await (db as any).from("ecosystem_contacts").select("*").order("created_at",{ascending:false}).limit(200); if(error) throw error; return data??[];
});
export const updateEcosystemContact=createServerFn({method:"POST"}).inputValidator((d:{id:string;status:string;priority:string})=>d).handler(async({data})=>{
 const db=await requireMaster(); const patch:any={status:data.status,priority:data.priority,updated_at:new Date().toISOString()}; if(data.status==="respondido"){ const {data:current}=await (db as any).from("ecosystem_contacts").select("first_response_at").eq("id",data.id).maybeSingle(); if(!current?.first_response_at) patch.first_response_at=new Date().toISOString(); } if(data.status==="resolvido") patch.resolved_at=new Date().toISOString();
 const {error}=await (db as any).from("ecosystem_contacts").update(patch).eq("id",data.id); if(error) throw error; return {ok:true};
});
export const prepareEcosystemSupportUpload=createServerFn({method:"POST"}).inputValidator((d:{protocol:string;fileName:string;contentType:string;size:number})=>d).handler(async({data})=>{
 const {preparePublicSupportUpload}=await import("@/lib/ecosystem-support-upload.server"); return preparePublicSupportUpload(data);
});
export const finalizeEcosystemSupportUpload=createServerFn({method:"POST"}).inputValidator((d:{protocol:string;path:string;fileName:string;contentType:string;size:number})=>d).handler(async({data})=>{
 const {finalizePublicSupportUpload}=await import("@/lib/ecosystem-support-upload.server"); return finalizePublicSupportUpload(data);
});

export const getEcosystemContactThread=createServerFn({method:"GET"}).inputValidator((d:{id:string})=>d).handler(async({data})=>{
 const db=await requireMaster();
 const {data:contact,error}=await (db as any).from("ecosystem_contacts").select("*").eq("id",data.id).single(); if(error) throw error;
 const [{data:messages,error:me},{data:attachments,error:ae}]=await Promise.all([
  (db as any).from("ecosystem_contact_messages").select("*").eq("contact_id",data.id).order("created_at",{ascending:true}),
  (db as any).from("ecosystem_contact_attachments").select("*").eq("contact_id",data.id).order("created_at",{ascending:true})
 ]); if(me) throw me;if(ae) throw ae; return {contact,messages:messages??[],attachments:attachments??[]};
});
export const getEcosystemAttachmentUrl=createServerFn({method:"POST"}).inputValidator((d:{id:string})=>d).handler(async({data})=>{
 const db=await requireMaster(); const {data:a,error}=await (db as any).from("ecosystem_contact_attachments").select("storage_path").eq("id",data.id).single();if(error)throw error;
 const {data:signed,error:se}=await db.storage.from("ecosystem-support-private").createSignedUrl(a.storage_path,300);if(se)throw se;return signed.signedUrl;
});
export const addEcosystemAdminReply=createServerFn({method:"POST"}).inputValidator((d:{contactId:string;body:string})=>d).handler(async({data})=>{
 const body=data.body.trim();if(!body||body.length>10000)throw new Error("Invalid reply");
 const db=await requireMaster(); const {data:{user}}=await db.auth.getUser(); const {data:contact,error:ce}=await (db as any).from("ecosystem_contacts").select("email,first_response_at").eq("id",data.contactId).single();if(ce)throw ce;
 const now=new Date().toISOString(); const {error}=await (db as any).from("ecosystem_contact_messages").insert({contact_id:data.contactId,direction:"outbound",channel:"admin",body,sender:"LDR",recipient:contact.email,created_by:user!.id});if(error)throw error;
 const patch:any={status:"respondido",updated_at:now};if(!contact.first_response_at)patch.first_response_at=now;const {error:ue}=await (db as any).from("ecosystem_contacts").update(patch).eq("id",data.contactId);if(ue)throw ue;
 return {ok:true,email:contact.email,emailSent:false};
});

import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const clientSubmitUndergraduateInterest=createServerFn({method:"POST"})
 .middleware([requireSupabaseAuth])
 .inputValidator((data:{courseKey:string;fullName:string;email:string;phone:string;country:string})=>data)
 .handler(async({context,data})=>{const {submitUndergraduateInterest}=await import("@/lib/undergraduate-interest.server");return submitUndergraduateInterest(context.userId,data);});

export const adminUndergraduateInterests=createServerFn({method:"GET"})
 .middleware([requireSupabaseAuth])
 .handler(async({context})=>{const {listUndergraduateInterests}=await import("@/lib/undergraduate-interest.server");return listUndergraduateInterests(context.supabase,context.userId);});

export const adminUpdateUndergraduateInterestStatus=createServerFn({method:"POST"})
 .middleware([requireSupabaseAuth])
 .inputValidator((data:{id:string;status:string})=>data)
 .handler(async({context,data})=>{const {updateUndergraduateInterestStatus}=await import("@/lib/undergraduate-interest.server");return updateUndergraduateInterestStatus(context.supabase,context.userId,data);});

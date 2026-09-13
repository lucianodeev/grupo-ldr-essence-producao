import { supabaseAdmin } from "@/integrations/supabase/client.server";
const db=supabaseAdmin as any;
export async function paidCourseProjectApproved(customerId:string,trainingSlug:string){const {data:training}=await db.from("training_programs").select("id").eq("slug",trainingSlug).maybeSingle();if(!training?.id)return false;const {data}=await db.from("training_project_submissions").select("status").eq("training_id",training.id).eq("customer_id",customerId).eq("status","approved").limit(1);return Boolean(data?.length);}

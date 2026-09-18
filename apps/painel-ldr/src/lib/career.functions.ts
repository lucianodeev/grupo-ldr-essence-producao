import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const careerResumeSignedUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: { applicationId: string }) => data)
  .handler(async ({ context, data }) => {
    const { data: application, error } = await (context.supabase.from("career_applications") as any)
      .select("resume_path,career_jobs!inner(company_id,career_companies!inner(owner_user_id))")
      .eq("id", data.applicationId)
      .eq("career_jobs.career_companies.owner_user_id", context.userId)
      .maybeSingle();
    if (error || !application?.resume_path) throw new Error("Resume not available");
    const { data: signed, error: signError } = await context.supabase.storage
      .from("career-resumes")
      .createSignedUrl(application.resume_path, 60);
    if (signError || !signed?.signedUrl) throw new Error("Resume not available");
    return { url: signed.signedUrl };
  });

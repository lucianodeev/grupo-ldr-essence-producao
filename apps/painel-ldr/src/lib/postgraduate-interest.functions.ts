import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const clientSubmitPostgraduateInterest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { courseKey: string; fullName: string; email: string; phone: string }) => data)
  .handler(async ({ context, data }) => {
    const { submitPostgraduateInterest } = await import("@/lib/postgraduate-interest.server");
    return submitPostgraduateInterest(context.userId, data);
  });

export const adminPostgraduateInterests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { listPostgraduateInterests } = await import("@/lib/postgraduate-interest.server");
    return listPostgraduateInterests(context.supabase, context.userId);
  });

export const adminUpdatePostgraduateInterestStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; status: string }) => data)
  .handler(async ({ context, data }) => {
    const { updatePostgraduateInterestStatus } = await import("@/lib/postgraduate-interest.server");
    return updatePostgraduateInterestStatus(context.supabase, context.userId, data);
  });

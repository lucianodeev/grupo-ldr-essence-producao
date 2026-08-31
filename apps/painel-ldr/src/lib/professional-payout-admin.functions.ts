import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const professionalPayoutAdmin = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { getProfessionalPayoutAdmin } = await import("@/lib/professional-payout-admin.server");
  return getProfessionalPayoutAdmin(context.supabase, context.userId);
});

export const professionalPayoutReviewDocument = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data: { documentId: string; decision: "approve" | "reject"; rejectionReason?: string | null }) => data).handler(async ({ context, data }) => {
  const { reviewPayoutDocument } = await import("@/lib/professional-payout-admin.server");
  return reviewPayoutDocument(context.supabase, context.userId, data);
});

export const professionalPayoutDocumentUrl = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data: { documentId: string }) => data).handler(async ({ context, data }) => {
  const { getPayoutDocumentSignedUrl } = await import("@/lib/professional-payout-admin.server");
  return getPayoutDocumentSignedUrl(context.supabase, context.userId, data.documentId);
});

export const professionalPayoutSetProcessing = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data: { payoutId: string }) => data).handler(async ({ context, data }) => {
  const { setPayoutProcessing } = await import("@/lib/professional-payout-admin.server");
  return setPayoutProcessing(context.supabase, context.userId, data.payoutId);
});

export const professionalPayoutMarkPaid = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data: { payoutId: string; paymentReference: string; paymentMethod?: string | null }) => data).handler(async ({ context, data }) => {
  const { markProfessionalPayoutPaid } = await import("@/lib/professional-payout-admin.server");
  return markProfessionalPayoutPaid(context.supabase, context.userId, data);
});

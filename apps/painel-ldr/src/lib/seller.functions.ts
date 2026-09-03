import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const saleSchema = z.object({
  customerName: z.string().min(2).max(120),
  customerEmail: z.string().email().optional().or(z.literal("")),
  customerPhone: z.string().max(40).optional(),
  productName: z.string().min(2).max(160),
  productCategory: z.enum(["digital","training","mentoring","career","wellbeing","marketing","recruitment","business","service"]),
  amount: z.number().positive(),
  currency: z.enum(["EUR","BRL"]),
  paymentReference: z.string().max(160).optional(),
  notes: z.string().max(1000).optional(),
});

export const sellerDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { getSellerDashboard } = await import("@/lib/seller.server");
    return getSellerDashboard(context.userId);
  });

export const sellerRegisterSale = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => saleSchema.parse(data))
  .handler(async ({ context, data }) => {
    const { registerSellerSale } = await import("@/lib/seller.server");
    return registerSellerSale(context.userId, data);
  });

export const sellerAdminDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { getSellerAdminDashboard } = await import("@/lib/seller.server");
    return getSellerAdminDashboard(context.supabase, context.userId);
  });

export const sellerAdminReviewApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ applicationId: z.string().uuid(), action: z.enum(["approve","reject"]) }).parse(data))
  .handler(async ({ context, data }) => {
    const { reviewSellerApplication } = await import("@/lib/seller.server");
    return reviewSellerApplication(context.supabase, context.userId, data.applicationId, data.action);
  });

export const sellerAdminSetSaleStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ saleId: z.string().uuid(), status: z.enum(["confirmed","available","rejected","refunded","paid"]) }).parse(data))
  .handler(async ({ context, data }) => {
    const { setSellerSaleStatus } = await import("@/lib/seller.server");
    return setSellerSaleStatus(context.supabase, context.userId, data.saleId, data.status);
  });

export const sellerAdminMarkPayout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ sellerUserId: z.string().uuid(), currency: z.enum(["EUR","BRL"]), paymentReference: z.string().min(2).max(160) }).parse(data))
  .handler(async ({ context, data }) => {
    const { createManualSellerPayout } = await import("@/lib/seller.server");
    return createManualSellerPayout(context.supabase, context.userId, data);
  });

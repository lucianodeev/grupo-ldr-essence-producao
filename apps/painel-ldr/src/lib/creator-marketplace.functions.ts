import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const clientCreatorProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { listCreatorProducts } = await import("@/lib/creator-marketplace.server");
    return listCreatorProducts(context.userId);
  });

export const clientCreateCreatorUploadUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { fileName: string; contentType: string; size: number }) => data)
  .handler(async ({ context, data }) => {
    const { createCreatorUploadUrl } = await import("@/lib/creator-marketplace.server");
    return createCreatorUploadUrl(context.userId, data);
  });

export const clientSubmitCreatorProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: {
    creatorName: string;
    publicName?: string;
    email: string;
    phone?: string;
    country?: string;
    city?: string;
    locale: "pt" | "en" | "fr" | "es";
    bio?: string;
    title: string;
    subtitle?: string;
    category: string;
    productType: string;
    shortDescription?: string;
    description: string;
    targetAudience?: string;
    productLanguage: string;
    suggestedPriceCents?: number | null;
    currency: "BRL" | "EUR" | "USD";
    keywords?: string[];
    rightsAccepted: boolean;
    files: Array<{ path: string; name: string; contentType: string; size: number }>;
  }) => data)
  .handler(async ({ context, data }) => {
    const { submitCreatorProduct } = await import("@/lib/creator-marketplace.server");
    return submitCreatorProduct(context.userId, data);
  });

export const adminCreatorProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { listAdminCreatorProducts } = await import("@/lib/creator-marketplace.server");
    return listAdminCreatorProducts(context.supabase, context.userId);
  });

export const adminUpdateCreatorProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; status: string; adminNotes?: string; suggestedPriceCents?: number | null }) => data)
  .handler(async ({ context, data }) => {
    const { updateAdminCreatorProduct } = await import("@/lib/creator-marketplace.server");
    return updateAdminCreatorProduct(context.supabase, context.userId, data);
  });

export const adminCreatorFileUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { submissionId: string; path: string }) => data)
  .handler(async ({ context, data }) => {
    const { creatorFileDownloadUrl } = await import("@/lib/creator-marketplace.server");
    return creatorFileDownloadUrl(context.supabase, context.userId, data);
  });

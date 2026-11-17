import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { psychoanalysisEbookByKey } from "@/lib/psychoanalysis-ebooks.catalog";
import { storeSandboxEnabled } from "@/lib/ldr-store-sandbox";

export const ldrStoreSandboxStatus = createServerFn({ method: "GET" }).handler(() => ({
  enabled: storeSandboxEnabled(process.env, getRequest().url),
}));

export const ldrStoreSandboxCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        productKey: z.string().max(100),
        market: z.enum(["INTL", "BR"]),
      })
      .strict()
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    if (!storeSandboxEnabled(process.env, getRequest().url)) {
      throw new Error("Checkout de teste indisponível.");
    }
    const ebook = psychoanalysisEbookByKey(data.productKey);
    if (!ebook) throw new Error("Produto indisponível.");
    const { hasCompleteStoreEbook } = await import("@/lib/digital-content.server");
    if (!(await hasCompleteStoreEbook(ebook.key, ebook.chapters.length))) {
      throw new Error("Conteúdo indisponível para entrega.");
    }
    const { createDigitalCheckoutWithFixedBrlEbooks } =
      await import("@/lib/fixed-brl-ebook-checkout.server");
    const email = context.claims["email"];
    return createDigitalCheckoutWithFixedBrlEbooks(
      context.userId,
      typeof email === "string" ? email : null,
      data,
      { sandbox: true },
    );
  });

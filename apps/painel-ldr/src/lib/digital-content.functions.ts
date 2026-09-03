import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

function emailOf(claims: Record<string, unknown>): string | null {
  const value = claims["email"];
  return typeof value === "string" ? value : null;
}

const PRODUCTS = new Set(["ebook_coragem_comecar", "livro_menino_mamao"]);
const LOCALES = new Set(["pt", "en", "fr", "es"]);

export const clientDigitalProductContent = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { productKey: string; locale: string }) => {
    if (!PRODUCTS.has(input.productKey)) throw new Error("Produto inválido.");
    if (!LOCALES.has(input.locale)) throw new Error("Idioma inválido.");
    return input as {
      productKey: "ebook_coragem_comecar" | "livro_menino_mamao";
      locale: "pt" | "en" | "fr" | "es";
    };
  })
  .handler(async ({ context, data }) => {
    const { getProtectedDigitalContent } = await import("@/lib/digital-content.server");
    return getProtectedDigitalContent(context.userId, emailOf(context.claims), data.productKey, data.locale);
  });

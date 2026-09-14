import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { DigitalReaderLocale, DigitalReaderProductKey } from "@/lib/digital-content.server";

function emailOf(claims: Record<string, unknown>): string | null {
  const value = claims["email"];
  return typeof value === "string" ? value : null;
}

const PRODUCTS = new Set<DigitalReaderProductKey>([
  "ebook_coragem_comecar",
  "livro_menino_mamao",
  "ebook_pratica_clinica_psicanalise",
  "ebook_psicanalise_no_mundo",
  "ebook_estudos_caso_psicanalise",
  "ebook_psicanalise_autismo",
  "ebook_psicologia_psicanalise_terapias",
  "ebook_jornalismo_era_digital",
  "ebook_corpo_trabalho_escuta",
  "ebook_comportamento_humano",
  "ebook_estetica_bem_estar",
  "ebook_tricologia_cuidado",
  "ebook_ia_novos_milionarios",
  "ebook_imigracao_efeitos_psicologicos",
  "ebook_psicanalise_vs_psiquiatria",
]);
const LOCALES = new Set<DigitalReaderLocale>(["pt", "en", "fr", "es"]);

export const clientDigitalProductContent = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { productKey: string; locale: string }) => {
    if (!PRODUCTS.has(input.productKey as DigitalReaderProductKey)) throw new Error("Produto inválido.");
    if (!LOCALES.has(input.locale as DigitalReaderLocale)) throw new Error("Idioma inválido.");
    return input as { productKey: DigitalReaderProductKey; locale: DigitalReaderLocale };
  })
  .handler(async ({ context, data }) => {
    const { getProtectedDigitalContent } = await import("@/lib/digital-content.server");
    return getProtectedDigitalContent(context.userId, emailOf(context.claims), data.productKey, data.locale);
  });

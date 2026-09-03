import { gunzipSync } from "node:zlib";

import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type DigitalReaderProductKey = "ebook_coragem_comecar" | "livro_menino_mamao";
export type DigitalReaderLocale = "pt" | "en" | "fr" | "es";

const ALIASES: Record<DigitalReaderProductKey, string[]> = {
  ebook_coragem_comecar: ["ebook_coragem_comecar", "a_coragem_de_comecar", "ebook"],
  livro_menino_mamao: ["livro_menino_mamao", "menino_mamao", "livro"],
};

function fail(message: string): never {
  throw new Error(message);
}

async function resolveCustomer(userId: string, email: string | null) {
  const mail = email?.trim().toLowerCase() ?? null;
  const { data: linked } = await supabaseAdmin
    .from("customers")
    .select("id,portal_active")
    .eq("auth_user_id", userId)
    .maybeSingle();
  if (linked?.portal_active) return linked.id;

  if (mail) {
    const { data: byEmail } = await supabaseAdmin
      .from("customers")
      .select("id,portal_active")
      .ilike("email", mail)
      .maybeSingle();
    if (byEmail?.portal_active) return byEmail.id;
  }
  fail("Acesso de cliente não encontrado.");
}

async function assertEntitlement(customerId: string, productKey: DigitalReaderProductKey) {
  const { data: orders, error } = await supabaseAdmin
    .from("orders")
    .select("catalog_key,metadata")
    .eq("customer_id", customerId)
    .eq("payment_status", "pago");
  if (error) fail("Não foi possível validar sua compra.");

  const allowed = new Set(ALIASES[productKey]);
  const entitled = (orders ?? []).some((order) => {
    if (order.catalog_key && allowed.has(order.catalog_key)) return true;
    const metadata = order.metadata as Record<string, unknown> | null;
    const key = metadata && typeof metadata.product_key === "string" ? metadata.product_key : null;
    return Boolean(key && allowed.has(key));
  });
  if (!entitled) fail("Conteúdo disponível somente após confirmação da compra.");
}

function decodeContent(value: unknown): unknown {
  if (!value || typeof value !== "object") fail("Conteúdo indisponível.");
  const obj = value as { encoding?: unknown; payload?: unknown };
  if (obj.encoding === "gzip-base64" && typeof obj.payload === "string") {
    try {
      const text = gunzipSync(Buffer.from(obj.payload, "base64")).toString("utf8");
      return JSON.parse(text) as unknown;
    } catch {
      fail("Não foi possível abrir este conteúdo.");
    }
  }
  return value;
}

export async function getProtectedDigitalContent(
  userId: string,
  email: string | null,
  productKey: DigitalReaderProductKey,
  locale: DigitalReaderLocale,
) {
  const customerId = await resolveCustomer(userId, email);
  await assertEntitlement(customerId, productKey);

  let { data, error } = await supabaseAdmin
    .from("digital_product_content")
    .select("product_key,locale,title,content,version")
    .eq("product_key", productKey)
    .eq("locale", locale)
    .eq("active", true)
    .maybeSingle();

  // Fallback somente quando a tradução ainda não foi cadastrada; nunca duplica visualmente.
  if (!data && locale !== "pt") {
    const fallback = await supabaseAdmin
      .from("digital_product_content")
      .select("product_key,locale,title,content,version")
      .eq("product_key", productKey)
      .eq("locale", "pt")
      .eq("active", true)
      .maybeSingle();
    data = fallback.data;
    error = fallback.error;
  }

  if (error || !data) fail("Conteúdo ainda não disponível neste idioma.");

  return {
    productKey: data.product_key as DigitalReaderProductKey,
    requestedLocale: locale,
    locale: data.locale as DigitalReaderLocale,
    title: data.title,
    version: data.version,
    content: decodeContent(data.content),
  };
}

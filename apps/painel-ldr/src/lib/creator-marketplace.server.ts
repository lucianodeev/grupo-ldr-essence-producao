import type { SupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { Database } from "@/integrations/supabase/types";
import { resolveAccess } from "@/lib/access.server";

type Client = SupabaseClient<Database>;
const db = supabaseAdmin as unknown as { from: (table: string) => any; storage: any; auth: any };
const BUCKET = "creator-submissions-private";
const MAX_FILE_SIZE = 25 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const ALLOWED_PRODUCT_TYPES = new Set([
  "ebook",
  "digital_book",
  "academic_material",
  "handout",
  "course",
  "formation",
  "training",
  "professional_material",
  "other",
]);
const ALLOWED_STATUSES = new Set([
  "draft",
  "submitted",
  "under_review",
  "changes_requested",
  "approved",
  "preparing",
  "published",
  "rejected",
  "suspended",
]);

function fail(message: string): never {
  throw new Error(message);
}

async function requireSuperadmin(supabase: Client, userId: string) {
  const access = await resolveAccess(supabase, userId);
  if (!access.authorized || access.role !== "superadmin") fail("Acesso negado.");
}

function cleanText(value: unknown, max = 5000) {
  return typeof value === "string" ? value.trim().replace(/\u0000/g, "").slice(0, max) : "";
}

function safeFileName(name: string) {
  const base = name.split(/[\\/]/).pop() || "arquivo";
  return base
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 120) || "arquivo";
}

export async function createCreatorUploadUrl(
  userId: string,
  input: { fileName: string; contentType: string; size: number },
) {
  const contentType = cleanText(input.contentType, 160).toLowerCase();
  const fileName = safeFileName(input.fileName);
  if (!ALLOWED_TYPES.has(contentType)) fail("Formato não permitido. Envie PDF, DOC, DOCX, JPG, PNG ou WEBP.");
  if (!Number.isFinite(input.size) || input.size <= 0 || input.size > MAX_FILE_SIZE) fail("O arquivo deve ter no máximo 25 MB.");
  const path = `${userId}/${new Date().toISOString().slice(0, 10)}/${randomUUID()}-${fileName}`;
  const { data, error } = await db.storage.from(BUCKET).createSignedUploadUrl(path);
  if (error || !data?.token) fail("Não foi possível preparar o envio do arquivo.");
  return { path, token: data.token };
}

export async function submitCreatorProduct(userId: string, input: any) {
  const creatorName = cleanText(input.creatorName, 160);
  const publicName = cleanText(input.publicName, 160) || null;
  const email = cleanText(input.email, 254).toLowerCase();
  const title = cleanText(input.title, 220);
  const category = cleanText(input.category, 120);
  const productType = cleanText(input.productType, 80);
  const description = cleanText(input.description, 12000);
  const locale = ["pt", "en", "fr", "es"].includes(input.locale) ? input.locale : "pt";
  const currency = ["BRL", "EUR", "USD"].includes(input.currency) ? input.currency : "EUR";
  const files = Array.isArray(input.files) ? input.files.slice(0, 12) : [];

  if (creatorName.length < 2) fail("Informe o nome do criador.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail("Informe um e-mail válido.");
  if (title.length < 2) fail("Informe o título do produto.");
  if (!category) fail("Informe a categoria.");
  if (!ALLOWED_PRODUCT_TYPES.has(productType)) fail("Tipo de produto inválido.");
  if (description.length < 20) fail("Descreva melhor o conteúdo enviado.");
  if (input.rightsAccepted !== true) fail("É necessário aceitar a declaração de direitos autorais.");

  const normalizedFiles = files.map((file: any) => {
    const path = cleanText(file?.path, 500);
    const name = safeFileName(cleanText(file?.name, 160));
    const contentType = cleanText(file?.contentType, 160).toLowerCase();
    const size = Number(file?.size || 0);
    if (!path.startsWith(`${userId}/`)) fail("Arquivo inválido.");
    if (!ALLOWED_TYPES.has(contentType)) fail("Formato de arquivo inválido.");
    if (!Number.isFinite(size) || size <= 0 || size > MAX_FILE_SIZE) fail("Tamanho de arquivo inválido.");
    return { path, name, contentType, size };
  });

  const suggestedPriceCents = input.suggestedPriceCents == null ? null : Math.max(0, Math.round(Number(input.suggestedPriceCents)));
  const { data, error } = await db.from("creator_product_submissions").insert({
    user_id: userId,
    creator_name: creatorName,
    public_name: publicName,
    email,
    phone: cleanText(input.phone, 60) || null,
    country: cleanText(input.country, 100) || null,
    city: cleanText(input.city, 120) || null,
    locale,
    bio: cleanText(input.bio, 2500) || null,
    title,
    subtitle: cleanText(input.subtitle, 260) || null,
    category,
    product_type: productType,
    short_description: cleanText(input.shortDescription, 600) || null,
    description,
    target_audience: cleanText(input.targetAudience, 700) || null,
    product_language: cleanText(input.productLanguage, 80) || locale,
    suggested_price_cents: suggestedPriceCents,
    currency,
    keywords: Array.isArray(input.keywords) ? input.keywords.map((x: unknown) => cleanText(x, 80)).filter(Boolean).slice(0, 20) : [],
    status: "submitted",
    creator_share_percent: 85,
    ldr_commission_percent: 15,
    rights_accepted_at: new Date().toISOString(),
    files: normalizedFiles,
  }).select("id,status,created_at").single();

  if (error) fail("Não foi possível enviar seu produto para análise.");
  return data;
}

export async function listCreatorProducts(userId: string) {
  const { data, error } = await db
    .from("creator_product_submissions")
    .select("id,title,product_type,category,status,currency,suggested_price_cents,creator_share_percent,ldr_commission_percent,gross_sales_cents,net_sales_cents,ldr_commission_cents,creator_due_cents,payout_status,admin_notes,created_at,updated_at,published_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) fail("Não foi possível carregar seus produtos.");
  return data ?? [];
}

export async function listAdminCreatorProducts(supabase: Client, userId: string) {
  await requireSuperadmin(supabase, userId);
  const { data, error } = await db
    .from("creator_product_submissions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) fail("Não foi possível carregar as submissões dos criadores.");
  return data ?? [];
}

export async function updateAdminCreatorProduct(
  supabase: Client,
  userId: string,
  input: { id: string; status: string; adminNotes?: string; suggestedPriceCents?: number | null },
) {
  await requireSuperadmin(supabase, userId);
  if (!ALLOWED_STATUSES.has(input.status)) fail("Status inválido.");
  const patch: Record<string, unknown> = {
    status: input.status,
    admin_notes: cleanText(input.adminNotes, 5000) || null,
    updated_at: new Date().toISOString(),
  };
  if (input.suggestedPriceCents !== undefined) patch.suggested_price_cents = input.suggestedPriceCents == null ? null : Math.max(0, Math.round(Number(input.suggestedPriceCents)));
  if (input.status === "published") patch.published_at = new Date().toISOString();
  const { error } = await db.from("creator_product_submissions").update(patch).eq("id", input.id);
  if (error) fail("Não foi possível atualizar a submissão.");
  return { ok: true as const };
}

export async function creatorFileDownloadUrl(
  supabase: Client,
  userId: string,
  input: { submissionId: string; path: string },
) {
  await requireSuperadmin(supabase, userId);
  const { data: submission, error: lookupError } = await db
    .from("creator_product_submissions")
    .select("files")
    .eq("id", input.submissionId)
    .maybeSingle();
  if (lookupError || !submission) fail("Submissão não encontrada.");
  const files = Array.isArray(submission.files) ? submission.files : [];
  if (!files.some((file: any) => file?.path === input.path)) fail("Arquivo não pertence a esta submissão.");
  const { data, error } = await db.storage.from(BUCKET).createSignedUrl(input.path, 300, { download: true });
  if (error || !data?.signedUrl) fail("Não foi possível abrir o arquivo.");
  return { url: data.signedUrl };
}

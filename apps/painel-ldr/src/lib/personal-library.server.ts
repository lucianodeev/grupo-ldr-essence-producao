import { randomUUID } from "crypto";

import { supabaseAdmin } from "@/integrations/supabase/client.server";

const db = supabaseAdmin as unknown as { from: (table: string) => any; storage: any };
const BUCKET = "personal-library-private";
const MAX_FILE_SIZE = 50 * 1024 * 1024;
const MAX_FILES = 100;
const PDF_MIME = "application/pdf";
const ALLOWED_CATEGORIES = new Set(["Livros", "Estudos", "Artigos", "Trabalho", "Psicanálise", "Negócios", "Carreira", "Outros"]);

function fail(message: string): never { throw new Error(message); }
function clean(value: unknown, max = 500) { return typeof value === "string" ? value.trim().replace(/\u0000/g, "").slice(0, max) : ""; }
function safeFileName(name: string) {
  const base = name.split(/[\\/]/).pop() || "arquivo.pdf";
  const sanitized = base.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-").slice(0, 120);
  return sanitized.toLowerCase().endsWith(".pdf") ? sanitized : `${sanitized || "arquivo"}.pdf`;
}

export async function createPersonalLibraryUploadUrl(userId: string, input: { fileName: string; contentType: string; size: number }) {
  const contentType = clean(input.contentType, 160).toLowerCase();
  if (contentType !== PDF_MIME) fail("Envie somente arquivos PDF.");
  if (!Number.isFinite(input.size) || input.size <= 0 || input.size > MAX_FILE_SIZE) fail("O PDF deve ter no máximo 50 MB.");
  const { count, error: countError } = await db.from("personal_library_files").select("id", { count: "exact", head: true }).eq("user_id", userId);
  if (countError) fail("Não foi possível verificar sua biblioteca.");
  if ((count ?? 0) >= MAX_FILES) fail("Sua biblioteca pessoal atingiu o limite de 100 PDFs.");
  const path = `${userId}/${new Date().toISOString().slice(0, 10)}/${randomUUID()}-${safeFileName(input.fileName)}`;
  const { data, error } = await db.storage.from(BUCKET).createSignedUploadUrl(path);
  if (error || !data?.token) fail("Não foi possível preparar o envio do PDF.");
  return { path, token: data.token, maxFileSize: MAX_FILE_SIZE, maxFiles: MAX_FILES };
}

export async function registerPersonalLibraryFile(userId: string, input: { path: string; title: string; originalFileName: string; size: number; category?: string; author?: string; notes?: string }) {
  const path = clean(input.path, 500);
  if (!path.startsWith(`${userId}/`)) fail("Arquivo inválido.");
  const title = clean(input.title, 220);
  if (!title) fail("Informe um título para o PDF.");
  const size = Number(input.size || 0);
  if (!Number.isFinite(size) || size <= 0 || size > MAX_FILE_SIZE) fail("Tamanho de arquivo inválido.");
  const category = ALLOWED_CATEGORIES.has(clean(input.category, 80)) ? clean(input.category, 80) : "Outros";
  const { data, error } = await db.from("personal_library_files").insert({
    user_id: userId,
    title,
    original_file_name: safeFileName(clean(input.originalFileName, 160)),
    storage_path: path,
    file_size: size,
    mime_type: PDF_MIME,
    category,
    author: clean(input.author, 180) || null,
    notes: clean(input.notes, 1500) || null,
  }).select("id,title,original_file_name,storage_path,file_size,mime_type,category,author,notes,created_at,updated_at").single();
  if (error) {
    await db.storage.from(BUCKET).remove([path]);
    fail("Não foi possível salvar o PDF na sua biblioteca.");
  }
  return data;
}

export async function listPersonalLibraryFiles(userId: string) {
  const { data, error } = await db.from("personal_library_files")
    .select("id,title,original_file_name,storage_path,file_size,mime_type,category,author,notes,created_at,updated_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(MAX_FILES);
  if (error) fail("Não foi possível carregar sua biblioteca pessoal.");
  return { files: data ?? [], maxFileSize: MAX_FILE_SIZE, maxFiles: MAX_FILES };
}

export async function openPersonalLibraryFile(userId: string, id: string) {
  const { data: file, error } = await db.from("personal_library_files").select("storage_path").eq("id", id).eq("user_id", userId).maybeSingle();
  if (error || !file?.storage_path) fail("PDF não encontrado.");
  const { data, error: urlError } = await db.storage.from(BUCKET).createSignedUrl(file.storage_path, 600);
  if (urlError || !data?.signedUrl) fail("Não foi possível abrir o PDF.");
  return { url: data.signedUrl };
}

export async function updatePersonalLibraryFile(userId: string, input: { id: string; title?: string; category?: string; author?: string; notes?: string }) {
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (input.title !== undefined) {
    const title = clean(input.title, 220);
    if (!title) fail("O título não pode ficar vazio.");
    patch.title = title;
  }
  if (input.category !== undefined) patch.category = ALLOWED_CATEGORIES.has(clean(input.category, 80)) ? clean(input.category, 80) : "Outros";
  if (input.author !== undefined) patch.author = clean(input.author, 180) || null;
  if (input.notes !== undefined) patch.notes = clean(input.notes, 1500) || null;
  const { error } = await db.from("personal_library_files").update(patch).eq("id", input.id).eq("user_id", userId);
  if (error) fail("Não foi possível atualizar o PDF.");
  return { ok: true as const };
}

export async function deletePersonalLibraryFile(userId: string, id: string) {
  const { data: file, error } = await db.from("personal_library_files").select("storage_path").eq("id", id).eq("user_id", userId).maybeSingle();
  if (error || !file?.storage_path) fail("PDF não encontrado.");
  const { error: storageError } = await db.storage.from(BUCKET).remove([file.storage_path]);
  if (storageError) fail("Não foi possível excluir o arquivo armazenado.");
  const { error: deleteError } = await db.from("personal_library_files").delete().eq("id", id).eq("user_id", userId);
  if (deleteError) fail("Não foi possível remover o PDF da biblioteca.");
  return { ok: true as const };
}

import { createHash, randomBytes } from "node:crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const database = supabaseAdmin as any;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function supportIdentity(context: any) {
  const { data, error } = await context.supabase.auth.getUser(context.accessToken ?? undefined);
  const user = data?.user;
  if (error || !user || user.id !== context.userId || !user.email || !user.email_confirmed_at) {
    throw new Error("Acesso ao suporte não autorizado.");
  }
  return { userId: user.id, email: user.email.trim().toLowerCase() };
}

export async function ownedSupportContact(db: any, email: string, id: string) {
  if (!UUID.test(id)) throw new Error("Solicitação não encontrada.");
  const { data, error } = await db.from("ecosystem_contacts")
    .select("id,protocol,subject,status,message,created_at,updated_at,email")
    .eq("id", id).eq("email", email).maybeSingle();
  if (error || !data) throw new Error("Solicitação não encontrada.");
  return data;
}

export async function listSupportConversations(context: any, db = database) {
  const identity = await supportIdentity(context);
  const { data: contacts, error } = await db.from("ecosystem_contacts")
    .select("id,protocol,subject,status,created_at,updated_at")
    .eq("email", identity.email).order("updated_at", { ascending: false }).limit(50);
  if (error) throw new Error("Não foi possível carregar o suporte.");
  if (!contacts?.length) return [];
  const { data: replies, error: replyError } = await db.from("ecosystem_contact_messages")
    .select("contact_id,created_at").in("contact_id", contacts.map((c: any) => c.id))
    .eq("direction", "outbound").order("created_at", { ascending: false }).limit(2000);
  if (replyError) throw new Error("Não foi possível carregar as respostas.");
  const latest = new Map<string, string>();
  for (const reply of replies ?? []) if (!latest.has(reply.contact_id)) latest.set(reply.contact_id, reply.created_at);
  return contacts.map((contact: any) => ({ ...contact, lastReplyAt: latest.get(contact.id) ?? null }));
}

export async function readSupportConversation(context: any, id: string, db = database) {
  const identity = await supportIdentity(context);
  const contact = await ownedSupportContact(db, identity.email, id);
  const [messageResult, attachmentResult] = await Promise.all([
    db.from("ecosystem_contact_messages").select("id,direction,body,created_at")
      .eq("contact_id", contact.id).order("created_at", { ascending: false }).limit(200),
    db.from("ecosystem_contact_attachments").select("id,direction,original_name,mime_type,size_bytes,created_at")
      .eq("contact_id", contact.id).order("created_at", { ascending: true }).limit(100),
  ]);
  if (messageResult.error || attachmentResult.error) throw new Error("Não foi possível carregar a conversa.");
  const { email: _email, ...safeContact } = contact;
  return { contact: safeContact, messages: (messageResult.data ?? []).reverse(), attachments: attachmentResult.data ?? [] };
}

export async function sendSupportMessage(context: any, input: { id: string; body: string }, db = database) {
  const identity = await supportIdentity(context);
  const body = typeof input.body === "string" ? input.body.trim() : "";
  if (!body || body.length > 4000) throw new Error("Escreva uma mensagem de até 4.000 caracteres.");
  const contact = await ownedSupportContact(db, identity.email, input.id);
  const { error } = await db.from("ecosystem_contact_messages").insert({
    contact_id: contact.id, direction: "inbound", channel: "admin", body,
    sender: identity.email, recipient: "LDR", created_by: identity.userId,
  });
  if (error) throw new Error("Não foi possível enviar a mensagem. Tente novamente.");
  // The message is already persisted. A failed status update must not invite a duplicate send.
  const { error: statusError } = await db.from("ecosystem_contacts")
    .update({ status: "em_atendimento", resolved_at: null, updated_at: new Date().toISOString() }).eq("id", contact.id);
  if (statusError) console.warn("[support] Message saved; status update pending");
  return { ok: true };
}

export async function supportAttachmentUrl(context: any, id: string, db = database) {
  const identity = await supportIdentity(context);
  if (!UUID.test(id)) throw new Error("Arquivo não encontrado.");
  const { data: file, error } = await db.from("ecosystem_contact_attachments")
    .select("contact_id,storage_path").eq("id", id).maybeSingle();
  if (error || !file) throw new Error("Arquivo não encontrado.");
  await ownedSupportContact(db, identity.email, file.contact_id);
  const { data, error: signedError } = await db.storage.from("ecosystem-support-private").createSignedUrl(file.storage_path, 300);
  if (signedError || !data?.signedUrl) throw new Error("Não foi possível abrir o arquivo.");
  return data.signedUrl;
}

export async function supportUploadAuthorization(context: any, id: string, db = database) {
  const identity = await supportIdentity(context);
  const contact = await ownedSupportContact(db, identity.email, id);
  const token = randomBytes(32).toString("hex");
  const { error } = await db.from("ecosystem_contacts").update({
    upload_token_hash: createHash("sha256").update(token).digest("hex"),
    upload_token_expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
  }).eq("id", contact.id);
  if (error) throw new Error("Não foi possível autorizar o anexo.");
  return { protocol: contact.protocol, uploadToken: token };
}

import type { SupabaseClient } from "@supabase/supabase-js";

import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { Database } from "@/integrations/supabase/types";
import { resolveAccess } from "@/lib/access.server";
import { postgraduateCourseTitle } from "@/lib/postgraduate-interest.catalog";

type Client = SupabaseClient<Database>;
const db = supabaseAdmin as unknown as { from: (table: string) => any };
const ALLOWED_STATUSES = ["new", "contacted", "qualified", "converted", "archived"] as const;

function fail(message: string): never {
  throw new Error(message);
}

async function requireSuperadmin(supabase: Client, userId: string) {
  const access = await resolveAccess(supabase, userId);
  if (!access.authorized || access.role !== "superadmin") fail("Acesso negado.");
}

function normalize(input: { courseKey: string; fullName: string; email: string; phone: string }) {
  const courseKey = input.courseKey.trim();
  const courseTitle = postgraduateCourseTitle(courseKey);
  const fullName = input.fullName.trim().replace(/\s+/g, " ");
  const email = input.email.trim().toLowerCase();
  const phone = input.phone.trim();
  if (!courseTitle) fail("Curso inválido.");
  if (fullName.length < 2 || fullName.length > 160) fail("Informe seu nome completo.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) fail("Informe um e-mail válido.");
  if (phone.replace(/\D/g, "").length < 7 || phone.length > 40) fail("Informe um telefone válido.");
  return { courseKey, courseTitle, fullName, email, phone };
}

export async function submitPostgraduateInterest(
  userId: string,
  input: { courseKey: string; fullName: string; email: string; phone: string },
) {
  const value = normalize(input);
  const { data: existing, error: lookupError } = await db
    .from("postgraduate_interest_leads")
    .select("id")
    .eq("course_key", value.courseKey)
    .ilike("email", value.email)
    .maybeSingle();
  if (lookupError) fail("Não foi possível registrar seu interesse agora.");

  if (existing?.id) {
    const { error } = await db
      .from("postgraduate_interest_leads")
      .update({
        user_id: userId,
        course_title: value.courseTitle,
        full_name: value.fullName,
        email: value.email,
        phone: value.phone,
        status: "new",
        source: "biblioteca_ldr",
      })
      .eq("id", existing.id);
    if (error) fail("Não foi possível registrar seu interesse agora.");
    return { ok: true as const, updated: true as const };
  }

  const { error } = await db.from("postgraduate_interest_leads").insert({
    user_id: userId,
    course_key: value.courseKey,
    course_title: value.courseTitle,
    full_name: value.fullName,
    email: value.email,
    phone: value.phone,
    status: "new",
    source: "biblioteca_ldr",
  });
  if (error) fail("Não foi possível registrar seu interesse agora.");
  return { ok: true as const, updated: false as const };
}

export async function listPostgraduateInterests(supabase: Client, userId: string) {
  await requireSuperadmin(supabase, userId);
  const { data, error } = await db
    .from("postgraduate_interest_leads")
    .select("id,user_id,course_key,course_title,full_name,email,phone,status,source,created_at,updated_at")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) fail("Não foi possível carregar os interessados.");
  return data ?? [];
}

export async function updatePostgraduateInterestStatus(
  supabase: Client,
  userId: string,
  input: { id: string; status: string },
) {
  await requireSuperadmin(supabase, userId);
  if (!ALLOWED_STATUSES.includes(input.status as (typeof ALLOWED_STATUSES)[number])) fail("Status inválido.");
  const { error } = await db
    .from("postgraduate_interest_leads")
    .update({ status: input.status })
    .eq("id", input.id);
  if (error) fail("Não foi possível atualizar este interessado.");
  return { ok: true as const };
}

import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function requireMaster(supabase: any, userId: string) {
  const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "superadmin").maybeSingle();
  if (error || !data) throw new Error("Acesso restrito");
}

export const listEcosystemContacts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireMaster(context.supabase, context.user.id);
    const { data, error } = await context.supabase.from("ecosystem_contacts").select("*").order("created_at", { ascending: false }).limit(500);
    if (error) throw error;
    return data ?? [];
  });

export const updateEcosystemContact = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; status: "novo" | "em_atendimento" | "aguardando_cliente" | "respondido" | "resolvido" }) => data)
  .handler(async ({ context, data }) => {
    await requireMaster(context.supabase, context.userId);
    const patch: Record<string, unknown> = { status: data.status, updated_at: new Date().toISOString() };
    if (data.status === "respondido") patch.first_response_at = new Date().toISOString();
    if (data.status === "resolvido") patch.resolved_at = new Date().toISOString();
    const { error } = await context.supabase.from("ecosystem_contacts").update(patch).eq("id", data.id);
    if (error) throw error;
    return { ok: true as const };
  });

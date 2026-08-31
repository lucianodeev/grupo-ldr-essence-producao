import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function requireProfessional(context: any) {
  const { resolveAccess } = await import("@/lib/access.server");
  const access = await resolveAccess(context.supabase, context.userId);
  if (!access.authorized) throw new Error("Acesso negado.");
  return access;
}

export const professionalOrganizations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireProfessional(context);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const db = supabaseAdmin as unknown as { from: (table: string) => any };
    const [{ data: organizations }, { data: members }, { data: purchases }, { data: benefits }] = await Promise.all([
      db.from("organizations").select("id,name,billing_email,country,phone,tax_id,active,created_at").order("created_at", { ascending: false }),
      db.from("organization_members").select("id,organization_id,full_name,email,department,employee_code,portal_active,created_at").order("full_name"),
      db.from("organization_purchases").select("id,organization_id,order_id,catalog_key,quantity,status,created_at").order("created_at", { ascending: false }).limit(100),
      db.from("organization_benefit_allocations").select("id,organization_id,member_id,catalog_key,credits_granted,credits_used,status,purchase_id,requested_at,used_at,created_at").order("created_at", { ascending: false }).limit(500),
    ]);
    const keys = [...new Set([...(purchases ?? []).map((p: any) => p.catalog_key), ...(benefits ?? []).map((b: any) => b.catalog_key)])];
    const { data: catalog } = keys.length ? await db.from("service_catalog").select("catalog_key,name").in("catalog_key", keys) : { data: [] };
    return { organizations: organizations ?? [], members: members ?? [], purchases: purchases ?? [], benefits: benefits ?? [], catalog: catalog ?? [] };
  });

export const professionalCompleteOrganizationBenefit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { benefitId: string }) => data)
  .handler(async ({ context, data }) => {
    await requireProfessional(context);
    const benefitId = String(data.benefitId ?? "").trim();
    if (!benefitId) throw new Error("Benefício inválido.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const db = supabaseAdmin as unknown as { from: (table: string) => any };
    const { data: benefit, error } = await db.from("organization_benefit_allocations")
      .select("id,organization_id,member_id,catalog_key,credits_granted,credits_used,status")
      .eq("id", benefitId)
      .maybeSingle();
    if (error || !benefit) throw new Error("Benefício não encontrado.");
    if (benefit.status !== "requested") throw new Error("Este benefício não está aguardando conclusão.");

    const granted = Math.max(Number(benefit.credits_granted ?? 0), 0);
    const currentUsed = Math.max(Number(benefit.credits_used ?? 0), 0);
    if (!granted || currentUsed >= granted) throw new Error("Este benefício não possui crédito disponível.");

    const nextUsed = currentUsed + 1;
    const nextStatus = nextUsed >= granted ? "used" : "assigned";
    const now = new Date().toISOString();
    const { data: updated, error: updateError } = await db.from("organization_benefit_allocations")
      .update({ credits_used: nextUsed, status: nextStatus, used_at: now, requested_at: null })
      .eq("id", benefitId)
      .eq("status", "requested")
      .eq("credits_used", currentUsed)
      .select("id,status,credits_granted,credits_used")
      .maybeSingle();
    if (updateError || !updated) throw new Error("O benefício foi alterado por outra operação. Atualize a página e tente novamente.");

    try {
      const actorEmail = typeof context.claims?.email === "string" ? context.claims.email : null;
      await db.from("audit_logs").insert({
        actor_id: context.userId,
        actor_email: actorEmail,
        action: "organization.benefit_completed",
        target: benefitId,
        details: { organization_id: benefit.organization_id, member_id: benefit.member_id, catalog_key: benefit.catalog_key, credits_used: nextUsed, credits_granted: granted, next_status: nextStatus },
      });
    } catch {
      /* auditoria não bloqueia a conclusão */
    }

    return { ok: true as const, status: nextStatus, creditsUsed: nextUsed, creditsGranted: granted };
  });

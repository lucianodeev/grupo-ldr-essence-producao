import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const professionalOrganizations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { resolveAccess } = await import("@/lib/access.server");
    const access = await resolveAccess(context.supabase, context.userId);
    if (!access.authorized) throw new Error("Acesso negado.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const db = supabaseAdmin as unknown as { from: (table: string) => any };
    const [{ data: organizations }, { data: members }, { data: purchases }, { data: benefits }] = await Promise.all([
      db.from("organizations").select("id,name,billing_email,country,phone,tax_id,active,created_at").order("created_at", { ascending: false }),
      db.from("organization_members").select("id,organization_id,full_name,email,department,employee_code,portal_active,created_at").order("full_name"),
      db.from("organization_purchases").select("id,organization_id,order_id,catalog_key,quantity,status,created_at").order("created_at", { ascending: false }).limit(100),
      db.from("organization_benefit_allocations").select("id,organization_id,member_id,catalog_key,credits_granted,credits_used,status,purchase_id,created_at").order("created_at", { ascending: false }).limit(500),
    ]);
    const keys = [...new Set([...(purchases ?? []).map((p: any) => p.catalog_key), ...(benefits ?? []).map((b: any) => b.catalog_key)])];
    const { data: catalog } = keys.length ? await db.from("service_catalog").select("catalog_key,name").in("catalog_key", keys) : { data: [] };
    return { organizations: organizations ?? [], members: members ?? [], purchases: purchases ?? [], benefits: benefits ?? [], catalog: catalog ?? [] };
  });

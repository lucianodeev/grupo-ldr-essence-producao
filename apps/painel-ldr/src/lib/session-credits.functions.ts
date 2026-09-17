import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listSessionCredits = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { resolveAccess } = await import("@/lib/access.server");
    const access = await resolveAccess(context.supabase, context.userId);
    if (!access.authorized) throw new Error("Acesso negado.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("session_credits")
      .select("*");

    if (error) throw new Error("Não foi possível carregar os créditos.");
    return data ?? [];
  });

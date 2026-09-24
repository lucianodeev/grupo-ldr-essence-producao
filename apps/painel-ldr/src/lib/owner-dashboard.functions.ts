import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function masterEdgeSummary(accessToken: string | null | undefined) {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key || !accessToken) throw new Error("Sessão Master inválida.");
  const response = await fetch(`${url.replace(/\/$/, "")}/functions/v1/master-panel-self`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      apikey: key,
      authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ operation: "summary" }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(response.status === 403 ? "Acesso negado." : "Não foi possível carregar os indicadores do Painel Master.");
  return body;
}

export const ownerDashboardSummary = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    if (!process.env["SUPABASE_SERVICE_ROLE_KEY"]) {
      return masterEdgeSummary(context.accessToken);
    }
    const { getOwnerDashboardSummary } = await import("@/lib/owner-dashboard.server");
    return getOwnerDashboardSummary(context.supabase, context.userId);
  });

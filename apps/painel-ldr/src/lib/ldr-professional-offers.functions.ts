import { createServerFn } from "@tanstack/react-start";
import { MENTORSHIP_CATALOG_KEYS } from "@/lib/ldr-professional-offers";

export type MentorshipPackage = {
  key: string;
  name: string;
  cents: number;
  currency: string;
  sessions: number;
};

export const publicMentorshipPackages = createServerFn({ method: "GET" }).handler(
  async (): Promise<MentorshipPackage[]> => {
    if (!process.env["SUPABASE_URL"] || !process.env["SUPABASE_SERVICE_ROLE_KEY"]) return [];
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("service_catalog")
      .select("catalog_key, name, amount_cents, currency, package_sessions, billing_model")
      .in("catalog_key", MENTORSHIP_CATALOG_KEYS)
      .eq("active", true)
      .in("billing_model", ["single_paid_session", "package_sessions"])
      .in("currency", ["EUR", "BRL"])
      .gt("amount_cents", 0)
      .order("amount_cents");
    if (error || !data) return [];
    return data.flatMap((row) => {
      const sessions = row.billing_model === "single_paid_session" ? 1 : row.package_sessions;
      return sessions && sessions > 0
        ? [
            {
              key: row.catalog_key,
              name: row.name,
              cents: row.amount_cents,
              currency: row.currency,
              sessions,
            },
          ]
        : [];
    });
  },
);

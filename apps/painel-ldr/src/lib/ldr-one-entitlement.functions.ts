import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** The client may display this status; protected content must independently check entitlements server-side. */
export const clientLdrOneEntitlement = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { getLdrOneEntitlement } = await import("@/lib/ldr-one-entitlement.server");
    const email = typeof context.claims.email === "string" ? context.claims.email : null;
    return getLdrOneEntitlement(context.userId, email);
  });

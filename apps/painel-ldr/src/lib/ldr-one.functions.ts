import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { LDR_ONE_LAUNCH_ENABLED } from "@/lib/ldr-one.catalog";

function emailOf(claims: Record<string, unknown>) {
  return typeof claims.email === "string" ? claims.email : null;
}

/** Checkout stays disabled until the LDR ONE migration, webhook and entitlement tests pass. */
export const clientCreateLdrOneCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { audience: "individual" | "business"; billing: "monthly" | "annual"; seats?: number }) => data)
  .handler(async ({ context, data }) => {
    if (!LDR_ONE_LAUNCH_ENABLED) throw new Error("LDR ONE ainda não está disponível para contratação.");
    if (!["individual", "business"].includes(data.audience) || !["monthly", "annual"].includes(data.billing))
      throw new Error("Plano ou periodicidade inválidos.");
    const seats = data.audience === "individual" ? 1 : data.seats;
    if (!Number.isSafeInteger(seats) || !seats || (data.audience === "business" && (seats < 5 || seats > 10000)))
      throw new Error("Informe entre 5 e 10.000 colaboradores.");
    const { createLdrOneCheckout } = await import("@/lib/ldr-one-checkout.server");
    return createLdrOneCheckout({ userId: context.userId, email: emailOf(context.claims), audience: data.audience, billing: data.billing, seats });
  });

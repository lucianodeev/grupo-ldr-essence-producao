import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

function emailOf(claims: Record<string, unknown>): string | null {
  const value = claims["email"];
  return typeof value === "string" ? value : null;
}

export const clientDoMamaoTrainingOffer = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { getDoMamaoTrainingOffer } = await import("@/lib/training-commerce.server");
    return getDoMamaoTrainingOffer(context.userId, emailOf(context.claims));
  });

export const clientCreateDoMamaoTrainingCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { market: "BR" | "INTL" }) => data)
  .handler(async ({ context, data }) => {
    const { createDoMamaoTrainingCheckout } = await import("@/lib/training-commerce.server");
    return createDoMamaoTrainingCheckout(context.userId, emailOf(context.claims), data.market);
  });

export const clientDoMamaoTrainingExperience = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { getDoMamaoTrainingExperience } = await import("@/lib/training-commerce.server");
    return getDoMamaoTrainingExperience(context.userId, emailOf(context.claims));
  });

export const clientSaveDoMamaoTrainingState = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { state: Record<string, unknown> }) => data)
  .handler(async ({ context, data }) => {
    const { saveDoMamaoTrainingState } = await import("@/lib/training-commerce.server");
    return saveDoMamaoTrainingState(context.userId, emailOf(context.claims), data.state);
  });

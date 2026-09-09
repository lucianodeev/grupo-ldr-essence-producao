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

export const clientCreateDoMamaoProjectReviewCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { market: "BR" | "INTL" }) => data)
  .handler(async ({ context, data }) => {
    const { createDoMamaoProjectReviewCheckout } = await import("@/lib/training-commerce.server");
    return createDoMamaoProjectReviewCheckout(context.userId, emailOf(context.claims), data.market);
  });

export const clientDoMamaoTrainingExperience = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { getDoMamaoTrainingExperience } = await import("@/lib/training-commerce.server");
    const result = await getDoMamaoTrainingExperience(context.userId, emailOf(context.claims));

    // The guided route still uses a tiny srcDoc only to hydrate legacy/cloud state.
    // Never send the full legacy training HTML to that iframe: on some mobile Safari
    // builds it could become visible before the utility class was applied, creating
    // a duplicated training interface above the new experience.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { resolveClient } = await import("@/lib/client-portal.server");
    const client = await resolveClient(context.userId, emailOf(context.claims));
    let state: Record<string, unknown> = {};
    if (client.status === "ok") {
      const { data } = await supabaseAdmin
        .from("training_state")
        .select("state")
        .eq("training_id", result.trainingId)
        .eq("customer_id", client.customer.id)
        .maybeSingle();
      if (data?.state && typeof data.state === "object") state = data.state as Record<string, unknown>;
    }
    const serialized = JSON.stringify(state).replace(/</g, "\\u003c").replace(/-->/g, "--\\u003e");
    const hydrationHtml = `<!doctype html><html><head><meta charset="utf-8"><style>html,body{display:none!important;width:0!important;height:0!important;margin:0!important;overflow:hidden!important}</style></head><body><script>try{if(window.frameElement){window.frameElement.hidden=true;window.frameElement.style.cssText='display:none!important;width:0!important;height:0!important;border:0!important;position:absolute!important;pointer-events:none!important'}localStorage.setItem('ldr_training_v3_library_ready',JSON.stringify(${serialized}));}catch(e){}</script></body></html>`;
    return { ...result, html: hydrationHtml };
  });

export const clientSubmitDoMamaoProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { title: string; projectUrl?: string | null; projectText?: string | null }) => data)
  .handler(async ({ context, data }) => {
    const { submitDoMamaoProject } = await import("@/lib/training-commerce.server");
    return submitDoMamaoProject(context.userId, emailOf(context.claims), data);
  });

export const clientSaveDoMamaoTrainingState = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { state: Record<string, unknown> }) => data)
  .handler(async ({ context, data }) => {
    const { saveDoMamaoTrainingState } = await import("@/lib/training-commerce.server");
    return saveDoMamaoTrainingState(context.userId, emailOf(context.claims), data.state);
  });
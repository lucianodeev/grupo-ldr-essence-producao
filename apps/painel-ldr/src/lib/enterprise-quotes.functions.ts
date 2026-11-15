import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { acceptQuoteSchema, quoteDraftSchema, quoteIdSchema } from "@/lib/enterprise-quotes.schemas";

export const listMasterQuotes = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => quoteIdSchema.parse(data)).handler(async ({ context, data }) => {
    const { masterQuotes } = await import("@/lib/enterprise-quotes.server"); return masterQuotes(context, data.id);
  });
export const prepareMasterQuote = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => quoteDraftSchema.parse(data)).handler(async ({ context, data }) => {
    const { createQuoteDraft } = await import("@/lib/enterprise-quotes.server"); return createQuoteDraft(context, data);
  });
export const approveMasterQuote = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => quoteIdSchema.parse(data)).handler(async ({ context, data }) => {
    const { approveQuote } = await import("@/lib/enterprise-quotes.server"); return approveQuote(context, data);
  });
export const listMyQuotes = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { myQuotes } = await import("@/lib/enterprise-quotes.server"); return myQuotes(context);
});
export const acceptMyQuote = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => acceptQuoteSchema.parse(data)).handler(async ({ context, data }) => {
    const { acceptAndPayQuote } = await import("@/lib/enterprise-quotes.server"); return acceptAndPayQuote(context, data);
  });

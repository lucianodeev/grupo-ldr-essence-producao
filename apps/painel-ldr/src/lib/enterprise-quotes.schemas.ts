import { z } from "zod";

export const quoteIdSchema = z.object({ id: z.string().uuid() }).strict();
export const quoteDraftSchema = z.object({
  contactId: z.string().uuid(), requestId: z.string().uuid(),
  title: z.string().trim().min(5).max(160),
  scope: z.string().trim().min(10).max(3000),
  amountCents: z.number().int().min(50).max(100_000_000),
  currency: z.enum(["EUR", "BRL"]),
  // A session quote must use an existing, active session product. Projects have no calendar credit.
  catalogKey: z.string().trim().min(1).max(100).nullable(),
  validDays: z.number().int().min(1).max(90),
}).strict();
export type QuoteDraft = z.infer<typeof quoteDraftSchema>;

export const acceptQuoteSchema = z.object({ id: z.string().uuid(), accepted: z.literal(true) }).strict();

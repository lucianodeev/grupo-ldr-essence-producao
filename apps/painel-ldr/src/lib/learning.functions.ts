import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

function emailOf(claims: Record<string, unknown>): string | null {
  const value = claims["email"];
  return typeof value === "string" ? value : null;
}

export const clientLearningHub = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { getClientLearningHub } = await import("@/lib/learning.server");
  return getClientLearningHub(context.userId, emailOf(context.claims));
});

export const clientAddLibraryComment = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data: { body: string; productKey?: string | null; trainingId?: string | null; parentId?: string | null }) => data).handler(async ({ context, data }) => {
  const { addClientLibraryComment } = await import("@/lib/learning.server");
  return addClientLibraryComment(context.userId, emailOf(context.claims), data);
});

export const clientDeleteLibraryComment = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data: { commentId: string }) => data).handler(async ({ context, data }) => {
  const { deleteClientLibraryComment } = await import("@/lib/learning.server");
  return deleteClientLibraryComment(context.userId, emailOf(context.claims), data);
});

export const clientSaveProgress = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data: { productKey: string; progressPercent: number; currentLocation?: string | null }) => data).handler(async ({ context, data }) => {
  const { saveClientProgress } = await import("@/lib/learning.server");
  return saveClientProgress(context.userId, emailOf(context.claims), data);
});

export const professionalLearningHub = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { getProfessionalLearningHub } = await import("@/lib/learning.server");
  return getProfessionalLearningHub(context.userId);
});

export const professionalReplyLibraryComment = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data: { commentId: string; body: string }) => data).handler(async ({ context, data }) => {
  const { professionalReplyComment } = await import("@/lib/learning.server");
  return professionalReplyComment(context.userId, data);
});

export const professionalDeleteLibraryComment = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data: { commentId: string }) => data).handler(async ({ context, data }) => {
  const { professionalDeleteLibraryComment } = await import("@/lib/learning.server");
  return professionalDeleteLibraryComment(context.userId, data);
});

export const professionalSetClientCommentDelete = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data: { enabled: boolean }) => data).handler(async ({ context, data }) => {
  const { professionalSetClientCommentDeleteEnabled } = await import("@/lib/learning.server");
  return professionalSetClientCommentDeleteEnabled(context.userId, data);
});

export const professionalCreateTraining = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data: { title: string; description?: string | null; slug: string }) => data).handler(async ({ context, data }) => {
  const { professionalCreateTraining } = await import("@/lib/learning.server");
  return professionalCreateTraining(context.userId, data);
});

export const professionalAddTrainingItem = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data: { kind: "module" | "material" | "live" | "announcement"; trainingId: string; title: string; description?: string | null; moduleId?: string | null; materialType?: "link" | "pdf" | "video" | "text" | "file"; url?: string | null; body?: string | null; startsAt?: string | null; endsAt?: string | null; meetingUrl?: string | null }) => data).handler(async ({ context, data }) => {
  const { professionalAddTrainingItem } = await import("@/lib/learning.server");
  return professionalAddTrainingItem(context.userId, data);
});

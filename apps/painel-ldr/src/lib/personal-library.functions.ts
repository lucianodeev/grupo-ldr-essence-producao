import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const clientPersonalLibraryFiles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { listPersonalLibraryFiles } = await import("@/lib/personal-library.server");
    return listPersonalLibraryFiles(context.userId);
  });

export const clientCreatePersonalLibraryUploadUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { fileName: string; contentType: string; size: number }) => data)
  .handler(async ({ context, data }) => {
    const { createPersonalLibraryUploadUrl } = await import("@/lib/personal-library.server");
    return createPersonalLibraryUploadUrl(context.userId, data);
  });

export const clientRegisterPersonalLibraryFile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { path: string; title: string; originalFileName: string; size: number; category?: string; author?: string; notes?: string }) => data)
  .handler(async ({ context, data }) => {
    const { registerPersonalLibraryFile } = await import("@/lib/personal-library.server");
    return registerPersonalLibraryFile(context.userId, data);
  });

export const clientOpenPersonalLibraryFile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ context, data }) => {
    const { openPersonalLibraryFile } = await import("@/lib/personal-library.server");
    return openPersonalLibraryFile(context.userId, data.id);
  });

export const clientUpdatePersonalLibraryFile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; title?: string; category?: string; author?: string; notes?: string }) => data)
  .handler(async ({ context, data }) => {
    const { updatePersonalLibraryFile } = await import("@/lib/personal-library.server");
    return updatePersonalLibraryFile(context.userId, data);
  });

export const clientDeletePersonalLibraryFile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ context, data }) => {
    const { deletePersonalLibraryFile } = await import("@/lib/personal-library.server");
    return deletePersonalLibraryFile(context.userId, data.id);
  });

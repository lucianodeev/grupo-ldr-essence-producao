import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { AcademyReadingEdition } from "@/lib/academy-reading-editions";
import { ACADEMY_READING_PROGRESS_PREFIX } from "@/lib/academy-reading-progress-key";
import { resolveClient } from "@/lib/client-portal.server";

export async function loadAcademyReadingProgress(
  userId: string,
  email: string | null,
  edition: AcademyReadingEdition,
  completedUnit?: string,
): Promise<string[]> {
  const keyFor = (id: string) =>
    ACADEMY_READING_PROGRESS_PREFIX + encodeURIComponent(edition.editionId) + ":" + encodeURIComponent(id);
  const units = new Map(edition.modules.map(({ id }) => [id, keyFor(id)]));
  const resolved = await resolveClient(userId, email);
  if (resolved.status !== "ok") throw new Error("Acesso negado.");

  if (completedUnit !== undefined) {
    const key = units.get(completedUnit);
    if (!key) throw new Error("Unidade inválida.");
    // Independent rows merge completions from other tabs and devices without overwriting them.
    const { error } = await supabaseAdmin.from("library_progress").upsert(
      { customer_id: resolved.customer.id, product_key: key, progress_percent: 100 },
      { onConflict: "customer_id,product_key", ignoreDuplicates: true },
    );
    if (error) throw new Error("Não foi possível guardar a conclusão.");
  }

  const { data, error } = await supabaseAdmin.from("library_progress")
    .select("product_key")
    .eq("customer_id", resolved.customer.id)
    .eq("progress_percent", 100)
    .in("product_key", [...units.values()]);
  if (error) throw new Error("Não foi possível consultar o progresso.");
  const completed = new Set(data.map(({ product_key }) => product_key));
  return [...units].filter(([, key]) => completed.has(key)).map(([id]) => id);
}

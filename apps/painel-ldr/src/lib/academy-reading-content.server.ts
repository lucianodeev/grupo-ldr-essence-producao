import { createHash } from "node:crypto";
import {
  CUSTOMER_SERVICE_READING_SLUG,
  isApprovedReadingEdition,
  isReleasedAcademyPracticeGuide,
  type AcademyReadingEdition,
} from "./academy-reading-editions";

/** Authorization is resolved on the server before loading any teaching body. */
export async function getProtectedAcademyReadingEdition(
  userId: string,
  slug: string,
  authorize: (productKey: string) => Promise<{ allowed: boolean }>,
): Promise<{ allowed: boolean; edition: AcademyReadingEdition | null }> {
  if (!userId) throw new Error("Sessão inválida.");
  if (slug !== CUSTOMER_SERVICE_READING_SLUG) throw new Error("Edição não encontrada.");
  const productKey = "curso_assinatura_atendimento_ao_cliente_com_humanizacao_e_resultado";
  const decision = await authorize(productKey);
  if (!decision.allowed) return { allowed: false, edition: null };
  const { CUSTOMER_SERVICE_READING_EDITION: edition } =
    await import("@/content/academy-reading/customer-service-release.server");
  if (
    edition.slug !== slug ||
    edition.productKey !== productKey ||
    !isApprovedReadingEdition(edition) ||
    edition.modules.length !== 6 ||
    edition.modules.some(
      (module) => createHash("sha256").update(module.body).digest("hex") !== module.sha256,
    )
  ) {
    throw new Error("Não foi possível validar a edição de leitura.");
  }
  const { CUSTOMER_SERVICE_PRACTICE_GUIDE: practiceGuide } =
    await import("@/content/academy-reading/customer-service-practice.server");
  if (!isReleasedAcademyPracticeGuide(practiceGuide, edition) ||
    practiceGuide.modules.some(module => createHash("sha256").update(module.body).digest("hex") !== module.sha256)) {
    throw new Error("Não foi possível validar o percurso de prática.");
  }
  return { allowed: true, edition: { ...edition, practiceGuide } };
}

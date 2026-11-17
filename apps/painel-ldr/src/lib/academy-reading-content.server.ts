import { getAcademyCourseReadingMetadata } from "./academy-course-reading-catalog";
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
  const metadata = getAcademyCourseReadingMetadata(slug);
  if (slug !== CUSTOMER_SERVICE_READING_SLUG && !metadata) throw new Error("Edição não encontrada.");
  const productKey = metadata?.productKey ?? "curso_assinatura_atendimento_ao_cliente_com_humanizacao_e_resultado";
  const decision = await authorize(productKey);
  if (!decision.allowed) return { allowed: false, edition: null };
  if (metadata) {
    const { RELEASED_COURSE_READING_EDITIONS } =
      await import("@/content/academy-reading/courses-reading-release.server");
    const edition = RELEASED_COURSE_READING_EDITIONS.find(item => item.slug === slug);
    if (!edition || edition.productKey !== productKey || !isApprovedReadingEdition(edition) ||
      edition.modules.length !== metadata.moduleCount ||
      edition.modules.some(module => createHash("sha256").update(module.body).digest("hex") !== module.sha256)) {
      throw new Error("Não foi possível validar a edição de leitura.");
    }
    return { allowed: true, edition };
  }
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

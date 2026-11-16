/** Reading editions supplement the historical curriculum; they never migrate its progress. */
export type AcademyReadingEdition = {
  schema: "ldr-academy-reading-edition-v1";
  slug: string;
  productKey: string;
  editionId: string;
  locale: "pt";
  status: "draft" | "approved";
  published: boolean;
  validatedHours: number | null;
  releaseMode?: "reading-only";
  certificate?: false;
  estimatedReadingMinutes?: { min: number; max: number; wordsPerMinute: [number, number] };
  review: Record<
    "pedagogy" | "editorial" | "rights" | "accessibility" | "workload" | "reader",
    boolean
  >;
  approval: { reviewer: string; reviewedAt: string } | null;
  modules: {
    id: string;
    title: string;
    format: "markdown";
    body: string;
    sha256: string;
    sourceSha256?: string;
  }[];
};

export function isApprovedReadingEdition(edition: AcademyReadingEdition): boolean {
  const reviews = [
    "pedagogy",
    "editorial",
    "rights",
    "accessibility",
    "workload",
    "reader",
  ] as const;
  return (
    edition.schema === "ldr-academy-reading-edition-v1" &&
    edition.status === "approved" &&
    edition.published === true &&
    Boolean(edition.approval?.reviewer.trim()) &&
    Boolean(
      edition.approval?.reviewedAt && Number.isFinite(Date.parse(edition.approval.reviewedAt)),
    ) &&
    reviews.every((key) => edition.review?.[key] === true) &&
    (edition.releaseMode === "reading-only"
      ? edition.validatedHours === null &&
        edition.certificate === false &&
        Boolean(
          edition.estimatedReadingMinutes &&
          Number.isFinite(edition.estimatedReadingMinutes.min) &&
          edition.estimatedReadingMinutes.min > 0 &&
          Number.isFinite(edition.estimatedReadingMinutes.max) &&
          edition.estimatedReadingMinutes.max >= edition.estimatedReadingMinutes.min,
        )
      : typeof edition.validatedHours === "number" &&
        Number.isFinite(edition.validatedHours) &&
        edition.validatedHours > 0) &&
    Boolean(edition.editionId.trim()) &&
    edition.modules.length > 0 &&
    new Set(edition.modules.map((module) => module.id)).size === edition.modules.length &&
    edition.modules.every(
      (module) =>
        module.id.trim() &&
        module.title.trim() &&
        module.format === "markdown" &&
        module.body.trim() &&
        /^[a-f0-9]{64}$/.test(module.sha256),
    )
  );
}

// Public metadata only. Teaching bodies are returned by an authenticated server function.
export const CUSTOMER_SERVICE_READING_SLUG = "atendimento-ao-cliente-com-humanizacao-e-resultado";
export function academyReadingTimeLabel(slug: string, locale = "pt"): string | null {
  if (slug !== CUSTOMER_SERVICE_READING_SLUG) return null;
  const labels: Record<string, string> = {
    pt: "6 unidades · leitura estimada: 40–50 min · atividades no próprio ritmo · sem certificado",
    en: "6 units · estimated reading: 40–50 min · self-paced activities · no certificate",
    fr: "6 unités · lecture estimée : 40–50 min · activités à votre rythme · sans certificat",
    es: "6 unidades · lectura estimada: 40–50 min · actividades a tu ritmo · sin certificado",
  };
  return labels[locale] ?? labels["pt"]!;
}

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
  review: Record<
    "pedagogy" | "editorial" | "rights" | "accessibility" | "workload" | "reader",
    boolean
  >;
  approval: { reviewer: string; reviewedAt: string } | null;
  modules: { id: string; title: string; format: "markdown"; body: string; sha256: string }[];
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
    typeof edition.validatedHours === "number" &&
    Number.isFinite(edition.validatedHours) &&
    edition.validatedHours > 0 &&
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

// Pending editorial sources must not be imported into browser bundles.
const approvedEditions: readonly AcademyReadingEdition[] = [];
export function getAcademyReadingEdition(
  slug: string,
  productKey: string,
): AcademyReadingEdition | null {
  return (
    approvedEditions.find(
      (edition) =>
        edition.slug === slug &&
        edition.productKey === productKey &&
        isApprovedReadingEdition(edition),
    ) ?? null
  );
}

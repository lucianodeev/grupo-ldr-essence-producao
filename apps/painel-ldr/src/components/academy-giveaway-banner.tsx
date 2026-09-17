import { AcademyLibraryEcosystemNote } from "@/components/academy-ecosystem-section";

export function AcademyGiveawayBanner({ compact = false }: { compact?: boolean }) {
  if (!compact) return null;
  return <div className="mb-6"><AcademyLibraryEcosystemNote /></div>;
}

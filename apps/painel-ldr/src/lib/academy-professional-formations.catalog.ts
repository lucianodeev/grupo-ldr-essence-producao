import { PROFESSIONAL_FORMATIONS as LEGACY_PROFESSIONAL_FORMATIONS, pfText, type PF, type PFLocale } from "@/lib/professional-formations.catalog";
import { NEW_PROFESSIONAL_FORMATIONS } from "@/lib/new-professional-formations.catalog";
import { HEALTH_PSYCHOANALYSIS_FORMATIONS } from "@/lib/health-psychoanalysis-formations.catalog";
import { TRICHOLOGY_FORMATION } from "@/lib/trichology-formation.catalog";
import { PROJECT_MANAGEMENT_FORMATION } from "@/lib/project-management-formation.catalog";
import { HIV_SCIENCE_FORMATION } from "@/lib/hiv-science-formation.catalog";

export type { PF, PFLocale, PFSlug } from "@/lib/professional-formations.catalog";
export const PROFESSIONAL_FORMATIONS:PF[]=[...LEGACY_PROFESSIONAL_FORMATIONS,...NEW_PROFESSIONAL_FORMATIONS,...HEALTH_PSYCHOANALYSIS_FORMATIONS,...TRICHOLOGY_FORMATION,...PROJECT_MANAGEMENT_FORMATION,...HIV_SCIENCE_FORMATION];
export function getProfessionalFormation(slug:string){return PROFESSIONAL_FORMATIONS.find(x=>x.slug===slug)??null;}
export { pfText };

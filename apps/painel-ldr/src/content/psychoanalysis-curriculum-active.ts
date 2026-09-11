import { autismPsychoanalysisModule } from "@/content/psychoanalysis-autism-module";
import { psychoanalysisCaseStudiesModule } from "@/content/psychoanalysis-case-studies-module";
import { psychoanalysisModules as existingPsychoanalysisModules } from "@/content/psychoanalysis-curriculum";

// Preserve all existing module and lesson IDs so previously saved progress remains valid.
// Autism keeps internal id 13 and Case Studies uses internal id 14; both are displayed by curriculum position in the UI.
export const psychoanalysisModules=[
  ...existingPsychoanalysisModules.slice(0,10),
  autismPsychoanalysisModule,
  psychoanalysisCaseStudiesModule,
  ...existingPsychoanalysisModules.slice(10),
];

export const PSYCHOANALYSIS_TOTAL_LESSONS=psychoanalysisModules.reduce((total,module)=>total+module.lessons.length,0);
export const PSYCHOANALYSIS_TOTAL_MODULES=psychoanalysisModules.length;

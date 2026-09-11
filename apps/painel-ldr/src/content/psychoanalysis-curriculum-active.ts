import { autismPsychoanalysisModule } from "@/content/psychoanalysis-autism-module";
import { psychoanalysisModules as existingPsychoanalysisModules } from "@/content/psychoanalysis-curriculum";

// Preserve all existing module and lesson IDs so previously saved progress remains valid.
// The new autism module uses internal id 13 but is presented as module 11 by its position in the curriculum.
export const psychoanalysisModules=[
  ...existingPsychoanalysisModules.slice(0,10),
  autismPsychoanalysisModule,
  ...existingPsychoanalysisModules.slice(10),
];

export const PSYCHOANALYSIS_TOTAL_LESSONS=psychoanalysisModules.reduce((total,module)=>total+module.lessons.length,0);
export const PSYCHOANALYSIS_TOTAL_MODULES=psychoanalysisModules.length;

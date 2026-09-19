import { ACADEMY_CAREER_JOURNEY_COURSES } from "./academy-career-journey.catalog";
import { ACADEMY_CAREER_JOURNEY_PEDAGOGY } from "./academy-career-journey.pedagogy";
export type JobCompetency={competencyKey:string;label:string;requirementType:"required"|"preferred"};
export type CourseRecommendation={courseSlug:string;matchedCompetencies:string[];reason:string;applicationBlocked:false};
export function recommendCoursesForJob(requirements:JobCompetency[],approvedEvidenceKeys:string[]=[]):CourseRecommendation[]{
 const approved=new Set(approvedEvidenceKeys);
 return ACADEMY_CAREER_JOURNEY_PEDAGOGY.map(p=>{const matched=p.competencyKeys.filter(k=>requirements.some(r=>r.competencyKey===k)&&!approved.has(k));return {courseSlug:p.slug,matchedCompetencies:matched,reason:matched.length?"Desenvolve competência solicitada pela vaga ainda sem evidência aprovada.":"",applicationBlocked:false as const};}).filter(r=>r.matchedCompetencies.length>0);
}
export function buildJobJourneyStages(requirements:JobCompetency[]){
 const recs=recommendCoursesForJob(requirements);
 return recs.map((r,index)=>({stageKey:"learning-"+r.courseSlug,title:ACADEMY_CAREER_JOURNEY_COURSES.find(c=>c.slug===r.courseSlug)?.title??r.courseSlug,stageType:"learning",position:index+1,required:false,metadata:{courseSlug:r.courseSlug,competencyKeys:r.matchedCompetencies,applicationBlocking:false}}));
}
/** Job application is always independent from learning completion. */
export const CAREER_JOB_APPLICATION_RULE={courseCompletionRequired:false,evidenceCanImproveProfile:true,companyCannotSeePrivateReflections:true};
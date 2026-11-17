// Public card metadata only; never exports teaching bodies or historical lesson outlines.
const fs=require('node:fs'),path=require('node:path'),load=require('../apps/painel-ldr/tests/helpers/load-ts.cjs')();
const {ACADEMY_SUBSCRIPTION_COURSES:courses}=load('lib/academy-subscription-courses.catalog.ts');
const {getAcademyCourseReadingMetadata}=load('lib/academy-course-reading-catalog.ts');
const {academyReadingTimeLabel}=load('lib/academy-reading-editions.ts');
function generated(){return '// Generated public card metadata. No lessons, answers or source packets.\nexport const ACADEMY_SUBSCRIBER_COURSE_CARDS = '+JSON.stringify(courses.map(c=>({slug:c.slug,productKey:c.productKey,name:c.name,description:{...c.description,pt:getAcademyCourseReadingMetadata(c.slug)?.summary??c.description.pt},editorial:Object.fromEntries(['pt','en','fr','es'].map(l=>[l,academyReadingTimeLabel(c.slug,l)]))})),null,2)+';\n';}
const file=path.resolve(__dirname,'../apps/painel-ldr/src/lib/academy-subscriber-cards.catalog.ts');
if(require.main===module){const text=generated();if(process.argv.includes('--check')){if(fs.readFileSync(file,'utf8')!==text)throw Error('Stale public Academy metadata');}else fs.writeFileSync(file,text);console.log(JSON.stringify({cards:courses.length,teachingBodies:false}));}
module.exports={generated};

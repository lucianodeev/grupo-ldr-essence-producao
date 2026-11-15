const test=require('node:test'),assert=require('node:assert/strict');
const load=require('./helpers/load-ts.cjs')();
const {freeCourseLessons,restoreFreeLearningState,freeStudyPercent,recordFreeLesson}=load('lib/academy-free-learning.ts');
const {ACADEMY_FREE_COURSES}=load('lib/academy-free-courses.catalog.ts');
const {EDITORIAL_SOURCES}=load('content/academy-free/types.ts');
const {normalizeDigitalReaderContent,readerProgressFloor}=load('lib/digital-reader-content.ts');
const {libraryMatches,libraryOwned,libraryContinueItems}=load('lib/library-dashboard.ts');
const plain=x=>JSON.parse(JSON.stringify(x));
test('authored batches cover their actual curricula, with distinct developed sections, exercises and assessments',()=>{
 const all=[];for(const slug of ['orientacao-trabalho-cientifico','ingles-basico-a1']){
  const c=ACADEMY_FREE_COURSES.find(c=>c.slug===slug),lessons=freeCourseLessons(slug);assert.equal(lessons.length,c.modules.length);
  for(const l of lessons){assert.ok(l.objectives.length>=2);assert.ok(l.sections.flatMap(s=>s.paragraphs).join(' ').split(/\s+/).length>=200,l.id);assert.ok(l.caseStudy.includes('fictíci'));assert.ok(l.assessment.criteria.length>=3);for(const id of l.sourceIds)assert.ok(EDITORIAL_SOURCES[id],id);all.push(l);}
 }
 assert.equal(all.length,17);assert.equal(new Set(all.map(l=>l.id)).size,17);assert.equal(new Set(all.map(l=>l.exercise)).size,17);assert.equal(new Set(all.flatMap(l=>l.sections.flatMap(s=>s.paragraphs))).size,all.flatMap(l=>l.sections.flatMap(s=>s.paragraphs)).length);
});
test('unknown and pending courses have no fabricated lessons',()=>{assert.equal(freeCourseLessons('alemao-basico-a1').length,0);assert.equal(freeCourseLessons('missing').length,0);});
test('corrupt local state is bounded without losing valid legacy completions',()=>{assert.deepEqual(plain(restoreFreeLearningState({index:99,done:[0,0,2,-1,'3',999]},5)),{index:4,done:[0,2]});assert.deepEqual(plain(restoreFreeLearningState(null,5)),{index:0,done:[]});});
test('pending lessons and unreviewed activities cannot complete; completion is idempotent',()=>{const state={index:0,done:[]};assert.equal(recordFreeLesson(state,[],true),state);assert.equal(recordFreeLesson(state,freeCourseLessons('ingles-basico-a1'),false),state);const next=recordFreeLesson(state,freeCourseLessons('ingles-basico-a1'),true);assert.deepEqual(plain(recordFreeLesson(next,freeCourseLessons('ingles-basico-a1'),true)),plain(next));});
test('saved progress is a floor when a revised batch has fewer completed lessons',()=>{assert.equal(freeStudyPercent([0],12,75),75);assert.equal(freeStudyPercent([0,0,999],12,0),8);assert.equal(freeStudyPercent([],0,50),50);assert.equal(readerProgressFloor(1,100,90),90);assert.equal(readerProgressFloor(30,100,10),30);});
test('reader accepts both historical formats without altering the original and repairs escaped line breaks',()=>{const raw={data:{title:'Obra',notice:'Nota',chapters:[['1','Início',['Uma linha\\nOutra linha']]]}};const before=JSON.stringify(raw);const n=normalizeDigitalReaderContent(raw);assert.equal(n.kind,'book');assert.equal(n.data.chapters[0][2][0],'Uma linha\nOutra linha');assert.equal(n.data.notice,'Nota');assert.equal(JSON.stringify(raw),before);const p=normalizeDigitalReaderContent({kind:'ebook',pages:[{titulo:'A',texto:'Texto'}]});assert.equal(p.pages.length,1);});
test('reader rejects empty works and malformed chapters rather than displaying a blank success state',()=>{for(const value of [null,{}, {kind:'ebook',pages:[]},{kind:'ebook',pages:[{texto:''}]},{data:{chapters:[['1','A',[]]]}}])assert.throws(()=>normalizeDigitalReaderContent(value));});
test('catalog search ignores accents and keeps offers separate from owned items',()=>{const item={key:'a',title:'Psicanálise e Educação',description:'Leitura',href:'/a',kind:'ebook',access:'offer',editorial:'Por validar'};assert.ok(libraryMatches(item,'psicanalise'));assert.ok(!libraryOwned(item,[]));assert.ok(libraryOwned({...item,access:'granted'},[]));assert.ok(!libraryOwned({...item,access:'free'},[]));assert.ok(libraryOwned({...item,access:'free'},[{product_key:'a',progress_percent:5}]));});
test('continue uses real mapped destinations and skips completed/unknown products',()=>{const item={key:'a',href:'/reader',title:'A',access:'granted'};const rows=libraryContinueItems([item],[{product_key:'unknown',progress_percent:50},{product_key:'a',progress_percent:25}]);assert.equal(rows.length,1);assert.equal(rows[0].item.href,'/reader');assert.equal(libraryContinueItems([item],[{product_key:'a',progress_percent:100}]).length,0);});

const test=require('node:test'),assert=require('node:assert/strict');
const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const load=require('./helpers/load-ts.cjs')();
const {LibraryLearningDashboard}=load('components/library-learning-dashboard.tsx');
const items=[{key:'owned',title:'Obra adquirida',description:'Descrição',href:'/cliente/biblioteca/owned',kind:'ebook',access:'granted',editorial:'Revisão pendente'},{key:'offer',title:'Obra ainda não adquirida',description:'Descrição',href:'/ebooks/offer',kind:'ebook',access:'offer',editorial:'Revisão pendente'}];
test('dashboard renders independent access labels, real progress and semantic controls in all four locales',()=>{
 for(const locale of ['pt','en','fr','es']){const html=renderToStaticMarkup(React.createElement(LibraryLearningDashboard,{locale,items,progress:[{product_key:'owned',progress_percent:35,current_location:'Capítulo 2'}]}));assert.match(html,/<h1/);assert.equal((html.match(/<article/g)||[]).length,2);assert.match(html,/value="35"/);assert.match(html,/type="search"/);assert.match(html,/<label/);assert.match(html,/aria-pressed="true"/);assert.ok(!html.includes('href="/cliente/biblioteca"'), 'No fabricated self-link for continue');assert.match(html,/md:grid-cols-2/);assert.match(html,/min-h-1[12]/);}
});
test('dashboard does not fabricate continue cards without mapped progress',()=>{const html=renderToStaticMarkup(React.createElement(LibraryLearningDashboard,{locale:'pt',items,progress:[{product_key:'unknown',progress_percent:40}]}));assert.match(html,/O seu percurso aparece aqui/);assert.ok(!html.includes('progress-unknown'));assert.match(html,/Acesso disponível/);assert.match(html,/Ver condições de acesso/);});

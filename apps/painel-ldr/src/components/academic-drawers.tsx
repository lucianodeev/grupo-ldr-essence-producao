import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Gift, GraduationCap, X } from "lucide-react";
import { UNDERGRADUATE_COURSES } from "@/lib/undergraduate.catalog";
import { POSTGRADUATE_COURSES } from "@/lib/postgraduate-interest.catalog";
import { postgraduateCardTitle, undergraduateCardTitle } from "@/lib/library-card-i18n";
import { PROFESSIONAL_FORMATIONS, pfText } from "@/lib/academy-professional-formations.catalog";

type Locale="pt"|"en"|"fr"|"es";
type CategoryKey="psycho"|"beauty"|"business"|"career"|"technology"|"humanities";
type DrawerCourse={icon:string;title:string;meta:string;href:string;tone:string;triggerText?:string};

const COPY={
  pt:{free:"GRÁTIS",freeSub:"Cursos e conteúdos para começar agora",freeBadge:"ACESSO GRATUITO",freeTitle:"Cursos Gratuitos",freeIntro:"Comece agora sem pagar nada.",open:"ACESSAR",close:"Fechar",undergrad:"Graduação",undergradSub:"Cursos superiores · Em breve",postgrad:"Pós-graduação",postgradSub:"Especializações · Em breve",soon:"EM BREVE",hint:"Toque para ver todos",badge:"CURSOS & FORMAÇÕES"},
  en:{free:"FREE",freeSub:"Courses and content to start now",freeBadge:"FREE ACCESS",freeTitle:"Free Courses",freeIntro:"Start now at no cost.",open:"OPEN",close:"Close",undergrad:"Undergraduate",undergradSub:"Higher education · Coming soon",postgrad:"Postgraduate",postgradSub:"Specializations · Coming soon",soon:"COMING SOON",hint:"Tap to view all",badge:"COURSES & TRAINING"},
  fr:{free:"GRATUIT",freeSub:"Cours et contenus pour commencer maintenant",freeBadge:"ACCÈS GRATUIT",freeTitle:"Cours gratuits",freeIntro:"Commencez maintenant gratuitement.",open:"OUVRIR",close:"Fermer",undergrad:"Graduation",undergradSub:"Études supérieures · Bientôt",postgrad:"Post-graduation",postgradSub:"Spécialisations · Bientôt",soon:"BIENTÔT",hint:"Touchez pour tout afficher",badge:"COURS & FORMATIONS"},
  es:{free:"GRATIS",freeSub:"Cursos y contenidos para empezar ahora",freeBadge:"ACCESO GRATIS",freeTitle:"Cursos gratuitos",freeIntro:"Empieza ahora sin pagar nada.",open:"ABRIR",close:"Cerrar",undergrad:"Grado",undergradSub:"Educación superior · Próximamente",postgrad:"Posgrado",postgradSub:"Especializaciones · Próximamente",soon:"PRÓXIMAMENTE",hint:"Toca para ver todo",badge:"CURSOS & FORMACIONES"}
} as const;

const CATEGORY_COPY:Record<Locale,Record<CategoryKey,{icon:string;title:string;subtitle:string;tone:string}>>={
  pt:{
    psycho:{icon:"🧠",title:"Psicanálise",subtitle:"Cursos, formações e conteúdos especializados",tone:"#5b2b86"},
    beauty:{icon:"💆",title:"Massagem, Estética, Beleza & Tricologia",subtitle:"Formações para beleza, cuidado e bem-estar",tone:"#0F5E7A"},
    business:{icon:"🚀",title:"Negócios & Empreendedorismo",subtitle:"Gestão, vendas e desenvolvimento de negócios",tone:"#c85a24"},
    career:{icon:"👥",title:"Carreira, RH & Liderança",subtitle:"Pessoas, carreira, gestão e desenvolvimento profissional",tone:"#047857"},
    technology:{icon:"🤖",title:"Tecnologia & Inteligência Artificial",subtitle:"IA, tecnologia e inovação aplicada",tone:"#143d59"},
    humanities:{icon:"🌍",title:"Sociedade & Desenvolvimento Humano",subtitle:"Comportamento, cultura e conhecimentos humanos",tone:"#76543A"}
  },
  en:{
    psycho:{icon:"🧠",title:"Psychoanalysis",subtitle:"Specialized courses and professional training",tone:"#5b2b86"},
    beauty:{icon:"💆",title:"Massage, Aesthetics, Beauty & Trichology",subtitle:"Training for beauty, care and wellbeing",tone:"#0F5E7A"},
    business:{icon:"🚀",title:"Business & Entrepreneurship",subtitle:"Management, sales and business development",tone:"#c85a24"},
    career:{icon:"👥",title:"Career, HR & Leadership",subtitle:"People, career, management and professional development",tone:"#047857"},
    technology:{icon:"🤖",title:"Technology & Artificial Intelligence",subtitle:"AI, technology and applied innovation",tone:"#143d59"},
    humanities:{icon:"🌍",title:"Society & Human Development",subtitle:"Behavior, culture and human knowledge",tone:"#76543A"}
  },
  fr:{
    psycho:{icon:"🧠",title:"Psychanalyse",subtitle:"Cours et formations spécialisées",tone:"#5b2b86"},
    beauty:{icon:"💆",title:"Massage, Esthétique, Beauté & Trichologie",subtitle:"Formations beauté, soins et bien-être",tone:"#0F5E7A"},
    business:{icon:"🚀",title:"Affaires & Entrepreneuriat",subtitle:"Gestion, vente et développement d'entreprise",tone:"#c85a24"},
    career:{icon:"👥",title:"Carrière, RH & Leadership",subtitle:"Personnes, carrière, gestion et développement professionnel",tone:"#047857"},
    technology:{icon:"🤖",title:"Technologie & Intelligence Artificielle",subtitle:"IA, technologie et innovation appliquée",tone:"#143d59"},
    humanities:{icon:"🌍",title:"Société & Développement Humain",subtitle:"Comportement, culture et connaissances humaines",tone:"#76543A"}
  },
  es:{
    psycho:{icon:"🧠",title:"Psicoanálisis",subtitle:"Cursos y formaciones especializadas",tone:"#5b2b86"},
    beauty:{icon:"💆",title:"Masaje, Estética, Belleza y Tricología",subtitle:"Formaciones de belleza, cuidado y bienestar",tone:"#0F5E7A"},
    business:{icon:"🚀",title:"Negocios y Emprendimiento",subtitle:"Gestión, ventas y desarrollo de negocios",tone:"#c85a24"},
    career:{icon:"👥",title:"Carrera, RR. HH. y Liderazgo",subtitle:"Personas, carrera, gestión y desarrollo profesional",tone:"#047857"},
    technology:{icon:"🤖",title:"Tecnología e Inteligencia Artificial",subtitle:"IA, tecnología e innovación aplicada",tone:"#143d59"},
    humanities:{icon:"🌍",title:"Sociedad y Desarrollo Humano",subtitle:"Comportamiento, cultura y conocimientos humanos",tone:"#76543A"}
  }
};

const FREE_COURSES:Record<Locale,DrawerCourse[]>={
  pt:[
    {icon:"💼",title:"Como Organizar sua Carreira e Dar o Próximo Passo Profissional",meta:"7 aulas · 7 dias · acesso gratuito",href:"/cliente/biblioteca/curso-gratuito-carreira",tone:"#b85c2e"},
    {icon:"🇫🇷",title:"Francês Básico para Negócios — Nível A1",meta:"30 aulas · 10 horas · acesso gratuito",href:"/cliente/cursos/frances-negocios-a1",tone:"#123f73"},
    {icon:"⛑️",title:"Primeiros Socorros — Noções Básicas",meta:"30 aulas · 10 horas · acesso gratuito",href:"/cliente/cursos/primeiros-socorros",tone:"#b4232a"},
    {icon:"🛋️",title:"Clínica Psicanalítica: Sigmund Freud",meta:"120h · gratuito",href:"/cliente/cursos/academy/clinica-psicanalitica-sigmund-freud",tone:"#5b2b86"},
    {icon:"📚",title:"Orientação do Trabalho Científico",meta:"120h · gratuito",href:"/cliente/cursos/academy/orientacao-trabalho-cientifico",tone:"#0F5E7A"},
    {icon:"📄",title:"Modelos de Documentos Psicanalíticos",meta:"Conteúdo gratuito",href:"/cliente/cursos/academy/modelos-documentos-psicanaliticos",tone:"#6F4E37"}
  ],
  en:[
    {icon:"💼",title:"Organize Your Career and Take the Next Professional Step",meta:"7 lessons · 7 days · free access",href:"/cliente/biblioteca/curso-gratuito-carreira",tone:"#b85c2e"},
    {icon:"🇫🇷",title:"Basic French for Business — Level A1",meta:"30 lessons · 10 hours · free access",href:"/cliente/cursos/frances-negocios-a1",tone:"#123f73"},
    {icon:"⛑️",title:"First Aid — Basic Concepts",meta:"30 lessons · 10 hours · free access",href:"/cliente/cursos/primeiros-socorros",tone:"#b4232a"},
    {icon:"🛋️",title:"Psychoanalytic Clinic: Sigmund Freud",meta:"120h · free",href:"/cliente/cursos/academy/clinica-psicanalitica-sigmund-freud",tone:"#5b2b86"},
    {icon:"📚",title:"Scientific Work Guidance",meta:"120h · free",href:"/cliente/cursos/academy/orientacao-trabalho-cientifico",tone:"#0F5E7A"},
    {icon:"📄",title:"Psychoanalytic Document Models",meta:"Free content",href:"/cliente/cursos/academy/modelos-documentos-psicanaliticos",tone:"#6F4E37"}
  ],
  fr:[
    {icon:"💼",title:"Organiser sa carrière et franchir la prochaine étape professionnelle",meta:"7 leçons · 7 jours · accès gratuit",href:"/cliente/biblioteca/curso-gratuito-carreira",tone:"#b85c2e"},
    {icon:"🇫🇷",title:"Français de base pour les affaires — Niveau A1",meta:"30 leçons · 10 heures · accès gratuit",href:"/cliente/cursos/frances-negocios-a1",tone:"#123f73"},
    {icon:"⛑️",title:"Premiers secours — Notions de base",meta:"30 leçons · 10 heures · accès gratuit",href:"/cliente/cursos/primeiros-socorros",tone:"#b4232a"},
    {icon:"🛋️",title:"Clinique psychanalytique : Sigmund Freud",meta:"120h · gratuit",href:"/cliente/cursos/academy/clinica-psicanalitica-sigmund-freud",tone:"#5b2b86"},
    {icon:"📚",title:"Orientation du travail scientifique",meta:"120h · gratuit",href:"/cliente/cursos/academy/orientacao-trabalho-cientifico",tone:"#0F5E7A"},
    {icon:"📄",title:"Modèles de documents psychanalytiques",meta:"Contenu gratuit",href:"/cliente/cursos/academy/modelos-documentos-psicanaliticos",tone:"#6F4E37"}
  ],
  es:[
    {icon:"💼",title:"Cómo organizar tu carrera y dar el siguiente paso profesional",meta:"7 clases · 7 días · acceso gratis",href:"/cliente/biblioteca/curso-gratuito-carreira",tone:"#b85c2e"},
    {icon:"🇫🇷",title:"Francés básico para negocios — Nivel A1",meta:"30 clases · 10 horas · acceso gratis",href:"/cliente/cursos/frances-negocios-a1",tone:"#123f73"},
    {icon:"⛑️",title:"Primeros auxilios — Nociones básicas",meta:"30 clases · 10 horas · acceso gratis",href:"/cliente/cursos/primeiros-socorros",tone:"#b4232a"},
    {icon:"🛋️",title:"Clínica psicoanalítica: Sigmund Freud",meta:"120h · gratis",href:"/cliente/cursos/academy/clinica-psicanalitica-sigmund-freud",tone:"#5b2b86"},
    {icon:"📚",title:"Orientación del trabajo científico",meta:"120h · gratis",href:"/cliente/cursos/academy/orientacao-trabalho-cientifico",tone:"#0F5E7A"},
    {icon:"📄",title:"Modelos de documentos psicoanalíticos",meta:"Contenido gratis",href:"/cliente/cursos/academy/modelos-documentos-psicanaliticos",tone:"#6F4E37"}
  ]
};

const SPECIAL:Record<Locale,Record<CategoryKey,DrawerCourse[]>>={
  pt:{
    psycho:[
      {icon:"🧠",title:"Formação Online em Psicanálise",meta:"Formação profissional",href:"/cliente/treinamentos/psicanalise",tone:"#5b2b86",triggerText:"Psicanálise"},
      {icon:"🛋️",title:"Formação em Terapia Breve Psicanalítica",meta:"1.200h · formação",href:"/cliente/treinamentos/terapia-breve-psicanalitica",tone:"#17645e",triggerText:"Terapia Breve"},
      {icon:"🌍",title:"Psicanálise Internacional",meta:"Formação especializada",href:"/cliente/treinamentos/psicanalise-internacional",tone:"#24476f",triggerText:"Psicanálise Internacional"},
      {icon:"📈",title:"Psicanalista de Alta Performance",meta:"Aperfeiçoamento profissional",href:"/cliente/psicanalista-alta-performance",tone:"#8a6a2d",triggerText:"Alta Performance"}
    ],
    beauty:[{icon:"💆",title:"Formação Completa em Massoterapia",meta:"1.200h · formação",href:"/cliente/treinamentos/massoterapia",tone:"#0F5E7A",triggerText:"Massoterapia"}],
    business:[{icon:"🥭",title:"Do Mamão ao Negócio",meta:"Formação para empreendedores",href:"/cliente/treinamentos/do-mamao-ao-negocio",tone:"#d6ad63",triggerText:"Negócios"},{icon:"🚀",title:"Formação Negócio em 24 Horas",meta:"Formação empresarial",href:"/cliente/treinamentos/negocio-24-horas",tone:"#c85a24",triggerText:"Negócio 24h"}],
    career:[{icon:"🎯",title:"Formação em Mentoria Profissional e de Carreira",meta:"Formação profissional",href:"/cliente/treinamentos/mentoria-carreira",tone:"#0b5cab",triggerText:"Mentoria"},{icon:"👥",title:"Formação em Liderança e Gestão de Pessoas",meta:"Formação profissional",href:"/cliente/treinamentos/lideranca-gestao",tone:"#0f5132",triggerText:"Liderança"},{icon:"🧑‍💼",title:"Formação em Gestão de Pessoas e Recursos Humanos",meta:"600h · formação",href:"/cliente/formacoes/gestao-pessoas-rh",tone:"#047857",triggerText:"RH 600h"}],
    technology:[{icon:"🤖",title:"Inteligência Artificial Aplicada aos Negócios e à Carreira",meta:"600h · formação",href:"/cliente/treinamentos/ia-negocios-carreira",tone:"#143d59",triggerText:"IA"}],
    humanities:[]
  },
  en:{psycho:[],beauty:[],business:[],career:[],technology:[],humanities:[]},
  fr:{psycho:[],beauty:[],business:[],career:[],technology:[],humanities:[]},
  es:{psycho:[],beauty:[],business:[],career:[],technology:[],humanities:[]}
};

for(const loc of ["en","fr","es"] as Locale[]){SPECIAL[loc]=SPECIAL.pt;}

function categoryFor(slug:string,title:string):CategoryKey{
  const s=`${slug} ${title}`.toLowerCase();
  if(/psican|sexolog|sexual|terapia|saude-mental|autismo|aba/.test(s))return "psycho";
  if(/estet|beleza|tricolo|capilar|massag|massoter/.test(s))return "beauty";
  if(/ia|intelig.ncia artificial|tecnolog|automa/.test(s))return "technology";
  if(/recrut|rh|lider|mentoria|carreira|comunica|oratoria|media..o|conflit/.test(s))return "career";
  if(/sociolog|filosof|pol.tica|felicidade|cultura|comportamento/.test(s))return "humanities";
  return "business";
}

function Drawer({title,subtitle,children,hint}:{title:string;subtitle:string;children:React.ReactNode;hint:string}){
  return <details className="group overflow-hidden rounded-[22px] border border-[#d6ad63]/35 bg-white shadow-sm">
    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 [&::-webkit-details-marker]:hidden">
      <div className="flex min-w-0 items-center gap-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#f4efe3] text-[#a77b2e]"><GraduationCap className="h-5 w-5"/></div><div className="min-w-0"><h3 className="font-serif text-xl leading-tight text-[#0b2341]">{title}</h3><p className="mt-0.5 text-xs text-slate-500">{subtitle}</p></div></div>
      <div className="flex shrink-0 items-center gap-2"><span className="hidden text-[10px] font-bold text-slate-400 sm:inline">{hint}</span><ChevronDown className="h-5 w-5 text-[#a77b2e] transition-transform group-open:rotate-180"/></div>
    </summary>
    <div className="border-t border-slate-100 bg-[#fffdf8] p-4 sm:p-5">{children}</div>
  </details>;
}

function CatalogOrganizer({locale}:{locale:Locale}){
  const t=COPY[locale];
  const [target,setTarget]=useState<Element|null>(null);
  const [open,setOpen]=useState<"free"|CategoryKey|null>(null);

  const categories=useMemo(()=>{
    const result:Record<CategoryKey,DrawerCourse[]>={psycho:[...SPECIAL[locale].psycho],beauty:[...SPECIAL[locale].beauty],business:[...SPECIAL[locale].business],career:[...SPECIAL[locale].career],technology:[...SPECIAL[locale].technology],humanities:[...SPECIAL[locale].humanities]};
    for(const formation of PROFESSIONAL_FORMATIONS){
      const ft=pfText(formation,locale);
      const category=categoryFor(formation.slug,ft.name);
      result[category].push({icon:formation.icon,title:ft.name,meta:`${formation.hours}h · ${formation.modulesCount} ${locale==="pt"?"módulos":locale==="fr"?"modules":locale==="es"?"módulos":"modules"}`,href:formation.learnerPath,tone:formation.theme==="green"?"#047857":formation.theme==="wine"?"#7A3651":"#315F86"});
    }
    return result;
  },[locale]);

  useEffect(()=>{
    const findTarget=()=>setTarget(document.querySelector("#catalogo-ldr .grid.grid-cols-4"));
    findTarget();
    const observer=new MutationObserver(findTarget);
    observer.observe(document.body,{childList:true,subtree:true});
    return()=>observer.disconnect();
  },[]);

  useEffect(()=>{
    if(!target)return;
    const freeHrefs=new Set(FREE_COURSES.pt.map(c=>c.href).concat(["/cliente/cursos/organizar-carreira"]));
    const specialHrefs=new Set(Object.values(SPECIAL.pt).flat().map(c=>c.href));
    const professionalHrefs=new Set(PROFESSIONAL_FORMATIONS.map(f=>f.learnerPath));
    const shouldHide=(el:Element)=>{
      const href=el.getAttribute("href")||"";
      if(freeHrefs.has(href)||specialHrefs.has(href)||professionalHrefs.has(href))return true;
      if(el.tagName==="BUTTON"){
        const text=(el.textContent||"").trim();
        return ["Psicanálise","Terapia Breve","Massoterapia","Negócio 24h","Mentoria","Liderança","RH 600h","IA"].some(label=>text===label||text.startsWith(label));
      }
      return false;
    };
    const apply=()=>target.querySelectorAll(":scope > a,:scope > button").forEach(el=>{if(shouldHide(el))(el as HTMLElement).style.display="none"});
    apply();
    const observer=new MutationObserver(apply);
    observer.observe(target,{childList:true,subtree:true});
    return()=>observer.disconnect();
  },[target]);

  useEffect(()=>{
    if(!open)return;
    const onKey=(event:KeyboardEvent)=>{if(event.key==="Escape")setOpen(null)};
    const previous=document.body.style.overflow;
    document.body.style.overflow="hidden";
    window.addEventListener("keydown",onKey);
    return()=>{document.body.style.overflow=previous;window.removeEventListener("keydown",onKey)};
  },[open]);

  const activate=(course:DrawerCourse)=>{
    if(course.triggerText&&target){
      const candidates=Array.from(target.querySelectorAll("a,button"));
      const original=candidates.find(el=>(el.textContent||"").includes(course.triggerText!));
      if(original){setOpen(null);(original as HTMLElement).click();return;}
    }
    location.href=course.href;
  };

  if(!target)return null;
  const keys=(Object.keys(CATEGORY_COPY[locale]) as CategoryKey[]).filter(key=>categories[key].length>0);

  return <>
    {createPortal(<div className="order-first col-span-4 grid grid-cols-4 gap-1.5 sm:col-span-10 sm:grid-cols-7 sm:gap-3">
      <button type="button" onClick={()=>setOpen("free")} className="min-w-0 rounded-2xl bg-gradient-to-br from-[#071426] via-[#0b2341] to-[#173f6b] px-1 py-4 text-center text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><Gift className="mx-auto h-5 w-5 text-[#d6ad63]"/><p className="mt-2 text-[8px] font-black leading-tight sm:text-[10px]">{t.free}</p><span className="mt-2 inline-flex rounded-full bg-[#d6ad63] px-1.5 py-0.5 text-[6px] font-black uppercase text-[#281605] sm:text-[7px]">{t.freeBadge}</span></button>
      {keys.map(key=>{const c=CATEGORY_COPY[locale][key];return <button key={key} type="button" onClick={()=>setOpen(key)} className="min-w-0 rounded-2xl px-1 py-4 text-center text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md" style={{backgroundColor:c.tone}}><span className="mx-auto block text-lg">{c.icon}</span><p className="mt-2 text-[8px] font-black leading-tight sm:text-[10px]">{c.title}</p><span className="mt-2 inline-flex rounded-full bg-white/15 px-1.5 py-0.5 text-[6px] font-black uppercase text-white sm:text-[7px]">{t.badge}</span></button>})}
    </div>,target)}

    {open&&createPortal(<div className="fixed inset-0 z-[140] flex justify-end bg-[#071426]/65 backdrop-blur-sm" role="presentation" onMouseDown={event=>{if(event.currentTarget===event.target)setOpen(null)}}>
      <section role="dialog" aria-modal="true" aria-label={open==="free"?t.freeTitle:CATEGORY_COPY[locale][open].title} className="h-full w-full max-w-2xl overflow-y-auto bg-[#fffdf8] shadow-2xl sm:w-[min(92vw,720px)]">
        <header className="sticky top-0 z-10 border-b border-[#d6ad63]/25 bg-[#071426] px-5 py-5 text-white sm:px-7"><div className="flex items-start justify-between gap-4"><div><span className="inline-flex rounded-full bg-[#d6ad63] px-3 py-1 text-[10px] font-black uppercase tracking-[.14em] text-[#281605]">{open==="free"?t.freeBadge:t.badge}</span><h2 className="mt-3 font-serif text-3xl text-white">{open==="free"?t.freeTitle:CATEGORY_COPY[locale][open].title}</h2><p className="mt-1 text-sm text-white/70">{open==="free"?t.freeIntro:CATEGORY_COPY[locale][open].subtitle}</p></div><button type="button" onClick={()=>setOpen(null)} aria-label={t.close} className="rounded-full border border-white/15 bg-white/10 p-2 text-white hover:bg-white/15"><X className="h-5 w-5"/></button></div></header>
        <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-7">{(open==="free"?FREE_COURSES[locale]:categories[open]).map(course=><button key={`${course.href}-${course.title}`} type="button" onClick={()=>open==="free"?location.href=course.href:activate(course)} className="group/card min-w-0 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><div className="flex items-start justify-between gap-3"><span className="text-3xl">{course.icon}</span><span className="rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-white" style={{backgroundColor:course.tone}}>{open==="free"?t.free:t.badge}</span></div><h3 className="mt-4 font-serif text-xl leading-snug text-[#0b2341]">{course.title}</h3><p className="mt-2 text-xs leading-5 text-slate-500">{course.meta}</p><span className="mt-4 inline-flex text-xs font-black" style={{color:course.tone}}>{t.open} →</span></button>)}</div>
      </section>
    </div>,document.body)}
  </>;
}

export function AcademicDrawers({locale}:{locale:Locale}){
  const t=COPY[locale];
  const postgrads=Object.entries(POSTGRADUATE_COURSES);
  return <section className="space-y-3" aria-label={`${t.undergrad} e ${t.postgrad}`}>
    <CatalogOrganizer locale={locale}/>
    <Drawer title={t.undergrad} subtitle={t.undergradSub} hint={t.hint}><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{UNDERGRADUATE_COURSES.map(course=><article key={course.key} className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-start justify-between gap-3"><span className="text-2xl">{course.icon}</span><span className="shrink-0 rounded-full bg-[#fff3d6] px-2.5 py-1 text-[9px] font-black tracking-wide text-[#8a611c]">{t.soon}</span></div><h4 className="mt-3 break-normal font-serif text-lg leading-snug text-[#0b2341]">{undergraduateCardTitle(locale,course.key,course.title)}</h4><p className="mt-2 text-xs text-slate-500">{course.years} {course.years===1?"ano":"anos"} · {course.semesters} semestres</p></article>)}</div></Drawer>
    <Drawer title={t.postgrad} subtitle={t.postgradSub} hint={t.hint}><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{postgrads.map(([key,title],index)=><article key={key} className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-start justify-between gap-3"><span className="text-2xl">{["🤖","👥","🚀","💼","📈","🌍","🧠"][index]??"🎓"}</span><span className="shrink-0 rounded-full bg-[#fff3d6] px-2.5 py-1 text-[9px] font-black tracking-wide text-[#8a611c]">{t.soon}</span></div><h4 className="mt-3 break-normal font-serif text-lg leading-snug text-[#0b2341]">{postgraduateCardTitle(locale,key,title)}</h4></article>)}</div></Drawer>
  </section>;
}

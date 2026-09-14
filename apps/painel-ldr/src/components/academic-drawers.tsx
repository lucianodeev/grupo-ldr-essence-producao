import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Gift, GraduationCap, X } from "lucide-react";
import { UNDERGRADUATE_COURSES } from "@/lib/undergraduate.catalog";
import { POSTGRADUATE_COURSES } from "@/lib/postgraduate-interest.catalog";
import { postgraduateCardTitle, undergraduateCardTitle } from "@/lib/library-card-i18n";
import { PROFESSIONAL_FORMATIONS, pfText } from "@/lib/academy-professional-formations.catalog";
import { PSYCHOANALYSIS_EBOOKS } from "@/lib/psychoanalysis-ebooks.catalog";
import { ACADEMY_FREE_COURSES } from "@/lib/academy-free-courses.catalog";

type Locale="pt"|"en"|"fr"|"es";
type CourseCategoryKey="psycho"|"beauty"|"business"|"career"|"technology"|"humanities";
type UtilityCategoryKey="books"|"publications"|"films"|"social"|"services";
type DrawerKey="free"|CourseCategoryKey|UtilityCategoryKey;
type DrawerCourse={icon:string;title:string;meta:string;href:string;tone:string;triggerText?:string};

const COPY={
  pt:{free:"GRÁTIS",freeSub:"Cursos e conteúdos para começar agora",freeBadge:"ACESSO GRATUITO",freeTitle:"Cursos Gratuitos",freeIntro:"Comece agora sem pagar nada.",open:"ACESSAR",close:"Fechar",undergrad:"Graduação",undergradSub:"Cursos superiores · Em breve",postgrad:"Pós-graduação",postgradSub:"Especializações · Em breve",soon:"EM BREVE",hint:"Toque para ver todos",badge:"CURSOS & FORMAÇÕES",digital:"BIBLIOTECA DIGITAL",publications:"PUBLICAÇÕES",audiovisual:"CONTEÚDOS AUDIOVISUAIS",services:"SERVIÇOS"},
  en:{free:"FREE",freeSub:"Courses and content to start now",freeBadge:"FREE ACCESS",freeTitle:"Free Courses",freeIntro:"Start now at no cost.",open:"OPEN",close:"Close",undergrad:"Undergraduate",undergradSub:"Higher education · Coming soon",postgrad:"Postgraduate",postgradSub:"Specializations · Coming soon",soon:"COMING SOON",hint:"Tap to view all",badge:"COURSES & TRAINING",digital:"DIGITAL LIBRARY",publications:"PUBLICATIONS",audiovisual:"AUDIOVISUAL CONTENT",services:"SERVICES"},
  fr:{free:"GRATUIT",freeSub:"Cours et contenus pour commencer maintenant",freeBadge:"ACCÈS GRATUIT",freeTitle:"Cours gratuits",freeIntro:"Commencez maintenant gratuitement.",open:"OUVRIR",close:"Fermer",undergrad:"Graduation",undergradSub:"Études supérieures · Bientôt",postgrad:"Post-graduation",postgradSub:"Spécialisations · Bientôt",soon:"BIENTÔT",hint:"Touchez pour tout afficher",badge:"COURS & FORMATIONS",digital:"BIBLIOTHÈQUE NUMÉRIQUE",publications:"PUBLICATIONS",audiovisual:"CONTENUS AUDIOVISUELS",services:"SERVICES"},
  es:{free:"GRATIS",freeSub:"Cursos y contenidos para empezar ahora",freeBadge:"ACCESO GRATIS",freeTitle:"Cursos gratuitos",freeIntro:"Empieza ahora sin pagar nada.",open:"ABRIR",close:"Cerrar",undergrad:"Grado",undergradSub:"Educación superior · Próximamente",postgrad:"Posgrado",postgradSub:"Especializaciones · Próximamente",soon:"PRÓXIMAMENTE",hint:"Toca para ver todo",badge:"CURSOS & FORMACIONES",digital:"BIBLIOTECA DIGITAL",publications:"PUBLICACIONES",audiovisual:"CONTENIDOS AUDIOVISUALES",services:"SERVICIOS"}
} as const;

const COURSE_CATEGORY_COPY:Record<Locale,Record<CourseCategoryKey,{icon:string;title:string;subtitle:string;tone:string}>>={
  pt:{
    psycho:{icon:"🧠",title:"Psicanálise",subtitle:"Cursos, formações e conteúdos especializados",tone:"#5b2b86"},
    beauty:{icon:"💆",title:"Massagem, Estética, Beleza & Tricologia",subtitle:"Formações para saúde, beleza e bem-estar",tone:"#7A1532"},
    business:{icon:"🚀",title:"Negócios & Empreendedorismo",subtitle:"Gestão, vendas e desenvolvimento de negócios",tone:"#985014"},
    career:{icon:"👥",title:"Carreira, RH & Liderança",subtitle:"Pessoas, carreira, gestão e desenvolvimento profissional",tone:"#17645e"},
    technology:{icon:"🤖",title:"Tecnologia & Inteligência Artificial",subtitle:"IA, tecnologia e inovação aplicada",tone:"#174B6A"},
    humanities:{icon:"🌍",title:"Sociedade & Desenvolvimento Humano",subtitle:"Conhecimento, comportamento e cultura",tone:"#3D4778"}
  },
  en:{
    psycho:{icon:"🧠",title:"Psychoanalysis",subtitle:"Specialized courses and professional training",tone:"#5b2b86"},
    beauty:{icon:"💆",title:"Massage, Aesthetics, Beauty & Trichology",subtitle:"Training for health, beauty and wellbeing",tone:"#7A1532"},
    business:{icon:"🚀",title:"Business & Entrepreneurship",subtitle:"Management, sales and business development",tone:"#985014"},
    career:{icon:"👥",title:"Career, HR & Leadership",subtitle:"People, career, management and professional development",tone:"#17645e"},
    technology:{icon:"🤖",title:"Technology & Artificial Intelligence",subtitle:"AI, technology and applied innovation",tone:"#174B6A"},
    humanities:{icon:"🌍",title:"Society & Human Development",subtitle:"Knowledge, behavior and culture",tone:"#3D4778"}
  },
  fr:{
    psycho:{icon:"🧠",title:"Psychanalyse",subtitle:"Cours et formations spécialisées",tone:"#5b2b86"},
    beauty:{icon:"💆",title:"Massage, Esthétique, Beauté & Trichologie",subtitle:"Formations santé, beauté et bien-être",tone:"#7A1532"},
    business:{icon:"🚀",title:"Affaires & Entrepreneuriat",subtitle:"Gestion, vente et développement d'entreprise",tone:"#985014"},
    career:{icon:"👥",title:"Carrière, RH & Leadership",subtitle:"Personnes, carrière, gestion et développement professionnel",tone:"#17645e"},
    technology:{icon:"🤖",title:"Technologie & Intelligence Artificielle",subtitle:"IA, technologie et innovation appliquée",tone:"#174B6A"},
    humanities:{icon:"🌍",title:"Société & Développement Humain",subtitle:"Connaissance, comportement et culture",tone:"#3D4778"}
  },
  es:{
    psycho:{icon:"🧠",title:"Psicoanálisis",subtitle:"Cursos y formaciones especializadas",tone:"#5b2b86"},
    beauty:{icon:"💆",title:"Masaje, Estética, Belleza y Tricología",subtitle:"Formaciones para salud, belleza y bienestar",tone:"#7A1532"},
    business:{icon:"🚀",title:"Negocios y Emprendimiento",subtitle:"Gestión, ventas y desarrollo de negocios",tone:"#985014"},
    career:{icon:"👥",title:"Carrera, RR. HH. y Liderazgo",subtitle:"Personas, carrera, gestión y desarrollo profesional",tone:"#17645e"},
    technology:{icon:"🤖",title:"Tecnología e Inteligencia Artificial",subtitle:"IA, tecnología e innovación aplicada",tone:"#174B6A"},
    humanities:{icon:"🌍",title:"Sociedad y Desarrollo Humano",subtitle:"Conocimiento, comportamiento y cultura",tone:"#3D4778"}
  }
};

const UTILITY_CATEGORY_COPY:Record<Locale,Record<UtilityCategoryKey,{icon:string;title:string;subtitle:string;tone:string;badge:"digital"|"publications"|"audiovisual"|"services"}>>={
  pt:{
    books:{icon:"📚",title:"Livros & eBooks",subtitle:"Leituras, materiais e conteúdos digitais",tone:"#633A8B",badge:"digital"},
    publications:{icon:"📰",title:"Revistas & Publicações",subtitle:"Revistas, jornais e conteúdos editoriais",tone:"#6E102A",badge:"publications"},
    films:{icon:"🎬",title:"Filmes",subtitle:"Produções e conteúdos audiovisuais",tone:"#183C5A",badge:"audiovisual"},
    social:{icon:"🤝",title:"Clínica Social",subtitle:"Atendimento, acesso social e iniciativas da LDR",tone:"#0B6B4D",badge:"services"},
    services:{icon:"✍️",title:"Orientações & Serviços",subtitle:"Orientação, carreira e suporte profissional",tone:"#817326",badge:"services"}
  },
  en:{
    books:{icon:"📚",title:"Books & eBooks",subtitle:"Reading, materials and digital content",tone:"#633A8B",badge:"digital"},
    publications:{icon:"📰",title:"Magazines & Publications",subtitle:"Magazines, newspapers and editorial content",tone:"#6E102A",badge:"publications"},
    films:{icon:"🎬",title:"Films",subtitle:"Productions and audiovisual content",tone:"#183C5A",badge:"audiovisual"},
    social:{icon:"🤝",title:"Social Clinic",subtitle:"Care, social access and LDR initiatives",tone:"#0B6B4D",badge:"services"},
    services:{icon:"✍️",title:"Guidance & Services",subtitle:"Guidance, career and professional support",tone:"#817326",badge:"services"}
  },
  fr:{
    books:{icon:"📚",title:"Livres & eBooks",subtitle:"Lectures, matériels et contenus numériques",tone:"#633A8B",badge:"digital"},
    publications:{icon:"📰",title:"Revues & Publications",subtitle:"Revues, journaux et contenus éditoriaux",tone:"#6E102A",badge:"publications"},
    films:{icon:"🎬",title:"Films",subtitle:"Productions et contenus audiovisuels",tone:"#183C5A",badge:"audiovisual"},
    social:{icon:"🤝",title:"Clinique Sociale",subtitle:"Accueil, accès social et initiatives LDR",tone:"#0B6B4D",badge:"services"},
    services:{icon:"✍️",title:"Orientation & Services",subtitle:"Orientation, carrière et accompagnement professionnel",tone:"#817326",badge:"services"}
  },
  es:{
    books:{icon:"📚",title:"Libros & eBooks",subtitle:"Lecturas, materiales y contenidos digitales",tone:"#633A8B",badge:"digital"},
    publications:{icon:"📰",title:"Revistas y Publicaciones",subtitle:"Revistas, periódicos y contenidos editoriales",tone:"#6E102A",badge:"publications"},
    films:{icon:"🎬",title:"Películas",subtitle:"Producciones y contenidos audiovisuales",tone:"#183C5A",badge:"audiovisual"},
    social:{icon:"🤝",title:"Clínica Social",subtitle:"Atención, acceso social e iniciativas LDR",tone:"#0B6B4D",badge:"services"},
    services:{icon:"✍️",title:"Orientación y Servicios",subtitle:"Orientación, carrera y apoyo profesional",tone:"#817326",badge:"services"}
  }
};

const FREE_COURSE_STYLE:Record<string,{icon:string;tone:string}>={
  "clinica-psicanalitica-sigmund-freud":{icon:"🛋️",tone:"#5b2b86"},
  "orientacao-trabalho-cientifico":{icon:"📚",tone:"#0F5E7A"},
  "modelos-documentos-psicanaliticos":{icon:"📄",tone:"#6F4E37"},
  "ingles-basico-a1":{icon:"🇬🇧",tone:"#1F4E79"},
  "espanhol-basico-a1":{icon:"🇪🇸",tone:"#AA151B"},
  "portugues-para-falantes-de-outras-linguas-a1":{icon:"🇵🇹",tone:"#046A38"},
  "neerlandes-basico-a1":{icon:"🇳🇱",tone:"#21468B"},
  "alemao-basico-a1":{icon:"🇩🇪",tone:"#6B4A2D"}
};

const academyFreeFor=(locale:Locale):DrawerCourse[]=>ACADEMY_FREE_COURSES.map(course=>{
  const style=FREE_COURSE_STYLE[course.slug]??{icon:"🎓",tone:"#315F86"};
  const hourLabel=course.hours?`${course.hours}h · ${locale==="pt"?"gratuito":locale==="fr"?"gratuit":locale==="es"?"gratis":"free"}`:(locale==="pt"?"Conteúdo gratuito":locale==="fr"?"Contenu gratuit":locale==="es"?"Contenido gratis":"Free content");
  return {icon:style.icon,title:course.name[locale],meta:hourLabel,href:`/cliente/cursos/academy/${course.slug}`,tone:style.tone};
});

const FREE_COURSES:Record<Locale,DrawerCourse[]>={
  pt:[
    {icon:"💼",title:"Como Organizar sua Carreira e Dar o Próximo Passo Profissional",meta:"7 aulas · 7 dias · acesso gratuito",href:"/cliente/biblioteca/curso-gratuito-carreira",tone:"#b85c2e"},
    {icon:"🇫🇷",title:"Francês Básico para Negócios — Nível A1",meta:"30 aulas · 10 horas · acesso gratuito",href:"/cliente/cursos/frances-negocios-a1",tone:"#123f73"},
    {icon:"⛑️",title:"Primeiros Socorros — Noções Básicas",meta:"30 aulas · 10 horas · acesso gratuito",href:"/cliente/cursos/primeiros-socorros",tone:"#b4232a"},
    ...academyFreeFor("pt")
  ],
  en:[
    {icon:"💼",title:"Organize Your Career and Take the Next Professional Step",meta:"7 lessons · 7 days · free access",href:"/cliente/biblioteca/curso-gratuito-carreira",tone:"#b85c2e"},
    {icon:"🇫🇷",title:"Basic French for Business — Level A1",meta:"30 lessons · 10 hours · free access",href:"/cliente/cursos/frances-negocios-a1",tone:"#123f73"},
    {icon:"⛑️",title:"First Aid — Basic Concepts",meta:"30 lessons · 10 hours · free access",href:"/cliente/cursos/primeiros-socorros",tone:"#b4232a"},
    ...academyFreeFor("en")
  ],
  fr:[
    {icon:"💼",title:"Organiser sa carrière et franchir la prochaine étape professionnelle",meta:"7 leçons · 7 jours · accès gratuit",href:"/cliente/biblioteca/curso-gratuito-carreira",tone:"#b85c2e"},
    {icon:"🇫🇷",title:"Français de base pour les affaires — Niveau A1",meta:"30 leçons · 10 heures · accès gratuit",href:"/cliente/cursos/frances-negocios-a1",tone:"#123f73"},
    {icon:"⛑️",title:"Premiers secours — Notions de base",meta:"30 leçons · 10 heures · accès gratuit",href:"/cliente/cursos/primeiros-socorros",tone:"#b4232a"},
    ...academyFreeFor("fr")
  ],
  es:[
    {icon:"💼",title:"Cómo organizar tu carrera y dar el siguiente paso profesional",meta:"7 clases · 7 días · acceso gratis",href:"/cliente/biblioteca/curso-gratuito-carreira",tone:"#b85c2e"},
    {icon:"🇫🇷",title:"Francés básico para negocios — Nivel A1",meta:"30 clases · 10 horas · acceso gratis",href:"/cliente/cursos/frances-negocios-a1",tone:"#123f73"},
    {icon:"⛑️",title:"Primeros auxilios — Nociones básicas",meta:"30 clases · 10 horas · acceso gratis",href:"/cliente/cursos/primeiros-socorros",tone:"#b4232a"},
    ...academyFreeFor("es")
  ]
};

const SPECIAL:Record<Locale,Record<CourseCategoryKey,DrawerCourse[]>>={
  pt:{
    psycho:[
      {icon:"🧠",title:"Formação em Psicanálise com Ênfase em Autismo e Atuação Internacional",meta:"1.200h · 15 módulos · 240 unidades · 🎧 3 áudios por módulo",href:"/cliente/treinamentos/psicanalise",tone:"#5b2b86",triggerText:"Psicanálise"},
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

const UTILITY_ITEMS:Record<Locale,Record<UtilityCategoryKey,DrawerCourse[]>>={
  pt:{
    books:[
      {icon:"📕",title:"A Coragem de Começar",meta:"eBook",href:"/cliente/biblioteca/ebook_coragem_comecar",tone:"#5b0824",triggerText:"A Coragem de Começar"},
      {icon:"📘",title:"O Menino que Vendia Mamão",meta:"Livro",href:"/cliente/biblioteca/livro_menino_mamao",tone:"#7A3E12",triggerText:"O Menino que Vendia Mamão"},
      ...PSYCHOANALYSIS_EBOOKS.map(item=>({icon:"📖",title:item.title,meta:item.subtitle,href:item.readerPath,tone:item.color,triggerText:item.short}))
    ],
    publications:[{icon:"📰",title:"Revista Psicanálise no Mundo",meta:"Revista, jornais e publicações especiais",href:"/cliente/biblioteca/publicacoes/revista-psicanalise-no-mundo",tone:"#0b2341",triggerText:"Revista Psicanálise no Mundo"}],
    films:[{icon:"🎬",title:"O Menino que Vendia Mamão — Filme",meta:"Em produção",href:"#",tone:"#35101e",triggerText:"Filme"}],
    social:[{icon:"🤝",title:"Clínica Social",meta:"Atendimento e iniciativa social",href:"/clinica-social",tone:"#2F6F4E",triggerText:"Clínica Social"}],
    services:[{icon:"✍️",title:"Orientação Psicanalítica Escrita",meta:"Orientação psicanalítica",href:"/cliente/orientacao-psicanalitica",tone:"#263b63",triggerText:"Orientação Escrita"},{icon:"💼",title:"Orientação Profissional",meta:"Carreira e desenvolvimento profissional",href:"/cliente/orientacao-profissional",tone:"#4B3F8F",triggerText:"Orientação Profissional"}]
  },
  en:{books:[],publications:[],films:[],social:[],services:[]},
  fr:{books:[],publications:[],films:[],social:[],services:[]},
  es:{books:[],publications:[],films:[],social:[],services:[]}
};
for(const loc of ["en","fr","es"] as Locale[]){UTILITY_ITEMS[loc]=UTILITY_ITEMS.pt;}

function categoryFor(slug:string,title:string):CourseCategoryKey{
  const s=`${slug} ${title}`.toLowerCase();
  if(/estet|beleza|tricolo|tricologia|capilar|massag|massoter/.test(s))return "beauty";
  if(/psican|sexolog|sexual|terapia|saude-mental|autismo|aba/.test(s))return "psycho";
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
  const [open,setOpen]=useState<DrawerKey|null>(null);

  const categories=useMemo(()=>{
    const result:Record<CourseCategoryKey,DrawerCourse[]>={psycho:[...SPECIAL[locale].psycho],beauty:[...SPECIAL[locale].beauty],business:[...SPECIAL[locale].business],career:[...SPECIAL[locale].career],technology:[...SPECIAL[locale].technology],humanities:[...SPECIAL[locale].humanities]};
    for(const formation of PROFESSIONAL_FORMATIONS){
      const ft=pfText(formation,locale);
      const category=categoryFor(formation.slug,ft.name);
      result[category].push({icon:formation.icon,title:ft.name,meta:`${formation.hours}h · ${formation.modulesCount} ${locale==="pt"?"módulos":locale==="fr"?"modules":locale==="es"?"módulos":"modules"}`,href:formation.learnerPath,tone:formation.theme==="green"?"#047857":formation.theme==="wine"?"#7A3651":"#315F86",triggerText:ft.short});
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
    const apply=()=>target.querySelectorAll(":scope > a,:scope > button").forEach(el=>{(el as HTMLElement).style.display="none"});
    apply();
    const observer=new MutationObserver(apply);
    observer.observe(target,{childList:true,subtree:false});
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
    if(target){
      const candidates=Array.from(target.querySelectorAll("a,button"));
      const original=candidates.find(el=>{
        const href=el.getAttribute("href")||"";
        const text=(el.textContent||"").trim();
        return href===course.href||Boolean(course.triggerText&&text.includes(course.triggerText));
      });
      if(original){setOpen(null);(original as HTMLElement).click();return;}
    }
    if(course.href&&course.href!=="#")location.href=course.href;
  };

  if(!target)return null;

  const courseKeys=(Object.keys(COURSE_CATEGORY_COPY[locale]) as CourseCategoryKey[]).filter(key=>categories[key].length>0);
  const utilityKeys=(Object.keys(UTILITY_CATEGORY_COPY[locale]) as UtilityCategoryKey[]).filter(key=>UTILITY_ITEMS[locale][key].length>0);
  const cardCopy=(key:DrawerKey)=>{
    if(key==="free")return {icon:"🎁",title:t.free,subtitle:t.freeSub,tone:"#087D5D",badge:t.freeBadge};
    if((courseKeys as string[]).includes(key)){const c=COURSE_CATEGORY_COPY[locale][key as CourseCategoryKey];return {...c,badge:t.badge};}
    const c=UTILITY_CATEGORY_COPY[locale][key as UtilityCategoryKey];return {...c,badge:t[c.badge]};
  };
  const drawerItems=(key:DrawerKey)=>key==="free"?FREE_COURSES[locale]:(courseKeys as string[]).includes(key)?categories[key as CourseCategoryKey]:UTILITY_ITEMS[locale][key as UtilityCategoryKey];
  const allKeys:DrawerKey[]=["free",...courseKeys,...utilityKeys];

  return <>
    {createPortal(<div className="order-first col-span-4 grid grid-cols-1 gap-2 sm:col-span-10 sm:grid-cols-2 sm:gap-3">
      {allKeys.map(key=>{const c=cardCopy(key);return <button key={key} type="button" onClick={()=>setOpen(key)} className="flex min-w-0 items-center gap-3 rounded-2xl px-4 py-4 text-left text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d6ad63]" style={{backgroundColor:c.tone}} aria-haspopup="dialog">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/10 text-2xl">{c.icon}</span>
        <span className="min-w-0 flex-1"><strong className="block break-normal text-sm font-black leading-tight sm:text-base">{c.title}</strong><span className="mt-1 block text-[10px] leading-4 text-white/75 sm:text-xs">{c.subtitle}</span></span>
        <span className="hidden shrink-0 rounded-full bg-white/15 px-3 py-1.5 text-[9px] font-black uppercase tracking-wide text-white sm:inline-flex">{c.badge}</span>
        <ChevronDown className="h-5 w-5 shrink-0 -rotate-90 text-white/85"/>
      </button>})}
    </div>,target)}

    {open&&createPortal(<div className="fixed inset-0 z-[140] flex justify-end bg-[#071426]/65 backdrop-blur-sm" role="presentation" onMouseDown={event=>{if(event.currentTarget===event.target)setOpen(null)}}>
      <section role="dialog" aria-modal="true" aria-label={cardCopy(open).title} className="h-full w-full max-w-2xl overflow-y-auto bg-[#fffdf8] shadow-2xl sm:w-[min(92vw,720px)]">
        <header className="sticky top-0 z-10 border-b border-[#d6ad63]/25 bg-[#071426] px-5 py-5 text-white sm:px-7"><div className="flex items-start justify-between gap-4"><div><span className="inline-flex rounded-full bg-[#d6ad63] px-3 py-1 text-[10px] font-black uppercase tracking-[.14em] text-[#281605]">{cardCopy(open).badge}</span><h2 className="mt-3 font-serif text-3xl text-white">{cardCopy(open).title}</h2><p className="mt-1 text-sm text-white/70">{cardCopy(open).subtitle}</p></div><button type="button" onClick={()=>setOpen(null)} aria-label={t.close} className="rounded-full border border-white/15 bg-white/10 p-2 text-white hover:bg-white/15"><X className="h-5 w-5"/></button></div></header>
        <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-7">{drawerItems(open).map(course=><button key={`${course.href}-${course.title}`} type="button" onClick={()=>activate(course)} className="group/card min-w-0 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><div className="flex items-start justify-between gap-3"><span className="text-3xl">{course.icon}</span><span className="rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-white" style={{backgroundColor:course.tone}}>{open==="free"?t.free:t.open}</span></div><h3 className="mt-4 font-serif text-xl leading-snug text-[#0b2341]">{course.title}</h3><p className="mt-2 text-xs leading-5 text-slate-500">{course.meta}</p><span className="mt-4 inline-flex text-xs font-black" style={{color:course.tone}}>{t.open} →</span></button>)}</div>
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

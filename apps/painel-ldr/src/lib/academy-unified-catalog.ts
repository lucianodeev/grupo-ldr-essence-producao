import { CORE_PT, CORE_I18N, type AcademyLocale } from "./academy-core-formations.catalog";
import { PROFESSIONAL_FORMATIONS, pfText } from "./academy-professional-formations.catalog";
import { ACADEMY_SUBSCRIBER_COURSE_CARDS } from "./academy-subscriber-cards.catalog";
export type { AcademyLocale } from "./academy-core-formations.catalog";
export type AcademyCategory = "psicanalise" | "negocios" | "carreira" | "rh" | "ia";
export type AcademyCatalogItem = {
 key:string;title:string;description:string;detail:string;editorial:string;publicPath:string;learnerPath:string;
 kind:"course"|"formation";category:AcademyCategory;icon:string;accent:string;popular:boolean;includedInSubscription:true;
};
const CORE_ACCESS:Record<string,{key:string;learnerPath:string}>={
 psy:{key:"formacao_psicanalise",learnerPath:"/cliente/treinamentos/psicanalise"},
 "psy-intl":{key:"curso_psicanalise_internacional_neurodiversidade_autismo",learnerPath:"/cliente/treinamentos/psicanalise-internacional"},
 brief:{key:"formacao_terapia_breve_psicanalitica",learnerPath:"/cliente/treinamentos/terapia-breve-psicanalitica"},
 performance:{key:"psicanalista_alta_performance_trilogia",learnerPath:"/cliente/psicanalista-alta-performance"},
 ai:{key:"formacao_ia_negocios_carreira",learnerPath:"/cliente/treinamentos/ia-negocios-carreira"},
 rh:{key:"formacao_gestao_pessoas_rh",learnerPath:"/cliente/formacoes/gestao-pessoas-rh"},
 mentor:{key:"formacao_mentoria_profissional_carreira",learnerPath:"/cliente/treinamentos/mentoria-carreira"},
 lead:{key:"formacao_lideranca_gestao_pessoas",learnerPath:"/cliente/treinamentos/lideranca-gestao"},
 massage:{key:"formacao_massoterapia",learnerPath:"/cliente/treinamentos/massoterapia"},
 business24:{key:"formacao_negocio_24_horas",learnerPath:"/cliente/treinamentos/negocio-24-horas"},
};
const THEMES:Record<string,string>={navy:"#0b3764",wine:"#7a1835",green:"#047857",petrol:"#0f766e",purple:"#6D3FA0",rose:"#b76e79",gold:"#a06f1c",terracotta:"#A85132"};
function category(slug:string):AcademyCategory{
 if(/psicanal|autismo|filosofia-clinica/.test(slug))return "psicanalise";
 if(/recrutamento|recursos-humanos|departamento-pessoal/.test(slug))return "rh";
 if(/inteligencia-artificial/.test(slug))return "ia";
 if(/negocio|venda|marketing|copywriting|financeir|precifica|produto|escritorio|administrativ|gestao-projetos|cliente/.test(slug))return "negocios";
 return "carreira";
}
export function academySubscriptionLabel(locale:AcademyLocale="pt"){
 return {pt:"Incluído na assinatura LDR ONE",en:"Included in LDR ONE",fr:"Inclus dans LDR ONE",es:"Incluido en LDR ONE"}[locale];
}
export function academyUnifiedCatalog(locale:AcademyLocale="pt"):AcademyCatalogItem[]{
 const editorial={pt:"Programa existente. Consulte os requisitos e o estado editorial; a presença no catálogo não valida a carga horária.",en:"Existing programme. Check requirements and editorial status; listing is not workload validation.",fr:"Programme existant : consultez les conditions et le statut éditorial. Le catalogue ne valide pas la durée.",es:"Programa existente: consulta requisitos y estado editorial; el catálogo no valida la duración."}[locale];
 const core:AcademyCatalogItem[]=CORE_PT.map(c=>{
  const tx=locale==="pt"?c:({...c,...CORE_I18N[locale][c.id]});const access=CORE_ACCESS[c.id]!;
  return {key:access.key,title:tx.title,description:tx.desc,detail:tx.meta,editorial,publicPath:["mentor","lead"].includes(c.id)?access.learnerPath:c.href,learnerPath:access.learnerPath,kind:"formation",category:c.kind as AcademyCategory,icon:c.icon,accent:c.accent,popular:Boolean(c.popular),includedInSubscription:true};
 });
 const professional:AcademyCatalogItem[]=PROFESSIONAL_FORMATIONS.map(f=>{const t=pfText(f,locale);return {key:f.productKey,title:t.name,description:t.description,detail:`${f.hours}h · ${f.modulesCount} ${locale==="en"?"modules":locale==="fr"?"modules":"módulos"}`,editorial,publicPath:f.publicPath,learnerPath:f.learnerPath,kind:"formation",category:category(f.slug),icon:f.icon,accent:THEMES[f.theme]??"#6D3FA0",popular:["aba-autismo","ciencias-felicidade","tricologia-terapia-capilar"].includes(f.slug),includedInSubscription:true};});
 const courses:AcademyCatalogItem[]=ACADEMY_SUBSCRIBER_COURSE_CARDS.map(c=>({key:c.productKey,title:c.name[locale],description:c.description[locale],detail:c.editorial[locale]??"",editorial:c.editorial[locale]??"",publicPath:`/cliente/cursos/assinatura/${c.slug}`,learnerPath:`/cliente/cursos/assinatura/${c.slug}`,kind:"course",category:category(c.slug),icon:"📚",accent:"#0b3764",popular:false,includedInSubscription:true}));
 const legacyTraining:AcademyCatalogItem={key:"do_mamao_ao_negocio",title:"Do Mamão ao Negócio",description:{pt:"Percurso de empreendedorismo do primeiro produto à organização de um pequeno negócio.",en:"Entrepreneurship from a first product to organising a small business.",fr:"Entrepreneuriat, du premier produit à l’organisation d’une petite entreprise.",es:"Emprendimiento, del primer producto a la organización de un pequeño negocio."}[locale],detail:{pt:"Treinamento digital",en:"Digital training",fr:"Formation numérique",es:"Formación digital"}[locale],editorial,publicPath:"/cliente/treinamentos/do-mamao-ao-negocio",learnerPath:"/cliente/treinamentos/do-mamao-ao-negocio",kind:"formation",category:"negocios",icon:"🥭",accent:"#c85a24",popular:false,includedInSubscription:true};
 const result=[...core,...professional,legacyTraining,...courses];
 if(new Set(result.map(item=>item.key)).size!==result.length)throw new Error("Duplicate Academy product identity");
 return result;
}
const PAID_ACADEMY_KEYS=new Set(academyUnifiedCatalog().map(item=>item.key));
export function isAcademySubscriptionProduct(key:string){return PAID_ACADEMY_KEYS.has(key);}

const LEGACY_FREE={
pt:[{title:"Organizar minha Carreira",desc:"Planejamento e próximos passos profissionais.",href:"/cliente/cursos/organizar-carreira",icon:"💼"},{title:"Francês para Negócios A1",desc:"Francês básico aplicado a situações profissionais.",href:"/cliente/cursos/frances-negocios-a1",icon:"🇫🇷"},{title:"Primeiros Socorros",desc:"Noções essenciais para situações de emergência.",href:"/cliente/cursos/primeiros-socorros",icon:"⛑️"}],
en:[{title:"Organize My Career",desc:"Planning and next professional steps.",href:"/cliente/cursos/organizar-carreira",icon:"💼"},{title:"French for Business A1",desc:"Basic French for professional situations.",href:"/cliente/cursos/frances-negocios-a1",icon:"🇫🇷"},{title:"First Aid",desc:"Essential knowledge for emergency situations.",href:"/cliente/cursos/primeiros-socorros",icon:"⛑️"}],
fr:[{title:"Organiser ma carrière",desc:"Planification et prochaines étapes professionnelles.",href:"/cliente/cursos/organizar-carreira",icon:"💼"},{title:"Français des affaires A1",desc:"Français de base appliqué aux situations professionnelles.",href:"/cliente/cursos/frances-negocios-a1",icon:"🇫🇷"},{title:"Premiers secours",desc:"Notions essentielles pour les situations d’urgence.",href:"/cliente/cursos/primeiros-socorros",icon:"⛑️"}],
es:[{title:"Organizar mi carrera",desc:"Planificación y próximos pasos profesionales.",href:"/cliente/cursos/organizar-carreira",icon:"💼"},{title:"Francés para Negocios A1",desc:"Francés básico aplicado a situaciones profesionales.",href:"/cliente/cursos/frances-negocios-a1",icon:"🇫🇷"},{title:"Primeros Auxilios",desc:"Conocimientos esenciales para situaciones de emergencia.",href:"/cliente/cursos/primeiros-socorros",icon:"⛑️"}]
} as const;

export function academyLegacyFreeCourses(locale:AcademyLocale="pt") {
 const keys=["curso_gratuito_organizar_carreira","curso_gratuito_frances_negocios_a1","curso_gratuito_primeiros_socorros"];
 return LEGACY_FREE[locale].map((item,index)=>({key:keys[index]!,title:item.title,description:item.desc,href:item.href,icon:item.icon}));
}
export function academyFreeLabel(locale:AcademyLocale="pt"){return {pt:"Gratuito",en:"Free",fr:"Gratuit",es:"Gratis"}[locale];}

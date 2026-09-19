import { ACADEMY_CAREER_JOURNEY_COURSES } from "./academy-career-journey.catalog";
import { ACADEMY_SUBSCRIPTION_COURSES } from "./academy-subscription-courses.catalog";

export type JourneyCatalogRelation="enrich-existing"|"related"|"new";
export type JourneyCatalogMap={journeySlug:string;existingSlug?:string;relation:JourneyCatalogRelation;reason:string};

/** Editorial mapping: prevents semantic duplicates while preserving the 50-course journey architecture. */
export const CAREER_JOURNEY_CATALOG_MAP:JourneyCatalogMap[]=[
 {journeySlug:"curriculo-baseado-em-evidencias",existingSlug:"curriculo-estrategico-como-apresentar-sua-historia-profissional",relation:"enrich-existing",reason:"mesmo núcleo de currículo; incorporar evidências ao curso existente"},
 {journeySlug:"leitura-estrategica-de-vagas",existingSlug:"como-selecionar-a-vaga-certa-para-o-seu-perfil",relation:"enrich-existing",reason:"mesma decisão central de leitura e seleção de vagas"},
 {journeySlug:"entrevistas-baseadas-em-competencias",existingSlug:"como-se-preparar-para-uma-entrevista-de-emprego",relation:"enrich-existing",reason:"competências devem aprofundar o curso existente de entrevista"},
 {journeySlug:"escrita-profissional",existingSlug:"redacao-profissional-e-escrita-para-processos-seletivos",relation:"enrich-existing",reason:"sobreposição forte de escrita profissional"},
 {journeySlug:"reunioes-que-produzem-decisoes",existingSlug:"como-conduzir-reunioes-e-apresentacoes-com-seguranca",relation:"enrich-existing",reason:"aprofundamento de reuniões dentro do curso existente"},
 {journeySlug:"como-apresentar-ideias",existingSlug:"como-fazer-apresentacoes-profissionais",relation:"enrich-existing",reason:"apresentação de ideias é aplicação direta do curso existente"},
 {journeySlug:"ia-como-ferramenta-de-trabalho",existingSlug:"inteligencia-artificial-para-estudantes-e-profissionais",relation:"enrich-existing",reason:"mesmo núcleo de IA aplicada a estudo e trabalho"},
 {journeySlug:"preparacao-carreira-internacional",existingSlug:"orientacao-de-carreira-internacional",relation:"enrich-existing",reason:"mesmo objetivo de preparação internacional"},
 {journeySlug:"networking-troca-de-valor",existingSlug:"linkedin-profissional-perfil-networking-e-oportunidades",relation:"related",reason:"networking é mais amplo que LinkedIn; manter relação sem fundir completamente"},
 {journeySlug:"organizacao-mental-alta-demanda",existingSlug:"organizacao-pessoal-e-gestao-do-tempo",relation:"related",reason:"organização mental e gestão do tempo se complementam"},
 {journeySlug:"estudo-trabalho-vida-pessoal",existingSlug:"organizacao-pessoal-e-gestao-do-tempo",relation:"related",reason:"equilíbrio de papéis usa organização, mas tem escopo próprio"},
 {journeySlug:"prevencao-esgotamento-inicio-carreira",existingSlug:"produtividade-sem-ansiedade",relation:"related",reason:"conteúdos educacionais relacionados, sem equivalência clínica"},
 {journeySlug:"mapa-carreira-baseado-competencias",existingSlug:"orientacao-de-carreira",relation:"related",reason:"orientação geral apoia o mapa, mas competências exigem percurso próprio"},
 {journeySlug:"mobilidade-profissional",existingSlug:"transicao-de-carreira-com-planejamento",relation:"related",reason:"mobilidade inclui transição, mas também progressão e movimento interno"},
];

const mapped=new Set(CAREER_JOURNEY_CATALOG_MAP.map(x=>x.journeySlug));
export const CAREER_JOURNEY_NEW_COURSES=ACADEMY_CAREER_JOURNEY_COURSES.filter(c=>!mapped.has(c.slug));
export const CAREER_JOURNEY_ENRICHMENTS=CAREER_JOURNEY_CATALOG_MAP.filter(x=>x.relation==="enrich-existing");
export const CAREER_JOURNEY_RELATED=CAREER_JOURNEY_CATALOG_MAP.filter(x=>x.relation==="related");

export function validateCareerJourneyCatalog(){
 const journeySlugs=new Set(ACADEMY_CAREER_JOURNEY_COURSES.map(c=>c.slug));
 const existingSlugs=new Set(ACADEMY_SUBSCRIPTION_COURSES.map(c=>c.slug));
 const invalidJourney=CAREER_JOURNEY_CATALOG_MAP.filter(x=>!journeySlugs.has(x.journeySlug));
 const invalidExisting=CAREER_JOURNEY_CATALOG_MAP.filter(x=>x.existingSlug&&!existingSlugs.has(x.existingSlug));
 return {totalJourney:ACADEMY_CAREER_JOURNEY_COURSES.length,newCourses:CAREER_JOURNEY_NEW_COURSES.length,enrichments:CAREER_JOURNEY_ENRICHMENTS.length,related:CAREER_JOURNEY_RELATED.length,invalidJourney,invalidExisting};
}

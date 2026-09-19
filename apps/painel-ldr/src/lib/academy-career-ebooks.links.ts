import { ACADEMY_CAREER_EBOOKS } from "./academy-career-ebooks.catalog";
import { ACADEMY_CAREER_JOURNEY_COURSES } from "./academy-career-journey.catalog";
export type EbookCourseLink={ebookSlug:string;courseSlugs:string[];moment:"explore"|"prepare"|"apply"|"transition";};
export const ACADEMY_EBOOK_COURSE_LINKS:EbookCourseLink[]=[
{ebookSlug:"meu-primeiro-salario-e-agora",courseSlugs:["primeiro-salario","orcamento-inicio-vida-profissional","reserva-financeira-renda-inicial"],moment:"apply"},
{ebookSlug:"decidir-com-ia",courseSlugs:["ia-como-ferramenta-de-trabalho","decisoes-profissionais-sob-pressao","plano-profissional-12-meses"],moment:"prepare"},
{ebookSlug:"ia-busca-por-trabalho",courseSlugs:["leitura-estrategica-de-vagas","processos-seletivos-da-inscricao-a-decisao","ia-como-ferramenta-de-trabalho"],moment:"apply"},
{ebookSlug:"sua-experiencia-vale-mais",courseSlugs:["curriculo-baseado-em-evidencias","portfolio-para-quem-ainda-nao-tem-experiencia","projetos-academicos-em-experiencia-profissional"],moment:"prepare"},
{ebookSlug:"antes-de-pedir-demissao",courseSlugs:["financas-transicoes-carreira","mobilidade-profissional","plano-profissional-12-meses"],moment:"transition"},
{ebookSlug:"plano-proximos-90-dias",courseSlugs:["primeiros-90-dias-no-trabalho","plano-profissional-12-meses"],moment:"apply"},
{ebookSlug:"quando-voce-nao-sabe-qual-caminho-seguir",courseSlugs:["mapa-carreira-baseado-competencias","identificando-lacunas-competencias"],moment:"explore"},
{ebookSlug:"produtividade-sem-guerra",courseSlugs:["organizacao-mental-alta-demanda","estudo-trabalho-vida-pessoal","prevencao-esgotamento-inicio-carreira"],moment:"prepare"},
];
export function validateEbookCourseLinks(){const ebooks=new Set(ACADEMY_CAREER_EBOOKS.map(e=>e.slug));const courses=new Set(ACADEMY_CAREER_JOURNEY_COURSES.map(c=>c.slug));return {invalidEbooks:ACADEMY_EBOOK_COURSE_LINKS.filter(x=>!ebooks.has(x.ebookSlug)).map(x=>x.ebookSlug),invalidCourses:ACADEMY_EBOOK_COURSE_LINKS.flatMap(x=>x.courseSlugs.filter(s=>!courses.has(s))),linkedEbooks:ACADEMY_EBOOK_COURSE_LINKS.length,totalEbooks:ebooks.size};}
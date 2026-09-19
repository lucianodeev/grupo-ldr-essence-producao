export type AcademyCareerEbook={slug:string;title:string;category:string;primaryCompetency:string;order:number;subscriptionIncluded:true;educational:true;};
/** Canonical 20-eBook collection. Editorial bodies are versioned separately from catalog metadata. */
export const ACADEMY_CAREER_EBOOKS:AcademyCareerEbook[]=[
 {slug:"quando-voce-nao-sabe-qual-caminho-seguir",title:"Quando Você Não Sabe Qual Caminho Seguir",category:"Decisões e Vida",primaryCompetency:"career-planning",order:1,subscriptionIncluded:true,educational:true},
 {slug:"recomecar-sem-comecar-do-zero",title:"Recomeçar sem Começar do Zero",category:"Decisões e Vida",primaryCompetency:"career-planning",order:2,subscriptionIncluded:true,educational:true},
 {slug:"vida-nao-precisa-estar-toda-resolvida",title:"A Vida Não Precisa Estar Toda Resolvida",category:"Decisões e Vida",primaryCompetency:"decision-making",order:3,subscriptionIncluded:true,educational:true},
 {slug:"pequenas-decisoes-grandes-mudancas",title:"Pequenas Decisões, Grandes Mudanças",category:"Decisões e Vida",primaryCompetency:"decision-making",order:4,subscriptionIncluded:true,educational:true},
 {slug:"peso-de-se-comparar",title:"O Peso de Se Comparar",category:"Decisões e Vida",primaryCompetency:"self-organization",order:5,subscriptionIncluded:true,educational:true},
 {slug:"carreira-nao-e-linha-reta",title:"Sua Carreira Não É uma Linha Reta",category:"Carreira",primaryCompetency:"career-planning",order:6,subscriptionIncluded:true,educational:true},
 {slug:"escolher-carreira-sem-prever-futuro",title:"Como Escolher uma Carreira sem Tentar Prever o Futuro",category:"Carreira",primaryCompetency:"career-planning",order:7,subscriptionIncluded:true,educational:true},
 {slug:"quando-nao-sabe-no-que-e-bom",title:"O Que Fazer Quando Você Não Sabe no Que É Bom",category:"Carreira",primaryCompetency:"career-readiness",order:8,subscriptionIncluded:true,educational:true},
 {slug:"antes-de-pedir-demissao",title:"Antes de Pedir Demissão",category:"Carreira",primaryCompetency:"decision-making",order:9,subscriptionIncluded:true,educational:true},
 {slug:"sua-experiencia-vale-mais",title:"Sua Experiência Vale Mais do que Parece",category:"Carreira",primaryCompetency:"evidence-building",order:10,subscriptionIncluded:true,educational:true},
 {slug:"decidir-com-ia",title:"Decidir com IA sem Entregar sua Vida ao Algoritmo",category:"IA",primaryCompetency:"decision-making",order:11,subscriptionIncluded:true,educational:true},
 {slug:"perguntas-melhores-com-ia",title:"Perguntas Melhores para Decisões Melhores com IA",category:"IA",primaryCompetency:"continuous-learning",order:12,subscriptionIncluded:true,educational:true},
 {slug:"ia-organizar-vida-trabalho",title:"IA para Organizar a Vida e o Trabalho",category:"IA",primaryCompetency:"self-organization",order:13,subscriptionIncluded:true,educational:true},
 {slug:"ia-busca-por-trabalho",title:"IA na Busca por Trabalho",category:"IA",primaryCompetency:"career-readiness",order:14,subscriptionIncluded:true,educational:true},
 {slug:"dinheiro-sem-complicacao",title:"Dinheiro sem Complicação",category:"Finanças",primaryCompetency:"financial-literacy",order:15,subscriptionIncluded:true,educational:true},
 {slug:"meu-primeiro-salario-e-agora",title:"Meu Primeiro Salário: E Agora?",category:"Finanças",primaryCompetency:"budgeting",order:16,subscriptionIncluded:true,educational:true},
 {slug:"antes-de-comprar-decisoes-financeiras",title:"Antes de Comprar: Um Guia para Decisões Financeiras",category:"Finanças",primaryCompetency:"decision-making",order:17,subscriptionIncluded:true,educational:true},
 {slug:"quando-tudo-parece-urgente",title:"Quando Tudo Parece Urgente",category:"Organização",primaryCompetency:"pressure-decisions",order:18,subscriptionIncluded:true,educational:true},
 {slug:"produtividade-sem-guerra",title:"Produtividade sem Guerra Contra Você Mesmo",category:"Organização",primaryCompetency:"self-organization",order:19,subscriptionIncluded:true,educational:true},
 {slug:"plano-proximos-90-dias",title:"Um Plano para os Próximos 90 Dias",category:"Organização",primaryCompetency:"career-planning",order:20,subscriptionIncluded:true,educational:true},
];
export const ACADEMY_CAREER_EBOOK_CATEGORIES=[...new Set(ACADEMY_CAREER_EBOOKS.map(e=>e.category))];
export function getAcademyCareerEbook(slug:string){return ACADEMY_CAREER_EBOOKS.find(e=>e.slug===slug)??null;}

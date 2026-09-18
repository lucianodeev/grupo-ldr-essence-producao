export type AcademyLocale = "pt" | "en" | "fr" | "es";

type I18nText = Record<AcademyLocale, string>;
export type SubscriptionCourseModule = {
  title: string;
  topics: string[];
  activity: string;
};
export type SubscriptionCourse = {
  slug: string;
  productKey: string;
  category: "comportamento" | "gestao" | "marketing" | "educacao" | "direito" | "psicanalise";
  track: string;
  hours: number;
  certificate: true;
  subscriptionOnly: true;
  name: I18nText;
  description: I18nText;
  modules: SubscriptionCourseModule[];
  materials: string[];
  disclaimer?: I18nText;
};

const modulePlan=[
  ["Antes de começar","preparar o percurso de estudo"],
  ["Mapa do ponto de partida","identificar contexto, necessidades e limites"],
  ["Fundamentos essenciais","compreender conceitos centrais"],
  ["Diagnóstico prático","analisar situações reais ou simuladas"],
  ["Ferramentas de organização","estruturar informações e prioridades"],
  ["Comunicação e posicionamento","apresentar ideias com clareza"],
  ["Aplicação orientada","transformar teoria em ação"],
  ["Erros comuns e cuidados","evitar promessas, atalhos e decisões frágeis"],
  ["Exercício de aprofundamento","praticar com roteiro guiado"],
  ["Estudo de caso","interpretar um cenário completo"],
  ["Construção de material próprio","produzir um recurso reutilizável"],
  ["Revisão crítica","melhorar a entrega com critérios"],
  ["Plano de continuidade","organizar próximos passos"],
  ["Projeto aplicado","consolidar uma entrega prática"],
  ["Fechamento e certificado","revisar aprendizados e preparar a conclusão"],
] as const;

const modulesFor=(focus:string):SubscriptionCourseModule[]=>modulePlan.map(([title,objective],idx)=>({
  title:`${title}: ${focus}`,
  topics:[objective,`aplicação em ${focus}`,"atividade prática com revisão"],
  activity:`Produzir uma entrega curta sobre ${focus} ligada ao módulo ${idx+1}, com registro do que foi aprendido e um próximo passo possível.`
}));

type CourseSeed = Omit<SubscriptionCourse,"certificate"|"subscriptionOnly"|"modules"> & {focus:string};

const seeds:CourseSeed[] = [
  {
    "slug": "como-se-preparar-para-uma-entrevista-de-emprego",
    "productKey": "curso_assinatura_como_se_preparar_para_uma_entrevista_de_emprego",
    "category": "gestao",
    "track": "Primeiro Emprego",
    "hours": 80,
    "name": {
      "pt": "Como se Preparar para uma Entrevista de Emprego",
      "en": "Como se Preparar para uma Entrevista de Emprego",
      "fr": "Como se Preparar para uma Entrevista de Emprego",
      "es": "Como se Preparar para uma Entrevista de Emprego"
    },
    "description": {
      "pt": "Curso livre para estudar preparação para entrevistas com método, prática e direção profissional, conectando aprendizado, aplicação real e próximos passos dentro da trilha Primeiro Emprego.",
      "en": "Curso livre para estudar preparação para entrevistas com método, prática e direção profissional, conectando aprendizado, aplicação real e próximos passos dentro da trilha Primeiro Emprego.",
      "fr": "Curso livre para estudar preparação para entrevistas com método, prática e direção profissional, conectando aprendizado, aplicação real e próximos passos dentro da trilha Primeiro Emprego.",
      "es": "Curso livre para estudar preparação para entrevistas com método, prática e direção profissional, conectando aprendizado, aplicação real e próximos passos dentro da trilha Primeiro Emprego."
    },
    "focus": "preparação para entrevistas",
    "materials": [
      "Checklist prático de preparação para entrevistas",
      "Roteiro guiado para aplicar preparação para entrevistas",
      "Plano de ação editável de preparação para entrevistas"
    ]
  }
];

export const ACADEMY_SUBSCRIPTION_COURSES:SubscriptionCourse[] = seeds.map(({focus,...course})=>({
  ...course,
  certificate:true,
  subscriptionOnly:true,
  modules:modulesFor(focus),
}));

export const ACADEMY_SUBSCRIPTION_TRACKS = Array.from(new Set(ACADEMY_SUBSCRIPTION_COURSES.map((course)=>course.track)));

export function getAcademySubscriptionCourse(slug:string){
  return ACADEMY_SUBSCRIPTION_COURSES.find((course)=>course.slug===slug)??null;
}

export function academySubscriptionCoursesByTrack(track:string){
  return ACADEMY_SUBSCRIPTION_COURSES.filter((course)=>course.track===track);
}

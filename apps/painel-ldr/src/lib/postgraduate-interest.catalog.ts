export const POSTGRADUATE_COURSES = {
  "ia-negocios-gestao": "Inteligência Artificial Aplicada aos Negócios e à Gestão",
  "gestao-pessoas-lideranca-rh": "Gestão Estratégica de Pessoas, Liderança e RH",
  "empreendedorismo-inovacao-negocios": "Empreendedorismo, Inovação e Gestão de Negócios",
  "carreira-mentoria-desenvolvimento": "Gestão de Carreira, Mentoria e Desenvolvimento Profissional",
  "marketing-vendas-ia": "Marketing Digital, Vendas e Inteligência Artificial",
  "negocios-internacionais-expansao": "Negócios Internacionais e Expansão de Empresas",
  "psicanalise-cultura-comportamento": "Psicanálise, Cultura e Comportamento Organizacional",
} as const;

export type PostgraduateCourseKey = keyof typeof POSTGRADUATE_COURSES;

export function postgraduateCourseTitle(courseKey: string): string | null {
  return POSTGRADUATE_COURSES[courseKey as PostgraduateCourseKey] ?? null;
}

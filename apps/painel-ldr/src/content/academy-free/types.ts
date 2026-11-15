export type EditorialLesson = {
  id: string;
  minutes: number;
  objectives: string[];
  sections: { title: string; paragraphs: string[] }[];
  caseStudy: string;
  exercise: string;
  assessment: { question: string; answer: string; criteria: string[] };
  sourceIds: string[];
  template?: { title: string; body: string };
};
export const EDITORIAL_SOURCES: Record<
  string,
  { title: string; url: string; consulted: string; scope: string }
> = {
  edpb: {
    title: "European Data Protection Board. Data protection basics — Guide for small business.",
    url: "https://www.edpb.europa.eu/sme/learn-the-basics/data-protection-basics_en",
    consulted: "2026-11-15",
    scope:
      "Conceitos de dados pessoais, identificação indireta e categorias sensíveis. A aula não decide a base jurídica de um serviço concreto nem valida modelos legais.",
  },

  cervantes: {
    title: "Instituto Cervantes. Plan curricular: índice e inventário A1–A2 de noções específicas.",
    url: "https://cvc.cervantes.es/ensenanza/biblioteca_ele/plan_curricular/indice.htm",
    consulted: "2026-11-15",
    scope:
      "Índice e resultados do inventário consultados. A página de gramática detalhada estava em manutenção; não se declara consulta integral do manual.",
  },
  camoes: {
    title: "Camões, I.P. Português para Estrangeiros, nível A1 (Básico).",
    url: "https://ww3.instituto-camoes.pt/activity/servicos-online/ensino-a-distancia/cursos-gerais-de-portugues/basico/portuguese-for-foreigners-level-a1-basico",
    consulted: "2026-11-15",
    scope:
      "Apresentação institucional e objetivos comunicativos de curso A1; não se teve acesso às aulas do curso Camões.",
  },
  taalunie: {
    title: "Taalunie. Grammatica: apresentação da Algemene Nederlandse Spraakkunst.",
    url: "https://www.taalunie.org/kennisbank/grammatica",
    consulted: "2026-11-15",
    scope: "Recurso institucional de gramática. Não equivale à leitura integral da ANS.",
  },
  "dutch-hebben": {
    title: "Algemene Nederlandse Spraakkunst. 2.3.6.1 Hebben; e Taaladvies.net, U heeft / hebt.",
    url: "https://e-ans.ivdnt.org/topics/pid/ans02030601lingtopic",
    consulted: "2026-11-15",
    scope:
      "Formas de hebben e inversão, com variantes de u. Consulta complementar: https://taaladvies.net/u-heeft-of-hebt/.",
  },
  "dutch-negation": {
    title: "Vlaanderen — Team Taaladvies. Niet / geen.",
    url: "https://www.vlaanderen.be/team-taaladvies/taaladviezen/niet-geen",
    consulted: "2026-11-15",
    scope:
      "Distinções e sobreposição de uso entre niet e geen; exemplos da aula são originais e introdutórios.",
  },
  "dw-a1": {
    title: "Deutsche Welle. Nicos Weg A1 — Grammatikübersicht.",
    url: "https://static.dw.com/downloads/59835913/grammatikuebersicht-nicos-weg-a1.pdf",
    consulted: "2026-11-15",
    scope:
      "Índice de tópicos gramaticais A1 consultado. Esta aula não reproduz o curso nem declara consulta integral a todas as suas lições.",
  },

  cefr: {
    title: "Council of Europe. The CEFR Levels.",
    url: "https://www.coe.int/en/web/common-european-framework-reference-languages/level-descriptions",
    consulted: "2026-11-15",
    scope:
      "Referência de níveis e capacidades comunicativas; esta sequência escrita não certifica um nível global.",
  },
  "british-present": {
    title: "British Council LearnEnglish. Present simple (A1–A2).",
    url: "https://learnenglish.britishcouncil.org/free-resources/grammar/a1-a2/present-simple",
    consulted: "2026-11-15",
    scope:
      "Uso habitual, terceira pessoa e perguntas e negativas com do/does. Exemplos e atividades desta aula são originais.",
  },

  prisma: {
    title:
      "Page et al. (2021). The PRISMA 2020 statement. BMJ, 372:n71. Registo e orientação EQUATOR.",
    url: "https://www.equator-network.org/reporting-guidelines/prisma/",
    consulted: "2026-11-15",
    scope:
      "Relato de revisões sistemáticas; a página de orientação foi consultada, não todos os artigos nela citados.",
  },
  icmje: {
    title: "ICMJE. Preparing a Manuscript for Submission to a Medical Journal.",
    url: "https://www.icmje.org/recommendations/browse/manuscript-preparation/preparing-for-submission.html",
    consulted: "2026-11-15",
    scope:
      "Estrutura e relato de manuscritos médicos; não constitui norma universal de todas as disciplinas.",
  },
  unesco: {
    title: "UNESCO. Recommendation on Open Science (2021): página institucional de apresentação.",
    url: "https://www.unesco.org/en/open-science/about",
    consulted: "2026-11-15",
    scope:
      "Abertura, inclusão e limites de partilha para proteção de direitos e confidencialidade.",
  },
};

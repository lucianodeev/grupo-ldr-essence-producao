export type EditorialLesson = {
  id: string;
  minutes: number;
  objectives: string[];
  sections: { title: string; paragraphs: string[] }[];
  caseStudy: string;
  exercise: string;
  assessment: { question: string; answer: string; criteria: string[] };
  sourceIds: string[];
};
export const EDITORIAL_SOURCES: Record<
  string,
  { title: string; url: string; consulted: string; scope: string }
> = {
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

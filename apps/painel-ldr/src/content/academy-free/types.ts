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
  "freud-origin": {
    title:
      "Freud (1910). The Origin and Development of Psychoanalysis. American Journal of Psychology, 21, 181–218. Conferências I e III.",
    url: "https://psychclassics.yorku.ca/Freud/Origin/index.htm",
    consulted: "2026-11-15",
    scope:
      "Textos das conferências I e III consultados no arquivo educacional da York University; não se declara consulta direta dos atendimentos históricos.",
  },
  "freud-repression": {
    title: "Freud (1915). Repression.",
    url: "https://lutecium.org/ftp/Freud/pdf/1915_repression.pdf",
    consulted: "2026-11-15",
    scope:
      "Trechos do texto primário em tradução inglesa consultados, especialmente abertura e delimitação do conceito. Não é evidência atual de eficácia.",
  },
  "freud-working": {
    title: "Freud (1914). Remembering, Repeating and Working-Through.",
    url: "https://marcuse.faculty.history.ucsb.edu/classes/201/articles/1914FreudRemembering.pdf",
    consulted: "2026-11-15",
    scope:
      "Texto em tradução inglesa disponibilizado pela UCSB; abertura e distinções entre recordar, repetir e elaborar. Não reproduzido como material local.",
  },
  "freud-intro": {
    title:
      "Freud (1916–1917). A General Introduction to Psychoanalysis. Tradução G. Stanley Hall, edição inglesa de 1920.",
    url: "https://www.gutenberg.org/files/38219/38219-h/38219-h.htm",
    consulted: "2026-11-15",
    scope:
      "Passagens das conferências 23 e 27 consultadas para a exposição histórica de sintoma e transferência; não se afirma leitura integral de todas as conferências.",
  },
  "freud-constructions": {
    title: "Freud (1937). Constructions in Analysis.",
    url: "https://www.lutecium.org/ftp/Freud/pdf/1937_constructions_in_analysis.pdf",
    consulted: "2026-11-15",
    scope:
      "Abertura e discussão de interpretação/construção e das respostas do interlocutor. A tradução não é reproduzida; a aula contém redação e casos originais.",
  },
  "freud-dream-interpretation": {
    title:
      "Freud (1900). The Interpretation of Dreams. Edição inglesa de 1913, tradução A. A. Brill.",
    url: "https://www.gutenberg.org/files/66048/66048-h/66048-h.htm",
    consulted: "2026-11-15",
    scope:
      "Passagens do capítulo VII sobre sistemas e consciência consultadas. Original de 1900 e edição consultada de 1913 são distinguidos.",
  },
  "freud-ego-id": {
    title: "Freud (1923). The Ego and the Id. Tradução Joan Riviere, edição inglesa de 1927.",
    url: "https://www.gutenberg.org/files/79682/79682-h/79682-h.htm",
    consulted: "2026-11-15",
    scope:
      "Introdução e discussão inicial de consciência, ego e id consultadas. Disponibilidade num arquivo dos EUA não é declaração universal de direitos de tradução; nenhum texto integral foi copiado.",
  },
  "freud-three-essays": {
    title:
      "Freud (1905). Three Contributions to the Theory of Sex. Tradução A. A. Brill, edição de 1920.",
    url: "https://www.gutenberg.org/files/14969/14969-h/14969-h.htm",
    consulted: "2026-11-15",
    scope:
      "Prefácios, delimitação inicial e passagens do segundo ensaio consultados; o texto contém revisões posteriores a 1905 e terminologia histórica.",
  },
  "freud-on-dreams": {
    title: "Freud (1901). On Dreams. Tradução M. D. Eder, edição de 1914.",
    url: "https://www.gutenberg.org/files/75333/75333-h/75333-h.htm",
    consulted: "2026-11-15",
    scope:
      "Secções sobre manifesto/latente e trabalho do sonho consultadas. Estudo histórico, sem uso como comprovação factual de acontecimentos.",
  },
  "freud-beginning": {
    title: "Freud (1913). On Beginning the Treatment.",
    url: "https://www.lutecium.org/ftp/Freud/pdf/1913_on_beginning_the_treatment.pdf",
    consulted: "2026-11-15",
    scope:
      "Abertura sobre recomendações e limites de mecanização consultada; não apresentada como protocolo atual ou instrução para exercer clínica.",
  },
  "freud-recommendations": {
    title: "Freud (1912). Recommendations to Physicians Practising Psycho-Analysis.",
    url: "https://www.lutecium.org/ftp/Freud/pdf/1912_recommendations_to_physicians_practising_psycho_analysis.pdf",
    consulted: "2026-11-15",
    scope:
      "Abertura e passagens sobre atenção e seleção de material consultadas; não se substituem requisitos atuais de registo, segurança ou prática profissional.",
  },

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

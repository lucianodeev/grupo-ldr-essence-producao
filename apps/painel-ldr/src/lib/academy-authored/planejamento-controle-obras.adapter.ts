import type { PFLocale } from "@/lib/academy-professional-formations.catalog";
import {
  PLANEJAMENTO_CONTROLE_OBRAS_INITIAL_LESSONS,
  type AcademyAuthoredLesson,
} from "./planejamento-controle-obras.initial";
import { PLANEJAMENTO_CONTROLE_OBRAS_QUANTITATIVOS } from "./planejamento-controle-obras.quantitativos";
import { PLANEJAMENTO_CONTROLE_OBRAS_CUSTOS } from "./planejamento-controle-obras.custos";
import { PLANEJAMENTO_CONTROLE_OBRAS_CONTROLE } from "./planejamento-controle-obras.controle";

/**
 * Adaptador editorial para a estrutura consumida pela área do aluno.
 * Não registra a formação no catálogo e não altera a geração de cursos existentes.
 * Publicação deliberadamente bloqueada enquanto houver lacunas e traduções pendentes.
 */
const draftLessons: AcademyAuthoredLesson[] = [
  ...PLANEJAMENTO_CONTROLE_OBRAS_INITIAL_LESSONS,
  ...PLANEJAMENTO_CONTROLE_OBRAS_QUANTITATIVOS,
  ...PLANEJAMENTO_CONTROLE_OBRAS_CUSTOS,
  ...PLANEJAMENTO_CONTROLE_OBRAS_CONTROLE,
];

const draftModules = [
  "Escopo e definição do empreendimento",
  "Quantitativos e memória de cálculo",
  "Redes de precedência e cronograma",
  "Produtividade e duração de serviços",
  "Composição de custos diretos",
  "Cronograma físico-financeiro",
  "Curva ABC e prioridades de custo",
  "Medições e aceite contratual",
  "Aquisições e logística de suprimentos",
  "Riscos e respostas planejadas",
  "Indicadores e acompanhamento",
  "Auditoria e encerramento de obra",
] as const;

export const PLANEJAMENTO_CONTROLE_OBRAS_DRAFT_STATUS = {
  slug: "planejamento-controle-obras",
  language: "pt",
  expectedModules: 12,
  expectedLessons: 144,
  writtenLessons: draftLessons.length,
  publicationReady: false,
  reviewRequired: true,
} as const;

export function validatePlanejamentoControleObrasDraft(): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  const titles = new Set<string>();
  for (const lesson of draftLessons) {
    if (ids.has(lesson.id)) errors.push(`ID duplicado: ${lesson.id}`);
    ids.add(lesson.id);
    const title = lesson.title.trim().toLocaleLowerCase("pt-BR");
    if (titles.has(title)) errors.push(`Título duplicado: ${lesson.title}`);
    titles.add(title);
    if (!lesson.objective.trim() || lesson.content.length < 3) errors.push(`Teoria insuficiente: ${lesson.id}`);
    if (!lesson.caseStudy.trim() || !lesson.exercise.trim() || lesson.assessment.length < 2)
      errors.push(`Atividade ou rubrica incompleta: ${lesson.id}`);
    if (lesson.references.length === 0) errors.push(`Sem bibliografia: ${lesson.id}`);
    const match = /^pco-m(\d{2})-a(\d{2})$/.exec(lesson.id);
    if (!match || Number(match[1]) < 1 || Number(match[1]) > 12)
      errors.push(`Código de módulo inválido: ${lesson.id}`);
  }
  if (draftModules.length !== 12) errors.push("A estrutura precisa de 12 módulos.");
  if (draftLessons.length !== 144)
    errors.push(`Formação incompleta: ${draftLessons.length}/144 aulas redigidas.`);
  return errors;
}

export function getPlanejamentoControleObrasDraft(locale: PFLocale) {
  if (locale !== "pt") return null; // Sem tradução revisada: não exibir conteúdo em idioma incorreto.
  const groups = draftModules.map((title, index) => ({
    id: index + 1,
    title,
    lessons: [] as Array<{ id: string; title: string; summary: string; content: string[] }>,
  }));
  for (const lesson of draftLessons) {
    const match = /^pco-m(\d{2})-a(\d{2})$/.exec(lesson.id);
    if (!match) continue;
    const group = groups[Number(match[1]) - 1];
    if (!group) continue;
    group.lessons.push({
      id: lesson.id,
      title: lesson.title,
      summary: lesson.objective,
      content: [
        `Objetivo: ${lesson.objective}`,
        ...lesson.content,
        `Caso aplicado: ${lesson.caseStudy}`,
        `Atividade: ${lesson.exercise}`,
        ...lesson.assessment.map((criterion, i) => `Critério de avaliação ${i + 1}: ${criterion}`),
        ...lesson.references.map((reference) => `Referência: ${reference}`),
      ],
    });
  }
  return groups;
}

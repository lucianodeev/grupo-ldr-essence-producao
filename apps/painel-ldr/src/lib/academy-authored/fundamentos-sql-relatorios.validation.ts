import { SQL_RELATORIOS_AUTHORED_DRAFT, type SqlAuthoredLesson } from "./fundamentos-sql-relatorios.initial";
import { SQL_RELATORIOS_AGREGACOES } from "./fundamentos-sql-relatorios.agregacoes";
import { SQL_RELATORIOS_TEMPORALIDADE } from "./fundamentos-sql-relatorios.temporalidade";
import { SQL_RELATORIOS_FINAL } from "./fundamentos-sql-relatorios.final";

/** Reúne as 12 unidades redigidas sem disponibilizá-las ao catálogo público. */
export const SQL_RELATORIOS_12_UNIDADES: readonly SqlAuthoredLesson[] = [
  ...SQL_RELATORIOS_AUTHORED_DRAFT,
  ...SQL_RELATORIOS_AGREGACOES,
  ...SQL_RELATORIOS_TEMPORALIDADE,
  ...SQL_RELATORIOS_FINAL
];

export interface SqlDraftQualityReport {
  lessons: number;
  uniqueIds: number;
  issues: string[];
  publicationReady: false;
}

/** Verificação estrutural, não substitui revisão editorial nem execução de SQL. */
export function validateSqlRelatoriosDraft(): SqlDraftQualityReport {
  const issues: string[] = [];
  const ids = new Set<string>();
  const titles = new Set<string>();
  const queries = new Set<string>();
  for (const [index, lesson] of SQL_RELATORIOS_12_UNIDADES.entries()) {
    const label = `aula ${index + 1}`;
    if (!/^sql60-m\d{2}-a\d{2}$/.test(lesson.id)) issues.push(`${label}: id fora do padrão`);
    if (ids.has(lesson.id)) issues.push(`${label}: id duplicado ${lesson.id}`);
    ids.add(lesson.id);
    const title = lesson.title.trim().toLocaleLowerCase("pt");
    if (!title) issues.push(`${label}: título ausente`);
    if (titles.has(title)) issues.push(`${label}: título repetido`);
    titles.add(title);
    if (!lesson.objective.trim()) issues.push(`${label}: objetivo ausente`);
    if (lesson.content.length < 3 || lesson.content.some(p => p.trim().length < 35)) issues.push(`${label}: conteúdo insuficiente`);
    const sql = lesson.sql.trim();
    if (!sql || !/\bselect\b/i.test(sql)) issues.push(`${label}: consulta SQL ausente`);
    if (queries.has(sql.toLocaleLowerCase())) issues.push(`${label}: SQL repetido`);
    queries.add(sql.toLocaleLowerCase());
    if (!lesson.exercise.trim() || !lesson.expectedAnswer.trim()) issues.push(`${label}: exercício ou resposta ausente`);
    if (lesson.references.length < 1) issues.push(`${label}: referências ausentes`);
  }
  if (SQL_RELATORIOS_12_UNIDADES.length !== 12) issues.push("Quantidade de unidades diferente de 12");
  return { lessons: SQL_RELATORIOS_12_UNIDADES.length, uniqueIds: ids.size, issues, publicationReady: false };
}

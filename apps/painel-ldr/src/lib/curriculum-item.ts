/** Recover a stale saved position without accessing a missing lesson. */
export function curriculumItem<T>(items: readonly T[], index: number): T {
  const position = Number.isFinite(index)
    ? Math.max(0, Math.min(Math.trunc(index), items.length - 1))
    : 0;
  const item = items[position];
  if (item === undefined) {
    throw new Error("O conteúdo desta formação não está disponível. Tente novamente mais tarde.");
  }
  return item;
}

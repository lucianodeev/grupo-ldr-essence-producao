import { ENGLISH_LESSONS } from "../content/academy-free/english-a1";
import { RESEARCH_LESSONS } from "../content/academy-free/research-methods";
import type { EditorialLesson } from "../content/academy-free/types";
export function freeCourseLessons(slug: string): readonly EditorialLesson[] {
  if (slug === "orientacao-trabalho-cientifico") return RESEARCH_LESSONS;
  if (slug === "ingles-basico-a1") return ENGLISH_LESSONS;
  return [];
}
export type FreeLearningState = { index: number; done: number[] };
export function restoreFreeLearningState(value: unknown, count: number): FreeLearningState {
  const x = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const done = Array.isArray(x["done"])
    ? [
        ...new Set(
          x["done"].filter(
            (n): n is number => typeof n === "number" && Number.isInteger(n) && n >= 0 && n < count,
          ),
        ),
      ]
    : [];
  const index =
    typeof x["index"] === "number" && Number.isInteger(x["index"])
      ? Math.max(0, Math.min(Math.max(0, count - 1), x["index"]))
      : 0;
  return { index, done };
}
export function freeStudyPercent(done: number[], count: number, savedPercent = 0) {
  const safe = restoreFreeLearningState({ done }, count);
  const floor = Number.isFinite(savedPercent) ? Math.max(0, Math.min(100, savedPercent)) : 0;
  return Math.max(floor, count > 0 ? Math.round((safe.done.length / count) * 100) : 0);
}
// Navigation is separate from completion. Retain legacy records, including pending lessons.
export function recordFreeLesson(
  state: FreeLearningState,
  lessons: readonly EditorialLesson[],
  reviewed: boolean,
): FreeLearningState {
  if (!reviewed || !lessons[state.index]) return state;
  return { ...state, done: [...new Set([...state.done, state.index])] };
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAcademyFreeCourse } from "@/lib/academy-free-courses.catalog";
import { clientSaveProgress, clientProductStudyProgress } from "@/lib/learning.functions";
import {
  freeCourseLessons,
  freeStudyPercent,
  recordFreeLesson,
  restoreFreeLearningState,
  type FreeLearningState,
} from "@/lib/academy-free-learning";
import { EDITORIAL_SOURCES } from "@/content/academy-free/types";
export const Route = createFileRoute("/_clientarea/cliente/cursos/academy/$slug")({
  component: Page,
});
function Page() {
  const { slug } = Route.useParams();
  return <FreeCourse key={slug} slug={slug} />;
}
function FreeCourse({ slug }: { slug: string }) {
  const course = getAcademyFreeCourse(slug);
  const save = useServerFn(clientSaveProgress),
    read = useServerFn(clientProductStudyProgress);
  const lessons = freeCourseLessons(slug);
  const [state, setState] = useState<FreeLearningState>({ index: 0, done: [] });
  const [reviewed, setReviewed] = useState(false),
    [saving, setSaving] = useState(false),
    [message, setMessage] = useState("");
  const remote = useQuery({
    queryKey: ["free-product-study", course?.productKey],
    enabled: Boolean(course),
    queryFn: () => read({ data: { productKey: course!.productKey } }),
  });
  useEffect(() => {
    try {
      setState(
        restoreFreeLearningState(
          JSON.parse(localStorage.getItem(`ldr-free-${slug}`) || "{}"),
          course?.modules.length || 0,
        ),
      );
    } catch {
      /* Preserve malformed legacy storage. */
    }
  }, [slug, course]);
  if (!course) return <section className="s8-card">Curso não encontrado.</section>;
  const lesson = lessons[state.index];
  const percent = freeStudyPercent(
    state.done,
    course.modules.length,
    remote.data?.progressPercent ?? 0,
  );
  const navigate = (index: number) => {
    setState((v) => ({ ...v, index }));
    setReviewed(false);
    setMessage("");
  };
  const complete = async () => {
    if (!lesson || !reviewed || !remote.isSuccess || saving) return;
    const next = recordFreeLesson(state, lessons, reviewed);
    setSaving(true);
    setMessage("");
    try {
      await save({
        data: {
          productKey: course.productKey,
          progressPercent: freeStudyPercent(next.done, course.modules.length, percent),
          currentLocation: `Módulo ${state.index + 1}`,
        },
      });
      setState(next);
      try {
        localStorage.setItem(`ldr-free-${slug}`, JSON.stringify(next));
      } catch {
        /* Saved remotely. */
      }
      await remote.refetch();
      setMessage("Estudo registado. A autoavaliação não equivale a certificação.");
    } catch {
      setMessage("Não foi possível guardar. O progresso anterior foi preservado; tente novamente.");
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="mx-auto max-w-6xl space-y-5 pb-12 text-[#102d50]">
      <Link
        to="/cliente/biblioteca"
        className="inline-block rounded-lg border px-4 py-2 text-sm font-bold"
      >
        ← Painel do aluno
      </Link>
      <header className="rounded-3xl bg-[#071426] p-6 text-white sm:p-9">
        <p className="text-xs font-bold uppercase tracking-widest text-[#d6ad63]">
          Curso gratuito · edição pedagógica em revisão
        </p>
        <h1 className="mt-3 font-serif text-3xl sm:text-4xl">{course.name.pt}</h1>
        <p className="mt-3 leading-7 text-slate-200">{course.description.pt}</p>
        <p className="mt-3 text-sm text-[#f4d99a]">
          {lessons.length}/{course.modules.length} módulos com texto específico nesta edição.
          Conteúdo em português.
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-200">
          {course.hours
            ? `A carga histórica anunciada de ${course.hours} horas está por validar. `
            : ""}
          Os tempos são estimativas de estudo com atividades, não horas certificadas. Esta edição
          não emite certificados.
        </p>
        <label className="mt-5 block text-sm" htmlFor="study-progress">
          Progresso de estudo preservado: {percent}%
        </label>
        <progress
          id="study-progress"
          max={100}
          value={percent}
          className="mt-2 h-3 w-full max-w-md accent-[#d6ad63]"
        />
      </header>
      <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
        <nav
          aria-label="Módulos do curso"
          className="self-start rounded-2xl border bg-white p-3 lg:sticky lg:top-4"
        >
          <ol className="space-y-1">
            {course.modules.map((title, index) => (
              <li key={title}>
                <button
                  aria-current={index === state.index ? "step" : undefined}
                  onClick={() => navigate(index)}
                  className={`w-full rounded-xl p-3 text-left text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8a651d] ${index === state.index ? "bg-[#071426] text-white" : "hover:bg-slate-100"}`}
                >
                  <b>{index + 1}.</b> {title}
                  <span className="mt-1 block text-xs">
                    {state.done.includes(index)
                      ? "Estudo registado anteriormente"
                      : lessons[index]
                        ? "Texto e atividade disponíveis"
                        : "Conteúdo em desenvolvimento"}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </nav>
        <article className="min-w-0 rounded-2xl border bg-white p-5 sm:p-8" lang="pt">
          <p className="text-xs font-bold uppercase text-[#775516]">
            Módulo {state.index + 1} de {course.modules.length}
          </p>
          <h2 className="mt-2 font-serif text-3xl">{course.modules[state.index]}</h2>
          {lesson ? (
            <>
              <p className="mt-3 text-sm text-slate-600">
                Estimativa: {lesson.minutes} minutos, incluindo aplicação e revisão.
              </p>
              <section className="mt-6 rounded-xl bg-slate-50 p-5">
                <h3 className="font-bold">Objetivos de aprendizagem</h3>
                <ul className="mt-3 list-disc space-y-2 pl-5">
                  {lesson.objectives.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </section>
              {lesson.sections.map((section) => (
                <section key={section.title} className="mt-8">
                  <h3 className="font-serif text-2xl">{section.title}</h3>
                  <div className="mt-4 space-y-5 text-base leading-8 text-slate-700">
                    {section.paragraphs.map((p) => (
                      <p key={p}>{p}</p>
                    ))}
                  </div>
                </section>
              ))}
              <section className="mt-8 rounded-xl border-l-4 border-[#b18435] bg-[#faf6ed] p-5">
                <h3 className="font-bold">Estudo de caso</h3>
                <p className="mt-3 leading-7">{lesson.caseStudy}</p>
              </section>
              <section className="mt-8">
                <h3 className="font-serif text-2xl">Aplicação prática</h3>
                <p className="mt-3 leading-7">{lesson.exercise}</p>
                <p className="mt-2 text-sm text-slate-600">
                  Faça a atividade num documento próprio; não introduza dados pessoais ou de
                  atendimentos nesta página.
                </p>
              </section>
              <section className="mt-8">
                <h3 className="font-serif text-2xl">Autoavaliação formativa</h3>
                <p className="mt-3 leading-7">{lesson.assessment.question}</p>
                <details className="mt-4 rounded-xl border p-4">
                  <summary className="cursor-pointer font-bold">
                    Consultar resposta comentada e critérios
                  </summary>
                  <p className="mt-3 leading-7">{lesson.assessment.answer}</p>
                  <ul className="mt-3 list-disc space-y-2 pl-5">
                    {lesson.assessment.criteria.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                </details>
              </section>
              {lesson.sourceIds.length > 0 && (
                <section className="mt-8 border-t pt-6">
                  <h3 className="font-serif text-2xl">Fontes consultadas</h3>
                  <ul className="mt-4 space-y-4">
                    {lesson.sourceIds.map((id) => {
                      const source = EDITORIAL_SOURCES[id];
                      return source ? (
                        <li key={id}>
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noreferrer"
                            className="break-words font-semibold underline"
                          >
                            {source.title}
                          </a>
                          <p className="mt-1 text-sm leading-6 text-slate-600">
                            {source.scope} Consulta: {source.consulted}.
                          </p>
                        </li>
                      ) : null;
                    })}
                  </ul>
                </section>
              )}
              <div className="mt-8 border-t pt-5">
                <label className="flex items-start gap-3 text-sm leading-6">
                  <input
                    type="checkbox"
                    checked={reviewed}
                    onChange={(e) => setReviewed(e.target.checked)}
                    className="mt-1 h-5 w-5 shrink-0"
                  />
                  Realizei a atividade e comparei a minha resposta com os critérios.
                </label>
                <button
                  disabled={!reviewed || !remote.isSuccess || saving}
                  onClick={complete}
                  className="mt-4 rounded-xl bg-[#071426] px-5 py-3 font-bold text-white disabled:opacity-50"
                >
                  {saving ? "A guardar…" : "Registar estudo deste módulo"}
                </button>
              </div>
            </>
          ) : (
            <div className="mt-6 rounded-xl border border-amber-300 bg-amber-50 p-5 leading-7">
              <h3 className="font-bold">Conteúdo em desenvolvimento</h3>
              <p className="mt-2">
                O título curricular foi preservado. O texto anterior era um preenchimento repetido e
                não constitui uma aula. Este módulo aguarda desenvolvimento e revisão específicos;
                não pode ser registado como nova conclusão nesta edição.
              </p>
            </div>
          )}
          {remote.isError && (
            <p role="alert" className="mt-4 text-sm text-red-800">
              Não foi possível consultar o progresso guardado.{" "}
              <button className="underline" onClick={() => remote.refetch()}>
                Tentar novamente
              </button>
            </p>
          )}
          <p aria-live="polite" className="mt-4 text-sm">
            {message}
          </p>
          <footer className="mt-8 flex flex-wrap justify-between gap-3 border-t pt-5">
            <button
              disabled={state.index === 0 || saving}
              onClick={() => navigate(state.index - 1)}
              className="rounded-xl border px-4 py-3 disabled:opacity-40"
            >
              ← Anterior
            </button>
            <button
              disabled={state.index >= course.modules.length - 1 || saving}
              onClick={() => navigate(state.index + 1)}
              className="rounded-xl border px-4 py-3 disabled:opacity-40"
            >
              Próximo →
            </button>
          </footer>
        </article>
      </div>
    </div>
  );
}

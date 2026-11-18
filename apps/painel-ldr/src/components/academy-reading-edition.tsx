import { Fragment, useState } from "react";
import type { AcademyReadingEdition } from "@/lib/academy-reading-editions";
import { isApprovedReadingEdition, isReleasedAcademyPracticeGuide } from "@/lib/academy-reading-editions";

// Intentionally small Markdown subset. React escapes raw HTML and URLs stay text.
function Inline({ text }: { text: string }) {
  return (
    <>
      {text
        .split(/(\*\*[^*]+\*\*)/g)
        .map((part, index) =>
          part.startsWith("**") && part.endsWith("**") ? (
            <strong key={index}>{part.slice(2, -2)}</strong>
          ) : (
            <Fragment key={index}>{part}</Fragment>
          ),
        )}
    </>
  );
}
export function AcademyMarkdown({ body }: { body: string }) {
  return (
    <div className="space-y-5 leading-8 text-slate-700">
      {body
        .replace(/^(#{1,3} [^\n]+)\n(?!\n|#{1,3} )/gm, "$1\n\n")
        .split(/\r?\n\s*\r?\n/)
        .map((block, index) => {
          const lines = block.split(/\r?\n/);
          if (lines.length > 1 && /^\|/.test(lines[0]!) && /^\|[\s:|-]+\|$/.test(lines[1]!)) {
            const cells = (line: string) =>
              line
                .trim()
                .replace(/^\||\|$/g, "")
                .split("|")
                .map((cell) => cell.trim());
            return (
              <div
                key={index}
                className="overflow-x-auto"
                role="region"
                aria-label="Tabela da unidade"
                tabIndex={0}
              >
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr>
                      {cells(lines[0]!).map((cell, i) => (
                        <th scope="col" className="border p-3" key={i}>
                          <Inline text={cell} />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {lines.slice(2).map((line, i) => (
                      <tr key={i}>
                        {cells(line).map((cell, j) => (
                          <td className="border p-3 align-top" key={j}>
                            <Inline text={cell} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }
          if (lines.every((line) => /^#{1,3}\s/.test(line)))
            return (
              <Fragment key={index}>
                {lines.map((line, i) => (
                  <h3 key={i} className="mt-6 font-serif text-2xl text-slate-900">
                    <Inline text={line.replace(/^#{1,3}\s+/, "")} />
                  </h3>
                ))}
              </Fragment>
            );
          return (
            <p key={index} className="whitespace-pre-wrap break-words">
              <Inline text={block} />
            </p>
          );
        })}
    </div>
  );
}

export function AcademyReadingEditionView({
  edition,
  initialCompleted,
  onComplete,
}: {
  edition: AcademyReadingEdition;
  initialCompleted?: string[] | null;
  onComplete?: (unitId: string) => Promise<string[]>;
}) {
  const [index, setIndex] = useState(0);
  const [completed, setCompleted] = useState(initialCompleted ?? []);
  const [pendingUnit, setPendingUnit] = useState<string | null>(null);
  const [error, setError] = useState(initialCompleted === null
    ? "Não foi possível consultar o progresso. Recarregue a página ou tente concluir a unidade."
    : null);

  // Defense in depth: the component must not display pending candidates even in a direct mount.
  if (!isApprovedReadingEdition(edition)) return null;
  const unit = edition.modules[Math.min(index, edition.modules.length - 1)]!;
  const unitCompleted = completed.includes(unit.id);
  const completeUnit = async () => {
    if (!onComplete || pendingUnit || unitCompleted) return;
    setPendingUnit(unit.id);
    setError(null);
    try {
      setCompleted(await onComplete(unit.id));
    } catch {
      setError("Não foi possível confirmar a conclusão. Tente novamente.");
    } finally {
      setPendingUnit(null);
    }
  };
  const practiceGuide = isReleasedAcademyPracticeGuide(edition.practiceGuide, edition) ? edition.practiceGuide : null;
  const practiceUnit = practiceGuide?.modules.find(module => module.id === unit.id);
  return (
    <section
      lang={edition.locale}
      className="rounded-2xl border bg-white p-5 sm:p-8"
      aria-label="Edição de leitura"
    >
      <h2 className="font-serif text-2xl">Edição de leitura</h2>
      <p className="mt-3 text-sm text-slate-600">
        Estas unidades pertencem a uma edição separada. A navegação não altera as conclusões nem o
        progresso do currículo histórico e não emite certificados.
      </p>
      {edition.releaseMode === "reading-only" && (
        <p className="mt-3 text-sm text-slate-600">
          Leitura estimada: {edition.estimatedReadingMinutes?.min}–
          {edition.estimatedReadingMinutes?.max} minutos. Estimativa de leitura a 200–250
          palavras/minuto; a execução dos exercícios varia conforme o ritmo do aluno. Sem carga
          horária certificada.
        </p>
      )}
      {edition.releaseDisclosure && (
        <p className="mt-3 text-sm text-slate-600">{edition.releaseDisclosure}</p>
      )}
      {onComplete && (
        <p role="status" className="mt-3 text-sm font-semibold text-slate-700">
          {completed.length} de {edition.modules.length} unidades concluídas
        </p>
      )}
      <nav aria-label="Unidades da edição de leitura" className="my-5">
        <ol className="space-y-2">
          {edition.modules.map((module, i) => (
            <li key={module.id}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-current={unit.id === module.id ? "step" : undefined}
                className="text-left font-semibold underline focus-visible:outline-2"
              >
                {i + 1}. {module.title}
                {completed.includes(module.id) && " · Concluída"}
              </button>
            </li>
          ))}
        </ol>
      </nav>
      <article aria-label={unit.title}>
        <h2 className="mb-5 font-serif text-3xl">{unit.title}</h2>
        <AcademyMarkdown body={unit.body} />
      </article>
      {practiceGuide && practiceUnit && (
        <section aria-label="Percurso prático de 60 horas estimadas" className="mt-10 space-y-5 border-t pt-8">
          <h2 className="font-serif text-2xl">Percurso prático — 60 horas estimadas</h2>
          <p className="text-sm text-slate-600">
            12 h de estudo ativo · 18 h de exercícios · 12 h de casos · 14 h de projeto · 4 h de avaliação e revisão.
            Estimativa para as seis unidades; não é duração validada nem carga horária certificada.
          </p>
          <p className="text-sm text-slate-600">{practiceGuide.reviewDisclosure}</p>
          <AcademyMarkdown body={practiceUnit.body} />
        </section>
      )}
      {onComplete && (
        <div className="mt-8 border-t pt-5">
          <button
            type="button"
            disabled={unitCompleted || pendingUnit !== null}
            onClick={completeUnit}
            className="min-h-11 rounded-xl bg-[#071426] px-4 py-2 font-bold text-white disabled:opacity-60"
          >
            {unitCompleted ? "Unidade concluída" : pendingUnit === unit.id ? "A guardar…" : "Marcar como concluída"}
          </button>
          {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
        </div>
      )}
    </section>
  );
}

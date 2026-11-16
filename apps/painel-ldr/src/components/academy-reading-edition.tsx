import { Fragment, useState } from "react";
import type { AcademyReadingEdition } from "@/lib/academy-reading-editions";
import { isApprovedReadingEdition } from "@/lib/academy-reading-editions";

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

export function AcademyReadingEditionView({ edition }: { edition: AcademyReadingEdition }) {
  const [index, setIndex] = useState(0);
  // Defense in depth: the component must not display pending candidates even in a direct mount.
  if (!isApprovedReadingEdition(edition)) return null;
  const unit = edition.modules[Math.min(index, edition.modules.length - 1)]!;
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
              </button>
            </li>
          ))}
        </ol>
      </nav>
      <article aria-label={unit.title}>
        <h2 className="mb-5 font-serif text-3xl">{unit.title}</h2>
        <AcademyMarkdown body={unit.body} />
      </article>
    </section>
  );
}

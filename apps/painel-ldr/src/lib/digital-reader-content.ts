export type ReaderPage = { titulo?: string; texto: string };
export type ReaderChapter = [string, string, string[]];
export type NormalizedReaderContent =
  | { kind: "ebook"; pages: ReaderPage[] }
  | {
      kind: "book";
      data: { title?: string; subtitle?: string; notice?: string; chapters: ReaderChapter[] };
    };
const record = (x: unknown): x is Record<string, unknown> =>
  Boolean(x) && typeof x === "object" && !Array.isArray(x);
const text = (x: string) => x.replaceAll("\\n", "\n");
// Support both historical chapter payloads and page payloads without rewriting stored works.
export function normalizeDigitalReaderContent(value: unknown): NormalizedReaderContent {
  if (!record(value)) throw new Error("Formato de leitura inválido.");
  if (value["kind"] === "ebook" && Array.isArray(value["pages"])) {
    const pages = value["pages"].map((page): ReaderPage => {
      if (!record(page) || typeof page["texto"] !== "string" || !page["texto"].trim())
        throw new Error("Página sem texto.");
      return {
        ...(typeof page["titulo"] === "string" ? { titulo: page["titulo"] } : {}),
        texto: text(page["texto"]),
      };
    });
    if (!pages.length) throw new Error("Obra sem páginas.");
    return { kind: "ebook", pages };
  }
  const data = record(value["data"]) ? value["data"] : value;
  if (!Array.isArray(data["chapters"]) || !data["chapters"].length)
    throw new Error("Obra sem capítulos.");
  const chapters: ReaderChapter[] = data["chapters"].map((chapter) => {
    if (
      !Array.isArray(chapter) ||
      typeof chapter[0] !== "string" ||
      typeof chapter[1] !== "string" ||
      !Array.isArray(chapter[2]) ||
      !chapter[2].length ||
      chapter[2].some((p: unknown) => typeof p !== "string" || !p.trim())
    )
      throw new Error("Capítulo incompleto.");
    return [chapter[0], chapter[1], chapter[2].map((p: string) => text(p))];
  });
  return {
    kind: "book",
    data: {
      ...(typeof data["title"] === "string" ? { title: data["title"] } : {}),
      ...(typeof data["subtitle"] === "string" ? { subtitle: data["subtitle"] } : {}),
      ...(typeof data["notice"] === "string" ? { notice: data["notice"] } : {}),
      chapters,
    },
  };
}
export function readerProgressFloor(position: number, total: number, savedPercent: number) {
  const current =
    total > 0 && Number.isFinite(position)
      ? Math.max(0, Math.min(100, Math.round((position / total) * 100)))
      : 0;
  return Math.max(
    current,
    Number.isFinite(savedPercent) ? Math.max(0, Math.min(100, savedPercent)) : 0,
  );
}

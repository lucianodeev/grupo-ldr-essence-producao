export type LibraryKind = "course" | "formation" | "ebook";
export type LibraryAccess = "granted" | "free" | "offer" | "verify";
export type DashboardItem = {
  key: string;
  title: string;
  description: string;
  href: string;
  kind: LibraryKind;
  access: LibraryAccess;
  editorial: string;
};
export type DashboardProgress = {
  product_key: string;
  progress_percent: number;
  current_location?: string | null;
  updated_at?: string;
};
export function librarySearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase()
    .trim();
}
export function libraryMatches(item: DashboardItem, query: string) {
  return librarySearchText(`${item.title} ${item.description}`).includes(librarySearchText(query));
}
export function libraryOwned(item: DashboardItem, progress: readonly DashboardProgress[]) {
  return (
    item.access === "granted" ||
    (item.access === "free" &&
      progress.some((p) => p.product_key === item.key && p.progress_percent > 0))
  );
}
export function libraryContinueItems(
  items: readonly DashboardItem[],
  progress: readonly DashboardProgress[],
) {
  return progress
    .filter((p) => p.progress_percent > 0 && p.progress_percent < 100)
    .map((p) => ({ ...p, item: items.find((i) => i.key === p.product_key) }))
    .filter((p): p is DashboardProgress & { item: DashboardItem } => Boolean(p.item))
    .sort((a, b) => (b.updated_at ?? "").localeCompare(a.updated_at ?? ""));
}

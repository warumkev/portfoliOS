export type CommandGroup = "Apps" | "Projects" | "Actions";

export interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  keywords?: string[];
  group: CommandGroup;
}

const GROUP_ORDER: CommandGroup[] = ["Apps", "Projects", "Actions"];

function score(item: CommandItem, q: string): number {
  const title = item.title.toLowerCase();
  if (title === q) return 120;
  if (title.startsWith(q)) return 100;
  if (title.split(/\s+/).some((w) => w.startsWith(q))) return 80;
  if (title.includes(q)) return 60;
  const keywords = (item.keywords ?? []).map((k) => k.toLowerCase());
  if (keywords.some((k) => k.startsWith(q))) return 50;
  if (keywords.some((k) => k.includes(q))) return 30;
  if (item.subtitle?.toLowerCase().includes(q)) return 20;
  return 0;
}

/** Ranks items by relevance to `query`; an empty query keeps the natural group order. */
export function searchCommands(items: CommandItem[], query: string): CommandItem[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return [...items].sort(
      (a, b) => GROUP_ORDER.indexOf(a.group) - GROUP_ORDER.indexOf(b.group)
    );
  }
  return items
    .map((item, index) => ({ item, index, s: score(item, q) }))
    .filter((r) => r.s > 0)
    .sort((a, b) => b.s - a.s || a.index - b.index)
    .map((r) => r.item);
}

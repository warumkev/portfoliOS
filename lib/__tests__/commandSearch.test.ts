import { describe, expect, it } from "vitest";
import { searchCommands, type CommandItem } from "../commandSearch";

const items: CommandItem[] = [
  { id: "theme", title: "Toggle theme", group: "Actions", keywords: ["dark", "light"] },
  { id: "about", title: "README", subtitle: "About me", group: "Apps", keywords: ["about"] },
  { id: "projects", title: "Projects", group: "Apps" },
  { id: "doable", title: "Doable", subtitle: "iOS to-do app", group: "Projects" },
];

describe("searchCommands", () => {
  it("returns everything grouped when the query is empty", () => {
    expect(searchCommands(items, "").map((i) => i.id)).toEqual(["about", "projects", "doable", "theme"]);
  });

  it("ranks title matches above keyword and subtitle matches", () => {
    // prefix "Abacus" > substring "doAble" > keyword "about"
    const withTitle: CommandItem[] = [
      ...items,
      { id: "abacus", title: "Abacus", group: "Projects" },
    ];
    expect(searchCommands(withTitle, "ab").map((i) => i.id)).toEqual(["abacus", "doable", "about"]);
  });

  it("finds items by keyword and subtitle", () => {
    expect(searchCommands(items, "dark").map((i) => i.id)).toEqual(["theme"]);
    expect(searchCommands(items, "to-do").map((i) => i.id)).toEqual(["doable"]);
  });

  it("drops non-matches", () => {
    expect(searchCommands(items, "zzz")).toEqual([]);
  });
});

import { describe, expect, it } from "vitest";
import { completeInput, runCommand, type TerminalContext } from "../terminal";

const ctx: TerminalContext = {
  projects: [
    { slug: "doable-app", title: "Doable", description: "", githubUrl: "https://github.com/x/doable" },
    { slug: "katalyst-website", title: "Katalyst", description: "", liveUrl: "https://k.example", githubUrl: "https://github.com/x/k" },
    { slug: "secret", title: "Secret", description: "" },
  ],
  apps: [
    { id: "about", title: "README" },
    { id: "contact", title: "Mail" },
  ],
  theme: "system",
  now: new Date("2026-10-31T12:00:00Z"),
};

describe("runCommand", () => {
  it("ignores empty input", () => {
    expect(runCommand("   ", ctx)).toEqual({ lines: [], effects: [] });
  });

  it("reports unknown commands", () => {
    const r = runCommand("frobnicate", ctx);
    expect(r.lines[0].kind).toBe("error");
    expect(r.lines[0].text).toContain("frobnicate");
  });

  it("opens apps by id or title, case-insensitively", () => {
    expect(runCommand("open About", ctx).effects).toEqual([{ type: "open-app", id: "about" }]);
    expect(runCommand("open mail", ctx).effects).toEqual([{ type: "open-app", id: "contact" }]);
  });

  it("opens projects by number or slug, preferring the live URL", () => {
    expect(runCommand("open 2", ctx).effects).toEqual([{ type: "open-url", url: "https://k.example" }]);
    expect(runCommand("open doable-app", ctx).effects).toEqual([{ type: "open-url", url: "https://github.com/x/doable" }]);
  });

  it("explains projects without links", () => {
    const r = runCommand("open secret", ctx);
    expect(r.effects).toEqual([]);
    expect(r.lines[0].kind).toBe("error");
  });

  it("sets or shows the theme", () => {
    expect(runCommand("theme", ctx).lines[0].text).toBe("theme: system");
    expect(runCommand("theme dark", ctx).effects).toEqual([{ type: "set-theme", theme: "dark" }]);
    expect(runCommand("theme purple", ctx).lines[0].kind).toBe("error");
  });

  it("emits clear and exit effects", () => {
    expect(runCommand("clear", ctx).effects).toEqual([{ type: "clear" }]);
    expect(runCommand("exit", ctx).effects).toEqual([{ type: "exit" }]);
  });

  it("lists every documented command in help", () => {
    const text = runCommand("help", ctx).lines.map((l) => l.text).join("\n");
    for (const c of ["about", "projects", "open", "theme", "neofetch", "clear", "exit"]) {
      expect(text).toContain(c);
    }
  });
});

describe("completeInput", () => {
  it("completes command names", () => {
    expect(completeInput("pr", ctx)).toEqual(["projects"]);
  });
  it("completes open targets from apps and projects", () => {
    expect(completeInput("open do", ctx)).toEqual(["open doable-app"]);
    expect(completeInput("open a", ctx)).toEqual(["open about"]);
  });
  it("completes theme values", () => {
    expect(completeInput("theme d", ctx)).toEqual(["theme dark"]);
  });
});
